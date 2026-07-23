"use client";

import { useState, useEffect } from "react";

import { supabase } from "@/src/lib/supabase";
import { useUsage } from "@/hooks/use-usage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Plus, Info, Globe, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { LimitReachedDialog } from "@/components/limit-reached-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable,
} from "@tanstack/react-table"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge";
import { IconTrash, IconPlayerPause, IconPlayerPlay, IconClock, IconBrandLinkedin, IconMap2 } from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import { formatError } from "@/src/lib/utils";

// --- Types ---

type UnifiedAgent = {
    id: string;
    agent_type: "linkedin" | "google_maps";
    name: string;
    target: string;
    schedule: string;
    status: string;
    progress?: {
        current: number;
        total: number;
    };
    last_run_at?: string;
    created_at: string;
};

export default function TrackersPage() {
    const usage = useUsage();
    const [user, setUser] = useState<any>(null);

    const [trackers, setTrackers] = useState<any[]>([]);
    const [agents, setAgents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [activeStep, setActiveStep] = useState<"selector" | "linkedin" | "google_maps">("selector");
    const [isLimitDialogOpen, setIsLimitDialogOpen] = useState(false);
    
    // Count active items
    const activeTrackersCount = trackers.filter(t => t.is_active).length;
    const activeAgentsCount = agents.filter(a => a.status === "active" || a.status === "processing").length;
    const totalActiveCount = activeTrackersCount + activeAgentsCount;

    const trackersLimit = usage?.usage?.trackersLimit || 1;
    const isLimitReached = totalActiveCount >= trackersLimit;
    
    // --- Fetch Logic ---
    const fetchData = async () => {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!currentUser) {
            setLoading(false);
            return;
        }
        setUser(currentUser);
        try {
            // Fetch LinkedIn Trackers
            const { data: trackerData, error: trackerError } = await supabase
                .from("trackers")
                .select("*")
                .order("created_at", { ascending: false });
            
            if (trackerError) throw trackerError;

            // Fetch Google Maps Agents
            const { data: agentData, error: agentError } = await supabase
                .from("agents")
                .select("*")
                .order("created_at", { ascending: false });

            if (agentError) throw agentError;

            setTrackers(trackerData || []);
            setAgents(agentData || []);
        } catch (error) {
            console.error("Fetch data error:", error);
            toast.error("Failed to load agents");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        
        // Setup polling for Google Maps agents progress updates
        const interval = setInterval(() => {
            fetchData();
        }, 10000); // Poll every 10 seconds

        return () => clearInterval(interval);
    }, []);

    // --- LinkedIn Form State ---
    const [targetType, setTargetType] = useState<"keyword" | "profile">("keyword");
    const [targetValue, setTargetValue] = useState("");
    const [schedule, setSchedule] = useState<"daily" | "weekly">("daily");
    const [extractCommenters, setExtractCommenters] = useState(true);
    const [extractReactors, setExtractReactors] = useState(false);

    // --- Google Maps Form State ---
    const [mapsKeyword, setMapsKeyword] = useState("");
    const [mapsCitiesText, setMapsCitiesText] = useState("");
    const [mapsMaxPerCity, setMapsMaxPerCity] = useState("100");
    const [mapsTags, setMapsTags] = useState("");

    const [actionLoading, setActionLoading] = useState(false);

    const handleCreateLinkedInTracker = async () => {
        setActionLoading(true);
        try {
            const { data: { session }, error: authError } = await supabase.auth.getSession();
            if (authError || !session) throw new Error("Authentication failed");
            const key = session.access_token;

            const targets = [];
            if (extractCommenters) targets.push("commenters");
            if (extractReactors) targets.push("reactors");

            if (targets.length === 0) {
                toast.error("Please select at least one engagement type");
                return;
            }

            if (!targetValue.trim()) {
                toast.error("Please enter a keyword or profile URL");
                return;
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_RENDER_BACKEND_URL || "http://localhost:8000"}/api/competitor-tracking/schedule`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${key}`
                },
                body: JSON.stringify({
                    type: targetType,
                    targetValue: targetValue.trim(),
                    schedule,
                    targets
                })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to launch agent");
            }

            toast.success(`LinkedIn Tracker agent launched successfully`);
            setTargetValue("");
            setIsDialogOpen(false);
            fetchData();
        } catch (e: any) {
            const formatted = formatError(e);
            toast.error(formatted);
        } finally {
            setActionLoading(false);
        }
    };

    const handleCreateMapsAgent = async () => {
        if (!mapsKeyword.trim()) {
            toast.error("Please enter a keyword");
            return;
        }

        const cities = mapsCitiesText
            .split("\n")
            .map(line => line.trim())
            .filter(line => line.length > 0);

        if (cities.length === 0) {
            toast.error("Please enter at least one city");
            return;
        }

        setActionLoading(true);
        try {
            const { data: { session }, error: authError } = await supabase.auth.getSession();
            if (authError || !session) throw new Error("Authentication failed");
            const key = session.access_token;

            const config = {
                keyword: mapsKeyword.trim(),
                locations: cities,
                maxCrawledPlacesPerSearch: parseInt(mapsMaxPerCity) || 100,
                tags: mapsTags ? mapsTags.split(",").map(t => t.trim()).filter(Boolean) : [],
                currentIndex: 0
            };

            const res = await fetch(`${process.env.NEXT_PUBLIC_RENDER_BACKEND_URL || "http://localhost:8000"}/api/agents`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${key}`
                },
                body: JSON.stringify({
                    name: `Google Maps: ${mapsKeyword.trim()}`,
                    type: "google_maps",
                    config,
                    schedule: "manual"
                })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to launch Google Maps agent");
            }

            toast.success(`Google Maps Sweep Agent launched successfully`);
            setMapsKeyword("");
            setMapsCitiesText("");
            setMapsTags("");
            setIsDialogOpen(false);
            fetchData();
        } catch (e: any) {
            const formatted = formatError(e);
            toast.error(formatted);
        } finally {
            setActionLoading(false);
        }
    };

    const handleToggle = async (agent: UnifiedAgent, currentStatus: string) => {
        try {
            const { data: { session }, error: authError } = await supabase.auth.getSession();
            if (authError || !session) throw new Error("Authentication failed");
            const key = session.access_token;

            if (agent.agent_type === "linkedin") {
                const newActive = currentStatus !== "active";
                const { error } = await supabase
                    .from("trackers")
                    .update({ is_active: newActive })
                    .eq("id", agent.id);
                
                if (error) throw error;
                toast.success(newActive ? "LinkedIn agent resumed" : "LinkedIn agent paused");
            } else {
                const newStatus = currentStatus === "active" ? "paused" : "active";
                const res = await fetch(`${process.env.NEXT_PUBLIC_RENDER_BACKEND_URL || "http://localhost:8000"}/api/agents/status`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${key}`
                    },
                    body: JSON.stringify({
                        agentId: agent.id,
                        status: newStatus
                    })
                });

                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.error || "Failed to update status");
                }
                toast.success(newStatus === "active" ? "Google Maps agent resumed" : "Google Maps agent paused");
            }
            fetchData();
        } catch (e: any) {
            toast.error(formatError(e));
        }
    };

    const handleDelete = async (agent: UnifiedAgent) => {
        if (!confirm("Are you sure you want to delete this agent?")) return;
        try {
            const { data: { session }, error: authError } = await supabase.auth.getSession();
            if (authError || !session) throw new Error("Authentication failed");
            const key = session.access_token;

            if (agent.agent_type === "linkedin") {
                const { error } = await supabase
                    .from("trackers")
                    .delete()
                    .eq("id", agent.id);
                
                if (error) throw error;
                toast.success("LinkedIn agent deleted");
            } else {
                const res = await fetch(`${process.env.NEXT_PUBLIC_RENDER_BACKEND_URL || "http://localhost:8000"}/api/agents/${agent.id}`, {
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${key}`
                    }
                });

                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.error || "Failed to delete agent");
                }
                toast.success("Google Maps agent deleted");
            }
            fetchData();
        } catch (e: any) {
            toast.error(formatError(e));
        }
    };

    // --- Combine Data ---
    const unifiedData: UnifiedAgent[] = [
        ...trackers.map(t => ({
            id: t.id,
            agent_type: "linkedin" as const,
            name: "LinkedIn Engagement Tracker",
            target: t.target_value,
            schedule: t.schedule,
            status: t.is_active ? "active" : "paused",
            last_run_at: t.last_run_at,
            created_at: t.created_at
        })),
        ...agents.map(a => ({
            id: a.id,
            agent_type: "google_maps" as const,
            name: a.name || `Google Maps: ${a.config?.keyword}`,
            target: a.config?.keyword || "",
            schedule: "sequential Check",
            status: a.status,
            progress: {
                current: a.config?.currentIndex || 0,
                total: a.config?.locations?.length || 0
            },
            last_run_at: a.last_run_at,
            created_at: a.created_at
        }))
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const columns: ColumnDef<UnifiedAgent>[] = [
        {
            accessorKey: "agent_type",
            header: "Agent Type",
            cell: ({ row }) => {
                const isLinkedIn = row.original.agent_type === "linkedin";
                return (
                    <Badge variant="outline" className={`flex items-center gap-1.5 w-fit capitalize font-medium ${
                        isLinkedIn 
                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" 
                            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    }`}>
                        {isLinkedIn ? <IconBrandLinkedin className="size-3.5" /> : <IconMap2 className="size-3.5" />}
                        {isLinkedIn ? "LinkedIn" : "Google Maps"}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "target",
            header: "Search Target",
            cell: ({ row }) => (
                <div className="flex flex-col max-w-[250px]">
                    <span className="font-semibold text-sm truncate" title={row.original.target}>
                        {row.original.target}
                    </span>
                    {row.original.agent_type === "google_maps" && row.original.progress && (
                        <span className="text-[10px] text-muted-foreground truncate">
                            {row.original.progress.total} locations configured
                        </span>
                    )}
                </div>
            ),
        },
        {
            id: "progress",
            header: "Sweep Progress",
            cell: ({ row }) => {
                if (row.original.agent_type === "linkedin") {
                    return <span className="text-muted-foreground text-xs italic">Recurring check ({row.original.schedule})</span>;
                }
                
                const current = row.original.progress?.current || 0;
                const total = row.original.progress?.total || 0;
                const percent = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;

                return (
                    <div className="flex flex-col gap-1.5 min-w-[150px] max-w-[200px]">
                        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                            <span>{current} / {total} cities</span>
                            <span>{percent}%</span>
                        </div>
                        <Progress value={percent} className="h-1.5" />
                    </div>
                );
            }
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.original.status;
                let variant: "default" | "secondary" | "destructive" = "default";
                let statusClass = "";

                if (status === "active" || status === "running" || status === "processing") {
                    statusClass = "bg-green-100 text-green-800 hover:bg-green-100/80 dark:bg-green-900/40 dark:text-green-400 border-green-500/30";
                } else if (status === "paused") {
                    variant = "secondary";
                    statusClass = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400 border-yellow-500/30";
                } else if (status === "completed") {
                    statusClass = "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400 border-blue-500/30";
                } else {
                    variant = "destructive";
                }

                return (
                    <Badge variant={variant} className={`capitalize ${statusClass}`}>
                        {status}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "last_run_at",
            header: "Last Run",
            cell: ({ row }) => {
                if (!row.original.last_run_at) return <span className="text-muted-foreground text-xs">Never</span>;
                return (
                    <div className="flex items-center text-xs text-muted-foreground">
                        <IconClock className="mr-1 size-3" />
                        {formatDistanceToNow(new Date(row.original.last_run_at), { addSuffix: true })}
                    </div>
                );
            }
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const showPause = row.original.status !== "completed";
                const isRunning = row.original.status === "active" || row.original.status === "running" || row.original.status === "processing";

                return (
                    <div className="flex items-center gap-1">
                        {showPause && (
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() => handleToggle(row.original, row.original.status)}
                                title={isRunning ? "Pause" : "Resume"}
                            >
                                {isRunning ? <IconPlayerPause className="size-4" /> : <IconPlayerPlay className="size-4" />}
                            </Button>
                        )}
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(row.original)}
                            title="Delete"
                        >
                            <IconTrash className="size-4" />
                        </Button>
                    </div>
                );
            }
        }
    ];

    return (
        <div className="p-0 space-y-6" suppressHydrationWarning>
            <div className="px-6 pt-6 md:px-8 md:pt-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Automated Agents</h1>
                    <p className="text-muted-foreground text-sm">
                        Automatically monitor keywords and profiles with automated agents.
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    if (open && isLimitReached) {
                        setIsLimitDialogOpen(true);
                    } else {
                        setIsDialogOpen(open);
                        if (open) setActiveStep("selector");
                    }
                }}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Launch New Agent
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[480px]">
                        <DialogHeader>
                            <DialogTitle>
                                {activeStep === "selector" && "Launch Agent"}
                                {activeStep === "linkedin" && "LinkedIn Engagement Tracker"}
                                {activeStep === "google_maps" && "Google Maps Sweep Agent"}
                            </DialogTitle>
                            <DialogDescription>
                                {activeStep === "selector" && "Choose which automated agent you want to spin up."}
                                {activeStep === "linkedin" && "Set up automated LinkedIn monitoring agent."}
                                {activeStep === "google_maps" && "Extract leads from multiple cities automatically."}
                            </DialogDescription>
                        </DialogHeader>

                        {/* STEP 1: Select Agent Type */}
                        {activeStep === "selector" && (
                            <div className="grid grid-cols-1 gap-4 py-4">
                                <Card 
                                    className="cursor-pointer border-2 hover:border-primary transition-all p-4 flex gap-4 items-center bg-muted/20"
                                    onClick={() => setActiveStep("linkedin")}
                                >
                                    <div className="p-3 bg-blue-500/10 text-blue-600 rounded-lg">
                                        <IconBrandLinkedin className="size-8" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-base">LinkedIn Engagement Tracker</h3>
                                        <p className="text-xs text-muted-foreground">Monitor keywords/profile engagement recursively on a schedule.</p>
                                    </div>
                                </Card>
                                <Card 
                                    className="cursor-pointer border-2 hover:border-primary transition-all p-4 flex gap-4 items-center bg-muted/20"
                                    onClick={() => setActiveStep("google_maps")}
                                >
                                    <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-lg">
                                        <IconMap2 className="size-8" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-base">Google Maps Sweep Agent</h3>
                                        <p className="text-xs text-muted-foreground">Process multiple cities sequentially for targeted leads.</p>
                                    </div>
                                </Card>
                            </div>
                        )}

                        {/* STEP 2A: LinkedIn Form */}
                        {activeStep === "linkedin" && (
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Tracking Method</Label>
                                    <Select value={targetType} onValueChange={(v) => setTargetType(v as "keyword" | "profile")}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="keyword">Keyword Search</SelectItem>
                                            <SelectItem value="profile">Profile Monitoring</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>{targetType === "keyword" ? "Keyword" : "Profile URL"}</Label>
                                    <Input
                                        placeholder={targetType === "keyword" ? "e.g. Artificial Intelligence" : "https://linkedin.com/in/..."}
                                        value={targetValue}
                                        onChange={(e) => setTargetValue(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Execution Frequency</Label>
                                    <Select value={schedule} onValueChange={(v) => setSchedule(v as "daily" | "weekly")}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="daily">Daily Check</SelectItem>
                                            <SelectItem value="weekly">Weekly Check</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-3 pt-2">
                                    <Label className="text-sm font-semibold">Targets to Extract</Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                                            <Checkbox
                                                id="t-commenters"
                                                checked={extractCommenters}
                                                onCheckedChange={(checked) => setExtractCommenters(checked as boolean)}
                                            />
                                            <Label
                                                htmlFor="t-commenters"
                                                className="text-sm font-medium cursor-pointer"
                                            >
                                                Commenters
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                                            <Checkbox
                                                id="t-reactors"
                                                checked={extractReactors}
                                                onCheckedChange={(checked) => setExtractReactors(checked as boolean)}
                                            />
                                            <Label
                                                htmlFor="t-reactors"
                                                className="text-sm font-medium cursor-pointer"
                                            >
                                                Reactors
                                            </Label>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2 text-[10px] text-muted-foreground bg-muted/30 p-2 rounded">
                                        <Info className="size-3 mt-0.5" />
                                        <span>Each automated run scans for new engagement and adds unique profiles to your collection.</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 2B: Google Maps Sweep Form */}
                        {activeStep === "google_maps" && (
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Keyword / Niche</Label>
                                    <Input
                                        placeholder="e.g. Dental Clinic"
                                        value={mapsKeyword}
                                        onChange={(e) => setMapsKeyword(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Cities List (One per line)</Label>
                                    <Textarea
                                        placeholder={`e.g.\nUSA, New York, New York City\nUSA, California, Los Angeles`}
                                        rows={4}
                                        value={mapsCitiesText}
                                        onChange={(e) => setMapsCitiesText(e.target.value)}
                                        className="font-mono text-xs"
                                    />
                                    <p className="text-[10px] text-muted-foreground">
                                        Use the format: Country, State/Province, City
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Max Leads per City</Label>
                                        <Input
                                            type="number"
                                            value={mapsMaxPerCity}
                                            onChange={(e) => setMapsMaxPerCity(e.target.value)}
                                            min="1"
                                            max="200"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Custom Tags (comma separated)</Label>
                                        <Input
                                            placeholder="e.g. dentists, map-sweep"
                                            value={mapsTags}
                                            onChange={(e) => setMapsTags(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-start gap-2 text-[10px] text-amber-600 dark:text-amber-400 bg-amber-500/10 p-2 rounded">
                                    <AlertTriangle className="size-3.5 mt-0.5 flex-shrink-0" />
                                    <span>This agent runs sequentially. It sweeps one city, pauses for 1 minute to avoid rate limits, and then proceeds to the next city.</span>
                                </div>
                            </div>
                        )}

                        <DialogFooter className="gap-2 sm:gap-0">
                            {activeStep !== "selector" ? (
                                <>
                                    <Button variant="outline" onClick={() => setActiveStep("selector")}>Back</Button>
                                    {activeStep === "linkedin" ? (
                                        <Button onClick={handleCreateLinkedInTracker} disabled={actionLoading}>
                                            {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Launch Agent
                                        </Button>
                                    ) : (
                                        <Button onClick={handleCreateMapsAgent} disabled={actionLoading}>
                                            {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Launch Agent
                                        </Button>
                                    )}
                                </>
                            ) : (
                                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="px-6 md:px-8 pb-8">
                <Card className="border-none shadow-none bg-transparent">
                    <CardHeader className="px-0 pt-0">
                        <CardTitle>Active Agents</CardTitle>
                        <CardDescription>Your current automated monitoring agents.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <GenericTrackerTable
                            data={unifiedData}
                            columns={columns}
                            isLoading={loading}
                        />
                    </CardContent>
                </Card>
            </div>

            <LimitReachedDialog 
                isOpen={isLimitDialogOpen} 
                onOpenChange={setIsLimitDialogOpen}
                limitType="trackers"
                currentLimit={trackersLimit}
            />
        </div>
    );
}

// --- Local Table Component ---

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    isLoading?: boolean
}

function GenericTrackerTable<TData, TValue>({
    columns,
    data,
    isLoading
}: DataTableProps<TData, TValue>) {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    })

    return (
        <div className="space-y-4">
            <div className="rounded-md border">
                <Table>
                    <TableHeader className="bg-muted/50 font-medium">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                                    No active agents.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-end space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Next
                </Button>
            </div>
        </div>
    )
}
