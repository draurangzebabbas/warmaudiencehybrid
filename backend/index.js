const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { processJob } = require("./jobProcessor");
const convexApi = require("./convexApi");

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
        const userId = await convexApi.getUserIdFromToken(token);
        req.userId = userId;
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

        // 0. Check Usage Limit
        const usage = await convexApi.getUsage(req.userId);
        if (usage && usage.usage.profiles >= usage.usage.profilesLimit) {
            return res.status(403).json({
                error: `Limit Reached: You have consumed all your profile storage for this month (${usage.usage.profilesLimit} profiles). Please upgrade your plan for more capacity.`,
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

        // 0. Check Usage Limit
        const usage = await convexApi.getUsage(req.userId);
        if (usage && usage.usage.profiles >= usage.usage.profilesLimit) {
            return res.status(403).json({
                error: `Limit Reached: You have consumed all your lead storage for this month (${usage.usage.profilesLimit} leads). Please upgrade your plan for more capacity.`,
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

        // 0. Check Usage Limit
        const usage = await convexApi.getUsage(req.userId);
        if (usage && usage.usage.profiles >= usage.usage.profilesLimit) {
            return res.status(403).json({
                error: `Limit Reached: You have consumed all your profile storage for this month (${usage.usage.profilesLimit} profiles). Please upgrade your plan for more capacity.`,
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

        const trackerId = await convexApi.createTracker(
            req.userId,
            type,
            targetValue,
            schedule,
            targets
        );

        res.json({ status: "ok", trackerId });
    } catch (e) {
        console.error("Tracker schedule error:", e);
        res.status(500).json({ error: e.message });
    }
});

app.post("/api/competitor-tracking/status", async (req, res) => {
    try {
        const { trackerId, isActive } = req.body;

        await convexApi.updateTrackerStatus(req.userId, trackerId, isActive);

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
        console.log("💓 Heartbeat received. Checking for scheduled trackers...");

        const trackers = await convexApi.getTrackersToExecute();
        console.log(`📡 Found ${trackers.length} tracker(s) due for execution`);

        // Process each tracker in background (fire-and-forget)
        for (const tracker of trackers) {
            const input = {};

            if (tracker.targetType === "profile") {
                // Scrape posts from the tracked profile -> extract engagers
                input.trackingUrl = tracker.targetValue;
                input.engagementTypes = tracker.targets; // ["commenters", "reactors"]
                input.schedule = tracker.schedule;       // "daily" | "weekly" | "monthly"
            } else if (tracker.targetType === "keyword") {
                input.keywords = [tracker.targetValue];
                input.schedule = tracker.schedule;
            }

            // Generate automatic tracker tag
            const trackerTag = tracker.targetType === "profile"
                ? `tracked by profile: ${tracker.targetValue.split('/').filter(Boolean).pop()}`
                : `tracked by keyword: ${tracker.targetValue}`;

            processJob({
                userId: tracker.userId,
                trackerId: tracker._id,
                type: "scheduled_tracking",
                input: { ...input, tags: [trackerTag] },
            })
                .then(() => convexApi.markTrackerExecuted(tracker._id))
                .catch((err) => console.error(`❌ Tracker ${tracker._id} failed:`, err));
        }

        res.json({
            status: "ok",
            trackersFound: trackers.length,
            message: trackers.length > 0
                ? `Processing ${trackers.length} tracker(s) in background`
                : "No trackers due for execution",
        });
    } catch (e) {
        console.error("Heartbeat error:", e);
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
