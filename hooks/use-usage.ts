import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";

export const PLANS = {
    FREE: {
        name: "Free",
        profilesLimit: 1000,
        trackersLimit: 1,
        slug: "free",
    },
    GROWTH: {
        name: "Growth",
        profilesLimit: 10000,
        trackersLimit: 50,
        slug: "growth",
    },
    SCALE: {
        name: "Scale",
        profilesLimit: 1000000,
        trackersLimit: 500,
        slug: "scale",
    }
};

export function getPlanFromSlug(slug: string | undefined) {
    if (slug === "growth") return PLANS.GROWTH;
    if (slug === "scale") return PLANS.SCALE;
    return PLANS.FREE;
}

export function useUsage() {
    const [usage, setUsage] = useState<{
        plan: typeof PLANS.FREE;
        usage: { profilesLimit: number; trackersLimit: number };
    } | null>(null);

    useEffect(() => {
        let isMounted = true;
        const fetchUsage = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                if (isMounted) setUsage({ plan: PLANS.FREE, usage: { profilesLimit: PLANS.FREE.profilesLimit, trackersLimit: PLANS.FREE.trackersLimit } });
                return;
            }

            const { data } = await supabase.from("profiles").select("plan_slug").eq("id", user.id).maybeSingle();
            const planSlug = data?.plan_slug || "free";
            const plan = getPlanFromSlug(planSlug);

            if (isMounted) {
                setUsage({
                    plan,
                    usage: {
                        profilesLimit: plan.profilesLimit,
                        trackersLimit: plan.trackersLimit,
                    }
                });
            }
        };
        fetchUsage();
        return () => { isMounted = false; };
    }, []);

    return usage;
}
