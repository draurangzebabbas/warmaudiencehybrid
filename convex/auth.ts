import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { components, internal, api } from "./_generated/api";
import { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import { betterAuth } from "better-auth";
import { Resend } from "resend";
import authConfig from "./auth.config";
import { polar, checkout, portal, usage, webhooks } from "@polar-sh/better-auth";
import { Polar } from "@polar-sh/sdk";


// Initialize Resend with a dummy key if missing to prevent analysis errors
const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_key");

// Standard Buffer polyfill for Convex / V8 environments
if (typeof (globalThis as any).Buffer === "undefined") {
    (globalThis as any).Buffer = {
        from: (data: any, encoding?: string) => {
            if (typeof data === "string") {
                if (encoding === "base64") {
                    // Handle Base64URL and regular Base64
                    let base64 = data.replace(/-/g, "+").replace(/_/g, "/");
                    // Add padding if missing
                    while (base64.length % 4) {
                        base64 += "=";
                    }
                    const bin = atob(base64);
                    const res = new Uint8Array(bin.length);
                    for (let i = 0; i < bin.length; i++) res[i] = bin.charCodeAt(i);
                    return res;
                }
                return new TextEncoder().encode(data);
            }
            return new Uint8Array(data);
        },
        alloc: (size: number) => new Uint8Array(size),
        isBuffer: (obj: any) => obj instanceof Uint8Array,
    } as any;
}

const getPolarClient = () => {
    // Explicitly check for Sandbox env variable
    const isSandbox = process.env.NEXT_PUBLIC_POLAR_SANDBOX === 'true';

    return new Polar({
        accessToken: process.env.POLAR_ACCESS_TOKEN || "",
        server: isSandbox ? 'sandbox' : 'production'
    });
};

const polarClient = getPolarClient();

// The component client has methods needed for integrating Convex with Better Auth,
// as well as helper methods for general use.
export const authComponent = createClient<DataModel>(components.betterAuth as any);

export const createAuth = (ctx: GenericCtx<DataModel>) => {
    return betterAuth({
        baseURL: process.env.BETTER_AUTH_URL!,
        secret: process.env.BETTER_AUTH_SECRET!,
        database: authComponent.adapter(ctx),
        logger: {
            level: "debug",
        },
        // ...
        emailAndPassword: {
            enabled: true,
            requireEmailVerification: false,
            async sendResetPassword(data) {
                const resetLink = `${process.env.BETTER_AUTH_URL}/reset-password?token=${data.token}`;
                const fromName = process.env.RESEND_FROM_NAME || "WarmAudience Support";
                const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

                await resend.emails.send({
                    from: `${fromName} <${fromEmail}>`,
                    to: data.user.email,
                    subject: "Reset your password",
                    html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
                });
            },
        },
        socialProviders: {
            google: {
                clientId: process.env.GOOGLE_CLIENT_ID!,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            },
        },
        plugins: [
            // The Convex plugin MUST be first to register base routes correctly
            convex({ authConfig }),
            polar({
                client: polarClient,
                // Pass the real Org ID from your dashboard screenshot
                organizationId: process.env.POLAR_ORGANIZATION_ID,
                createCustomerOnSignUp: true,
                use: [
                    checkout({
                        products: [
                            {
                                productId: process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_GROWTH!,
                                slug: "pro"
                            },
                            {
                                productId: process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_SCALE!,
                                slug: "elite"
                            }
                        ],
                        // Ensure we use the full URL
                        successUrl: `${process.env.BETTER_AUTH_URL}/dashboard?checkout_id={CHECKOUT_ID}`,
                        authenticatedUsersOnly: true
                    }),
                    portal(),
                    usage(),
                ],
            }),
        ],
        events: {
            user: {
                created: async ({ user }: { user: any }) => {
                    console.log(`🆕 [Auth Event] User Created: ${user.id} (${user.email})`);

                    try {
                        // INITIALIZE Subscription table row immediately on signup
                        await (ctx as any).runMutation(internal.subscriptions.createInitialSubscriptionRecord, {

                            userId: user.id,
                            email: user.email,
                        });
                        console.log(`✅ [Auth Event] Subscription record created for ${user.id} (${user.email})`);
                    } catch (e) {
                        console.error(`❌ [Auth Event] Subscription failed for ${user.id}:`, e);
                    }

                    // Auto-generate affiliate profile for new user
                    try {
                        await (ctx as any).runMutation(components.affiliate.management.createAffiliate, {
                            userId: user.id,
                            email: user.email,
                        });
                        console.log(`✅ [Auth Event] Affiliate profile created for user ${user.id}`);
                    } catch (error) {
                        console.error(`❌ [Auth Event] Affiliate failed for ${user.id}:`, error);
                    }

                    console.log(`✅ User ${user.id} initialized (API Key + Subscription Record)`);
                },
            },
        },
    })
}

// Example function for getting the current user
// Feel free to edit, omit, etc.
export const getCurrentUser = query({
    args: {},
    handler: async (ctx) => {
        try {
            return await authComponent.getAuthUser(ctx);
        } catch (e) {
            // Return null if unauthenticated or error occurs during fetch
            return null;
        }
    },
});