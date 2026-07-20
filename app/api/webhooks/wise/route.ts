import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

/**
 * POST /api/webhooks/wise
 * Receives Wise transfer state-change events and updates payout status in Supabase.
 * No user auth required — this is a server-to-server callback.
 */
export async function POST(req: Request) {
    try {
        const body = await req.text();
        const event = JSON.parse(body);

        const eventType = event.event_type || event.type || "";
        console.log(`🔔 [Wise Webhook] Received event: ${eventType}`);

        const isStateChange = eventType.includes("state-change") || eventType === "transfer.state-change";
        const isPayoutFailure = eventType.includes("payout-failure");

        if (!isStateChange && !isPayoutFailure) {
            return NextResponse.json({ ignored: true });
        }

        const transferId = String(event.data.resource.id);
        const state = event.data.current_state;

        console.log(`🔔 [Wise Webhook] Transfer ${transferId} → state: ${state}`);

        let status: "completed" | "failed" | "processing" | null = null;
        let failureReason: string | undefined;

        if (isPayoutFailure) {
            status = "failed";
            failureReason = event.data.failure_description || "Wise payout failure event received.";
        } else {
            switch (state) {
                case "outgoing_payment_sent":
                    status = "completed";
                    break;
                case "bounced_back":
                case "funds_refunded":
                case "cancelled":
                case "charged_back":
                    status = "failed";
                    failureReason = `Transfer failed at Wise. End state: ${state}`;
                    break;
                case "incoming_payment_waiting":
                case "processing":
                case "funds_converted":
                    status = "processing";
                    break;
                default:
                    status = null;
            }
        }

        // Only update on terminal or processing states
        if (status && status !== "processing") {
            const service = createServiceClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!
            );

            const updateData: Record<string, any> = { status, failure_reason: failureReason ?? null };
            if (status === "completed") updateData.completed_at = new Date().toISOString();

            const { error } = await service
                .from("affiliate_payouts")
                .update(updateData)
                .eq("wise_transfer_id", transferId);

            if (error) throw error;
            console.log(`✅ [Wise Webhook] Updated payout ${transferId} → ${status}`);
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error("❌ [Wise Webhook] Error:", error.message);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
