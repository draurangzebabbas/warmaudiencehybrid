import { v } from "convex/values";
import { query } from "./_generated/server";

export const getCommissions = query({
    args: { affiliateId: v.id("profiles") },
    handler: async (ctx, { affiliateId }) => {
        return await ctx.db
            .query("commissions")
            .withIndex("by_affiliate", (q) => q.eq("affiliateId", affiliateId))
            .order("desc")
            .take(100);
    },
});

export const getRecentCommissions = query({
    args: { limit: v.optional(v.number()) },
    handler: async (ctx, { limit = 10 }) => {
        return await ctx.db.query("commissions").order("desc").take(limit);
    },
});
