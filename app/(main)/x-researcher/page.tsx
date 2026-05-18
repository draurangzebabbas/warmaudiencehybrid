"use client";

import { ComingSoonPage } from "@/components/coming-soon-page";
import { XIcon } from "@/components/icons/social-icons";

export default function XResearcherPage() {
    return (
        <ComingSoonPage
            platformName="X (Twitter)"
            description="Mine potential leads directly from X. Extract key influencers, high-intent tweet engagers, and filter by keywords to build an active marketing database."
            IconComponent={XIcon}
            estimatedRelease="Q3 2026"
            features={[
                "Keyword & Tweet Monitor",
                "Direct Bio-Data Scrapers",
                "Engagers Extractor (Likers & Reposters)",
                "Full Profile Auto-Enrichment"
            ]}
        />
    );
}
