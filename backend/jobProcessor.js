const scraper = require("./scraper");
const supabaseApi = require("./supabaseApi");
const KeyManager = require("./keyManager");

/**
 * Process a research job
 */
async function processJob(jobData) {
    const { userId, type, input } = jobData;
    console.log(`🚀 Executing research module [${type}] for user: ${userId}`);

    const keyManager = new KeyManager(userId, "apify");

    const keysCount = await keyManager.initialize();

    if (keysCount === 0) {
        console.warn(`⚠️  No Apify API keys found for user ${userId}. Job skipped.`);
        return;
    }

    let jobId;
    try {
        let totalToFind = input.maxCount || 10;
        if (type === "google_maps") {
            const searchCount = input.searchStringsArray?.length || 1;
            const perSearch = input.maxCrawledPlacesPerSearch || 10;
            totalToFind = searchCount * perSearch;
        } else if (input.profileUrls?.length) {
            totalToFind = input.profileUrls.length;
        } else if (input.postUrls?.length) {
            totalToFind = input.postUrls.length;
        } else if (input.domains?.length) {
            totalToFind = input.domains.length;
        }
        
        jobId = await supabaseApi.createScrapeJob(userId, type, input, totalToFind);

        switch (type) {
            case "manual_scrape":
                await handleManualScrape(userId, input, keyManager, input.tags || ["Manual"], jobId);
                break;

            case "engagement_scrape":
                await handleEngagementScrape(userId, input.postUrls, input.engagementTypes, keyManager, input.tags || ["Engagement"], jobId);
                break;

            case "scheduled_tracking":
                await handleScheduledTracking(userId, input, keyManager, jobId);
                break;

            case "google_maps":
                await handleGoogleMapsScrape(userId, input, keyManager, input.tags || ["GoogleMaps"], jobId);
                break;
            
            case "website_contact":
                await handleWebsiteContactsScrape(userId, input, keyManager, input.tags || ["WebsiteContact"], jobId);
                break;

            default:
                console.warn(`Unknown job type: ${type}`);
        }
        
        await supabaseApi.completeJob(jobId);
    } catch (error) {
        console.error(`❌ Job processor error [${type}]:`, error.message || error);
        if (jobId) await supabaseApi.failJob(jobId, error.message);
    } finally {
        await keyManager.sync();
        console.log(`✅ Job [${type}] for user ${userId} completed.`);
    }
}

