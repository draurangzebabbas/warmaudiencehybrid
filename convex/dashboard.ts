import { v } from "convex/values";
import { query } from "./_generated/server";

/**
 * DEPRECATED: Dashboard statistics have been migrated to Supabase.
 * This file is kept only for legacy compatibility but returns empty data.
 */

export const getStats = query({
    args: {},
    handler: async () => {
        return {
            totalPersonalProfiles: 0,
            totalCompanyProfiles: 0,
            activeTrackers: 0,
            totalProfiles: 0,
        };
    },
});

export const getRecentActivity = query({
    args: {
        limit: v.optional(v.number()),
    },
    handler: async () => {
        return [];
    },
});
