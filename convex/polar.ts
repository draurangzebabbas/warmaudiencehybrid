"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { validateEvent, WebhookVerificationError } from "@polar-sh/sdk/webhooks";

/**
 * AUTHORITATIVE WEBHOOK HANDLER (Convex-Side)
 * This is called directly by Polar via your .convex.site URL.
 */
export const handlePolarWebhook = action({
    args: {
        payload: v.string(),
        headers: v.any(), // Record<string, string>
    },
    handler: async (ctx, args) => {
        const secret = process.env.POLAR_WEBHOOK_SECRET;
        if (!secret) {
            console.error("❌ POLAR_WEBHOOK_SECRET is not set in Convex Dashboard");
            return { status: 500, message: "Secret Missing" };
        }

        const { payload, headers } = args;

        console.log("📥 [Webhook Trace] Incoming request to /polar-webhook");
        console.log("📥 [Webhook Trace] Headers:", JSON.stringify(headers));

        // 1. Standard Webhooks (Svix) Signature Verification
        try {
            try {
                validateEvent(payload, headers, secret);
            } catch (err) {
                if (err instanceof WebhookVerificationError) {
                    console.error("❌ [Webhook Trace] Signature Mismatch via Polar SDK!", err.message);
                    return { status: 401, message: "Invalid Signature" };
                }
                console.error("❌ [Webhook Trace] Webhook Validation Error:", err);
                return { status: 400, message: "Validation Failed" };
            }

            console.log("✅ [Webhook Trace] Signature Verified");
            // 2. Process the Event
            const event = JSON.parse(payload);
            const { type, data } = event;
            const email = (data.customer?.email || data.user?.email || data.customer_email || "").toLowerCase().trim();

            if (!email) {
                return { status: 200, message: "No Email" };
            }

            console.log(`📡 [Polar] Processing ${type} for ${email}`);

            // 3. Affiliate Logic
            if (type === "order.created" || type === "order.paid") {
                let amount = 0;
                if (data.amount !== undefined) {
                    amount = typeof data.amount === 'object' ? data.amount.amount : data.amount;
                } else if (data.price_amount !== undefined) {
                    amount = data.price_amount;
                }

                if (amount > 0) {
                    await ctx.runMutation(api.affiliate_program.processWebhook, {
                        email,
                        amount: Number(amount),
                        orderId: data.id,
                        productId: data.product_id || data.product?.id || "unknown",
                        productName: data.product?.name || "Premium Plan"
                    });
                }
            }

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

                await ctx.runMutation(api.subscriptions.updateSubscription, {
                    email,
                    polarId: data.id,
                    status: data.status,
                    planSlug,
                    currentPeriodStart: data.current_period_start ? new Date(data.current_period_start).getTime() : undefined,
                    currentPeriodEnd: data.current_period_end ? new Date(data.current_period_end).getTime() : undefined,
                    cancelAtPeriodEnd: data.cancel_at_period_end,
                });
            }

            return { status: 200, message: "Success" };
        } catch (err: any) {
            console.error("❌ Webhook Fatal Error:", err.message);
            return { status: 500, message: "Internal Error" };
        }
    }
});

/**
 * SELF-CORRECTION ACTION: Sync directly from Polar API.
 * Useful when webhooks are blocked/failing on Localhost.
 */
export const syncFromPolar = action({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        const POLAR_ACCESS_TOKEN = process.env.POLAR_ACCESS_TOKEN;
        const ORG_ID = process.env.POLAR_ORGANIZATION_ID;

        if (!POLAR_ACCESS_TOKEN || !ORG_ID) {
            console.error("❌ Missing POLAR configuration in Convex Dashboard");
            return;
        }

        const isSandbox = process.env.NEXT_PUBLIC_POLAR_SANDBOX === 'true';
        const BASE_URL = isSandbox ? "https://sandbox-api.polar.sh" : "https://api.polar.sh";

        console.log(`📡 [Self-Correction] Syncing ${args.email} directly from Polar API...`);

        try {
            const url = new URL(`${BASE_URL}/v1/subscriptions`);
            url.searchParams.append("organization_id", ORG_ID);

            const response = await fetch(url.toString(), {
                headers: { "Authorization": `Bearer ${POLAR_ACCESS_TOKEN}` }
            });

            if (!response.ok) throw new Error(`API Error: ${response.status}`);

            const json = await response.json();
            const subs = json.items || [];
            const searchEmail = args.email.toLowerCase().trim();

            const userSub = subs.find((s: any) => {
                const subEmail = (s.user?.email || s.customer?.email || s.customer_email || "").toLowerCase().trim();
                return subEmail === searchEmail && (s.status === 'active' || s.status === 'trialing');
            });

            if (userSub) {
                const productId = userSub.product_id || userSub.product?.id;
                const growthId = (process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_GROWTH || "").trim();
                const scaleId = (process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_SCALE || "").trim();

                let planSlug = "free";
                if (productId === growthId) planSlug = "growth";
                else if (productId === scaleId) planSlug = "scale";

                await ctx.runMutation(api.subscriptions.updateSubscription, {
                    email: args.email,
                    polarId: userSub.id,
                    status: userSub.status,
                    planSlug: planSlug,
                    currentPeriodStart: userSub.current_period_start ? new Date(userSub.current_period_start).getTime() : undefined,
                    currentPeriodEnd: userSub.current_period_end ? new Date(userSub.current_period_end).getTime() : undefined,
                    cancelAtPeriodEnd: userSub.cancel_at_period_end,
                });
                console.log(`✅ [Self-Correction] Success! Plan set to: ${planSlug}`);
                return planSlug;
            } else {
                console.log(`ℹ️ [Self-Correction] No active paid sub found for ${args.email}.`);
                return "free";
            }
        } catch (e) {
            console.error("❌ [Self-Correction] Failed:", e);
        }
    }
});
