/**
 * slug-router.ts
 *
 * Builds a single in-process slug→content-type map on first access.
 * Replaces the sequential waterfall of 6 async lookups in [slug]/page.tsx
 * with a single O(1) Map.get() to determine what kind of content a slug is.
 *
 * Without this, every cache-MISS page request runs:
 *   getCompanyBySlug → getEventBySlug → getResourceByCanonicalSlug
 *   → getJobBySlug → getTerm → getArticle
 * all sequentially (and twice: once in generateMetadata, once in the page fn).
 */

'use server';

import { getAllArticles } from './articles';
import { getAllTerms } from './glossary';
import { getAllResourcePages } from './pseo';
import { getEvents } from './events-server';
import { getEventSlug } from './events';
import { getJobs } from './jobs';
import { getJobSlug } from './job-slugs';
import { getCompanies } from './companies';

export type SlugContentType =
  | 'article'
  | 'glossary'
  | 'pseo'
  | 'event'
  | 'job'
  | 'company'
  | null;

let slugIndexCache: Map<string, SlugContentType> | null = null;
let indexBuildPromise: Promise<Map<string, SlugContentType>> | null = null;

async function buildSlugIndex(): Promise<Map<string, SlugContentType>> {
  const t0 = Date.now();
  const index = new Map<string, SlugContentType>();

  const [articles, terms, resources, events, jobs, companies] = await Promise.all([
    getAllArticles(),
    getAllTerms(),
    Promise.resolve(getAllResourcePages()),
    getEvents(),
    getJobs(),
    getCompanies(),
  ]);

  for (const a of articles) index.set(a.slug, 'article');
  for (const t of terms) index.set(t.slug, 'glossary');
  for (const r of resources) index.set(r.seo.canonicalSlug, 'pseo');
  for (const e of events) index.set(getEventSlug(e), 'event');
  for (const j of jobs) {
    const s = getJobSlug(j);
    if (s && !index.has(s)) index.set(s, 'job');
  }
  for (const c of companies) {
    if (!index.has(c.slug)) index.set(c.slug, 'company');
  }

  console.log(`[slug-router] Built index: ${index.size} slugs in ${Date.now() - t0}ms`);
  return index;
}

/**
 * Returns what type of content a slug resolves to, or null if unknown.
 * Built once per server process; all subsequent calls are O(1).
 */
export async function resolveSlugType(slug: string): Promise<SlugContentType> {
  if (slugIndexCache !== null) return slugIndexCache.get(slug) ?? null;

  // Deduplicate concurrent build requests
  if (!indexBuildPromise) {
    indexBuildPromise = buildSlugIndex().then(index => {
      slugIndexCache = index;
      indexBuildPromise = null;
      return index;
    });
  }

  const index = await indexBuildPromise;
  return index.get(slug) ?? null;
}

/**
 * Invalidates the slug index — call after a content update so the index
 * is rebuilt on the next request. Not needed in normal ISR operation.
 */
export function invalidateSlugIndex(): void {
  slugIndexCache = null;
  indexBuildPromise = null;
}
