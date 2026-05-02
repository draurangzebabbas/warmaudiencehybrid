import { v } from "convex/values";
import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { authComponent } from "./auth";
import { PLANS, getPlanFromSlug } from "./plans";

async function checkProfileLimit(ctx: MutationCtx, userId: any) {
    // 1. Get Plan
    let planSlug = "free";
    const subscription = await ctx.db
        .query("subscription")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .filter(q => q.or(
            q.eq(q.field("status"), "active"),
            q.eq(q.field("status"), "trialing")
        ))
        .first();

    if (subscription) {
        planSlug = subscription.planSlug || "free";
    }

    const planKey = getPlanFromSlug(planSlug);
    const plan = PLANS[planKey];

    // 2. Count profiles saved this month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    const profiles = await ctx.db
        .query("userSavedProfiles")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .filter(q => q.gte(q.field("createdAt"), firstDayOfMonth))
        .collect();

    if (profiles.length >= plan.profilesLimit) {
        throw new Error(`Limit Reached: You have consumed all your profile storage for this month (${plan.profilesLimit} profiles). Please upgrade to a higher plan for more capacity.`);
    }
    return plan;
}

/**
 * Check if a profile exists in the global cache and is fresh enough
 */
export const getProfileByUrl = query({
    args: { url: v.string(), type: v.string() }, // type: "personal" | "company"
    handler: async (ctx: QueryCtx, args) => {
        if (args.type === "personal") {
            const profile = await ctx.db
                .query("linkedinProfiles")
                .withIndex("by_linkedin_url", (q) => q.eq("linkedinUrl", args.url))
                .first();

            if (profile) {
                const ageInDays = (Date.now() - profile.updatedAt) / (1000 * 60 * 60 * 24);
                return { profile, isFresh: ageInDays < 30 };
            }
        } else {
            const company = await ctx.db
                .query("companyProfiles")
                .withIndex("by_linkedin_url", (q) => q.eq("linkedinUrl", args.url))
                .first();

            if (company) {
                const ageInDays = (Date.now() - company.updatedAt) / (1000 * 60 * 60 * 24);
                return { company, isFresh: ageInDays < 30 };
            }
        }
        return null;
    },
});

// --- Internal Helpers for Mapping ---
function mapPersonalFields(p: any) {
    if (!p) return null;
    const b = p.basic_info || p;
    const linkedinUrl = b.profile_url || p.linkedinUrl || b.linkedinUrl;
    if (!linkedinUrl) return null;

    return {
        linkedinUrl: linkedinUrl,
        publicIdentifier: b.public_identifier || b.publicIdentifier || p.publicIdentifier || "",
        firstName: b.first_name || b.firstName || "",
        lastName: b.last_name || b.lastName || "",
        fullName: b.fullname || b.fullName || "",
        headline: b.headline || "",
        email: (b.email || p.email) || undefined,
        connections: (b.connection_count ?? b.connections ?? p.connections) ?? undefined,
        followers: (b.follower_count ?? b.followers ?? p.followers) ?? undefined,
        companyName: (b.current_company || b.companyName || p.companyName) || undefined,
        jobTitle: (b.headline || p.headline) || undefined,
        location: b.location || p.location || undefined,
        city: (b.location?.city || p.location?.city) || undefined,
        country: (b.location?.country || p.location?.country) || undefined,
        postalCode: (b.location?.postalCode || p.location?.postalCode) || undefined,
        isPremium: (b.is_premium ?? p.isPremium) ?? undefined,
        isInfluencer: (b.is_influencer ?? p.isInfluencer) ?? undefined,
        openToWork: (b.open_to_work ?? p.openToWork) ?? undefined,
        isVerified: (b.is_verified ?? p.isVerified) ?? undefined,
        profilePic: (b.profile_picture_url || b.profilePic || p.profilePic) || undefined,
        about: (b.about || p.about) || undefined,
        updatedAt: Date.now(),
    };
}

