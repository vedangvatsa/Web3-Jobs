import { MetadataRoute } from 'next';
import { getArticles } from '@/content/articles';

const siteUrl = 'https://web3-jobs.example.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${siteUrl}/articles`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  const articleRoutes = getArticles().map((article) => ({
    url: `${siteUrl}/articles/${article.slug}`,
    lastModified: new Date(), 
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...articleRoutes];
}
