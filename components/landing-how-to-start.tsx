"use client"

import React, { useRef } from "react"
import { motion } from "framer-motion"
import { LogoIcon } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { IconEyeOff } from "@tabler/icons-react"
import { LinkedInIcon, InstagramIcon, TikTokIcon, FacebookIcon, XIcon } from "@/components/icons/social-icons"
import { GoogleMapsIcon } from "@/components/icons/google-maps-icon"
import { AnimatedBeam } from "@/components/ui/animated-beam"

const platforms = [
    { name: "Instagram", icon: <InstagramIcon className="size-4" /> },
    { name: "TikTok", icon: <TikTokIcon className="size-4" /> },
    { name: "Facebook", icon: <FacebookIcon className="size-4" /> },
    { name: "LinkedIn", icon: <LinkedInIcon className="size-4" /> },
    { name: "Google Maps", icon: <GoogleMapsIcon className="size-4" /> },
    { name: "X", icon: <XIcon className="size-4" /> }
]

export default function LandingHowToStart() {
    const containerRef = useRef<HTMLDivElement>(null)
    const logoRef = useRef<HTMLDivElement>(null)
    const target1Ref = useRef<HTMLDivElement>(null)
    const target2Ref = useRef<HTMLDivElement>(null)

    return (
        <section className="relative overflow-hidden py-24 sm:py-32 bg-transparent">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-base font-semibold leading-7 text-primary">
                        How It Works
                    </h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                        How to Start
                    </p>
                    <p className="mt-6 text-lg leading-8 text-muted-foreground">
                        From signing up to getting your first high-intent lead in under three minutes. Our onboarding is seamless.
                    </p>
                </div>

                <div className="mt-16 grid gap-8 md:grid-cols-3">
                    
                    {/* Step 1: Signup in seconds */}
                    <div className="relative flex flex-col items-center overflow-hidden rounded-3xl border bg-muted/30 p-8 shadow-inner">
                        <div className="absolute top-0 flex h-8 w-full items-center justify-center bg-background/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground backdrop-blur-sm z-10 border-b">
                            Step 1: Signup in seconds
                        </div>
                        
                        <div className="mt-8 flex w-full flex-1 items-center justify-center">
                            {/* Scaled down simplified clone of the signup form */}
                            <div className="origin-top scale-[0.6] sm:scale-[0.65] w-[150%] max-w-[400px] pointer-events-none select-none">
                                <div className="bg-card m-auto h-fit w-full overflow-hidden rounded-[calc(var(--radius)+.125rem)] border shadow-md p-8">
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-2">
                                                <Label className="block text-sm">Firstname</Label>
                                                <Input type="text" value="John" readOnly />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="block text-sm">Lastname</Label>
                                                <Input type="text" value="Doe" readOnly />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="block text-sm">Email</Label>
                                            <Input type="email" value="john@example.com" readOnly />
                                        </div>

                                        <div className="space-y-0.5">
                                            <Label className="text-sm">Password</Label>
                                            <div className="relative">
                                                <Input type="password" value="********" readOnly className="pr-10" />
                                                <button type="button" className="text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2">
                                                    <IconEyeOff className="size-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <Button className="w-full">Sign Up</Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step 2: Pick your platform */}
                    <div className="relative flex flex-col items-center overflow-hidden rounded-3xl border bg-muted/30 p-8 shadow-inner">
                        <div className="absolute top-0 flex h-8 w-full items-center justify-center bg-background/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground backdrop-blur-sm z-10 border-b">
                            Step 2: Pick your platform
                        </div>
                        
                        <div className="mt-16 flex w-full flex-1 flex-col items-center justify-center relative">
                            
                            {/* WarmAudience Logo Node - No Background, Popping Animation */}
                            <div className="flex size-16 items-center justify-center relative z-10 animate-[pop_3s_ease-in-out_infinite]">
                                <LogoIcon className="size-12" />
                            </div>

                            {/* Custom SVG Hierarchical Beam with Animated Paths */}
                            <div className="relative w-full max-w-[280px] h-14 flex items-center justify-center">
                                <svg width="280" height="56" viewBox="0 0 280 56" className="absolute top-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                                    {/* Base Lines (Sharp curves using Arcs) */}
                                    <path d="M 140 0 L 140 24 A 8 8 0 0 1 132 32 L 8 32 A 8 8 0 0 0 0 40 L 0 56" fill="none" stroke="currentColor" strokeWidth="1" className="text-border" />
                                    <path d="M 140 0 L 140 24 A 8 8 0 0 0 148 32 L 272 32 A 8 8 0 0 1 280 40 L 280 56" fill="none" stroke="currentColor" strokeWidth="1" className="text-border" />
                                    
                                    {/* Animated Monochromatic Beams (using Framer Motion for flawless, glitch-free path tracking) */}
                                    <motion.path 
                                        d="M 140 0 L 140 24 A 8 8 0 0 1 132 32 L 8 32 A 8 8 0 0 0 0 40 L 0 56" 
                                        fill="none" stroke="currentColor" strokeWidth="2" className="text-foreground" 
                                        initial={{ pathLength: 0, pathOffset: 1 }}
                                        animate={{ pathLength: 0.15, pathOffset: [1, -0.15] }}
                                        transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                                    />
                                    <motion.path 
                                        d="M 140 0 L 140 24 A 8 8 0 0 0 148 32 L 272 32 A 8 8 0 0 1 280 40 L 280 56" 
                                        fill="none" stroke="currentColor" strokeWidth="2" className="text-foreground" 
                                        initial={{ pathLength: 0, pathOffset: 1 }}
                                        animate={{ pathLength: 0.15, pathOffset: [1, -0.15] }}
                                        transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                                    />
                                </svg>
                            </div>
                            
                            {/* Looping Marquee of Platforms */}
                            <div className="relative w-full overflow-hidden pb-4 pt-2">
                                
                                <div className="flex w-max animate-[scroll-x_15s_linear_infinite] gap-16 px-4">
                                    {[...platforms, ...platforms, ...platforms].map((p, i) => (
                                        <div key={i} className="flex flex-col items-center gap-2 grayscale hover:grayscale-0 transition-all opacity-70 hover:opacity-100">
                                            <div className="flex size-14 items-center justify-center text-foreground">
                                                {React.cloneElement(p.icon as React.ReactElement<{ className?: string }>, { className: "size-8" })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Step 3: Get your Warm Leads */}
                    <div className="relative flex flex-col items-center overflow-hidden rounded-3xl border bg-muted/30 p-8 shadow-inner">
                        <div className="absolute top-0 flex h-8 w-full items-center justify-center bg-background/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground backdrop-blur-sm z-10 border-b">
                            Step 3: Get your Warm Leads
                        </div>
                        
                        <div className="mt-16 flex w-full flex-1 flex-col items-center justify-center gap-4">
                            
                            <div className="w-full rounded-xl border bg-card p-4 shadow-xl relative">
                                <div className="flex items-center justify-between border-b pb-3 mb-3">
                                    <h4 className="text-sm font-semibold">Incoming Warm Leads</h4>
                                    <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">+3 New</span>
                                </div>
                                
                                <div className="space-y-3">
                                    {[
                                        { name: "Alex Hormozi", role: "Founder", icon: <LinkedInIcon className="size-3" /> },
                                        { name: "Sam Parr", role: "CEO", icon: <XIcon className="size-3" /> },
                                        { name: "Local Gym", role: "Business", icon: <GoogleMapsIcon className="size-3" /> }
                                    ].map((lead, i) => (
                                        <div key={i} className="flex items-center gap-3 rounded-lg border bg-muted/20 p-2 transition-colors hover:bg-muted/40">
                                            <div className="size-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-xs font-bold text-primary">
                                                {lead.name.charAt(0)}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs font-medium">{lead.name}</p>
                                                <p className="text-[10px] text-muted-foreground">{lead.role}</p>
                                            </div>
                                            <div className="flex size-6 items-center justify-center rounded-md bg-background border text-foreground">
                                                {lead.icon}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <Button className="w-full mt-4 h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90">
                                    Export to CSV
                                </Button>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes scroll-x {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-33.33%); }
                }
                @keyframes pop {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.15); }
                }
                @keyframes beam-travel {
                    0% { stroke-dashoffset: 230; }
                    100% { stroke-dashoffset: -30; }
                }
            `}} />
        </section>
    )
}
