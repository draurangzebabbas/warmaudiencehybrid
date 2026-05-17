'use client'
import { Logo } from '@/components/logo'
import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import Image from 'next/image'
import { authClient } from "@/lib/auth-client"
import { ThemeToggle } from "@/components/theme-toggle"

const menuItems = [
    { name: "Features", href: "/#features" },
    { name: "How It Works", href: "/#how-it-works" },
    { name: "Pricing", href: "/#pricing" },
    { name: "FAQs", href: "/#faqs" },
    { name: "Blog", href: "/blog" },
]

export default function HeroSection() {
    const [menuState, setMenuState] = useState(false)
    const { data: session } = authClient.useSession()

    return (
        <>
            <header>
                <nav
                    data-state={menuState && 'active'}
                    className="fixed top-0 z-50 w-full border-b border-white/5 bg-background/30 backdrop-blur-md duration-300">
                    <div className="m-auto max-w-5xl px-6">
                        <div className="flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
                            <div className="flex w-full justify-between lg:w-auto">
                                <Link
                                    href="/"
                                    aria-label="home"
                                    className="flex items-center space-x-2">
                                    <Logo />
                                </Link>

                                <button
                                    onClick={() => setMenuState(!menuState)}
                                    aria-label={menuState == true ? 'Close Menu' : 'Open Menu'}
                                    className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden">
                                    <Menu className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                                    <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
                                </button>
                            </div>

                            <div className="bg-background/90 backdrop-blur-xl in-data-[state=active]:block lg:in-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
                                <div className="lg:pr-4">
                                    <ul className="space-y-6 text-base lg:flex lg:gap-8 lg:space-y-0 lg:text-sm">
                                        {menuItems.map((item, index) => (
                                            <li key={index}>
                                                <Link
                                                    href={item.href}
                                                    className="text-muted-foreground hover:text-accent-foreground block duration-150">
                                                    <span>{item.name}</span>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="flex w-full flex-col items-center space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit lg:border-l lg:pl-6">
                                    <ThemeToggle />
                                    {session ? (
                                        <Button asChild size="sm">
                                            <Link href="/dashboard">Dashboard</Link>
                                        </Button>
                                    ) : (
                                        <>
                                            <Button
                                                asChild
                                                variant="outline"
                                                size="sm">
                                                <Link href="/login">
                                                    <span>Login</span>
                                                </Link>
                                            </Button>
                                            <Button
                                                asChild
                                                size="sm">
                                                <Link href="/signup">
                                                    <span>Sign Up</span>
                                                </Link>
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>
            </header>

            <main>
                {/* === ABOVE THE FOLD: Full-screen hero text === */}
                <section className="bg-transparent min-h-screen flex flex-col items-center justify-center relative overflow-hidden">

                    {/* Floating platform icons */}
                    <div aria-hidden className="pointer-events-none absolute inset-0">
                        {/* LinkedIn - top left */}
                        <div className="absolute top-[18%] left-[8%] animate-[float_6s_ease-in-out_infinite]">
                            <div className="rounded-2xl border border-border bg-background/80 dark:bg-background/60 backdrop-blur-sm p-3 shadow-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1025 1024" fill="currentColor" className="size-7 text-foreground" aria-hidden="true">
                                    <path d="M896.428 1024h-768q-53 0-90.5-37.5T.428 896V128q0-53 37.5-90.5t90.5-37.5h768q53 0 90.5 37.5t37.5 90.5v768q0 53-37.5 90.5t-90.5 37.5zm-640-864q0-13-9.5-22.5t-22.5-9.5h-64q-13 0-22.5 9.5t-9.5 22.5v64q0 13 9.5 22.5t22.5 9.5h64q13 0 22.5-9.5t9.5-22.5v-64zm0 192q0-13-9.5-22.5t-22.5-9.5h-64q-13 0-22.5 9.5t-9.5 22.5v512q0 13 9.5 22.5t22.5 9.5h64q13 0 22.5-9.5t9.5-22.5V352zm640 160q0-80-56-136t-136-56q-44 0-96.5 14t-95.5 39v-21q0-13-9.5-22.5t-22.5-9.5h-64q-13 0-22.5 9.5t-9.5 22.5v512q0 13 9.5 22.5t22.5 9.5h64q13 0 22.5-9.5t9.5-22.5V576q0-53 37.5-90.5t90.5-37.5t90.5 37.5t37.5 90.5v288q0 13 9.5 22.5t22.5 9.5h64q13 0 22.5-9.5t9.5-22.5V512z" />
                                </svg>
                            </div>
                        </div>

                        {/* Facebook - middle left */}
                        <div className="absolute top-[42%] left-[5%] animate-[float_8s_ease-in-out_2s_infinite]">
                            <div className="rounded-2xl border border-border bg-background/80 dark:bg-background/60 backdrop-blur-sm p-3 shadow-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-7 text-foreground" aria-hidden="true">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669c1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                            </div>
                        </div>

                        {/* TikTok - bottom left */}
                        <div className="absolute bottom-[18%] left-[10%] animate-[float_9s_ease-in-out_3s_infinite]">
                            <div className="rounded-2xl border border-border bg-background/80 dark:bg-background/60 backdrop-blur-sm p-3 shadow-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-7 text-foreground" aria-hidden="true">
                                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02c.08 1.53.63 3.09 1.75 4.17c1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97c-.57-.26-1.1-.59-1.62-.93c-.01 2.92.01 5.84-.02 8.75c-.08 1.4-.54 2.79-1.35 3.94c-1.31 1.92-3.58 3.17-5.91 3.21c-1.43.08-2.86-.31-4.08-1.03c-2.02-1.19-3.44-3.37-3.65-5.71c-.02-.5-.03-1-.01-1.49c.18-1.9 1.12-3.72 2.58-4.96c1.66-1.44 3.98-2.13 6.15-1.72c.02 1.48-.04 2.96-.04 4.44c-.99-.32-2.15-.23-3.02.37c-.63.41-1.11 1.04-1.36 1.75c-.21.51-.15 1.07-.14 1.61c.24 1.64 1.82 3.02 3.5 2.87c1.12-.01 2.19-.66 2.77-1.61c.19-.33.4-.67.41-1.06c.1-1.79.06-3.57.07-5.36c.01-4.03-.01-8.05.02-12.07z" />
                                </svg>
                            </div>
                        </div>

                        {/* Instagram - top right (mirrors LinkedIn top-left) */}
                        <div className="absolute top-[18%] right-[8%] animate-[float_7s_ease-in-out_1s_infinite]">
                            <div className="rounded-2xl border border-border bg-background/80 dark:bg-background/60 backdrop-blur-sm p-3 shadow-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-7 text-foreground" aria-hidden="true">
                                    <path d="M12 0C8.74 0 8.333.015 7.053.072C5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053C.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913a5.885 5.885 0 0 0 1.384 2.126A5.868 5.868 0 0 0 4.14 23.37c.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558a5.898 5.898 0 0 0 2.126-1.384a5.86 5.86 0 0 0 1.384-2.126c.296-.765.499-1.636.558-2.913c.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913a5.89 5.89 0 0 0-1.384-2.126A5.847 5.847 0 0 0 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071c1.17.055 1.805.249 2.227.415c.562.217.96.477 1.382.896c.419.42.679.819.896 1.381c.164.422.36 1.057.413 2.227c.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227a3.81 3.81 0 0 1-.899 1.382a3.744 3.744 0 0 1-1.38.896c-.42.164-1.065.36-2.235.413c-1.274.057-1.649.07-4.859.07c-3.211 0-3.586-.015-4.859-.074c-1.171-.061-1.816-.256-2.236-.421a3.716 3.716 0 0 1-1.379-.899a3.644 3.644 0 0 1-.9-1.38c-.165-.42-.359-1.065-.42-2.235c-.045-1.26-.061-1.649-.061-4.844c0-3.196.016-3.586.061-4.861c.061-1.17.255-1.814.42-2.234c.21-.57.479-.96.9-1.381c.419-.419.81-.689 1.379-.898c.42-.166 1.051-.361 2.221-.421c1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 1 0 0 12.324a6.162 6.162 0 1 0 0-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4s4 1.79 4 4s-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 0 1-2.88 0a1.44 1.44 0 0 1 2.88 0z" />
                                </svg>
                            </div>
                        </div>

                        {/* X (Twitter) - middle right (mirrors Facebook middle-left) */}
                        <div className="absolute top-[42%] right-[5%] animate-[float_5s_ease-in-out_0.5s_infinite]">
                            <div className="rounded-2xl border border-border bg-background/80 dark:bg-background/60 backdrop-blur-sm p-3 shadow-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-7 text-foreground" aria-hidden="true">
                                    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584l-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
                                </svg>
                            </div>
                        </div>

                        {/* Google Maps - bottom right (mirrors TikTok bottom-left) */}
                        <div className="absolute bottom-[18%] right-[10%] animate-[float_7s_ease-in-out_1.5s_infinite]">
                            <div className="rounded-2xl border border-border bg-background/80 dark:bg-background/60 backdrop-blur-sm p-3 shadow-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 480" fill="currentColor" className="size-7 text-foreground" aria-hidden="true">
                                    <path d="M341 5q44 0 75.5 31.5T448 112q0 22-26.5 67.5t-52 92.5t-22.5 75q0 5-5.5 5t-5.5-5q2-28-23-75t-51.5-92.5T235 112q0-44 31-75.5T341 5zm.5 64q-17.5 0-30 12.5T299 112t12.5 30.5t30 12.5t30-12.5T384 112t-12.5-30.5t-30-12.5zM43 48h185q-20 32-20 69q0 26 32 83L1 439l-1-7V91q0-18 12.5-30.5T43 48zm267 275l-51-51l14-15q24 39 37 66zm61 152H56l157-158zm56-248v205l-1 7l-72-72q3-9 7-18.5t9-20t9.5-19t12-21.5t11-19.5T415 247zm-327 24q-17 0-27-7t-10-19q0-14 18-21q10-3 22-3h5q13 10 18 15t5 12q0 9-9 16t-22 7zM75 129q0-10 5.5-15.5T93 108q13 0 20.5 12t7.5 25q0 11-6.5 15.5T101 165q-11 0-18.5-11.5T75 129zm52 62l-7-6q-6-5-6-9q0-7 7-12q17-13 17-29q0-14-14-26h12l9-9h-43q-21 0-32.5 11.5T58 139q0 13 9 23t25 10h5l-2 8q0 7 6 14q-24 1-40 11q-16 9-16 25q0 13 11.5 21.5T90 260q25 0 39.5-12t14.5-27q0-16-17-30z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Hero text - centered */}
                    <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
                        <h1 className="text-balance text-4xl font-semibold md:text-5xl lg:text-6xl tracking-tight">Find Warm Leads In Seconds</h1>
                        <p className="text-muted-foreground mx-auto my-8 max-w-2xl text-xl">Stop cold calling. Build a high-intent B2B audience with automated scraping, intent tracking, and engagement-based prospecting.</p>

                        <Button
                            asChild
                            size="lg">
                            <Link href={session ? "/dashboard" : "/signup"}>
                                <span className="btn-label">{session ? "Go to Dashboard" : "Start Building for Free"}</span>
                            </Link>
                        </Button>
                    </div>
                </section>

                {/* === BELOW THE FOLD: Product image preview === */}
                <section className="bg-transparent overflow-hidden pb-16">
                    <div className="mx-auto 2xl:max-w-7xl">
                        <div className="perspective-distant pl-8 lg:pl-44">
                            <div className="lg:h-176 rotate-x-20 mask-b-from-55% mask-b-to-100% mask-r-from-75% skew-x-12 pl-6 pt-6">
                                <Image
                                    className="rounded-(--radius) border shadow-xl dark:hidden"
                                    src="/Warmaudience-Profiles-Screenshot-Light-Version.png"
                                    alt="WarmAudience dashboard preview"
                                    width={2880}
                                    height={2074}
                                />
                                <Image
                                    className="rounded-(--radius) hidden border shadow-xl dark:block"
                                    src="/Warmaudience-Profiles-Screenshot-Dark-Version.png"
                                    alt="WarmAudience dashboard preview"
                                    width={2880}
                                    height={2074}
                                />
                            </div>
                        </div>
                    </div>
                </section>

            </main>
        </>
    )
}
