import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

const crons = cronJobs();

// Poke the backend every 10 minutes to keep Render Free Tier awake
// and trigger the article generation check.
crons.interval(
    "Keep backend alive and check queue",
    { minutes: 10 },
    api.heartbeat.poke
);

export default crons;
