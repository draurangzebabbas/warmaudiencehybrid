'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import Link from 'next/link'

export default function FAQsTwo() {
    const faqItems = [
        {
            id: 'item-1',
            question: 'What is WarmAudience?',
            answer: 'WarmAudience is an advanced B2B audience intelligence and automated research workspace. It enables sales teams and founders to identify, enrich, and organize high-intent prospects based on real-time social engagement, building a proprietary database of ready-to-buy leads.',
        },
        {
            id: 'item-2',
            question: 'How does WarmAudience discover warm leads?',
            answer: 'WarmAudience monitors live interactions across major networks. When prospects engage with your competitors, post about specific industry keywords, or show active interest in your niche, our platform captures their profiles, verifies their contact info, and serves them to your dashboard instantly.',
        },
        {
            id: 'item-3',
            question: 'What platforms and networks are supported?',
            answer: 'You can discover and track warm prospects across six key networks: LinkedIn, Instagram, Twitter/X, TikTok, Facebook, and Google Maps. This omni-channel capability ensures you can find active leads no matter where they do business.',
        },
        {
            id: 'item-4',
            question: 'What contact details and intelligence are enriched?',
            answer: 'For every prospect, WarmAudience retrieves extensive metadata including professional titles, company details, verified business emails, phone numbers, website URLs, social handles, and engagement history—giving you everything needed for highly personalized outbound campaigns.',
        },
        {
            id: 'item-5',
            question: 'How does the Agents work?',
            answer: 'Simply enter any keyword, competitor profile, or target URL and set a duration. The Agents runs 24/7 in the background, automatically monitoring new activity, capturing everyone who engages with those posts, and importing them straight to your pipeline.',
        },
        {
            id: 'item-6',
            question: 'Can I export my database to my CRM or outbound tools?',
            answer: 'Yes! You can export your curated lead lists at any time via structured CSV. This allows for seamless importing into HubSpot, Salesforce, outbound email sequencing tools, or your own local spreadsheets.',
        },
        {
            id: 'item-7',
            question: 'Is my target database kept private and secure?',
            answer: 'Absolutely. We treat your research database as a private asset. Your lists, trackers, and user-managed data belong entirely to you. We do not sell, rent, or share your proprietary data with third-party brokers or competitors.',
        },
    ]

    return (
        <section className="relative overflow-hidden py-24 sm:py-32 bg-transparent">
            <div className="mx-auto max-w-5xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center flex flex-col items-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 p-1 pr-3 text-xs backdrop-blur-md dark:border-zinc-800">
                        <span className="rounded-full bg-foreground px-2.5 py-0.5 font-semibold text-background">
                            FAQ
                        </span>
                        <span className="text-muted-foreground font-medium">
                            Got questions? We have answers.
                        </span>
                    </div>
                    <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-5xl">
                        Frequently Asked Questions
                    </h2>
                    <p className="mt-6 text-lg leading-8 text-muted-foreground">
                        Everything you need to know about our research tools, automated agents, trackers, and data security.
                    </p>
                </div>

                <div className="mx-auto mt-16 max-w-3xl rounded-3xl border bg-background/50 p-8 backdrop-blur-xl sm:p-10 relative">

                    <Accordion
                        type="single"
                        collapsible
                        className="w-full">
                        {faqItems.map((item) => (
                            <AccordionItem
                                key={item.id}
                                value={item.id}
                                className="border-border">
                                <AccordionTrigger className="cursor-pointer text-base hover:no-underline font-semibold py-4 text-left">{item.question}</AccordionTrigger>
                                <AccordionContent className="pb-4">
                                    <p className="text-base text-muted-foreground leading-relaxed">{item.answer}</p>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>

                <p className="text-muted-foreground mt-8 text-center text-sm">
                    Can't find what you're looking for? Contact our{' '}
                    <Link
                        href="/contact"
                        className="text-primary font-medium hover:underline">
                        customer support team
                    </Link>
                </p>
            </div>
        </section>
    )
}