async function handleGoogleMapsScrape(userId, input, keyManager, tags = ["GoogleMaps"], jobId) {
    console.log(`📍 Starting Google Maps extraction for: ${input.searchStringsArray} in ${input.locationQuery}`);
        try {
            if (jobId) await supabaseApi.updateJobProgress(jobId, 20);

            const results = await executeWithRetry(
                keyManager,
                "Google Maps Scrape",
                (key) => scraper.scrapeGoogleMaps(input, key)
            );

            if (jobId) await supabaseApi.updateJobProgress(jobId, 80);

            if (results && results.length > 0) {
                console.log(`✨ Found ${results.length} Google Maps leads. Persistence started...`);
                
                // Map results...
                const formatted = results.map(l => {
                    // (Field mapping logic remains same)
                    const extractUrl = (val) => {
                        if (!val) return null;
                        if (typeof val === 'string') return val;
                        if (typeof val === 'object' && val.url) return val.url;
                        if (typeof val === 'object' && val.image) return val.image;
                        return null;
                    };

                    let potentialImage = extractUrl(l.imageUrl || l.image_url || l.img_url || l.imgUrl || 
                                         l.photo || l.photoUrl || l.thumbnail || l.thumbnailUrl || 
                                         l.mainImage || l.featuredImage);
                    
                    if (!potentialImage && l.photos && l.photos.length > 0) {
                        potentialImage = extractUrl(l.photos[0]);
                    }
                    if (!potentialImage && l.images && l.images.length > 0) {
                        potentialImage = extractUrl(l.images[0]);
                    }

                    const safeNumber = (val) => {
                        if (Array.isArray(val)) return 0;
                        if (typeof val === 'number') return val;
                        const parsed = parseFloat(val);
                        return isNaN(parsed) ? 0 : parsed;
                    };

                    return {
                        url: l.url,
                        title: l.title || l.companyName || l.name || "Unknown",
                        totalScore: safeNumber(l.totalScore || l.reviewsScore || l.stars || l.rating || 0),
                        reviewsCount: safeNumber(l.reviewsCount || l.reviews || l.reviewCount || 0),
                        address: l.address || l.fullAddress || l.location?.address || "",
                        phone: l.phone || l.phoneNumber || "",
                        emails: l.emails || [],
                        website: l.website || l.websiteUrl || "",
                        city: l.city || l.location?.city || "",
                        imageUrl: potentialImage,
                        socials: {
                            facebook: (l.facebooks && l.facebooks.length > 0) ? l.facebooks[0] : (l.facebook || l.facebookUrl || null),
                            instagram: (l.instagrams && l.instagrams.length > 0) ? l.instagrams[0] : (l.instagram || l.instagramUrl || null),
                            twitter: (l.twitters && l.twitters.length > 0) ? l.twitters[0] : (l.twitter || l.twitterUrl || l.xUrl || null),
                            linkedin: (l.linkedIns && l.linkedIns.length > 0) ? l.linkedIns[0] : (l.linkedin || l.linkedinUrl || null),
                            youtube: (l.youtubes && l.youtubes.length > 0) ? l.youtubes[0] : (l.youtube || l.youtubeUrl || null),
                            tiktok: (l.tiktoks && l.tiktoks.length > 0) ? l.tiktoks[0] : (l.tiktok || l.tiktokUrl || null)
                        },
                        placeId: l.query_place_id || l.placeId || l.id || l.fid || l.place_id,
                        extraData: l
                    };
                });

                const saved = await supabaseApi.upsertGoogleMapsLeadsBulk(formatted);
                
                // Progress update
                await supabaseApi.updateJobProgress(jobId, 90, saved.length);

                if (saved && saved.length > 0) {
                    const sids = saved.map(s => s.id);
                    await supabaseApi.linkUserToLeadsBulk(userId, sids, "google_maps", tags);
                }

                
                await supabaseApi.updateJobProgress(jobId, 100, saved.length);
                console.log(`✅ Successfully saved and linked ${saved.length} Google Maps leads in Supabase`);
            } else {
                console.warn("⚠️ No results returned from Google Maps scraper.");
            }
        } catch (err) {
            throw err;
        }
}

