import { action } from "./_generated/server";

export const poke = action({
    args: {},
    handler: async (ctx) => {
        const backendUrl = process.env.NEXT_PUBLIC_RENDER_BACKEND_URL;
        if (!backendUrl) {
            console.error("NEXT_PUBLIC_RENDER_BACKEND_URL not set in Convex environment");
            return;
        }

        try {
            const url = `${backendUrl}/api/heartbeat`;
            console.log(`💓 Heartbeat: Poking backend at ${url}`);
            const response = await fetch(url);
            const text = await response.text();
            console.log(`💓 Heartbeat Response: ${text}`);
        } catch (error: any) {
            console.error(`💓 Heartbeat Failed: ${error.message}`);
        }
    },
});
