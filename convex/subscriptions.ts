import { mutation, internalMutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Internal query to fetch subscription for a specific user ID.
 */
export const getSubscriptionInternal = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("subscription")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .first();
    }
});

/**
 * Mutation to update or create a subscription record.
 * This is called by Polar webhooks or the sync action.
 */
export const updateSubscription = mutation({
    args: {
        email: v.string(),
        polarId: v.string(),
        status: v.string(),
        planSlug: v.string(),
        currentPeriodStart: v.optional(v.number()),
        currentPeriodEnd: v.optional(v.number()),
        cancelAtPeriodEnd: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const email = args.email.toLowerCase().trim();

        // 1. Check for existing subscription by email (Source of Truth)
        let existing = await ctx.db
            .query("subscription")
            .withIndex("by_email", q => q.eq("email", email))
            .first();

        // If not found by email, try identifying by userId if we could, 
        // but for webhooks we usually only have email.
        if (!existing) {
            console.warn(`[Subscription] No existing record for email: ${email}. Webhook arrived before user initialization.`);
            return;
        }

        const data = {
            polarId: args.polarId,
            status: args.status,
            planSlug: args.planSlug,
            currentPeriodStart: args.currentPeriodStart || existing.currentPeriodStart,
            currentPeriodEnd: args.currentPeriodEnd || existing.currentPeriodEnd,
            cancelAtPeriodEnd: args.cancelAtPeriodEnd ?? existing.cancelAtPeriodEnd,
        };

        await ctx.db.patch(existing._id, data);
        console.log(`✅ [Subscription] Updated for ${email} -> ${args.planSlug} (${args.status})`);
    }
});

/**
 * Internal mutation called ONLY during signup events in auth.ts
 * Ensures a 'free' plan record exists immediately with the correct email/userId link.
 */
export const createInitialSubscriptionRecord = internalMutation({
    args: { userId: v.string(), email: v.string() },
    handler: async (ctx, args) => {
        const email = args.email.toLowerCase().trim();
        const existing = await ctx.db
            .query("subscription")
            .withIndex("by_user", q => q.eq("userId", args.userId))
            .first();

        if (existing) {
            if (!existing.email) await ctx.db.patch(existing._id, { email });
            return;
        }

        await ctx.db.insert("subscription", {
            userId: args.userId,
            email: email,
            polarId: "initial_free",
            status: "active",
            planSlug: "free",
        });
        console.log(`✅ [Initial] Created Free subscription for new user ${args.userId} (${email})`);
    }
});
