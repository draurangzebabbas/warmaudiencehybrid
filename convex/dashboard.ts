import { v } from "convex/values";
import { query, QueryCtx } from "./_generated/server";
import { authComponent } from "./auth";

/**
 * Get dashboard statistics for the current user (LinkedLead)
 */
export const getStats = query({
    args: {},
    handler: async (ctx: QueryCtx) => {
        try {
            const user = await authComponent.getAuthUser(ctx);
            if (!user) return null;

            // Get count of saved personal profiles
            const personalProfiles = await ctx.db
                .query("userSavedProfiles")
                .withIndex("by_user_type", (q) => q.eq("userId", user._id).eq("profileType", "personal"))
                .collect();

            // Get count of saved company profiles
            const companyProfiles = await ctx.db
                .query("userSavedProfiles")
                .withIndex("by_user_type", (q) => q.eq("userId", user._id).eq("profileType", "company"))
                .collect();

            // Get count of active competitor trackers
            const activeTrackers = await ctx.db
                .query("competitorTracking")
                .withIndex("by_user", (q) => q.eq("userId", user._id))
                .filter(q => q.eq(q.field("isActive"), true))
                .collect();

            return {
                totalPersonalProfiles: personalProfiles.length,
                totalCompanyProfiles: companyProfiles.length,
                activeTrackers: activeTrackers.length,
                totalProfiles: personalProfiles.length + companyProfiles.length,
            };
        } catch (e) {
            console.error("Error in getStats:", e);
            return {
                totalPersonalProfiles: 0,
                totalCompanyProfiles: 0,
                activeTrackers: 0,
                totalProfiles: 0,
            };
        }
    },
});

/**
 * Get recent activity for the dashboard
 */
export const getRecentActivity = query({
    args: {
        limit: v.optional(v.number()),
    },
    handler: async (ctx: QueryCtx, args) => {
        try {
            const user = await authComponent.getAuthUser(ctx);
            if (!user) return [];

            const limit = args.limit || 10;

            const recentSaves = await ctx.db
                .query("userSavedProfiles")
                .withIndex("by_user", (q) => q.eq("userId", user._id))
                .order("desc")
                .take(limit);

            const activities = await Promise.all(
                recentSaves.map(async (save) => {
                    let name = "Unknown";
                    let type = save.profileType;
                    let url = "";

                    if (save.profileType === "personal" && save.profileId) {
                        const profile = await ctx.db.get(save.profileId);
                        if (profile) {
                            name = profile.fullName;
                            url = profile.linkedinUrl;
                        }
                    } else if (save.profileType === "company" && save.companyProfileId) {
                        const company = await ctx.db.get(save.companyProfileId);
                        if (company) {
                            name = company.companyName;
                            url = company.linkedinUrl;
                        }
                    }

                    return {
                        _id: save._id,
                        name,
                        type,
                        url,
                        tags: save.tags,
                        createdAt: save.createdAt,
                    };
                })
            );

            return activities;
        } catch (e) {
            console.error("Error in getRecentActivity:", e);
            return [];
        }
    },
});
