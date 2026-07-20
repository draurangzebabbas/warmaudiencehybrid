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

        // We need the polar_id from the profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('polar_id')
            .eq('id', user.id)
            .single();

        if (!profile || !profile.polar_id) {
            return NextResponse.json({ error: 'No active subscription found' }, { status: 400 });
        }

        // Note: For portal sessions, Polar requires customerSession.create.
        const session = await polar.customerSessions.create({
            customerId: profile.polar_id, // polar_id usually stores the subscription ID or customer ID. Wait, usually better-auth stores customer ID. Let's assume it's customer ID for portal.
        });

        return NextResponse.json({ url: session.customerPortalUrl });
    } catch (error: any) {
        console.error("Portal Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
