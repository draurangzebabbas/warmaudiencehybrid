import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

function generateCode(length = 6): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * GET /api/affiliate/profile
 * Returns the authenticated user's affiliate profile.
 * Auto-creates one if it doesn't exist (self-healing).
 */
export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const service = createServiceClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Try to get existing profile
        const { data: profile } = await service
            .from("affiliate_profiles")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();

        if (profile) return NextResponse.json({ profile });

        // Auto-create — generate unique referral code
        let code = "";
        let attempts = 0;
        while (attempts < 10) {
            const candidate = generateCode();
            const { data: existing } = await service
                .from("affiliate_profiles")
                .select("id")
                .eq("referral_code", candidate)
                .maybeSingle();
            if (!existing) { code = candidate; break; }
            attempts++;
        }

        if (!code) throw new Error("Could not generate unique referral code");

        const { data: newProfile, error } = await service
            .from("affiliate_profiles")
            .insert({
                user_id: user.id,
                referral_code: code,
                total_clicks: 0,
                total_signups: 0,
                total_conversions: 0,
                total_earnings: 0,
                available_balance: 0,
            })
            .select("*")
            .single();

        if (error) throw error;
        return NextResponse.json({ profile: newProfile });
    } catch (err: any) {
        console.error("[affiliate/profile GET]", err.message);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}

/**
 * PATCH /api/affiliate/profile
 * Updates payout settings for the authenticated user's affiliate profile.
 */
export async function PATCH(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();

        // Whitelist only safe fields to update
        const allowed = [
            "payout_method", "payout_email", "payout_name",
            "payout_bank_country", "payout_bank_currency",
            "payout_account_number", "payout_routing_number",
            "payout_iban", "payout_swift_code", "auto_payout_enabled",
        ];
        const update: Record<string, any> = {};
        for (const key of allowed) {
            if (key in body) update[key] = body[key];
        }

        const { error } = await supabase
            .from("affiliate_profiles")
            .update(update)
            .eq("user_id", user.id);

        if (error) throw error;
        return NextResponse.json({ ok: true });
    } catch (err: any) {
        console.error("[affiliate/profile PATCH]", err.message);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
