import { v } from "convex/values";
import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { authComponent } from "./auth";
import { PLANS, getPlanFromSlug } from "./plans";

/**
 * Create a new tracker
 */
export const createTracker = mutation({
    args: {
        targetType: v.string(), // "profile" | "keyword"
        targetValue: v.string(), // URL or keyword
        schedule: v.string(), // "daily", "weekly", "monthly"
        targets: v.array(v.string()), // ["commenters", "reactors"]
        userId: v.optional(v.string()),
    },
    handler: async (ctx: MutationCtx, args) => {
        let userId = args.userId;
        if (!userId) {
            const user = await authComponent.getAuthUser(ctx);
            if (!user) throw new Error("Unauthorized");
            userId = user._id;
        }

        // 1. Get Plan
        let planSlug = "free";
        const subscription = await ctx.db
            .query("subscription")
            .withIndex("by_user", (q) => q.eq("userId", userId as any))
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

        // 2. Count active trackers
        const trackers = await ctx.db
            .query("competitorTracking")
            .withIndex("by_user", (q) => q.eq("userId", userId as any))
            .collect();

        const activeTrackers = trackers.filter(t => t.isActive).length;

        if (activeTrackers >= plan.trackersLimit) {
            throw new Error(`Limit Reached: You have reached the maximum number of active trackers for your plan (${plan.trackersLimit}). Please upgrade your plan for more capacity.`);
        }

        // Calculate next execution (immediate)
        const nextExecutionAt = Date.now();

        const trackerId = await ctx.db.insert("competitorTracking", {
            userId: userId as any,
            targetType: args.targetType,
            targetValue: args.targetValue,
            schedule: args.schedule,
            targets: args.targets,
            isActive: true,
            nextExecutionAt,
            createdAt: Date.now(),
        });

        return trackerId;
    },
});

/**
 * Toggle tracker active status
 */
export const toggleStatus = mutation({
    args: { trackerId: v.id("competitorTracking"), isActive: v.boolean(), userId: v.optional(v.string()) },
    handler: async (ctx: MutationCtx, args) => {
        const tracker = await ctx.db.get(args.trackerId);
        if (!tracker) throw new Error("Tracker not found");

        if (!args.userId) {
            const user = await authComponent.getAuthUser(ctx);
            if (!user || tracker.userId !== user._id) throw new Error("Unauthorized");
        } else if (tracker.userId !== args.userId) {
            throw new Error("Unauthorized: User ID mismatch");
        }

        // Limit check if activating
        if (args.isActive && !tracker.isActive) {
            let planSlug = "free";
            const subscription = await ctx.db
                .query("subscription")
                .withIndex("by_user", (q) => q.eq("userId", tracker.userId as any))
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

            const activeTrackers = (await ctx.db
                .query("competitorTracking")
                .withIndex("by_user", (q) => q.eq("userId", tracker.userId as any))
                .collect()).filter(t => t.isActive).length;

            if (activeTrackers >= plan.trackersLimit) {
                throw new Error(`Limit Reached: You have reached the maximum number of active trackers for your plan (${plan.trackersLimit}). Please upgrade your plan for more capacity.`);
            }
        }

        await ctx.db.patch(args.trackerId, { isActive: args.isActive });
    },
});

/**
 * Remove a tracker
 */
export const remove = mutation({
    args: { id: v.id("competitorTracking") },
    handler: async (ctx: MutationCtx, args) => {
        const user = await authComponent.getAuthUser(ctx);
        if (!user) throw new Error("Unauthorized");

        const tracker = await ctx.db.get(args.id);
        if (!tracker || tracker.userId !== user._id) throw new Error("Tracker not found");

        await ctx.db.delete(args.id);
    },
});

/**
 * Get all trackers for the current user (Alias for frontend)
 */
export const list = query({
    args: {},
    handler: async (ctx: QueryCtx) => {
        try {
            const user = await authComponent.getAuthUser(ctx);
            if (!user) return [];

            return await ctx.db
                .query("competitorTracking")
                .withIndex("by_user", (q) => q.eq("userId", user._id))
                .collect();
        } catch (e) {
            console.error("list trackers error:", e);
            return [];
        }
    },
});

/**
 * Internal: Get trackers ready for execution (called by backend heartbeat or cron)
 */
export const getTrackersToExecute = query({
    args: {},
    handler: async (ctx: QueryCtx) => {
        return await ctx.db
            .query("competitorTracking")
            .withIndex("by_active_next_run", (q) => q.eq("isActive", true).lte("nextExecutionAt", Date.now()))
            .collect();
    },
});

/**
 * Update tracker after execution
 */
export const markExecuted = mutation({
    args: {
        trackerId: v.id("competitorTracking"),
    },
    handler: async (ctx: MutationCtx, args) => {
        const tracker = await ctx.db.get(args.trackerId);
        if (!tracker) return;

        let delay = 24 * 60 * 60 * 1000; // default daily
        if (tracker.schedule === "weekly") delay = 7 * 24 * 60 * 60 * 1000;
        if (tracker.schedule === "monthly") delay = 30 * 24 * 60 * 60 * 1000;

        await ctx.db.patch(args.trackerId, {
            lastExecutedAt: Date.now(),
            nextExecutionAt: Date.now() + delay,
        });
    },
});
