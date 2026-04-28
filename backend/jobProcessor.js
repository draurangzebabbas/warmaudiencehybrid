const scraper = require("./scraper");
const convexApi = require("./convexApi");
const supabaseApi = require("./supabaseApi");
const KeyManager = require("./keyManager");

/**
 * Process a research job
 */
async function processJob(jobData) {
    const { userId, type, input } = jobData;
    console.log(`🚀 Executing research module [${type}] for user: ${userId}`);

    const keyManager = new KeyManager(userId, "apify", convexApi);
    const keysCount = await keyManager.initialize();

    if (keysCount === 0) {
        console.warn(`⚠️  No Apify API keys found for user ${userId}. Job skipped.`);
        return;
    }

    try {
        switch (type) {
            case "manual_scrape":
                await handleManualScrape(userId, input, keyManager, input.tags);
                break;

            case "engagement_scrape":
                await handleEngagementScrape(userId, input.postUrls, input.engagementTypes, keyManager, input.tags);
                break;

            case "scheduled_tracking":
                await handleScheduledTracking(userId, input, keyManager);
                break;

            case "google_maps":
                await handleGoogleMapsScrape(userId, input, keyManager, input.tags);
                break;

            default:
                console.warn(`Unknown job type: ${type}`);
        }
    } catch (error) {
        console.error(`❌ Job processor error [${type}]:`, error.message || error);
    } finally {
        await keyManager.sync();
        console.log(`✅ Job [${type}] for user ${userId} completed.`);
    }
}

async function handleGoogleMapsScrape(userId, input, keyManager, tags = ["GoogleMaps"]) {
    console.log(`📍 Starting Google Maps extraction for: ${input.searchStringsArray} in ${input.locationQuery}`);
    try {
        const results = await executeWithRetry(
            keyManager,
            "Google Maps Scrape",
            (key) => scraper.scrapeGoogleMaps(input, key)
        );

        if (results && results.length > 0) {
            console.log(`✨ Found ${results.length} Google Maps leads. Persistence started...`);
            const saved = await supabaseApi.upsertGoogleMapsLeadsBulk(results);
            for (const s of saved) {
                try {
                    await convexApi.linkSupabaseProfile(userId, s.id, "google_maps", tags);
                } catch (err) {
                    console.error(`   Link Convex failed for Google Map lead ${s.id}:`, err.message);
                }
            }
            console.log(`✅ Successfully saved and linked ${saved.length} Google Maps leads`);
        } else {
            console.warn("⚠️ No results returned from Google Maps scraper.");
        }
    } catch (err) {
        console.error("❌ Google Maps extraction failed:", err.message);
    }
}

async function executeWithRetry(keyManager, taskDescription, taskFn, maxRetries = 3) {
    let attempts = 0;
    let lastError = null;

    while (attempts < maxRetries) {
        let keyObj;
        try {
            keyObj = await keyManager.getNextKey();
        } catch (e) {
            console.error(`❌ ${taskDescription}: No keys available.`);
            throw new Error(`No keys available for ${taskDescription}`);
        }

        try {
            console.log(`📡 [Attempt ${attempts + 1}/${maxRetries}] ${taskDescription} | Key: ...${keyObj.key.slice(-6)}`);
            const result = await taskFn(keyObj.key);
            keyManager.markSuccess(keyObj.key);
            return result;
        } catch (error) {
            lastError = error;
            const status = error.status || error.response?.status;
            console.error(`   ❌ ${taskDescription} failed: ${error.message || error}`);

            if ([401, 402, 403, 429].includes(status)) {
                console.log(`      → Rotating key due to status ${status}`);
                keyManager.markFailure(keyObj.key, status);
                await keyManager.refreshIfLow();
            } else {
                console.log(`      → Persistent error (status ${status}). Will retry same task with rotated key.`);
            }

            attempts++;
            await new Promise(r => setTimeout(r, 1000));
        }
    }
    throw lastError;
}

async function handleManualScrape(userId, input, keyManager, tags = ["Manual"]) {
    const { profileUrls = [], companyUrls = [] } = input;

    if (profileUrls.length > 0) {
        console.log(`👤 Processing ${profileUrls.length} personal profile URLs`);
        await processProfiles(userId, profileUrls, "personal", keyManager, tags);
    }

    if (companyUrls.length > 0) {
        console.log(`🏢 Processing ${companyUrls.length} company URLs`);
        await processProfiles(userId, companyUrls, "company", keyManager, tags);
    }
}

