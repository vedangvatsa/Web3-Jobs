import { MetadataRoute } from 'next';
import { getAllArticles } from '@/lib/articles';
import { getAllTerms, getAllCategorySlugs } from '@/lib/glossary';
import { getCompanies } from '@/lib/companies';

const siteUrl = 'https://hashtagweb3.com';

// Stable fallback date used when content files carry no explicit date field.
// Update this when a significant batch of content is published or revised.
const CONTENT_FALLBACK_DATE = new Date('2025-01-15');

// Static routes that change on a known schedule. lastModified reflects the
// last time the page layout or copy was meaningfully updated.
const staticRoutes: MetadataRoute.Sitemap = [
  {
    url: siteUrl,
    lastModified: new Date('2025-03-01'),
  },
  {
    url: `${siteUrl}/jobs`,
    lastModified: new Date('2025-03-01'),
  },
  {
    url: `${siteUrl}/blog`,
    lastModified: CONTENT_FALLBACK_DATE,
  },
  {
    url: `${siteUrl}/glossary`,
    lastModified: CONTENT_FALLBACK_DATE,
  },
  {
    url: `${siteUrl}/companies`,
    lastModified: new Date('2025-03-01'),
  },
  {
    url: `${siteUrl}/community`,
    lastModified: new Date('2025-03-01'),
  },
  {
    url: `${siteUrl}/news`,
    lastModified: new Date('2025-03-01'),
  },
  {
    url: `${siteUrl}/resources`,
    lastModified: new Date('2025-01-01'),
  },
  // Tool and utility pages
  {
    url: `${siteUrl}/salary-calculator`,
    lastModified: new Date('2025-01-01'),
  },
  {
    url: `${siteUrl}/resume-builder`,
    lastModified: new Date('2025-01-01'),
  },
  {
    url: `${siteUrl}/invoice-generator`,
    lastModified: new Date('2025-01-01'),
  },
  {
    url: `${siteUrl}/jd-builder`,
    lastModified: new Date('2025-01-01'),
  },
  {
    url: `${siteUrl}/web3-career-quiz`,
    lastModified: new Date('2025-01-01'),
  },
  {
    url: `${siteUrl}/interview-questions`,
    lastModified: new Date('2025-01-01'),
  },
  {
    url: `${siteUrl}/freelance-rates-by-industry`,
    lastModified: new Date('2025-01-01'),
  },
  {
    url: `${siteUrl}/digital-nomad-visas`,
    lastModified: new Date('2025-01-01'),
  },
  {
    url: `${siteUrl}/remote-work-checklist`,
    lastModified: new Date('2025-01-01'),
  },
  // HR / employer tool pages
  {
    url: `${siteUrl}/employee-onboarding-checklist`,
    lastModified: new Date('2025-01-01'),
  },
  {
    url: `${siteUrl}/offer-letter-customizer`,
    lastModified: new Date('2025-01-01'),
  },
  {
    url: `${siteUrl}/employee-exit-survey`,
    lastModified: new Date('2025-01-01'),
  },
  {
    url: `${siteUrl}/interview-feedback-template`,
    lastModified: new Date('2025-01-01'),
  },
  {
    url: `${siteUrl}/employee-milestones-tracker`,
    lastModified: new Date('2025-01-01'),
  },
  {
    url: `${siteUrl}/employee-engagement-survey`,
    lastModified: new Date('2025-01-01'),
  },
  {
    url: `${siteUrl}/work-life-balance-survey`,
    lastModified: new Date('2025-01-01'),
  },
  {
    url: `${siteUrl}/company-culture-guide`,
    lastModified: new Date('2025-01-01'),
  },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, companies, glossaryTerms, categorySlugs] = await Promise.all([
    getAllArticles(),
    getCompanies(),
    getAllTerms(),
    getAllCategorySlugs(),
  ]);

  // Articles live at /<slug> (root level, shared [slug] route with glossary terms).
  // No date field exists in article frontmatter, so use the stable fallback.
  const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${siteUrl}/${article.slug}`,
    lastModified: CONTENT_FALLBACK_DATE,
  }));

  // Company pages are derived from the live jobs cache. lastUpdated is set to
  // build time inside getCompanies(), so we use a stable fallback here too.
  const companyRoutes: MetadataRoute.Sitemap = companies.map((company) => ({
    url: `${siteUrl}/companies/${company.slug}`,
    lastModified: new Date('2025-03-01'),
  }));

  // Glossary terms live at /<slug> (same [slug] route, resolved before articles).
  // updatedDate is not populated in any current term file; use stable fallback.
  const glossaryRoutes: MetadataRoute.Sitemap = glossaryTerms.map((term) => ({
    url: `${siteUrl}/${term.slug}`,
    lastModified: term.updatedDate
      ? new Date(term.updatedDate)
      : CONTENT_FALLBACK_DATE,
  }));

  // Glossary category index pages live at /glossary/<category-slug>.
  const glossaryCategoryRoutes: MetadataRoute.Sitemap = categorySlugs.map((category) => ({
    url: `${siteUrl}/glossary/${category}`,
    lastModified: CONTENT_FALLBACK_DATE,
  }));

  return [
    ...staticRoutes,
    ...glossaryCategoryRoutes,
    ...glossaryRoutes,
    ...articleRoutes,
    ...companyRoutes,
  ];
}
