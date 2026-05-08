"use strict";

const axios = require("axios");

// ─────────────────────────────────────────
// Apify Actor IDs
// ─────────────────────────────────────────
const ACTORS = {
    PERSONAL_PROFILE: "GOvL4O4RwFqsdIqXF",
    COMPANY_PROFILE: "ipHw77V2NMJPy8sbS",
    COMPANY_EMPLOYEES: "Vb6LZkh4EqRlR0Ka9",
    PERSONAL_POSTS: "A3cAPGpwBEG8RJwse",
    COMPANY_POSTS: "WI0tj4Ieb5Kq458gB",
    KEYWORD_SEARCH: "9o7Ft0fpQTY5FW38E",
    POST_COMMENTS: "ZI6ykbLlGS3APaPE8",
    POST_REACTIONS: "S6mgSO5lezSZKi0zN",
    PROFILE_COMMENTS: "FiHYLewnJwS6GnRpo",
    GOOGLE_MAPS: "WnMxbsRLNbPeYL6ge",
};

// ─────────────────────────────────────────
// Core Apify Caller
// ─────────────────────────────────────────
async function callApifyActor(actorId, input, token, timeout = 300000) {
    // We use the 'acts/' alias because it handles both Actors and Tasks correctly.
    // 'actors/' often returns 404 if the ID is for a Task.
    const startUrl = `https://api.apify.com/v2/acts/${actorId}/runs`;

    try {
        console.log(`🎬 Starting Apify actor [${actorId}]...`);
        const runResponse = await axios.post(startUrl, input, {
            timeout: 30000,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
        });

        const runId = runResponse.data?.data?.id;
        const defaultDatasetId = runResponse.data?.data?.defaultDatasetId;

        if (!runId) {
            throw new Error(`Failed to start actor run: ${JSON.stringify(runResponse.data)}`);
        }

        console.log(`   → Run started: ${runId}. Waiting for completion...`);

        // Polling for completion
        const pollInterval = 5000;
        const maxPolls = Math.floor(timeout / pollInterval);
        let polls = 0;
        let finished = false;

        while (polls < maxPolls && !finished) {
            await new Promise(resolve => setTimeout(resolve, pollInterval));
            polls++;

            const statusUrl = `https://api.apify.com/v2/acts/${actorId}/runs/${runId}`;
            const statusResponse = await axios.get(statusUrl, {
                timeout: 10000,
                headers: { "Authorization": `Bearer ${token}` }
            });
            const status = statusResponse.data?.data?.status;

            if (status === "SUCCEEDED") {
                finished = true;
                console.log(`   ✅ Run SUCCEEDED after ${polls * 5}s`);
            } else if (status === "FAILED" || status === "ABORTED" || status === "TIMED-OUT") {
                throw new Error(`Apify run ${status}: ${JSON.stringify(statusResponse.data)}`);
            }
            // If RUNNING or READY, keep polling
        }

        if (!finished) {
            throw new Error(`Apify run timed out after ${timeout / 1000}s`);
        }

        // Fetch the dataset items
        const datasetUrl = `https://api.apify.com/v2/datasets/${defaultDatasetId}/items`;
        const itemsResponse = await axios.get(datasetUrl, {
            timeout: 30000,
            headers: { "Authorization": `Bearer ${token}` }
        });

        return itemsResponse.data;

    } catch (error) {
        console.error(`❌ Apify call failed [${actorId}]:`, error.message || error);
        if (error.response) {
            // Re-throw with status for key manager
            throw {
                status: error.response.status,
                message: error.response.statusText,
                data: error.response.data,
            };
        }
        throw error;
    }
}

// ─────────────────────────────────────────
// Profile Scrapers
// ─────────────────────────────────────────

/**
 * Scrape personal LinkedIn profiles
 * Input: array of linkedin.com/in/... URLs
 * Key output fields: basic_info.{fullname, first_name, last_name, headline, profile_url,
 *   profile_picture_url, email, location, follower_count, connection_count, current_company},
 *   experience[], education[], certifications[], languages[]
 */
async function scrapePersonalProfiles(urls, token) {
    return callApifyActor(ACTORS.PERSONAL_PROFILE, {
        usernames: urls,   // The actor param is 'usernames' but accepts full URLs
        includeEmail: true,
    }, token);
}

/**
 * Scrape company LinkedIn profiles
 * Key output fields: basic_info.{name, universal_name, linkedin_url, website, industries},
 *   stats.{employee_count, follower_count}, locations, media, funding
 */
async function scrapeCompanyProfiles(urls, token) {
    return callApifyActor(ACTORS.COMPANY_PROFILE, {
        identifier: urls,
    }, token);
}

/**
 * Scrape Google Maps leads
 */
