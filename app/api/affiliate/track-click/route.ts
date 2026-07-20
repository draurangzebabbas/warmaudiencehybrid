import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

/**
 * POST /api/affiliate/track-click
 * Public endpoint — no auth required.
 * Called when a visitor lands on /?ref=CODE
 */
export async function POST(req: Request) {
    try {
        const { code, country, userAgent } = await req.json();
        if (!code || typeof code !== "string") {
            return NextResponse.json({ error: "Missing referral code" }, { status: 400 });
        }

        const service = createServiceClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Find affiliate profile by referral code
        const { data: profile } = await service
            .from("affiliate_profiles")
            .select("id, total_clicks")
            .eq("referral_code", code)
            .single();

        if (!profile) {
            return NextResponse.json({ ok: false }); // silently ignore bad codes
        }

        // Record the click
        await service.from("affiliate_clicks").insert({
            affiliate_id: profile.id,
            referral_code: code,
            country: country || null,
            user_agent: userAgent || null,
            converted: false,
        });

        // Increment counter
        await service
            .from("affiliate_profiles")
            .update({ total_clicks: profile.total_clicks + 1 })
            .eq("id", profile.id);

        return NextResponse.json({ ok: true });
    } catch (err: any) {
        console.error("[affiliate/track-click]", err.message);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
