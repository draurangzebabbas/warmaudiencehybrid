import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const requestPayout = mutation({
    args: {
        affiliateId: v.id("profiles"),
        amount: v.number(),
    },
    handler: async (ctx, { affiliateId, amount }) => {
        const affiliate = await ctx.db.get(affiliateId);
        if (!affiliate) throw new Error("Affiliate not found");

        if (affiliate.availableBalance < amount) {
            throw new Error("Insufficient balance");
        }

        if (!affiliate.payoutMethod) {
            throw new Error("Payout method not configured");
        }

        await ctx.db.patch(affiliateId, {
            availableBalance: affiliate.availableBalance - amount,
        });

        const bankDetails = affiliate.payoutMethod === "wise_bank" ? {
            country: affiliate.payoutBankCountry,
            currency: affiliate.payoutBankCurrency,
            accountNumber: affiliate.payoutAccountNumber,
            routingNumber: affiliate.payoutRoutingNumber,
            iban: affiliate.payoutIban,
            swiftCode: affiliate.payoutSwiftCode,
        } : undefined;

        const payoutId = await ctx.db.insert("payouts", {
            affiliateId,
            amount,
            method: affiliate.payoutMethod,
            status: "pending",
            recipientEmail: affiliate.payoutEmail,
            recipientName: affiliate.payoutName || "Affiliate",
            bankDetails,
            requestedAt: Date.now(),
        });

        return payoutId;
    },
});

export const getPayouts = query({
    args: { affiliateId: v.id("profiles") },
    handler: async (ctx, { affiliateId }) => {
        return await ctx.db
            .query("payouts")
            .withIndex("by_affiliate", (q) => q.eq("affiliateId", affiliateId))
            .order("desc")
            .take(50);
    },
});

export const updatePayoutStatus = mutation({
    args: {
        payoutId: v.id("payouts"),
        status: v.string(),
        wiseTransferId: v.optional(v.string()),
        failureReason: v.optional(v.string())
    },
    handler: async (ctx, { payoutId, status, wiseTransferId, failureReason }) => {
        const payout = await ctx.db.get(payoutId);
        if (!payout) throw new Error("Payout not found");

        const changes: any = { status };
        if (wiseTransferId) changes.wiseTransferId = wiseTransferId;
        if (failureReason) changes.failureReason = failureReason;
        if (status === "completed") changes.completedAt = Date.now();

        await ctx.db.patch(payoutId, changes);

        if (status === "failed") {
            const affiliate = await ctx.db.get(payout.affiliateId);
            if (affiliate) {
                await ctx.db.patch(payout.affiliateId, {
                    availableBalance: affiliate.availableBalance + payout.amount
                });
            }
        }
    },
});

export const updatePayoutStatusByWiseId = mutation({
    args: {
        wiseTransferId: v.string(),
        status: v.string(),
        failureReason: v.optional(v.string())
    },
    handler: async (ctx, { wiseTransferId, status, failureReason }) => {
        // Since we don't have an index on wiseTransferId yet, we scan. 
        // In valid prod usage with low volume, this is fine. 
        // Ideally add .index("by_wise_id", ["wiseTransferId"]) to schema.

        const payout = await ctx.db
            .query("payouts")
            .withIndex("by_wise_transfer_id", (q) => q.eq("wiseTransferId", wiseTransferId))
            .first();

        if (!payout) {
            throw new Error(`Payout record not found in database for Wise Transfer ID: ${wiseTransferId}. Ensure the transfer ID was correctly saved during payout initiation.`);
        }

        if (payout.status === status) return; // No change

        // Monotonic Safety: Never allow regression from terminal states
        if (payout.status === "completed" || payout.status === "failed") {
            console.log(`⚠️ Payout ${payout._id} is already ${payout.status}. Ignoring update to ${status}.`);
            return;
        }

        const changes: any = { status };
        if (failureReason) changes.failureReason = failureReason;
        if (status === "completed") changes.completedAt = Date.now();

        await ctx.db.patch(payout._id, changes);

        if (status === "failed") {
            const affiliate = await ctx.db.get(payout.affiliateId);
            if (affiliate) {
                await ctx.db.patch(payout.affiliateId, {
                    availableBalance: affiliate.availableBalance + payout.amount
                });
            }
        }
    },
});
