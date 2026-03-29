import LandingNav from "@/components/landing-nav"
import LandingHero from "@/components/landing-hero"
import LandingFeatures from "@/components/landing-features"
import LandingVideo from "@/components/landing-video"
import LandingHowItWorks from "@/components/landing-how-it-works"
import Pricing from "@/components/pricing"
import FAQs from "@/components/faqs-2"
import Footer from "@/components/footer"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "WarmAudience | Advanced B2B Lead Generation & Audience Research",
  description: "Stop cold calling. Build a high-intent B2B audience with automated scraping, intent tracking, and engagement-based prospecting.",
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/10 selection:text-primary">
      <LandingNav />
      <LandingHero />


      {/* Moved How It Works above Video as requested */}
      <div id="how-it-works">
        <LandingHowItWorks />
      </div>

      <div id="video-section">
        <LandingVideo />
      </div>

      <div id="pricing">
        <Pricing />
      </div>

      <div id="faqs">
        <FAQs />
      </div>

      <div id="contact">
        <Footer />
      </div>
    </div>
  )
}
