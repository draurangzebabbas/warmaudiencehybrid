"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
    IconLoader,
    IconExternalLink,
    IconUser,
    IconBuildingCommunity,
    IconHistory
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export function RecentActivityTable() {
    const activity = useQuery(api.dashboard.getRecentActivity, { limit: 10 });

    if (activity === undefined) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Your latest intelligence saves.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex h-48 items-center justify-center">
                        <IconLoader className="size-6 animate-spin text-muted-foreground" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (activity.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>No recent activity found.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex h-48 flex-col items-center justify-center gap-2 text-muted-foreground border-2 border-dashed rounded-xl">
                        <IconHistory className="size-10 opacity-20" />
                        <p className="text-sm font-medium">Start researching to see activity here</p>
                        <Button variant="link" asChild>
                            <Link href="/researchers">Go to Researcher</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest profiles and companies added to your database.</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                    <Link href="/my-profiles">View All</Link>
                </Button>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead>Target Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Tags</TableHead>
                                <TableHead>Saved</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {activity.map((item) => (
                                <TableRow key={item._id.toString()}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            {item.type === "personal" ? (
                                                <IconUser className="size-4 text-green-600" />
                                            ) : (
                                                <IconBuildingCommunity className="size-4 text-purple-600" />
                                            )}
                                            <span className="truncate max-w-[200px]">{item.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="capitalize">
                                            {item.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {item.tags?.slice(0, 2).map((tag: string) => (
                                                <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0 leading-none h-4">
                                                    {tag}
                                                </Badge>
                                            ))}
                                            {(item.tags?.length || 0) > 2 && (
                                                <span className="text-[10px] text-muted-foreground">+{item.tags!.length - 2}</span>
                                            )}
                                            {(!item.tags || item.tags.length === 0) && (
                                                <span className="text-xs text-muted-foreground italic">None</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(item.createdAt, { addSuffix: true })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                            <a href={item.url} target="_blank" rel="noopener noreferrer">
                                                <IconExternalLink className="size-4" />
                                            </a>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
