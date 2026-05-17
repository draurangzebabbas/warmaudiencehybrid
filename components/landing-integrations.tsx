"use client"

import React, { forwardRef, useRef } from "react"
import { cn } from "@/lib/utils"
import { AnimatedBeam } from "@/components/ui/animated-beam"

import { LogoIcon } from "@/components/logo"

const Circle = forwardRef<
    HTMLDivElement,
    { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
    return (
        <div
            ref={ref}
            className={cn(
                "z-10 flex size-12 items-center justify-center rounded-full border-2 bg-background p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]",
                className
            )}
        >
            {children}
        </div>
    )
})

Circle.displayName = "Circle"

export default function LandingIntegrations() {
    const containerRef = useRef<HTMLDivElement>(null)
    const div1Ref = useRef<HTMLDivElement>(null) // LinkedIn
    const div2Ref = useRef<HTMLDivElement>(null) // Instagram
    const div3Ref = useRef<HTMLDivElement>(null) // X.com
    const div4Ref = useRef<HTMLDivElement>(null) // Center (Dashboard)
    const div5Ref = useRef<HTMLDivElement>(null) // Facebook
    const div6Ref = useRef<HTMLDivElement>(null) // Google Maps
    const div7Ref = useRef<HTMLDivElement>(null) // TikTok

    return (
        <section className="relative overflow-hidden py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-base font-semibold leading-7 text-primary">
                        Universal Extraction
                    </h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl sm:whitespace-nowrap">
                        Stop Chasing Cold Data Capture Warm Intent
                    </p>
                    <p className="mt-6 text-lg leading-8 font-semibold text-foreground">
                        Don&apos;t just scrape names — Find your next buyers.
                    </p>
                    <p className="mt-2 text-lg leading-8 text-muted-foreground">
                        WarmAudience autonomously extracts highly-engaged prospects across every major social platform, delivering a pipeline of high-intent, ready-to-convert leads directly to your dashboard.
                    </p>
                </div>

                <div className="mt-16 flex items-center justify-center">
                    <div
                        className="relative flex h-[400px] w-full max-w-4xl items-center justify-center overflow-hidden p-10"
                        ref={containerRef}
                    >
                        <div className="flex size-full flex-col items-stretch justify-between gap-10">
                            <div className="flex flex-row items-center justify-between">
                                <Circle ref={div1Ref}>
                                    <Icons.linkedin />
                                </Circle>
                                <Circle ref={div5Ref}>
                                    <Icons.facebook />
                                </Circle>
                            </div>
                            <div className="flex flex-row items-center justify-between">
                                <Circle ref={div2Ref}>
                                    <Icons.instagram />
                                </Circle>
                                <Circle ref={div4Ref} className="size-20 border-4 p-4 shadow-xl">
                                    <LogoIcon className="h-full w-full" />
                                </Circle>
                                <Circle ref={div6Ref}>
                                    <Icons.googlemap />
                                </Circle>
                            </div>
                            <div className="flex flex-row items-center justify-between">
                                <Circle ref={div3Ref}>
                                    <Icons.x />
                                </Circle>
                                <Circle ref={div7Ref}>
                                    <Icons.tiktok />
                                </Circle>
                            </div>
                        </div>

                        {/* Beams from sources to Dashboard */}
                        <AnimatedBeam
                            containerRef={containerRef}
                            fromRef={div1Ref}
                            toRef={div4Ref}
                            curvature={-75}
                            endYOffset={-10}
                            pathColor="var(--border)"
                            gradientStartColor="#737373"
                            gradientStopColor="#a3a3a3"
                        />
                        <AnimatedBeam
                            containerRef={containerRef}
                            fromRef={div2Ref}
                            toRef={div4Ref}
                            pathColor="var(--border)"
                            gradientStartColor="#737373"
                            gradientStopColor="#a3a3a3"
                        />
                        <AnimatedBeam
                            containerRef={containerRef}
                            fromRef={div3Ref}
                            toRef={div4Ref}
                            curvature={75}
                            endYOffset={10}
                            pathColor="var(--border)"
                            gradientStartColor="#737373"
                            gradientStopColor="#a3a3a3"
                        />

                        {/* Beams from Right Side to Dashboard */}
                        <AnimatedBeam
                            containerRef={containerRef}
                            fromRef={div5Ref}
                            toRef={div4Ref}
                            curvature={-75}
                            endYOffset={-10}
                            reverse
                            pathColor="var(--border)"
                            gradientStartColor="#737373"
                            gradientStopColor="#a3a3a3"
                        />
                        <AnimatedBeam
                            containerRef={containerRef}
                            fromRef={div6Ref}
                            toRef={div4Ref}
                            reverse
                            pathColor="var(--border)"
                            gradientStartColor="#737373"
                            gradientStopColor="#a3a3a3"
                        />
                        <AnimatedBeam
                            containerRef={containerRef}
                            fromRef={div7Ref}
                            toRef={div4Ref}
                            curvature={75}
                            endYOffset={10}
                            reverse
                            pathColor="var(--border)"
                            gradientStartColor="#737373"
                            gradientStopColor="#a3a3a3"
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}

const Icons = {
    linkedin: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 1025 1024"><path fill="currentColor" d="M896.428 1024h-768q-53 0-90.5-37.5T.428 896V128q0-53 37.5-90.5t90.5-37.5h768q53 0 90.5 37.5t37.5 90.5v768q0 53-37.5 90.5t-90.5 37.5zm-640-864q0-13-9.5-22.5t-22.5-9.5h-64q-13 0-22.5 9.5t-9.5 22.5v64q0 13 9.5 22.5t22.5 9.5h64q13 0 22.5-9.5t9.5-22.5v-64zm0 192q0-13-9.5-22.5t-22.5-9.5h-64q-13 0-22.5 9.5t-9.5 22.5v512q0 13 9.5 22.5t22.5 9.5h64q13 0 22.5-9.5t9.5-22.5V352zm640 160q0-80-56-136t-136-56q-44 0-96.5 14t-95.5 39v-21q0-13-9.5-22.5t-22.5-9.5h-64q-13 0-22.5 9.5t-9.5 22.5v512q0 13 9.5 22.5t22.5 9.5h64q13 0 22.5-9.5t9.5-22.5V576q0-53 37.5-90.5t90.5-37.5t90.5 37.5t37.5 90.5v288q0 13 9.5 22.5t22.5 9.5h64q13 0 22.5-9.5t9.5-22.5V512z" /></svg>
    ),
    instagram: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24"><path fill="currentColor" d="M12 0C8.74 0 8.333.015 7.053.072C5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053C.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913a5.885 5.885 0 0 0 1.384 2.126A5.868 5.868 0 0 0 4.14 23.37c.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558a5.898 5.898 0 0 0 2.126-1.384a5.86 5.86 0 0 0 1.384-2.126c.296-.765.499-1.636.558-2.913c.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913a5.89 5.89 0 0 0-1.384-2.126A5.847 5.847 0 0 0 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071c1.17.055 1.805.249 2.227.415c.562.217.96.477 1.382.896c.419.42.679.819.896 1.381c.164.422.36 1.057.413 2.227c.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227a3.81 3.81 0 0 1-.899 1.382a3.744 3.744 0 0 1-1.38.896c-.42.164-1.065.36-2.235.413c-1.274.057-1.649.07-4.859.07c-3.211 0-3.586-.015-4.859-.074c-1.171-.061-1.816-.256-2.236-.421a3.716 3.716 0 0 1-1.379-.899a3.644 3.644 0 0 1-.9-1.38c-.165-.42-.359-1.065-.42-2.235c-.045-1.26-.061-1.649-.061-4.844c0-3.196.016-3.586.061-4.861c.061-1.17.255-1.814.42-2.234c.21-.57.479-.96.9-1.381c.419-.419.81-.689 1.379-.898c.42-.166 1.051-.361 2.221-.421c1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 1 0 0 12.324a6.162 6.162 0 1 0 0-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4s4 1.79 4 4s-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 0 1-2.88 0a1.44 1.44 0 0 1 2.88 0z" /></svg>
    ),
    x: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24"><path fill="currentColor" d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584l-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" /></svg>
    ),
    facebook: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24"><path fill="currentColor" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669c1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
    ),
    googlemap: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 448 480"><path fill="currentColor" d="M341 5q44 0 75.5 31.5T448 112q0 22-26.5 67.5t-52 92.5t-22.5 75q0 5-5.5 5t-5.5-5q2-28-23-75t-51.5-92.5T235 112q0-44 31-75.5T341 5zm.5 64q-17.5 0-30 12.5T299 112t12.5 30.5t30 12.5t30-12.5T384 112t-12.5-30.5t-30-12.5zM43 48h185q-20 32-20 69q0 26 32 83L1 439l-1-7V91q0-18 12.5-30.5T43 48zm267 275l-51-51l14-15q24 39 37 66zm61 152H56l157-158zm56-248v205l-1 7l-72-72q3-9 7-18.5t9-20t9.5-19t12-21.5t11-19.5T415 247zm-327 24q-17 0-27-7t-10-19q0-14 18-21q10-3 22-3h5q13 10 18 15t5 12q0 9-9 16t-22 7zM75 129q0-10 5.5-15.5T93 108q13 0 20.5 12t7.5 25q0 11-6.5 15.5T101 165q-11 0-18.5-11.5T75 129zm52 62l-7-6q-6-5-6-9q0-7 7-12q17-13 17-29q0-14-14-26h12l9-9h-43q-21 0-32.5 11.5T58 139q0 13 9 23t25 10h5l-2 8q0 7 6 14q-24 1-40 11q-16 9-16 25q0 13 11.5 21.5T90 260q25 0 39.5-12t14.5-27q0-16-17-30z" /></svg>
    ),
    tiktok: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24"><path fill="currentColor" d="M12.525.02c1.31-.02 2.61-.01 3.91-.02c.08 1.53.63 3.09 1.75 4.17c1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97c-.57-.26-1.1-.59-1.62-.93c-.01 2.92.01 5.84-.02 8.75c-.08 1.4-.54 2.79-1.35 3.94c-1.31 1.92-3.58 3.17-5.91 3.21c-1.43.08-2.86-.31-4.08-1.03c-2.02-1.19-3.44-3.37-3.65-5.71c-.02-.5-.03-1-.01-1.49c.18-1.9 1.12-3.72 2.58-4.96c1.66-1.44 3.98-2.13 6.15-1.72c.02 1.48-.04 2.96-.04 4.44c-.99-.32-2.15-.23-3.02.37c-.63.41-1.11 1.04-1.36 1.75c-.21.51-.15 1.07-.14 1.61c.24 1.64 1.82 3.02 3.5 2.87c1.12-.01 2.19-.66 2.77-1.61c.19-.33.4-.67.41-1.06c.1-1.79.06-3.57.07-5.36c.01-4.03-.01-8.05.02-12.07z" /></svg>
    )
}
