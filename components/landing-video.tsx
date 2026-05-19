"use client"

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
        <section className="pt-0 pb-24 sm:pt-0 sm:pb-32 bg-transparent">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                {/* Section Header */}
                <div className="mx-auto max-w-2xl text-center flex flex-col items-center">
                    {/* Double Pill Badge */}
                    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 p-1 pr-3 text-xs backdrop-blur-md dark:border-zinc-800">
                        <span className="rounded-full bg-foreground px-2.5 py-0.5 font-semibold text-background">
                            Demo
                        </span>
                        <span className="text-muted-foreground font-medium">
                            See it in action
                        </span>
                    </div>

                    <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
                        Watch WarmAudience In Action
                    </h2>
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
                </div>
            </div>
        </section>
    )
}
