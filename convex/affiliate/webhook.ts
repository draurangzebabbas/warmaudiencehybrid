import { mutation } from "./_generated/server";
import { v } from "convex/values";

// This mutation is called by the Next.js API route.
// It is protected by the Polar Webhook Signature verification in the API route.
export const processOrder = mutation({
    args: {
        email: v.string(),
        userId: v.optional(v.string()), // Added for more robust lookup
        amount: v.number(), // Amount in cents
        orderId: v.string(),
        productId: v.string(),
        productName: v.string(),
    },
    handler: async (ctx, { email, userId, amount, orderId, productId, productName }) => {
        // 1. Find the referral (Try userId first, then email)
        let referral = null;
        if (userId) {
            referral = await ctx.db
                .query("referrals")
                .withIndex("by_user", (q) => q.eq("referredUserId", userId))
                .first();
        }

        if (!referral) {
            const normalizedEmail = email.toLowerCase();
            referral = await ctx.db
                .query("referrals")
                .withIndex("by_email", (q) => q.eq("referredUserEmail", normalizedEmail))
                .first();
        }

        if (!referral) {
            console.log(`[Affiliate] No referral found for email: ${email}`);
            return;
        }

        // 2. Prevent duplicate commissions for the same order
        const existingCommission = await ctx.db
            .query("commissions")
            .withIndex("by_order", (q) => q.eq("orderId", orderId))
            .first();

        if (existingCommission) {
            console.log(`[Affiliate] Commission already exists for order: ${orderId}`);
            return;
        }

        // 3. Get Affiliate Profile
        const affiliate = await ctx.db.get(referral.affiliateId);
        if (!affiliate) return;

        // 4. Calculate Commission
        // Default rate is 30% (0.30). We can pull this from logic or env if stored.
        // For now, hardcoding 30% or pulling from a future config specific to affiliate if custom.
        const COMMISSION_RATE = 0.30;
        const amountUsd = amount / 100; // Convert cents to USD
        const commissionAmount = Number((amountUsd * COMMISSION_RATE).toFixed(2));

        console.log(`[Affiliate] Processing commission: Order $${amountUsd} -> Comm $${commissionAmount} for ${affiliate.referralCode}`);

        // 5. Update Database works

        // A. Create Commission Record
        await ctx.db.insert("commissions", {
            affiliateId: referral.affiliateId,
            referralId: referral._id,
            orderId: orderId,
            orderAmount: amountUsd,
            commissionRate: COMMISSION_RATE * 100, // Store as percentage link 30
            commissionAmount: commissionAmount,
            createdAt: Date.now(),
            status: "pending", // Pending until payout or refund period? For now, we can make it available immediately or "approved". Let's say "approved" for simplicity, or "pending" if we hold it.
            // Let's go with "approved" effectively adding to balance immediately.
        });

        // B. Update Referral Status
        await ctx.db.patch(referral._id, {
            status: "paid",
            plan: productName,
            conversionDate: Date.now(),
        });

        // C. Update Affiliate Balances
        await ctx.db.patch(affiliate._id, {
            totalConversions: affiliate.totalConversions + 1,
            totalEarnings: affiliate.totalEarnings + commissionAmount,
            availableBalance: affiliate.availableBalance + commissionAmount,
        });
    },
});
