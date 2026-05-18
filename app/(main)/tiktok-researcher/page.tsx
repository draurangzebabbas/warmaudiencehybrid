"use client";

import { ComingSoonPage } from "@/components/coming-soon-page";
import { TikTokIcon } from "@/components/icons/social-icons";

export default function TikTokResearcherPage() {
    return (
        <ComingSoonPage
            platformName="TikTok"
            description="Discover creators, monitor trends, and scrape high-intent commenters. Gather TikTok bio details, emails, and direct social contacts automatically."
            IconComponent={TikTokIcon}
            estimatedRelease="Q3 2026"
            features={[
                "Video Commenters Scrapers",
                "Hashtag & Topic Monitor",
                "Creator Contact Extractor",
                "Trending Audio Audience Search"
            ]}
        />
    );
}
