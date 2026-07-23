const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { processJob, handleWebsiteContactUpdate } = require("./jobProcessor");
const { runHeartbeat } = require("./heartbeat");
const supabaseApi = require("./supabaseApi");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));

// ─────────────────────────────────────────
// Health check (no auth required)
// ─────────────────────────────────────────
app.get("/", (req, res) => {
    res.json({
        status: "online",
        service: "WarmAudience Intelligence Backend",
        version: "2.0.0",
        timestamp: new Date().toISOString(),
    });
});

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

const rateLimit = require("express-rate-limit");
const crypto = require("crypto");

// ─────────────────────────────────────────
// Rate Limiters
// ─────────────────────────────────────────
const apiRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 60, // Limit each API key to 60 requests per windowMs
    message: { error: "Too many requests from this API key, please try again after a minute" },
    standardHeaders: true,
    legacyHeaders: false,
});

// ─────────────────────────────────────────
// Auth Middleware (Supabase JWT or Hashed API Key)
// ─────────────────────────────────────────
app.use(async (req, res, next) => {
    const skipPaths = ["/", "/health", "/api/heartbeat"];
    if (skipPaths.includes(req.path)) return next();

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized: Missing Bearer Token" });
    }

    const token = authHeader.split(" ")[1];
    
    try {
        // 1. Check if token is a Supabase JWT (contains two dots)
        if (token.split('.').length === 3) {
            const { data: { user }, error } = await supabaseApi.supabase.auth.getUser(token);
            if (error || !user) throw new Error("Invalid JWT");
            req.userId = user.id;
            return next();
        }
        
        // 2. Otherwise, treat as API Key
        // Hash the token since DB stores SHA-256 hashes
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
        const result = await supabaseApi.validateWebhookKey(hashedToken);
        
        if (!result || !result.isValid) {
            throw new Error("Invalid API Key");
        }
        
        req.userId = result.userId;
        
        // Apply rate limiter specifically to API key users
        return apiRateLimiter(req, res, next);

    } catch (e) {
        return res.status(403).json({ error: "Forbidden: Invalid Token" });
    }
});

// ─────────────────────────────────────────
// POST /api/scrape-profiles
// Manual profile & company URL scraping
// ─────────────────────────────────────────
app.post(["/api/scrape-profiles", "/api/scrape-linkedin"], async (req, res) => {
    try {
        const { urls, profileUrls, companyUrls: rawCompanyUrls, tags = [], force = false } = req.body;
        const inputUrls = urls || profileUrls || [];

        if (!Array.isArray(inputUrls) && !rawCompanyUrls) {
            return res.status(400).json({ error: "Valid URLs array is required" });
        }

        const personalUrls = [];
        const companyUrls = Array.isArray(rawCompanyUrls) ? rawCompanyUrls : [];

        if (Array.isArray(inputUrls)) {
            inputUrls.forEach((url) => {
                if (url.includes("linkedin.com/company/")) companyUrls.push(url);
                else if (url.includes("linkedin.com/in/")) personalUrls.push(url);
            });
        }

        if (personalUrls.length === 0 && companyUrls.length === 0) {
            return res.status(400).json({ error: "No valid LinkedIn profile or company URLs found" });
        }

        // 0. Check Usage Limit (Migrated to Supabase)
        const [subscription, currentCount] = await Promise.all([
            supabaseApi.getUserSubscription(req.userId),
            supabaseApi.getMonthlyLeadCount(req.userId)
        ]);
        
        const planLimits = {
            free: 1000,
            growth: 10000,
            pro: 10000,
            elite: 1000000,
            scale: 1000000
        };

        const profilesLimit = planLimits[subscription.plan_slug] || 1000;
        
        if (currentCount >= profilesLimit) {
            return res.status(403).json({
                error: `Limit Reached: You have consumed all your profile storage for this month (${profilesLimit} profiles). Please upgrade your plan for more capacity.`,
                code: "LIMIT_REACHED"
            });
        }


        // Fire-and-forget: respond immediately, process in background
        processJob({
            userId: req.userId,
            type: "manual_scrape",
            input: { profileUrls: personalUrls, companyUrls, tags },
            force,
        }).catch((err) => console.error("❌ Background scrape failed:", err));

        res.json({
            status: "processing",
            message: `Research started for ${personalUrls.length} profiles and ${companyUrls.length} companies`,
            counts: { personal: personalUrls.length, company: companyUrls.length },
        });
    } catch (e) {
        console.error("scrape-profiles error:", e);
        res.status(500).json({ error: e.message });
    }
});

