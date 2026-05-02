"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { LiveJobProgress } from "./live-job-progress";

export function GlobalProgress() {
    const user = useQuery(api.auth.getCurrentUser);

    if (!user?._id) return null;

    return <LiveJobProgress userId={user._id} />;
}
