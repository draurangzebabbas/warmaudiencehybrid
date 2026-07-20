"use client";
import { useState, useEffect } from "react";

// Convex removed

import { supabase } from "@/src/lib/supabase";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconTrendingUp, IconUsers, IconBuildingCommunity, IconRadar, IconDatabase, IconBrandGoogleMaps, IconBrandLinkedin, IconBrandInstagram, IconWorldSearch } from "@tabler/icons-react";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardStats() {
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState({
        totalPersonalProfiles: 0,
        totalCompanyProfiles: 0,
        googleMapsLeads: 0,
        instagramLeads: 0,
        websiteLeads: 0,
        activeTrackers: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        fetchUser();
    }, []);

    useEffect(() => {
        if (!user?.id) return;

        const fetchStats = async () => {
            try {
                const [personal, company, gmaps, instagram, website, trackers] = await Promise.all([
                    supabase.from("user_leads").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("profile_type", "personal"),
                    supabase.from("user_leads").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("profile_type", "company"),
                    supabase.from("user_leads").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("profile_type", "google_maps"),
                    supabase.from("user_leads").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("profile_type", "instagram"),
                    supabase.from("user_leads").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("profile_type", "website_contact"),
                    supabase.from("trackers").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("is_active", true)
                ]);

                setStats({
                    totalPersonalProfiles: personal.count || 0,
                    totalCompanyProfiles: company.count || 0,
                    googleMapsLeads: gmaps.count || 0,
                    instagramLeads: instagram.count || 0,
                    websiteLeads: website.count || 0,
                    activeTrackers: trackers.count || 0,
                });
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [user?._id]);

    if (loading) {
        return (
            <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @4xl/main:grid-cols-3 @6xl/main:grid-cols-5">
                {[...Array(5)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                        <CardHeader>
                            <Skeleton className="h-4 w-24 mb-2" />
                            <Skeleton className="h-8 w-16" />
                        </CardHeader>
                    </Card>
                ))}
            </div>
        );
    }

    const items = [
        {
            title: "Total Leads",
            value: (stats?.totalPersonalProfiles || 0) + (stats?.totalCompanyProfiles || 0) + (stats?.googleMapsLeads || 0) + (stats?.instagramLeads || 0) + (stats?.websiteLeads || 0),
            description: "Total leads across all platforms",
            icon: IconDatabase,
            color: "text-foreground",
            bg: "bg-muted"
        },
        {
            title: "Linkedin Lead",
            value: (stats?.totalPersonalProfiles || 0) + (stats?.totalCompanyProfiles || 0),
            description: `${stats?.totalPersonalProfiles || 0} Personal Profiles, ${stats?.totalCompanyProfiles || 0} Company Profiles`,
            icon: IconBrandLinkedin,
            color: "text-foreground",
            bg: "bg-muted"
        },
        {
            title: "Instagram Lead",
            value: stats?.instagramLeads || 0,
            description: "Target Instagram profiles",
            icon: IconBrandInstagram,
            color: "text-foreground",
            bg: "bg-muted"
        },
        {
            title: "Google Map Lead",
            value: stats?.googleMapsLeads || 0,
            description: "Local business discoveries",
            icon: IconBrandGoogleMaps,
            color: "text-foreground",
            bg: "bg-muted"
        },
        {
            title: "Website Lead",
            value: stats?.websiteLeads || 0,
            description: "Enriched website contact details",
            icon: IconWorldSearch,
            color: "text-foreground",
            bg: "bg-muted"
        }
    ];

    return (
        <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @4xl/main:grid-cols-3 @6xl/main:grid-cols-5">
            {items.map((item, i) => (
                <Card key={i} className="from-primary/5 to-card bg-gradient-to-t shadow-sm border-primary/10">
                    <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                            <CardDescription className="text-xs font-semibold uppercase tracking-wider">{item.title}</CardDescription>
                            <div className={`p-1.5 rounded-lg ${item.bg}`}>
                                <item.icon className={`size-4 ${item.color}`} />
                            </div>
                        </div>
                        <CardTitle className="text-3xl font-bold tabular-nums">
                            {item.value.toLocaleString()}
                        </CardTitle>
                    </CardHeader>
                    <div className="px-6 pb-4">
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">{item.description}</p>
                    </div>
                </Card>
            ))}
        </div>
    );
}