// ─────────────────────────────────────────
// POST /api/scrape-google-maps
// ─────────────────────────────────────────
app.post("/api/scrape-google-maps", async (req, res) => {
    try {
        const { searchStringsArray, locationQuery, maxCrawledPlacesPerSearch, tags = [] } = req.body;

        if (!searchStringsArray || !Array.isArray(searchStringsArray) || searchStringsArray.length === 0) {
            return res.status(400).json({ error: "searchStringsArray is required" });
        }
        if (!locationQuery) {
            return res.status(400).json({ error: "locationQuery is required" });
        }

        // 0. Check Usage Limit (Migrated to Supabase)
        const [subscription, currentCount] = await Promise.all([
            supabaseApi.getUserSubscription(req.userId),
            supabaseApi.getMonthlyLeadCount(req.userId)
        ]);
        
        const planLimits = {
            free: 1000,
            growth: 10000,
            pro: 10000,
            elite: 1000000,
            scale: 1000000
        };

        const profilesLimit = planLimits[subscription.plan_slug] || 1000;
        
        if (currentCount >= profilesLimit) {
            return res.status(403).json({
                error: `Limit Reached: You have consumed all your lead storage for this month (${profilesLimit} leads). Please upgrade your plan for more capacity.`,
                code: "LIMIT_REACHED"
            });
        }

        processJob({
            userId: req.userId,
            type: "google_maps",
            input: { searchStringsArray, locationQuery, maxCrawledPlacesPerSearch, tags },
        }).catch((err) => console.error("❌ Google Maps scrape failed:", err));

        res.json({
            status: "processing",
            message: `Google Maps research started for: ${searchStringsArray.join(", ")} in ${locationQuery}`,
        });
    } catch (e) {
        console.error("scrape-google-maps error:", e);
        res.status(500).json({ error: e.message });
    }
});

// ─────────────────────────────────────────
// POST /api/scrape-website-contacts
// ─────────────────────────────────────────
app.post("/api/scrape-website-contacts", async (req, res) => {
    try {
        const { domains, tags = [] } = req.body;

        if (!domains || !Array.isArray(domains) || domains.length === 0) {
            return res.status(400).json({ error: "domains array is required" });
        }

        // 0. Check Usage Limit
        const [subscription, currentCount] = await Promise.all([
            supabaseApi.getUserSubscription(req.userId),
            supabaseApi.getMonthlyLeadCount(req.userId)
        ]);
        
        const planLimits = {
            free: 1000,
            growth: 10000,
            pro: 10000,
            elite: 1000000,
            scale: 1000000
        };

        const profilesLimit = planLimits[subscription.plan_slug] || 1000;
        
        if (currentCount >= profilesLimit) {
            return res.status(403).json({
                error: `Limit Reached: You have consumed all your lead storage for this month (${profilesLimit} leads). Please upgrade your plan for more capacity.`,
                code: "LIMIT_REACHED"
             });
        }

        processJob({
            userId: req.userId,
            type: "website_contact",
            input: { domains, tags },
        }).catch((err) => console.error("❌ Website contact scrape failed:", err));

        res.json({
            status: "processing",
            message: `Website contact research started for ${domains.length} domains`,
        });
    } catch (e) {
        console.error("scrape-website-contacts error:", e);
        res.status(500).json({ error: e.message });
    }
});

