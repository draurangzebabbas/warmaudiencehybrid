import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy',
    description: 'Our commitment to data privacy and security at WarmAudience.',
};

export default function PrivacyPage() {
    return (
        <div className="max-w-4xl mx-auto px-6 font-sans leading-relaxed text-foreground/90 py-12">
            <h1 className="text-4xl font-extrabold mb-8 tracking-tight text-foreground text-center">Privacy Policy</h1>
            <p className="text-sm text-muted-foreground mb-12 text-center">Last Updated: March 2, 2026</p>

            <section className="mb-10 bg-muted/20 p-8 rounded-2xl border">
                <h2 className="text-2xl font-bold mb-4 text-primary">1. Our Commitment to Data Privacy</h2>
                <p className="mb-4">
                    WarmAudience ("we," "us," or "our") is a SaaS-based research tool. This policy explains how we treat personal information collected from you and how we respect the privacy of the data you manage within our platform.
                </p>
            </section>

            <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4 text-primary">2. Data Storage vs. Data Sale</h2>
                <p className="mb-4 font-semibold text-foreground italic border-l-4 border-primary pl-4">
                    WarmAudience DOES NOT trade, sell, or rent user-managed data to third-party data brokers or marketing services.
                </p>
                <p className="mb-4">
                    We act as a **Data Processor** for our users (the Data Controllers). The audience profile data you organize and analyze within the Service is stored securely on your behalf. We do not aggregate or resell this data for commercial enrichment services.
                </p>
            </section>

            <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4 text-primary">3. Information We Collect</h2>
                <p className="mb-4">We collect account information directly from you:</p>
                <ul className="list-disc pl-6 space-y-2 mb-6 text-foreground/80">
                    <li>Account credentials (Email, Password, Name).</li>
                    <li>Billing information via our third-party payment partner (Polar.sh).</li>
                    <li>Technical information (IP addresses, Browser logs) required for service security and bug tracking.</li>
                    <li>API Keys provided by you to manage your own automation services.</li>
                </ul>
            </section>

            <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4 text-primary">4. Cookies and Tracking</h2>
                <p className="mb-4">
                    We use strictly necessary cookies to keep you logged in and functional. We do not use persistent tracking pixel or ad-targeting cookies on the main service dashboard.
                </p>
            </section>

            <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4 text-primary">5. User Rights and Compliance (GDPR/CCPA)</h2>
                <p className="mb-4">
                    If you are located in established data protection zones (EU/California), you have the right to request access to, correction of, or deletion of your own account data. You may also purge any data you have scraped and stored in your account at any time.
                </p>
            </section>

            <section className="mb-10 border-t pt-8">
                <h2 className="text-xl font-bold mb-4 text-foreground/80">Questions?</h2>
                <p className="text-muted-foreground italic">
                    For any data protection inquiries, please <Link href="/contact" className="text-primary hover:underline font-bold">contact our support team</Link>.
                </p>
            </section>
        </div>
    );
}
