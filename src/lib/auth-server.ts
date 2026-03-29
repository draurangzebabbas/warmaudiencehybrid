import { convexBetterAuthNextJs } from "@convex-dev/better-auth/nextjs";

if (process.env.NEXT_PUBLIC_CONVEX_SITE_URL === undefined) {
    console.error("WARNING: NEXT_PUBLIC_CONVEX_SITE_URL is not defined in your environment variables. Authentication will fail.");
}

export const {
    handler,
    preloadAuthQuery,
    isAuthenticated,
    getToken,
    fetchAuthQuery,
    fetchAuthMutation,
    fetchAuthAction,
} = convexBetterAuthNextJs({
    convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL!,
    convexSiteUrl: process.env.NEXT_PUBLIC_CONVEX_SITE_URL!,
});