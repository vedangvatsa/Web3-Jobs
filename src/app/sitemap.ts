
import { MetadataRoute } from 'next';
import { getAllArticles } from '@/lib/articles';

const siteUrl = 'https://web3-jobs.example.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8
    },
    {
        url: `${siteUrl}/salary-calculator`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
    },
    {
      url: `${siteUrl}/community`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    }
  ];

  const articles = await getAllArticles();
  const articleRoutes = articles.map(article => ({
    url: `${siteUrl}/${article.slug}`,
    lastModified: new Date(), // In a real app, you'd use the article's publish date
    changeFrequency: 'monthly',
    priority: 0.7
  }));

  return [...staticRoutes, ...articleRoutes];
}
