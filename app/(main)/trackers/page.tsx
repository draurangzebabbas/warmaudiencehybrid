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
import { Loader2, Plus, Info } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { LimitReachedDialog } from "@/components/limit-reached-dialog";
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
import { IconTrash, IconPlayerPause, IconPlayerPlay, IconClock } from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import { formatError } from "@/src/lib/utils";

// --- Types ---

type Tracker = {
    id: string;
    target_type: "keyword" | "profile";
    target_value: string;
    schedule: string;
    is_active: boolean;
    last_run_at?: string;
    next_run_at: string;
    created_at: string;
};

export default function TrackersPage() {
    const usage = useUsage();
    const [user, setUser] = useState<any>(null);

    const [trackers, setTrackers] = useState<any[] | undefined>(undefined);
    const [loading, setLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isLimitDialogOpen, setIsLimitDialogOpen] = useState(false);
    
    const trackersCount = trackers?.length || 0;
    const trackersLimit = usage?.usage?.trackersLimit || 1;
    const isLimitReached = trackersCount >= trackersLimit;
    
    // --- Supabase Logic ---
    const fetchTrackers = async () => {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!currentUser) return;
        setUser(currentUser);
        try {
            const { data, error } = await supabase
                .from("trackers")
                .select("*")
                .order("created_at", { ascending: false });
            
            if (error) throw error;
            setTrackers(data || []);
        } catch (error) {
            console.error("Fetch trackers error:", error);
            toast.error("Failed to load trackers");
        }
    };

    useEffect(() => {
        fetchTrackers();
    }, []);

    const [targetType, setTargetType] = useState<"keyword" | "profile">("keyword");
    const [targetValue, setTargetValue] = useState("");
    const [schedule, setSchedule] = useState<"daily" | "weekly">("daily");
    const [extractCommenters, setExtractCommenters] = useState(true);
    const [extractReactors, setExtractReactors] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const handleCreateTracker = async () => {
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

            toast.success(`Agent launched successfully`);
            setTargetValue("");
            setIsDialogOpen(false);
            fetchTrackers();
        } catch (e: any) {
            const formatted = formatError(e);
            toast.error(formatted);
        } finally {
            setActionLoading(false);
        }
    };

    const handleToggle = async (id: string, isActive: boolean) => {
        try {
            const { error } = await supabase
                .from("trackers")
                .update({ is_active: isActive })
                .eq("id", id);
            
            if (error) throw error;
            toast.success(isActive ? "Agent resumed" : "Agent paused");
            fetchTrackers();
        } catch (e: any) {
            toast.error("Failed to update status");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this agent?")) return;
        try {
            const { error } = await supabase
                .from("trackers")
                .delete()
                .eq("id", id);
            
            if (error) throw error;
            toast.success("Agent deleted");
            fetchTrackers();
        } catch (e: any) {
            toast.error("Failed to delete agent");
        }
    };

    const columns: ColumnDef<Tracker>[] = [
        {
            accessorKey: "target_type",
            header: "Agent Type",
            cell: ({ row }) => (
                <Badge variant="outline" className="capitalize">
                    {row.original.target_type}
                </Badge>
            ),
        },
        {
            accessorKey: "target_value",
            header: "Target",
            cell: ({ row }) => (
                <span className="font-medium truncate max-w-[250px] block" title={row.original.target_value}>
                    {row.original.target_value}
                </span>
            ),
        },
        {
            accessorKey: "schedule",
            header: "Schedule",
            cell: ({ row }) => (
                <Badge variant="secondary" className="capitalize">
                    {row.original.schedule}
                </Badge>
            ),
        },
        {
            accessorKey: "is_active",
            header: "Status",
            cell: ({ row }) => (
                <Badge
                    variant={row.original.is_active ? "default" : "secondary"}
                    className={row.original.is_active ? "bg-green-100 text-green-800 hover:bg-green-100/80 dark:bg-green-900/40 dark:text-green-400 border-green-500/30" : ""}
                >
                    {row.original.is_active ? "Active" : "Paused"}
                </Badge>
            ),
        },
        {
            accessorKey: "last_run_at",
            header: "Last Tracked",
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
            cell: ({ row }) => (
                <div className="flex items-center gap-1">
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => handleToggle(row.original.id, !row.original.is_active)}
                        title={row.original.is_active ? "Pause" : "Resume"}
                    >
                        {row.original.is_active ? <IconPlayerPause className="size-4" /> : <IconPlayerPlay className="size-4" />}
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(row.original.id)}
                        title="Delete"
                    >
                        <IconTrash className="size-4" />
                    </Button>
                </div>
            )
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
                    }
                }}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Launch New Agent
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Launch Agent</DialogTitle>
                            <DialogDescription>
                                {isLimitReached ? (
                                    <span className="text-destructive font-medium">
                                        You have reached your limit of {trackersLimit} agent(s). Please upgrade to add more.
                                    </span>
                                ) : (
                                    "Set up automated LinkedIn monitoring agent."
                                )}
                            </DialogDescription>
                        </DialogHeader>
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
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreateTracker} disabled={actionLoading}>
                                {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Launch Agent
                            </Button>
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
                            data={(trackers || []) as Tracker[]}
                            columns={columns}
                            isLoading={trackers === undefined}
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
