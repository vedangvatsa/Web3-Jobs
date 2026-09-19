/**
 * Compares sitemap URLs to App Router static generation coverage.
 * Run: npx tsx scripts/audit-static-prerender.ts
 */
import { buildSitemapRoutes } from '../src/lib/sitemap-build';
import { getCategories, getLessons } from '../src/lib/learn';
import { getAllCategorySlugs } from '../src/lib/glossary';
import { getPopupSlugs } from '../src/lib/popups';

const SITE = 'https://hashtagweb3.com';

function pathFromUrl(url: string): string {
  if (url === SITE || url === `${SITE}/`) return '/';
  if (!url.startsWith(`${SITE}/`)) return url;
  const path = url.slice(SITE.length);
  return path.replace(/\/+$/, '') || '/';
}

async function main(): Promise<void> {
  const routes = await buildSitemapRoutes();
  const sitemapPaths = new Set(routes.map((r) => pathFromUrl(r.url)));

  // --- Routes with full generateStaticParams at build (dynamicParams false where noted) ---
  const catchAllSlugs = new Set<string>();
  for (const route of routes) {
    const p = pathFromUrl(route.url);
    if (!p.startsWith('/') || p === '/') continue;
    const rest = p.slice(1);
    if (!rest || rest.includes('/')) continue;
    catchAllSlugs.add(rest);
  }

  const learnLessonPaths = new Set<string>();
  const learnCategoryPaths = new Set<string>();
  for (const cat of getCategories()) {
    learnCategoryPaths.add(`/learn/${cat.slug}`);
    for (const lesson of getLessons(cat.slug)) {
      learnLessonPaths.add(`/learn/${cat.slug}/${lesson.slug}`);
    }
  }

  const glossaryCategoryPaths = new Set<string>();
  for (const cat of await getAllCategorySlugs()) {
    glossaryCategoryPaths.add(`/glossary/${cat}`);
  }

  const popupDetailPaths = new Set<string>();
  for (const slug of getPopupSlugs()) {
    popupDetailPaths.add(`/popups/${slug}`);
  }

  const preRenderedPaths = new Set<string>([
    ...catchAllSlugs,
    ...[...catchAllSlugs].map((s) => `/${s}`),
    ...learnCategoryPaths,
    ...learnLessonPaths,
    ...glossaryCategoryPaths,
    ...popupDetailPaths,
  ]);

  // Fix: catchAllSlugs already include leading path without duplicate
  preRenderedPaths.clear();
  for (const s of catchAllSlugs) preRenderedPaths.add(`/${s}`);
  // /learn/[category] has no generateStaticParams — not build-pre-rendered
  for (const p of learnLessonPaths) preRenderedPaths.add(p);
  for (const p of glossaryCategoryPaths) preRenderedPaths.add(p);
  for (const p of popupDetailPaths) preRenderedPaths.add(p);

  // Fixed app pages (no dynamic segments) — SSG at build via force-static or revalidate.
  const fixedStaticPages = new Set([
    '/',
    '/jobs',
    '/blog',
    '/news',
    '/events',
    '/glossary',
    '/companies',
    '/community',
    '/developers',
    '/contact',
    '/learn',
    '/docs',
    '/api-docs',
    '/api-policy',
    '/auth',
    '/about',
    '/privacy',
    '/popups',
    '/resources',
    '/salary-calculator',
    '/resume-builder',
    '/remote-work-checklist',
    '/jd-builder',
    '/invoice-generator',
    '/digital-nomad-visas',
    '/web3-hiring-report',
    '/web3-career-quiz',
    '/interview-questions',
    '/freelance-rates-by-industry',
    '/company-culture-guide',
    '/work-life-balance-survey',
    '/employee-engagement-survey',
    '/employee-onboarding-checklist',
    '/offer-letter-customizer',
    '/employee-exit-survey',
    '/employee-milestones-tracker',
    '/interview-feedback-template',
  ]);
  for (const p of fixedStaticPages) preRenderedPaths.add(p);

  const inSitemapNotPreRendered: string[] = [];
  for (const p of sitemapPaths) {
    if (!preRenderedPaths.has(p)) inSitemapNotPreRendered.push(p);
  }

  const preRenderedNotInSitemap: string[] = [];
  for (const p of preRenderedPaths) {
    if (!sitemapPaths.has(p) && p !== '/') preRenderedNotInSitemap.push(p);
  }

  // On-demand dynamic HTML routes (not in sitemap, may still be hit)
  const learnCategoriesOnDemand = [...learnCategoryPaths].filter((p) => !preRenderedPaths.has(p));

  console.log('=== Static pre-render audit (App Router HTML pages) ===\n');
  console.log(`Sitemap URLs (HTML):        ${sitemapPaths.size}`);
  console.log(`Pre-render param paths:     ${preRenderedPaths.size}`);
  console.log(`  /[slug] (root):           ${catchAllSlugs.size}`);
  console.log(`  /learn/[cat]:             ${learnCategoryPaths.size}`);
  console.log(`  /learn/[cat]/[lesson]:    ${learnLessonPaths.size}`);
  console.log(`  /glossary/[cat]:          ${glossaryCategoryPaths.size}`);
  console.log(`  /popups/[slug]:           ${popupDetailPaths.size}`);
  console.log(`  fixed listing/tool pages: ${fixedStaticPages.size}`);
  console.log('');
  console.log(`In sitemap, NOT pre-rendered at build: ${inSitemapNotPreRendered.length}`);
  if (inSitemapNotPreRendered.length > 0) {
    console.log('  Examples:');
    for (const p of inSitemapNotPreRendered.slice(0, 20)) console.log(`    ${p}`);
    if (inSitemapNotPreRendered.length > 20) {
      console.log(`    … and ${inSitemapNotPreRendered.length - 20} more`);
    }
  }

  console.log('');
  console.log('--- Routes that render on demand (no generateStaticParams) ---');
  console.log('/learn/[category]:          on-demand ISR (no generateStaticParams)');
  console.log('/jobs/[slug]:               on-demand redirect (legacy URLs only)');
  console.log('/popups/[slug]:             pre-rendered for known slugs; dynamicParams=true allows extras');
  console.log('');
  console.log('--- Non-HTML (always dynamic at request time) ---');
  console.log('API / feeds / XML route handlers: 11 route.ts files (expected dynamic)');
  console.log('  /api/email/unsubscribe: force-dynamic');
  console.log('  job/event XML + JSON feeds: revalidate ISR');

  // Learn category: we ADDED generateStaticParams - they're in glossaryCategoryPaths style - learnCategoryPaths IS in preRenderedPaths
  // Wait - learn category IS in preRenderedPaths via learnCategoryPaths loop

  // Double-check learn categories in sitemap
  const learnCatInSitemap = [...sitemapPaths].filter(
    (p) => p.startsWith('/learn/') && p.split('/').filter(Boolean).length === 2,
  );
  const learnCatMissing = learnCatInSitemap.filter((p) => !preRenderedPaths.has(p));
  console.log('');
  console.log(`Learn category pages in sitemap: ${learnCatInSitemap.length}, missing from static set: ${learnCatMissing.length}`);

  const learnLessonsInSitemap = [...sitemapPaths].filter(
    (p) => p.startsWith('/learn/') && p.split('/').filter(Boolean).length === 3,
  );
  const learnLessonsMissing = learnLessonsInSitemap.filter((p) => !preRenderedPaths.has(p));
  console.log(`Learn lesson pages in sitemap: ${learnLessonsInSitemap.length}, missing from static set: ${learnLessonsMissing.length}`);

  const glossaryCatInSitemap = [...sitemapPaths].filter((p) => p.startsWith('/glossary/') && p.split('/').length === 3);
  const glossaryCatMissing = glossaryCatInSitemap.filter((p) => !preRenderedPaths.has(p));
  console.log(`Glossary category in sitemap: ${glossaryCatInSitemap.length}, missing: ${glossaryCatMissing.length}`);

  const rootInSitemap = [...sitemapPaths].filter((p) => p.split('/').filter(Boolean).length === 1);
  const rootMissing = rootInSitemap.filter((p) => !preRenderedPaths.has(p));
  console.log(`Root /[slug] in sitemap: ${rootInSitemap.length}, missing from catch-all static: ${rootMissing.length}`);
  if (rootMissing.length > 0 && rootMissing.length <= 10) {
    for (const p of rootMissing) console.log(`    ${p}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
