import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createBrowserClient(supabaseUrl, supabaseKey);

// Function to create a client with a custom JWT token (so RLS works securely)
export function getAuthenticatedSupabaseClient(token: string) {
    return createBrowserClient(supabaseUrl, supabaseKey, {
        global: {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    });
}
