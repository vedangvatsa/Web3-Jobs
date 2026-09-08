import fs from 'fs';
import path from 'path';
import { getAllArticles } from '../src/lib/articles';
import { getAllTerms } from '../src/lib/glossary';
import { getAllResourcePages } from '../src/lib/pseo';
import { getCompanies } from '../src/lib/companies';
import { getEvents } from '../src/lib/events-server';
import { getAllJobsWithSlugs } from '../src/lib/job-guides';

// Static top-level routes built into src/app
const STATIC_APP_ROUTES = [
  'jobs', 'blog', 'glossary', 'companies', 'community', 'learn', 'news',
  'developers', 'api-docs', 'docs', 'auth', 'api-policy', 'resources',
  'events', 'contact', 'privacy', 'ask', 'mcp', 'developer', 'dev'
];

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
  events.forEach(e => {
    const slug = e.slug || e.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    register(slug, 'Event', e.name);
  });
  jobs.forEach(j => register(j.slug, 'Job Post', `${j.job.title} at ${j.job.company}`));

  let collisionsFound = 0;
  for (const [slug, entries] of slugMap.entries()) {
    if (entries.length > 1) {
      // Ignore identical entry duplicates of the exact same type if any
      const types = new Set(entries.map(e => e.type));
      if (types.size > 1) {
        collisionsFound++;
        console.error(`❌ SLUG COLLISION [/${slug}]:`);
        entries.forEach(e => console.error(`   - (${e.type}) ${e.title}`));
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
    console.log('✅ No slug collisions or company name anomalies found across Glossary, Articles, Resources, Companies, or Events.');
  }
}

checkSlugCollisions().catch(err => {
  console.error('Error running collision check:', err);
  process.exit(1);
});
