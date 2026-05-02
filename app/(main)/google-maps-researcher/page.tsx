"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Tag, MapPin, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatError } from "@/src/lib/utils";

export default function GoogleMapsResearcherPage() {
    const [keywords, setKeywords] = useState("");
    const [location, setLocation] = useState("");
    const [maxListings, setMaxListings] = useState(10);
    const [tags, setTags] = useState("");
    const [loading, setLoading] = useState(false);

    const getOrCreateKey = useMutation(api.apikeys.getOrCreateKey);

    const handleScrapeGoogleMaps = async () => {
        setLoading(true);
        try {
            if (!keywords.trim()) {
                toast.error("Please enter search keywords (e.g., 'car wash')");
                setLoading(false);
                return;
            }
            if (!location.trim()) {
                toast.error("Please enter a location (e.g., 'Paris')");
                setLoading(false);
                return;
            }

            const apiData = await getOrCreateKey();
            if (!apiData?.key) throw new Error("Authentication failed: Internal API Key could not be retrieved.");
            const key = apiData.key;

            const tagList = tags.split(",").map(t => t.trim()).filter(Boolean);

            const res = await fetch(`${process.env.NEXT_PUBLIC_RENDER_BACKEND_URL || "http://localhost:8000"}/api/scrape-google-maps`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${key}`
                },
                body: JSON.stringify({
                    searchStringsArray: [keywords],
                    locationQuery: location,
                    maxCrawledPlacesPerSearch: Math.min(maxListings, 100),
                    tags: tagList
                })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Google Maps extraction failed");
            }

            toast.success("Google Maps extraction started in background. Leads will appear in your collection shortly.");
            setKeywords("");
            setLocation("");
            setTags("");
        } catch (e: any) {
            const formatted = formatError(e);
            toast.error(formatted);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-0 space-y-6">
            <div className="px-6 pt-6 md:px-8 md:pt-8 flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Google Map Lead Research</h1>
                <p className="text-muted-foreground text-sm">
                    Find and extract business leads directly from Google Maps with contact details.
                </p>
            </div>

            <div className="px-6 md:px-8 pb-8">
                <Card className="w-full border-primary/5 shadow-sm max-w-2xl">
                    <CardHeader>
                        <CardTitle>Extraction Parameters</CardTitle>
                        <CardDescription>Enter details to find business leads in a specific area.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <List className="size-3.5 text-muted-foreground" />
                                Search Keywords
                            </Label>
                            <Input
                                placeholder="e.g. car wash, dentist, marketing agency"
                                value={keywords}
                                onChange={(e) => setKeywords(e.target.value)}
                                className="bg-muted/20"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <MapPin className="size-3.5 text-muted-foreground" />
                                Location
                            </Label>
                            <Input
                                placeholder="e.g. Paris, New York, London"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="bg-muted/20"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <List className="size-3.5 text-muted-foreground" />
                                    No. of Listings (Max 100)
                                </Label>
                                <Input
                                    type="number"
                                    min={1}
                                    max={100}
                                    value={maxListings || ""}
                                    onChange={(e) => setMaxListings(e.target.value === "" ? 0 : parseInt(e.target.value))}
                                    className="bg-muted/20"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Tag className="size-3.5 text-muted-foreground" />
                                    Custom Tags (Optional)
                                </Label>
                                <Input
                                    placeholder="e.g. Paris-leads, Auto-niche"
                                    value={tags}
                                    onChange={(e) => setTags(e.target.value)}
                                    className="bg-muted/20"
                                />
                            </div>
                        </div>

                        <Button
                            onClick={handleScrapeGoogleMaps}
                            disabled={loading}
                            className="w-full"
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {loading ? "Processing..." : "Extract Google Map Leads"}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
