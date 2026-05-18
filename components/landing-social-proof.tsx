"use client"

import React from "react"

const companies = [
    {
        name: "Stripe",
        logo: (
            <svg className="h-5 w-auto text-muted-foreground/40 dark:text-muted-foreground/30 hover:text-foreground transition-colors duration-300" viewBox="0 0 80 34" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M41.4 12.3c0-2.3 1.8-3.3 4.8-3.3 3 0 6 .9 8.2 2.2V1.9C52.1.8 49 .3 45.8.3c-10 0-16.1 5.3-16.1 14.1 0 13.9 19.1 11.6 19.1 17.6 0 2.7-2.3 3.6-5.7 3.6-3.7 0-7.3-1.2-10-2.8v9.4c3.1 1.4 6.9 2 10.3 2 10.5 0 16.9-5.1 16.9-14.3 0-14.3-18.9-11.9-18.9-17.6zm-17.2 4.1h10.3v-8.1H24.2V2.6L13.9 4.8v3.5H7.7v8.1h6.2v12.2c0 6.6 4.7 10.9 11.4 10.9 2.5 0 4.6-.4 6-1.1V20.2c-.8.4-1.9.6-3.1.6-3.4 0-4.9-1.6-4.9-5.1V16.4zm54.3-8.1h-10v8.1h.1c1.4-2.2 4.1-3.6 7.9-3.6 7.9 0 12.4 5.3 12.4 13.1v13.6H81.4v-12c0-4.6-2.1-7.1-6.1-7.1-3.2 0-5.8 2-6.7 5.1v14H58.3v-29h10.3v3.9c1.6-2.5 4.3-4.2 8.7-4.2 7.7.1 11.2 5.1 11.2 12.9v16.4h-10.2v-16.4zm-64.8-5.3a6.1 6.1 0 1 0 0-12.2 6.1 6.1 0 0 0 0 12.2zm-5.1 34.4h10.3V8.3H6.5v29.1z" />
            </svg>
        )
    },
    {
        name: "Vercel",
        logo: (
            <div className="flex items-center gap-2 text-muted-foreground/40 dark:text-muted-foreground/30 hover:text-foreground transition-colors duration-300">
                <svg className="h-4 w-auto fill-current" viewBox="0 0 116 100" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M57.5 0L115 100H0L57.5 0Z" />
                </svg>
                <span className="font-bold tracking-tighter text-sm uppercase">Vercel</span>
            </div>
        )
    },
    {
        name: "OpenAI",
        logo: (
            <div className="flex items-center gap-2 text-muted-foreground/40 dark:text-muted-foreground/30 hover:text-foreground transition-colors duration-300">
                <svg className="h-4 w-auto fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21.74 11.45a3.86 3.86 0 0 0-1.89-3.28 4 4 0 0 0-.58-3.79 3.86 3.86 0 0 0-3.27-1.9 4 4 0 0 0-3.79-.58 3.86 3.86 0 0 0-5.18 5.18 4 4 0 0 0-.58 3.79 3.86 3.86 0 0 0 1.9 3.27 4 4 0 0 0 .58 3.79 3.86 3.86 0 0 0 3.27 1.9 4 4 0 0 0 3.79.58 3.86 3.86 0 0 0 5.18-5.18 4 4 0 0 0 .58-3.79zm-7.6-7.85a2.23 2.23 0 0 1 1.48 1.15c.1.2.14.41.13.62V9.3L12 11.5 8.25 9.3V5.37a2.22 2.22 0 0 1 1.6-2.14 2.29 2.29 0 0 1 1.25-.13 2.23 2.23 0 0 1 1.04 1.24zm-6.14.86a2.23 2.23 0 0 1 .44 1.83 2.3 2.3 0 0 1-.77 1.49L4.43 10l-1.8-3.13a2.22 2.22 0 0 1 .86-2.58 2.29 2.29 0 0 1 2.58.17zm-4.32 8.35a2.23 2.23 0 0 1-.95-1.62c-.02-.22.02-.44.11-.64l3.93-2.27 3.75 2.17v7.87a2.22 2.22 0 0 1-2.46.77 2.29 2.29 0 0 1-1.46-1.57l-.3-4.71zm5.12 6.77a2.23 2.23 0 0 1-1.48-1.15c-.1-.2-.14-.41-.13-.62v-3.92l3.75-2.16 3.75 2.16v3.92a2.22 2.22 0 0 1-1.6 2.14 2.29 2.29 0 0 1-1.25-.13 2.23 2.23 0 0 1-1.04-1.24zm6.14-.86a2.23 2.23 0 0 1-.44-1.83 2.3 2.3 0 0 1 .77-1.49l3.24-1.87 1.8 3.13a2.22 2.22 0 0 1-.86 2.58 2.29 2.29 0 0 1-2.58-.17zm4.32-8.35a2.23 2.23 0 0 1 .95 1.62c.02.22-.02.44-.11.64l-3.93 2.27-3.75-2.17V5.34a2.22 2.22 0 0 1 2.46-.77 2.29 2.29 0 0 1 1.46 1.57l.3 4.71z" />
                </svg>
                <span className="font-bold tracking-tighter text-sm">OpenAI</span>
            </div>
        )
    },
    {
        name: "Linear",
        logo: (
            <div className="flex items-center gap-2 text-muted-foreground/40 dark:text-muted-foreground/30 hover:text-foreground transition-colors duration-300">
                <svg className="h-4 w-auto fill-current" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zm0 18c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8zm-4-8c0-2.209 1.791-4 4-4s4 1.791 4 4-1.791 4-4 4-4-1.791-4-4z" />
                </svg>
                <span className="font-bold tracking-tight text-sm">Linear</span>
            </div>
        )
    },
    {
        name: "Supabase",
        logo: (
            <div className="flex items-center gap-2 text-muted-foreground/40 dark:text-muted-foreground/30 hover:text-foreground transition-colors duration-300">
                <svg className="h-4 w-auto fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.6 0L2.1 9.6c-.6.5-.3 1.5.5 1.5h9.4L9.4 24l11.5-9.6c.6-.5.3-1.5-.5-1.5h-9.4l2.6-12.9z" />
                </svg>
                <span className="font-bold tracking-tighter text-sm">Supabase</span>
            </div>
        )
    },
    {
        name: "HubSpot",
        logo: (
            <div className="flex items-center gap-1 text-muted-foreground/40 dark:text-muted-foreground/30 hover:text-foreground transition-colors duration-300">
                <svg className="h-4 w-auto fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21.5 10.9h-4.3c-.4-1.3-1.4-2.3-2.7-2.7V6.5c2-.4 3.5-2.2 3.5-4.3C18 1 16.9 0 15.6 0S13.2 1 13.2 2.2c0 2.1 1.5 3.9 3.5 4.3v1.7c-1.3.4-2.3 1.4-2.7 2.7H9.7c-.4-1.3-1.4-2.3-2.7-2.7V2.5c1-.4 1.7-1.4 1.7-2.5C8.7 1.1 7.6 0 6.2 0S3.8 1.1 3.8 2.5c0 1.1.7 2.1 1.7 2.5v5.7c-1 .4-1.7 1.4-1.7 2.5v1.2c0 1.1.7 2.1 1.7 2.5v4.5c0 1.4 1.1 2.5 2.5 2.5s2.5-1.1 2.5-2.5v-4.5c1-.4 1.7-1.4 1.7-2.5v-1.2H14c.4 1.3 1.4 2.3 2.7 2.7v1.7c-2 .4-3.5 2.2-3.5 4.3 0 1.2 1.1 2.2 2.4 2.2s2.4-1 2.4-2.2c0-2.1-1.5-3.9-3.5-4.3v-1.7c1.3-.4 2.3-1.4 2.7-2.7h4.3c1.4 0 2.5-1.1 2.5-2.5s-1.1-2.5-2.5-2.5z" />
                </svg>
                <span className="font-bold tracking-tight text-sm">HubSpot</span>
            </div>
        )
    }
]

export default function LandingSocialProof() {
    return (
        <section className="relative w-full py-2 -mt-12 sm:-mt-20 bg-transparent overflow-hidden">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <p className="text-center text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground/40 dark:text-muted-foreground/30 mb-3 sm:mb-4">
                    Trusted by modern B2B lead generation & sales teams at
                </p>
                
                {/* Horizontal Marquee */}
                <div className="relative w-full overflow-hidden mask-fade-horizontal pb-2 pt-2">
                    <div className="flex w-max animate-scroll-x gap-16 md:gap-24 px-8 items-center">
                        {[...companies, ...companies].map((c, i) => (
                            <div key={i} className="flex items-center justify-center min-w-[120px]">
                                {c.logo}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{__html: `
                .mask-fade-horizontal {
                    mask-image: linear-gradient(to right, transparent, white 20%, white 80%, transparent);
                    -webkit-mask-image: linear-gradient(to right, transparent, white 20%, white 80%, transparent);
                }
            `}} />
        </section>
    )
}
