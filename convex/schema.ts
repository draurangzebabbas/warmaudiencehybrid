import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    // Auth & API Management is now in Supabase (webhook_api_keys table)


    subscription: defineTable({
        userId: v.string(),
        email: v.string(),
        polarId: v.string(),
        status: v.string(),
        planSlug: v.string(),
        currentPeriodStart: v.optional(v.number()),
        currentPeriodEnd: v.optional(v.number()),
        cancelAtPeriodEnd: v.optional(v.boolean()),
    }).index("by_user", ["userId"])
        .index("by_email", ["email"])
        .index("by_polar_id", ["polarId"]),
});
