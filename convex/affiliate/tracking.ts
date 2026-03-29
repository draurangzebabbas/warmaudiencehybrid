import { v } from "convex/values";
import { query, mutation, internalMutation, internalQuery } from "./_generated/server";

// Track a click on a referral link
export const trackClick = mutation({
    args: {
        referralCode: v.string(),
        ipAddress: v.optional(v.string()),
        country: v.optional(v.string()),
        userAgent: v.optional(v.string())
    },
    handler: async (ctx, { referralCode, ipAddress, country, userAgent }) => {
        const affiliate = await ctx.db
            .query("profiles")
            .withIndex("by_code", (q) => q.eq("referralCode", referralCode))
            .first();

        if (!affiliate) return;

        await ctx.db.insert("clicks", {
            affiliateId: affiliate._id,
            referralCode,
            clickedAt: Date.now(),
            ipAddress,
            country,
            userAgent,
            converted: false,
        });

        await ctx.db.patch(affiliate._id, {
            totalClicks: affiliate.totalClicks + 1,
        });
    },
});

// Create a referral when a user signs up
export const createReferral = mutation({
    args: {
        referralCode: v.string(),
        newUserId: v.string(),
        newUserEmail: v.string(),
    },
    handler: async (ctx, { referralCode, newUserId, newUserEmail }) => {
        const affiliate = await ctx.db
            .query("profiles")
            .withIndex("by_code", (q) => q.eq("referralCode", referralCode))
            .first();

        if (!affiliate) return;
        if (affiliate.userId === newUserId) return;

        const existing = await ctx.db
            .query("referrals")
            .withIndex("by_user", (q) => q.eq("referredUserId", newUserId))
            .first();

        if (existing) return;

        await ctx.db.insert("referrals", {
            affiliateId: affiliate._id,
            referredUserId: newUserId,
            referredUserEmail: newUserEmail.toLowerCase(),
            signupDate: Date.now(),
            status: "free",
        });

        await ctx.db.patch(affiliate._id, {
            totalSignups: affiliate.totalSignups + 1,
        });
    },
});

export const getReferrals = query({
    args: { affiliateId: v.id("profiles") },
    handler: async (ctx, { affiliateId }) => {
        return await ctx.db
            .query("referrals")
            .withIndex("by_affiliate", (q) => q.eq("affiliateId", affiliateId))
            .order("desc")
            .take(100);
    },
});
