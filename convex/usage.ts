import { query, mutation, QueryCtx } from "./_generated/server";
import { authComponent } from "./auth";
import { PLANS, getPlanFromSlug } from "./plans";
import { v } from "convex/values";

/**
 * Ensure a user has a subscription record (Self-Heal)
 */
export const ensureSubscription = mutation({
    args: {},
    handler: async (ctx) => {
        const user = await authComponent.getAuthUser(ctx).catch(() => null);
        if (!user) return;

        const existing = await ctx.db
            .query("subscription")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .first();

        if (!existing) {
            await ctx.db.insert("subscription", {
                userId: user._id,
                email: user.email!.toLowerCase().trim(),
                polarId: "initial_free",
                status: "active",
                planSlug: "free",
            });
        }
    }
});

/**
 * Get usage stats for the current user
 */
async function calculateUsage(ctx: QueryCtx, userId: any) {
    // 1. Get Plan
    let planSlug = "free";
    const subscription = await ctx.db
        .query("subscription")
        .withIndex("by_user", (q) => q.eq("userId", userId))
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

    // 2. Count profiles saved this month - MIGRATED TO SUPABASE
    const profilesCount = 0; // TODO: Fetch from Supabase via backend if needed

    // 3. Count active trackers - MIGRATED TO SUPABASE
    const activeTrackers = 0; // TODO: Fetch from Supabase via backend if needed

    return {
        plan: plan,
        usage: {
            profiles: profilesCount,
            profilesLimit: plan.profilesLimit,
            trackers: activeTrackers,
            trackersLimit: plan.trackersLimit,
        }
    };

}

/**
 * Get usage stats for the current user
 */
export const getUsage = query({
    args: {},
    handler: async (ctx) => {
        try {
            const user = await authComponent.getAuthUser(ctx).catch(() => null);
            if (!user) {
                return {
                    plan: PLANS.FREE,
                    usage: {
                        profiles: 0,
                        profilesLimit: PLANS.FREE.profilesLimit,
                        trackers: 0,
                        trackersLimit: PLANS.FREE.trackersLimit
                    }
                };
            }
            return await calculateUsage(ctx, user._id);
        } catch (e) {
            console.error("Usage Error:", e);
            return null;
        }
    },
});

/**
 * Get usage stats by userId (Internal)
 */
export const getUsageInternal = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        return await calculateUsage(ctx, args.userId as any);
    },
});

/**
 * Internal usage check for backend
 */
export const getInternalUsage = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
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

        return { planSlug, isPaid: planSlug !== "free" };
    },
});
