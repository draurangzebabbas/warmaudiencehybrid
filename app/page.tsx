import HeroSection from "@/src/components/hero-section"
import LandingFeatures from "@/components/landing-features"
import LandingVideo from "@/components/landing-video"
import LandingIntegrations from "@/components/landing-integrations"
import LandingAutonomous from "@/components/landing-autonomous"
import LandingHowToStart from "@/components/landing-how-to-start"
import Pricing from "@/components/pricing"
import FAQs from "@/components/faqs-2"
import Footer from "@/components/footer"
import LandingTestimonials from "@/components/landing-testimonials"
import LandingOutboundIntegrations from "@/components/landing-outbound-integrations"
import LandingSocialProof from "@/components/landing-social-proof"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "WarmAudience | Advanced B2B Lead Generation & Audience Research",
  description: "Stop cold calling. Build a high-intent B2B audience with automated scraping, intent tracking, and engagement-based prospecting.",
}

export default function Home() {
  return (
    <div className="relative min-h-screen bg-muted/50 dark:bg-background text-foreground selection:bg-primary/10 selection:text-primary">
      {/* Global Landing Page Background */}
      <div
          aria-hidden
          className="pointer-events-none fixed inset-0 isolate hidden opacity-50 contain-strict lg:block z-0">
          <div className="w-140 h-320 -translate-y-87.5 absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
          <div className="h-320 absolute left-0 top-0 w-60 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
          <div className="h-320 -translate-y-87.5 absolute left-0 top-0 w-60 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
      </div>

      <div className="relative z-10">
        <HeroSection />

        <LandingSocialProof />

        <div id="integrations">
          <LandingIntegrations />
        </div>

        <div id="autonomous">
          <LandingAutonomous />
        </div>

        <div id="how-to-start">
          <LandingHowToStart />
        </div>



        <div id="video-section">
          <LandingVideo />
        </div>

        <div id="testimonials">
          <LandingTestimonials />
        </div>

        <div id="outbound-integrations">
          <LandingOutboundIntegrations />
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
    </div>
  )
}
