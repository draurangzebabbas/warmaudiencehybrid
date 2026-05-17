import type { Metadata } from "next";
import React from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { ReferralTracker } from "@/components/referral-tracker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://warmaudience.draurangzebabbas.com'),
  title: {
    default: "WarmAudience | B2B Audience Research & Engagement Intelligence",
    template: "%s"
  },
  description: "Advanced B2B Audience Research & Engagement Intelligence Workspace. Automate your manual research and scale your prospecting.",
  keywords: ["B2B Research", "Audience Intelligence", "Sales Automation", "Prospecting", "Lead Generation"],
  authors: [{ name: "WarmAudience Team" }],
  creator: "WarmAudience",
  publisher: "WarmAudience",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://warmaudience.draurangzebabbas.com',
    siteName: 'WarmAudience',
    title: 'WarmAudience | B2B Audience Research & Engagement Intelligence',
    description: 'Advanced B2B Audience Research & Engagement Intelligence Workspace.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'WarmAudience',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WarmAudience | B2B Audience Research & Engagement Intelligence',
    description: 'Advanced B2B Audience Research & Engagement Intelligence Workspace.',
    images: ['/og-image.png'],
    creator: '@warmaudience',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'googleb1ad6575ef452a3a', // Corrected format for meta tag verification
    yandex: 'yandex',
    yahoo: 'yahoo',
    other: {
      me: ['my-contact', 'my-twitter'],
    },
  },
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

import Script from "next/script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ConvexClientProvider>
            <React.Suspense fallback={null}>
              <ReferralTracker />
            </React.Suspense>
            {children}
            <Toaster />
          </ConvexClientProvider>
        </ThemeProvider>

        {/* Beehiiv Newsletter Attribution */}
        {process.env.NEXT_PUBLIC_BEEHIIV_ATTRIBUTION === 'true' && (
          <Script
            async
            src="https://subscribe-forms.beehiiv.com/attribution.js"
            strategy="lazyOnload"
          />
        )}
      </body>
    </html>
  );
}
