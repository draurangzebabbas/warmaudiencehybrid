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
        <section className="py-16 md:py-24">
            <div className="mx-auto max-w-5xl px-4 md:px-6">
                <div className="mx-auto max-w-xl text-center">
                    <h2 className="text-balance text-3xl font-bold md:text-4xl lg:text-5xl">Frequently Asked Questions</h2>
                    <p className="text-muted-foreground mt-4 text-balance">Discover quick and comprehensive answers to common questions about our platform, services, and features.</p>
                </div>

                <div className="mx-auto mt-12 max-w-xl">
                    <Accordion
                        type="single"
                        collapsible
                        className="bg-card ring-muted w-full rounded-2xl border px-8 py-3 shadow-sm ring-4 dark:ring-0">
                        {faqItems.map((item) => (
                            <AccordionItem
                                key={item.id}
                                value={item.id}
                                className="border-dashed">
                                <AccordionTrigger className="cursor-pointer text-base hover:no-underline">{item.question}</AccordionTrigger>
                                <AccordionContent>
                                    <p className="text-base">{item.answer}</p>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>

                    <p className="text-muted-foreground mt-6 px-8">
                        Can't find what you're looking for? Contact our{' '}
                        <Link
                            href="#"
                            className="text-primary font-medium hover:underline">
                            customer support team
                        </Link>
                    </p>
                </div>
            </div>
        </section>
    )
}