async function handleWebsiteContactsScrape(userId, input, keyManager, tags = ["WebsiteContact"], jobId) {
    try {
        const domains = input.domains || [];
        if (domains.length === 0) return [];
        
        console.log(`🌐 Starting website contact extraction for: ${domains.join(', ')}`);
        
        // 1. Check database for existing contacts to save costs
        const existing = await supabaseApi.getWebsiteContactsByDomains(domains);
        const existingMap = new Map(existing.map(c => [c.domain, c]));
        
        // Only scrape domains not in DB or older than 30 days
        const staleThreshold = new Date();
        staleThreshold.setDate(staleThreshold.getDate() - 30);
        
        const toScrape = domains.filter(domain => {
            const found = existingMap.get(domain);
            if (!found) return true;
            return new Date(found.updated_at) < staleThreshold;
        });
        
        let allResults = [...existing];
        
        if (toScrape.length > 0) {
            if (jobId) await supabaseApi.updateJobProgress(jobId, 10);
            console.log(`📡 Scraping ${toScrape.length} new/stale domains: ${toScrape.join(', ')}`);
            
            // Prepare URLs to check for each domain (limit to 3 URLs per domain)
            const urlsToCheck = [];
            toScrape.forEach(domain => {
                const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/+$/, '');
                urlsToCheck.push(`https://${cleanDomain}`);
                urlsToCheck.push(`https://${cleanDomain}/contact`);
                urlsToCheck.push(`https://${cleanDomain}/contact-us`);
            });

            const results = await executeWithRetry(
                keyManager,
                "Website Contacts Scrape",
                (key) => scraper.scrapeWebsiteContacts(urlsToCheck, key)
            );
            
            // Format results (Merging per domain)
            const domainMap = new Map();
            
            // Initialize domainMap with empty info for all requested domains 
            // so we save even those where nothing was found (Future avoidance)
            toScrape.forEach(domain => {
                domainMap.set(domain, {
                    domain,
                    emails: new Set(),
                    phones: new Set(),
                    sourceUrls: new Set(),
                    socials: {},
                    extraData: {}
                });
            });

            if (results && results.length > 0) {
                results.forEach(res => {
                    const domain = res.domain;
                    if (!domain || !domainMap.has(domain)) return;

                    const entry = domainMap.get(domain);
                    const hasInfo = (res.emails?.length > 0) || (res.phones?.length > 0) || 
                                    (res.linkedIns?.length > 0) || (res.twitters?.length > 0) || 
                                    (res.instagrams?.length > 0) || (res.facebooks?.length > 0);
                    
                    if (hasInfo && res.url) entry.sourceUrls.add(res.url);
                    
                    if (res.emails) res.emails.forEach(e => entry.emails.add(e));
                    if (res.phones) res.phones.forEach(p => entry.phones.add(p));
                    
                    // Collect first social link of each type
                    if (res.linkedIns?.[0] && !entry.socials.linkedin) entry.socials.linkedin = res.linkedIns[0];
                    if (res.twitters?.[0] && !entry.socials.twitter) entry.socials.twitter = res.twitters[0];
                    if (res.instagrams?.[0] && !entry.socials.instagram) entry.socials.instagram = res.instagrams[0];
                    if (res.facebooks?.[0] && !entry.socials.facebook) entry.socials.facebook = res.facebooks[0];
                    if (res.youtubes?.[0] && !entry.socials.youtube) entry.socials.youtube = res.youtubes[0];
                    if (res.tiktoks?.[0] && !entry.socials.tiktok) entry.socials.tiktok = res.tiktoks[0];
                    if (res.pinterests?.[0] && !entry.socials.pinterest) entry.socials.pinterest = res.pinterests[0];
                });
            }

            const formatted = Array.from(domainMap.values()).map(d => ({
                ...d,
                emails: Array.from(d.emails),
                phones: Array.from(d.phones),
                sourceUrls: Array.from(d.sourceUrls),
                // Map top-level social fields for the DB table
                linkedin: d.socials.linkedin,
                twitter: d.socials.twitter,
                instagram: d.socials.instagram,
                facebook: d.socials.facebook,
                youtube: d.socials.youtube,
                tiktok: d.socials.tiktok,
                pinterest: d.socials.pinterest
            }));

            const saved = await supabaseApi.upsertWebsiteContactsBulk(formatted);
            
            // Add new results to allResults, replacing old stale ones if any
            const savedMap = new Map(saved.map(s => [s.domain, s]));
            allResults = domains.map(d => savedMap.get(d) || existingMap.get(d)).filter(Boolean);
            
            if (jobId) await supabaseApi.updateJobProgress(jobId, 80);
        } else {
            console.log(`✨ All ${domains.length} domains already found in database. Skipping Apify calls.`);
        }

        // Link all results to the user
        const sids = allResults.map(r => r.id);
        if (sids.length > 0) {
            await supabaseApi.linkUserToLeadsBulk(userId, sids, "website_contact", tags);
            console.log(`✅ Successfully saved and linked ${sids.length} website contacts in Supabase`);
        }

        if (jobId) await supabaseApi.updateJobProgress(jobId, 100, allResults.length);
        return allResults;
    } catch (error) {
        console.error(`❌ Website Contacts job failed:`, error.message);
        throw error;
    }
}

