"use node";

import { v } from "convex/values";
import { action } from "../_generated/server";
import { authComponent } from "../auth";

export const getOrCreateWebhookKey = action({
    args: {},
    handler: async (ctx) => {
        const user = await authComponent.getAuthUser(ctx);
        if (!user) return null;

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            console.error("Missing Supabase configuration");
            return null;
        }

        // 1. Check if key exists
        const checkRes = await fetch(`${supabaseUrl}/rest/v1/webhook_api_keys?user_id=eq.${user._id}&select=key`, {
            headers: {
                "apikey": supabaseKey,
                "Authorization": `Bearer ${supabaseKey}`
            }
        });

        const existing = await checkRes.json();
        if (existing && existing.length > 0) {
            return { key: existing[0].key };
        }

        // 2. Create new key
        const newKey = Array.from(crypto.getRandomValues(new Uint8Array(16)))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");

        const createRes = await fetch(`${supabaseUrl}/rest/v1/webhook_api_keys`, {
            method: "POST",
            headers: {
                "apikey": supabaseKey,
                "Authorization": `Bearer ${supabaseKey}`,
                "Content-Type": "application/json",
                "Prefer": "return=representation"
            },
            body: JSON.stringify({
                user_id: user._id,
                key: newKey,
                is_active: true
            })
        });

        if (!createRes.ok) {
            console.error("Failed to create key in Supabase:", await createRes.text());
            return null;
        }

        return { key: newKey };
    },
});

