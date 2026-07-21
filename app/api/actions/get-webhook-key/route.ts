import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import crypto from "crypto";

function getAdminClient() {
    return createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

export async function GET(req: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use admin client to reliably check — bypasses any RLS edge cases
    const admin = getAdminClient();
    const { data: existing } = await admin
        .from("webhook_api_keys")
        .select("is_active")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();

    return NextResponse.json({ hasKey: !!existing });
}

export async function POST(req: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = getAdminClient();

    // Revoke old keys before creating a new one
    await admin.from("webhook_api_keys").delete().eq("user_id", user.id);

    // Generate random 32 character hex string
    const newKey = Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

    // Hash the key using SHA-256 for secure storage
    const hashedKey = crypto.createHash("sha256").update(newKey).digest("hex");

    const { error } = await admin
        .from("webhook_api_keys")
        .insert({
            user_id: user.id,
            key: hashedKey, // Store the hash, never the plaintext
            is_active: true
        });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Return the plaintext key EXACTLY ONCE to the frontend
    return NextResponse.json({ key: newKey });
}

export async function DELETE(req: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = getAdminClient();
    const { error } = await admin.from("webhook_api_keys").delete().eq("user_id", user.id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
