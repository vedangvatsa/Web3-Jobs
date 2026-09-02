import { MetadataRoute } from 'next';
import { getAllArticles } from '@/lib/articles';
import { getAllTerms, getAllCategorySlugs } from '@/lib/glossary';
import { getCompanies } from '@/lib/companies';
import { getAllResourcePages } from '@/lib/pseo/resources';
import { getCategories, getLessons } from '@/lib/learn';
import { getAllJobsWithSlugs, hasSubstantialJobContent } from '@/lib/job-guides';

const siteUrl = 'https://hashtagweb3.com';

function canonicalizeUrl(url: string): string {
 const withoutFragmentOrQuery = url.split(/[?#]/, 1)[0];
 return withoutFragmentOrQuery === siteUrl
  ? siteUrl
  : withoutFragmentOrQuery.replace(/\/+$/, '');
}

/**
 * A number of content collections share the root-level slug namespace. Keep
 * the first route from the explicit collection order below, then sort the
 * canonical URLs so sitemap output is stable across filesystem/API ordering.
 */
function uniqueRoutes(routes: MetadataRoute.Sitemap): MetadataRoute.Sitemap {
 const routesByUrl = new Map<string, MetadataRoute.Sitemap[number]>();

 for (const route of routes) {
  const url = canonicalizeUrl(route.url);
  if (!routesByUrl.has(url)) {
   routesByUrl.set(url, { ...route, url });
  }
 }

 return [...routesByUrl.values()].sort((a, b) => a.url.localeCompare(b.url));
}

// Stable fallback date used when content files carry no explicit date field.
// Update this when a significant batch of content is published or revised.
const CONTENT_FALLBACK_DATE = new Date('2026-04-27');

// Static routes that change on a known schedule. lastModified reflects the
// last time the page layout or copy was meaningfully updated.
const staticRoutes: MetadataRoute.Sitemap = [
 {
  url: siteUrl,
  lastModified: new Date(),
  changeFrequency: 'daily',
  priority: 1.0,
 },
 {
  url: `${siteUrl}/jobs`,
  lastModified: new Date(),
  changeFrequency: 'daily',
  priority: 0.9,
 },
 {
  url: `${siteUrl}/blog`,
  lastModified: CONTENT_FALLBACK_DATE,
  changeFrequency: 'weekly',
  priority: 0.8,
 },
 {
  url: `${siteUrl}/glossary`,
  lastModified: CONTENT_FALLBACK_DATE,
  changeFrequency: 'weekly',
  priority: 0.7,
 },
 {
  url: `${siteUrl}/companies`,
  lastModified: new Date(),
  changeFrequency: 'weekly',
  priority: 0.8,
 },
 {
  url: `${siteUrl}/community`,
  lastModified: new Date(),
  changeFrequency: 'monthly',
  priority: 0.5,
 },
 {
  url: `${siteUrl}/learn`,
  lastModified: CONTENT_FALLBACK_DATE,
  changeFrequency: 'weekly',
  priority: 0.9,
 },
 {
  url: `${siteUrl}/news`,
  lastModified: new Date(),
  changeFrequency: 'daily',
  priority: 0.7,
 },
 {
  url: `${siteUrl}/developers`,
  lastModified: new Date(),
  changeFrequency: 'weekly',
  priority: 0.9,
 },
 {
  url: `${siteUrl}/api-docs`,
  lastModified: new Date(),
  changeFrequency: 'weekly',
  priority: 0.8,
 },
 {
  url: `${siteUrl}/docs`,
  lastModified: new Date(),
  changeFrequency: 'weekly',
  priority: 0.8,
 },
 {
  url: `${siteUrl}/auth`,
  lastModified: new Date(),
  changeFrequency: 'monthly',
  priority: 0.8,
 },
 {
  url: `${siteUrl}/api-policy`,
  lastModified: new Date(),
  changeFrequency: 'monthly',
  priority: 0.7,
 },
 {
  url: `${siteUrl}/resources`,
  lastModified: new Date('2025-01-01'),
  changeFrequency: 'monthly',
  priority: 0.6,
 },
 // Tool and utility pages
 {
  url: `${siteUrl}/salary-calculator`,
  lastModified: new Date('2025-01-01'),
  changeFrequency: 'monthly',
  priority: 0.6,
 },
 {
  url: `${siteUrl}/resume-builder`,
  lastModified: new Date('2025-01-01'),
  changeFrequency: 'monthly',
  priority: 0.6,
 },
 {
  url: `${siteUrl}/invoice-generator`,
  lastModified: new Date('2025-01-01'),
  changeFrequency: 'monthly',
  priority: 0.5,
 },
 {
  url: `${siteUrl}/jd-builder`,
  lastModified: new Date('2025-01-01'),
  changeFrequency: 'monthly',
  priority: 0.5,
 },
 {
  url: `${siteUrl}/web3-career-quiz`,
  lastModified: new Date('2025-01-01'),
  changeFrequency: 'monthly',
  priority: 0.6,
 },
 {
  url: `${siteUrl}/interview-questions`,
  lastModified: new Date('2025-01-01'),
  changeFrequency: 'monthly',
  priority: 0.6,
 },
 {
  url: `${siteUrl}/freelance-rates-by-industry`,
  lastModified: new Date('2025-01-01'),
  changeFrequency: 'monthly',
  priority: 0.5,
 },
 {
  url: `${siteUrl}/digital-nomad-visas`,
  lastModified: new Date('2025-01-01'),
  changeFrequency: 'monthly',
  priority: 0.5,
 },
 {
  url: `${siteUrl}/remote-work-checklist`,
  lastModified: new Date('2025-01-01'),
  changeFrequency: 'monthly',
  priority: 0.5,
 },
 // HR / employer tool pages
 {
  url: `${siteUrl}/employee-onboarding-checklist`,
  lastModified: new Date('2025-01-01'),
  changeFrequency: 'monthly',
  priority: 0.4,
 },
 {
  url: `${siteUrl}/offer-letter-customizer`,
  lastModified: new Date('2025-01-01'),
  changeFrequency: 'monthly',
  priority: 0.4,
 },
 {
  url: `${siteUrl}/employee-exit-survey`,
  lastModified: new Date('2025-01-01'),
  changeFrequency: 'monthly',
  priority: 0.4,
 },
 {
  url: `${siteUrl}/interview-feedback-template`,
  lastModified: new Date('2025-01-01'),
  changeFrequency: 'monthly',
  priority: 0.4,
 },
 {
  url: `${siteUrl}/employee-milestones-tracker`,
  lastModified: new Date('2025-01-01'),
  changeFrequency: 'monthly',
  priority: 0.4,
 },
 {
  url: `${siteUrl}/employee-engagement-survey`,
  lastModified: new Date('2025-01-01'),
  changeFrequency: 'monthly',
  priority: 0.4,
 },
 {
  url: `${siteUrl}/work-life-balance-survey`,
  lastModified: new Date('2025-01-01'),
  changeFrequency: 'monthly',
  priority: 0.4,
 },
 {
  url: `${siteUrl}/company-culture-guide`,
  lastModified: new Date('2025-01-01'),
  changeFrequency: 'monthly',
  priority: 0.4,
 },
 // Trust Anchor & Developer Pages
 {
  url: `${siteUrl}/about`,
  lastModified: new Date(),
  changeFrequency: 'monthly',
  priority: 0.8,
 },
 {
  url: `${siteUrl}/contact`,
  lastModified: new Date(),
  changeFrequency: 'monthly',
  priority: 0.8,
 },
 {
  url: `${siteUrl}/privacy`,
  lastModified: new Date(),
  changeFrequency: 'monthly',
  priority: 0.7,
 },
 {
  url: `${siteUrl}/developers`,
  lastModified: new Date(),
  changeFrequency: 'weekly',
  priority: 0.8,
 },
 {
  url: `${siteUrl}/api-docs`,
  lastModified: new Date(),
  changeFrequency: 'monthly',
  priority: 0.8,
 },
 {
  url: `${siteUrl}/docs`,
  lastModified: new Date(),
  changeFrequency: 'monthly',
  priority: 0.8,
 },
 {
  url: `${siteUrl}/agent-instructions.md`,
  lastModified: new Date(),
  changeFrequency: 'weekly',
  priority: 0.8,
 },
 {
  url: `${siteUrl}/auth.md`,
  lastModified: new Date(),
  changeFrequency: 'monthly',
  priority: 0.8,
 },
 {
  url: `${siteUrl}/events`,
  lastModified: new Date(),
  changeFrequency: 'daily',
  priority: 0.8,
 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
 const [articles, companies, glossaryTerms, categorySlugs, resourcePages, learnCategories] = await Promise.all([
  getAllArticles(),
  getCompanies(),
  getAllTerms(),
  getAllCategorySlugs(),
  getAllResourcePages(),
  getCategories(),
 ]);

 // Articles live at /<slug> (root level, shared [slug] route with glossary terms).
 // No date field exists in article frontmatter, so use the stable fallback.
 const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
  url: `${siteUrl}/${article.slug}`,
  lastModified: CONTENT_FALLBACK_DATE,
  changeFrequency: 'monthly' as const,
  priority: 0.7,
 }));

 // Company pages are derived from the live jobs cache. Use the newest verified
 // listing date for a stable, source-backed modification timestamp.
 const companyRoutes: MetadataRoute.Sitemap = companies
  .filter((company) => company.jobCount >= 2)
  .map((company) => ({
   url: `${siteUrl}/${company.slug}`,
   lastModified: new Date(company.lastUpdated),
   changeFrequency: 'weekly' as const,
   priority: 0.6,
  }));

 // Glossary terms live at /<slug> (same [slug] route, resolved before articles).
 // updatedDate is not populated in any current term file; use stable fallback.
 const glossaryRoutes: MetadataRoute.Sitemap = glossaryTerms.map((term) => ({
  url: `${siteUrl}/${term.slug}`,
  lastModified: term.updatedDate
   ? new Date(term.updatedDate)
   : CONTENT_FALLBACK_DATE,
  changeFrequency: 'monthly' as const,
  priority: 0.6,
 }));

 // Glossary category index pages live at /glossary/<category-slug>.
 const glossaryCategoryRoutes: MetadataRoute.Sitemap = categorySlugs.map((category) => ({
  url: `${siteUrl}/glossary/${category}`,
  lastModified: CONTENT_FALLBACK_DATE,
  changeFrequency: 'monthly' as const,
  priority: 0.5,
 }));

 // pSEO resource pages live at /<slug> (root level).
 const resourceRoutes: MetadataRoute.Sitemap = resourcePages.map((page) => ({
  url: `${siteUrl}/${page.seo.canonicalSlug}`,
  lastModified: new Date(page.meta.generatedAt),
  changeFrequency: 'monthly' as const,
  priority: 0.7,
 }));

 // Learn Category pages live at /learn/<category-slug>.
 const learnCategoryRoutes: MetadataRoute.Sitemap = learnCategories.map((category) => ({
  url: `${siteUrl}/learn/${category.slug}`,
  lastModified: CONTENT_FALLBACK_DATE,
  changeFrequency: 'monthly' as const,
  priority: 0.8,
 }));

 // Learn Lesson pages live at /learn/<category-slug>/<lesson-slug>.
 const learnLessonRoutes: MetadataRoute.Sitemap = [];
 for (const category of learnCategories) {
  const lessons = getLessons(category.slug);
  for (const lesson of lessons) {
   learnLessonRoutes.push({
    url: `${siteUrl}/learn/${category.slug}/${lesson.slug}`,
    lastModified: CONTENT_FALLBACK_DATE,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
   });
  }
 }

  const jobsWithSlugs = await getAllJobsWithSlugs();
  const jobRoutes: MetadataRoute.Sitemap = jobsWithSlugs
   .filter(({ job }) => hasSubstantialJobContent(job))
   .map(({ job, slug }) => ({
    url: `${siteUrl}/${slug}`,
    lastModified: new Date(job.date),
    changeFrequency: 'daily' as const,
    priority: 0.8,
   }));

  return uniqueRoutes([
   ...staticRoutes,
   ...glossaryCategoryRoutes,
   ...glossaryRoutes,
   ...articleRoutes,
   ...companyRoutes,
   ...jobRoutes,
   ...resourceRoutes,
   ...learnCategoryRoutes,
   ...learnLessonRoutes,
  ]);
}
