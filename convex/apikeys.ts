import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { authComponent } from "./auth";

export const createKeyForUser = internalMutation({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("webhook_api_keys")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .first();
        if (existing) return;

        const newKey = Array.from(crypto.getRandomValues(new Uint8Array(16)))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");

        await ctx.db.insert("webhook_api_keys", {
            userId: args.userId,
            key: newKey,
            isActive: true,
        });
    }
});

// Using mutation to allow creating the key if it doesn't exist (Lazy creation)
export const getOrCreateKey = mutation({
    args: {},
    handler: async (ctx) => {
        let user;
        try {
            user = await authComponent.getAuthUser(ctx);
        } catch (e) {
            return null;
        }

        if (!user) {
            return null;
        }
        const userId = user._id; // Convex Auth usually returns the doc with _id

        // Check if key exists
        let apiKeyRecord = await ctx.db
            .query("webhook_api_keys")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();

        // If no key, create one immediately
        if (!apiKeyRecord) {
            const newKey = Array.from(crypto.getRandomValues(new Uint8Array(16)))
                .map((b) => b.toString(16).padStart(2, "0"))
                .join("");

            const id = await ctx.db.insert("webhook_api_keys", {
                userId,
                key: newKey,
                isActive: true,
            });

            return { key: newKey };
        }

        return { key: apiKeyRecord.key };
    },
});

export const validateApiKey = query({
    args: { key: v.string() },
    handler: async (ctx, args) => {
        const apiKeyRecord = await ctx.db
            .query("webhook_api_keys")
            .withIndex("by_key", (q) => q.eq("key", args.key))
            .first();

        if (!apiKeyRecord || !apiKeyRecord.isActive) {
            return null;
        }
        return { userId: apiKeyRecord.userId, isValid: true };
    }
});
