"use client";

import { useState, useEffect } from "react";
import { useMutation, useAction } from "convex/react";

import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check, Loader2, ExternalLink, Zap, Shield, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

export default function WebhookPage() {
    const getOrCreateKey = useAction(api.actions.supabase.getOrCreateWebhookKey);

    const { data: session } = authClient.useSession();
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [copiedUrl, setCopiedUrl] = useState(false);
    const [copiedKey, setCopiedKey] = useState(false);

    const backendUrl = process.env.NEXT_PUBLIC_RENDER_BACKEND_URL || "http://localhost:8000";

    useEffect(() => {
        setMounted(true);
        if (!session) return;

        const fetchKey = async () => {
            try {
                const result = await getOrCreateKey();
                if (result) {
                    setApiKey(result.key);
                }
            } catch (error) {
                console.error("Failed to fetch API key", error);
            } finally {
                setLoading(false);
            }
        };
        fetchKey();
    }, [getOrCreateKey, session]);

    const copyToClipboard = (text: string, isUrl: boolean) => {
        navigator.clipboard.writeText(text);
        if (isUrl) {
            setCopiedUrl(true);
            setTimeout(() => setCopiedUrl(false), 2000);
        } else {
            setCopiedKey(true);
            setTimeout(() => setCopiedKey(false), 2000);
        }
        toast.success("Copied to clipboard");
    };

    const sampleProfilePayload = {
        urls: [
            "https://www.linkedin.com/in/williamhgates",
            "https://www.linkedin.com/company/microsoft"
        ]
    };

    const sampleEngagerPayload = {
        postUrls: [
            "https://www.linkedin.com/posts/username_activity-123456789"
        ],
        reactors: false,
        commenters: true
    };

    const sampleGoogleMapsPayload = {
        searchStringsArray: ["car wash"],
        locationQuery: "Paris",
        maxCrawledPlacesPerSearch: 5
    };

    const curlProfileCommand = `curl -X POST ${backendUrl}/api/scrape-profiles \\
  -H "Authorization: Bearer ${apiKey || "YOUR_API_KEY"}" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(sampleProfilePayload)}'`;

    const curlEngagerCommand = `curl -X POST ${backendUrl}/api/scrape-engagers \\
  -H "Authorization: Bearer ${apiKey || "YOUR_API_KEY"}" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(sampleEngagerPayload)}'`;

    const curlGoogleMapsCommand = `curl -X POST ${backendUrl}/api/scrape-google-maps \\
  -H "Authorization: Bearer ${apiKey || "YOUR_API_KEY"}" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(sampleGoogleMapsPayload)}'`;

    if (!mounted) {
        return (
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-8 pt-6 max-w-6xl mx-auto w-full">
                <div className="h-8 w-64 bg-muted rounded animate-pulse" />
                <div className="h-48 bg-muted rounded animate-pulse" />
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col p-0 space-y-6">
            <div className="px-6 pt-6 md:px-8 md:pt-8 flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">API & Webhooks</h1>
                <p className="text-muted-foreground text-sm">
                    Automate LinkedIn data workflows by integrating our endpoints into your systems.
                </p>
            </div>

            <div className="px-6 md:px-8 pb-8 space-y-8">

                <Card>
                    <CardHeader>
                        <CardTitle>API Credentials</CardTitle>
                        <CardDescription>
                            Use these credentials to authenticate your API requests securely.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="url">Base API URL</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    id="url"
                                    value={backendUrl}
                                    readOnly
                                    className="font-mono bg-muted/50"
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => copyToClipboard(backendUrl, true)}
                                >
                                    {copiedUrl ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="apiKey">Bearer Token</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    id="apiKey"
                                    value={loading ? "Loading..." : apiKey || ""}
                                    readOnly
                                    type="password"
                                    className="font-mono bg-muted/50"
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => apiKey && copyToClipboard(apiKey, false)}
                                    disabled={loading || !apiKey}
                                >
                                    {copiedKey ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Available Endpoints</CardTitle>
                                <CardDescription>
                                    Secure RESTful API endpoints for target LinkedIn data extraction.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2 border-l-2 border-primary/20 pl-4 py-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded tracking-wider">POST</span>
                                        <code className="text-sm font-mono font-semibold">/api/scrape-profiles</code>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Queue LinkedIn personal and company profiles for extraction.
                                    </p>
                                </div>

                                <div className="space-y-2 border-l-2 border-primary/20 pl-4 py-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded tracking-wider">POST</span>
                                        <code className="text-sm font-mono font-semibold">/api/scrape-engagers</code>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Extract target profiles from individuals who engaged with specific posts.
                                    </p>
                                </div>

                                <div className="space-y-2 border-l-2 border-primary/20 pl-4 py-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded tracking-wider">POST</span>
                                        <code className="text-sm font-mono font-semibold">/api/scrape-google-maps</code>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Extract local business leads and emails from Google Maps searches.
                                    </p>
                                </div>

                                <div className="space-y-2 border-l-2 border-primary/20 pl-4 py-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded tracking-wider">POST</span>
                                        <code className="text-sm font-mono font-semibold">/api/competitor-tracking/schedule</code>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Configure automated recurring trackers for keyword-based search or specific profile monitoring.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Implementation Examples</CardTitle>
                                <CardDescription>Quick start guides for your terminal or scripts.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Tabs defaultValue="profiles" className="w-full">
                                    <TabsList className="w-full grid grid-cols-3 mb-6">
                                        <TabsTrigger value="profiles">Profile Scraping</TabsTrigger>
                                        <TabsTrigger value="engagers">Engagement Extraction</TabsTrigger>
                                        <TabsTrigger value="gmaps">Google Maps</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="profiles" className="space-y-6 animate-in fade-in duration-300">
                                        <div className="relative rounded-xl bg-muted p-5 font-mono text-sm overflow-x-auto border">
                                            <div className="absolute right-4 top-4">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 hover:bg-background/20"
                                                    onClick={() => copyToClipboard(curlProfileCommand, true)}
                                                >
                                                    <Copy className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <pre className="whitespace-pre-wrap break-all pr-12 text-xs leading-relaxed opacity-80">
                                                {curlProfileCommand}
                                            </pre>
                                        </div>
                                        <div className="rounded-xl border p-5 bg-card shadow-sm">
                                            <h4 className="font-semibold mb-3 text-sm flex items-center gap-2">
                                                <Shield className="size-4 text-primary" /> Request Body
                                            </h4>
                                            <pre className="text-xs font-mono bg-muted/50 p-4 rounded-lg overflow-auto border shadow-inner">
                                                {JSON.stringify(sampleProfilePayload, null, 2)}
                                            </pre>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="engagers" className="space-y-6 animate-in fade-in duration-300">
                                        <div className="relative rounded-xl bg-muted p-5 font-mono text-sm overflow-x-auto border">
                                            <div className="absolute right-4 top-4">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 hover:bg-background/20"
                                                    onClick={() => copyToClipboard(curlEngagerCommand, true)}
                                                >
                                                    <Copy className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <pre className="whitespace-pre-wrap break-all pr-12 text-xs leading-relaxed opacity-80">
                                                {curlEngagerCommand}
                                            </pre>
                                        </div>
                                        <div className="rounded-xl border p-5 bg-card shadow-sm">
                                            <h4 className="font-semibold mb-3 text-sm flex items-center gap-2">
                                                <Shield className="size-4 text-primary" /> Request Body
                                            </h4>
                                            <pre className="text-xs font-mono bg-muted/50 p-4 rounded-lg overflow-auto border shadow-inner">
                                                {JSON.stringify(sampleEngagerPayload, null, 2)}
                                            </pre>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="gmaps" className="space-y-6 animate-in fade-in duration-300">
                                        <div className="relative rounded-xl bg-muted p-5 font-mono text-sm overflow-x-auto border">
                                            <div className="absolute right-4 top-4">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 hover:bg-background/20"
                                                    onClick={() => copyToClipboard(curlGoogleMapsCommand, true)}
                                                >
                                                    <Copy className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <pre className="whitespace-pre-wrap break-all pr-12 text-xs leading-relaxed opacity-80">
                                                {curlGoogleMapsCommand}
                                            </pre>
                                        </div>
                                        <div className="rounded-xl border p-5 bg-card shadow-sm">
                                            <h4 className="font-semibold mb-3 text-sm flex items-center gap-2">
                                                <Shield className="size-4 text-primary" /> Request Body
                                            </h4>
                                            <pre className="text-xs font-mono bg-muted/50 p-4 rounded-lg overflow-auto border shadow-inner">
                                                {JSON.stringify(sampleGoogleMapsPayload, null, 2)}
                                            </pre>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="overflow-hidden border-2 border-primary/5">
                            <CardHeader className="bg-primary/5 border-b">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Zap className="size-4 text-primary fill-primary" /> Performance Architecture
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6 text-sm">
                                <div className="flex gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                        <Shield className="size-4 text-foreground" />
                                    </div>
                                    <div>
                                        <p className="font-bold mb-1">Smart Deduplication</p>
                                        <p className="text-muted-foreground text-xs leading-relaxed">
                                            Target profiles are stored in our global intelligence cache. If a URL has been scraped recently, we provide high-speed access to existing data, saving you time and resources.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                        <RefreshCw className="size-4 text-foreground" />
                                    </div>
                                    <div>
                                        <p className="font-bold mb-1">Async Queue Processing</p>
                                        <p className="text-muted-foreground text-xs leading-relaxed">
                                            All extraction tasks are processed asynchronously via our background worker pool. This ensures your integration stays responsive even when handling bulk URL sets.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                        <Zap className="size-4 text-foreground" />
                                    </div>
                                    <div>
                                        <p className="font-bold mb-1">Auto-Key Rotation</p>
                                        <p className="text-muted-foreground text-xs leading-relaxed">
                                            Our infrastructure automatically cycles through your connected LinkedIn API keys to defeat rate limits and maximize extraction throughput.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-muted/10 border-dashed">
                            <CardContent className="pt-6 flex flex-col items-center text-center space-y-3">
                                <div className="h-12 w-12 rounded-full bg-background border flex items-center justify-center shadow-sm">
                                    <ExternalLink className="size-5 text-muted-foreground" />
                                </div>
                                <h4 className="font-bold text-sm">Need Help Integrating?</h4>
                                <p className="text-xs text-muted-foreground">
                                    Check out our documentation for more details on payload structures, rate limits, and best practices.
                                </p>
                                <Button variant="outline" size="sm" className="w-full">
                                    View Documentation
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
