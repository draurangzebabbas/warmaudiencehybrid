"use client"

import React, { forwardRef, useRef } from "react"
import { cn } from "@/lib/utils"
import { AnimatedBeam } from "@/components/ui/animated-beam"
import { LogoIcon } from "@/components/logo"
import { motion } from "motion/react"

const Circle = forwardRef<
    HTMLDivElement,
    { className?: string; children?: React.ReactNode; style?: React.CSSProperties }
>(({ className, children, style }, ref) => {
    return (
        <div
            ref={ref}
            className={cn(
                "z-10 flex size-12 items-center justify-center rounded-full border-2 bg-background p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]",
                className
            )}
            style={style}
        >
            {children}
        </div>
    )
})

Circle.displayName = "Circle"

export default function LandingOutboundIntegrations() {
    const containerRef = useRef<HTMLDivElement>(null)
    const div1Ref = useRef<HTMLDivElement>(null) // Slack
    const div2Ref = useRef<HTMLDivElement>(null) // Zapier
    const div3Ref = useRef<HTMLDivElement>(null) // N8N
    const div4Ref = useRef<HTMLDivElement>(null) // Center (Dashboard)
    const div5Ref = useRef<HTMLDivElement>(null) // Make.com
    const div6Ref = useRef<HTMLDivElement>(null) // HubSpot
    const div7Ref = useRef<HTMLDivElement>(null) // Gumloop

    return (
        <section className="relative overflow-hidden py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-base font-semibold leading-7 text-primary">
                        Outbound Syndication
                    </h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                        Zero Friction. Infinite Workflows.
                    </p>
                    <p className="mt-6 text-lg leading-8 font-semibold text-foreground">
                        Don&apos;t just store warm leads — Action them instantly.
                    </p>
                    <p className="mt-2 text-lg leading-8 text-muted-foreground">
                        Seamlessly stream validated corporate emails, rich social signals, and real-time intent data directly into Slack, HubSpot, Make, or custom API webhooks the millisecond they are captured.
                    </p>
                </div>

                <div className="mt-16 flex items-center justify-center">
                    <div
                        className="relative flex h-[500px] w-full max-w-xl items-center justify-center overflow-hidden p-10"
                        ref={containerRef}
                    >
                        <div className="flex size-full max-w-md flex-row items-stretch justify-between gap-10">
                            {/* Column 1 (Left): Central Hub */}
                            <div className="flex flex-col justify-center">
                                <Circle 
                                    ref={div4Ref} 
                                    className="size-20 border-4 p-4 shadow-xl"
                                >
                                    <motion.div 
                                        className="h-full w-full flex items-center justify-center"
                                        animate={{
                                            scale: [1.15, 1, 1, 1, 1.15],
                                            filter: [
                                                "drop-shadow(0 0 20px hsl(var(--primary)))",
                                                "drop-shadow(0 0 0px transparent)",
                                                "drop-shadow(0 0 0px transparent)",
                                                "drop-shadow(0 0 0px transparent)",
                                                "drop-shadow(0 0 20px hsl(var(--primary)))",
                                            ],
                                        }}
                                        transition={{
                                            duration: 3,
                                            ease: "linear",
                                            repeat: Infinity,
                                        }}
                                    >
                                        <LogoIcon className="h-full w-full" />
                                    </motion.div>
                                </Circle>
                            </div>
                            {/* Column 2 (Right): Outer destination syndications */}
                            <div className="flex flex-col justify-center gap-4">
                                <Circle ref={div1Ref} className="hover:scale-110 transition-transform duration-300 cursor-pointer border-muted-foreground/20">
                                    <Icons.slack />
                                </Circle>
                                <Circle ref={div5Ref} className="hover:scale-110 transition-transform duration-300 cursor-pointer border-muted-foreground/20">
                                    <Icons.make />
                                </Circle>
                                <Circle ref={div2Ref} className="hover:scale-110 transition-transform duration-300 cursor-pointer border-muted-foreground/20">
                                    <Icons.zapier />
                                </Circle>
                                <Circle ref={div6Ref} className="hover:scale-110 transition-transform duration-300 cursor-pointer border-muted-foreground/20">
                                    <Icons.hubspot />
                                </Circle>
                                <Circle ref={div3Ref} className="hover:scale-110 transition-transform duration-300 cursor-pointer border-muted-foreground/20">
                                    <Icons.n8n />
                                </Circle>
                                <Circle ref={div7Ref} className="hover:scale-110 transition-transform duration-300 cursor-pointer border-muted-foreground/20">
                                    <Icons.gumloop />
                                </Circle>
                            </div>
                        </div>

                        {/* Animated Beams flowing Left -> Right (monochromatic, mirrored geometry) */}
                        <AnimatedBeam
                            containerRef={containerRef}
                            fromRef={div1Ref}
                            toRef={div4Ref}
                            pathColor="var(--border)"
                            gradientStartColor="#737373"
                            gradientStopColor="#a3a3a3"
                            duration={3}
                            delay={0}
                            ease="linear"
                        />
                        <AnimatedBeam
                            containerRef={containerRef}
                            fromRef={div5Ref}
                            toRef={div4Ref}
                            pathColor="var(--border)"
                            gradientStartColor="#737373"
                            gradientStopColor="#a3a3a3"
                            duration={3}
                            delay={0}
                            ease="linear"
                        />
                        <AnimatedBeam
                            containerRef={containerRef}
                            fromRef={div2Ref}
                            toRef={div4Ref}
                            pathColor="var(--border)"
                            gradientStartColor="#737373"
                            gradientStopColor="#a3a3a3"
                            duration={3}
                            delay={0}
                            ease="linear"
                        />
                        <AnimatedBeam
                            containerRef={containerRef}
                            fromRef={div6Ref}
                            toRef={div4Ref}
                            pathColor="var(--border)"
                            gradientStartColor="#737373"
                            gradientStopColor="#a3a3a3"
                            duration={3}
                            delay={0}
                            ease="linear"
                        />
                        <AnimatedBeam
                            containerRef={containerRef}
                            fromRef={div3Ref}
                            toRef={div4Ref}
                            pathColor="var(--border)"
                            gradientStartColor="#737373"
                            gradientStopColor="#a3a3a3"
                            duration={3}
                            delay={0}
                            ease="linear"
                        />
                        <AnimatedBeam
                            containerRef={containerRef}
                            fromRef={div7Ref}
                            toRef={div4Ref}
                            pathColor="var(--border)"
                            gradientStartColor="#737373"
                            gradientStopColor="#a3a3a3"
                            duration={3}
                            delay={0}
                            ease="linear"
                        />
                    </div>
                </div>
            </div>

        </section>
    )
}

