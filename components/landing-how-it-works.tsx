"use client"

import { Key, Search, Database, Rocket } from "lucide-react"
import { motion, useScroll, useSpring, useInView } from "motion/react"
import { useRef } from "react"

const steps = [
    {
        name: "Connect Your API Keys",
        subtitle: "The Foundation",
        description: "Add your Apify API keys to our secure vault. This gives you direct access to professional-grade research tools at cost.",
        icon: Key,
    },
    {
        name: "Target Profiles or Keywords",
        subtitle: "Spot The Opportunity",
        description: "Input LinkedIn profile URLs, company pages, or specific keywords. You can even target posts to extract high-intent commenters.",
        icon: Search,
    },
    {
        name: "Build Your Audience Insight Vault",
        subtitle: "Build With Velocity",
        description: "Our system extracts, enriches, and saves data to your private Convex database. Smart analytics ensures you never pay for the same research twice.",
        icon: Database,
    },
    {
        name: "Automate Growth",
        subtitle: "Deliver & Convert",
        description: "Set up automated trackers to monitor competitors 24/7. Get notified of new posts, job changes, and market shifts automatically.",
        icon: Rocket,
    },
]

function StepCard({ step, index }: { step: typeof steps[0], index: number }) {
    const isEven = index % 2 === 0
    const cardRef = useRef(null)
    const isActive = useInView(cardRef, { margin: "-50% 0px -50% 0px" })

    return (
        <motion.div
            ref={cardRef}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`relative flex items-center ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 md:gap-12`}
        >
            <div className={`flex-1 ${isEven ? 'md:text-right' : 'md:text-left'}`}>
                <div className={`group relative overflow-hidden rounded-3xl border p-8 shadow-sm backdrop-blur-sm transition-all duration-500 ${isActive
                    ? 'border-primary/50 bg-card/80 shadow-[0_0_30px_color-mix(in_oklch,var(--primary),transparent_85%)]'
                    : 'border-border bg-card/50'
                    }`}>
                    <div className={`absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0'
                        }`} />

                    <div className="relative z-10">
                        <div className={`mb-6 inline-flex size-14 items-center justify-center rounded-2xl border transition-all duration-500 ${isActive
                            ? 'border-primary/20 bg-primary/10 text-primary scale-110'
                            : 'border-border bg-muted/30 text-muted-foreground'
                            } ${isEven ? 'md:ml-auto' : ''}`}>
                            <step.icon className="size-7" />
                        </div>

                        <div className="space-y-3">
                            <div className={`inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider transition-colors duration-500 ${isActive
                                ? 'bg-primary/20 text-primary'
                                : 'bg-muted text-muted-foreground'
                                }`}>
                                {step.subtitle}
                            </div>

                            <h3 className="text-xl font-bold">{step.name}</h3>

                            <p className="text-muted-foreground leading-relaxed">
                                {step.description}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative z-20 hidden md:flex h-full flex-col items-center justify-center">
                <div className={`relative flex size-8 items-center justify-center rounded-full border-4 transition-all duration-500 ${isActive
                    ? 'border-primary bg-primary scale-125 shadow-[0_0_20px_color-mix(in_oklch,var(--primary),transparent_50%)]'
                    : 'border-background bg-muted'
                    }`}>
                    <div className={`size-2.5 rounded-full bg-background transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`} />
                </div>
            </div>

            <div className="hidden flex-1 md:block" />
        </motion.div>
    )
}

export default function LandingHowItWorks() {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start center", "end center"]
    })

    const scaleY = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    })

    return (
        <section ref={containerRef} className="relative overflow-hidden pt-24 pb-8 sm:pt-32 sm:pb-12">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.primary.200/.1),transparent)] dark:bg-[radial-gradient(45rem_50rem_at_top,theme(colors.primary.900/.1),transparent)]" />

            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                        How WarmAudience Works
                    </p>
                    <p className="mt-6 text-lg leading-8 text-muted-foreground">
                        Build your proprietary audience research ecosystem in 4 simple steps.
                    </p>
                </div>

                <div className="relative mx-auto mt-20 max-w-5xl">
                    <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-border md:block">
                        <motion.div
                            style={{ scaleY, transformOrigin: "top" }}
                            className="absolute top-0 h-full w-full bg-primary shadow-[0_0_15px_color-mix(in_oklch,var(--primary),transparent_20%)]"
                        />
                    </div>

                    <div className="relative z-10 space-y-24 md:space-y-32">
                        {steps.map((step, index) => (
                            <StepCard key={step.name} step={step} index={index} />
                        ))}
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="mt-20 text-center"
                >
                    <p className="text-lg text-muted-foreground">
                        Ready to build your LinkedIn target database?{" "}
                        <a href="#pricing" className="font-semibold text-primary hover:underline">
                            View Pricing tiers →
                        </a>
                    </p>
                </motion.div>
            </div>
        </section>
    )
}
