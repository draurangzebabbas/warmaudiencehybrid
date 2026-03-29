'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function ContactClient() {
    useEffect(() => {
        (function (C, A, L) {
            let p = function (a: any, ar: any) { a.q.push(ar); };
            let d = C.document;
            C.Cal = C.Cal || function () {
                let cal = C.Cal;
                let ar = arguments;
                if (!cal.loaded) {
                    cal.ns = {};
                    cal.q = cal.q || [];
                    d.head.appendChild(d.createElement("script")).src = A;
                    cal.loaded = true;
                }
                if (ar[0] === L) {
                    const api: any = function () { p(api, arguments); };
                    const namespace = ar[1];
                    api.q = api.q || [];
                    if (typeof namespace === "string") {
                        cal.ns[namespace] = cal.ns[namespace] || api;
                        p(cal.ns[namespace], ar);
                        p(cal, ["initNamespace", namespace]);
                    } else p(cal, ar);
                    return;
                }
                p(cal, ar);
            };
        })(window as any, "https://app.cal.com/embed/embed.js", "init");

        const cal = (window as any).Cal;
        cal("init", "15min", { origin: "https://app.cal.com" });

        cal.ns["15min"]("inline", {
            elementOrSelector: "#my-cal-inline-15min",
            config: { "layout": "month_view", "useSlotsViewOnSmallScreen": "true" },
            calLink: "draurangzebabbas/15min",
        });

        cal.ns["15min"]("ui", { "hideEventTypeDetails": false, "layout": "month_view" });
    }, []);

    return (
        <div className="max-w-6xl mx-auto px-6 font-sans leading-relaxed text-foreground/90 py-12">
            <header className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight text-foreground">
                    Book a <span className="text-primary italic">Meeting</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-medium">
                    Questions? Need a demo? Schedule a 15-minute direct call with Aurangzeb to discuss your B2B research needs.
                </p>
            </header>

            <div className="grid lg:grid-cols-3 gap-12 mb-20">
                <div className="lg:col-span-1 space-y-8">
                    <section className="bg-muted/5 p-8 rounded-2xl border border-primary/5">
                        <h2 className="text-xl font-bold mb-4 text-primary">Direct Contact</h2>
                        <p className="text-sm text-muted-foreground mb-4">Feel free to reach out via email for personal inquiries or partnerships.</p>
                        <p className="font-black text-lg break-all text-primary">contact@draurangzebabbas.com</p>
                    </section>

                    <div className="p-8 bg-primary/5 rounded-2xl border border-primary/10">
                        <p className="text-xs font-black uppercase tracking-widest text-primary mb-2">Notice</p>
                        <p className="text-sm font-medium">Selecting a time on the right automatically creates a Google Meet invitation.</p>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-background border border-primary/10 rounded-[2rem] overflow-hidden shadow-2xl min-h-[600px] relative">
                        {/* Cal inline embed */}
                        <div
                            style={{ width: "100%", height: "100%", minHeight: "600px", overflow: "scroll" }}
                            id="my-cal-inline-15min"
                        ></div>
                    </div>
                </div>
            </div>

            {/* SEO & Context Section */}
            <div className="max-w-4xl mx-auto space-y-16 py-12 border-t border-primary/5">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl font-black tracking-tight">Why Schedule a <span className="text-primary">Strategy Call?</span></h2>
                    <p className="text-muted-foreground font-medium">Get direct insights on how to scale your B2B audience research and save thousands in data costs.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground text-xs font-black">01</span>
                            Audience Research Optimization
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                            Discover how to identify and monitor your target market without the high markup of data broker services. We'll show you how to leverage BYOK workflows to get enterprise-level intelligence at cost.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground text-xs font-black">02</span>
                            Lead-to-Data Intelligence
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                            Discuss how to transform raw LinkedIn profiles and scrapers into a functional Internal CRM. Learn to automate data enrichment so your sales team never has to guess who to contact next.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground text-xs font-black">03</span>
                            Competitive Monitoring
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                            Build systems that alert you when your competitors' prospects are active. Turn market changes into instant opportunities for your outreach team.
                        </p>
                    </div>

                    <div className="space-y-4 border-l-2 border-primary/10 pl-8 italic">
                        <h3 className="text-xl font-bold mb-2">Custom Integration</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            Need a custom actor or a specific research flow for your niche? Let's discuss building a bespoke solution for your agency or SaaS.
                        </p>
                    </div>
                </div>
            </div>

            <footer className="mt-16 text-center text-sm text-muted-foreground italic">
                <p>By scheduling a meeting, you agree to our <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.</p>
            </footer>
        </div>
    );
}
