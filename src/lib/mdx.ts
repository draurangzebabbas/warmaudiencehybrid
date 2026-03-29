import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const BLOG_CONTENT_PATH = path.join(process.cwd(), 'src/content/blog');

export interface BlogPostMetadata {
    slug: string;
    title: string;
    description: string;
    seoTitle?: string;
    seoDescription?: string;
    category: string;
    author: string;
    date: string;
    image?: string;
    tags?: string[];
    readingTime?: string;
    updatedAt?: string;
}

function calculateReadingTime(content: string) {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/g).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
}

export async function getBlogPostBySlug(slug: string) {
    const filePath = path.join(BLOG_CONTENT_PATH, `${slug}.mdx`);

    if (!fs.existsSync(filePath)) {
        return null;
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContent);

    return {
        metadata: {
            ...data,
            slug,
            readingTime: calculateReadingTime(content),
        } as BlogPostMetadata,
        content,
    };
}

export async function getAllBlogPosts() {
    if (!fs.existsSync(BLOG_CONTENT_PATH)) {
        return [];
    }

    const files = fs.readdirSync(BLOG_CONTENT_PATH);

    const posts = files
        .filter((file) => file.endsWith('.mdx'))
        .map((file) => {
            const slug = file.replace(/\.mdx$/, '');
            const filePath = path.join(BLOG_CONTENT_PATH, file);
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const { data, content } = matter(fileContent);

            return {
                ...data,
                slug,
                readingTime: calculateReadingTime(content),
            } as BlogPostMetadata;
        });

    // Sort by date descending
    return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
