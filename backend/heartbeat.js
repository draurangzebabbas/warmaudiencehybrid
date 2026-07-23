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
    
    // 1. Ensure background poller is running as fallback
    if (!pollerStarted) {
        startTrackerPoller();
        startAgentPoller();
    }

    // 2. Cleanup any orphaned/stuck jobs
    await supabaseApi.cleanupStuckJobs();

    // 3. Immediate check for due trackers
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

async function checkAndEnforcePlanLimit(userId, entityId, entityType) {
    try {
        const subscription = await supabaseApi.getUserSubscription(userId);
        const currentCount = await supabaseApi.getMonthlyLeadCount(userId);
        
        const planLimits = {
            free: 1000,
            growth: 10000,
            pro: 10000,
            elite: 1000000,
            scale: 1000000
        };
        const profilesLimit = planLimits[subscription?.plan_slug] || 1000;
        
        if (currentCount >= profilesLimit) {
            console.warn(`🛑 Limit Reached for user ${userId}. Pausing ${entityType} ${entityId}...`);
            if (entityType === "agent") {
                await supabaseApi.supabase.from("agents").update({ status: "paused" }).eq("id", entityId);
            } else if (entityType === "tracker") {
                await supabaseApi.supabase.from("trackers").update({ is_active: false }).eq("id", entityId);
            }
            return false; // Cannot proceed
        }
        return true; // Can proceed
    } catch (err) {
        console.error(`❌ Error checking limits for ${entityType} ${entityId}:`, err.message);
        return true; // Proceed if limit check fails, to prevent sticking
    }
}

async function executeTracker(tracker) {
    console.log(`📡 Executing Tracker: ${tracker.target_value} (${tracker.schedule})`);
    
    const canProceed = await checkAndEnforcePlanLimit(tracker.user_id, tracker.id, "tracker");
    if (!canProceed) return;
    
    // CRITICAL: Mark as executed IMMEDIATELY to prevent double runs from poller vs heartbeat
    // This updates next_run_at so the next query won't pick it up.
    try {
        await supabaseApi.markTrackerExecuted(tracker.id, tracker.schedule);
    } catch (err) {
        console.error(`❌ Failed to mark tracker ${tracker.id} as running:`, err.message);
        return; // Don't proceed if we can't lock it
    }

    const jobData = {
        userId: tracker.user_id,
        type: "scheduled_tracking", // Correctly route to LinkedIn tracking logic
        input: {
            trackingUrl: tracker.target_type === "profile" ? tracker.target_value : undefined,
            keywords: tracker.target_type === "keyword" ? [tracker.target_value] : undefined,
            engagementTypes: tracker.targets || ["commenters", "reactors"],
            schedule: tracker.schedule || "daily",
            tags: ["Automated"]
        }
    };

    try {
        await processJob(jobData);
    } catch (err) {
        console.error(`❌ Tracker failed [${tracker.id}]:`, err.message);
    }
}

let agentPollerStarted = false;

function startAgentPoller() {
    if (agentPollerStarted) return;
    agentPollerStarted = true;
    
    console.log("🕒 Agent Poller: Started (1-minute precision)");
    
    setInterval(async () => {
        try {
            const dueAgents = await supabaseApi.getDueAgents();
            
            if (dueAgents && dueAgents.length > 0) {
                console.log(`🤖 Poller: Found ${dueAgents.length} agents due!`);
                
                for (const agent of dueAgents) {
                    await executeAgent(agent);
                }
            }
        } catch (err) {
            console.error("❌ Agent Poller Error:", err.message);
        }
    }, 60 * 1000); // Every 60 seconds
}

async function executeAgent(agent) {
    console.log(`📡 Executing Agent: ${agent.name} (${agent.type})`);
    
    const canProceed = await checkAndEnforcePlanLimit(agent.user_id, agent.id, "agent");
    if (!canProceed) return;
    
    // We only process one city per minute.
    const config = agent.config || {};
    const locations = config.locations || []; // e.g. ["US, NY, New York"]
    const currentIndex = config.currentIndex || 0;

    if (currentIndex >= locations.length) {
        console.log(`✅ Agent ${agent.id} completed all locations.`);
        await supabaseApi.supabase.from("agents").update({ status: "completed" }).eq("id", agent.id);
        return;
    }

    const currentLocation = locations[currentIndex];
    
    // Next run in 1 minute
    const nextRun = new Date(Date.now() + 60 * 1000).toISOString();
    
    try {
        await supabaseApi.markAgentExecuted(agent.id, nextRun);
        // Update current index for the next run
        await supabaseApi.supabase.from("agents").update({
            config: { ...config, currentIndex: currentIndex + 1 }
        }).eq("id", agent.id);
    } catch (err) {
        console.error(`❌ Failed to mark agent ${agent.id} as running:`, err.message);
        return; // Don't proceed if we can't lock it
    }

    const jobData = {
        userId: agent.user_id,
        type: agent.type,
        input: {
            ...config,
            searchStringsArray: config.searchStringsArray || (config.keyword ? [config.keyword] : []),
            locationQuery: currentLocation,
            tags: [...(config.tags || []), `Agent-${agent.name}`]
        }
    };

    try {
        await processJob(jobData);
    } catch (err) {
        console.error(`❌ Agent failed [${agent.id}]:`, err.message);
    }
}

module.exports = { runHeartbeat, startTrackerPoller, startAgentPoller };
