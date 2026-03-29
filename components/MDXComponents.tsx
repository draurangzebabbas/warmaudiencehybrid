import React from 'react';
import Link from 'next/link';
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { Button } from "@/components/ui/button";
import { Badge } from '@/components/ui/badge';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { List, Info, Zap, ShieldCheck, Database, Search, ChevronDown } from 'lucide-react';

export const MDXComponents = {
    // Standard Markdown Tags mapped to styled versions
    h1: (props: any) => <h1 className="text-4xl md:text-5xl font-black mb-8 tracking-tight leading-tight text-foreground" {...props} />,
    p: (props: any) => <p className="mb-6 leading-relaxed text-lg text-foreground/80" {...props} />,
    ul: (props: any) => <ul className="list-disc pl-6 space-y-3 mb-6 text-lg text-foreground/80" {...props} />,
    ol: (props: any) => <ol className="list-decimal pl-6 space-y-3 mb-6 text-lg text-foreground/80" {...props} />,
    li: (props: any) => <li className="leading-relaxed" {...props} />,
    strong: (props: any) => <strong className="font-bold text-foreground" {...props} />,
    em: (props: any) => <em className="italic text-primary" {...props} />,
    blockquote: (props: any) => (
        <div className="mb-6 leading-relaxed font-semibold border-l-4 border-primary pl-10 py-6 bg-primary/5 rounded-r-[2rem] italic my-12 text-xl shadow-inner" {...props} />
    ),

    // Premium Table Styling
    table: (props: any) => (
        <div className="overflow-x-auto mb-12 border border-primary/10 rounded-[2rem] my-12 bg-card/50 backdrop-blur-sm shadow-xl">
            <table className="w-full text-left border-collapse" {...props} />
        </div>
    ),
    thead: (props: any) => <thead className="bg-primary/5 border-b border-primary/10" {...props} />,
    th: (props: any) => <th className="p-6 font-black text-sm uppercase tracking-widest text-primary" {...props} />,
    tbody: (props: any) => <tbody className="divide-y divide-primary/5" {...props} />,
    tr: (props: any) => <tr className="hover:bg-primary/[0.02] transition-colors" {...props} />,
    td: (props: any) => <td className="p-6 text-foreground/80 font-medium" {...props} />,

    a: ({ href, children, ...props }: any) => {
        const isInternal = href && (href.startsWith('/') || href.startsWith('#'));
        if (isInternal) {
            return (
                <Link href={href} className="text-primary hover:underline decoration-2 underline-offset-4 font-black transition-all" {...props}>
                    {children}
                </Link>
            );
        }
        return (
            <a href={href} className="text-primary hover:underline decoration-2 underline-offset-4 font-black transition-all inline-flex items-center gap-1" target="_blank" rel="noopener noreferrer" {...props}>
                {children}
            </a>
        );
    },
    img: (props: any) => (
        <div className="my-12 rounded-[2.5rem] overflow-hidden border border-primary/10 shadow-2xl relative group">
            <div className="absolute inset-0 bg-primary/5 group-hover:bg-transparent transition-colors duration-500" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                {...props}
                title={props.title || props.alt || "WarmAudience Blog Content Image"}
                loading="lazy"
            />
        </div>
    ),
    h2: (props: any) => (
        <h2 className="group text-3xl font-black mb-6 mt-20 text-foreground tracking-tight underline decoration-primary/20 underline-offset-[12px] relative scroll-mt-24" {...props}>
            <span aria-hidden="true" className="absolute -left-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all text-primary/40 text-xl select-none">#</span>
            {props.children}
        </h2>
    ),
    h3: (props: any) => (
        <h3 className="group text-2xl font-black mb-6 mt-16 text-foreground flex items-center gap-2 relative scroll-mt-24" {...props}>
            <span aria-hidden="true" className="absolute -left-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all text-primary/40 text-xl font-normal select-none">#</span>
            {props.children}
        </h3>
    ),

    // Custom Interactive Components
    Button,
    Badge,
    InfoIcon: (props: any) => <Info className="w-5 h-5 text-primary" {...props} />,
    ZapIcon: (props: any) => <Zap className="w-6 h-6 text-primary" {...props} />,
    ShieldIcon: (props: any) => <ShieldCheck className="w-6 h-6 text-primary" {...props} />,
    DatabaseIcon: (props: any) => <Database className="w-6 h-6 text-primary" {...props} />,
    SearchIcon: (props: any) => <Search className="w-6 h-6 text-primary" {...props} />,

    // Collapsible Table of Contents (Urdu: Dropdown ki trah)
    TOC: ({ children }: { children: React.ReactNode }) => (
        <div className="mb-12">
            <Accordion type="single" collapsible className="w-full border border-primary/20 rounded-[2rem] bg-primary/5 shadow-lg overflow-hidden ring-4 ring-primary/5">
                <AccordionItem value="toc" className="border-none">
                    <AccordionPrimitive.Header asChild>
                        <h2 className="m-0 p-0 border-none underline-none outline-none">
                            <AccordionPrimitive.Trigger className="flex flex-1 items-center justify-between w-full px-8 py-6 hover:no-underline hover:bg-primary/5 transition-colors cursor-pointer group outline-none">
                                <div className="flex items-center gap-4">
                                    <div className="bg-primary/10 p-2.5 rounded-xl group-hover:scale-110 transition-transform">
                                        <List className="w-6 h-6 text-primary" />
                                    </div>
                                    <span className="text-xl font-black tracking-tight uppercase tracking-widest text-[#000] dark:text-[#fff]">Table of Contents</span>
                                </div>
                                <ChevronDown className="text-muted-foreground pointer-events-none size-6 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                            </AccordionPrimitive.Trigger>
                        </h2>
                    </AccordionPrimitive.Header>
                    <AccordionContent className="px-8 pb-8 pt-2">
                        <div className="grid md:grid-cols-2 gap-x-12 gap-y-3 text-base [&_ul]:list-none [&_ul]:pl-0 [&_li]:mb-2 [&_a]:text-muted-foreground [&_a]:hover:text-primary [&_a]:transition-colors [&_a]:font-bold border-t border-primary/10 pt-6">
                            {children}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    ),

    // FAQ Component (Matches Landing Page)
    FAQ: ({ children }: { children: React.ReactNode }) => (
        <div className="my-16">
            <h2 className="text-3xl font-black mb-8 text-center uppercase tracking-widest border-none underline-none mt-0">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="bg-card w-full rounded-[2rem] border border-primary/10 px-8 py-4 shadow-xl ring-8 ring-primary/5">
                {children}
            </Accordion>
        </div>
    ),

    FAQItem: ({ question, children, value }: { question: string, children: React.ReactNode, value: string }) => (
        <AccordionItem value={value} className="border-dashed border-primary/10 last:border-0 py-2">
            <AccordionTrigger className="cursor-pointer text-lg font-black hover:no-underline text-foreground tracking-tight text-left">
                {question}
            </AccordionTrigger>
            <AccordionContent className="text-lg leading-relaxed text-muted-foreground font-medium pb-6 pt-2">
                {children}
            </AccordionContent>
        </AccordionItem>
    ),

    Note: ({ children }: { children: React.ReactNode }) => (
        <div className="bg-primary/[0.03] p-10 rounded-[2.5rem] border border-primary/10 mb-16 flex gap-6 items-start shadow-xl hover:shadow-2xl transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
            <div className="bg-primary/10 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                <Info className="w-6 h-6 text-primary" />
            </div>
            <div className="text-foreground/80 leading-relaxed italic text-lg font-medium">
                {children}
            </div>
        </div>
    ),

    HighlightBox: ({ title, children, icon: Icon }: any) => (
        <div className="p-10 bg-primary/5 border border-primary/20 rounded-[2.5rem] mb-16 font-medium shadow-xl hover:shadow-2xl transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
            {title && <h4 className="text-2xl font-black mb-4 flex items-center gap-3 relative z-10 uppercase tracking-tight">
                {Icon && <Icon className="w-7 h-7 text-primary" />}
                {title}
            </h4>}
            <div className="relative z-10 text-lg leading-relaxed text-foreground/80">
                {children}
            </div>
        </div>
    )
};
