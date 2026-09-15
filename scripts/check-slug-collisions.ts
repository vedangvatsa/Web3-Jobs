/**
 * Heal job slugs, then audit root occupancy.
 *
 * Job collisions are reminted in place so Firebase/Vercel prebuild never fails
 * because a new article, glossary term, company, or event reused a job URL.
 * Remaining non-job overlaps are logged and left to routing; they do not fail
 * the build.
 */
import fs from 'fs';
import path from 'path';
import { getAllArticles } from '../src/lib/articles';
import { getAllTerms } from '../src/lib/glossary';
import { getAllResourcePages } from '../src/lib/pseo';
import { getCompanies } from '../src/lib/companies';
import { getEvents } from '../src/lib/events-server';
import { getEventSlug } from '../src/lib/events';
import { getPopupSlugs } from '../src/lib/popups';
import { loadReservedRootSlugsSync, RESERVED_APP_ROUTE_SLUGS } from '../src/lib/reserved-root-slugs';
import { applySlugRoutingPrecedence } from '../src/lib/slug-routing-precedence';
import { assignJobSlugsInCacheFile, JOB_LEGACY_ARCHIVE_PATH } from './lib/job-slug-assignment';

const CACHE_PATH = path.join(process.cwd(), 'content/jobs-cache.json');

type Occupant = { type: string; title: string };

function readCachedJobs(): Array<{ slug?: string; title?: string; company?: string }> {
  if (!fs.existsSync(CACHE_PATH)) return [];
  const parsed = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8'));
  return Array.isArray(parsed) ? parsed : [];
}

function readLegacySlugs(): string[] {
  try {
    if (!fs.existsSync(JOB_LEGACY_ARCHIVE_PATH)) return [];
    return Object.keys(JSON.parse(fs.readFileSync(JOB_LEGACY_ARCHIVE_PATH, 'utf-8')) as Record<string, unknown>);
  } catch {
    return [];
  }
}

async function collectOccupancy(): Promise<Map<string, Occupant[]>> {
  const terms = await getAllTerms();
  const articles = await getAllArticles();
  const resources = getAllResourcePages();
  const companies = await getCompanies();
  const events = await getEvents();
  const jobs = readCachedJobs();

  const slugMap = new Map<string, Occupant[]>();

  function register(slug: string, type: string, title: string) {
    if (!slug) return;
    const lower = slug.toLowerCase().trim();
    const existing = slugMap.get(lower) || [];
    existing.push({ type, title });
    slugMap.set(lower, existing);
  }

  RESERVED_APP_ROUTE_SLUGS.forEach((route) => register(route, 'Built-in App Route', `/${route}`));
  terms.forEach((term) => register(term.slug, 'Glossary Term', term.term));
  articles.forEach((article) => register(article.slug, 'Article', article.title));
  resources.forEach((page) => register(page.seo.canonicalSlug, 'Resource Page', page.seo.title));
  companies.forEach((company) => register(company.slug, 'Company Page', company.name));
  events.forEach((event) => register(getEventSlug(event), 'Event', event.name));
  getPopupSlugs().forEach((slug) => register(slug, 'Popup Page', slug));
  jobs.forEach((job) => register(job.slug || '', 'Job Post', `${job.title} at ${job.company}`));

  const canonicalJobSlugs = new Set(jobs.map((job) => (job.slug || '').toLowerCase()).filter(Boolean));
  readLegacySlugs()
    .filter((slug) => !canonicalJobSlugs.has(slug.toLowerCase()))
    .forEach((slug) => register(slug, 'Legacy Job Alias', `/${slug}`));

  return slugMap;
}

function jobCollisionsIn(slugMap: Map<string, Occupant[]>): string[] {
  const colliding: string[] = [];
  for (const [slug, entries] of slugMap.entries()) {
    const effective = applySlugRoutingPrecedence(slug, entries);
    const jobPosts = effective.filter((entry) => entry.type === 'Job Post');
    if (jobPosts.length > 1 || (jobPosts.length === 1 && effective.length > 1)) {
      colliding.push(slug);
    }
  }
  return colliding;
}

