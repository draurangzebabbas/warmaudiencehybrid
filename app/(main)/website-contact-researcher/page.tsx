"use client";

import { useState, useEffect } from "react";
import { useUsage } from "@/hooks/use-usage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Tag, Globe, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatError } from "@/src/lib/utils";
import { LimitReachedDialog } from "@/components/limit-reached-dialog";
import { supabase } from "@/src/lib/supabase";

export default function WebsiteContactResearcherPage() {
    const [domains, setDomains] = useState("");
    const [tags, setTags] = useState("");
    const [loading, setLoading] = useState(false);

    const [isLimitDialogOpen, setIsLimitDialogOpen] = useState(false);
    const [profilesCount, setProfilesCount] = useState(0);

    const usage = useUsage();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchUserAndCount = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            if (user) {
                const now = new Date();
                const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
                const { count } = await supabase
                    .from("user_leads")
                    .select("*", { count: "exact", head: true })
                    .eq("user_id", user.id)
                    .gte("created_at", firstDayOfMonth);
                setProfilesCount(count || 0);
            }
        };
        fetchUserAndCount();
    }, []);

    const profilesLimit = usage?.usage?.profilesLimit || 1000;
    const isLimitReached = profilesCount >= profilesLimit;

    const getKey = async () => {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) throw new Error("Authentication failed");
        return session.access_token;
    };

    const handleScrapeWebsiteContacts = async () => {
        setLoading(true);
        try {
            const domainList = domains.split("\n").map(d => d.trim()).filter(Boolean);
            if (domainList.length === 0) {
                toast.error("Please enter website domains (one per line)");
                setLoading(false);
                return;
            }

            const key = await getKey();

            const tagList = tags.split(",").map(t => t.trim()).filter(Boolean);

            const res = await fetch(`${process.env.NEXT_PUBLIC_RENDER_BACKEND_URL || "http://localhost:8000"}/api/scrape-website-contacts`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${key}`
                },
                body: JSON.stringify({
                    domains: domainList,
                    tags: tagList
                })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Website contact extraction failed");
            }

            toast.success("Website contact extraction started in background. Results will appear in your collection shortly.");
            setDomains("");
            setTags("");
        } catch (e: any) {
            const formatted = formatError(e);
            if (formatted.includes("Limit Reached") || e.status === 403) {
                setIsLimitDialogOpen(true);
            } else {
                toast.error(formatted);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-0 space-y-6">
            <div className="px-6 pt-6 md:px-8 md:pt-8 flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Website Contact Research</h1>
                <p className="text-muted-foreground text-sm">
                    Extract emails, phone numbers, and social media links from any website domain.
                </p>
            </div>

            <div className="px-6 md:px-8 pb-8">
                <Card className="w-full border-primary/5 shadow-sm">
                    <CardHeader>
                        <CardTitle>Extraction Parameters</CardTitle>
                        <CardDescription>Enter website domains to find contact information.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Globe className="size-3.5 text-muted-foreground" />
                                Website Domains (One per line)
                            </Label>
                            <Textarea
                                placeholder="e.g.&#10;shopify.com&#10;apple.com&#10;google.com"
                                value={domains}
                                onChange={(e) => setDomains(e.target.value)}
                                className="bg-muted/20 min-h-[150px]"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Tag className="size-3.5 text-muted-foreground" />
                                Custom Tags (Optional)
                            </Label>
                            <Input
                                placeholder="e.g. Outreach-Batch-1, E-commerce-leads"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                className="bg-muted/20"
                            />
                        </div>

                        <Button
                            onClick={handleScrapeWebsiteContacts}
                            disabled={loading}
                            className="w-full"
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isLimitReached ? "Lead Limit Reached - Upgrade Plan" : (loading ? "Processing..." : "Extract Website Contacts")}
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <LimitReachedDialog 
                isOpen={isLimitDialogOpen} 
                onOpenChange={setIsLimitDialogOpen}
                limitType="leads"
                currentLimit={profilesLimit}
            />
        </div>
    );
}
