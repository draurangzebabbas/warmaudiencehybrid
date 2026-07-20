"use client"

import { Progress } from "./ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction } from "./ui/card";
import { IconBolt, IconUsers, IconRadar, IconAlertCircle } from "@tabler/icons-react";
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Badge } from "./ui/badge";
import { supabase } from "@/src/lib/supabase";
import { createClient } from "@/lib/supabase/client";


export function PlanUsage() {
    const supabaseClient = createClient();
    const [counts, setCounts] = useState({ profiles: 0, trackers: 0 });
    const [usage, setUsage] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsage = async () => {
            const { data: { session } } = await supabaseClient.auth.getSession();
            if (!session?.user?.id) {
                setLoading(false);
                return;
            }

            const [profiles, trackers, profileData] = await Promise.all([
                supabase.from("user_leads").select("*", { count: "exact", head: true }).eq("user_id", session.user.id),
                supabase.from("trackers").select("*", { count: "exact", head: true }).eq("user_id", session.user.id).eq("is_active", true),
                supabase.from("profiles").select("plan_slug").eq("id", session.user.id).single()
            ]);

            const planSlug = profileData?.data?.plan_slug || "free";
            let planName = "Free";
            let profilesLimit = 50;
            let trackersLimit = 1;

            if (planSlug === "growth" || planSlug === "pro") {
                planName = "Growth";
                profilesLimit = 1000;
                trackersLimit = 5;
            } else if (planSlug === "scale" || planSlug === "elite") {
                planName = "Scale";
                profilesLimit = 10000;
                trackersLimit = 20;
            }

            setCounts({ 
                profiles: profiles.count || 0, 
                trackers: trackers.count || 0 
            });

            setUsage({
                plan: { name: planName },
                usage: { profilesLimit, trackersLimit }
            });
            setLoading(false);
        };
        fetchUsage();
    }, [supabaseClient]);

    if (loading) {
        return (
            <Card className="animate-pulse bg-gradient-to-t from-primary/5 to-card border-none shadow-none">
                <CardHeader>
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-48" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                </CardContent>
            </Card>
        );
    }

    if (!usage) return null;

    const { plan } = usage;
    const currentUsage = {
        profiles: counts.profiles,
        profilesLimit: usage.usage.profilesLimit,
        trackers: counts.trackers,
        trackersLimit: usage.usage.trackersLimit,
    };

    // Calculate percentages for progress bars
    const profilePercent = Math.min((currentUsage.profiles / currentUsage.profilesLimit) * 100, 100);
    const trackerPercent = Math.min((currentUsage.trackers / currentUsage.trackersLimit) * 100, 100);

    return (
        <Card className="from-primary/5 to-card bg-gradient-to-t shadow-sm border-primary/20 overflow-hidden">
            <CardHeader className="pb-2">
                <div className="flex flex-col gap-1">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        {plan.name} Plan
                        <Badge variant="outline" className="text-[10px] uppercase font-bold text-primary border-primary/20 bg-primary/5">Active</Badge>
                    </CardTitle>
                    <CardDescription>Real-time usage and limits.</CardDescription>
                </div>
                <CardAction>
                    <Button
                        size="sm"
                        variant="outline"
                        asChild
                        className="font-bold border-primary/20 text-primary hover:bg-primary/5"
                    >
                        <Link href="/#pricing" className="flex items-center gap-2">
                            <IconBolt className="size-4" />
                            <span>{plan.name === "Free" ? "Upgrade Agent" : "Expand Limits"}</span>
                        </Link>
                    </Button>
                </CardAction>
            </CardHeader>

            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
                    {/* Profile Usage */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm font-semibold">
                                <IconUsers className="size-4 text-primary" />
                                <span>Lead Storage Slots</span>
                            </div>
                            <div className="text-right">
                                <span className="font-bold">{currentUsage.profiles.toLocaleString()}</span>
                                <span className="text-muted-foreground text-xs ml-1">/ {currentUsage.profilesLimit.toLocaleString()}</span>
                            </div>
                        </div>
                        <Progress value={profilePercent} className="h-1.5" />
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            <span>Total stored leads</span>
                            <span className={profilePercent > 90 ? "text-red-500" : "text-primary"}>
                                {currentUsage.profilesLimit - currentUsage.profiles} Slots Remaining
                            </span>
                        </div>
                    </div>

                    {/* Tracker Usage */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm font-semibold">
                                <IconRadar className="size-4 text-primary" />
                                <span>Active Agents</span>
                            </div>
                            <div className="text-right">
                                <span className="font-bold">{currentUsage.trackers}</span>
                                <span className="text-muted-foreground text-xs ml-1">/ {currentUsage.trackersLimit}</span>
                            </div>
                        </div>
                        <Progress value={trackerPercent} className="h-1.5" />
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            <span>Continuous monitoring</span>
                            <span className="text-primary">
                                {currentUsage.trackersLimit - currentUsage.trackers} Agents Left
                            </span>
                        </div>
                    </div>
                </div>

                {profilePercent > 90 && (
                    <div className="mt-2 flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                        <IconAlertCircle className="size-4 text-red-600 mt-0.5" />
                        <p className="text-xs text-red-700/80">
                            <strong>Limit Reached:</strong> You have consumed over 90% of your profile storage.
                            <Link href="/#pricing" className="ml-1 font-bold underline hover:text-red-800">Upgrade your plan for more capacity.</Link>
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