function mapCompanyFields(c: any) {
    if (!c) return null;
    const linkedinUrl = c.basic_info?.linkedin_url || c.linkedinUrl || c.url;
    if (!linkedinUrl) return null;

    return {
        url: linkedinUrl,
        companyName: c.basic_info?.name || c.name || c.companyName || "Unknown",
        linkedinUrl: linkedinUrl,
        websiteUrl: (c.basic_info?.website || c.website || c.websiteUrl) || undefined,
        logoUrl: (c.media?.logo_url || c.logoUrl) || undefined,
        description: (c.basic_info?.description || c.description) || undefined,
        employeeCount: (c.stats?.employee_count || c.employeeCount) ?? undefined,
        employeeCountRange: (c.stats?.employee_count_range || c.employeeCountRange) ?? undefined,
        followerCount: (c.stats?.follower_count || c.followerCount) ?? undefined,
        city: (c.locations?.headquarters?.city || c.city) || undefined,
        country: (c.locations?.headquarters?.country || c.country) || undefined,
        postalCode: (c.locations?.headquarters?.postal_code || c.postalCode) || undefined,
        isVerified: (c.basic_info?.is_verified ?? c.isVerified) ?? undefined,
        updatedAt: Date.now(),
    };
}

/**
 * New: Link a Supabase profile to the user
 */
export const linkSupabaseProfilesBulk = mutation({
    args: {
        userId: v.string(),
        supabaseIds: v.array(v.string()),
        type: v.string(), // "personal" | "company" | "google_maps"
        tags: v.optional(v.array(v.string())),
    },
    handler: async (ctx, args) => {
        // 1. Check plan limits for the whole batch
        const plan = await checkProfileLimit(ctx, args.userId as any);
        
        // 2. We only allow adding up to the remaining limit
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
        const currentCount = await ctx.db
            .query("userSavedProfiles")
            .withIndex("by_user", (q) => q.eq("userId", args.userId as any))
            .filter(q => q.gte(q.field("createdAt"), firstDayOfMonth))
            .collect();
        
        const remaining = plan.profilesLimit - currentCount.length;
        const toProcess = args.supabaseIds.slice(0, Math.max(0, remaining));

        const results = [];
        for (const sid of toProcess) {
            const existing = await ctx.db
                .query("userSavedProfiles")
                .withIndex("by_user_type", (q) => q.eq("userId", args.userId).eq("profileType", args.type))
                .filter(q => q.or(
                    q.eq(q.field("supabaseId"), sid),
                    q.eq(q.field("googleMapsId"), sid)
                ))
                .first();

            if (!existing) {
                const data: any = {
                    userId: args.userId,
                    profileType: args.type,
                    tags: args.tags || [],
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                };

                if (args.type === "google_maps") {
                    data.googleMapsId = sid;
                } else {
                    data.supabaseId = sid;
                }

                const newId = await ctx.db.insert("userSavedProfiles", data);
                results.push(newId);
            } else {
                results.push(existing._id);
            }
        }
        return results;
    }
});

/**
 * Save a personal profile to global DB and link to user
 */
export const savePersonalProfile = mutation({
    args: {
        userId: v.string(),
        profile: v.any(),
        tags: v.optional(v.array(v.string())),
    },
    handler: async (ctx: MutationCtx, args) => {
        await checkProfileLimit(ctx, args.userId as any);
        const { profile: p, userId, tags = [] } = args;
        const profileFields = mapPersonalFields(p);
        if (!profileFields) return null; // Skip instead of throwing

        // 1. Check if global profile exists
        let profileId;
        const existing = await ctx.db
            .query("linkedinProfiles")
            .withIndex("by_linkedin_url", (q) => q.eq("linkedinUrl", profileFields.linkedinUrl))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, profileFields);
            profileId = existing._id;
        } else {
            profileId = await ctx.db.insert("linkedinProfiles", {
                ...profileFields,
                createdAt: Date.now(),
            });
        }

        // 2. Create User Junction
        const existingJunction = await ctx.db
            .query("userSavedProfiles")
            .withIndex("by_user_profile", (q) => q.eq("userId", userId).eq("profileId", profileId))
            .first();

        if (!existingJunction) {
            await ctx.db.insert("userSavedProfiles", {
                userId,
                profileId,
                profileType: "personal",
                tags: tags,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            });
        }
        return profileId;
    },
});

/**
 * Bulk save personal profiles
 */
