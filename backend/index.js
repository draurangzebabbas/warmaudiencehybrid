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

// ─────────────────────────────────────────
// Auth Middleware (Bearer token via Convex)
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
        const result = await supabaseApi.validateWebhookKey(token);
        if (!result || !result.isValid) {
            throw new Error("Invalid API Key");
        }
        req.userId = result.userId;
        next();
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
        const { urls, profileUrls, companyUrls: rawCompanyUrls, tags = [] } = req.body;
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
// POST /api/scrape-engagers
// Extract profiles from post commenters/reactors
// ─────────────────────────────────────────
app.post("/api/scrape-engagers", async (req, res) => {
    try {
        const { postUrls, commenters = true, reactors = true, tags = [] } = req.body;

        if (!postUrls || !Array.isArray(postUrls) || postUrls.length === 0) {
            return res.status(400).json({ error: "postUrls array is required" });
        }

        const engagementTypes = [];
        if (commenters) engagementTypes.push("commenters");
        if (reactors) engagementTypes.push("reactors");

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
            input: { postUrls, engagementTypes, tags },
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
// Start server
// ─────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`🚀 WarmAudience Intelligence Backend running on port ${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/`);
    console.log(`   Heartbeat: http://localhost:${PORT}/api/heartbeat`);
});