async function handleWebsiteContactUpdate(userId, domain, keyManager) {
    console.log(`🔄 Force updating website contact for: ${domain}`);
    
    // Force scrape by ignoring DB check
    const urlsToCheck = [
        `https://${domain.replace(/^https?:\/\//, '').replace(/\/+$/, '')}`,
        `https://${domain.replace(/^https?:\/\//, '').replace(/\/+$/, '')}/contact`,
        `https://${domain.replace(/^https?:\/\//, '').replace(/\/+$/, '')}/contact-us`
    ];

    const results = await executeWithRetry(
        keyManager,
        "Website Contact Force Update",
        (key) => scraper.scrapeWebsiteContacts(urlsToCheck, key)
    );

    const domainMap = new Map();
    domainMap.set(domain, {
        domain,
        emails: new Set(),
        phones: new Set(),
        sourceUrls: new Set(),
        socials: {},
        extraData: {}
    });

    if (results && results.length > 0) {
        results.forEach(res => {
            if (res.domain !== domain) return;
            const entry = domainMap.get(domain);
            const hasInfo = (res.emails?.length > 0) || (res.phones?.length > 0) || 
                            (res.linkedIns?.length > 0) || (res.twitters?.length > 0) || 
                            (res.instagrams?.length > 0) || (res.facebooks?.length > 0);
            
            if (hasInfo && res.url) entry.sourceUrls.add(res.url);
            if (res.emails) res.emails.forEach(e => entry.emails.add(e));
            if (res.phones) res.phones.forEach(p => entry.phones.add(p));
            
            if (res.linkedIns?.[0] && !entry.socials.linkedin) entry.socials.linkedin = res.linkedIns[0];
            if (res.twitters?.[0] && !entry.socials.twitter) entry.socials.twitter = res.twitters[0];
            if (res.instagrams?.[0] && !entry.socials.instagram) entry.socials.instagram = res.instagrams[0];
            if (res.facebooks?.[0] && !entry.socials.facebook) entry.socials.facebook = res.facebooks[0];
            if (res.youtubes?.[0] && !entry.socials.youtube) entry.socials.youtube = res.youtubes[0];
            if (res.tiktoks?.[0] && !entry.socials.tiktok) entry.socials.tiktok = res.tiktoks[0];
            if (res.pinterests?.[0] && !entry.socials.pinterest) entry.socials.pinterest = res.pinterests[0];
        });
    }

    const formatted = Array.from(domainMap.values()).map(d => ({
        ...d,
        emails: Array.from(d.emails),
        phones: Array.from(d.phones),
        sourceUrls: Array.from(d.sourceUrls),
        linkedin: d.socials.linkedin,
        twitter: d.socials.twitter,
        instagram: d.socials.instagram,
        facebook: d.socials.facebook,
        youtube: d.socials.youtube,
        tiktok: d.socials.tiktok,
        pinterest: d.socials.pinterest
    }));

    const saved = await supabaseApi.upsertWebsiteContactsBulk(formatted);
    return saved[0];
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
            console.error(`   ❌ ${taskDescription} failed: ${error.message || (typeof error === 'string' ? error : JSON.stringify(error))}`);

            if ([400, 401, 402, 403, 429].includes(status)) {
                console.log(`      → Rotating key due to status ${status}`);
                keyManager.markFailure(keyObj.key, status);
                await keyManager.refreshIfLow();
            } else {
                console.log(`      → Transient error (status ${status}). Will retry with rotated key.`);
            }

            attempts++;
            await new Promise(r => setTimeout(r, 1000));
        }
    }
    throw lastError;
}

async function handleManualScrape(userId, input, keyManager, tags = ["Manual"], jobId) {
    const { profileUrls = [], companyUrls = [] } = input;

    if (profileUrls.length > 0) {
        console.log(`👤 Processing ${profileUrls.length} personal profile URLs`);
        await processProfiles(userId, profileUrls, "personal", keyManager, tags, jobId, 0);
    }

    if (companyUrls.length > 0) {
        console.log(`🏢 Processing ${companyUrls.length} company URLs`);
        await processProfiles(userId, companyUrls, "company", keyManager, tags, jobId, profileUrls.length > 0 ? 50 : 0);
    }
}

