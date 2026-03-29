import { NextResponse } from "next/server";
import { isAuthenticated, fetchAuthMutation, fetchAuthQuery } from "@/src/lib/auth-server";
import { api } from "@/convex/_generated/api";
import { createWisePayout, getWiseBalance } from "@/src/lib/wise";

export async function POST(req: Request) {
    try {
        // 1. Verify Authentication
        const isAuthed = await isAuthenticated();
        if (!isAuthed) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { amount } = await req.json();

        // 2. Fetch Affiliate Profile
        const profile = await fetchAuthQuery(api.affiliate_program.getMyProfile, {});
        if (!profile) {
            return NextResponse.json({ error: "Affiliate profile not found" }, { status: 404 });
        }

        if (!profile.payoutMethod) {
            return NextResponse.json({ error: "Payout method not configured" }, { status: 400 });
        }

        const minPayout = Number(process.env.AFFILIATE_PAYOUT_MINIMUM || 50);
        if (profile.availableBalance < minPayout) {
            return NextResponse.json({ error: `Minimum payout is $${minPayout}` }, { status: 400 });
        }

        // 2.2 Global Kill Switch (Safety)
        if (process.env.PAYOUTS_ENABLED !== "true") {
            console.warn("⚠️ Payouts are currently disabled via env.");
            return NextResponse.json({ error: "Payouts are temporarily disabled for maintenance." }, { status: 503 });
        }

        // 2.5 Verify Wise Business Balance
        const sourceCurrency = process.env.WISE_SOURCE_CURRENCY || "USD";
        const wiseBalance = await getWiseBalance(sourceCurrency);
        if (wiseBalance < profile.availableBalance) {
            console.error(`❌ [Wise] Insufficient funds in Wise Balance. Available: ${wiseBalance}, Required: ${profile.availableBalance}`);
            return NextResponse.json({
                error: "Payout system temporarily unavailable (insufficient balance). Please contact the administrator."
            }, { status: 503 });
        }

        // 3. Create Pending Payout in Convex
        // This mutation deducts from availableBalance and creates a record with status 'pending'
        const payoutId = await fetchAuthMutation(api.affiliate_program.requestPayout, {
            amount: profile.availableBalance
        });

        // 4. Execute Wise Transfer
        console.log(`🌐 [Wise] Initiating payout via ${profile.payoutMethod} ($${profile.availableBalance})`);

        const bankDetails = profile.payoutMethod === "wise_bank" ? {
            country: profile.payoutBankCountry,
            currency: profile.payoutBankCurrency,
            accountNumber: profile.payoutAccountNumber,
            routingNumber: profile.payoutRoutingNumber,
            iban: profile.payoutIban,
            swiftCode: profile.payoutSwiftCode,
        } : undefined;

        const wiseResult = await createWisePayout({
            amount: profile.availableBalance,
            recipientName: profile.payoutName || "Affiliate",
            currency: process.env.WISE_SOURCE_CURRENCY || "USD",
            recipientId: profile.wiseRecipientId,
            bankDetails
        });

        if (wiseResult.success) {
            // 5. Update Status to 'processing' or 'completed'
            await fetchAuthMutation(api.affiliate_program.updatePayoutStatus, {
                payoutId,
                status: "processing", // We use 'processing' because Wise transfers take time
                wiseTransferId: wiseResult.transferId
            });

            // 5.5 Persist Wise Recipient ID if it's new
            if (wiseResult.recipientId && wiseResult.recipientId !== profile.wiseRecipientId) {
                console.log(`💾 Saving new Wise Recipient ID: ${wiseResult.recipientId}`);
                await fetchAuthMutation(api.affiliate_program.updatePayoutSettings, {
                    payoutMethod: profile.payoutMethod, // Required field
                    wiseRecipientId: wiseResult.recipientId
                });
            }

            return NextResponse.json({
                success: true,
                message: "Payout initiated successfully",
                transferId: wiseResult.transferId
            });
        } else {
            // 6. Handle failure (Mutation implementation usually reverses the balance deduction if status is 'failed')
            await fetchAuthMutation(api.affiliate_program.updatePayoutStatus, {
                payoutId,
                status: "failed",
                failureReason: wiseResult.error
            });

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

// We also need updatePayoutStatus mutation to be available in public API wrapper.
// Checking convex/affiliate_program.ts...