export const savePersonalProfilesBulk = mutation({
    args: {
        userId: v.string(),
        profiles: v.array(v.any()),
        tags: v.optional(v.array(v.string())),
    },
    handler: async (ctx: MutationCtx, args) => {
        await checkProfileLimit(ctx, args.userId as any);
        const { profiles, userId, tags = [] } = args;
        const results = [];

        for (const p of profiles) {
            const fields = mapPersonalFields(p);
            if (!fields) continue;

            const existing = await ctx.db
                .query("linkedinProfiles")
                .withIndex("by_linkedin_url", (q) => q.eq("linkedinUrl", fields.linkedinUrl))
                .first();

            let pid;
            if (existing) {
                await ctx.db.patch(existing._id, fields);
                pid = existing._id;
            } else {
                pid = await ctx.db.insert("linkedinProfiles", { ...fields, createdAt: Date.now() });
            }

            const junction = await ctx.db
                .query("userSavedProfiles")
                .withIndex("by_user_profile", (q) => q.eq("userId", userId).eq("profileId", pid))
                .first();

            if (!junction) {
                await ctx.db.insert("userSavedProfiles", {
                    userId,
                    profileId: pid,
                    profileType: "personal",
                    tags,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                });
            }
            results.push(pid);
        }
        return results;
    }
});

/**
 * Save a company profile to global DB and link to user
 */
export const saveCompanyProfile = mutation({
    args: {
        userId: v.string(),
        company: v.any(),
        tags: v.optional(v.array(v.string())),
    },
    handler: async (ctx: MutationCtx, args) => {
        await checkProfileLimit(ctx, args.userId as any);
        const { company: c, userId, tags = [] } = args;
        const fields = mapCompanyFields(c);
        if (!fields) return null; // Skip instead of throwing

        let companyProfileId;
        const existing = await ctx.db
            .query("companyProfiles")
            .withIndex("by_linkedin_url", (q) => q.eq("linkedinUrl", fields.linkedinUrl))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, fields);
            companyProfileId = existing._id;
        } else {
            companyProfileId = await ctx.db.insert("companyProfiles", {
                ...fields,
                createdAt: Date.now(),
            });
        }

        // 2. Create User Junction
        const existingJunction = await ctx.db
            .query("userSavedProfiles")
            .withIndex("by_user_company", (q) => q.eq("userId", userId).eq("companyProfileId", companyProfileId))
            .first();

        if (!existingJunction) {
            await ctx.db.insert("userSavedProfiles", {
                userId,
                companyProfileId,
                profileType: "company",
                tags: tags,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            });
        }
        return companyProfileId;
    },
});

/**
 * Bulk save company profiles
 */
export const saveCompanyProfilesBulk = mutation({
    args: {
        userId: v.string(),
        companies: v.array(v.any()),
        tags: v.optional(v.array(v.string())),
    },
    handler: async (ctx: MutationCtx, args) => {
        await checkProfileLimit(ctx, args.userId as any);
        const { companies, userId, tags = [] } = args;
        const results = [];

        for (const c of companies) {
            const fields = mapCompanyFields(c);
            if (!fields) continue;

            const existing = await ctx.db
                .query("companyProfiles")
                .withIndex("by_linkedin_url", (q) => q.eq("linkedinUrl", fields.linkedinUrl))
                .first();

            let cid;
            if (existing) {
                await ctx.db.patch(existing._id, fields);
                cid = existing._id;
            } else {
                cid = await ctx.db.insert("companyProfiles", { ...fields, createdAt: Date.now() });
            }

            const junction = await ctx.db
                .query("userSavedProfiles")
                .withIndex("by_user_company", (q) => q.eq("userId", userId).eq("companyProfileId", cid))
                .first();

            if (!junction) {
                await ctx.db.insert("userSavedProfiles", {
                    userId,
                    companyProfileId: cid,
                    profileType: "company",
                    tags,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                });
            }
            results.push(cid);
        }
        return results;
    }
});


/**
 * Get user's saved profiles
 */
export const getMyProfiles = query({
    args: { type: v.optional(v.string()) },
    handler: async (ctx: QueryCtx, args) => {
        try {
            const user = await authComponent.getAuthUser(ctx);
            if (!user) return [];

            let baseQuery = ctx.db
                .query("userSavedProfiles")
                .withIndex("by_user", (q) => q.eq("userId", user._id));

            const saved = await baseQuery.collect();
            const results = await Promise.all(saved.map(async (s) => {
                if (s.profileType === "personal" && s.profileId) {
                    const p = await ctx.db.get(s.profileId);
                    return { ...s, details: p };
                } else if (s.profileType === "company" && s.companyProfileId) {
                    const c = await ctx.db.get(s.companyProfileId);
                    return { ...s, details: c };
                }
                return s;
            }));

            if (args.type) {
                return results.filter(r => r.profileType === args.type);
            }
            return results;
        } catch (e) {
            console.error("getMyProfiles error:", e);
            return [];
        }
    }
});

