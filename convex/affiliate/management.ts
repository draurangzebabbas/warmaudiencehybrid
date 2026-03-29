import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Helper to generate a random code
function generateCode(length: number = 6): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export const createAffiliate = mutation({
    args: { userId: v.string(), email: v.string() },
    handler: async (ctx, { userId, email }) => {
        // Check if affiliate already exists
        const existing = await ctx.db
            .query("profiles")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();

        if (existing) return existing._id;

        let code = "";
        let isUnique = false;
        let attempts = 0;

        while (!isUnique && attempts < 10) {
            code = generateCode();
            const existingCode = await ctx.db
                .query("profiles")
                .withIndex("by_code", (q) => q.eq("referralCode", code))
                .first();

            if (!existingCode) isUnique = true;
            attempts++;
        }

        if (!isUnique) throw new Error("Could not generate code");

        const affiliateId = await ctx.db.insert("profiles", {
            userId,
            referralCode: code,
            totalClicks: 0,
            totalSignups: 0,
            totalConversions: 0,
            totalEarnings: 0,
            availableBalance: 0,
            createdAt: Date.now(),
        });

        return affiliateId;
    },
});

export const getAffiliateByUserId = query({
    args: { userId: v.optional(v.string()) },
    handler: async (ctx, { userId }) => {
        if (!userId) return null;

        return await ctx.db
            .query("profiles")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();
    },
});

export const getAffiliateByCode = query({
    args: { code: v.string() },
    handler: async (ctx, { code }) => {
        return await ctx.db
            .query("profiles")
            .withIndex("by_code", (q) => q.eq("referralCode", code))
            .first();
    },
});

export const getAllAffiliates = query({
    args: {
        paginationOpts: v.any(), // pagination options
    },
    handler: async (ctx, { paginationOpts }) => {
        return await ctx.db
            .query("profiles")
            .order("desc")
            .paginate(paginationOpts);
    },
});

export const getAdminStats = query({
    handler: async (ctx) => {
        const affiliates = await ctx.db.query("profiles").take(1000);
        const totalAffiliates = affiliates.length;
        const totalEarnings = affiliates.reduce((sum, a) => sum + a.totalEarnings, 0);
        const totalPaid = affiliates.reduce((sum, a) => sum + (a.totalEarnings - a.availableBalance), 0);

        return {
            totalAffiliates,
            totalEarnings,
            totalPaid
        };
    },
});

export const updatePayoutSettings = mutation({
    args: {
        affiliateId: v.id("profiles"),
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
        wiseRecipientId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { affiliateId, ...settings } = args;
        await ctx.db.patch(affiliateId, settings);
    },
});
