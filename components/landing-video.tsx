"use client"

import { Play } from "lucide-react"

export default function LandingVideo() {
    // Get video URL from environment variable
    const videoUrl = process.env.NEXT_PUBLIC_LANDING_VIDEO_URL || ""

    // Extract YouTube video ID from URL
    const getYouTubeEmbedUrl = (url: string) => {
        if (!url) return ""

        // Handle different YouTube URL formats
        let videoId = ""

        if (url.includes("youtube.com/watch?v=")) {
            videoId = url.split("v=")[1]?.split("&")[0] || ""
        } else if (url.includes("youtu.be/")) {
            videoId = url.split("youtu.be/")[1]?.split("?")[0] || ""
        } else if (url.includes("youtube.com/embed/")) {
            videoId = url.split("embed/")[1]?.split("?")[0] || ""
        }

        return videoId ? `https://www.youtube.com/embed/${videoId}` : ""
    }

    const embedUrl = getYouTubeEmbedUrl(videoUrl)

    // Don't render if no video URL is provided
    if (!embedUrl) {
        return null
    }

    return (
        <section className="pt-0 pb-24 sm:pt-0 sm:pb-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-base font-semibold leading-7 text-primary">
                        See It In Action
                    </h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                        Watch How It Works
                    </p>
                    <p className="mt-6 text-lg leading-8 text-muted-foreground">
                        Learn how to automate your LinkedIn intelligence and research extraction workflow in just a few minutes.
                    </p>
                </div>

                <div className="mx-auto mt-16 max-w-5xl">
                    <div className="relative overflow-hidden rounded-2xl border bg-background shadow-2xl">
                        {/* Video embed */}
                        <div className="relative aspect-video">
                            <iframe
                                src={embedUrl}
                                title="WarmAudience Demo"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="absolute inset-0 size-full"
                            />
                        </div>

                        {/* Decorative elements */}
                        <div className="absolute -bottom-2 -left-2 size-24 rounded-full bg-primary/10 blur-3xl" />
                        <div className="absolute -right-2 -top-2 size-24 rounded-full bg-primary/10 blur-3xl" />
                    </div>

                    {/* Additional info */}
                    <div className="mt-8 grid gap-4 sm:grid-cols-3">
                        <div className="rounded-lg border bg-background/50 p-4 text-center backdrop-blur-sm">
                            <div className="text-2xl font-bold text-primary">2 min</div>
                            <div className="mt-1 text-sm text-muted-foreground">Setup Time</div>
                        </div>
                        <div className="rounded-lg border bg-background/50 p-4 text-center backdrop-blur-sm">
                            <div className="text-2xl font-bold text-primary">24/7</div>
                            <div className="mt-1 text-sm text-muted-foreground">Automated</div>
                        </div>
                        <div className="rounded-lg border bg-background/50 p-4 text-center backdrop-blur-sm">
                            <div className="text-2xl font-bold text-primary">∞</div>
                            <div className="mt-1 text-sm text-muted-foreground">Extractions</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
