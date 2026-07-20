"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { supabase } from "@/src/lib/supabase"
import { ThemeToggle } from "@/components/theme-toggle"
import { LogoIcon } from "@/components/logo"

const menuItems = [
    { name: "Features", href: "/#features" },
    { name: "How It Works", href: "/#how-it-works" },
    { name: "Pricing", href: "/#pricing" },
    { name: "FAQs", href: "/#faqs" },
    { name: "Blog", href: "/blog" },
]

export default function LandingNav() {
    const [menuState, setMenuState] = React.useState(false)
    const [session, setSession] = React.useState<any>(null);

    React.useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });
    }, []);

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <nav className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center space-x-2">
                            <LogoIcon className="h-8 w-8" />
                            <span className="text-xl font-bold">WarmAudience</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden items-center gap-6 md:flex">
                        {menuItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {/* Right side buttons */}
                    <div className="flex items-center gap-4">
                        <ThemeToggle />

                        {session ? (
                            <Button asChild size="sm" className="hidden md:flex">
                                <Link href="/dashboard">Dashboard</Link>
                            </Button>
                        ) : (
                            <>
                                <Button asChild variant="ghost" size="sm" className="hidden md:flex">
                                    <Link href="/login">Login</Link>
                                </Button>
                                <Button asChild size="sm" className="hidden md:flex">
                                    <Link href="/signup">Sign Up</Link>
                                </Button>
                            </>
                        )}

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setMenuState(!menuState)}
                            className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground md:hidden"
                            aria-label="Toggle menu"
                        >
                            {menuState ? <X className="size-6" /> : <Menu className="size-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {menuState && (
                    <div className="border-t py-4 md:hidden">
                        <div className="flex flex-col space-y-3">
                            {menuItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setMenuState(false)}
                                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    {item.name}
                                </Link>
                            ))}
                            <div className="flex flex-col gap-2 pt-4">
                                {session ? (
                                    <Button asChild size="sm">
                                        <Link href="/dashboard">Dashboard</Link>
                                    </Button>
                                ) : (
                                    <>
                                        <Button asChild variant="outline" size="sm">
                                            <Link href="/login">Login</Link>
                                        </Button>
                                        <Button asChild size="sm">
                                            <Link href="/signup">Sign Up</Link>
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </nav>
        </header>
    )
}
