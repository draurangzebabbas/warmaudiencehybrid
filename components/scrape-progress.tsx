"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle2, AlertCircle, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ScrapeJob = {
    id: string;
    type: string;
    status: "processing" | "completed" | "failed";
    progress: number;
    results_count: number;
    total_leads: number;
    error_message?: string;
    created_at: string;
};

export function ScrapeProgress({ userId }: { userId?: string }) {
    const [jobs, setJobs] = useState<ScrapeJob[]>([]);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (!userId) return;

        // 1. Initial Fetch
        const fetchJobs = async () => {
            const { data, error } = await supabase
                .from("scrape_jobs")
                .select("*")
                .eq("user_id", userId)
                .in("status", ["processing", "failed"])
                .order("created_at", { ascending: false })
                .limit(5);

            if (!error && data) {
                setJobs(data);
            }
        };

        fetchJobs();

        // 2. Realtime Subscription
        const channel = supabase
            .channel(`scrape_jobs_${userId}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "scrape_jobs",
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    const updatedJob = payload.new as ScrapeJob;
                    
                    setJobs((prev) => {
                        // If it's a new job or update to existing
                        const exists = prev.find(j => j.id === updatedJob.id);
                        
                        if (updatedJob.status === "completed") {
                            // Keep completed jobs for 5 seconds then remove
                            setTimeout(() => {
                                setJobs(current => current.filter(j => j.id !== updatedJob.id));
                            }, 5000);
                            
                            if (exists) {
                                return prev.map(j => j.id === updatedJob.id ? updatedJob : j);
                            }
                            return [updatedJob, ...prev];
                        }

                        if (exists) {
                            return prev.map(j => j.id === updatedJob.id ? updatedJob : j);
                        }
                        
                        return [updatedJob, ...prev];
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId]);

    if (!userId || jobs.length === 0 || !isVisible) return null;

    return (
        <div className="fixed bottom-6 right-6 w-80 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <Card className="shadow-2xl border-primary/20 bg-background/95 backdrop-blur-md overflow-hidden">
                <div className="bg-primary/5 px-4 py-2 flex items-center justify-between border-b border-primary/10">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary/70">Active Tasks</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsVisible(false)}>
                        <X className="h-3 w-3" />
                    </Button>
                </div>
                <CardContent className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
                    {jobs.map((job) => (
                        <div key={job.id} className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold capitalize">
                                        {job.type.replace("_", " ")}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">
                                        {job.results_count > 0 ? `${job.results_count} leads found` : "Initializing..."}
                                    </span>
                                </div>
                                <Badge 
                                    variant={job.status === "completed" ? "default" : job.status === "failed" ? "destructive" : "secondary"}
                                    className={cn(
                                        "text-[10px] h-5",
                                        job.status === "completed" && "bg-green-500 hover:bg-green-600",
                                        job.status === "processing" && "animate-pulse"
                                    )}
                                >
                                    {job.status === "processing" && <Loader2 className="mr-1 h-2 w-2 animate-spin" />}
                                    {job.status === "completed" && <CheckCircle2 className="mr-1 h-2 w-2" />}
                                    {job.status === "failed" && <AlertCircle className="mr-1 h-2 w-2" />}
                                    {job.status}
                                </Badge>
                            </div>
                            
                            <div className="space-y-1">
                                <Progress value={job.progress} className="h-1.5" />
                                <div className="flex justify-between text-[10px] text-muted-foreground">
                                    <span>Progress</span>
                                    <span>{job.progress}%</span>
                                </div>
                            </div>

                            {job.status === "failed" && (
                                <p className="text-[10px] text-destructive truncate bg-destructive/10 p-1 rounded">
                                    {job.error_message || "Unknown error"}
                                </p>
                            )}
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
