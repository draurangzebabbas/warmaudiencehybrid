import React from 'react';
import { Metadata } from 'next';
import ContactClient from '@/components/contact-client';

export const metadata: Metadata = {
    title: 'Contact Us | Book a Demo',
    description: 'Schedule a discovery call to see how WarmAudience can transform your B2B research.',
};

export default function ContactPage() {
    return <ContactClient />;
}
