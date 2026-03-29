"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { WordRotate } from "@/components/ui/word-rotate"
import { ArrowRight, Sparkles } from "lucide-react"
import { authClient } from "@/lib/auth-client"

export default function LandingHero() {
    const { data: session } = authClient.useSession()

    return (
        <section className="relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.primary.200/.2),transparent)] dark:bg-[radial-gradient(45rem_50rem_at_top,theme(colors.primary.900/.2),transparent)]" />


            {/* Content Container - Added relative z-10 to sit above particles */}
            <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 lg:py-40">
                <div className="mx-auto max-w-4xl text-center">
                    {/* Badge */}
                    <div className="mb-8 inline-flex items-center gap-2 rounded-full border bg-background/50 px-4 py-1.5 text-sm backdrop-blur-sm">
                        <Sparkles className="size-4 text-primary" />
                        <span className="text-muted-foreground">Premium Audience Research Platform</span>
                    </div>

                    {/* Main heading with rotating words */}
                    <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
                        Understand Your Market <br className="hidden sm:block" />
                        Audience{" "}
                        <WordRotate
                            words={["Dynamics", "Trends", "Engagement", "Insights"]}
                            className="inline-block bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
                            duration={3000}
                        />
                    </h1>

                    {/* Description */}
                    <p className="mt-6 text-lg leading-8 text-muted-foreground sm:text-xl">
                        Research and organize professional engagement data to build a deeper understanding of your market.
                        Sync audience insights directly to your workspace for high-level strategic planning.
                    </p>

                    {/* CTA Buttons */}
                    <div className="mt-10 flex items-center justify-center gap-4">
                        {session ? (
                            <Button size="lg" asChild className="group">
                                <Link href="/dashboard">
                                    Go to Dashboard
                                    <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </Button>
                        ) : (
                            <>
                                <Button size="lg" asChild className="group">
                                    <Link href="/signup">
                                        Open Research Suite
                                        <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                </Button>
                                <Button size="lg" variant="outline" asChild>
                                    <Link href="#features">
                                        Explore Tools
                                    </Link>
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="mt-16 grid grid-cols-2 gap-8 sm:grid-cols-4">
                        <div className="flex flex-col items-center">
                            <div className="text-3xl font-bold text-primary">6+</div>
                            <div className="mt-1 text-sm text-muted-foreground">Research Tools</div>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="text-3xl font-bold text-primary">80%</div>
                            <div className="mt-1 text-sm text-muted-foreground">Cost Efficiency</div>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="text-3xl font-bold text-primary">Sync</div>
                            <div className="mt-1 text-sm text-muted-foreground">Audience Data</div>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="text-3xl font-bold text-primary">Global</div>
                            <div className="mt-1 text-sm text-muted-foreground">Insights</div>
                        </div>
                    </div>
                </div>
            </div>
        </section >
    )
}