// Update a single website contact (Fresh scrape)
app.post("/api/update-website-contact", async (req, res) => {
    try {
        const { domain } = req.body;
        if (!domain) return res.status(400).json({ error: "Missing domain" });

        const result = await handleWebsiteContactUpdate(req.userId, domain, keyManager);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error("❌ Website Contact Update error:", error);
        res.status(500).json({ error: error.message });
    }
});

// ─────────────────────────────────────────
// ─────────────────────────────────────────
// LinkedIn Engagement Scrape
// ─────────────────────────────────────────
app.post("/api/scrape-engagers", async (req, res) => {
    try {
        const { postUrls, extractLikers = true, extractCommenters = true, maxPages = 1, sortBy = "recent", tags = [] } = req.body;

        if (!postUrls || !Array.isArray(postUrls) || postUrls.length === 0) {
            return res.status(400).json({ error: "postUrls array is required" });
        }

        const engagementTypes = [];
        if (extractCommenters) engagementTypes.push("commenters");
        if (extractLikers) engagementTypes.push("reactors");

        if (engagementTypes.length === 0) {
            return res.status(400).json({ error: "Select at least one engagement type (commenters or reactors)" });
        }

        // 0. Check Usage Limit (Migrated to Supabase)
        const [subscription, currentCount] = await Promise.all([
            supabaseApi.getUserSubscription(req.userId),
            supabaseApi.getMonthlyLeadCount(req.userId)
        ]);
        
        const planLimits = {
            free: 1000,
            growth: 10000,
            pro: 10000,
            elite: 1000000,
            scale: 1000000
        };

        const profilesLimit = planLimits[subscription.plan_slug] || 1000;
        
        if (currentCount >= profilesLimit) {
            return res.status(403).json({
                error: `Limit Reached: You have consumed all your profile storage for this month (${profilesLimit} profiles). Please upgrade your plan for more capacity.`,
                code: "LIMIT_REACHED"
            });
        }


        processJob({
            userId: req.userId,
            type: "engagement_scrape",
            input: { postUrls, engagementTypes, maxPages, sortBy, tags },
        }).catch((err) => console.error("❌ Engagement scrape failed:", err));

        res.json({
            status: "processing",
            message: `Engagement research started for ${postUrls.length} posts`,
        });
    } catch (e) {
        console.error("scrape-engagers error:", e);
        res.status(500).json({ error: e.message });
    }
});

// ─────────────────────────────────────────
// POST /api/scrape-instagram-profiles
// ─────────────────────────────────────────
app.post("/api/scrape-instagram-profiles", async (req, res) => {
    try {
        const { usernames, tags = [], force = false } = req.body;

        if (!usernames || !Array.isArray(usernames) || usernames.length === 0) {
            return res.status(400).json({ error: "usernames array is required" });
        }

        // 0. Check Usage Limit
        const [subscription, currentCount] = await Promise.all([
            supabaseApi.getUserSubscription(req.userId),
            supabaseApi.getMonthlyLeadCount(req.userId)
        ]);
        
        const planLimits = {
            free: 1000,
            growth: 10000,
            pro: 10000,
            elite: 1000000,
            scale: 1000000
        };

        const profilesLimit = planLimits[subscription.plan_slug] || 1000;
        
        if (currentCount >= profilesLimit) {
            return res.status(403).json({
                error: `Limit Reached: You have consumed all your lead storage for this month (${profilesLimit} leads). Please upgrade your plan for more capacity.`,
                code: "LIMIT_REACHED"
            });
        }

        processJob({
            userId: req.userId,
            type: "instagram_profiles",
            input: { usernames, tags },
            force,
        }).catch((err) => console.error("❌ Instagram profiles scrape failed:", err));

        res.json({
            status: "processing",
            message: `Instagram profile research started for ${usernames.length} profiles`,
        });
    } catch (e) {
        console.error("scrape-instagram-profiles error:", e);
        res.status(500).json({ error: e.message });
    }
});

