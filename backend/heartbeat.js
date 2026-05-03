const supabaseApi = require("./supabaseApi");
const { processJob } = require("./jobProcessor");
let pollerStarted = false;

/**
 * The Heartbeat runs every 10 minutes (triggered by Convex).
 * Now migrated to Supabase Cron (running every 1 minute).
 * 1. It keeps Render alive.
 * 2. It triggers an immediate tracker check.
 * 3. It ensures the internal 1-minute poller is running as a fallback.
 */
async function runHeartbeat() {
    console.log("💓 Heartbeat: Ping received. Checking trackers...");
    
    // 1. Immediate check for due trackers
    try {
        const dueTrackers = await supabaseApi.getDueTrackers();
        if (dueTrackers && dueTrackers.length > 0) {
            console.log(`🤖 Heartbeat: Found ${dueTrackers.length} due trackers!`);
            for (const tracker of dueTrackers) {
                await executeTracker(tracker);
            }
        }
    } catch (err) {
        console.error("❌ Heartbeat Check Error:", err.message);
    }

    // 2. Ensure background poller is running as fallback
    if (!pollerStarted) {
        startTrackerPoller();
    }
}

/**
 * Check for due trackers every 1 minute.
 * This runs as long as the server is awake.
 */
function startTrackerPoller() {
    if (pollerStarted) return;
    pollerStarted = true;
    
    console.log("🕒 Tracker Poller: Started (1-minute precision)");
    
    setInterval(async () => {
        try {
            const dueTrackers = await supabaseApi.getDueTrackers();
            
            if (dueTrackers && dueTrackers.length > 0) {
                console.log(`🤖 Poller: Found ${dueTrackers.length} trackers due!`);
                
                for (const tracker of dueTrackers) {
                    await executeTracker(tracker);
                }
            }
        } catch (err) {
            console.error("❌ Poller Error:", err.message);
        }
    }, 60 * 1000); // Every 60 seconds
}

async function executeTracker(tracker) {
    console.log(`📡 Executing Tracker: ${tracker.target_value} (${tracker.schedule})`);
    
    const jobData = {
        userId: tracker.user_id,
        type: tracker.target_type === "profile" ? "engagement_scrape" : "google_maps",
        input: {
            postUrls: tracker.target_type === "profile" ? [tracker.target_value] : undefined,
            searchStringsArray: tracker.target_type === "keyword" ? [tracker.target_value] : undefined,
            engagementTypes: tracker.targets,
            tags: ["Automated"]
        }
    };

    try {
        await processJob(jobData);
        await supabaseApi.markTrackerExecuted(tracker.id, tracker.schedule);
    } catch (err) {
        console.error(`❌ Tracker failed [${tracker.id}]:`, err.message);
    }
}

module.exports = { runHeartbeat, startTrackerPoller };
