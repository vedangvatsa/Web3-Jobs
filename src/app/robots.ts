import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
 return {
  host: 'https://hashtagweb3.com',
  rules: [
   {
    userAgent: '*',
    allow: '/',
    disallow: ['/_next/', '/api/'],
   },
   // Explicitly allow AI search crawlers for GEO visibility
   { userAgent: 'GPTBot', allow: '/' },
   { userAgent: 'OAI-SearchBot', allow: '/' },
   { userAgent: 'ChatGPT-User', allow: '/' },
   { userAgent: 'ClaudeBot', allow: '/' },
   { userAgent: 'PerplexityBot', allow: '/' },
   { userAgent: 'Bingbot', allow: '/' },
   { userAgent: 'Googlebot', allow: '/' },
   // Block AI training crawlers (not search crawlers)
   { userAgent: 'anthropic-ai', disallow: '/' },
   { userAgent: 'cohere-ai', disallow: '/' },
   { userAgent: 'CCBot', disallow: '/' },
   // Block known aggressive scrapers
   { userAgent: 'AhrefsBot', disallow: '/' },
   { userAgent: 'SemrushBot', disallow: '/' },
   { userAgent: 'DotBot', disallow: '/' },
   { userAgent: 'MJ12bot', disallow: '/' },
   { userAgent: 'PetalBot', disallow: '/' },
   { userAgent: 'MegaIndex.ru', disallow: '/' },
   { userAgent: 'BLEXBot', disallow: '/' },
   { userAgent: 'DataForSeoBot', disallow: '/' },
   { userAgent: 'Scrapy', disallow: '/' },
   { userAgent: 'Wget', disallow: '/' },
   { userAgent: 'curl', disallow: '/' },
   { userAgent: 'python-requests', disallow: '/' },
  ],
  sitemap: 'https://hashtagweb3.com/sitemap.xml',
 }
}
