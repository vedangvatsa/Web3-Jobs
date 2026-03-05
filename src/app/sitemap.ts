
      
import { MetadataRoute } from 'next';
import { getAllArticles } from '@/lib/articles';
import { getAllTerms, getAllCategorySlugs } from '@/lib/glossary';
import { getCompanies } from '@/lib/companies';

const siteUrl = 'https://hashtagweb3.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getAllArticles();
  const companies = await getCompanies();
  const glossaryTerms = await getAllTerms();
  const categorySlugs = await getAllCategorySlugs();
  
  const articleRoutes: MetadataRoute.Sitemap = articles.map(article => ({
    url: `${siteUrl}/${article.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7
  }));

  const companyRoutes: MetadataRoute.Sitemap = companies.map(company => ({
    url: `${siteUrl}/companies/${company.slug}`,
    lastModified: new Date(company.lastUpdated),
    changeFrequency: 'daily',
    priority: 0.8
  }));
  
  const glossaryRoutes: MetadataRoute.Sitemap = glossaryTerms.map(term => ({
    url: `${siteUrl}/${term.slug}`,
    lastModified: new Date(term.publishedDate),
    changeFrequency: 'monthly',
    priority: 0.8
  }));

  const glossaryCategoryRoutes: MetadataRoute.Sitemap = categorySlugs.map(category => ({
    url: `${siteUrl}/glossary/${category}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.85
  }));

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${siteUrl}/glossary`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/jobs`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/companies`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
        url: `${siteUrl}/community`,
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
        url: `${siteUrl}/resources`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
    },
    {
        url: `${siteUrl}/salary-calculator`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
    },
    {
        url: `${siteUrl}/invoice-generator`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
    },
    {
        url: `${siteUrl}/resume-builder`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
    },
    {
        url: `${siteUrl}/jd-builder`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
    },
    {
      url: `${siteUrl}/digital-nomad-visas`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/remote-work-checklist`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
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
    },
    {
      url: `${siteUrl}/employee-onboarding-checklist`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
     {
      url: `${siteUrl}/offer-letter-customizer`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/employee-exit-survey`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/interview-feedback-template`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/employee-milestones-tracker`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/employee-engagement-survey`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/work-life-balance-survey`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/company-culture-guide`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    }
  ];

  return [...staticRoutes, ...glossaryRoutes, ...glossaryCategoryRoutes, ...articleRoutes, ...companyRoutes];
}

    
