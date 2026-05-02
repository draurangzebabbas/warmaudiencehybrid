"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface LiveJobProgressProps {
    userId: string;
}

export function LiveJobProgress({ userId }: LiveJobProgressProps) {
    const [jobs, setJobs] = useState<any[]>([]);

    useEffect(() => {
        if (!userId) return;

        // Fetch active jobs initially
        const fetchActiveJobs = async () => {
            const { data } = await supabase
                .from("scrape_jobs")
                .select("*")
                .eq("user_id", userId)
                .in("status", ["pending", "processing"])
                .order("created_at", { ascending: false })
                .limit(3);
            
            if (data) setJobs(data);
        };

        fetchActiveJobs();

        // Subscribe to changes
        const channel = supabase
            .channel('public:scrape_jobs')
            .on('postgres_changes', { 
                event: '*', 
                schema: 'public', 
                table: 'scrape_jobs',
                filter: `user_id=eq.${userId}`
            }, (payload) => {
                setJobs(current => {
                    const updatedJob = payload.new as any;
                    
                    // If job is finished, we might want to keep it for a few seconds then remove
                    if (updatedJob.status === 'completed' || updatedJob.status === 'failed') {
                        // Update it first
                        const next = current.map(j => j.id === updatedJob.id ? updatedJob : j);
                        // If it wasn't in list, add it if it's new
                        if (!next.find(j => j.id === updatedJob.id)) next.unshift(updatedJob);
                        
                        // Set timeout to remove it after 5 seconds
                        setTimeout(() => {
                            setJobs(prev => prev.filter(j => j.id !== updatedJob.id));
                        }, 5000);
                        
                        return next.slice(0, 3);
                    }

                    // For pending/processing, upsert
                    const exists = current.find(j => j.id === updatedJob.id);
                    if (exists) {
                        return current.map(j => j.id === updatedJob.id ? updatedJob : j);
                    } else {
                        return [updatedJob, ...current].slice(0, 3);
                    }
                });
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId]);

    if (jobs.length === 0) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 w-80 space-y-3">
            {jobs.map((job) => (
                <Card key={job.id} className="shadow-lg border-primary/20 animate-in slide-in-from-right duration-300">
                    <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold capitalize truncate">
                                {job.type.replace('_', ' ')}
                            </span>
                            <Badge variant={
                                job.status === 'completed' ? 'default' : 
                                job.status === 'failed' ? 'destructive' : 'outline'
                            } className="text-[10px] h-5 px-1.5">
                                {job.status === 'processing' && <Loader2 className="size-2.5 mr-1 animate-spin" />}
                                {job.status === 'completed' && <CheckCircle2 className="size-2.5 mr-1" />}
                                {job.status === 'failed' && <AlertCircle className="size-2.5 mr-1" />}
                                {job.status}
                            </Badge>
                        </div>

                        <Progress value={job.progress} className="h-1.5" />
                        
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                            <span>{job.progress}% Complete</span>
                            <span>{job.results_count} leads found</span>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
