import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Polar } from '@polar-sh/sdk';

const polar = new Polar({
    accessToken: process.env.POLAR_ACCESS_TOKEN || "",
    server: process.env.NEXT_PUBLIC_POLAR_SANDBOX === 'true' ? 'sandbox' : 'production'
});

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { slug } = body;

        let productId = "";
        if (slug === "pro") {
            productId = process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_GROWTH!;
        } else if (slug === "elite") {
            productId = process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_SCALE!;
        } else {
            return NextResponse.json({ error: 'Invalid plan slug' }, { status: 400 });
        }

        const checkout = await polar.checkouts.custom.create({
            productId: productId,
            customerEmail: user.email,
            successUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard?checkout_id={CHECKOUT_ID}`,
        });

        return NextResponse.json({ url: checkout.url });
    } catch (error: any) {
        console.error("Checkout Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