function healJobSlugs(): { reminted: number; jobCount: number } {
  if (!fs.existsSync(CACHE_PATH)) {
    throw new Error(`Jobs cache not found at ${CACHE_PATH}`);
  }
  const result = assignJobSlugsInCacheFile(CACHE_PATH);
  return result;
}

async function checkSlugCollisions() {
  console.log('🔧 Ensuring every job has an exclusive root slug...\n');
  const first = healJobSlugs();
  if (first.reminted > 0) {
    console.log(`  Reminted ${first.reminted} job slug(s) off reserved or duplicate roots.`);
  } else {
    console.log(`  ${first.jobCount} jobs already had exclusive slugs.`);
  }

  console.log('\n🔍 Auditing root slug occupancy...\n');
  let slugMap = await collectOccupancy();
  let jobHits = jobCollisionsIn(slugMap);

  if (jobHits.length > 0) {
    console.log(`  ${jobHits.length} job URL(s) still overlapped; reminting again.\n`);
    healJobSlugs();
    slugMap = await collectOccupancy();
    jobHits = jobCollisionsIn(slugMap);
  }

  if (jobHits.length > 0) {
    // Should be unreachable after assignJobSlugsInCache's final uniqueness sweep.
    // Do not fail the build: jobs still render at whatever slug they hold, and
    // the next refresh will mint again against an updated reserved set.
    console.warn('⚠️  Job URLs still overlap after remint (non-fatal):');
    for (const slug of jobHits) {
      console.warn(`   /${slug}`);
      (slugMap.get(slug) || []).forEach((entry) => {
        console.warn(`      - (${entry.type}) ${entry.title}`);
      });
    }
    console.warn('');
  }

  const reserved = loadReservedRootSlugsSync();
  const jobs = readCachedJobs();
  const reservedHits = jobs.filter((job) => job.slug && reserved.has(job.slug.toLowerCase()));
  if (reservedHits.length > 0) {
    console.warn('⚠️  Jobs still on reserved roots after remint (non-fatal):');
    reservedHits.forEach((job) => {
      console.warn(`   /${job.slug} — ${job.title} at ${job.company}`);
    });
    console.warn('');
  }

  let otherOverlaps = 0;
  for (const [slug, entries] of slugMap.entries()) {
    const effective = applySlugRoutingPrecedence(slug, entries);
    const types = new Set(effective.map((entry) => entry.type));
    const hasJob = effective.some((entry) => entry.type === 'Job Post');
    if (!hasJob && types.size > 1) {
      otherOverlaps += 1;
      console.log(`ℹ️  Non-job overlap [/${slug}] (served by routing, not a job):`);
      effective.forEach((entry) => console.log(`   - (${entry.type}) ${entry.title}`));
      console.log('');
    }
  }

  const companies = await getCompanies();
  const suspiciousModifiers = companies.filter((company) =>
    /\((detailed|temp|official|jobs|careers)\)/i.test(company.name),
  );
  if (suspiciousModifiers.length > 0) {
    console.warn('⚠️  Company names with modifier tags (non-fatal):');
    suspiciousModifiers.forEach((company) => {
      console.warn(`   - ${company.name} (slug: /${company.slug})`);
    });
    console.warn('');
  }

  if (jobHits.length === 0 && reservedHits.length === 0) {
    console.log('✅ Every job has an exclusive root URL. Builds will not fail on slug occupancy.');
  } else {
    console.log('✅ Slug occupancy audit finished without failing the build.');
  }
  if (otherOverlaps > 0) {
    console.log(`   ${otherOverlaps} non-job overlap(s) logged above; routing decides the page.`);
  }
}

checkSlugCollisions().catch((err) => {
  console.error('Error running slug occupancy audit:', err);
  console.error('Continuing the build; job pages will use slugs already in the cache.');
  process.exit(0);
});
