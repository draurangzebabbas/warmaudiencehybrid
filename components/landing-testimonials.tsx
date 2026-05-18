'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Testimonial {
    name: string
    role: string
    company: string
    avatar: string
    content: string
    rating: number
}

const testimonials: Testimonial[] = [
    {
        name: "Kenny Saad",
        role: "CEO",
        company: "Vision Media",
        avatar: "KS",
        content: "WarmAudience is solving the hardest problem in outbound: finding high-intent leads. We booked 5 demos from our first batch of 30 leads.",
        rating: 5
    },
    {
        name: "Maxime Le Morillon",
        role: "Head of Sales",
        company: "MarketScale Agency",
        avatar: "MM",
        content: "We used to waste hours prospecting manually. Now, we get high-quality warm leads with clear buying intent delivered directly to our pipeline every morning.",
        rating: 5
    },
    {
        name: "Alessandro Paladin",
        role: "Co-Founder",
        company: "KubaLabs",
        avatar: "AP",
        content: "We tracked users engaging with our competitors on Twitter and Instagram. WarmAudience captured them in minutes. The conversion rates are insane.",
        rating: 5
    },
    {
        name: "Amin Lams",
        role: "CEO",
        company: "TheLams.io Agency",
        avatar: "AL",
        content: "A complete game-changer for B2B. Their automated Google Maps and Instagram scraping features have filled our outbound sales pipeline within a week.",
        rating: 5
    },
    {
        name: "Sarah Chen",
        role: "Growth Lead",
        company: "SaaSify",
        avatar: "SC",
        content: "The intent tracking is unmatched. Instead of sending thousands of cold emails, we now only contact prospects who are actively showing warm buying signals.",
        rating: 5
    },
    {
        name: "Marcus Brodin",
        role: "Founder",
        company: "OutreachFlow",
        avatar: "MB",
        content: "Absolutely stellar tool. It took us less than 10 minutes to set up our first researcher stream, and we have already closed two new enterprise accounts.",
        rating: 5
    },
    {
        name: "Elena Rostova",
        role: "Operations Director",
        company: "LeadGenius",
        avatar: "ER",
        content: "We shifted all our outbound campaigns to WarmAudience. Our sales representatives are far happier, and our outbound meetings booked grew by 180%.",
        rating: 5
    },
    {
        name: "David Miller",
        role: "Co-Founder",
        company: "DevScale",
        avatar: "DM",
        content: "The high-fidelity metadata enrichment is what sets it apart. Getting clean, verified business emails, social handles, and phones instantly is pure magic.",
        rating: 5
    },
    {
        name: "Sophia Varga",
        role: "VP of Sales",
        company: "CloudFlow",
        avatar: "SV",
        content: "Finding warm outbound leads has never been this simple. The auto-enrichment processes raw target URLs into pristine prospects automatically.",
        rating: 5
    }
]

// Split testimonials into 3 columns
const firstColumn = [testimonials[0], testimonials[3], testimonials[6]]
const secondColumn = [testimonials[1], testimonials[4], testimonials[7]]
const thirdColumn = [testimonials[2], testimonials[5], testimonials[8]]

const TestimonialCard = ({ name, role, company, avatar, content }: Testimonial) => {
    return (
        <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-card/50 p-6 backdrop-blur-md transition-all duration-300 hover:border-border/80 dark:bg-card/40 dark:hover:bg-card/60">
            {/* User Profile Info */}
            <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-sm font-semibold text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                    {avatar}
                </div>
                <div className="min-w-0">
                    <span className="block text-sm font-bold text-foreground truncate">{name}</span>
                    <span className="block text-xs text-muted-foreground truncate">{role} @ {company}</span>
                </div>
            </div>

            {/* Stars */}
            <div className="mt-4 flex gap-0.5 text-yellow-500">
                {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-3.5 fill-current" />
                ))}
            </div>

            {/* Review Content */}
            <p className="mt-3.5 text-sm leading-relaxed text-muted-foreground">
                "{content}"
            </p>
        </div>
    )
}

const MarqueeColumn = ({ columnTestimonials, className, speed = "35s", reverse = false }: { columnTestimonials: Testimonial[], className?: string, speed?: string, reverse?: boolean }) => {
    return (
        <div className={cn("flex flex-col gap-6 overflow-hidden h-[450px] relative py-4 mask-fade-vertical", className)}>
            <div 
                className={cn("flex flex-col gap-6 shrink-0 min-h-full", 
                    reverse ? "animate-marquee-down" : "animate-marquee-up"
                )}
                style={{ animationDuration: speed }}
            >
                {/* Loop 1 */}
                {columnTestimonials.map((t, idx) => (
                    <TestimonialCard key={`1-${idx}`} {...t} />
                ))}
                {/* Loop 2 */}
                {columnTestimonials.map((t, idx) => (
                    <TestimonialCard key={`2-${idx}`} {...t} />
                ))}
                {/* Loop 3 for guaranteed seamless transition */}
                {columnTestimonials.map((t, idx) => (
                    <TestimonialCard key={`3-${idx}`} {...t} />
                ))}
            </div>
        </div>
    )
}

export default function LandingTestimonials() {
    return (
        <section className="relative overflow-hidden py-24 sm:py-32 bg-transparent">
            <div className="mx-auto max-w-5xl px-6 lg:px-8">
                {/* Section Header */}
                <div className="flex flex-col items-center text-center">
                    {/* Double Pill Badge Inspired by Screenshot */}
                    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 p-1 pr-3 text-xs backdrop-blur-md dark:border-zinc-800">
                        <span className="rounded-full bg-foreground px-2.5 py-0.5 font-semibold text-background">
                            Testimonials
                        </span>
                        <span className="text-muted-foreground font-medium">
                            Not just words, see results
                        </span>
                    </div>

                    <h2 className="mt-8 text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl max-w-4xl leading-none">
                        Trusted by 1000+ small sales teams, and B2B founders worldwide
                    </h2>
                </div>

                {/* Vertical 3-Column Marquee Grid */}
                <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3 md:mt-24">
                    <MarqueeColumn columnTestimonials={firstColumn} speed="38s" />
                    <MarqueeColumn columnTestimonials={secondColumn} speed="32s" reverse={true} />
                    <MarqueeColumn columnTestimonials={thirdColumn} speed="44s" />
                </div>

                {/* Bottom Call to Action */}
                <div className="mt-16 flex justify-center">
                    <Button 
                        asChild 
                        size="lg" 
                        className="rounded-full px-8 py-6 text-sm font-semibold shadow-lg shadow-primary/10 hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                    >
                        <Link href="/signup">
                            Launch your AI Agent for free
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    )
}
