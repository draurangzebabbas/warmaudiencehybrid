"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { motion } from "motion/react";
import { Loader2, Sparkles, Send } from "lucide-react";

interface ComingSoonPageProps {
    platformName: string;
    description: string;
    IconComponent: React.ComponentType<{ className?: string }>;
    estimatedRelease?: string;
    features: string[];
}

export function ComingSoonPage({
    platformName,
    description,
    IconComponent,
    estimatedRelease = "Q3 2026",
    features
}: ComingSoonPageProps) {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleNotify = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !email.includes("@")) {
            toast.error("Please enter a valid email address");
            return;
        }
        setLoading(true);
        setTimeout(() => {
            toast.success(`🎉 Early access requested for ${email}! We'll notify you first.`);
            setEmail("");
            setLoading(false);
        }, 1000);
    };

    return (
        <div className="flex flex-1 items-center justify-center p-6 md:p-8 min-h-[calc(100vh-var(--header-height)-120px)] relative overflow-hidden">
            {/* Glowing Backdrop Orbs */}
            <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-2xl z-10"
            >
                <Card className="border-primary/10 bg-card/60 backdrop-blur-md shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                    
                    <CardHeader className="text-center pt-8">
                        <div className="mx-auto mb-6 relative">
                            {/* Platform Pulsing Glow Ring */}
                            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping scale-75" />
                            <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-primary">
                                <IconComponent className="size-8" />
                            </div>
                        </div>

                        <div className="inline-flex items-center gap-1.5 mx-auto px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-[10px] font-bold tracking-wider uppercase text-primary mb-3">
                            <Sparkles className="size-3" />
                            <span>Engine Under Construction</span>
                        </div>

                        <CardTitle className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                            {platformName} Lead Researcher
                        </CardTitle>
                        
                        <CardDescription className="text-base max-w-md mx-auto mt-2 text-muted-foreground">
                            {description}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-8 pb-8">
                        {/* Feature Preview List */}
                        <div className="bg-muted/30 border border-border/50 rounded-2xl p-6 space-y-4">
                            <h4 className="text-sm font-semibold tracking-wider uppercase text-muted-foreground">Planned Features Preview</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {features.map((feature, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                        <span className="text-sm text-foreground/80 font-medium">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Release Timeline Badge */}
                        <div className="flex items-center justify-between px-6 py-4 rounded-xl border border-primary/10 bg-primary/[0.02]">
                            <span className="text-sm font-semibold text-muted-foreground">Estimated Engine Launch:</span>
                            <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-lg border border-primary/20">{estimatedRelease}</span>
                        </div>

                        {/* Early Access Notification Form */}
                        <form onSubmit={handleNotify} className="space-y-3">
                            <Label className="text-sm font-semibold block text-center">Get early access & updates</Label>
                            <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                                <Input
                                    type="email"
                                    placeholder="Enter your email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-muted/20 border-primary/10 focus-visible:ring-primary h-11"
                                    disabled={loading}
                                />
                                <Button type="submit" disabled={loading} className="h-11 font-semibold px-6 shadow-lg shadow-primary/15">
                                    {loading ? (
                                        <Loader2 className="size-4 animate-spin mr-2" />
                                    ) : (
                                        <Send className="size-4 mr-2" />
                                    )}
                                    Notify Me
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}

// Inline Label helper for standard styling
function Label({ children, className }: { children: React.ReactNode; className?: string }) {
    return <span className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}>{children}</span>;
}
