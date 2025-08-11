import { MetadataRoute } from 'next';

const siteUrl = 'https://web3-jobs.example.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ];

  return [...staticRoutes];
}