async function handleScheduledTracking(userId, input, keyManager) {
    const { trackingUrl, keywords, engagementTypes = ["commenters", "reactors"], schedule = "daily", tags = [] } = input;
    const timeFilterMap = { daily: "24h", weekly: "week", monthly: "month" };
    const timeFilter = timeFilterMap[schedule] || "24h";
    const dateFilter = schedule === "daily" ? "past-24h" : schedule === "weekly" ? "past-week" : "past-month";

    if (trackingUrl) {
        console.log(`🎯 Tracking profile: ${trackingUrl} (${schedule})`);
        try {
            const postUrls = await executeWithRetry(
                keyManager,
                "Fetch Profile Posts",
                (key) => scraper.scrapePersonalPosts([trackingUrl], key, timeFilter)
            ).then(posts => posts.map((p) => p.linkedinUrl || p.url).filter(Boolean).slice(0, 20));

            console.log(`📰 Found ${postUrls.length} posts from tracked profile`);
            if (postUrls.length > 0) {
                await handleEngagementScrape(userId, postUrls, engagementTypes, keyManager, tags);
            }
        } catch (err) {
            console.error("Failed to fetch profile posts after retries.");
        }
    } else if (keywords && keywords.length > 0) {
        console.log(`🔍 Tracking keyword(s): ${keywords.join(", ")} (${schedule})`);
        try {
            const postUrls = await executeWithRetry(
                keyManager,
                "Keyword Search",
                (key) => scraper.searchKeywords(keywords, key, 50, dateFilter)
            ).then(posts => posts.map((p) => p.post_url).filter(Boolean).slice(0, 20));

            console.log(`📰 Found ${postUrls.length} keyword posts`);
            if (postUrls.length > 0) {
                await handleEngagementScrape(userId, postUrls, engagementTypes, keyManager, tags);
            }
        } catch (err) {
            console.error("Failed to fetch keyword posts after retries.");
        }
    }
}

async function handleEngagementScrape(userId, postUrls, engagementTypes, keyManager, tags = ["Engagement"]) {
    const allProfileUrls = new Set();
    try {
        if (engagementTypes.includes("commenters")) {
            console.log(`💬 Extracting commenters...`);
            const comments = await executeWithRetry(
                keyManager,
                "Scrape Commenters",
                (key) => scraper.scrapePostEngagement(postUrls, key)
            );
            comments.forEach((c) => {
                const url = c.actor?.linkedinUrl || c.actor?.profileUrl || c.linkedinUrl;
                if (url) allProfileUrls.add(url);
            });
        }
        if (engagementTypes.includes("reactors")) {
            console.log(`👍 Extracting reactors...`);
            const reactions = await executeWithRetry(
                keyManager,
                "Scrape Reactors",
                (key) => scraper.scrapePostReactors(postUrls, key)
            );
            reactions.forEach((r) => {
                const url = r.actor?.linkedinUrl || r.actor?.profileUrl;
                if (url) allProfileUrls.add(url);
            });
        }
    } catch (err) {
        console.error("Engagement extraction failed:", err.message);
    }

    if (allProfileUrls.size > 0) {
        const urls = Array.from(allProfileUrls);
        console.log(`✨ Enriching ${urls.length} unique profiles...`);
        await processProfiles(userId, urls, "personal", keyManager, tags);
    }
}

async function processProfiles(userId, urls, type, keyManager, tags = []) {
    const BATCH_SIZE = 20;
    const THRESHOLD = 5;
    const normalizedUrls = urls.map(u => scraper.normalizeUrl(u)).filter(Boolean);
    const toScrape = [];

    // 1. Initial Cache Check (Supabase instead of Convex!)
    for (const url of normalizedUrls) {
        try {
            const cached = await supabaseApi.getCachedProfile(url, type);
            if (cached && cached.isFresh) {
                const sid = cached.profile?.id || cached.company?.id;
                console.log(`📦 Cache Hit [${type}] (Supabase): ${url}`);
                await convexApi.linkSupabaseProfile(userId, sid, type, tags);
            } else {
                toScrape.push(url);
            }
        } catch (e) {
            toScrape.push(url);
        }
    }

    if (toScrape.length === 0) return;

    if (keyManager.getActiveCount() < THRESHOLD) {
        await keyManager.ensureMaxAvailability();
    }

    const batches = [];
    for (let i = 0; i < toScrape.length; i += BATCH_SIZE) {
        batches.push(toScrape.slice(i, i + BATCH_SIZE));
    }

    console.log(`🚀 Starting parallel research of ${toScrape.length} profiles...`);

    await Promise.all(batches.map((batch, index) => {
        return (async () => {
            await new Promise(r => setTimeout(r, index * 200));
            await keyManager.refreshIfLow();
            console.log(`🕸️  Batch ${index + 1}/${batches.length} started...`);
            return scrapeBatch(userId, batch, type, keyManager, tags);
        })();
    }));
}

