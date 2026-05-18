"use client"

import React from "react"

const companies = [
    {
        name: "Supabase",
        logo: (
            <div className="flex items-center gap-2 text-muted-foreground/40 dark:text-muted-foreground/30 hover:text-foreground transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-auto" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.9 1.036c-.015-.986-1.26-1.41-1.874-.637L.764 12.05C-.33 13.427.65 15.455 2.409 15.455h9.579l.113 7.51c.014.985 1.259 1.408 1.873.636l9.262-11.653c1.093-1.375.113-3.403-1.645-3.403h-9.642z" />
                </svg>
                <span className="font-bold tracking-tighter text-sm">Supabase</span>
            </div>
        )
    },
    {
        name: "Vercel",
        logo: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-auto text-muted-foreground/40 dark:text-muted-foreground/30 hover:text-foreground transition-colors duration-300" viewBox="0 0 512 116" fill="currentColor">
                <path d="M255.42 28.976c-19.993 0-34.408 13.039-34.408 32.597c0 19.559 16.226 32.598 36.22 32.598c12.079 0 22.727-4.781 29.32-12.84l-13.855-8.004c-3.658 4.002-9.218 6.338-15.466 6.338c-8.674 0-16.045-4.527-18.78-11.771h50.744c.399-2.029.634-4.13.634-6.339c0-19.54-14.415-32.58-34.409-32.58Zm-17.13 26.259c2.263-7.226 8.457-11.772 17.113-11.772c8.675 0 14.869 4.546 17.114 11.772H238.29Zm212.138-26.26c-19.993 0-34.409 13.04-34.409 32.598c0 19.559 16.226 32.598 36.22 32.598c12.079 0 22.727-4.781 29.32-12.84l-13.855-8.004c-3.658 4.002-9.217 6.338-15.465 6.338c-8.675 0-16.046-4.527-18.78-11.771H484.2c.399-2.029.634-4.13.634-6.339c0-19.54-14.415-32.58-34.408-32.58Zm-17.114 26.26c2.264-7.226 8.457-11.772 17.114-11.772c8.674 0 14.868 4.546 17.113 11.772h-34.227Zm-70.683 6.338c0 10.866 7.1 18.11 18.11 18.11c7.461 0 13.057-3.386 15.937-8.91l13.908 8.023c-5.759 9.598-16.552 15.375-29.845 15.375c-20.011 0-34.408-13.04-34.408-32.598s14.415-32.597 34.408-32.597c13.293 0 24.068 5.777 29.845 15.375l-13.908 8.023c-2.88-5.524-8.476-8.91-15.937-8.91c-10.992 0-18.11 7.243-18.11 18.11ZM512 9.055V92.36h-16.299V9.055H512ZM66.916 0l66.915 115.903H0L66.916 0Zm167.298 9.055l-50.182 86.927l-50.183-86.927h18.817l31.366 54.33l31.366-54.33h18.816Zm106.685 21.732v17.548c-1.811-.525-3.73-.887-5.795-.887c-10.522 0-18.11 7.244-18.11 18.11V92.36h-16.299V30.787h16.299v16.66c0-9.2 10.703-16.66 23.905-16.66Z" />
            </svg>
        )
    },
    {
        name: "Indiviual",
        logo: (
            <div className="flex items-center gap-2 text-muted-foreground/40 dark:text-muted-foreground/30 hover:text-foreground transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-auto" viewBox="0 0 20 24" fill="currentColor">
                    <path d="M18.845 17.295a7.436 7.436 0 0 0-4.089-2.754l-.051-.011l-1.179 1.99a1.003 1.003 0 0 1-1 1c-.55 0-1-.45-1.525-1.774v-.032a1.25 1.25 0 1 0-2.5 0v.033v-.002c-.56 1.325-1.014 1.774-1.563 1.774a1.003 1.003 0 0 1-1-1l-1.142-1.994A7.47 7.47 0 0 0 .67 17.271l-.014.019a4.475 4.475 0 0 0-.655 2.197v.007c.005.15 0 .325 0 .5v2a2 2 0 0 0 2 2h15.5a2 2 0 0 0 2-2v-2c0-.174-.005-.35 0-.5a4.522 4.522 0 0 0-.666-2.221l.011.02zM4.5 5.29c0 2.92 1.82 7.21 5.25 7.21c3.37 0 5.25-4.29 5.25-7.21v-.065a5.25 5.25 0 1 0-10.5 0v.068z" />
                </svg>
                <span className="font-bold tracking-tight text-sm">Indiviuals</span>
            </div>
        )
    },
    {
        name: "Company",
        logo: (
            <div className="flex items-center gap-2 text-muted-foreground/40 dark:text-muted-foreground/30 hover:text-foreground transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-auto" viewBox="0 0 56 56" fill="currentColor">
                    <path d="M28 27.126c3.194 0 5.941-2.852 5.941-6.566c0-3.669-2.762-6.387-5.941-6.387s-5.942 2.778-5.942 6.417c0 3.684 2.748 6.536 5.942 6.536m-17.097.341c2.763 0 5.17-2.495 5.17-5.718c0-3.194-2.422-5.556-5.17-5.556c-2.763 0-5.199 2.421-5.184 5.585c0 3.194 2.406 5.69 5.184 5.69m34.194 0c2.778 0 5.184-2.495 5.184-5.689c0-3.164-2.421-5.585-5.184-5.585c-2.748 0-5.17 2.362-5.17 5.555c0 3.224 2.407 5.72 5.17 5.72M2.614 40.881h11.29c-1.545-2.243.341-6.759 3.535-9.225c-1.65-1.099-3.773-1.916-6.55-1.916C4.188 29.74 0 34.686 0 38.801c0 1.337.743 2.08 2.614 2.08m50.772 0c1.886 0 2.614-.743 2.614-2.08c0-4.115-4.189-9.061-10.888-9.061c-2.778 0-4.902.817-6.55 1.916c3.193 2.466 5.08 6.982 3.535 9.225Zm-34.73 0h18.672c2.332 0 3.164-.669 3.164-1.976c0-3.832-4.798-9.12-12.507-9.12c-7.694 0-12.492 5.288-12.492 9.12c0 1.307.832 1.976 3.164 1.976" />
                </svg>
                <span className="font-bold tracking-tight text-sm">Companies</span>
            </div>
        )
    },
    {
        name: "Enterprise",
        logo: (
            <div className="flex items-center gap-2 text-muted-foreground/40 dark:text-muted-foreground/30 hover:text-foreground transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-auto" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.502 1.5v22.005h1v-5.001h3.001v5.001h6.002V1.5zm6.002 1v2h-2v-2zm0 5.001h-2v-2h2zm0 3.001h-2v-2h2zm0 3h-2v-2h2zm0 3.001h-2v-2h2zM12.502 2.5h2v2h-2zm0 3h2v2.001h-2zm0 3.002h2v2h-2zm0 3h2v2h-2zm0 3.001h2v2h-2zm8.002 7.002h-4v-3.001h4zm0-5.002h-2v-2h2zm0-3h-2v-2h2zm0-3.001h-2v-2h2zm0-3h-2V5.5h2zm0-3.001h-2v-2h2zm-19.004 4v15.004h3v-4.001h3.001v4h3.001V8.502zm1 1h3v2.001h-3zm0 3.001h3v2h-3zm0 5.001v-2h3v2zm7.002 0h-3v-2h3zm0-3h-3v-2h3zm0-3h-3V9.501h3z" />
                </svg>
                <span className="font-bold tracking-tight text-sm">Enterprise</span>
            </div>
        )
    }
]

export default function LandingSocialProof() {
    return (
        <section className="relative w-full py-2 -mt-12 sm:-mt-20 bg-transparent overflow-hidden">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <p className="text-center text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground/40 dark:text-muted-foreground/30 mb-3 sm:mb-4">
                    Trusted by modern B2B lead generation & sales teams at
                </p>

                {/* Horizontal Marquee */}
                <div className="relative w-full overflow-hidden mask-fade-horizontal pb-2 pt-2">
                    <div className="flex w-max animate-scroll-x gap-16 md:gap-24 px-8 items-center">
                        {[...companies, ...companies].map((c, i) => (
                            <div key={i} className="flex items-center justify-center min-w-[120px]">
                                {c.logo}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .mask-fade-horizontal {
                    mask-image: linear-gradient(to right, transparent, white 20%, white 80%, transparent);
                    -webkit-mask-image: linear-gradient(to right, transparent, white 20%, white 80%, transparent);
                }
            `}} />
        </section>
    )
}