// ─────────────────────────────────────────
// POST /api/scrape-instagram-engagement
// ─────────────────────────────────────────
app.post("/api/scrape-instagram-engagement", async (req, res) => {
    try {
        const { postUrls, extractLikers = true, extractCommenters = true, tags = [] } = req.body;

        if (!postUrls || !Array.isArray(postUrls) || postUrls.length === 0) {
            return res.status(400).json({ error: "postUrls array is required" });
        }

        // 0. Check Usage Limit
        const [subscription, currentCount] = await Promise.all([
            supabaseApi.getUserSubscription(req.userId),
            supabaseApi.getMonthlyLeadCount(req.userId)
        ]);
        
        const planLimits = {
            free: 1000,
            growth: 10000,
            pro: 10000,
            elite: 1000000,
            scale: 1000000
        };

        const profilesLimit = planLimits[subscription.plan_slug] || 1000;
        
        if (currentCount >= profilesLimit) {
            return res.status(403).json({
                error: `Limit Reached: You have consumed all your lead storage for this month (${profilesLimit} leads). Please upgrade your plan for more capacity.`,
                code: "LIMIT_REACHED"
            });
        }

        processJob({
            userId: req.userId,
            type: "instagram_engagement",
            input: { postUrls, extractLikers, extractCommenters, tags },
        }).catch((err) => console.error("❌ Instagram engagement scrape failed:", err));

        res.json({
            status: "processing",
            message: `Instagram engagement research started for ${postUrls.length} posts`,
        });
    } catch (e) {
        console.error("scrape-instagram-engagement error:", e);
        res.status(500).json({ error: e.message });
    }
});

// ─────────────────────────────────────────
// POST /api/scrape-instagram-followers
// ─────────────────────────────────────────
app.post(["/api/instagram/scrape-followers", "/api/scrape-instagram-followers"], async (req, res) => {
    try {
        const { urls, extractFollowers = true, extractFollowing = true, tags = [] } = req.body;

        if (!urls || !Array.isArray(urls) || urls.length === 0) {
            return res.status(400).json({ error: "urls array is required" });
        }

        if (!extractFollowers && !extractFollowing) {
            return res.status(400).json({ error: "Select at least one extraction type (followers or following)" });
        }

        // 0. Check Usage Limit
        const [subscription, currentCount] = await Promise.all([
            supabaseApi.getUserSubscription(req.userId),
            supabaseApi.getMonthlyLeadCount(req.userId)
        ]);
        
        const planLimits = {
            free: 1000,
            growth: 10000,
            pro: 10000,
            elite: 1000000,
            scale: 1000000
        };

        const profilesLimit = planLimits[subscription.plan_slug] || 1000;
        
        if (currentCount >= profilesLimit) {
            return res.status(403).json({
                error: `Limit Reached: You have consumed all your lead storage for this month (${profilesLimit} leads). Please upgrade your plan for more capacity.`,
                code: "LIMIT_REACHED"
            });
        }

        processJob({
            userId: req.userId,
            type: "instagram_followers",
            input: { urls, extractFollowers, extractFollowing, tags },
        }).catch((err) => console.error("❌ Instagram followers scrape failed:", err));

        res.json({
            status: "processing",
            message: `Instagram follower research started for ${urls.length} profiles`,
        });
    } catch (e) {
        console.error("scrape-instagram-followers error:", e);
        res.status(500).json({ error: e.message });
    }
});

// ─────────────────────────────────────────
// POST /api/scrape-x-profiles
// ─────────────────────────────────────────
app.post("/api/scrape-x-profiles", async (req, res) => {
    try {
        const { usernames, tags = [], force = false } = req.body;

        if (!usernames || !Array.isArray(usernames) || usernames.length === 0) {
            return res.status(400).json({ error: "usernames array is required" });
        }

        const [subscription, currentCount] = await Promise.all([
            supabaseApi.getUserSubscription(req.userId),
            supabaseApi.getMonthlyLeadCount(req.userId)
        ]);
        
        const planLimits = { free: 1000, growth: 10000, pro: 10000, elite: 1000000, scale: 1000000 };
        const profilesLimit = planLimits[subscription.plan_slug] || 1000;
        
        if (currentCount >= profilesLimit) {
            return res.status(403).json({
                error: `Limit Reached: You have consumed all your lead storage for this month (${profilesLimit} leads). Please upgrade your plan for more capacity.`,
                code: "LIMIT_REACHED"
            });
        }

        processJob({
            userId: req.userId,
            type: "x_profiles",
            input: { usernames, tags },
            force
        }).catch((err) => console.error("❌ X profile scrape failed:", err));

        res.json({
            status: "processing",
            message: `X profile research started for ${usernames.length} profiles`,
        });
    } catch (e) {
        console.error("scrape-x-profiles error:", e);
        res.status(500).json({ error: e.message });
    }
});

