import React from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { ChevronLeft, Calendar, Clock, User, Share2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getBlogPostBySlug, getAllBlogPosts } from '@/lib/mdx';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { MDXComponents } from '@/components/MDXComponents';

import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import remarkGfm from 'remark-gfm';

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    const posts = await getAllBlogPosts();
    return posts.map((post) => ({
        slug: post.slug,
    }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const post = await getBlogPostBySlug(slug);

    if (!post) return { title: 'Post Not Found' };

    const { metadata } = post;

    return {
        title: metadata.seoTitle || metadata.title,
        description: metadata.seoDescription || metadata.description,
        openGraph: {
            title: metadata.title,
            description: metadata.description,
            type: 'article',
            publishedTime: metadata.date,
            authors: [metadata.author],
            images: metadata.image ? [{ url: metadata.image }] : undefined,
        },
        twitter: {
            card: 'summary_large_image',
            title: metadata.title,
            description: metadata.description,
            images: metadata.image ? [metadata.image] : undefined,
        },
        alternates: {
            canonical: `https://warmaudience.draurangzebabbas.com/blog/${slug}`,
        }
    };
}

export default async function BlogPost({ params }: Props) {
    const { slug } = await params;
    const post = await getBlogPostBySlug(slug);

    if (!post) {
        notFound();
    }

    const { metadata, content } = post;

    // JSON-LD structured data for SEO
    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'BlogPosting',
                headline: metadata.title,
                description: metadata.description,
                datePublished: metadata.date,
                dateModified: metadata.date, // Add logic for modified date if available
                author: {
                    '@type': 'Person',
                    name: metadata.author,
                    url: `https://warmaudience.draurangzebabbas.com/authors/${metadata.author.toLowerCase().replace(/\s+/g, '-')}`,
                },
                image: metadata.image ? `https://warmaudience.draurangzebabbas.com${metadata.image}` : undefined,
                publisher: {
                    '@type': 'Organization',
                    name: 'WarmAudience',
                    logo: {
                        '@type': 'ImageObject',
                        url: 'https://warmaudience.draurangzebabbas.com/logo.png',
                    },
                },
            },
            {
                '@type': 'BreadcrumbList',
                itemListElement: [
                    {
                        '@type': 'ListItem',
                        position: 1,
                        name: 'Home',
                        item: 'https://warmaudience.draurangzebabbas.com',
                    },
                    {
                        '@type': 'ListItem',
                        position: 2,
                        name: 'Blog',
                        item: 'https://warmaudience.draurangzebabbas.com/blog',
                    },
                    {
                        '@type': 'ListItem',
                        position: 3,
                        name: metadata.category,
                        item: `https://warmaudience.draurangzebabbas.com/blog?category=${metadata.category}`,
                    },
                    {
                        '@type': 'ListItem',
                        position: 4,
                        name: metadata.title,
                        item: `https://warmaudience.draurangzebabbas.com/blog/${slug}`,
                    },
                ],
            },
        ],
    };

    return (
        <div className="max-w-4xl mx-auto px-6 font-sans leading-relaxed text-foreground/90 py-12">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <div className="flex items-center justify-between mb-10">
                <Link href="/blog">
                    <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                        <ChevronLeft className="mr-2 size-4" />
                        Back to Blog
                    </Button>
                </Link>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <Share2 className="mr-2 size-4" />
                    Share
                </Button>
            </div>

            <article>
                <header className="mb-16 text-center space-y-6">
                    <div className="flex items-center justify-center gap-3">
                        <Badge variant="outline" className="text-primary border-primary/20 bg-primary/10 font-bold px-3 py-1 uppercase tracking-widest text-[10px]">
                            {metadata.category}
                        </Badge>
                        <span className="text-muted-foreground">•</span>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            <Clock className="w-3.5 h-3.5" />
                            {metadata.readingTime}
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-7xl font-black mb-8 tracking-tight leading-[1.1] text-foreground">
                        {metadata.title}
                    </h1>

                    <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed italic border-x-2 border-primary/20 px-4">
                        {metadata.description}
                    </p>

                    <div className="pt-8 flex items-center justify-center gap-6 text-sm font-bold text-muted-foreground uppercase tracking-widest border-t border-primary/5 mt-10">
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-primary" />
                            <span>{metadata.author}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span>{new Date(metadata.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                    </div>
                </header>

                {metadata.image && (
                    <div className="relative w-full aspect-video md:aspect-[21/9] rounded-[2rem] overflow-hidden mb-20 shadow-2xl border border-primary/10 group">
                        <img
                            src={metadata.image}
                            alt={metadata.title}
                            title={metadata.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
                    </div>
                )}

                <div className="prose prose-zinc dark:prose-invert max-w-none">
                    <MDXRemote
                        source={content}
                        components={MDXComponents}
                        options={{
                            mdxOptions: {
                                // @ts-ignore
                                remarkPlugins: [remarkGfm],
                                // @ts-ignore
                                rehypePlugins: [
                                    rehypeSlug,
                                    [
                                        rehypeAutolinkHeadings,
                                        {
                                            behavior: 'wrap',
                                            properties: {
                                                className: ['anchor'],
                                            },
                                        },
                                    ],
                                ],
                            },
                        }}
                    />

                    <footer className="mt-20 pt-10 border-t border-primary/10">
                        <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-12 rounded-[2.5rem] border border-primary/20 text-center relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-full bg-grid-white/[0.02] bg-[size:20px_20px]" />
                            <h4 className="text-4xl font-black mb-4 relative z-10">Ready to dominate your market?</h4>
                            <p className="text-xl mb-10 text-muted-foreground font-medium max-w-lg mx-auto relative z-10">
                                Join hundreds of researchers using WarmAudience to automate their intelligence workflows.
                            </p>
                            <Link href="/signup" className="relative z-10">
                                <Button size="lg" className="px-12 py-8 text-xl font-black h-auto rounded-2xl shadow-2xl shadow-primary/40 hover:shadow-primary/60 transition-all scale-100 hover:scale-105 active:scale-95 bg-primary text-primary-foreground">
                                    Get Started for Free
                                </Button>
                            </Link>
                        </section>
                    </footer>
                </div>
            </article>
        </div>
    );
}
