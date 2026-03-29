"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
import { Id } from "@/convex/_generated/dataModel";
import { formatError } from "@/src/lib/utils";

// --- Types ---

type Tracker = {
    _id: Id<"competitorTracking">;
    targetType: "keyword" | "profile";
    targetValue: string;
    schedule: string;
    isActive: boolean;
    lastExecutedAt?: number;
    nextExecutionAt: number;
    createdAt: number;
};

export default function TrackersPage() {
    const trackers = useQuery(api.competitorTracking.list);
    const toggleStatus = useMutation(api.competitorTracking.toggleStatus);
    const removeTracker = useMutation(api.competitorTracking.remove);
    const getOrCreateKey = useMutation(api.apikeys.getOrCreateKey);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [targetType, setTargetType] = useState<"keyword" | "profile">("keyword");
    const [targetValue, setTargetValue] = useState("");
    const [schedule, setSchedule] = useState<"daily" | "weekly">("daily");
    const [loading, setLoading] = useState(false);

    const handleCreateTracker = async () => {
        setLoading(true);
        try {
            const apiKeyData = await getOrCreateKey();
            if (!apiKeyData?.key) throw new Error("Could not retrieve API Key");

            if (!targetValue.trim()) {
                toast.error(`Please enter a ${targetType === "keyword" ? "keyword" : "profile URL"}`);
                return;
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_RENDER_BACKEND_URL || "http://localhost:8000"}/api/competitor-tracking/schedule`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKeyData.key}`
                },
                body: JSON.stringify({
                    type: targetType,
                    targetValue: targetValue.trim(),
                    schedule,
                    targets: ["commenters", "reactors"] // Default targets
                })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to create tracker");
            }

            toast.success(`Tracker created successfully`);
            setTargetValue("");
            setIsDialogOpen(false);
        } catch (e: any) {
            const formatted = formatError(e);
            if (formatted.includes("Limit Reached")) {
                toast.error(formatted, {
                    action: {
                        label: "Upgrade Plan",
                        onClick: () => window.location.href = "/#pricing"
                    }
                });
            } else {
                toast.error(formatted);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (id: Id<"competitorTracking">, isActive: boolean) => {
        try {
            const apiKeyData = await getOrCreateKey();
            if (!apiKeyData?.key) throw new Error("Could not retrieve API Key");

            const res = await fetch(`${process.env.NEXT_PUBLIC_RENDER_BACKEND_URL || "http://localhost:8000"}/api/competitor-tracking/status`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKeyData.key}`
                },
                body: JSON.stringify({
                    trackerId: id,
                    isActive
                })
            });

            if (!res.ok) throw new Error("Failed to update status");

            toast.success(isActive ? "Tracker resumed" : "Tracker paused");
        } catch (e: any) {
            const formatted = formatError(e);
            if (formatted.includes("Limit Reached")) {
                toast.error(formatted, {
                    action: {
                        label: "Upgrade Plan",
                        onClick: () => window.location.href = "/#pricing"
                    }
                });
            } else {
                toast.error(formatted);
            }
        }
    };

    const handleDelete = async (id: Id<"competitorTracking">) => {
        if (!confirm("Are you sure you want to delete this tracker?")) return;
        try {
            await removeTracker({ id });
            toast.success("Tracker deleted");
        } catch (e: any) {
            toast.error("Failed to delete tracker");
        }
    };

    const columns: ColumnDef<Tracker>[] = [
        {
            accessorKey: "targetType",
            header: "Tracking Type",
            cell: ({ row }) => (
                <Badge variant="outline" className="capitalize">
                    {row.original.targetType}
                </Badge>
            ),
        },
        {
            accessorKey: "targetValue",
            header: "Target",
            cell: ({ row }) => (
                <span className="font-medium truncate max-w-[250px] block" title={row.original.targetValue}>
                    {row.original.targetValue}
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
            accessorKey: "isActive",
            header: "Status",
            cell: ({ row }) => (
                <Badge
                    variant={row.original.isActive ? "default" : "secondary"}
                    className={row.original.isActive ? "bg-green-100 text-green-800 hover:bg-green-100/80 dark:bg-green-900/40 dark:text-green-400 border-green-500/30" : ""}
                >
                    {row.original.isActive ? "Active" : "Paused"}
                </Badge>
            ),
        },
        {
            accessorKey: "lastExecutedAt",
            header: "Last Tracked",
            cell: ({ row }) => {
                if (!row.original.lastExecutedAt) return <span className="text-muted-foreground text-xs">Never</span>;
                return (
                    <div className="flex items-center text-xs text-muted-foreground">
                        <IconClock className="mr-1 size-3" />
                        {formatDistanceToNow(row.original.lastExecutedAt, { addSuffix: true })}
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
                        onClick={() => handleToggle(row.original._id, !row.original.isActive)}
                        title={row.original.isActive ? "Pause" : "Resume"}
                    >
                        {row.original.isActive ? <IconPlayerPause className="size-4" /> : <IconPlayerPlay className="size-4" />}
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(row.original._id)}
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
                    <h1 className="text-3xl font-bold tracking-tight">Automated Trackers</h1>
                    <p className="text-muted-foreground text-sm">
                        Automatically monitor keywords and profiles for new activity.
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add New Tracker
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Tracker</DialogTitle>
                            <DialogDescription>
                                Set up automated LinkedIn monitoring.
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
                                        <SelectItem value="daily">Daily</SelectItem>
                                        <SelectItem value="weekly">Weekly</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreateTracker} disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Start Tracking
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="px-6 md:px-8 pb-8">
                <Card className="border-none shadow-none bg-transparent">
                    <CardHeader className="px-0 pt-0">
                        <CardTitle>Active Trackers</CardTitle>
                        <CardDescription>Your current automated monitoring tasks.</CardDescription>
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
                                    No active trackers.
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