// ─────────────────────────────────────────
// POST /api/scrape-x-engagement
// ─────────────────────────────────────────
app.post("/api/scrape-x-engagement", async (req, res) => {
    try {
        const { postUrls, tags = [] } = req.body;

        if (!postUrls || !Array.isArray(postUrls) || postUrls.length === 0) {
            return res.status(400).json({ error: "postUrls array is required" });
        }

        const [subscription, currentCount] = await Promise.all([
            supabaseApi.getUserSubscription(req.userId),
            supabaseApi.getMonthlyLeadCount(req.userId)
        ]);
        
        const planLimits = { free: 1000, growth: 10000, pro: 10000, elite: 1000000, scale: 1000000 };
        const profilesLimit = planLimits[subscription.plan_slug] || 1000;
        
        if (currentCount >= profilesLimit) {
            return res.status(403).json({
                error: `Limit Reached: You have consumed all your lead storage for this month (${profilesLimit} leads). Please upgrade your plan for more capacity.`,
                code: "LIMIT_REACHED"
            });
        }

        processJob({
            userId: req.userId,
            type: "x_engagement",
            input: { postUrls, tags },
        }).catch((err) => console.error("❌ X engagement scrape failed:", err));

        res.json({
            status: "processing",
            message: `X engagement research started for ${postUrls.length} posts`,
        });
    } catch (e) {
        console.error("scrape-x-engagement error:", e);
        res.status(500).json({ error: e.message });
    }
});

// ─────────────────────────────────────────
// POST /api/scrape-x-followers
// ─────────────────────────────────────────
app.post("/api/scrape-x-followers", async (req, res) => {
    try {
        const { usernames, maxCount = 200, getFollowers = true, getFollowing = false, tags = [] } = req.body;

        if (!usernames || !Array.isArray(usernames) || usernames.length === 0) {
            return res.status(400).json({ error: "usernames array is required" });
        }

        const [subscription, currentCount] = await Promise.all([
            supabaseApi.getUserSubscription(req.userId),
            supabaseApi.getMonthlyLeadCount(req.userId)
        ]);
        
        const planLimits = { free: 1000, growth: 10000, pro: 10000, elite: 1000000, scale: 1000000 };
        const profilesLimit = planLimits[subscription.plan_slug] || 1000;
        
        if (currentCount >= profilesLimit) {
            return res.status(403).json({
                error: `Limit Reached: You have consumed all your lead storage for this month (${profilesLimit} leads). Please upgrade your plan for more capacity.`,
                code: "LIMIT_REACHED"
            });
        }

        processJob({
            userId: req.userId,
            type: "x_followers",
            input: { usernames, maxCount, getFollowers, getFollowing, tags },
        }).catch((err) => console.error("❌ X followers scrape failed:", err));

        res.json({
            status: "processing",
            message: `X follower research started for ${usernames.length} profiles`,
        });
    } catch (e) {
        console.error("scrape-x-followers error:", e);
        res.status(500).json({ error: e.message });
    }
});

