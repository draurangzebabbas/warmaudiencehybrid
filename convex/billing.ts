import { v } from "convex/values";
import { query, QueryCtx } from "./_generated/server";
import { authComponent } from "./auth";
import { PLANS, getPlanFromSlug } from "./plans";

/**
 * Get plan limits and current usage for a user.
 * Called by the backend to verify if a user can start a scrape or create a tracker.
 */
export const getPlanLimits = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        // 1. Get Plan
        let planSlug = "free";
        const subscription = await ctx.db
            .query("subscription")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .filter(q => q.or(
                q.eq(q.field("status"), "active"),
                q.eq(q.field("status"), "trialing")
            ))
            .first();

        if (subscription) {
            planSlug = subscription.planSlug || "free";
        }

        const planKey = getPlanFromSlug(planSlug);
        const plan = PLANS[planKey];

        // 2. Count current month profiles - MIGRATED TO SUPABASE
        const profilesCount = 0; // TODO: Fetch from Supabase via backend if needed


        return {
            planName: plan.name,
            profilesLimit: plan.profilesLimit,
            profilesUsed: profilesCount,
            trackersLimit: plan.trackersLimit,
            canAddProfile: profilesCount < plan.profilesLimit
        };
    }
});
