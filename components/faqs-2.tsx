'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import Link from 'next/link'

export default function FAQsTwo() {
    const faqItems = [
        {
            id: 'item-1',
            question: 'What is WarmAudience?',
            answer: 'WarmAudience is a professional research platform and audience intelligence workspace. It helps you collect, enrich, and organize professional profile data and engagement trends to build your own proprietary dataset.',
        },
        {
            id: 'item-2',
            question: 'How does the "Bring Your Own Key" (BYOK) model work?',
            answer: 'Instead of charging you a massive markup for data, we provide the automation software. You simply add your own third-party API keys (like Apify). This model allows you to use free quotas or pay at-cost, saving you thousands of dollars compared to traditional agencies.',
        },
        {
            id: 'item-3',
            question: 'What can I track with the Tracker system?',
            answer: 'This tracking system if for when you add any keyword or profile to tracke and select duration it would automaticaly fetch new posts from these and add the engagers of these posts in your profiles table.',
        },
        {
            id: 'item-4',
            question: 'Can I export my research to other tools?',
            answer: 'Yes! Every profile you research can be exported to CSV. This makes it easy to move your enriched list into your CRM, email outreach tool, or even a local spreadsheet for further analysis.',
        },
        {
            id: 'item-5',
            question: 'How do I maximize my free plan?',
            answer: 'Our free plan is designed to be highly useful. You can research and save profiles up to your limit, export them to your own machine, and then clear your workspace to start a new batch. We are here to help you grow, not gate your success.',
        },
        {
            id: 'item-6',
            question: 'Is my data secure?',
            answer: 'Absolutely. We treat your research database as a private asset. We do not sell, rent, or trade your user-managed data to third-party brokers. Your workspace is yours alone.',
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
                        Everything you need to know about our research tools, BYOK model, trackers, and data security.
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
                        href="#"
                        className="text-primary font-medium hover:underline">
                        customer support team
                    </Link>
                </p>
            </div>
        </section>
    )
}
