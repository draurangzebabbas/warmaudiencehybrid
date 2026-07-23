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
import { Checkbox } from "@/components/ui/checkbox";
import { formatError } from "@/lib/utils";
import { LimitReachedDialog } from "@/components/limit-reached-dialog";
import { supabase } from "@/src/lib/supabase";

export default function FacebookResearchersPage() {
    const [profileUrls, setProfileUrls] = useState("");
    const [postUrls, setPostUrls] = useState("");
    const [followerUrls, setFollowerUrls] = useState("");
    const [maxFollowerCount, setMaxFollowerCount] = useState(200);
    const [maxCommentsPerPost, setMaxCommentsPerPost] = useState(100);
    const [extractFollowers, setExtractFollowers] = useState(true);
    const [extractFollowing, setExtractFollowing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [tags, setTags] = useState("");
    
    // Group search and members state
    const [groupSearchKeyword, setGroupSearchKeyword] = useState("");
    const [maxGroupSearchResults, setMaxGroupSearchResults] = useState(200);
    const [groupMemberUrls, setGroupMemberUrls] = useState("");
    const [maxMembersPerGroup, setMaxMembersPerGroup] = useState(50);
    
    const [isLimitDialogOpen, setIsLimitDialogOpen] = useState(false);
    const [profilesCount, setProfilesCount] = useState(0);

    // Derive followType: if only one is checked, pass it; if both, pass "" (both); if neither default to follower
    const getFollowType = () => {
        if (extractFollowers && extractFollowing) return "";  // empty = both
        if (extractFollowers) return "follower";
        if (extractFollowing) return "following";
        return "follower"; // fallback
    };

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
            const urls = profileUrls.split("\n").map(l => l.trim()).filter(Boolean);
            if (urls.length === 0) { toast.error("Please enter at least one Facebook URL"); return; }

            const tagList = tags.split(",").map(t => t.trim()).filter(Boolean);

            const res = await fetch(`${process.env.NEXT_PUBLIC_RENDER_BACKEND_URL || "http://localhost:8000"}/api/scrape-facebook-profiles`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
                body: JSON.stringify({ urls, tags: tagList })
            });
            if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Research task failed"); }
            toast.success(`Facebook profile research started for ${urls.length} profiles. Check My Leads shortly.`);
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

            const res = await fetch(`${process.env.NEXT_PUBLIC_RENDER_BACKEND_URL || "http://localhost:8000"}/api/scrape-facebook-engagement`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
                body: JSON.stringify({ postUrls: lines, tags: tagList, maxCommentsPerPost })
            });
            if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Research task failed"); }
            toast.success("Facebook engagement extraction started. Commenters will appear in My Leads shortly.");
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
            const urls = followerUrls.split("\n").map(l => l.trim()).filter(Boolean);
            if (urls.length === 0) { toast.error("Please enter at least one Facebook URL"); return; }

            const tagList = tags.split(",").map(t => t.trim()).filter(Boolean);

            const res = await fetch(`${process.env.NEXT_PUBLIC_RENDER_BACKEND_URL || "http://localhost:8000"}/api/scrape-facebook-followers`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
                body: JSON.stringify({ urls, maxCount: maxFollowerCount, followType: getFollowType(), tags: tagList })
            });
            if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Research task failed"); }
            toast.success(`Facebook follower extraction started for ${urls.length} profiles. Check My Leads shortly.`);
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

    const handleScrapeGroupsSearch = async () => {
        setLoading(true);
        try {
            const key = await getKey();
            if (!groupSearchKeyword.trim()) { toast.error("Please enter a search keyword"); return; }

            const tagList = tags.split(",").map(t => t.trim()).filter(Boolean);

            const res = await fetch(`${process.env.NEXT_PUBLIC_RENDER_BACKEND_URL || "http://localhost:8000"}/api/scrape-facebook-groups`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
                body: JSON.stringify({ keyword: groupSearchKeyword, maxItems: maxGroupSearchResults, tags: tagList })
            });
            if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Research task failed"); }
            toast.success("Facebook groups search started. Groups will appear in My Leads shortly.");
            setGroupSearchKeyword("");
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

    const handleScrapeGroupMembers = async () => {
        setLoading(true);
        try {
            const key = await getKey();
            const urls = groupMemberUrls.split("\n").map(l => l.trim()).filter(Boolean);
            if (urls.length === 0) { toast.error("Please enter at least one Facebook Group URL"); return; }

            const tagList = tags.split(",").map(t => t.trim()).filter(Boolean);

            const res = await fetch(`${process.env.NEXT_PUBLIC_RENDER_BACKEND_URL || "http://localhost:8000"}/api/scrape-facebook-group-members`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
                body: JSON.stringify({ groupUrls: urls, maxItems: maxMembersPerGroup, tags: tagList })
            });
            if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Research task failed"); }
            toast.success(`Facebook group members extraction started for ${urls.length} groups. Members will appear in My Leads shortly.`);
            setGroupMemberUrls("");
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
                <h1 className="text-3xl font-bold tracking-tight">Facebook Lead Research</h1>
                <p className="text-muted-foreground text-sm">
                    Collect Facebook profiles & pages via direct lookup, post engagement, or follower extraction.
                </p>
            </div>

            <div className="px-6 md:px-8 pb-8">
                <Card className="w-full border-primary/5 shadow-sm">
                    <CardHeader>
                        <CardTitle>Extraction Tools</CardTitle>
                        <CardDescription>Choose a method and provide Facebook URLs.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="profiles" className="space-y-6">
                            <TabsList className="flex flex-wrap h-auto gap-2 p-1">
                                <TabsTrigger value="profiles" className="flex-1">Direct Profile / Page</TabsTrigger>
                                <TabsTrigger value="followers" className="flex-1">Followers/Following</TabsTrigger>
                                <TabsTrigger value="engagers" className="flex-1">Post Commenters</TabsTrigger>
                                <TabsTrigger value="groups" className="flex-1">Groups Search</TabsTrigger>
                                <TabsTrigger value="group-members" className="flex-1">Group Members</TabsTrigger>
                            </TabsList>

                            {/* ─── Direct Profile ─── */}
                            <TabsContent value="profiles" className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Facebook Profile or Page URLs</Label>
                                    <p className="text-xs text-muted-foreground">
                                        One per line. Accepts full Facebook URLs (profiles and pages).
                                    </p>
                                    <Textarea
                                        placeholder={"https://www.facebook.com/zuck\nhttps://www.facebook.com/Apple\nhttps://www.facebook.com/skinplusfindon/"}
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
                                    {isLimitReached ? "Lead Limit Reached – Upgrade Plan" : loading ? "Processing..." : "Research Profiles & Pages"}
                                </Button>
                            </TabsContent>

                            {/* ─── Followers ─── */}
                            <TabsContent value="followers" className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Facebook Profile or Page URLs</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Enter profiles or pages whose <strong>followers</strong> you want to extract, one per line.
                                    </p>
                                    <Textarea
                                        placeholder={"https://www.facebook.com/zuck\nhttps://www.facebook.com/Apple"}
                                        rows={10}
                                        value={followerUrls}
                                        onChange={(e) => setFollowerUrls(e.target.value)}
                                        className="font-mono text-sm bg-muted/20"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Max Results to Extract</Label>
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
                                                    id="fb-followers"
                                                    checked={extractFollowers}
                                                    onCheckedChange={(checked) => setExtractFollowers(checked as boolean)}
                                                />
                                                <Label htmlFor="fb-followers" className="text-sm font-medium cursor-pointer">Followers</Label>
                                            </div>
                                            <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                                                <Checkbox
                                                    id="fb-following"
                                                    checked={extractFollowing}
                                                    onCheckedChange={(checked) => setExtractFollowing(checked as boolean)}
                                                />
                                                <Label htmlFor="fb-following" className="text-sm font-medium cursor-pointer">Following</Label>
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
                                    <Label>Facebook Post URLs</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Extracts commenters from the posts. One URL per line.
                                    </p>
                                    <Textarea
                                        placeholder={"https://www.facebook.com/zuck/posts/10114227090408541"}
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
                                                let val = Number(e.target.value) || 100;
                                                if (val > 10000) val = 10000;
                                                setMaxCommentsPerPost(val);
                                            }}
                                            className="bg-muted/20"
                                        />
                                        <p className="text-[10px] text-muted-foreground">Default 100. Max 10,000.</p>
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

                            {/* ─── Facebook Groups Search ─── */}
                            <TabsContent value="groups" className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Search Keyword</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Enter a keyword to search for Facebook Groups (e.g. "Amazon FBA", "Shopify Sellers").
                                    </p>
                                    <Input
                                        placeholder="e.g. VA Philippines"
                                        value={groupSearchKeyword}
                                        onChange={(e) => setGroupSearchKeyword(e.target.value)}
                                        className="bg-muted/20"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Max Results</Label>
                                        <Input
                                            type="number"
                                            min={10}
                                            max={1000}
                                            value={maxGroupSearchResults}
                                            onChange={(e) => {
                                                let val = Number(e.target.value) || 200;
                                                if (val > 1000) val = 1000;
                                                setMaxGroupSearchResults(val);
                                            }}
                                            className="bg-muted/20"
                                        />
                                        <p className="text-[10px] text-muted-foreground">Max groups to find. Default 200.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <Tag className="size-3.5 text-muted-foreground" />
                                            Custom Tags (Optional)
                                        </Label>
                                        <Input
                                            placeholder="e.g. Found Groups"
                                            value={tags}
                                            onChange={(e) => setTags(e.target.value)}
                                            className="bg-muted/20"
                                        />
                                    </div>
                                </div>
                                <Button onClick={handleScrapeGroupsSearch} disabled={loading} className="w-full">
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isLimitReached ? "Lead Limit Reached – Upgrade Plan" : loading ? "Processing..." : "Search Facebook Groups"}
                                </Button>
                            </TabsContent>

                            {/* ─── Facebook Group Members ─── */}
                            <TabsContent value="group-members" className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Facebook Group URLs</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Extract members from Facebook Groups. One URL per line. Profile URLs will be automatically enriched!
                                    </p>
                                    <Textarea
                                        placeholder={"https://www.facebook.com/groups/71239123847291"}
                                        rows={10}
                                        value={groupMemberUrls}
                                        onChange={(e) => setGroupMemberUrls(e.target.value)}
                                        className="font-mono text-sm bg-muted/20"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Max Members per Group</Label>
                                        <Input
                                            type="number"
                                            min={10}
                                            max={1000}
                                            value={maxMembersPerGroup}
                                            onChange={(e) => {
                                                let val = Number(e.target.value) || 50;
                                                if (val > 1000) val = 1000;
                                                setMaxMembersPerGroup(val);
                                            }}
                                            className="bg-muted/20"
                                        />
                                        <p className="text-[10px] text-muted-foreground">Default 50 (Recommended).</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <Tag className="size-3.5 text-muted-foreground" />
                                            Custom Tags (Optional)
                                        </Label>
                                        <Input
                                            placeholder="e.g. Member of My Group"
                                            value={tags}
                                            onChange={(e) => setTags(e.target.value)}
                                            className="bg-muted/20"
                                        />
                                        <p className="text-[10px] text-muted-foreground">Applied to all enriched profiles.</p>
                                    </div>
                                </div>
                                <Button onClick={handleScrapeGroupMembers} disabled={loading} className="w-full">
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isLimitReached ? "Lead Limit Reached – Upgrade Plan" : loading ? "Processing..." : "Extract Group Members"}
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

