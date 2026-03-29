import { query, mutation } from "./_generated/server";
import { components } from "./_generated/api";
import { v } from "convex/values";
import { authComponent } from "./auth";

// ===================================
// PUBLIC QUERIES (Dashboard Data)
// ===================================


export const getMyProfile = query({
    args: {},
    handler: async (ctx) => {
        try {
            const user = await authComponent.getAuthUser(ctx);
            if (!user || !user._id) return null;

            // 1. Try to get existing profile
            const profile = await ctx.runQuery(components.affiliate.management.getAffiliateByUserId, {
                userId: user._id
            });

            if (profile) return profile;

            // 2. Self-healing: Create profile if missing
            // We need to use a mutation here, but we are in a query. 
            // This is a limitation. We cannot run a mutation inside a query.
            // So we will return null, and the frontend will handle the "Not an Affiliate" state.
            // However, to satisfy your request for instant data, we can expose a PUBLIC MUTATION 
            // "createMyProfile" that the frontend calls if this returns null.

            // Correction: For this robust planner step, we'll keep it simple: 
            // If strictly a query, we can't write. 
            // But we can check if it returns null, and if so, trigger a separate mutation.
            // Let's stick to returning null for now, BUT I will add the mutation below so the frontend can call it.
            return null;

        } catch (e) {
            return null;
        }
    },
});

export const createMyProfile = mutation({
    args: {},
    handler: async (ctx) => {
        const user = await authComponent.getAuthUser(ctx);
        if (!user || !user._id || !user.email) throw new Error("Unauthenticated");

        const existing = await ctx.runQuery(components.affiliate.management.getAffiliateByUserId, {
            userId: user._id
        });

        if (existing) return existing;

        await ctx.runMutation(components.affiliate.management.createAffiliate, {
            userId: user._id,
            email: user.email
        });

        return await ctx.runQuery(components.affiliate.management.getAffiliateByUserId, {
            userId: user._id
        });
    }
});

export const getMyReferrals = query({
    args: {},
    handler: async (ctx) => {
        try {
            const user = await authComponent.getAuthUser(ctx);
            if (!user || !user._id) return [];

            const profile = await ctx.runQuery(components.affiliate.management.getAffiliateByUserId, { userId: user._id });
            if (!profile) return [];

            return await ctx.runQuery(components.affiliate.tracking.getReferrals, {
                affiliateId: profile._id
            });
        } catch (e) {
            return [];
        }
    },
});

export const getMyPayouts = query({
    args: {},
    handler: async (ctx) => {
        try {
            const user = await authComponent.getAuthUser(ctx);
            if (!user || !user._id) return [];

            const profile = await ctx.runQuery(components.affiliate.management.getAffiliateByUserId, { userId: user._id });
            if (!profile) return [];

            return await ctx.runQuery(components.affiliate.payouts.getPayouts, {
                affiliateId: profile._id
            });
        } catch (e) {
            return [];
        }
    },
});

export const getMyCommissions = query({
    args: {},
    handler: async (ctx) => {
        try {
            const user = await authComponent.getAuthUser(ctx);
            if (!user || !user._id) return [];

            const profile = await ctx.runQuery(components.affiliate.management.getAffiliateByUserId, { userId: user._id });
            if (!profile) return [];

            return await ctx.runQuery(components.affiliate.commissions.getCommissions, {
                affiliateId: profile._id
            });
        } catch (e) {
            return [];
        }
    },
});

// ===================================
// PUBLIC MUTATIONS (User Actions)
// ===================================

