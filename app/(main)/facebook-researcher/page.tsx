"use client";

import { ComingSoonPage } from "@/components/coming-soon-page";
import { FacebookIcon } from "@/components/icons/social-icons";

export default function FacebookResearcherPage() {
    return (
        <ComingSoonPage
            platformName="Facebook"
            description="Access highly targeted leads from Facebook groups, pages, and community discussions. Identify group members, post engagers, and gather valuable business coordinates."
            IconComponent={FacebookIcon}
            estimatedRelease="Q4 2026"
            features={[
                "Group Members Extractor",
                "Business Page Lead Scanner",
                "Community Post Engagers",
                "Automated Ad Library Monitor"
            ]}
        />
    );
}
