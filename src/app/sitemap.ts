
import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';

const siteUrl = 'https://hashtagweb3.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articlesDirectory = path.join(process.cwd(), 'content/articles');
  const fileNames = fs.readdirSync(articlesDirectory);
  
  const articleRoutes: MetadataRoute.Sitemap = fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => {
      const slug = fileName.replace(/\.md$/, '');
      return {
        url: `${siteUrl}/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7
      };
    });

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${siteUrl}/jobs`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8
    },
    {
      url: `${siteUrl}/news`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
        url: `${siteUrl}/salary-calculator`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
    },
    {
        url: `${siteUrl}/invoice-generator`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
    },
    {
        url: `${siteUrl}/resume-builder`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
    },
    {
      url: `${siteUrl}/digital-nomad-visas`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/remote-work-checklist`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/interview-questions`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/web3-career-quiz`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    }
  ];

  return [...staticRoutes, ...articleRoutes];
}
