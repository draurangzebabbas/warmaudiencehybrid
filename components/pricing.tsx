"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, CheckCircle2 } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { motion } from "motion/react"

export default function Pricing() {
    const router = useRouter();
    const { data: session } = authClient.useSession();
    const [loading, setLoading] = useState<string | null>(null);
    const [activeSubscription, setActiveSubscription] = useState<string | null>(null);

    const [hasFetched, setHasFetched] = useState(false);

    // Check for active subscriptions on load
    useEffect(() => {
        if (!session) {
            setActiveSubscription(null);
            setHasFetched(false);
            return;
        }

        if (!hasFetched) {
            authClient.customer.state().then(({ data, error }) => {
                if (error) {
                    // Suppress empty error logs or 404s for users without customers yet
                    if (Object.keys(error).length > 0) {
                        console.error("❌ Polar Error Details:", error);
                    } else {
                        console.log("ℹ️ Polar: No active customer record found for this session (standard for non-paying users).");
                    }
                    setHasFetched(true);
                    return;
                }

                const customerState = data as any;
                setHasFetched(true);

                const subs = customerState?.activeSubscriptions || customerState?.subscriptions;

                if (subs && Array.isArray(subs)) {
                    const activeSub = subs.find((s: any) =>
                        s.status === 'active' || s.status === 'trialing'
                    );

                    if (activeSub) {
                        const pId = activeSub.productId || activeSub.product?.id || activeSub.product_id;

                        if (pId === process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_GROWTH) {
                            setActiveSubscription("pro");
                        }
                        if (pId === process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_SCALE) {
                            setActiveSubscription("elite");
                        }
                    }
                }
            }).catch(err => {
                console.error("Failed to fetch customer state", err);
                setHasFetched(true);
            });
        }
    }, [session, hasFetched]);

    const handleCheckout = async (slug: string) => {
        if (!session) {
            toast.error("Please login to continue");
            router.push("/login");
            return;
        }

        if (activeSubscription) {
            setLoading("portal");
            toast.info("Redirecting to billing portal...");
            await authClient.customer.portal();
            setLoading(null);
            return;
        }

        setLoading(slug);
        try {
            const result = await authClient.checkout({
                slug: slug,
            });

            if (result?.error) {
                toast.error(result.error.message || "Checkout failed");
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setLoading(null);
        }
    }

    return (
        <section className="relative overflow-hidden py-24 md:py-32">

            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center flex flex-col items-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 p-1 pr-3 text-xs backdrop-blur-md dark:border-zinc-800">
                        <span className="rounded-full bg-foreground px-2.5 py-0.5 font-semibold text-background">
                            Simple Pricing
                        </span>
                        <span className="text-muted-foreground font-medium">
                            No hidden limits
                        </span>
                    </div>
                    <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
                        Audience Intelligence At Scale
                    </h2>
                    <p className="mt-6 text-lg leading-8 text-muted-foreground">
                        Stop paying high markups per lead record. Pay only for your research environment and build your own proprietary database.
                    </p>
                </div>

                <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">

                    {/* Free Plan */}
                    <Card className="flex flex-col justify-between border-border bg-card/50 backdrop-blur-sm transition-all hover:border-primary/20">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold">Free</CardTitle>
                            <CardDescription>Perfect for testing scrapers and setting up your initial research environment.</CardDescription>
                            <div className="mt-4 flex items-baseline gap-x-2">
                                <span className="text-4xl font-bold tracking-tight">$0</span>
                                <span className="text-muted-foreground">/month</span>
                            </div>
                            <Button
                                asChild
                                variant="outline"
                                className="mt-6 w-full rounded-full py-5 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                            >
                                <Link href={session ? "/dashboard" : "/signup"}>
                                    {session ? (!activeSubscription ? "Current Plan" : "Downgrade") : "Start for Free"}
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <ul role="list" className="space-y-3 text-sm leading-6 text-muted-foreground">
                                {[
                                    '1,000 Total Saved Leads',
                                    '1 Active Agent Monitor',
                                    'Full Access to All Platforms',
                                    'Smart Deduplication & Cache',
                                    'Standard CSV Lead Exports'
                                ].map((feature) => (
                                    <li key={feature} className="flex gap-x-3">
                                        <Check className="h-6 w-5 flex-none text-primary" aria-hidden="true" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Pro Plan */}
                    <Card className="flex flex-col justify-between border-primary bg-card shadow-lg ring-1 ring-primary/20 dark:shadow-none relative">
                        <div className="absolute -top-4 left-0 right-0 mx-auto w-fit rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                            Most Popular
                        </div>
                        <CardHeader>
                            <CardTitle className="text-xl font-bold">Growth</CardTitle>
                            <CardDescription>Ideal for founders and sales teams who need a constant stream of high-intent leads.</CardDescription>
                            <div className="mt-4 flex items-baseline gap-x-2">
                                <span className="text-4xl font-bold tracking-tight">$29</span>
                                <span className="text-muted-foreground">/month</span>
                            </div>
                            <Button
                                onClick={() => handleCheckout("pro")}
                                disabled={loading === "pro" || activeSubscription === "pro"}
                                className="mt-6 w-full rounded-full py-5 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                            >
                                {loading === "pro" ? "Processing..." : activeSubscription === "pro" ? "Current Plan" : activeSubscription ? "Switch to Growth" : "Get Growth Access"}
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <ul role="list" className="space-y-3 text-sm leading-6 text-muted-foreground">
                                {[
                                    '10,000 Total Saved Leads',
                                    '50 Active Agent Monitors',
                                    'Extract Emails, Phones & Socials',
                                    'Advanced Intelligence Lead Filters',
                                    'Multi-Keyword & Bulk Scraping',
                                    'Save 80%+ on Apify Compute Caching'
                                ].map((feature) => (
                                    <li key={feature} className="flex gap-x-3 text-foreground">
                                        <CheckCircle2 className="h-6 w-5 flex-none text-primary" aria-hidden="true" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Elite Plan */}
                    <Card className="flex flex-col justify-between border-border bg-card/50 backdrop-blur-sm transition-all hover:border-primary/20">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold">Scale</CardTitle>
                            <CardDescription>Designed for agencies, outbound campaigns, and maximum database velocity.</CardDescription>
                            <div className="mt-4 flex items-baseline gap-x-2">
                                <span className="text-4xl font-bold tracking-tight">$59</span>
                                <span className="text-muted-foreground">/month</span>
                            </div>
                            <Button
                                onClick={() => handleCheckout("elite")}
                                disabled={loading === "elite" || activeSubscription === "elite"}
                                variant="outline"
                                className="mt-6 w-full rounded-full py-5 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                            >
                                {loading === "elite" ? "Processing..." : activeSubscription === "elite" ? "Current Plan" : activeSubscription ? "Switch to Scale" : "Get Scale Access"}
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <ul role="list" className="space-y-3 text-sm leading-6 text-muted-foreground">
                                {[
                                    'Unlimited Saved Leads Database',
                                    '500 Active Agent Monitors',
                                    'Priority Scrape Queue Execution',
                                    'Unlimited Webhook Integrations',
                                    'Early Access to Social Extractors',
                                    'Priority Setup & Computes Support'
                                ].map((feature) => (
                                    <li key={feature} className="flex gap-x-3">
                                        <Check className="h-6 w-5 flex-none text-primary" aria-hidden="true" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                {/* Friendly BYOK Explanation
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-16 rounded-3xl border bg-muted/30 p-8 text-center"
                >
                    <div className="mx-auto max-w-3xl space-y-4">
                        <h3 className="text-xl font-semibold">"Why do I need Apify API keys?"</h3>
                        <p className="text-muted-foreground">
                            WarmAudience is a <strong>Research OS</strong>. We provide the logic, the database, and the automation. You provide the raw compute via Apify.
                        </p>
                        <p className="text-muted-foreground">
                            This architecture gives you <strong>100% control</strong>. You pay for scraping at cost, meaning you can build a massive database for a fraction of what traditional lead tools charge. Our smart caching ensures you never pay for the same profile twice.
                        </p>
                    </div>
                </motion.div>
                */}
            </div>
        </section>
    )
}
