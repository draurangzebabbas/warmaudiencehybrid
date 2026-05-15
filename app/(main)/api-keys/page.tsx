"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { supabase } from "@/src/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
    IconTrash,
    IconPower,
    IconPlus,
    IconDotsVertical,
    IconCircleCheckFilled,
    IconLoader,
    IconChevronLeft,
    IconChevronRight,
    IconChevronsLeft,
    IconChevronsRight,
    IconAlertCircle,
} from "@tabler/icons-react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";


export default function ApiKeysPage() {
    const user = useQuery(api.auth.getCurrentUser);

    // --- Supabase State ---
    const [apiKeys, setApiKeys] = useState<any[] | undefined>(undefined);
    const [loading, setLoading] = useState(true);

    const fetchKeys = async () => {
        if (!user?._id) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("user_api_keys")
                .select("*")
                .eq("user_id", user._id)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setApiKeys(data || []);
        } catch (error) {
            console.error("Fetch keys error:", error);
            toast.error("Failed to load API keys");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchKeys();
    }, [user?._id]);

    const [name, setName] = useState("");
    const [provider, setProvider] = useState("openrouter");
    const [key, setKey] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [rowSelection, setRowSelection] = useState({});
    const [isBulkUpdating, setIsBulkUpdating] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleAddKey = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !key || !user?._id) {
            toast.error("Please fill in all fields");
            return;
        }

        try {
            const { error } = await supabase
                .from("user_api_keys")
                .insert([{
                    user_id: user._id,
                    name,
                    provider,
                    key,
                    status: "active"
                }]);

            if (error) throw error;

            toast.success("API Key added successfully");
            setName("");
            setKey("");
            setIsAdding(false);
            fetchKeys();
        } catch (error: any) {
            toast.error(`Failed to add API Key: ${error.message}`);
        }
    };

    const handleDelete = async (id: any) => {
        if (confirm("Are you sure you want to delete this API Key?")) {
            try {
                const { error } = await supabase
                    .from("user_api_keys")
                    .delete()
                    .eq("id", id);

                if (error) throw error;
                toast.success("API Key deleted");
                fetchKeys();
            } catch (error) {
                toast.error("Failed to delete API Key");
            }
        }
    };

    const handleToggle = async (row: any) => {
        try {
            const newStatus = row.status === "active" ? "inactive" : "active";
            const { error } = await supabase
                .from("user_api_keys")
                .update({ status: newStatus })
                .eq("id", row.id);

            if (error) throw error;
            toast.success("Status updated");
            fetchKeys();
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const handleBulkToggle = async (status: string) => {
        const selectedIds = table.getSelectedRowModel().rows.map(r => r.original.id);
        if (selectedIds.length === 0) return;

        setIsBulkUpdating(true);
        try {
            const { error } = await supabase
                .from("user_api_keys")
                .update({ status })
                .in("id", selectedIds);

            if (error) throw error;
            toast.success(`${selectedIds.length} keys ${status === 'active' ? 'activated' : 'deactivated'}`);
            setRowSelection({});
            fetchKeys();
        } catch (error: any) {
            toast.error(`Bulk update failed: ${error.message}`);
        } finally {
            setIsBulkUpdating(false);
        }
    };

    const handleBulkDelete = async () => {
        const selectedIds = table.getSelectedRowModel().rows.map(r => r.original.id);
        if (selectedIds.length === 0) return;

        if (confirm(`Are you sure you want to delete ${selectedIds.length} keys?`)) {
            setIsBulkUpdating(true);
            try {
                const { error } = await supabase
                    .from("user_api_keys")
                    .delete()
                    .in("id", selectedIds);

                if (error) throw error;
                toast.success(`${selectedIds.length} keys deleted`);
                setRowSelection({});
                fetchKeys();
            } catch (error: any) {
                toast.error(`Bulk delete failed: ${error.message}`);
            } finally {
                setIsBulkUpdating(false);
            }
        }
    };

    const columns = useMemo<ColumnDef<any>[]>(
        () => [
            {
                id: "select",
                header: ({ table }) => (
                    <div className="flex items-center justify-center">
                        <Checkbox
                            checked={
                                table.getIsAllPageRowsSelected() ||
                                (table.getIsSomePageRowsSelected() && "indeterminate")
                            }
                            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                            aria-label="Select all"
                        />
                    </div>
                ),
                cell: ({ row }) => (
                    <div className="flex items-center justify-center">
                        <Checkbox
                            checked={row.getIsSelected()}
                            onCheckedChange={(value) => row.toggleSelected(!!value)}
                            aria-label="Select row"
                        />
                    </div>
                ),
                enableSorting: false,
                enableHiding: false,
            },
            {
                accessorKey: "name",
                header: "Friendly Name",
                cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
            },
            {
                accessorKey: "provider",
                header: "Provider",
                cell: ({ row }) => (
                    <Badge variant="outline" className="text-muted-foreground px-1.5 capitalize">
                        {row.original.provider}
                    </Badge>
                ),
            },
            {
                accessorKey: "key",
                header: "API Key",
                cell: ({ row }) => (
                    <code className="bg-muted px-2 py-1 rounded text-xs font-mono">
                        {row.original.key.length > 12
                            ? `${row.original.key.slice(0, 8)}...${row.original.key.slice(-4)}`
                            : "********"}
                    </code>
                ),
            },
            {
                accessorKey: "status",
                header: "Status",
                cell: ({ row }) => {
                    const status = row.original.status;
                    let variant: "default" | "outline" | "secondary" | "destructive" = "outline";
                    let icon = null;
                    let colorClass = "";

                    if (status === "active") {
                        icon = <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400 size-4 mr-1.5" />;
                        colorClass = "text-green-600 dark:text-green-400 border-green-500/30";
                    } else if (status === "rate_limited") {
                        icon = <IconLoader className="size-4 mr-1.5 text-orange-500" />;
                        colorClass = "text-orange-600 dark:text-orange-400 border-orange-500/30";
                    } else if (status === "failed") {
                        icon = <IconAlertCircle className="size-4 mr-1.5 text-red-500" />;
                        colorClass = "text-red-600 dark:text-red-400 border-red-500/30";
                    } else {
                        icon = <IconLoader className="size-4 mr-1.5 animate-spin" />;
                        colorClass = "text-muted-foreground";
                    }

                    return (
                        <Badge variant="outline" className={`px-1.5 ${colorClass}`}>
                            {icon}
                            {status}
                        </Badge>
                    );
                },
            },
            {
                id: "actions",
                cell: ({ row }) => (
                    <div className="flex justify-end">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="data-[state=open]:bg-muted text-muted-foreground flex size-8 p-0"
                                >
                                    <IconDotsVertical className="size-4" />
                                    <span className="sr-only">Open menu</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem onClick={() => handleToggle(row.original)}>
                                    <IconPower className="mr-2 size-4" />
                                    {row.original.status === "active" ? "Deactivate" : "Activate"}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    variant="destructive"
                                    onClick={() => handleDelete(row.original.id)}
                                >
                                    <IconTrash className="mr-2 size-4" />
                                    Delete Key
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                ),
            },
        ],
        [handleToggle, handleDelete]
    );

    const table = useReactTable({
        data: apiKeys || [],
        columns,
        state: {
            rowSelection,
        },
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });
    if (!mounted) return null;

    return (
        <div className="p-0 space-y-6">
            <div className="px-6 pt-6 md:px-8 md:pt-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">API Management</h1>
                    <p className="text-muted-foreground text-sm">
                        Configure and rotate API keys for automated data processing.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button size="sm" onClick={() => setIsAdding(!isAdding)} variant={isAdding ? "outline" : "default"}>
                        <IconPlus className={`mr-2 h-4 w-4 transition-transform ${isAdding ? 'rotate-45' : ''}`} />
                        {isAdding ? "Cancel" : "Add New Key"}
                    </Button>
                </div>
            </div>

            <div className="px-6 md:px-8 pb-8 space-y-8">

                {isAdding && (
                    <Card className="border shadow-md animate-in fade-in zoom-in-95 duration-200">
                        <CardHeader>
                            <CardTitle className="text-lg">Add New API Key</CardTitle>
                            <CardDescription>
                                Securely store credentials. Paste multiple keys (Name [TAB] Key) to import in bulk.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleAddKey} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Friendly Name</Label>
                                        <Input
                                            placeholder="e.g. My OpenRouter Key"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            onPaste={async (e) => {
                                                const text = e.clipboardData.getData('text');
                                                // Check for bulk format: multiple lines OR tab/comma separation
                                                if (text.includes('\n') || text.includes('\t')) {
                                                    e.preventDefault();
                                                    const lines = text.trim().split(/\r?\n/);
                                                    let count = 0;

                                                    toast.message(`Processing ${lines.length} keys...`);

                                                    for (const line of lines) {
                                                        if (!line.trim()) continue;

                                                        // Parse: Name [TAB/COMMA] Key
                                                        let [pName, pKey] = line.split(/[\t,]/);

                                                        // If split didn't find a key (maybe specific format), try space? 
                                                        // But usually spreadsheet copy is tab-separated. 
                                                        // Let's also handle "Key" only if name is missing? No, user specified Name first.

                                                        // Fallback check: if failed to split properly (e.g. spaces)
                                                        if (!pKey && line.includes(' ')) {
                                                            // Only split on FIRST space if using space separator? 
                                                            // Risky for names with spaces. 
                                                            // Stick to Tab/Comma as primary.
                                                            // If user pasted just keys? 
                                                        }

                                                        if (!pName || !pKey) {
                                                            // Fallback: If just one long string, maybe it's just a Key? 
                                                            // But user specifically said "1 column name, 2 column key".
                                                            continue;
                                                        }

                                                        // Clean up
                                                        pName = pName.trim();
                                                        pKey = pKey.trim();

                                                        if (pName && pKey && user?._id) {
                                                            try {
                                                                await supabase.from("user_api_keys").insert([{
                                                                    user_id: user._id,
                                                                    name: pName,
                                                                    provider,
                                                                    key: pKey,
                                                                    status: "active"
                                                                }]);
                                                                count++;
                                                            } catch (err) {
                                                                console.error("Import failed for", pName);
                                                            }
                                                        }
                                                    }

                                                    if (count > 0) {
                                                        toast.success(`Successfully imported ${count} keys!`);
                                                        setIsAdding(false);
                                                    } else {
                                                        toast.error("No valid Name/Key pairs found in paste.");
                                                    }
                                                }
                                            }}
                                            className="bg-background"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Provider</Label>
                                        <Select value={provider} onValueChange={setProvider}>
                                            <SelectTrigger className="bg-background">
                                                <SelectValue placeholder="Select Provider" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="openrouter">OpenRouter</SelectItem>
                                                <SelectItem value="apify">Apify</SelectItem>
                                                <SelectItem value="huggingface">Hugging Face</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">API Key</Label>
                                        <Input
                                            type="password"
                                            placeholder="sk-..."
                                            value={key}
                                            onChange={(e) => setKey(e.target.value)}
                                            className="bg-background"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end pt-2">
                                    <Button type="submit">Save API Key</Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}
                <div className="flex flex-col gap-4">
                    <div className="overflow-hidden rounded-lg border bg-background shadow-sm">
                        <Table>
                            <TableHeader className="bg-muted sticky top-0 z-10">
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id} className="hover:bg-transparent">
                                        {headerGroup.headers.map((header) => (
                                            <TableHead key={header.id} className="py-3">
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody className="**:data-[slot=table-cell]:first:w-8">
                                {apiKeys === undefined ? (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} className="h-48 text-center">
                                            <IconLoader className="inline-block animate-spin mr-2 text-primary" />
                                            <span className="text-sm text-muted-foreground">Fetching credentials...</span>
                                        </TableCell>
                                    </TableRow>
                                ) : table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className="group">
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id} className="py-3">
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} className="h-48 text-center">
                                            <div className="flex flex-col items-center gap-2 opacity-50">
                                                <IconKey className="size-10 text-muted-foreground" />
                                                <p className="text-sm font-medium">No API keys found</p>
                                                <p className="text-xs">Add a key to begin processing tasks.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex items-center justify-between px-2 py-4">
                        <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
                            {table.getFilteredSelectedRowModel().rows.length} of{" "}
                            {table.getFilteredRowModel().rows.length} row(s) selected.
                        </div>
                        <div className="flex w-full items-center gap-8 lg:w-fit">
                            <div className="hidden items-center gap-2 lg:flex">
                                <Label htmlFor="rows-per-page" className="text-sm font-medium">
                                    Rows per page
                                </Label>
                                <Select
                                    value={`${table.getState().pagination.pageSize}`}
                                    onValueChange={(value) => {
                                        table.setPageSize(Number(value))
                                    }}
                                >
                                    <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                                        <SelectValue placeholder={table.getState().pagination.pageSize} />
                                    </SelectTrigger>
                                    <SelectContent side="top">
                                        {[10, 20, 30, 40, 50].map((pageSize) => (
                                            <SelectItem key={pageSize} value={`${pageSize}`}>
                                                {pageSize}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex w-fit items-center justify-center text-sm font-medium">
                                Page {table.getState().pagination.pageIndex + 1} of{" "}
                                {table.getPageCount() || 1}
                            </div>
                            <div className="ml-auto flex items-center gap-2 lg:ml-0">
                                <Button
                                    variant="outline"
                                    className="hidden size-8 p-0 lg:flex"
                                    onClick={() => table.setPageIndex(0)}
                                    disabled={!table.getCanPreviousPage()}
                                >
                                    <span className="sr-only">Go to first page</span>
                                    <IconChevronsLeft className="size-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    className="size-8"
                                    size="icon"
                                    onClick={() => table.previousPage()}
                                    disabled={!table.getCanPreviousPage()}
                                >
                                    <span className="sr-only">Go to previous page</span>
                                    <IconChevronLeft className="size-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    className="size-8"
                                    size="icon"
                                    onClick={() => table.nextPage()}
                                    disabled={!table.getCanNextPage()}
                                >
                                    <span className="sr-only">Go to next page</span>
                                    <IconChevronRight className="size-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    className="hidden size-8 lg:flex"
                                    size="icon"
                                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                    disabled={!table.getCanNextPage()}
                                >
                                    <span className="sr-only">Go to last page</span>
                                    <IconChevronsRight className="size-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bulk Actions Bar */}
                {Object.keys(rowSelection).length > 0 && (
                    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="bg-background/80 backdrop-blur-md border border-primary/20 shadow-2xl rounded-full px-6 py-3 flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <div className="bg-primary text-primary-foreground size-6 rounded-full flex items-center justify-center text-[10px] font-bold">
                                    {Object.keys(rowSelection).length}
                                </div>
                                <span className="text-sm font-medium">Keys Selected</span>
                            </div>

                            <div className="h-6 w-px bg-border mx-2" />

                            <div className="flex items-center gap-2">
                                <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="h-9 px-3 gap-2 hover:bg-green-500/10 hover:text-green-600"
                                    onClick={() => handleBulkToggle('active')}
                                    disabled={isBulkUpdating}
                                >
                                    <IconPower className="size-4 text-green-500" />
                                    Activate
                                </Button>
                                <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="h-9 px-3 gap-2 hover:bg-orange-500/10 hover:text-orange-600"
                                    onClick={() => handleBulkToggle('inactive')}
                                    disabled={isBulkUpdating}
                                >
                                    <IconPower className="size-4 text-orange-500" />
                                    Deactivate
                                </Button>
                                <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="h-9 px-3 gap-2 hover:bg-destructive/10 hover:text-destructive"
                                    onClick={handleBulkDelete}
                                    disabled={isBulkUpdating}
                                >
                                    <IconTrash className="size-4" />
                                    Delete
                                </Button>
                            </div>

                            <div className="h-6 w-px bg-border mx-2" />

                            <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-9 px-4 text-muted-foreground"
                                onClick={() => setRowSelection({})}
                                disabled={isBulkUpdating}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}

                <div className="bg-muted/30 rounded-2xl p-8 border border-dashed flex flex-col md:flex-row gap-8 items-start md:items-center">
                    <div className="flex-1">
                        <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                            <IconKey className="size-6 text-primary" />
                            Infrastructure Scalability
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Scale your LinkedIn intelligence indefinitely. Our backend automatically rotates through your active API keys to handle high-volume scraping and tracking while staying within platform limits.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full md:w-auto">
                        <div className="p-4 bg-background rounded-xl border-2 border-primary/10 text-xs shadow-sm">
                            <span className="font-bold flex items-center gap-2 mb-1">
                                <IconCircleCheckFilled className="size-3 text-green-500" /> Secure
                            </span>
                            <p className="opacity-70 text-[10px]">Encrypted storage for all secrets.</p>
                        </div>
                        <div className="p-4 bg-background rounded-xl border-2 border-primary/10 text-xs shadow-sm">
                            <span className="font-bold flex items-center gap-2 mb-1">
                                <IconRefresh className="size-3 text-blue-500" /> Rotation
                            </span>
                            <p className="opacity-70 text-[10px]">Smart failover logic included.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

import { Separator } from "@/components/ui/separator";
import { IconKey, IconRefresh } from "@tabler/icons-react";
