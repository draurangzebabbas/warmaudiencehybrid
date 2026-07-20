import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createWisePayout, getWiseBalance } from "@/src/lib/wise";

// Service-role client — bypasses RLS for server-side mutations
function getServiceClient() {
    return createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

export async function POST(req: Request) {
    try {
        // 1. Verify Authentication
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Fetch Affiliate Profile
        const { data: profile, error: profileError } = await supabase
            .from("affiliate_profiles")
            .select("*")
            .eq("user_id", user.id)
            .single();

        if (profileError || !profile) {
            return NextResponse.json({ error: "Affiliate profile not found" }, { status: 404 });
        }

        if (!profile.payout_method) {
            return NextResponse.json({ error: "Payout method not configured" }, { status: 400 });
        }

        const minPayout = Number(process.env.AFFILIATE_PAYOUT_MINIMUM || 50);
        if (profile.available_balance < minPayout) {
            return NextResponse.json({ error: `Minimum payout is $${minPayout}` }, { status: 400 });
        }

        // 2.2 Global Kill Switch
        if (process.env.PAYOUTS_ENABLED !== "true") {
            console.warn("⚠️ Payouts are currently disabled via env.");
            return NextResponse.json({ error: "Payouts are temporarily disabled for maintenance." }, { status: 503 });
        }

        // 2.5 Verify Wise Business Balance
        const sourceCurrency = process.env.WISE_SOURCE_CURRENCY || "USD";
        const wiseBalance = await getWiseBalance(sourceCurrency);
        if (wiseBalance < profile.available_balance) {
            console.error(`❌ [Wise] Insufficient funds. Available: ${wiseBalance}, Required: ${profile.available_balance}`);
            return NextResponse.json({
                error: "Payout system temporarily unavailable (insufficient balance). Please contact the administrator."
            }, { status: 503 });
        }

        const service = getServiceClient();

        // 3. Create Pending Payout record & deduct balance atomically
        const { data: payout, error: payoutError } = await service
            .from("affiliate_payouts")
            .insert({
                affiliate_id: profile.id,
                amount: profile.available_balance,
                method: profile.payout_method,
                status: "pending",
                recipient_name: profile.payout_name,
                recipient_email: profile.payout_email,
                bank_details: profile.payout_method === "wise_bank" ? {
                    country: profile.payout_bank_country,
                    currency: profile.payout_bank_currency,
                    accountNumber: profile.payout_account_number,
                    routingNumber: profile.payout_routing_number,
                    iban: profile.payout_iban,
                    swiftCode: profile.payout_swift_code,
                } : null,
            })
            .select("id")
            .single();

        if (payoutError || !payout) {
            throw new Error("Failed to create payout record");
        }

        // Deduct balance
        await service
            .from("affiliate_profiles")
            .update({
                available_balance: 0,
                last_payout_at: new Date().toISOString()
            })
            .eq("id", profile.id);

        // 4. Execute Wise Transfer
        console.log(`🌐 [Wise] Initiating payout via ${profile.payout_method} ($${profile.available_balance})`);

        const bankDetails = profile.payout_method === "wise_bank" ? {
            country: profile.payout_bank_country,
            currency: profile.payout_bank_currency,
            accountNumber: profile.payout_account_number,
            routingNumber: profile.payout_routing_number,
            iban: profile.payout_iban,
            swiftCode: profile.payout_swift_code,
        } : undefined;

        const wiseResult = await createWisePayout({
            amount: profile.available_balance,
            recipientName: profile.payout_name || "Affiliate",
            currency: sourceCurrency,
            recipientId: profile.wise_recipient_id,
            bankDetails
        });

        if (wiseResult.success) {
            // 5. Update to processing
            await service
                .from("affiliate_payouts")
                .update({
                    status: "processing",
                    wise_transfer_id: wiseResult.transferId
                })
                .eq("id", payout.id);

            // 5.5 Save new Wise Recipient ID if created
            if (wiseResult.recipientId && wiseResult.recipientId !== profile.wise_recipient_id) {
                await service
                    .from("affiliate_profiles")
                    .update({ wise_recipient_id: wiseResult.recipientId })
                    .eq("id", profile.id);
            }

            return NextResponse.json({
                success: true,
                message: "Payout initiated successfully",
                transferId: wiseResult.transferId
            });
        } else {
            // 6. Handle failure — restore balance
            await service
                .from("affiliate_payouts")
                .update({ status: "failed", failure_reason: wiseResult.error })
                .eq("id", payout.id);

            await service
                .from("affiliate_profiles")
                .update({ available_balance: profile.available_balance })
                .eq("id", profile.id);

            return NextResponse.json({
                error: `Wise payout failed: ${wiseResult.error}`
            }, { status: 500 });
        }

    } catch (error: any) {
        console.error("❌ Payout API Route Error:", error);
        return NextResponse.json({
            error: "Internal Server Error",
            message: error.message,
            stack: process.env.NODE_ENV === "development" ? error.stack : undefined
        }, { status: 500 });
    }
}
