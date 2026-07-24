"use client";

import { useState, useEffect } from "react";
import { useUsage } from "@/hooks/use-usage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatError } from "@/lib/utils";
import { LimitReachedDialog } from "@/components/limit-reached-dialog";
import { supabase } from "@/src/lib/supabase";
import { Checkbox } from "@/components/ui/checkbox";

export default function XResearchersPage() {
    const [profileUrls, setProfileUrls] = useState("");
    const [postUrls, setPostUrls] = useState("");
    const [followerUrls, setFollowerUrls] = useState("");
    const [maxFollowerCount, setMaxFollowerCount] = useState(200);
    const [maxCommentsPerPost, setMaxCommentsPerPost] = useState(1000);
    const [loading, setLoading] = useState(false);
    const [tags, setTags] = useState("");
    const [getFollowers, setGetFollowers] = useState(true);
    const [getFollowing, setGetFollowing] = useState(false);
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
                const monthYear = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
                const { data } = await supabase
                    .from("user_usage")
                    .select("leads_extracted")
                    .eq("user_id", user.id)
                    .eq("month_year", monthYear)
                    .maybeSingle();
                setProfilesCount(data?.leads_extracted || 0);
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
            if (lines.length === 0) { toast.error("Please enter at least one URL or username"); return; }

            // Extract usernames from x.com URLs or bare usernames
            const usernames = lines.map(line => {
                const clean = line.split("?")[0].replace(/\/$/, "");
                if (clean.includes("x.com/") || clean.includes("twitter.com/")) {
                    return clean.split("/").pop();
                }
                return clean.replace(/^@/, "");
            }).filter(Boolean);

            const tagList = tags.split(",").map(t => t.trim()).filter(Boolean);

            const res = await fetch(`${process.env.NEXT_PUBLIC_RENDER_BACKEND_URL || "http://localhost:8000"}/api/scrape-x-profiles`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
                body: JSON.stringify({ usernames, tags: tagList })
            });
            if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Research task failed"); }
            toast.success(`X profile research started for ${usernames.length} profiles. Check My Leads shortly.`);
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
            if (lines.length === 0) { toast.error("Please enter at least one post URL"); return; }

            const tagList = tags.split(",").map(t => t.trim()).filter(Boolean);

            const res = await fetch(`${process.env.NEXT_PUBLIC_RENDER_BACKEND_URL || "http://localhost:8000"}/api/scrape-x-engagement`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
                body: JSON.stringify({ postUrls: lines, tags: tagList, maxCommentsPerPost })
            });
            if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Research task failed"); }
            toast.success("X engagement extraction started. Commenters will appear in My Leads shortly.");
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

    const handleScrapeFollowers = async () => {
        setLoading(true);
        try {
            const key = await getKey();
            const lines = followerUrls.split("\n")
                .map(l => l.trim()).filter(Boolean)
                .map(url => {
                    const clean = url.split("?")[0].replace(/\/$/, "");
                    if (clean.includes("x.com/") || clean.includes("twitter.com/")) {
                        return clean.split("/").pop();
                    }
                    return clean.replace(/^@/, "");
                }).filter(Boolean);

            if (lines.length === 0) { toast.error("Please enter at least one username"); return; }

            const tagList = tags.split(",").map(t => t.trim()).filter(Boolean);

            const res = await fetch(`${process.env.NEXT_PUBLIC_RENDER_BACKEND_URL || "http://localhost:8000"}/api/scrape-x-followers`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
                body: JSON.stringify({ usernames: lines, maxCount: maxFollowerCount, getFollowers, getFollowing, tags: tagList })
            });
            if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Research task failed"); }
            toast.success(`X follower extraction started for ${lines.length} profiles. Check My Leads shortly.`);
            setFollowerUrls("");
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
                <h1 className="text-3xl font-bold tracking-tight">X (Twitter) Lead Research</h1>
                <p className="text-muted-foreground text-sm">
                    Collect X profiles via direct lookup, post engagement, or follower extraction.
                </p>
            </div>

            <div className="px-6 md:px-8 pb-8">
                <Card className="w-full border-primary/5 shadow-sm">
                    <CardHeader>
                        <CardTitle>Extraction Tools</CardTitle>
                        <CardDescription>Choose a method and provide X URLs or usernames.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="profiles" className="space-y-6">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="profiles">Direct Profile</TabsTrigger>
                                <TabsTrigger value="followers">Followers/Following</TabsTrigger>
                                <TabsTrigger value="engagers">Commenters</TabsTrigger>
                            </TabsList>

                            {/* ─── Direct Profile ─── */}
                            <TabsContent value="profiles" className="space-y-4">
                                <div className="space-y-2">
                                    <Label>X Profile URLs or @usernames</Label>
                                    <p className="text-xs text-muted-foreground">
                                        One per line. Accepts full URLs (x.com/user) or bare usernames.
                                    </p>
                                    <Textarea
                                        placeholder={"https://x.com/elonmusk\nelonmusk\n@naval"}
                                        rows={10}
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
                                        placeholder="e.g. Q1 Campaign, Influencers"
                                        value={tags}
                                        onChange={(e) => setTags(e.target.value)}
                                        className="bg-muted/20"
                                    />
                                    <p className="text-[10px] text-muted-foreground">Separate multiple tags with commas.</p>
                                </div>
                                <Button onClick={handleScrapeProfiles} disabled={loading} className="w-full">
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isLimitReached ? "Lead Limit Reached – Upgrade Plan" : loading ? "Processing..." : "Research Profiles"}
                                </Button>
                            </TabsContent>

                            {/* ─── Followers ─── */}
                            <TabsContent value="followers" className="space-y-4">
                                <div className="space-y-2">
                                    <Label>X Profile URLs or @usernames</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Enter profiles whose <strong>followers</strong> you want to extract, one per line.
                                    </p>
                                    <Textarea
                                        placeholder={"https://x.com/elonmusk\nelonmusk"}
                                        rows={10}
                                        value={followerUrls}
                                        onChange={(e) => setFollowerUrls(e.target.value)}
                                        className="font-mono text-sm bg-muted/20"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Max Followers to Extract</Label>
                                        <Input
                                            type="number"
                                            min={10}
                                            max={5000}
                                            value={maxFollowerCount}
                                            onChange={(e) => setMaxFollowerCount(Number(e.target.value) || 200)}
                                            className="bg-muted/20"
                                        />
                                        <p className="text-[10px] text-muted-foreground">Per account. Default 200.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <Tag className="size-3.5 text-muted-foreground" />
                                            Custom Tags (Optional)
                                        </Label>
                                        <Input
                                            placeholder="e.g. Competitor Audience"
                                            value={tags}
                                            onChange={(e) => setTags(e.target.value)}
                                            className="bg-muted/20"
                                        />
                                    </div>
                                    <div className="space-y-3 pt-2 col-span-2">
                                        <Label className="text-sm font-semibold">Targets to Extract</Label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                                                <Checkbox
                                                    id="x-followers"
                                                    checked={getFollowers}
                                                    onCheckedChange={(checked) => setGetFollowers(checked as boolean)}
                                                />
                                                <Label htmlFor="x-followers" className="text-sm font-medium cursor-pointer">Followers</Label>
                                            </div>
                                            <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                                                <Checkbox
                                                    id="x-following"
                                                    checked={getFollowing}
                                                    onCheckedChange={(checked) => setGetFollowing(checked as boolean)}
                                                />
                                                <Label htmlFor="x-following" className="text-sm font-medium cursor-pointer">Following</Label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <Button onClick={handleScrapeFollowers} disabled={loading} className="w-full">
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isLimitReached ? "Lead Limit Reached – Upgrade Plan" : loading ? "Processing..." : "Extract Audience"}
                                </Button>
                            </TabsContent>

                            {/* ─── Post Engagers ─── */}
                            <TabsContent value="engagers" className="space-y-4">
                                <div className="space-y-2">
                                    <Label>X Post / Tweet URLs</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Extracts commenters from the posts. One URL per line.
                                    </p>
                                    <Textarea
                                        placeholder={"https://x.com/elonmusk/status/123456789"}
                                        rows={10}
                                        value={postUrls}
                                        onChange={(e) => setPostUrls(e.target.value)}
                                        className="font-mono text-sm bg-muted/20"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Max Comments per Post</Label>
                                        <Input
                                            type="number"
                                            min={1}
                                            max={10000}
                                            value={maxCommentsPerPost}
                                            onChange={(e) => {
                                                let val = Number(e.target.value) || 1000;
                                                if (val > 10000) val = 10000;
                                                setMaxCommentsPerPost(val);
                                            }}
                                            className="bg-muted/20"
                                        />
                                        <p className="text-[10px] text-muted-foreground">Default 1000. Max 10,000.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <Tag className="size-3.5 text-muted-foreground" />
                                            Custom Tags (Optional)
                                        </Label>
                                        <Input
                                            placeholder="e.g. High Engagement, Post Commenters"
                                            value={tags}
                                            onChange={(e) => setTags(e.target.value)}
                                            className="bg-muted/20"
                                        />
                                        <p className="text-[10px] text-muted-foreground">Separate multiple tags with commas.</p>
                                    </div>
                                </div>
                                <Button onClick={handleScrapeEngagers} disabled={loading} className="w-full">
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isLimitReached ? "Lead Limit Reached – Upgrade Plan" : loading ? "Processing..." : "Extract Commenters"}
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
