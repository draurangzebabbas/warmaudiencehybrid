"use client"

import React, { useState, useEffect } from "react"
import { IconRobot, IconUsers, IconMessageCircle, IconDatabaseImport, IconRadar, IconTrendingUp } from "@tabler/icons-react"
import { motion, AnimatePresence } from "framer-motion"

// Array of feed items for the simulation
const initialFeedItems = [
    {
        id: 1,
        icon: <IconUsers className="mt-0.5 size-4 text-foreground" />,
        title: "Competitor Engagement Detected",
        desc: "John Doe commented on Acme Corp's post.",
        bg: "bg-white/5",
        border: "border-white/10"
    },
    {
        id: 2,
        icon: <IconMessageCircle className="mt-0.5 size-4 text-foreground" />,
        title: "Keyword Signal: \"B2B Lead Gen\"",
        desc: "Sarah Smith engaged with tracked keyword.",
        bg: "bg-white/5",
        border: "border-white/10"
    },
    {
        id: 3,
        icon: <IconDatabaseImport className="mt-0.5 size-4 text-foreground" />,
        title: "Lead Extracted",
        desc: "Added highly-engaged profiles to your dashboard.",
        bg: "bg-white/5",
        border: "border-white/10"
    },
    {
        id: 4,
        icon: <IconRadar className="mt-0.5 size-4 text-foreground" />,
        title: "Scanning Active Networks...",
        desc: "Monitoring targeted competitor audiences.",
        bg: "bg-white/5",
        border: "border-white/10"
    },
    {
        id: 5,
        icon: <IconTrendingUp className="mt-0.5 size-4 text-foreground" />,
        title: "Engagement Spike Detected",
        desc: "Multiple prospects interacting with target keyword.",
        bg: "bg-white/5",
        border: "border-white/10"
    }
]

export default function LandingAutonomous() {
    const [feed, setFeed] = useState(initialFeedItems)

    useEffect(() => {
        const interval = setInterval(() => {
            setFeed((prevFeed) => {
                const newFeed = [...prevFeed]
                const firstItem = newFeed.shift()
                if (firstItem) {
                    newFeed.push(firstItem) // Push to the end to loop
                }
                // Ensure unique IDs to trigger Framer Motion animations cleanly, 
                // so we update the ID of the newly pushed item
                newFeed[newFeed.length - 1] = {
                    ...newFeed[newFeed.length - 1],
                    id: Date.now()
                }
                return newFeed
            })
        }, 1800) // Every 1.8 seconds, the feed updates

        return () => clearInterval(interval)
    }, [])

    return (
        <section className="relative overflow-hidden py-24 sm:py-32 bg-transparent">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-base font-semibold leading-7 text-primary">
                        Unmatched Autonomy
                    </h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                        Your AI Agents Work 24/7. Find Warm Leads While You Sleep.
                    </p>
                    <p className="mt-6 text-lg leading-8 text-muted-foreground">
                        Deploy intelligent agents that tirelessly scour the internet, score prospect intent, and populate your CRM—giving you a calendar full of meetings every morning.
                    </p>
                </div>

                <div className="mt-16 flex justify-center">
                    {/* The glowing "Command Center" card */}
                    <div className="relative w-full max-w-4xl rounded-3xl border bg-background/50 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
                        {/* Decorative glow behind the card */}
                        <div className="absolute -inset-0.5 -z-10 rounded-3xl bg-gradient-to-b from-primary/50 to-transparent opacity-20 blur-2xl"></div>
                        
                        <div className="grid gap-8 sm:grid-cols-2">
                            {/* Left Side: Agent Status */}
                            <div className="flex flex-col justify-center space-y-6">
                                <div className="flex items-center space-x-4">
                                    <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        {/* Custom Robot SVG with Animated Antenna */}
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="size-8 text-primary" stroke="currentColor" fill="none">
                                            {/* Antenna Group with wobble animation */}
                                            <g className="animate-[antenna-wobble_2s_ease-in-out_infinite]" style={{ transformOrigin: '50px 35px' }}>
                                                <line x1="50" y1="35" x2="50" y2="15" strokeWidth="5" strokeLinecap="round" />
                                                <circle cx="50" cy="15" r="6" strokeWidth="5" />
                                            </g>
                                            
                                            {/* Main Head */}
                                            <circle cx="50" cy="65" r="30" strokeWidth="5" />
                                            
                                            {/* Visor */}
                                            <rect x="30" y="55" width="40" height="20" rx="10" strokeWidth="5" />
                                            
                                            {/* Happy Eyes */}
                                            <path d="M 38 65 Q 42 59 46 65" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M 54 65 Q 58 59 62 65" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                    <div className="flex flex-col">
                                        <h3 className="text-lg font-semibold text-foreground">Agent: Alpha</h3>
                                    </div>
                                </div>
                                
                                <div className="space-y-4 rounded-xl border bg-muted/30 p-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Target Audience</span>
                                        <span className="font-medium">SaaS Founders</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Monitoring Triggers</span>
                                        <span className="font-medium">Keywords, Competitors</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Status</span>
                                        <div className="flex items-center gap-1.5 font-medium text-primary">
                                            <span className="relative flex size-2">
                                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                                                <span className="relative inline-flex size-2 rounded-full bg-green-500"></span>
                                            </span>
                                            Active
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: Live Feed Simulation */}
                            <div className="relative h-64 overflow-hidden rounded-xl border bg-muted/30 p-4 shadow-inner">
                                <div className="absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t from-background/90 via-background/60 to-transparent pointer-events-none"></div>
                                <div className="absolute inset-x-0 top-0 z-10 h-8 bg-gradient-to-b from-background/90 to-transparent pointer-events-none"></div>
                                <div className="flex flex-col gap-4">
                                    <AnimatePresence mode="popLayout">
                                        {feed.map((item) => (
                                            <motion.div
                                                key={item.id}
                                                layout
                                                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                                className={`flex items-start space-x-3 rounded-lg bg-background p-3 shadow-sm border border-border/50`}
                                            >
                                                {item.icon}
                                                <div className="text-xs">
                                                    <p className="font-medium text-foreground">{item.title}</p>
                                                    <p className="text-muted-foreground">{item.desc}</p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes antenna-wobble {
                    0%, 100% { transform: rotate(0deg); }
                    25% { transform: rotate(-15deg); }
                    75% { transform: rotate(15deg); }
                }
            `}} />
        </section>
    )
}
