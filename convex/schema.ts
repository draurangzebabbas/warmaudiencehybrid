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

    userApiKeys: defineTable({
        userId: v.string(),
        name: v.string(),
        provider: v.string(),
        key: v.string(),
        status: v.string(), // "active", "rate_limited", "failed", "inactive"
        createdAt: v.number(),
        lastUsedAt: v.optional(v.number()),
        usageCount: v.optional(v.number()),
    }).index("by_user", ["userId"])
        .index("by_user_provider", ["userId", "provider"])
        .index("by_status_last_used", ["status", "lastUsedAt"]),

    // Global Intelligence Database (Profiles)
    linkedinProfiles: defineTable({
        linkedinUrl: v.string(),
        publicIdentifier: v.string(),
        firstName: v.string(),
        lastName: v.string(),
        fullName: v.string(),
        headline: v.string(),
        email: v.optional(v.string()),
        connections: v.optional(v.number()),
        followers: v.optional(v.number()),
        companyName: v.optional(v.string()),
        jobTitle: v.optional(v.string()),
        location: v.optional(v.any()), // object with city, country
        city: v.optional(v.string()),
        country: v.optional(v.string()),
        postalCode: v.optional(v.string()),
        isPremium: v.optional(v.boolean()),
        isInfluencer: v.optional(v.boolean()),
        openToWork: v.optional(v.boolean()),
        isVerified: v.optional(v.boolean()),
        profilePic: v.optional(v.string()),
        about: v.optional(v.string()),
        createdAt: v.number(),
        updatedAt: v.number(),
    }).index("by_linkedin_url", ["linkedinUrl"])
        .index("by_public_identifier", ["publicIdentifier"]),

    companyProfiles: defineTable({
        url: v.string(),
        companyName: v.string(),
        linkedinUrl: v.string(),
        websiteUrl: v.optional(v.string()),
        logoUrl: v.optional(v.string()),
        description: v.optional(v.string()),
        employeeCount: v.optional(v.number()),
        employeeCountRange: v.optional(v.string()),
        followerCount: v.optional(v.number()),
        city: v.optional(v.string()),
        country: v.optional(v.string()),
        postalCode: v.optional(v.string()),
        isVerified: v.optional(v.boolean()),
        createdAt: v.number(),
        updatedAt: v.number(),
    }).index("by_linkedin_url", ["linkedinUrl"])
        .index("by_url", ["url"]),

    // User Collections (Junction)
    userSavedProfiles: defineTable({
        userId: v.string(),
        profileId: v.optional(v.id("linkedinProfiles")), // Legacy Convex ID
        companyProfileId: v.optional(v.id("companyProfiles")), // Legacy Convex ID
        supabaseId: v.optional(v.string()), // New Supabase UUID
        profileType: v.string(), // "personal" | "company"
        personalNotes: v.optional(v.string()),
        tags: v.array(v.string()),
        createdAt: v.number(),
        updatedAt: v.number(),
    }).index("by_user", ["userId"])
        .index("by_user_profile", ["userId", "profileId"])
        .index("by_user_company", ["userId", "companyProfileId"])
        .index("by_user_supabase", ["userId", "supabaseId"])
        .index("by_user_type", ["userId", "profileType"]),

    // Automation & Tracking
    competitorTracking: defineTable({
        userId: v.string(),
        targetType: v.string(), // "profile" | "keyword"
        targetValue: v.string(),
        schedule: v.string(), // "daily", "weekly", "monthly"
        targets: v.array(v.string()), // ["commenters", "reactors"]
        isActive: v.boolean(),
        lastExecutedAt: v.optional(v.number()),
        nextExecutionAt: v.number(),
        webhookUrl: v.optional(v.string()),
        createdAt: v.number(),
    }).index("by_user", ["userId"])
        .index("by_active_next_run", ["isActive", "nextExecutionAt"]),

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
