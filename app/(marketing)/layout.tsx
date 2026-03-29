import LandingNav from "@/components/landing-nav"
import Footer from "@/components/footer"

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/10 selection:text-primary flex flex-col">
            <LandingNav />
            <main className="flex-1 pt-24 pb-20">{children}</main>
            <Footer />
        </div>
    )
}