// ─────────────────────────────────────────
// POST /api/scrape-facebook-profiles
// ─────────────────────────────────────────
app.post("/api/scrape-facebook-profiles", async (req, res) => {
    try {
        const { urls, tags = [], force = false } = req.body;

        if (!urls || !Array.isArray(urls) || urls.length === 0) {
            return res.status(400).json({ error: "urls array is required" });
        }

        const [subscription, currentCount] = await Promise.all([
            supabaseApi.getUserSubscription(req.userId),
            supabaseApi.getMonthlyLeadCount(req.userId)
        ]);
        
        const planLimits = { free: 1000, growth: 10000, pro: 10000, elite: 1000000, scale: 1000000 };
        const profilesLimit = planLimits[subscription.plan_slug] || 1000;
        
        if (currentCount >= profilesLimit) {
            return res.status(403).json({
                error: `Limit Reached: You have consumed all your lead storage for this month (${profilesLimit} leads). Please upgrade your plan for more capacity.`,
                code: "LIMIT_REACHED"
            });
        }

        processJob({
            userId: req.userId,
            type: "facebook_profiles",
            input: { urls, tags },
            force
        }).catch((err) => console.error("❌ Facebook profile scrape failed:", err));

        res.json({
            status: "processing",
            message: `Facebook profile research started for ${urls.length} profiles`,
        });
    } catch (e) {
        console.error("scrape-facebook-profiles error:", e);
        res.status(500).json({ error: e.message });
    }
});

// ─────────────────────────────────────────
// POST /api/scrape-facebook-engagement
// ─────────────────────────────────────────
app.post("/api/scrape-facebook-engagement", async (req, res) => {
    try {
        const { postUrls, maxCommentsPerPost = 100, tags = [] } = req.body;

        if (!postUrls || !Array.isArray(postUrls) || postUrls.length === 0) {
            return res.status(400).json({ error: "postUrls array is required" });
        }

        const [subscription, currentCount] = await Promise.all([
            supabaseApi.getUserSubscription(req.userId),
            supabaseApi.getMonthlyLeadCount(req.userId)
        ]);
        
        const planLimits = { free: 1000, growth: 10000, pro: 10000, elite: 1000000, scale: 1000000 };
        const profilesLimit = planLimits[subscription.plan_slug] || 1000;
        
        if (currentCount >= profilesLimit) {
            return res.status(403).json({
                error: `Limit Reached: You have consumed all your lead storage for this month (${profilesLimit} leads). Please upgrade your plan for more capacity.`,
                code: "LIMIT_REACHED"
            });
        }

        processJob({
            userId: req.userId,
            type: "facebook_engagement",
            input: { postUrls, maxCommentsPerPost, tags },
        }).catch((err) => console.error("❌ Facebook engagement scrape failed:", err));

        res.json({
            status: "processing",
            message: `Facebook engagement research started for ${postUrls.length} posts`,
        });
    } catch (e) {
        console.error("scrape-facebook-engagement error:", e);
        res.status(500).json({ error: e.message });
    }
});

// ─────────────────────────────────────────
// POST /api/scrape-facebook-followers
// ─────────────────────────────────────────
app.post("/api/scrape-facebook-followers", async (req, res) => {
    try {
        const { urls, maxCount = 50, followType = "", tags = [] } = req.body;

        if (!urls || !Array.isArray(urls) || urls.length === 0) {
            return res.status(400).json({ error: "urls array is required" });
        }

        const [subscription, currentCount] = await Promise.all([
            supabaseApi.getUserSubscription(req.userId),
            supabaseApi.getMonthlyLeadCount(req.userId)
        ]);
        
        const planLimits = { free: 1000, growth: 10000, pro: 10000, elite: 1000000, scale: 1000000 };
        const profilesLimit = planLimits[subscription.plan_slug] || 1000;
        
        if (currentCount >= profilesLimit) {
            return res.status(403).json({
                error: `Limit Reached: You have consumed all your lead storage for this month (${profilesLimit} leads). Please upgrade your plan for more capacity.`,
                code: "LIMIT_REACHED"
            });
        }

        processJob({
            userId: req.userId,
            type: "facebook_followers",
            input: { urls, maxCount, followType, tags },
        }).catch((err) => console.error("❌ Facebook followers scrape failed:", err));

        res.json({
            status: "processing",
            message: `Facebook follower research started for ${urls.length} profiles`,
        });
    } catch (e) {
        console.error("scrape-facebook-followers error:", e);
        res.status(500).json({ error: e.message });
    }
});

