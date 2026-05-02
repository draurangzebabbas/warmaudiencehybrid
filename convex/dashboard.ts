import { v } from "convex/values";
import { query, QueryCtx } from "./_generated/server";
import { authComponent } from "./auth";

/**
 * Get dashboard statistics for the current user (LinkedLead) - MIGRATED TO SUPABASE
 */
export const getStats = query({
    args: {},
    handler: async (ctx: QueryCtx) => {
        return {
            totalPersonalProfiles: 0,
            totalCompanyProfiles: 0,
            activeTrackers: 0,
            totalProfiles: 0,
        };
    },
});

/**
 * Get recent activity for the dashboard - MIGRATED TO SUPABASE
 */
export const getRecentActivity = query({
    args: {
        limit: v.optional(v.number()),
    },
    handler: async (ctx: QueryCtx, args) => {
        return [];
    },
});
