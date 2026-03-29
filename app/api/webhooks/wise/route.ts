import { NextResponse } from "next/server";
import { fetchAuthMutation } from "@/src/lib/auth-server";
import { api } from "@/convex/_generated/api";

// Wise Webhook Handler
// This version implements robust event filtering and status mapping 
// as confirmed by Wise Sandbox logs and documentation.
export async function POST(req: Request) {
    try {
        const body = await req.text();
        const event = JSON.parse(body);

        // Wise uses 'event_type' with specific formats like 'transfers#state-change'
        const eventType = event.event_type || event.type || "";
        console.log(`🔔 [Wise Webhook] Received event: ${eventType}`);
        console.log("📦 Full Event Body:", JSON.stringify(event, null, 2));

        // 🟢 FIX: Correctly check for Wise various event formats
        const isStateChange = eventType.includes("state-change") || eventType === "transfer.state-change";
        const isPayoutFailure = eventType.includes("payout-failure");

        if (!isStateChange && !isPayoutFailure) {
            return NextResponse.json({ ignored: true });
        }

        const transferId = String(event.data.resource.id);
        const state = event.data.current_state;

        console.log(`🔔 [Wise Webhook] Transfer ${transferId} changed to state: ${state}`);

        let status: "completed" | "failed" | "processing" | null = null;
        let reason: string | undefined;

        // 🟠 Handle Payout Failures directly
        if (isPayoutFailure) {
            status = "failed";
            reason = event.data.failure_description || "Wise payout failure event received.";
        } else {
            // 🟢 Handle State Changes
            switch (state) {
                case "outgoing_payment_sent":
                    status = "completed";
                    break;
                case "bounced_back":
                case "funds_refunded":
                case "cancelled":
                case "charged_back":
                    status = "failed";
                    reason = `Transfer failed at Wise. End state: ${state}`;
                    break;
                case "incoming_payment_waiting":
                case "processing":
                case "funds_converted":
                    status = "processing";
                    break;
                default:
                    status = null; // Ignore intermediate unknown states
            }
        }

        // We update the DB when we reach a final state (completed/failed)
        // or if we want to confirm it's still processing.
        if (status && status !== "processing") {
            await fetchAuthMutation(api.affiliate_program.updatePayoutStatusByWiseId, {
                wiseTransferId: transferId,
                status,
                failureReason: reason,
            });
            console.log(`✅ [Wise Webhook] Updated payout ${transferId} to status: ${status}`);
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error("❌ [Wise Webhook] Critical Error:", error.message);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
