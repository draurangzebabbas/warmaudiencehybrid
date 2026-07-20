"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";
import { LiveJobProgress } from "./live-job-progress";

export function GlobalProgress() {
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user?.id) {
                setUserId(session.user.id);
            }
        });
    }, []);

    if (!userId) return null;

    return <LiveJobProgress userId={userId} />;
}