async function scrapeBatch(userId, urls, type, keyManager, tags) {
    try {
        const results = await executeWithRetry(
            keyManager,
            `Scrape Batch (${type})`,
            (key) => {
                if (type === "personal") return scraper.scrapePersonalProfiles(urls, key);
                return scraper.scrapeCompanyProfiles(urls, key);
            }
        );

        if (results && results.length > 0) {
            try {
                // Map fields for Supabase
                const formatted = results.map(r => {
                    const b = r.basic_info || r;
                    const linkedinUrl = b.profile_url || b.linkedinUrl || b.linkedin_url || r.linkedinUrl || r.linkedin_url || (type === "personal" ? null : (b.url || r.url));
                    if (!linkedinUrl) return null;

                    if (type === "personal") {
                        return {
                            linkedinUrl,
                            publicIdentifier: b.public_identifier || b.publicIdentifier || "",
                            firstName: b.first_name || b.firstName || "",
                            lastName: b.last_name || b.lastName || "",
                            fullName: b.fullname || b.fullName || "",
                            headline: b.headline || "",
                            email: b.email,
                            connections: b.connection_count ?? b.connections,
                            followers: b.follower_count ?? b.followers,
                            companyName: b.current_company || b.companyName,
                            jobTitle: b.headline,
                            location: b.location,
                            city: b.location?.city,
                            country: b.location?.country,
                            postalCode: b.location?.postalCode,
                            isPremium: b.is_premium ?? b.isPremium,
                            isInfluencer: b.is_influencer ?? b.isInfluencer,
                            openToWork: b.open_to_work ?? b.openToWork,
                            isVerified: b.is_verified ?? b.isVerified,
                            profilePic: b.profile_picture_url || b.profilePic,
                            about: b.about
                        };
                    } else {
                        return {
                            url: linkedinUrl,
                            companyName: b.name || b.companyName || "Unknown",
                            linkedinUrl: linkedinUrl,
                            websiteUrl: b.website || b.websiteUrl,
                            logoUrl: r.media?.logo_url || b.logoUrl,
                            description: b.description,
                            employeeCount: r.stats?.employee_count || b.employeeCount,
                            employeeCountRange: r.stats?.employee_count_range || b.employeeCountRange,
                            followerCount: r.stats?.follower_count || b.followerCount,
                            city: r.locations?.headquarters?.city || b.city,
                            country: r.locations?.headquarters?.country || b.country,
                            postalCode: r.locations?.headquarters?.postal_code || b.postalCode,
                            isVerified: b.is_verified ?? b.isVerified
                        };
                    }
                }).filter(Boolean);

                if (type === "personal") {
                    const saved = await supabaseApi.upsertPersonalProfilesBulk(formatted);
                    for (const s of saved) {
                        try {
                            await convexApi.linkSupabaseProfile(userId, s.id, "personal", tags);
                        } catch (err) {
                            console.error(`   Link Convex failed for ${s.id}:`, err.message);
                        }
                    }
                } else {
                    const saved = await supabaseApi.upsertCompanyProfilesBulk(formatted);
                    for (const s of saved) {
                        try {
                            await convexApi.linkSupabaseProfile(userId, s.id, "company", tags);
                        } catch (err) {
                            console.error(`   Link Convex failed for ${s.id}:`, err.message);
                        }
                    }
                }
                console.log(`   ✅ Bulk saved ${formatted.length} profiles to Supabase and linked in Convex`);
            } catch (saveErr) {
                console.error(`   Bulk save failed:`, saveErr.message);
            }
        }
    } catch (error) {
        console.error(`   🔴 Batch failed:`, error.message);
    }
}

module.exports = { processJob };
