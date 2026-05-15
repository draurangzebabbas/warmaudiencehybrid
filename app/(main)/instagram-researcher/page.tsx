"use client";

import { useState } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatError } from "@/lib/utils";
import { useQuery } from "convex/react";
import { LimitReachedDialog } from "@/components/limit-reached-dialog";
import { supabase } from "@/src/lib/supabase";
import { useEffect } from "react";

export default function InstagramResearchersPage() {
    const [profileUrls, setProfileUrls] = useState("");
    const [postUrls, setPostUrls] = useState("");
    const [followerUrls, setFollowerUrls] = useState("");
    const [extractReactors, setExtractReactors] = useState(false); // Used for Likers
    const [extractCommenters, setExtractCommenters] = useState(true);
    const [extractFollowers, setExtractFollowers] = useState(true);
    const [extractFollowing, setExtractFollowing] = useState(true);
    const [loading, setLoading] = useState(false);
    const [tags, setTags] = useState("");
    const [isLimitDialogOpen, setIsLimitDialogOpen] = useState(false);
    const [profilesCount, setProfilesCount] = useState(0);
    const [maxPages, setMaxPages] = useState(1);
    const [sortBy, setSortBy] = useState("recent");

    const usage = useQuery(api.usage.getUsage);
    const user = useQuery(api.auth.getCurrentUser);
    const getOrCreateKey = useAction(api.actions.supabase.getOrCreateWebhookKey);

    useEffect(() => {
        if (!user?._id) return;
        const fetchCount = async () => {
            const { count } = await supabase
                .from("user_leads")
                .select("*", { count: "exact", head: true })
                .eq("user_id", user._id);
            setProfilesCount(count || 0);
        };
        fetchCount();
    }, [user?._id]);

    const profilesLimit = usage?.usage?.profilesLimit || 1000;
    const isLimitReached = profilesCount >= profilesLimit;


    const handleScrapeProfiles = async () => {
        setLoading(true);
        try {
            const apiData = await getOrCreateKey();
            if (!apiData?.key) throw new Error("Authentication failed: Internal API Key could not be retrieved.");
            const key = apiData.key;

            const lines = profileUrls.split("\n").map(l => l.trim()).filter(Boolean);
            if (lines.length === 0) {
                toast.error("Please enter at least one URL");
                setLoading(false);
                return;
            }

            const extractedUsernames = lines.map(line => {
                // Strip query parameters first
                const cleanLine = line.split("?")[0].replace(/\/$/, "");
                if (cleanLine.includes("instagram.com/")) {
                    return cleanLine.split("/").pop();
                }
                return cleanLine;
            }).filter(Boolean);

            const tagList = tags.split(",").map(t => t.trim()).filter(Boolean);

            const res = await fetch(`${process.env.NEXT_PUBLIC_RENDER_BACKEND_URL || "http://localhost:8000"}/api/scrape-instagram-profiles`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${key}`
                },
                body: JSON.stringify({
                    usernames: extractedUsernames,
                    tags: tagList
                })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Research task failed");
            }

            const data = await res.json();
            toast.success(`Queued profiles for extraction`);
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
            const apiData = await getOrCreateKey();
            if (!apiData?.key) throw new Error("Authentication failed: Internal API Key could not be retrieved.");
            const key = apiData.key;

            const lines = postUrls.split("\n")
                .map(l => l.trim())
                .filter(Boolean)
                .map(url => {
                    // Strip query parameters (UTMs, etc.)
                    const cleanUrl = url.split("?")[0];
                    // Normalize reel/reels to p
                    return cleanUrl.replace(/\/(reel|reels)\//i, "/p/");
                });
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

            const finalMaxPages = Math.min(maxPages, 100);

            const res = await fetch(`${process.env.NEXT_PUBLIC_RENDER_BACKEND_URL || "http://localhost:8000"}/api/scrape-instagram-engagement`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${key}`
                },
                body: JSON.stringify({
                    postUrls: lines,
                    extractLikers: extractReactors,
                    extractCommenters: extractCommenters,
                    maxPages: finalMaxPages,
                    sortBy: sortBy,
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

    const handleScrapeFollowers = async () => {
        setLoading(true);
        try {
            const apiData = await getOrCreateKey();
            if (!apiData?.key) throw new Error("Authentication failed: Internal API Key could not be retrieved.");
            const key = apiData.key;

            const lines = followerUrls.split("\n")
                .map(l => l.trim())
                .filter(Boolean)
                .map(url => url.split("?")[0].replace(/\/$/, ""));
            if (lines.length === 0) {
                toast.error("Please enter at least one URL or username");
                setLoading(false);
                return;
            }

            if (!extractFollowers && !extractFollowing) {
                toast.error("Please select at least one extraction type (Followers or Following)");
                setLoading(false);
                return;
            }

            const tagList = tags.split(",").map(t => t.trim()).filter(Boolean);

            const res = await fetch(`${process.env.NEXT_PUBLIC_RENDER_BACKEND_URL || "http://localhost:8000"}/api/instagram/scrape-followers`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${key}`
                },
                body: JSON.stringify({
                    urls: lines,
                    extractFollowers,
                    extractFollowing,
                    tags: tagList
                })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Research task failed");
            }

            toast.success("Follower extraction started in background. Profiles will appear in your collection shortly.");
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
                <h1 className="text-3xl font-bold tracking-tight">Instagram Lead Research Dashboard</h1>
                <p className="text-muted-foreground text-sm">
                    Collect and organize profile data from Instagram for market research and outreach.
                </p>
            </div>

            <div className="px-6 md:px-8 pb-8">
                <Card className="w-full border-primary/5 shadow-sm">
                    <CardHeader>
                        <CardTitle>Extraction Tools</CardTitle>
                        <CardDescription>Select an extraction method and provide valid Instagram URLs.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="profiles" className="space-y-6">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="profiles">Direct Profile</TabsTrigger>
                                <TabsTrigger value="followers">Followers / Following</TabsTrigger>
                                <TabsTrigger value="engagers">Engagement</TabsTrigger>
                            </TabsList>

                            <TabsContent value="profiles" className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Instagram Profile URLs or Usernames</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Enter Instagram profile URLs or usernames, one per line.
                                    </p>
                                    <Textarea
                                        placeholder="https://www.instagram.com/username&#10;username2"
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
                                        placeholder="e.g. Q1 Campaign, Influencers"
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
                                    <Label>Instagram Post URLs</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Enter Instagram post URLs, one per line.
                                    </p>
                                    <Textarea
                                        placeholder="https://www.instagram.com/p/..."
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
                                                Likers
                                            </Label>
                                        </div>
                                    </div>
                                </div>

                                {extractCommenters && (
                                    <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                                        <div className="space-y-2">
                                            <Label className="text-xs">Max Comment Pages (100 max)</Label>
                                            <Input 
                                                type="number" 
                                                min={1} 
                                                max={100} 
                                                value={maxPages}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value) || 1;
                                                    setMaxPages(val > 100 ? 100 : val);
                                                }}
                                                className="bg-muted/20 h-9"
                                            />
                                            <p className="text-[10px] text-muted-foreground italic">~20-50 comments per page</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs">Sort Comments By</Label>
                                            <Select value={sortBy} onValueChange={setSortBy}>
                                                <SelectTrigger className="h-9 bg-muted/20">
                                                    <SelectValue placeholder="Sort By" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="recent">Most Recent</SelectItem>
                                                    <SelectItem value="popular">Most Popular</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                )}

                                <Button
                                    onClick={handleScrapeEngagers}
                                    disabled={loading}
                                    className="w-full"
                                >
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isLimitReached ? "Lead Limit Reached - Upgrade Plan" : (loading ? "Processing..." : "Extract Engagers")}
                                </Button>
                            </TabsContent>

                            <TabsContent value="followers" className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Instagram Profile URLs or Usernames</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Enter Instagram profile URLs or usernames to extract their audience, one per line.
                                    </p>
                                    <Textarea
                                        placeholder="https://www.instagram.com/username&#10;username2"
                                        rows={12}
                                        value={followerUrls}
                                        onChange={(e) => setFollowerUrls(e.target.value)}
                                        className="font-mono text-sm bg-muted/20"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Tag className="size-3.5 text-muted-foreground" />
                                        Custom Tags (Optional)
                                    </Label>
                                    <Input
                                        placeholder="e.g. Competitor Audience, Influencer Followers"
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
                                                id="p-followers"
                                                checked={extractFollowers}
                                                onCheckedChange={(checked) => setExtractFollowers(checked as boolean)}
                                            />
                                            <Label
                                                htmlFor="p-followers"
                                                className="text-sm font-medium cursor-pointer"
                                            >
                                                Followers
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                                            <Checkbox
                                                id="p-following"
                                                checked={extractFollowing}
                                                onCheckedChange={(checked) => setExtractFollowing(checked as boolean)}
                                            />
                                            <Label
                                                htmlFor="p-following"
                                                className="text-sm font-medium cursor-pointer"
                                            >
                                                Following
                                            </Label>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleScrapeFollowers}
                                    disabled={loading}
                                    className="w-full"
                                >
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isLimitReached ? "Lead Limit Reached - Upgrade Plan" : (loading ? "Processing..." : "Extract Audience")}
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
