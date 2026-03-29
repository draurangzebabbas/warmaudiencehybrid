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
        profilesLimit: 1000000, // Effectively unlimited
        trackersLimit: 500,
        slug: "scale",
    }
};

export type Plan = keyof typeof PLANS;

export function getPlanFromSlug(slug: string | undefined): Plan {
    if (slug === "growth") return "GROWTH";
    if (slug === "scale") return "SCALE";
    return "FREE";
}
