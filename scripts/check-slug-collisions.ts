import fs from 'fs';
import path from 'path';
import { getAllArticles } from '../src/lib/articles';
import { getAllTerms } from '../src/lib/glossary';
import { getAllResourcePages } from '../src/lib/pseo';
import { getCompanies } from '../src/lib/companies';
import { getEvents } from '../src/lib/events-server';
import { getEventSlug } from '../src/lib/events';
import { getAllJobsWithSlugs, getLegacyJobSlugs } from '../src/lib/job-guides';

// Static top-level routes built into src/app (win over src/app/[slug] for the same path)
const STATIC_APP_ROUTES = [
  'jobs', 'blog', 'glossary', 'companies', 'community', 'learn', 'news',
  'developers', 'api-docs', 'docs', 'auth', 'api-policy', 'resources',
  'events', 'contact', 'privacy', 'ask', 'mcp', 'developer', 'dev'
];

const STATIC_RESERVED = new Set(STATIC_APP_ROUTES.map((r) => r.toLowerCase()));

/**
 * Apply the same precedence as src/app/[slug]/page.tsx so we only fail on
 * ambiguous collisions, not shadowed legacy/job slugs.
 */
function entriesAfterRouting(slug: string, entries: Array<{ type: string; title: string }>) {
  let out = [...entries];

  if (STATIC_RESERVED.has(slug)) {
    out = out.filter((e) => e.type !== 'Job Post' && e.type !== 'Legacy Job Alias');
  }

  if (out.some((e) => e.type === 'Event')) {
    out = out.filter((e) => e.type !== 'Legacy Job Alias');
  }

  // Job detail is resolved before company pages and glossary terms at the root slug.
  if (out.some((e) => e.type === 'Job Post')) {
    out = out.filter((e) => e.type !== 'Glossary Term' && e.type !== 'Company Page');
  }

  return out;
}

async function checkSlugCollisions() {
  console.log('🔍 Auditing root slug collisions across all content types & app routes...\n');

  const terms = await getAllTerms();
  const articles = await getAllArticles();
  const resources = getAllResourcePages();
  const companies = await getCompanies();
  const events = await getEvents();
  const jobs = await getAllJobsWithSlugs();

  const slugMap = new Map<string, Array<{ type: string; title: string }>>();

  function register(slug: string, type: string, title: string) {
    if (!slug) return;
    const lower = slug.toLowerCase().trim();
    const existing = slugMap.get(lower) || [];
    existing.push({ type, title });
    slugMap.set(lower, existing);
  }

  STATIC_APP_ROUTES.forEach(r => register(r, 'Built-in App Route', `/${r}`));
  terms.forEach(t => register(t.slug, 'Glossary Term', t.term));
  articles.forEach(a => register(a.slug, 'Article', a.title));
  resources.forEach(r => register(r.seo.canonicalSlug, 'Resource Page', r.seo.title));
  companies.forEach(c => register(c.slug, 'Company Page', c.name));
  events.forEach(e => register(getEventSlug(e), 'Event', e.name));
  jobs.forEach(j => register(j.slug, 'Job Post', `${j.job.title} at ${j.job.company}`));

  // Legacy job paths are still resolved before articles at the shared root
  // route, so they reserve a slug just as much as a live canonical job path.
  const canonicalJobSlugs = new Set(jobs.map(({ slug }) => slug.toLowerCase()));
  getLegacyJobSlugs()
    .filter((slug) => !canonicalJobSlugs.has(slug))
    .forEach((slug) => register(slug, 'Legacy Job Alias', `/${slug}`));

  let collisionsFound = 0;
  for (const [slug, entries] of slugMap.entries()) {
    const effective = entriesAfterRouting(slug, entries);
    if (effective.length > 1) {
      const types = new Set(effective.map((e) => e.type));
      if (types.size > 1) {
        collisionsFound++;
        console.error(`❌ SLUG COLLISION [/${slug}]:`);
        effective.forEach((e) => console.error(`   - (${e.type}) ${e.title}`));
        if (effective.length < entries.length) {
          console.error('   (shadowed entries omitted per [slug] routing precedence)');
        }
        console.error('');
      }
    }
  }

  // Also verify no company names contain suspicious modifier tags (e.g. (detailed), (temp))
  const suspiciousModifiers = companies.filter(c => /\((detailed|temp|official|jobs|careers)\)/i.test(c.name));
  if (suspiciousModifiers.length > 0) {
    collisionsFound++;
    console.error('❌ SUSPICIOUS COMPANY NAME MODIFIERS FOUND:');
    suspiciousModifiers.forEach(c => console.error(`   - ${c.name} (slug: /company/${c.slug})`));
    console.error('');
  }

  if (collisionsFound > 0) {
    console.error(`💥 Found ${collisionsFound} slug collision(s) or company naming issue(s)! Please resolve before building.`);
    process.exit(1);
  } else {
    console.log('✅ No slug collisions or company name anomalies found across root routes, jobs, and content.');
  }
}

checkSlugCollisions().catch(err => {
  console.error('Error running collision check:', err);
  process.exit(1);
});