// ─────────────────────────────────────────
// POST /api/scrape-facebook-groups
// ─────────────────────────────────────────
app.post("/api/scrape-facebook-groups", async (req, res) => {
    try {
        const { keyword, maxItems = 200, tags = [] } = req.body;

        if (!keyword) {
            return res.status(400).json({ error: "keyword is required" });
        }

        const [subscription, currentCount] = await Promise.all([
            supabaseApi.getUserSubscription(req.userId),
            supabaseApi.getMonthlyLeadCount(req.userId)
        ]);
        
        const planLimits = { free: 1000, growth: 10000, pro: 10000, elite: 1000000, scale: 1000000 };
        const profilesLimit = planLimits[subscription.plan_slug] || 1000;
        
        if (currentCount >= profilesLimit) {
            return res.status(403).json({
                error: `Limit Reached: You have consumed all your lead storage for this month (${profilesLimit} leads). Please upgrade your plan for more capacity.`,
                code: "LIMIT_REACHED"
            });
        }

        processJob({
            userId: req.userId,
            type: "facebook_groups_search",
            input: { keyword, maxItems, tags },
        }).catch((err) => console.error("❌ Facebook groups search failed:", err));

        res.json({
            status: "processing",
            message: `Facebook groups search started for keyword: ${keyword}`,
        });
    } catch (e) {
        console.error("scrape-facebook-groups error:", e);
        res.status(500).json({ error: e.message });
    }
});

// ─────────────────────────────────────────
// POST /api/scrape-facebook-group-members
// ─────────────────────────────────────────
app.post("/api/scrape-facebook-group-members", async (req, res) => {
    try {
        const { groupUrls, maxItems = 50, tags = [] } = req.body;

        if (!groupUrls || !Array.isArray(groupUrls) || groupUrls.length === 0) {
            return res.status(400).json({ error: "groupUrls array is required" });
        }

        const [subscription, currentCount] = await Promise.all([
            supabaseApi.getUserSubscription(req.userId),
            supabaseApi.getMonthlyLeadCount(req.userId)
        ]);
        
        const planLimits = { free: 1000, growth: 10000, pro: 10000, elite: 1000000, scale: 1000000 };
        const profilesLimit = planLimits[subscription.plan_slug] || 1000;
        
        if (currentCount >= profilesLimit) {
            return res.status(403).json({
                error: `Limit Reached: You have consumed all your lead storage for this month (${profilesLimit} leads). Please upgrade your plan for more capacity.`,
                code: "LIMIT_REACHED"
            });
        }

        processJob({
            userId: req.userId,
            type: "facebook_group_members",
            input: { groupUrls, maxItems, tags },
        }).catch((err) => console.error("❌ Facebook group members scrape failed:", err));

        res.json({
            status: "processing",
            message: `Facebook group members extraction started for ${groupUrls.length} groups`,
        });
    } catch (e) {
        console.error("scrape-facebook-group-members error:", e);
        res.status(500).json({ error: e.message });
    }
});

// ─────────────────────────────────────────
// Tracker Management
// ─────────────────────────────────────────

