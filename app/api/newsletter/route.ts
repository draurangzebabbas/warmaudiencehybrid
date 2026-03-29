import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const apiKey = process.env.BEEHIIV_API_KEY;
        const publicationId = process.env.BEEHIIV_PUBLICATION_ID;

        if (!apiKey || !publicationId) {
            console.error("Beehiiv credentials missing");
            return NextResponse.json({ error: "Newsletter service not configured" }, { status: 500 });
        }

        const response = await fetch(
            `https://api.beehiiv.com/v2/publications/${publicationId}/subscriptions`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    email: email,
                    send_welcome_email: true,
                    utm_source: process.env.BEEHIIV_UTM_SOURCE || "website",
                }),
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Beehiiv API Error:", errorData);
            return NextResponse.json({ error: "Failed to subscribe" }, { status: response.status });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Newsletter API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
