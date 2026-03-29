import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms of Service',
    description: 'Terms and conditions for using the WarmAudience platform.',
};

export default function TermsPage() {
    return (
        <div className="max-w-4xl mx-auto px-6 font-sans leading-relaxed text-foreground/90 py-12">
            <h1 className="text-4xl font-extrabold mb-8 tracking-tight text-foreground">Terms of Service</h1>
            <p className="text-sm text-muted-foreground mb-12">Last Updated: March 2, 2026</p>

            <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4 text-primary">1. Overview and Acceptance</h2>
                <p className="mb-4">
                    WarmAudience ("the Service") is a software-as-a-service (SaaS) platform that provides audience management, analytics, and organization tools for professional research. By using our Service, you agree to these Terms of Service.
                </p>
            </section>

            <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4 text-primary">2. SaaS Software Model (NOT a Data Broker)</h2>
                <p className="mb-4 font-semibold text-foreground italic">
                    CRITICAL: WarmAudience is a software PROVIDER, not a data SELLER.
                </p>
                <p className="mb-4">
                    WarmAudience does not provide, sell, or license any LinkedIn data. We provide a workspace that allows users to organize and analyze data they have already lawfully accessed through professional third-party integration services (such as Apify) using their own API credentials.
                </p>
            </section>

            <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4 text-primary">3. Acceptable Use Policy</h2>
                <p className="mb-4">You agree NOT to use WarmAudience for:</p>
                <ul className="list-disc pl-6 space-y-2 mb-6 text-foreground/80">
                    <li>Unsolicited commercial email (SPAM) or unsolicited marketing outreach.</li>
                    <li>Mass-messaging or automated outreach campaigns that violate third-party terms of service.</li>
                    <li>Reselling or publicly distributing data analyzed within the platform.</li>
                    <li>Harassment, stalking, or any illegal profiling activities.</li>
                </ul>
                <p className="mb-4">
                    The Service is intended for internal market research, talent acquisition analysis, and competitive intelligence within your own organization.
                </p>
            </section>

            <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4 text-primary">4. Bring Your Own Key (BYOK)</h2>
                <p className="mb-4">
                    Users are responsible for maintaining and paying for their own third-party research credits (e.g., Apify API keys). WarmAudience is not responsible for any costs, rate-limits, or account restrictions incurred on third-party platforms.
                </p>
            </section>

            <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4 text-primary">5. Termination</h2>
                <p className="mb-4">
                    We reserve the right to suspend or terminate accounts that violate our anti-spam or data-misuse policies without notice.
                </p>
            </section>

            <section className="mb-10 border-t pt-8">
                <h2 className="text-xl font-bold mb-4">Contact Information</h2>
                <p className="text-muted-foreground">
                    For legal inquiries or report of abuse (spam), please <Link href="/contact" className="text-primary hover:underline font-bold">contact our support team</Link>.
                </p>
            </section>
        </div>
    );
}