const Icons = {
    slack: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9.338 2a2 2 0 0 0 .001 4h1.996V4a2 2 0 0 0-1.997-2m0 5.333H4.016a2 2 0 0 0 0 4h5.322a2 2 0 0 0 0-4Z" />
            <path d="M21.98 9.333a1.996 1.996 0 1 0-3.993 0v2h1.997a1.998 1.998 0 0 0 1.996-2Zm-5.323 0V4a1.996 1.996 0 1 0-3.992 0v5.333a1.996 1.996 0 1 0 3.992 0Z" opacity=".35" />
            <path d="M14.661 22a2 2 0 0 0 0-4h-1.996v2a2 2 0 0 0 1.996 2Zm0-5.334h5.323a2 2 0 0 0 0-4h-5.322a2 2 0 0 0-.001 4Z" opacity=".8" />
            <path d="M2.02 14.666a1.996 1.996 0 1 0 3.993 0v-2H4.016a1.998 1.998 0 0 0-1.996 2Zm5.323 0V20a1.996 1.996 0 1 0 3.992 0v-5.332a1.996 1.996 0 1 0-3.992-.002" opacity=".6" />
        </svg>
    ),
    zapier: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15 12.004c0 .893-.165 1.746-.461 2.535a7.172 7.172 0 0 1-2.535.461h-.009a7.193 7.193 0 0 1-2.534-.461A7.18 7.18 0 0 1 9 12.004v-.009c0-.893.164-1.745.461-2.534A7.175 7.175 0 0 1 11.995 9h.009c.893 0 1.748.164 2.535.462c.297.788.461 1.641.461 2.535v.007zM23.835 10H16.83l4.948-4.952a12.052 12.052 0 0 0-2.825-2.829l-4.954 4.949V.165A12.577 12.577 0 0 0 12.004 0h-.01c-.68 0-1.346.061-1.995.165V7.17l-4.95-4.949a11.997 11.997 0 0 0-2.83 2.827L7.168 10H.165S0 11.316 0 11.995v.009c0 .68.061 1.348.165 1.995H7.17l-4.949 4.952a11.981 11.981 0 0 0 2.827 2.83L10 16.831v7.004a12.44 12.44 0 0 0 1.991.165h.017c.679 0 1.344-.06 1.991-.165v-7.004l4.952 4.95c.548-.375 1.06-.812 1.529-1.29h.005c.473-.465.906-.976 1.296-1.531l-4.95-4.949h7.004c.105-.645.165-1.304.165-1.98V12c0-.678-.06-1.343-.165-1.99" />
        </svg>
    ),
    n8n: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21.474 5.684a2.53 2.53 0 0 0-2.447 1.895H16.13a2.526 2.526 0 0 0-2.492 2.11l-.103.624a1.26 1.26 0 0 1-1.246 1.055h-1.001a2.527 2.527 0 0 0-4.893 0H4.973a2.527 2.527 0 1 0 0 1.264h1.422a2.527 2.527 0 0 0 4.894 0h1a1.26 1.26 0 0 1 1.247 1.055l.103.623a2.526 2.526 0 0 0 2.492 2.111h.37a2.527 2.527 0 1 0 0-1.263h-.37a1.26 1.26 0 0 1-1.246-1.056l-.103-.623A2.52 2.52 0 0 0 13.96 12a2.52 2.52 0 0 0 .82-1.48l.104-.622a1.26 1.26 0 0 1 1.246-1.056h2.896a2.527 2.527 0 1 0 2.447-3.158m0 1.263a1.263 1.263 0 0 1 1.263 1.263a1.263 1.263 0 0 1-1.263 1.264A1.263 1.263 0 0 1 20.21 8.21a1.263 1.263 0 0 1 1.264-1.263m-18.948 3.79A1.263 1.263 0 0 1 3.79 12a1.263 1.263 0 0 1-1.264 1.263A1.263 1.263 0 0 1 1.263 12a1.263 1.263 0 0 1 1.263-1.263m6.316 0A1.263 1.263 0 0 1 10.105 12a1.263 1.263 0 0 1-1.263 1.263A1.263 1.263 0 0 1 7.58 12a1.263 1.263 0 0 1 1.263-1.263m10.106 3.79a1.263 1.263 0 0 1 1.263 1.263a1.263 1.263 0 0 1-1.263 1.263a1.263 1.263 0 0 1-1.264-1.263a1.263 1.263 0 0 1 1.263-1.264" />
        </svg>
    ),
    make: () => (
        <svg viewBox="0 0 512 512" width="100%" height="100%" fill="currentColor">
            <g transform="scale(32)">
                <g>
                    <path d="M6.989 4.036L.062 17.818a.58.58 0 00.257.774l3.733 1.876a.58.58 0 00.775-.256L11.753 6.43a.58.58 0 00-.257-.775L7.763 3.78a.576.576 0 00-.774.257v-.001z" transform="scale(.66667)" />
                    <path d="M19.245 3.832h4.179c.318 0 .577.26.577.577v15.425a.58.58 0 01-.577.578h-4.179a.58.58 0 01-.577-.578V4.41c0-.318.259-.577.577-.577v-.001z" transform="scale(.66667)" />
                    <path d="M12.815 4.085L9.85 19.108a.579.579 0 00.453.677l4.095.826c.314.063.62-.14.681-.454l2.964-15.022a.58.58 0 00-.453-.677l-4.096-.827a.579.579 0 00-.68.454h.001z" transform="scale(.66667)" />
                </g>
            </g>
        </svg>
    ),
    hubspot: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.164 7.93V5.084a2.198 2.198 0 0 0 1.267-1.978v-.067A2.2 2.2 0 0 0 17.238.845h-.067a2.2 2.2 0 0 0-2.193 2.193v.067a2.196 2.196 0 0 0 1.252 1.973l.013.006v2.852a6.22 6.22 0 0 0-2.969 1.31l.012-.01l-7.828-6.095A2.497 2.497 0 1 0 4.3 4.656l-.012.006l7.697 5.991a6.176 6.176 0 0 0-1.038 3.446a6.22 6.22 0 0 0 1.147 3.607l-.013-.02l-2.342 2.343a1.968 1.968 0 0 0-.58-.095h-.002a2.033 2.033 0 1 0 2.033 2.033a1.978 1.978 0 0 0-.1-.595l.005.014l2.317-2.317a6.247 6.247 0 1 0 4.782-11.134l-.036-.005zm-.964 9.378a3.206 3.206 0 1 1 3.215-3.207v.002a3.206 3.206 0 0 1-3.207 3.207z" />
        </svg>
    ),
    gumloop: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 7H7a5 5 0 0 0-5 5a5 5 0 0 0 5 5h10a5 5 0 0 0 5-5a5 5 0 0 0-5-5m0 8H7a3 3 0 0 1-3-3a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3a3 3 0 0 1-3 3Z" />
        </svg>
    )
}
