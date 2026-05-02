import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    // Auth & API Management
    webhook_api_keys: defineTable({
        userId: v.string(),
        key: v.string(),
        isActive: v.boolean(),
    }).index("by_key", ["key"])
        .index("by_user", ["userId"]),

    // User Collections (Junction Table linking to Supabase) - MIGRATED TO SUPABASE
    // userSavedProfiles table removed to save Convex quota


    userSettings: defineTable({
        userId: v.string(),
        primaryColor: v.optional(v.string()),
        secondaryColor: v.optional(v.string()),
    }).index("by_user", ["userId"]),

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
