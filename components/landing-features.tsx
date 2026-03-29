"use client"

import { BentoCard, BentoGrid } from "@/components/ui/bento-grid"
import {
    Users,
    Building2,
    Database,
    Zap,
    Search,
    ShieldCheck,
    BarChart3,
    Layers
} from "lucide-react"

const features = [
    {
        Icon: Database,
        name: "Audience Insight Vault",
        description: "Build your own private database of audience profiles and market trends. Never pay for the same research twice.",
        href: "#",
        cta: "Learn more",
        className: "col-span-3 lg:col-span-2",
        background: (
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent" />
                <div className="relative grid grid-cols-3 gap-2 p-8 opacity-20">
                    <div className="h-16 rounded-lg bg-primary/40" />
                    <div className="h-16 rounded-lg bg-primary/60" />
                    <div className="h-16 rounded-lg bg-primary/40" />
                    <div className="h-16 rounded-lg bg-primary/60" />
                    <div className="h-16 rounded-lg bg-primary/80" />
                    <div className="h-16 rounded-lg bg-primary/60" />
                </div>
            </div>
        ),
    },
    {
        Icon: ShieldCheck,
        name: "Smart Caching",
        description: "Advanced logic checks if a profile is already in your database before researching, saving you 80%+ on compute costs.",
        href: "#",
        cta: "Learn more",
        className: "col-span-3 lg:col-span-1",
        background: (
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-blue-500/10 to-transparent" />
                <ShieldCheck className="size-32 text-blue-500/20" />
            </div>
        ),
    },
    {
        Icon: Zap,
        name: "Engagement Analytics",
        description: "Research everyone who engaged with professional posts to understand high-interest audience behavior.",
        href: "#",
        cta: "Learn more",
        className: "col-span-3 lg:col-span-1",
        background: (
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 via-yellow-500/10 to-transparent" />
                <Zap className="size-32 text-yellow-500/20" />
            </div>
        ),
    },
    {
        Icon: Users,
        name: "Profile Enrichment",
        description: "Get full work history, education, skills, and even contact info from LinkedIn personal profiles instantly.",
        href: "#",
        cta: "Learn more",
        className: "col-span-3 lg:col-span-2",
        background: (
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-purple-500/10 to-transparent" />
                <div className="grid grid-cols-2 gap-4 p-8 opacity-20">
                    <div className="h-24 rounded-lg bg-purple-500/40" />
                    <div className="h-24 rounded-lg bg-purple-500/60" />
                    <div className="h-24 rounded-lg bg-purple-500/60" />
                    <div className="h-24 rounded-lg bg-purple-500/40" />
                </div>
            </div>
        ),
    },
    {
        Icon: Search,
        name: "Keyword Discovery",
        description: "Monitor entire industries by researching profiles based on specific keywords and hashtags 24/7.",
        href: "#",
        cta: "Learn more",
        className: "col-span-3 lg:col-span-1",
        background: (
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-orange-500/10 to-transparent" />
                <Search className="size-32 text-orange-500/20" />
            </div>
        ),
    },
    {
        Icon: Building2,
        name: "Company Intelligence",
        description: "Research deep company data including headcount, funding history, and location data at scale.",
        href: "#",
        cta: "Learn more",
        className: "col-span-3 lg:col-span-1",
        background: (
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 via-pink-500/10 to-transparent" />
                <Building2 className="size-32 text-pink-500/20" />
            </div>
        ),
    },
    {
        Icon: Layers,
        name: "Automated Trackers",
        description: "Set up target profiles to monitor and automatically research their new audience engagement trends.",
        href: "#",
        cta: "Learn more",
        className: "col-span-3 lg:col-span-1",
        background: (
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-cyan-500/10 to-transparent" />
                <Layers className="size-32 text-cyan-500/20" />
            </div>
        ),
    },
    {
        Icon: BarChart3,
        name: "Advanced Analytics",
        description: "Visualize your audience growth and monitor research performance across your entire ecosystem.",
        href: "#",
        cta: "Learn more",
        className: "col-span-3 lg:col-span-1",
        background: (
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-green-500/10 to-transparent" />
                <div className="flex items-end gap-2 p-8 opacity-20">
                    <div className="h-12 w-8 rounded bg-green-500/60" />
                    <div className="h-20 w-8 rounded bg-green-500/80" />
                    <div className="h-16 w-8 rounded bg-green-500/60" />
                    <div className="h-24 w-8 rounded bg-green-500/80" />
                </div>
            </div>
        ),
    },
]

export default function LandingFeatures() {
    return (
        <section id="features" className="py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-base font-semibold leading-7 text-primary">
                        Power Features
                    </h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                        Audience Intelligence at Scale
                    </p>
                    <p className="mt-6 text-lg leading-8 text-muted-foreground">
                        Stop manual searching. Automate your audience research and competitor analysis with our suite of powerful intelligence modules.
                    </p>
                </div>

                <div className="mt-16">
                    <BentoGrid>
                        {features.map((feature, idx) => (
                            <BentoCard key={idx} {...feature} />
                        ))}
                    </BentoGrid>
                </div>
            </div>
        </section>
    )
}