/**
 * Alias called by Express backend: convex.query("profiles:checkCache", { url, type })
 * Returns null (cache miss) or { profile/company, isFresh: boolean }
 */
export const checkCache = query({
    args: { url: v.string(), type: v.string() },
    handler: async (ctx: QueryCtx, args) => {
        if (args.type === "personal") {
            const profile = await ctx.db
                .query("linkedinProfiles")
                .withIndex("by_linkedin_url", (q) => q.eq("linkedinUrl", args.url))
                .first();
            if (profile) {
                const ageInDays = (Date.now() - profile.updatedAt) / (1000 * 60 * 60 * 24);
                return { profile, isFresh: ageInDays < 30 };
            }
        } else {
            const company = await ctx.db
                .query("companyProfiles")
                .withIndex("by_linkedin_url", (q) => q.eq("linkedinUrl", args.url))
                .first();
            if (company) {
                const ageInDays = (Date.now() - company.updatedAt) / (1000 * 60 * 60 * 24);
                return { company, isFresh: ageInDays < 30 };
            }
        }
        return null;
    },
});

/**
 * Convenience query for personal profiles
 */
export const listPersonal = query({
    args: {},
    handler: async (ctx: QueryCtx) => {
        try {
            const user = await authComponent.getAuthUser(ctx);
            if (!user) return [];

            const saved = await ctx.db
                .query("userSavedProfiles")
                .withIndex("by_user_type", (q) => q.eq("userId", user._id).eq("profileType", "personal"))
                .collect();

            const results = await Promise.all(
                saved.map(async (s) => {
                    const profile = s.profileId ? await ctx.db.get(s.profileId) : null;
                    return {
                        _id: profile?._id || s._id, // Fallback to junction ID
                        ...profile,
                        junctionId: s._id,
                        tags: s.tags,
                        supabaseId: s.supabaseId
                    };
                })
            );

            return results.filter(Boolean);
        } catch (e) {
            return [];
        }
    },
});

/**
 * Convenience query for company profiles
 */
export const listCompany = query({
    args: {},
    handler: async (ctx: QueryCtx) => {
        try {
            const user = await authComponent.getAuthUser(ctx);
            if (!user) return [];

            const saved = await ctx.db
                .query("userSavedProfiles")
                .withIndex("by_user_type", (q) => q.eq("userId", user._id).eq("profileType", "company"))
                .collect();

            const results = await Promise.all(
                saved.map(async (s) => {
                    const company = s.companyProfileId ? await ctx.db.get(s.companyProfileId) : null;
                    return {
                        _id: company?._id || s._id, // Fallback to junction ID
                        ...company,
                        junctionId: s._id,
                        tags: s.tags,
                        supabaseId: s.supabaseId
                    };
                })
            );

            return results.filter(Boolean);
        } catch (e) {
            return [];
        }
    },
});

/**
 * Convenience query for Google Map leads
 */
export const listGoogleMaps = query({
    args: {},
    handler: async (ctx: QueryCtx) => {
        try {
            const user = await authComponent.getAuthUser(ctx);
            if (!user) return [];

            const saved = await ctx.db
                .query("userSavedProfiles")
                .withIndex("by_user_type", (q) => q.eq("userId", user._id).eq("profileType", "google_maps"))
                .collect();

            const results = saved.map((s) => {
                return {
                    junctionId: s._id,
                    tags: s.tags,
                    googleMapsId: s.googleMapsId,
                };
            });

            return results;
        } catch (e) {
            return [];
        }
    },
});

/**
 * Unlink a profile from the user (deletes the junction, keeps the global data)
 */
export const removeProfile = mutation({
    args: { id: v.id("userSavedProfiles") },
    handler: async (ctx: MutationCtx, args) => {
        const user = await authComponent.getAuthUser(ctx);
        if (!user) throw new Error("Unauthorized");

        const junction = await ctx.db.get(args.id);
        if (!junction || junction.userId !== user._id) {
            throw new Error("Profile not found or unauthorized");
        }

        await ctx.db.delete(args.id);
    },
});

/**
 * Bulk unlink profiles from the user
 */
export const removeProfiles = mutation({
    args: { ids: v.array(v.id("userSavedProfiles")) },
    handler: async (ctx: MutationCtx, args) => {
        const user = await authComponent.getAuthUser(ctx);
        if (!user) throw new Error("Unauthorized");

        for (const id of args.ids) {
            const junction = await ctx.db.get(id);
            if (junction && junction.userId === user._id) {
                await ctx.db.delete(id);
            }
        }
    },
});