async function handleScheduledTracking(userId, input, keyManager, jobId) {
    let { trackingUrl, keywords, engagementTypes = ["commenters", "reactors"], schedule = "daily", tags = [] } = input;
    const timeFilterMap = { daily: "24h", weekly: "week", monthly: "month" };
    const timeFilter = timeFilterMap[schedule] || "24h";
    const dateFilter = schedule === "daily" ? "past-24h" : schedule === "weekly" ? "past-week" : "past-month";

    if (trackingUrl) {
        console.log(`🎯 Tracking profile: ${trackingUrl} (${schedule})`);
        // Auto-tag with profile handle/url
        const tag = `Profile: ${trackingUrl.split('/in/')[1]?.replace(/\/+$/, '') || trackingUrl}`;
        if (!tags.includes(tag)) tags.push(tag);
        try {
            const postUrls = await executeWithRetry(
                keyManager,
                "Fetch Profile Posts",
                (key) => scraper.scrapePersonalPosts([trackingUrl], key, timeFilter)
            ).then(posts => posts.map((p) => p.linkedinUrl || p.url).filter(Boolean).slice(0, 20));

            console.log(`📰 Found ${postUrls.length} posts from tracked profile`);
            if (postUrls.length > 0) {
                await handleEngagementScrape(userId, postUrls, engagementTypes, keyManager, tags, jobId);
            }
        } catch (err) {
            console.error("Failed to fetch profile posts after retries.");
        }
    } else if (keywords && keywords.length > 0) {
        console.log(`🔍 Tracking keyword(s): ${keywords.join(", ")} (${schedule})`);
        // Auto-tag with keywords
        keywords.forEach(k => {
            const tag = `Keyword: ${k}`;
            if (!tags.includes(tag)) tags.push(tag);
        });
        try {
            const postUrls = await executeWithRetry(
                keyManager,
                "Keyword Search",
                (key) => scraper.searchKeywords(keywords, key, 50, dateFilter)
            ).then(posts => posts.map((p) => p.post_url).filter(Boolean).slice(0, 20));

            console.log(`📰 Found ${postUrls.length} keyword posts`);
            if (postUrls.length > 0) {
                await handleEngagementScrape(userId, postUrls, engagementTypes, keyManager, tags, jobId);
            }
        } catch (err) {
            console.error("Failed to fetch keyword posts after retries.");
        }
    }
}

async function handleEngagementScrape(userId, postUrls, engagementTypes, keyManager, tags = ["Engagement"], jobId) {
    const allProfileUrls = new Set();
    try {
        if (engagementTypes.includes("commenters")) {
            if (jobId) await supabaseApi.updateJobProgress(jobId, 20);
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
            if (jobId) await supabaseApi.updateJobProgress(jobId, 40);
        }
        if (engagementTypes.includes("reactors")) {
            if (jobId) await supabaseApi.updateJobProgress(jobId, 50);
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
            if (jobId) await supabaseApi.updateJobProgress(jobId, 70);
        }
    } catch (err) {
        console.error("Engagement extraction failed:", err.message);
    }

    if (allProfileUrls.size > 0) {
        const urls = Array.from(allProfileUrls);
        console.log(`✨ Enriching ${urls.length} unique profiles...`);
        await processProfiles(userId, urls, "personal", keyManager, tags, jobId, 70);
    } else {
        if (jobId) await supabaseApi.updateJobProgress(jobId, 100);
    }
}

