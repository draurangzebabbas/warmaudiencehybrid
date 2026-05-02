"use node";
import { action } from "../_generated/server";
import { api } from "../_generated/api";
import * as jwt from "jsonwebtoken";

export const getSupabaseToken = action({
    args: {},
    handler: async (ctx): Promise<string | null> => {
        // 1. Authenticate the user securely via Convex/BetterAuth
        const user: any = await ctx.runQuery(api.auth.getCurrentUser);
        if (!user || !user._id) return null;

        // 2. Fetch the Supabase JWT Secret from Convex environment variables
        const secret = process.env.SUPABASE_JWT_SECRET;
        if (!secret) {
            console.error("Missing SUPABASE_JWT_SECRET environment variable");
            return null;
        }

        // 3. Sign a temporary token valid for 1 hour, explicitly setting the role to "authenticated"
        // and passing the user's Convex ID as the 'sub' (subject) claim.
        const token = jwt.sign(
            {
                role: "authenticated",
                sub: user._id,
            },
            secret,
            { expiresIn: "1h" }
        );

        return token;
    }
});