async function scrapeGoogleMaps(options, token) {
    const {
        searchStringsArray = [],
        locationQuery = "",
        maxCrawledPlacesPerSearch = 10
    } = options;

    // Combine keywords and location for maximum reliability
    const queries = searchStringsArray.map(q => 
        locationQuery ? `${q} in ${locationQuery}` : q
    );

    const payload = {
        // Redundant mapping for different actor versions
        queries: queries,
        searchStringsArray: queries,
        locationQuery: locationQuery,
        maxCrawledPlacesPerSearch: Number(maxCrawledPlacesPerSearch),
        
        // Exact matches for user's working manual run
        scrapeContacts: true,
        scrapeSocialMediaProfiles: {
            facebooks: true,
            instagrams: true,
            tiktoks: true,
            twitters: true,
            youtubes: true
        },
        scrapePlaceDetailPage: false,
        includeWebResults: false,
        language: "en",
        skipClosedPlaces: false,
        maximumLeadsEnrichmentRecords: 0,
        
        // Disable useless fallbacks
        allPlacesNoSearchAction: "none", 
    };

    console.log("🚀 [PROD] Sending Robust Google Maps Payload:", JSON.stringify(payload, null, 2));

    return callApifyActor(ACTORS.GOOGLE_MAPS, payload, token, 600000); 
}

// ─────────────────────────────────────────
// Post Scrapers
// ─────────────────────────────────────────

/**
 * Scrape recent posts from a personal profile
 * postedLimit: "24h" | "week" | "month" | "3months"
 * Key output fields per post: linkedinUrl, content, author, postedAt, engagement
 */
async function scrapePersonalPosts(urls, token, postedLimit = "24h") {
    return callApifyActor(ACTORS.PERSONAL_POSTS, {
        targetUrls: urls,
        postedLimit,
        includeQuotePosts: true,
        includeReposts: false,
        scrapeComments: false,
        scrapeReactions: false,
    }, token);
}

/**
 * Keyword / Post Discovery
 * dateFilter: "past-24h" | "past-week" | "past-month"
 * Key output fields per post: post_url, text, owner_name, total_reactions, comments, timestamp
 */
async function searchKeywords(keywords, token, maxPosts = 50, dateFilter = "past-week") {
    return callApifyActor(ACTORS.KEYWORD_SEARCH, {
        keywords,
        max_posts: maxPosts,
        date_filter: dateFilter,
        sort_by: "date_posted",
    }, token);
}

// ─────────────────────────────────────────
// Engagement Scrapers
// ─────────────────────────────────────────

/**
 * Scrape commenters from LinkedIn post URLs
 * Key output fields per comment: linkedinUrl, actor.{name, headline, linkedinUrl}, commentary, replies[]
 */
async function scrapePostEngagement(postUrls, token) {
    return callApifyActor(ACTORS.POST_COMMENTS, {
        posts: postUrls,
    }, token);
}

/**
 * Scrape people who reacted to LinkedIn posts
 * Key output fields per reaction: reactionType, actor.{name, headline, linkedinUrl}
 */
async function scrapePostReactors(postUrls, token) {
    return callApifyActor(ACTORS.POST_REACTIONS, {
        posts: postUrls,
    }, token);
}

/**
 * Scrape employees from companies
 */
async function scrapeCompanyEmployees(companyUrls, token, options = {}) {
    const {
        jobTitles = [],
        locations = [],
        maxItems = 50,
        maxItemsPerCompany = 10
    } = options;

    return callApifyActor(ACTORS.COMPANY_EMPLOYEES, {
        companies: companyUrls,
        jobTitles,
        locations,
        maxItems,
        maxItemsPerCompany,
        profileScraperMode: "full",
        companyBatchMode: "parallel"
    }, token);
}

/**
 * Scrape comments made by specific profiles
 */
async function scrapeProfileComments(profileUrls, token, maxItems = 20) {
    return callApifyActor(ACTORS.PROFILE_COMMENTS, {
        profiles: profileUrls,
        maxItems,
        postedLimit: "month"
    }, token);
}

/**
 * Test if an API key is valid and active
 */
async function testKey(token) {
    const url = `https://api.apify.com/v2/users/me`;
    try {
        const response = await axios.get(url, {
            timeout: 10000,
            headers: { "Authorization": `Bearer ${token}` }
        });
        return { success: true, status: response.status };
    } catch (error) {
        return {
            success: false,
            status: error.response?.status || 500,
            message: error.response?.data?.message || error.message
        };
    }
}

/**
 * Normalize LinkedIn URLs by removing query params, fragments, and trailing slashes.
 * Crucial for cache hits.
 */
function normalizeUrl(rawUrl) {
    try {
        if (!rawUrl || typeof rawUrl !== 'string') return '';
        const trimmed = rawUrl.trim();
        const candidate = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
        const url = new URL(candidate);

        if (url.hostname.includes('linkedin.com')) {
            url.search = '';
            url.hash = '';
            let path = url.pathname.replace(/\/+$/, '');
            // Ensure company URLs are normalized consistently
            if (path.includes('/company/')) {
                path = path.split('/life')[0].split('/about')[0].split('/jobs')[0].split('/people')[0];
            }
            return `${url.protocol}//${url.hostname}${path}`;
        }
        return rawUrl;
    } catch {
        return rawUrl.split('#')[0].split('?')[0].replace(/\/+$/, '');
    }
}

module.exports = {
    ACTORS,
    callApifyActor,
    scrapePersonalProfiles,
    scrapeCompanyProfiles,
    scrapeGoogleMaps,
    scrapePersonalPosts,
    searchKeywords,
    scrapePostEngagement,
    scrapePostReactors,
    scrapeCompanyEmployees,
    scrapeProfileComments,
    testKey,
    normalizeUrl,
};