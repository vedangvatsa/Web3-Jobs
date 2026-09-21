#!/usr/bin/env tsx
/**
 * Site-wide catalog integrity gate.
 * Fails the build if any public page family cannot resolve from local catalogs
 * (the failure mode that caused intermittent production 404s).
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { getJobs } from '../src/lib/jobs';
import { getEvents, getEventBySlug } from '../src/lib/events-server';
import { getAllTerms, getTerm } from '../src/lib/glossary';
import { getCompanies, getCompanyBySlug } from '../src/lib/companies';
import { getArticle } from '../src/lib/articles';
import { getResourceByCanonicalSlug } from '../src/lib/pseo/resources';
import { getPopupBySlug } from '../src/lib/popups';
import { fetchJobBySlug } from '../src/lib/job-by-slug-record';
import { JOB_SHARD_COUNT } from '../src/lib/job-shards';
import { getNewsFeed } from '../src/lib/news';
import { findLocalDir, findLocalFile } from '../src/lib/catalog-fs';

type SlugTypes = {
  events?: string[];
  companies?: string[];
  glossary?: string[];
  resources?: string[];
  articles?: string[];
  popups?: string[];
};

function sample<T>(items: T[], count: number): T[] {
  if (items.length <= count) return items;
  const out: T[] = [];
  const step = Math.max(1, Math.floor(items.length / count));
  for (let i = 0; i < items.length && out.length < count; i += step) {
    out.push(items[i]!);
  }
  return out;
}

function requireFile(rel: string): void {
  assert.ok(findLocalFile(...rel.split('/')) || fs.existsSync(path.join(process.cwd(), rel)), `missing ${rel}`);
}

function requireDir(rel: string): void {
  assert.ok(findLocalDir(...rel.split('/')) || fs.existsSync(path.join(process.cwd(), rel)), `missing dir ${rel}`);
}

async function main() {
  const slugTypes = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'content/slug-types.json'), 'utf8'),
  ) as SlugTypes;

  // --- Required on-disk catalogs (standalone / FAH) ---
  for (const file of [
    'content/jobs-runtime.json',
    'content/events-runtime.json',
    'content/glossary-runtime.json',
    'content/companies-runtime.json',
    'content/company-profiles-runtime.json',
    'content/articles-index.json',
    'content/news-cache.json',
    'content/homepage-jobs.json',
    'content/learn-runtime.json',
    'content/pseo-resources-runtime.json',
    'public/data/jobs-runtime.json',
    'public/data/events-runtime.json',
    'public/data/glossary-runtime.json',
  ]) {
    requireFile(file);
  }

  requireDir('content/job-shards');
  requireDir('content/job-description-shards');
  requireDir('public/articles-data');
  requireDir('content/articles');

  const jobShards = fs
    .readdirSync(path.join(process.cwd(), 'content/job-shards'))
    .filter((n) => /^job-shard-\d{2}\.json$/.test(n));
  assert.equal(jobShards.length, JOB_SHARD_COUNT, `job shards: expected ${JOB_SHARD_COUNT}, got ${jobShards.length}`);

  const descShards = fs
    .readdirSync(path.join(process.cwd(), 'content/job-description-shards'))
    .filter((n) => /^job-descriptions-\d{2}\.json$/.test(n));
  assert.equal(descShards.length, 64, `description shards: expected 64, got ${descShards.length}`);

  const articleDataCount = fs
    .readdirSync(path.join(process.cwd(), 'public/articles-data'))
    .filter((n) => n.endsWith('.json')).length;
  const articleIndex = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'content/articles-index.json'), 'utf8'),
  ) as unknown[];
  assert.ok(Array.isArray(articleIndex) && articleIndex.length > 0, 'articles-index empty');
  assert.ok(
    articleDataCount >= Math.min(articleIndex.length, 50),
    `articles-data too thin: ${articleDataCount} files vs index ${articleIndex.length}`,
  );

  // --- Runtime loaders must succeed (throw ≠ soft 404) ---
  const jobs = await getJobs();
  const events = await getEvents();
  const terms = await getAllTerms();
  const companies = await getCompanies();
  const news = await getNewsFeed();
  assert.ok(jobs.length > 100, `jobs catalog too small: ${jobs.length}`);
  assert.ok(events.length > 10, `events catalog too small: ${events.length}`);
  assert.ok(terms.length > 10, `glossary catalog too small: ${terms.length}`);
  assert.ok(companies.length > 10, `companies catalog too small: ${companies.length}`);
  assert.ok(Array.isArray(news), 'news catalog must load');

  const missing: string[] = [];

  for (const slug of sample(slugTypes.events ?? [], 25)) {
    if (!(await getEventBySlug(slug))) missing.push(`event:${slug}`);
  }
  for (const slug of sample(slugTypes.companies ?? [], 25)) {
    if (!(await getCompanyBySlug(slug))) missing.push(`company:${slug}`);
  }
  for (const slug of sample(slugTypes.glossary ?? [], 25)) {
    if (!(await getTerm(slug))) missing.push(`glossary:${slug}`);
  }
  for (const slug of sample(slugTypes.resources ?? [], 20)) {
    if (!getResourceByCanonicalSlug(slug)) missing.push(`resource:${slug}`);
  }
  for (const slug of sample(slugTypes.popups ?? [], 15)) {
    if (!getPopupBySlug(slug)) missing.push(`popup:${slug}`);
  }
  for (const slug of sample(slugTypes.articles ?? [], 25)) {
    if (!(await getArticle(slug))) missing.push(`article:${slug}`);
  }

  const homepage = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'content/homepage-jobs.json'), 'utf8'),
  ) as { initialJobs: Array<{ slug?: string }> };
  for (const job of homepage.initialJobs) {
    const slug = job.slug?.toLowerCase();
    if (!slug) continue;
    if (!(await fetchJobBySlug(slug))) missing.push(`job:${slug}`);
  }
  for (const job of sample(jobs, 40)) {
    const slug = job.slug?.toLowerCase();
    if (!slug) continue;
    if (!(await fetchJobBySlug(slug))) missing.push(`job:${slug}`);
  }

  assert.equal(
    missing.length,
    0,
    `Unresolved public slugs (would 404 in production):\n${missing.slice(0, 40).join('\n')}${
      missing.length > 40 ? `\n…and ${missing.length - 40} more` : ''
    }`,
  );

  console.log(
    `[test-site-catalog-integrity] OK — jobs=${jobs.length} events=${events.length} glossary=${terms.length} companies=${companies.length} articles-data=${articleDataCount}`,
  );
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
