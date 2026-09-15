import fs from 'fs';
import path from 'path';
import { getAllArticles } from '../src/lib/articles';
import { getAllTerms } from '../src/lib/glossary';
import { getAllResourcePages } from '../src/lib/pseo';
import { getCompanies } from '../src/lib/companies';
import { getEvents } from '../src/lib/events-server';
import { getEventSlug } from '../src/lib/events';
import { getAllJobsWithSlugs, getLegacyJobSlugs } from '../src/lib/job-guides';
import { RESERVED_APP_ROUTE_SLUGS } from '../src/lib/reserved-root-slugs';
import { applySlugRoutingPrecedence } from '../src/lib/slug-routing-precedence';

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

  RESERVED_APP_ROUTE_SLUGS.forEach((r) => register(r, 'Built-in App Route', `/${r}`));
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
    const effective = applySlugRoutingPrecedence(slug, entries);
    const jobPosts = effective.filter((e) => e.type === 'Job Post');
    const types = new Set(effective.map((e) => e.type));
    const jobShadowed = jobPosts.length > 0 && (effective.length > jobPosts.length || jobPosts.length > 1);
    const mixedTypes = types.size > 1;
    if (jobShadowed || mixedTypes || jobPosts.length > 1) {
      collisionsFound++;
      console.error(`❌ SLUG COLLISION [/${slug}]:`);
      effective.forEach((e) => console.error(`   - (${e.type}) ${e.title}`));
      if (jobPosts.length > 0 && effective.length > jobPosts.length) {
        console.error('   Job posts must have an exclusive root URL (no shadowing).');
      }
      console.error('');
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
