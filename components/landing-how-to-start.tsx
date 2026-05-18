"use client"

import React from "react"
import { motion } from "framer-motion"
import { Caveat } from "next/font/google"
import { LogoIcon } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { IconEyeOff } from "@tabler/icons-react"
import { LinkedInIcon, InstagramIcon, TikTokIcon, FacebookIcon, XIcon } from "@/components/icons/social-icons"
import { GoogleMapsIcon } from "@/components/icons/google-maps-icon"

const caveat = Caveat({ subsets: ["latin"] })

const platforms = [
    { name: "Instagram", icon: <InstagramIcon className="size-4" /> },
    { name: "TikTok", icon: <TikTokIcon className="size-4" /> },
    { name: "Facebook", icon: <FacebookIcon className="size-4" /> },
    { name: "LinkedIn", icon: <LinkedInIcon className="size-4" /> },
    { name: "Google Maps", icon: <GoogleMapsIcon className="size-4" /> },
    { name: "X", icon: <XIcon className="size-4" /> }
]

export default function LandingHowToStart() {
    return (
        <section className="relative overflow-hidden py-24 sm:py-32 bg-transparent">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-base font-semibold leading-7 text-foreground">
                        How It Works
                    </h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                        How to Start
                    </p>
                    <p className="mt-6 text-lg leading-8 text-muted-foreground">
                        From signing up to getting your first high-intent lead in under three minutes. Our onboarding is seamless.
                    </p>
                </div>

                <div className="mt-24 grid gap-10 md:gap-8 md:grid-cols-3 items-stretch max-w-5xl mx-auto w-full">
                    
                    {/* Step 1: Signup in seconds */}
                    <div className="relative flex flex-col items-center mt-12 md:mt-0">
                        {/* Outside label - Top Left */}
                        <div className="absolute -top-16 left-0 md:-top-20 md:-left-4 flex flex-col items-center text-foreground -rotate-[10deg] z-20">
                            <span className={`${caveat.className} text-4xl font-medium`}>Step 1</span>
                            <svg width="50" height="50" viewBox="0 0 100 100" className="opacity-80 rotate-6 mt-1 text-foreground">
                                <path d="M15,25 C45,15 65,45 85,85" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                <path d="M60,85 L85,85 L80,60" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        
                        {/* Minimalist Monochromatic Card Container */}
                        <div className="relative rounded-[2rem] bg-gradient-to-b from-muted/80 to-transparent p-[1px] shadow-lg h-full w-full flex">
                            <div className="relative flex flex-col items-center rounded-[calc(2rem-1px)] bg-gradient-to-b from-muted/20 via-background/90 to-background h-full w-full overflow-hidden pt-10 px-6 pb-10">
                                 {/* VISUAL ELEMENT */}
                                <div className="flex w-full flex-1 items-start justify-center relative mb-6 min-h-[130px]">
                                    {/* Simplified clone of the signup form */}
                                    <div className="w-full rounded-xl border bg-card p-3 shadow-lg relative z-10 pointer-events-none select-none">
                                        <div className="space-y-2">
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="space-y-1 text-left">
                                                    <Label className="block text-[10px] font-medium text-muted-foreground">Firstname</Label>
                                                    <Input type="text" value="John" readOnly className="h-7 text-[11px] px-2 bg-transparent" />
                                                </div>
                                                <div className="space-y-1 text-left">
                                                    <Label className="block text-[10px] font-medium text-muted-foreground">Lastname</Label>
                                                    <Input type="text" value="Doe" readOnly className="h-7 text-[11px] px-2 bg-transparent" />
                                                </div>
                                            </div>

                                            <div className="space-y-1 text-left">
                                                <Label className="block text-[10px] font-medium text-muted-foreground">Email</Label>
                                                <Input type="email" value="john@example.com" readOnly className="h-7 text-[11px] px-2 bg-transparent" />
                                            </div>

                                            <div className="space-y-1 text-left">
                                                <Label className="block text-[10px] font-medium text-muted-foreground">Password</Label>
                                                <div className="relative">
                                                    <Input type="password" value="********" readOnly className="pr-8 h-7 text-[11px] px-2 bg-transparent" />
                                                    <button type="button" className="text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2">
                                                        <IconEyeOff className="size-3" />
                                                    </button>
                                                </div>
                                            </div>

                                            <Button className="w-full h-7 text-[11px] font-medium mt-1">Sign Up</Button>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-0 w-[120%] h-12 bg-gradient-to-t from-background to-transparent z-0 pointer-events-none" />
                                </div>
                                
                                {/* TEXT ELEMENT */}
                                <div className="text-center w-full z-20 mt-auto">
                                    <h3 className="text-xl font-bold">Signup in seconds</h3>
                                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                                        Create your account and get immediate access to our high-intent lead dashboard.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step 2: Pick your platform */}
                    <div className="relative flex flex-col items-center mt-12 md:mt-0 md:-translate-y-16">
                        {/* Outside label - Bottom Center pointing UP */}
                        <div className="absolute -bottom-22 left-1/2 -translate-x-1/2 flex flex-col items-center text-foreground rotate-[5deg] z-20">
                            <svg width="38" height="38" viewBox="0 0 100 100" className="opacity-80 rotate-[-10deg] mb-0.5 text-foreground">
                                <path d="M50,85 C40,55 60,35 50,15" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                <path d="M35,30 L50,15 L65,25" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span className={`${caveat.className} text-4xl font-medium whitespace-nowrap`}>Step 2</span>
                        </div>
                        
                        {/* Minimalist Monochromatic Card Container */}
                        <div className="relative rounded-[2rem] bg-gradient-to-b from-muted/80 to-transparent p-[1px] shadow-lg h-full w-full flex">
                            <div className="relative flex flex-col items-center rounded-[calc(2rem-1px)] bg-gradient-to-b from-muted/20 via-background/90 to-background h-full w-full overflow-hidden pt-10 px-6 pb-10">
                                {/* VISUAL ELEMENT */}
                                <div className="flex w-full flex-1 flex-col items-center justify-start relative mb-6 min-h-[130px]">
                                    
                                    <div className="w-full rounded-xl border bg-card p-3 shadow-lg relative z-10 flex flex-col items-center">
                                        <div className="flex size-12 items-center justify-center relative z-10 animate-pop">
                                            <LogoIcon className="size-9" />
                                        </div>

                                        <div className="relative w-full max-w-[260px] h-10 flex items-center justify-center">
                                            <svg width="260" height="40" viewBox="0 0 260 40" className="absolute top-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                                                <path d="M 130 0 L 130 16 A 8 8 0 0 1 122 24 L 8 24 A 8 8 0 0 0 0 32 L 0 40" fill="none" stroke="currentColor" strokeWidth="1" className="text-border" />
                                                <path d="M 130 0 L 130 16 A 8 8 0 0 0 138 24 L 252 24 A 8 8 0 0 1 260 32 L 260 40" fill="none" stroke="currentColor" strokeWidth="1" className="text-border" />
                                                
                                                <motion.path 
                                                    d="M 130 0 L 130 16 A 8 8 0 0 1 122 24 L 8 24 A 8 8 0 0 0 0 32 L 0 40" 
                                                    fill="none" stroke="currentColor" strokeWidth="2" className="text-foreground" 
                                                    initial={{ pathLength: 0, pathOffset: 1 }}
                                                    animate={{ pathLength: 0.15, pathOffset: [1, -0.15] }}
                                                    transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                                                />
                                                <motion.path 
                                                    d="M 130 0 L 130 16 A 8 8 0 0 0 138 24 L 252 24 A 8 8 0 0 1 260 32 L 260 40" 
                                                    fill="none" stroke="currentColor" strokeWidth="2" className="text-foreground" 
                                                    initial={{ pathLength: 0, pathOffset: 1 }}
                                                    animate={{ pathLength: 0.15, pathOffset: [1, -0.15] }}
                                                    transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                                                />
                                            </svg>
                                        </div>
                                        
                                        <div className="relative w-full overflow-hidden pb-1 pt-1">
                                            <div className="flex w-max animate-scroll-x gap-10 px-4">
                                                {[...platforms, ...platforms, ...platforms].map((p, i) => (
                                                    <div key={i} className="flex flex-col items-center gap-2 grayscale hover:grayscale-0 transition-all opacity-70 hover:opacity-100">
                                                        <div className="flex size-10 items-center justify-center text-foreground">
                                                            {React.cloneElement(p.icon as React.ReactElement<{ className?: string }>, { className: "size-6" })}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="absolute bottom-0 w-[120%] h-12 bg-gradient-to-t from-background to-transparent z-10" />
                                </div>
                                
                                {/* TEXT ELEMENT */}
                                <div className="text-center w-full z-20 mt-auto">
                                    <h3 className="text-xl font-bold">Pick your platform</h3>
                                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                                        Connect X, LinkedIn, Google Maps, or TikTok to uncover your competitors' warm audience.
                                    </p>
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* Step 3: Get your Warm Leads */}
                    <div className="relative flex flex-col items-center mt-12 md:mt-0">
                        {/* Outside label - Top Right */}
                        <div className="absolute -top-16 right-0 md:-top-20 md:-right-4 flex flex-col items-center text-foreground rotate-[10deg] z-20">
                            <span className={`${caveat.className} text-4xl font-medium`}>Step 3</span>
                            <svg width="50" height="50" viewBox="0 0 100 100" className="opacity-80 -rotate-6 mt-1 text-foreground">
                                <path d="M85,25 C55,15 35,45 15,85" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                <path d="M40,85 L15,85 L20,60" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        
                        {/* Minimalist Monochromatic Card Container */}
                        <div className="relative rounded-[2rem] bg-gradient-to-b from-muted/80 to-transparent p-[1px] shadow-lg h-full w-full flex">
                            <div className="relative flex flex-col items-center rounded-[calc(2rem-1px)] bg-gradient-to-b from-muted/20 via-background/90 to-background h-full w-full overflow-hidden pt-10 px-6 pb-10">
                                {/* VISUAL ELEMENT */}
                                <div className="flex w-full flex-1 flex-col items-center justify-start gap-4 relative mb-6 min-h-[130px]">
                                    
                                    <div className="w-full rounded-xl border bg-card p-3 shadow-lg relative z-10">
                                        <div className="flex items-center justify-between border-b pb-2 mb-2">
                                            <h4 className="text-xs font-semibold">Incoming Warm Leads</h4>
                                            <span className="text-[9px] font-medium text-foreground bg-muted px-1.5 py-0.5 rounded-full border">+2 New</span>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            {[
                                                { name: "Alex Hormozi", role: "Founder", icon: <LinkedInIcon className="size-3" /> },
                                                { name: "Sam Parr", role: "CEO", icon: <XIcon className="size-3" /> }
                                            ].map((lead, i) => (
                                                <div key={i} className="flex items-center gap-2 rounded-lg border bg-muted/20 p-1.5 transition-colors hover:bg-muted/40">
                                                    <div className="size-7 rounded-full bg-muted border flex items-center justify-center text-[10px] font-bold text-foreground">
                                                        {lead.name.charAt(0)}
                                                    </div>
                                                    <div className="flex-1 text-left">
                                                        <p className="text-[11px] font-medium">{lead.name}</p>
                                                        <p className="text-[9px] text-muted-foreground">{lead.role}</p>
                                                    </div>
                                                    <div className="flex size-5 items-center justify-center rounded-md bg-background border text-foreground">
                                                        {lead.icon}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <Button variant="outline" className="w-full mt-2 h-7 text-[11px] font-medium">
                                            Export to CSV
                                        </Button>
                                    </div>

                                    <div className="absolute bottom-0 w-[120%] h-12 bg-gradient-to-t from-background to-transparent z-10" />
                                </div>
                                
                                {/* TEXT ELEMENT */}
                                <div className="text-center w-full z-20 mt-auto">
                                    <h3 className="text-xl font-bold">Get your Warm Leads</h3>
                                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                                        Watch fresh, high-intent leads flow directly into your dashboard, ready for export.
                                    </p>
                                </div>

                            </div>
                        </div>
                    </div>
            </div>
        </div>
    </section>
    )
}
