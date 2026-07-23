"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatError } from "@/lib/utils";
import { useUsage } from "@/hooks/use-usage";
import { LimitReachedDialog } from "@/components/limit-reached-dialog";
import { supabase } from "@/src/lib/supabase";
import { useEffect } from "react";

export default function ResearchersPage() {
    const [profileUrls, setProfileUrls] = useState("");
    const [postUrls, setPostUrls] = useState("");
    const [extractReactors, setExtractReactors] = useState(false);
    const [extractCommenters, setExtractCommenters] = useState(true);
    const [loading, setLoading] = useState(false);
    const [tags, setTags] = useState("");
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


    const handleScrapeProfiles = async () => {
        setLoading(true);
        try {
            const key = await getKey();

            const lines = profileUrls.split("\n").map(l => l.trim()).filter(Boolean);
            if (lines.length === 0) {
                toast.error("Please enter at least one URL");
                setLoading(false);
                return;
            }

            const tagList = tags.split(",").map(t => t.trim()).filter(Boolean);

            const res = await fetch(`${process.env.NEXT_PUBLIC_RENDER_BACKEND_URL || "http://localhost:8000"}/api/scrape-profiles`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${key}`
                },
                body: JSON.stringify({
                    urls: lines,
                    tags: tagList
                })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Research task failed");
            }

            const data = await res.json();
            toast.success(`Queued ${data.counts.personal} personal and ${data.counts.company} company profiles`);
            setProfileUrls("");
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

    const handleScrapeEngagers = async () => {
        setLoading(true);
        try {
            const key = await getKey();

            const lines = postUrls.split("\n").map(l => l.trim()).filter(Boolean);
            if (lines.length === 0) {
                toast.error("Please enter at least one post URL");
                setLoading(false);
                return;
            }

            if (!extractReactors && !extractCommenters) {
                toast.error("Please select at least one engagement type");
                setLoading(false);
                return;
            }

            const tagList = tags.split(",").map(t => t.trim()).filter(Boolean);

            const res = await fetch(`${process.env.NEXT_PUBLIC_RENDER_BACKEND_URL || "http://localhost:8000"}/api/scrape-engagers`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${key}`
                },
                body: JSON.stringify({
                    postUrls: lines,
                    reactors: extractReactors,
                    commenters: extractCommenters,
                    tags: tagList
                })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Research task failed");
            }

            toast.success("Engagement extraction started in background. Profiles will appear in your collection shortly.");
            setPostUrls("");
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
                <h1 className="text-3xl font-bold tracking-tight">Linkedin Lead Research Dashboard</h1>
                <p className="text-muted-foreground text-sm">
                    Collect and organize professional data for market research and internal analysis.
                </p>
            </div>

            <div className="px-6 md:px-8 pb-8">
                <Card className="w-full border-primary/5 shadow-sm">
                    <CardHeader>
                        <CardTitle>Extraction Tools</CardTitle>
                        <CardDescription>Select an extraction method and provide valid LinkedIn URLs.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="profiles" className="space-y-6">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="profiles">Direct Research</TabsTrigger>
                                <TabsTrigger value="engagers">Engagement Extraction</TabsTrigger>
                            </TabsList>

                            <TabsContent value="profiles" className="space-y-4">
                                <div className="space-y-2">
                                    <Label>LinkedIn Profile URLs</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Enter LinkedIn profile or company URLs, one per line. Max 10 URLs recommended for direct extraction.
                                    </p>
                                    <Textarea
                                        placeholder="https://www.linkedin.com/in/username&#10;https://www.linkedin.com/company/companyname"
                                        rows={12}
                                        value={profileUrls}
                                        onChange={(e) => setProfileUrls(e.target.value)}
                                        className="font-mono text-sm bg-muted/20"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Tag className="size-3.5 text-muted-foreground" />
                                        Custom Tags (Optional)
                                    </Label>
                                    <Input
                                        placeholder="e.g. Q1 Campaign, VC Outreach, Tech-Leads"
                                        value={tags}
                                        onChange={(e) => setTags(e.target.value)}
                                        className="bg-muted/20"
                                    />
                                    <p className="text-[10px] text-muted-foreground">Separate multiple tags with commas.</p>
                                </div>
                                <Button
                                    onClick={handleScrapeProfiles}
                                    disabled={loading}
                                    className="w-full"
                                >
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isLimitReached ? "Lead Limit Reached - Upgrade Plan" : (loading ? "Processing..." : "Research Profiles")}
                                </Button>
                            </TabsContent>

                            <TabsContent value="engagers" className="space-y-4">
                                <div className="space-y-2">
                                    <Label>LinkedIn Post URLs</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Enter LinkedIn post URLs, one per line.
                                    </p>
                                    <Textarea
                                        placeholder="https://www.linkedin.com/posts/..."
                                        rows={12}
                                        value={postUrls}
                                        onChange={(e) => setPostUrls(e.target.value)}
                                        className="font-mono text-sm bg-muted/20"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Tag className="size-3.5 text-muted-foreground" />
                                        Custom Tags (Optional)
                                    </Label>
                                    <Input
                                        placeholder="e.g. High Engagement, Commenters-List"
                                        value={tags}
                                        onChange={(e) => setTags(e.target.value)}
                                        className="bg-muted/20"
                                    />
                                    <p className="text-[10px] text-muted-foreground">Separate multiple tags with commas.</p>
                                </div>

                                <div className="space-y-3 pt-2">
                                    <Label className="text-sm font-semibold">Targets to Extract</Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                                            <Checkbox
                                                id="p-commenters"
                                                checked={extractCommenters}
                                                onCheckedChange={(checked) => setExtractCommenters(checked as boolean)}
                                            />
                                            <Label
                                                htmlFor="p-commenters"
                                                className="text-sm font-medium cursor-pointer"
                                            >
                                                Commenters
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                                            <Checkbox
                                                id="p-reactors"
                                                checked={extractReactors}
                                                onCheckedChange={(checked) => setExtractReactors(checked as boolean)}
                                            />
                                            <Label
                                                htmlFor="p-reactors"
                                                className="text-sm font-medium cursor-pointer"
                                            >
                                                Reactors
                                            </Label>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleScrapeEngagers}
                                    disabled={loading}
                                    className="w-full"
                                >
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isLimitReached ? "Lead Limit Reached - Upgrade Plan" : (loading ? "Processing..." : "Extract Engagers")}
                                </Button>
                            </TabsContent>
                        </Tabs>
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
