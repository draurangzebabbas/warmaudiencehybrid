import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

authComponent.registerRoutes(http, createAuth);

// --- POLAR WEBHOOK ROUTE ---
// Point your Polar Webhook URL to: https://YOUR-CONVEX-DOMAIN.convex.site/polar-webhook
http.route({
    path: "/polar-webhook",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        const payload = await request.text();
        const headers: Record<string, string> = {};
        request.headers.forEach((val, key) => {
            headers[key] = val;
        });

        const result = await ctx.runAction(api.polar.handlePolarWebhook, {
            payload,
            headers,
        });

        return new Response(result.message, { status: result.status });
    }),
});

http.route({
    path: "/polar-webhook",
    method: "GET",
    handler: httpAction(async (ctx) => {
        return new Response("✅ Polar Webhook is listening! Use POST for actual webhooks.", { status: 200 });
    }),
});

export default http;