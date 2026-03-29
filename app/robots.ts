import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/', '/admin/', '/private/'],
            },
            {
                userAgent: ['GPTBot', 'OAI-SearchBot', 'Claude-Web', 'Google-Extended'],
                allow: ['/blog/', '/'],
            }
        ],
        sitemap: 'https://warmaudience.draurangzebabbas.com/sitemap.xml',
    };
}
