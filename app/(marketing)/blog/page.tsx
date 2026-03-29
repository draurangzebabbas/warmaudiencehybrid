import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAllBlogPosts } from '@/lib/mdx';
import { Metadata } from 'next';
import { Calendar, Clock, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
    title: 'The WarmAudience Blog | B2B Audience Research & Intelligence',
    description: 'Expert insights on data research, recruiter CRM management, and professional networking strategies for building high-intent B2B audiences.',
    openGraph: {
        title: 'WarmAudience Blog',
        description: 'B2B Audience Research & Intelligence Expert Insights',
        type: 'website',
    }
};

export default async function BlogPage() {
    const posts = await getAllBlogPosts();

    return (
        <div className="max-w-6xl mx-auto px-6 py-12">
            <header className="text-center mb-24 space-y-6">
                <Badge variant="outline" className="px-6 py-2 text-primary border-primary/20 bg-primary/5 rounded-full font-black tracking-widest uppercase text-[10px]">
                    Intelligence & Strategy
                </Badge>
                <h1 className="text-5xl md:text-7xl font-black tracking-tight text-foreground leading-tight">
                    The <span className="text-primary italic font-serif">WarmAudience</span> blog
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
                    Personal letters, technical guides, and the future of B2B audience research.
                </p>
            </header>

            <div className="space-y-16 pb-32">
                {posts.map((post, index) => {
                    const isFeatured = index === 0;

                    if (isFeatured) {
                        return (
                            <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
                                <Card className="border-primary/10 bg-background/50 backdrop-blur-sm rounded-[2.5rem] overflow-hidden py-0 hover:shadow-[0_40px_80px_rgba(0,0,0,0.12)] transition-all duration-700">
                                    <div className="flex flex-col lg:flex-row">
                                        <div className="lg:w-3/5 relative aspect-video lg:aspect-auto overflow-hidden">
                                            <img
                                                src={post.image || '/blog/placeholder.png'}
                                                alt={post.title}
                                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                            />
                                            <div className="absolute top-8 left-8">
                                                <Badge className="bg-primary text-primary-foreground font-black px-4 py-2 rounded-xl shadow-lg uppercase tracking-widest text-[10px]">
                                                    Featured Story
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="lg:w-2/5 p-8 lg:p-12 flex flex-col justify-center">
                                            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-6">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-primary" />
                                                    {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                                <span className="opacity-20">|</span>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-primary" />
                                                    {post.readingTime}
                                                </div>
                                            </div>
                                            <CardTitle className="text-3xl md:text-5xl lg:text-4xl xl:text-5xl font-black mb-6 group-hover:text-primary transition-colors leading-[1.1]">
                                                {post.title}
                                            </CardTitle>
                                            <CardDescription className="text-lg leading-relaxed mb-10 line-clamp-3 font-medium">
                                                {post.description}
                                            </CardDescription>
                                            <Button size="lg" className="w-fit rounded-2xl px-10 py-8 text-lg font-black bg-primary text-primary-foreground hover:scale-105 transition-transform shadow-xl shadow-primary/20 cursor-pointer">
                                                Read Full Story
                                                <ArrowRight className="ml-3 w-5 h-5 transition-transform group-hover:translate-x-2" />
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        );
                    }

                    return null; // Handle other posts separately for grid
                })}

                <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-10">
                    {posts.slice(1).map((post) => (
                        <Link key={post.slug} href={`/blog/${post.slug}`} className="group flex h-full">
                            <Card className="flex flex-col border-primary/10 bg-background/50 backdrop-blur-sm rounded-[2.5rem] overflow-hidden py-0 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all duration-500 w-full group">
                                <div className="relative aspect-[21/9] overflow-hidden">
                                    <img
                                        src={post.image || '/blog/placeholder.png'}
                                        alt={post.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute top-6 left-6">
                                        <Badge className="bg-background/80 backdrop-blur-md text-foreground border-primary/10 font-black px-3 py-1 text-[10px] uppercase tracking-widest rounded-lg">
                                            {post.category}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="p-8 flex flex-col flex-grow">
                                    <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3.5 h-3.5 text-primary" />
                                            {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </div>
                                        <span className="opacity-20">|</span>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-3.5 h-3.5 text-primary" />
                                            {post.readingTime}
                                        </div>
                                    </div>
                                    <CardTitle className="text-2xl font-black mb-4 group-hover:text-primary transition-colors leading-tight">
                                        {post.title}
                                    </CardTitle>
                                    <CardDescription className="text-base font-medium line-clamp-2 mb-8 text-foreground/70">
                                        {post.description}
                                    </CardDescription>
                                    <div className="mt-auto flex items-center text-primary font-black uppercase tracking-widest text-xs group-hover:translate-x-2 transition-transform duration-300 gap-2">
                                        Read Article
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
