"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import { supabase } from "@/src/lib/supabase"
import { useState, useEffect } from "react"

export default function LandingCTA() {
    const [session, setSession] = useState<any>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });
    }, []);

    return (
        <section className="relative overflow-hidden py-24 sm:py-32">
            {/* Background */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-background to-background" />
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_50%,theme(colors.primary.500/.1),transparent_50%)]" />

            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl rounded-3xl border bg-background/50 p-8 text-center backdrop-blur-sm sm:p-12 lg:p-16">
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background px-4 py-1.5 text-sm">
                        <Sparkles className="size-4 text-primary" />
                        <span className="text-muted-foreground">Start Your Free Trial Today</span>
                    </div>

                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                        Ready to Scale Your Content?
                    </h2>

                    <p className="mt-6 text-lg leading-8 text-muted-foreground">
                        Join content creators who are automating their article production and growing their online presence.
                    </p>

                    <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                        {session ? (
                            <Button size="lg" asChild className="w-full sm:w-auto rounded-full px-8 py-6 text-sm font-semibold shadow-lg shadow-primary/10 hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                                <Link href="/dashboard">
                                    Go to Dashboard
                                </Link>
                            </Button>
                        ) : (
                            <>
                                <Button size="lg" asChild className="w-full sm:w-auto rounded-full px-8 py-6 text-sm font-semibold shadow-lg shadow-primary/10 hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                                    <Link href="/signup">
                                        Start Free Trial
                                    </Link>
                                </Button>
                                <Button size="lg" variant="outline" asChild className="w-full sm:w-auto rounded-full px-8 py-6 text-sm font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                                    <Link href="/login">
                                        Sign In
                                    </Link>
                                </Button>
                            </>
                        )}
                    </div>

                    <p className="mt-6 text-sm text-muted-foreground">
                        No credit card required • Cancel anytime • 24/7 support
                    </p>
                </div>
            </div>
        </section>
    )
}
