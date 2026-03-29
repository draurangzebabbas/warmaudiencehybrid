import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    profiles: defineTable({
        userId: v.string(),                    // Link to Better Auth user
        referralCode: v.string(),              // Unique code (e.g., "JOHN2024")
        totalClicks: v.number(),               // Total link clicks
        totalSignups: v.number(),              // Total referred signups
        totalConversions: v.number(),          // Total paid conversions
        totalEarnings: v.number(),             // Lifetime earnings (USD)
        availableBalance: v.number(),          // Current withdrawable balance
        createdAt: v.number(),                 // Timestamp
        lastPayoutAt: v.optional(v.number()),  // Last payout date
        payoutMethod: v.optional(v.string()),  // "wise_email", "wise_bank"
        payoutEmail: v.optional(v.string()),   // Used for wise_email
        payoutName: v.optional(v.string()),    // Full name for recipient
        payoutBankCountry: v.optional(v.string()),
        payoutBankCurrency: v.optional(v.string()),
        payoutAccountNumber: v.optional(v.string()),
        payoutRoutingNumber: v.optional(v.string()),
        payoutIban: v.optional(v.string()),
        payoutSwiftCode: v.optional(v.string()),
        autoPayoutEnabled: v.optional(v.boolean()), // Whether to payout automatically at $50
        wiseRecipientId: v.optional(v.string()),    // Stored Wise Recipient ID to avoid re-creation
    }).index("by_user", ["userId"])
        .index("by_code", ["referralCode"]),

    referrals: defineTable({
        affiliateId: v.id("profiles"),       // Who referred this user
        referredUserId: v.string(),            // The new user's ID
        referredUserEmail: v.string(),         // For display (anonymized)
        signupDate: v.number(),                // When they signed up
        conversionDate: v.optional(v.number()),// When they paid (if ever)
        status: v.string(),                    // "free", "paid", "churned"
        plan: v.optional(v.string()),          // "pro", "startup", etc.
        country: v.optional(v.string()),       // From Polar billing address
        clickSource: v.optional(v.string()),   // UTM source/medium
    }).index("by_affiliate", ["affiliateId"])
        .index("by_user", ["referredUserId"])
        .index("by_email", ["referredUserEmail"])
        .index("by_status", ["affiliateId", "status"]), // Filter paid only

    commissions: defineTable({
        affiliateId: v.id("profiles"),       // Who earned this
        referralId: v.id("referrals"),         // Which referral generated it
        orderId: v.string(),                   // Polar order ID
        orderAmount: v.number(),               // Total order amount (USD)
        commissionRate: v.number(),            // % used (from env or custom)
        commissionAmount: v.number(),          // Actual earnings (USD)
        createdAt: v.number(),                 // When commission was created
        status: v.string(),                    // "pending", "approved", "paid"
    }).index("by_affiliate", ["affiliateId"])
        .index("by_order", ["orderId"])
        .index("by_status", ["status"]),

    payouts: defineTable({
        affiliateId: v.id("profiles"),       // Who requested payout
        amount: v.number(),                    // Amount requested (USD)
        method: v.string(),                    // "wise_email", "wise_bank"
        status: v.string(),                    // "pending", "processing", "completed", "failed"
        wiseTransferId: v.optional(v.string()),// Wise API transfer ID
        recipientEmail: v.optional(v.string()), // Used for email method
        recipientName: v.optional(v.string()), // Full name used (Optional for legacy support)
        bankDetails: v.optional(v.any()),      // Snapshot of bank details used
        requestedAt: v.number(),               // When requested
        completedAt: v.optional(v.number()),   // When completed
        failureReason: v.optional(v.string()), // If failed, why
    }).index("by_affiliate", ["affiliateId"])
        .index("by_status", ["status"])
        .index("by_wise_transfer_id", ["wiseTransferId"]),

    clicks: defineTable({
        affiliateId: v.id("profiles"),       // Whose link was clicked
        referralCode: v.string(),              // The code used
        clickedAt: v.number(),                 // Timestamp
        ipAddress: v.optional(v.string()),     // Hashed for privacy
        country: v.optional(v.string()),       // Geo-location
        userAgent: v.optional(v.string()),     // Browser info
        converted: v.boolean(),                // Did they sign up?
    }).index("by_affiliate", ["affiliateId"])
        .index("by_code", ["referralCode"]),
});