async function processProfiles(userId, urls, type, keyManager, tags = [], jobId, baseProgress = 0) {
    const BATCH_SIZE = 20;
    const THRESHOLD = 5;
    const normalizedUrls = urls.map(u => scraper.normalizeUrl(u)).filter(Boolean);
    const toScrape = [];

    // 1. Initial Cache Check
    for (const url of normalizedUrls) {
        try {
            const cached = await supabaseApi.getCachedProfile(url, type);
            if (cached && cached.isFresh) {
                const sid = cached.profile?.id || cached.company?.id;
                console.log(`📦 Cache Hit [${type}] (Supabase): ${url}`);
                // Link in Supabase junction table
                await supabaseApi.linkUserToLeadsBulk(userId, [sid], type, tags);


            } else {
                toScrape.push(url);
            }
        } catch (e) {
            toScrape.push(url);
        }
    }

    if (toScrape.length === 0) {
        if (jobId) await supabaseApi.updateJobProgress(jobId, 100);
        return;
    }

    const batches = [];
    for (let i = 0; i < toScrape.length; i += BATCH_SIZE) {
        batches.push(toScrape.slice(i, i + BATCH_SIZE));
    }

    console.log(`🚀 Starting parallel research of ${toScrape.length} profiles...`);

    let completedBatches = 0;
    await Promise.all(batches.map((batch, index) => {
        return (async () => {
            await new Promise(r => setTimeout(r, index * 200));
            await keyManager.refreshIfLow();
            await scrapeBatch(userId, batch, type, keyManager, tags);
            
            completedBatches++;
            if (jobId) {
                const progress = baseProgress + Math.floor((completedBatches / batches.length) * (100 - baseProgress));
                await supabaseApi.updateJobProgress(jobId, Math.min(progress, 99));
            }
        })();
    }));

    if (jobId) await supabaseApi.updateJobProgress(jobId, 100);
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
                            about: b.about,
                            extraData: r
                        };
                    } else {
                        return {
                            url: linkedinUrl,
                            companyName: b.name || b.companyName || r.name || "Unknown",
                            linkedinUrl: linkedinUrl,
                            websiteUrl: b.website || b.websiteUrl || r.website || r.websiteUrl,
                            logoUrl: r.media?.logo_url || b.logoUrl || r.logoUrl || b.profile_picture_url || b.logo_url || r.media?.logo,
                            description: b.description || r.description,
                            employeeCount: r.stats?.employee_count || b.employeeCount || r.employeeCount,
                            employeeCountRange: r.stats?.employee_count_range || b.employeeCountRange || r.employeeCountRange,
                            followerCount: r.stats?.follower_count || b.followerCount || r.followerCount,
                            city: r.locations?.headquarters?.city || b.city || r.city,
                            country: r.locations?.headquarters?.country || b.country || r.country,
                            postalCode: r.locations?.headquarters?.postal_code || b.postalCode || r.postalCode,
                            isVerified: b.is_verified ?? b.isVerified ?? r.isVerified,
                            extraData: r
                        };
                    }
                }).filter(Boolean);

                if (type === "personal") {
                    const saved = await supabaseApi.upsertPersonalProfilesBulk(formatted);
                    if (saved && saved.length > 0) {
                        const sids = saved.map(s => s.id);
                        await supabaseApi.linkUserToLeadsBulk(userId, sids, "personal", tags);
                        console.log(`   ✅ Linked ${saved.length} personal profiles in Supabase`);
                    }
                } else {
                    const saved = await supabaseApi.upsertCompanyProfilesBulk(formatted);
                    if (saved && saved.length > 0) {
                        const sids = saved.map(s => s.id);
                        await supabaseApi.linkUserToLeadsBulk(userId, sids, "company", tags);
                        console.log(`   ✅ Linked ${saved.length} company profiles in Supabase`);
                    }
                }
                console.log(`   ✅ Bulk saved ${formatted.length} profiles to Supabase`);
            } catch (saveErr) {
                console.error(`   Bulk save failed:`, saveErr.message);
            }
        }
    } catch (error) {
        console.error(`   🔴 Batch failed:`, error.message);
    }
}

module.exports = { processJob, handleWebsiteContactUpdate };