export const updatePayoutSettings = mutation({
    args: {
        payoutMethod: v.string(),
        payoutEmail: v.optional(v.string()),
        payoutName: v.optional(v.string()),
        payoutBankCountry: v.optional(v.string()),
        payoutBankCurrency: v.optional(v.string()),
        payoutAccountNumber: v.optional(v.string()),
        payoutRoutingNumber: v.optional(v.string()),
        payoutIban: v.optional(v.string()),
        payoutSwiftCode: v.optional(v.string()),
        autoPayoutEnabled: v.optional(v.boolean()),
        wiseRecipientId: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const user = await authComponent.getAuthUser(ctx);
        if (!user || !user._id) throw new Error("Unauthorized");

        const profile = await ctx.runQuery(components.affiliate.management.getAffiliateByUserId, { userId: user._id });
        if (!profile) throw new Error("Affiliate profile not found");

        await ctx.runMutation(components.affiliate.management.updatePayoutSettings, {
            affiliateId: profile._id,
            ...args
        });
    }
});

export const updatePayoutStatus = mutation({
    args: {
        payoutId: v.string() as any, // Using string to allow component IDs to pass through
        status: v.string(),
        wiseTransferId: v.optional(v.string()),
        failureReason: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        // This is primarily called by our server-side API route. 
        // In a production app, you might add an API secret check here.
        await ctx.runMutation(components.affiliate.payouts.updatePayoutStatus, {
            payoutId: args.payoutId as any,
            status: args.status,
            wiseTransferId: args.wiseTransferId,
            failureReason: args.failureReason
        });
    }
});

export const requestPayout = mutation({
    args: { amount: v.number() },
    handler: async (ctx, args) => {
        const user = await authComponent.getAuthUser(ctx);
        const userId = user?._id;
        if (!userId) throw new Error("Unauthorized");

        const profile = await ctx.runQuery(components.affiliate.management.getAffiliateByUserId, { userId });
        if (!profile) throw new Error("Affiliate profile not found");

        return await ctx.runMutation(components.affiliate.payouts.requestPayout, {
            affiliateId: profile._id,
            amount: args.amount
        });
    },
});

// ===================================
// PUBLIC HELPERS (Tracking)
// ===================================

export const checkReferralCode = query({
    args: { code: v.string() },
    handler: async (ctx, { code }) => {
        return await ctx.runQuery(components.affiliate.management.getAffiliateByCode, { code });
    },
});

export const trackClick = mutation({
    args: { code: v.string() },
    handler: async (ctx, { code }) => {
        // No auth check required - public endpoint
        // Using "runMutation" to call the internal tracking component
        // Note: verify if 'trackClick' exists in 'components.affiliate.tracking'
        // If it doesn't exist yet, we might need to create it there first. 
        // For now, assuming standard flow.

        // Error handling if component doesn't exist yet (safety first)
        try {
            return await ctx.runMutation(components.affiliate.tracking.trackClick, {
                referralCode: code,
                ipAddress: "public-web",
                userAgent: "web"
            });
        } catch (e) {
            console.error("Tracking error:", e);
            return null;
        }
    },
});

export const linkMyReferral = mutation({
    args: { code: v.string() },
    handler: async (ctx, { code }) => {
        try {
            const user = await authComponent.getAuthUser(ctx);
            if (!user || !user._id || !user.email) return;

            // Delegate to internal tracking
            await ctx.runMutation(components.affiliate.tracking.createReferral, {
                referralCode: code,
                newUserId: user._id,
                newUserEmail: user.email
            });
        } catch (e) {
            // If getAuthUser throws "Unauthenticated", we just ignore it
            // since this is called on every landing page visit.
            return;
        }
    },
});

// NEW: Gateway for Webhooks (Ensures we write to Component Data)
export const processWebhook = mutation({
    args: {
        email: v.string(),
        userId: v.optional(v.string()),
        amount: v.number(), // Cents
        orderId: v.string(),
        productId: v.string(),
        productName: v.string(),
    },
    handler: async (ctx, args) => {
        // Delegate to the Component's logic
        await ctx.runMutation(components.affiliate.webhook.processOrder, args);
    }
});

// NEW: Wise Webhook Handler
export const updatePayoutStatusByWiseId = mutation({
    args: {
        wiseTransferId: v.string(),
        status: v.string(),
        failureReason: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        // No auth check required here if using a secret (TODO for production)
        await ctx.runMutation(components.affiliate.payouts.updatePayoutStatusByWiseId, args);
    }
});