app.post("/api/competitor-tracking/schedule", async (req, res) => {
    try {
        const { type, targetValue, schedule, targets } = req.body;

        // 1. Check Tracker Limits
        const [subscription, activeTrackersCount] = await Promise.all([
            supabaseApi.getUserSubscription(req.userId),
            supabaseApi.getActiveTrackerCount(req.userId)
        ]);

        const trackerLimits = {
            free: 1,
            growth: 50,
            scale: 500
        };

        const limit = trackerLimits[subscription.plan_slug] || 1;

        if (activeTrackersCount >= limit) {
            return res.status(403).json({
                error: `Limit Reached: Your ${subscription.plan_slug} plan only allows ${limit} automated tracker(s). Please upgrade to add more.`,
                code: "LIMIT_REACHED"
            });
        }

        const { data, error } = await supabaseApi.supabase
            .from("trackers")
            .insert([{
                user_id: req.userId,
                target_type: type,
                target_value: targetValue,
                schedule,
                targets,
                next_run_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) throw error;
        res.json({ status: "ok", trackerId: data.id });
    } catch (e) {
        console.error("Tracker schedule error:", e);
        res.status(500).json({ error: e.message });
    }
});

app.post("/api/competitor-tracking/status", async (req, res) => {
    try {
        const { trackerId, isActive } = req.body;

        const { error } = await supabaseApi.supabase
            .from("trackers")
            .update({ is_active: isActive })
            .eq("id", trackerId);

        if (error) throw error;
        res.json({ status: "ok" });
    } catch (e) {
        console.error("Tracker status error:", e);
        res.status(500).json({ error: e.message });
    }
});

// ─────────────────────────────────────────
// Agent Management (e.g. Google Maps Sweep)
// ─────────────────────────────────────────

app.post("/api/agents", async (req, res) => {
    try {
        const { name, type, config, schedule } = req.body;

        if (!type || !config) {
            return res.status(400).json({ error: "Type and config are required" });
        }

        // Check active agents count against user's subscription limits
        const [subscription, activeAgentsCount] = await Promise.all([
            supabaseApi.getUserSubscription(req.userId),
            supabaseApi.getActiveAgentsCount(req.userId)
        ]);

        const agentLimits = {
            free: 1,
            growth: 5,
            scale: 10
        };

        const limit = agentLimits[subscription.plan_slug] || 1;

        if (activeAgentsCount >= limit) {
            return res.status(403).json({
                error: `Limit Reached: Your ${subscription.plan_slug} plan only allows ${limit} active automated agent(s). Please upgrade to add more.`,
                code: "LIMIT_REACHED"
            });
        }

        const { data, error } = await supabaseApi.supabase
            .from("agents")
            .insert([{
                user_id: req.userId,
                name: name || `${type.replace(/_/g, ' ')} Agent`,
                type,
                config,
                schedule: schedule || "manual",
                status: "active",
                next_run_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) throw error;
        res.json({ status: "ok", agentId: data.id });
    } catch (e) {
        console.error("Agent creation error:", e);
        res.status(500).json({ error: e.message });
    }
});

app.post("/api/agents/status", async (req, res) => {
    try {
        const { agentId, status } = req.body;

        if (!agentId || !status) {
            return res.status(400).json({ error: "Agent ID and status are required" });
        }

        const { error } = await supabaseApi.supabase
            .from("agents")
            .update({ status })
            .eq("id", agentId)
            .eq("user_id", req.userId);

        if (error) throw error;
        res.json({ status: "ok" });
    } catch (e) {
        console.error("Agent status update error:", e);
        res.status(500).json({ error: e.message });
    }
});

app.delete("/api/agents/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabaseApi.supabase
            .from("agents")
            .delete()
            .eq("id", id)
            .eq("user_id", req.userId);

        if (error) throw error;
        res.json({ status: "ok" });
    } catch (e) {
        console.error("Agent deletion error:", e);
        res.status(500).json({ error: e.message });
    }
});

// ─────────────────────────────────────────
// GET /api/heartbeat
// Called by Convex cron every 10 minutes.
// Fetches due trackers and runs them.
// No auth needed — Render keeps this simple.
// ─────────────────────────────────────────
app.get("/api/heartbeat", async (req, res) => {
    try {
        // This is the "Ping" from Convex. It keeps the server alive and triggers checks.
        await runHeartbeat();
        res.json({ status: "ok", message: "Heartbeat processed" });
    } catch (e) {
        console.error("Heartbeat endpoint error:", e);
        res.status(500).json({ error: e.message });
    }
});

// ─────────────────────────────────────────
// 404 Handler
// ─────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ error: `Path not found: ${req.path}` });
});

// ─────────────────────────────────────────
// Start server
// ─────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`🚀 WarmAudience Intelligence Backend running on port ${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/`);
    console.log(`   Heartbeat: http://localhost:${PORT}/api/heartbeat`);
});
