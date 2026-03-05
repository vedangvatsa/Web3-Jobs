import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    host: 'https://hashtagweb3.com',
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://hashtagweb3.com/sitemap.xml',
  }
}
