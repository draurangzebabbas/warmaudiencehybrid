import { NextResponse } from 'next/server';
import { validateEvent, WebhookVerificationError } from "@polar-sh/sdk/webhooks";
import { createClient } from '@supabase/supabase-js'; // Use service role for webhooks

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Must set this in env
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
    try {
        const secret = process.env.POLAR_WEBHOOK_SECRET;
        if (!secret) {
            console.error("❌ POLAR_WEBHOOK_SECRET is not set");
            return NextResponse.json({ message: "Secret Missing" }, { status: 500 });
        }

        const payload = await req.text();
        const headers: Record<string, string> = {};
        req.headers.forEach((value, key) => {
            headers[key] = value;
        });

        console.log("📥 [Webhook Trace] Incoming request to /api/webhooks/polar");

        try {
            validateEvent(payload, headers, secret);
        } catch (err) {
            if (err instanceof WebhookVerificationError) {
                console.error("❌ [Webhook Trace] Signature Mismatch via Polar SDK!", err.message);
                return NextResponse.json({ message: "Invalid Signature" }, { status: 401 });
            }
            console.error("❌ [Webhook Trace] Webhook Validation Error:", err);
            return NextResponse.json({ message: "Validation Failed" }, { status: 400 });
        }

        const event = JSON.parse(payload);
        const { type, data } = event;
        const email = (data.customer?.email || data.user?.email || data.customer_email || "").toLowerCase().trim();

        if (!email) {
            return NextResponse.json({ message: "No Email" }, { status: 200 });
        }

        console.log(`📡 [Polar] Processing ${type} for ${email}`);

        // 4. Subscription Logic
        if (type.startsWith("subscription.")) {
            const productId = (data.product_id || data.product?.id || "").trim();
            const growthId = (process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_GROWTH || "").trim();
            const scaleId = (process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_SCALE || "").trim();

            let planSlug = "free";
            const isActive = data.status === "active" || data.status === "trialing";

            if (isActive) {
                if (productId === growthId) planSlug = "growth";
                else if (productId === scaleId) planSlug = "scale";
            }

            // Update Supabase profile
            const { error } = await supabase
                .from('profiles')
                .update({
                    polar_id: data.customer_id || data.customer?.id,
                    subscription_status: data.status,
                    plan_slug: planSlug,
                    current_period_start: data.current_period_start ? new Date(data.current_period_start).getTime() : null,
                    current_period_end: data.current_period_end ? new Date(data.current_period_end).getTime() : null,
                    cancel_at_period_end: data.cancel_at_period_end,
                })
                .eq('email', email);

            if (error) {
                console.error("❌ [Webhook] Error updating Supabase:", error.message);
            } else {
                console.log(`✅ [Subscription] Updated for ${email} -> ${planSlug} (${data.status})`);
            }
        }

        // 5. Affiliate Commission Logic
        if (type === "order.created") {
            const orderId = data.id;
            const amountCents = data.amount; // Polar amount is in cents
            
            if (amountCents > 0) {
                // Find if the customer was referred
                const { data: referral } = await supabase
                    .from("affiliate_referrals")
                    .select("id, affiliate_id")
                    .eq("referred_user_email", email)
                    .single();

                if (referral) {
                    // Prevent duplicate commissions
                    const { data: existingCommission } = await supabase
                        .from("affiliate_commissions")
                        .select("id")
                        .eq("order_id", orderId)
                        .maybeSingle();

                    if (!existingCommission) {
                        const COMMISSION_RATE = 0.30; // 30%
                        const amountUsd = amountCents / 100;
                        const commissionAmount = Number((amountUsd * COMMISSION_RATE).toFixed(2));

                        console.log(`💸 [Affiliate] Processing commission: Order $${amountUsd} -> Comm $${commissionAmount} for affiliate_id: ${referral.affiliate_id}`);

                        // Insert commission
                        await supabase.from("affiliate_commissions").insert({
                            affiliate_id: referral.affiliate_id,
                            referral_id: referral.id,
                            order_id: orderId,
                            order_amount: amountUsd,
                            commission_rate: COMMISSION_RATE,
                            commission_amount: commissionAmount,
                            status: "approved"
                        });

                        // Update referral status
                        await supabase.from("affiliate_referrals").update({
                            status: "paid",
                            conversion_date: new Date().toISOString()
                        }).eq("id", referral.id);

                        // Update affiliate balances
                        const { data: affiliateProfile } = await supabase
                            .from("affiliate_profiles")
                            .select("total_conversions, total_earnings, available_balance")
                            .eq("id", referral.affiliate_id)
                            .single();
                        
                        if (affiliateProfile) {
                            await supabase.from("affiliate_profiles").update({
                                total_conversions: affiliateProfile.total_conversions + 1,
                                total_earnings: affiliateProfile.total_earnings + commissionAmount,
                                available_balance: affiliateProfile.available_balance + commissionAmount
                            }).eq("id", referral.affiliate_id);
                        }
                    }
                }
            }
        }

        return NextResponse.json({ message: "Success" }, { status: 200 });
    } catch (err: any) {
        console.error("❌ Webhook Fatal Error:", err.message);
        return NextResponse.json({ message: "Internal Error" }, { status: 500 });
    }
}
