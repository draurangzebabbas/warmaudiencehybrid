import { v } from "convex/values";
import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { authComponent } from "./auth";
import { Id } from "./_generated/dataModel";

/**
 * Add a new external API key for the user.
 */
export const create = mutation({
    args: {
        name: v.string(),
        provider: v.string(),
        key: v.string(),
    },
    handler: async (ctx: MutationCtx, args) => {
        const user = await authComponent.getAuthUser(ctx);
        if (!user) throw new Error("Unauthorized");

        return await ctx.db.insert("userApiKeys", {
            userId: user._id,
            name: args.name,
            provider: args.provider,
            key: args.key,
            status: "active",
            createdAt: Date.now(),
        });
    },
});

/**
 * List all API keys for a specific user (internal use).
 */
export const internalList = query({
    args: { userId: v.string() },
    handler: async (ctx: QueryCtx, args) => {
        return await ctx.db
            .query("userApiKeys")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .collect();
    },
});

/**
 * List all API keys for the current user.
 */
export const list = query({
    args: {},
    handler: async (ctx: QueryCtx) => {
        try {
            const user = await authComponent.getAuthUser(ctx);
            if (!user) return [];

            return await ctx.db
                .query("userApiKeys")
                .withIndex("by_user", (q) => q.eq("userId", user._id))
                .order("desc")
                .collect();
        } catch (e) {
            // If authentication fails or session is missing, return empty list
            return [];
        }
    },
});

/**
 * Remove an API key.
 */
export const remove = mutation({
    args: { id: v.id("userApiKeys") },
    handler: async (ctx: MutationCtx, args) => {
        const user = await authComponent.getAuthUser(ctx);
        if (!user) throw new Error("Unauthorized");

        const apiKey = await ctx.db.get(args.id);
        if (!apiKey || apiKey.userId !== user._id) {
            throw new Error("API Key not found or unauthorized");
        }

        await ctx.db.delete(args.id);
    },
});

/**
 * Toggle the status of an API key (active/inactive).
 */
export const toggleStatus = mutation({
    args: { id: v.id("userApiKeys") },
    handler: async (ctx: MutationCtx, args) => {
        const user = await authComponent.getAuthUser(ctx);
        if (!user) throw new Error("Unauthorized");

        const apiKey = await ctx.db.get(args.id);
        if (!apiKey || apiKey.userId !== user._id) {
            throw new Error("API Key not found or unauthorized");
        }

        const newStatus = apiKey.status === "active" ? "inactive" : "active";
        await ctx.db.patch(args.id, { status: newStatus });
    },
});

/**
 * Update API key status and usage (internal use by backend).
 */
export const updateKeyStatus = mutation({
    args: {
        userId: v.string(),
        provider: v.string(),
        key: v.string(),
        status: v.string(), // "active", "rate_limited", "failed"
        incrementUsage: v.optional(v.boolean()),
    },
    handler: async (ctx: MutationCtx, args) => {
        // Find the key
        const apiKey = await ctx.db
            .query("userApiKeys")
            .withIndex("by_user_provider", (q) =>
                q.eq("userId", args.userId).eq("provider", args.provider)
            )
            .filter((q) => q.eq(q.field("key"), args.key))
            .first();

        if (!apiKey) {
            console.warn(`Key not found for update: ${args.provider}`);
            return;
        }

        const updates: any = {
            status: args.status,
            lastUsedAt: Date.now(),
        };

        if (args.incrementUsage) {
            updates.usageCount = (apiKey.usageCount || 0) + 1;
        }

        await ctx.db.patch(apiKey._id, updates);
    },
});

/**
 * Batch update multiple key statuses (internal use by backend).
 */
export const batchUpdateKeyStatus = mutation({
    args: {
        userId: v.string(),
        provider: v.string(),
        updates: v.array(v.object({
            key: v.string(),
            status: v.string(),
        })),
    },
    handler: async (ctx: MutationCtx, args) => {
        for (const update of args.updates) {
            const apiKey = await ctx.db
                .query("userApiKeys")
                .withIndex("by_user_provider", (q) =>
                    q.eq("userId", args.userId).eq("provider", args.provider)
                )
                .filter((q) => q.eq(q.field("key"), update.key))
                .first();

            if (apiKey) {
                await ctx.db.patch(apiKey._id, {
                    status: update.status,
                    lastUsedAt: Date.now(),
                    usageCount: (apiKey.usageCount || 0) + 1,
                });
            }
        }
    },
});

/**
 * Backend alias: convex.query("userApiKeys:listKeys", { userId, provider })
 * Used by keyManager.js to fetch keys for rotation
 */
export const listKeys = query({
    args: { userId: v.string(), provider: v.optional(v.string()) },
    handler: async (ctx: QueryCtx, args) => {
        let keys = await ctx.db
            .query("userApiKeys")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .collect();

        if (args.provider) {
            keys = keys.filter((k) => k.provider === args.provider);
        }

        return keys;
    },
});
