import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

/**
 * POST /api/affiliate/link-referral
 * Called after a new user signs up if they have an affiliate_ref cookie.
 * Uses service-role to write the referral record.
 */
export async function POST(req: Request) {
    try {
        const { referralCode, newUserId, newUserEmail } = await req.json();

        if (!referralCode || !newUserId || !newUserEmail) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const service = createServiceClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Find affiliate profile
        const { data: profile } = await service
            .from("affiliate_profiles")
            .select("id, user_id, total_signups")
            .eq("referral_code", referralCode)
            .single();

        if (!profile) return NextResponse.json({ ok: false, reason: "code_not_found" });

        // Don't self-refer
        if (profile.user_id === newUserId) {
            return NextResponse.json({ ok: false, reason: "self_referral" });
        }

        // Idempotency — don't create duplicate referrals
        const { data: existing } = await service
            .from("affiliate_referrals")
            .select("id")
            .eq("referred_user_id", newUserId)
            .maybeSingle();

        if (existing) return NextResponse.json({ ok: true, reason: "already_linked" });

        // Create referral
        await service.from("affiliate_referrals").insert({
            affiliate_id: profile.id,
            referred_user_id: newUserId,
            referred_user_email: newUserEmail.toLowerCase(),
            status: "free",
        });

        // Increment signups counter
        await service
            .from("affiliate_profiles")
            .update({ total_signups: profile.total_signups + 1 })
            .eq("id", profile.id);

        // Mark click as converted (latest unmatched click for this code)
        await service
            .from("affiliate_clicks")
            .update({ converted: true })
            .eq("referral_code", referralCode)
            .eq("converted", false)
            .order("clicked_at", { ascending: false })
            .limit(1);

        return NextResponse.json({ ok: true });
    } catch (err: any) {
        console.error("[affiliate/link-referral]", err.message);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
