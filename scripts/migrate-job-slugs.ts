#!/usr/bin/env node

/**
 * Persists the job slugs that were previously computed at read time.
 *
 * Run once before changing the slug algorithm so already-published job URLs
 * remain stable. Future refreshes retain these stored slugs and assign a
 * deterministic slug only to newly discovered jobs.
 */
import fs from 'fs';
import path from 'path';
import { getJobs } from '../src/lib/jobs';

type CachedJob = {
  id: string;
  title: string;
  company: string;
  link: string;
  date: string;
  source: string;
  slug?: string;
};

function exactKey(job: Pick<CachedJob, 'id' | 'title' | 'company' | 'link'>): string {
  return [job.id, job.title, job.company, job.link]
    .map((value) => value.trim().toLowerCase())
    .join('|');
}

function identityKey(job: Pick<CachedJob, 'id' | 'company' | 'link'>): string {
  return [job.id, job.company, job.link]
    .map((value) => value.trim().toLowerCase())
    .join('|');
}

async function main() {
  const cachePath = path.join(process.cwd(), 'content/jobs-cache.json');
  const cachedJobs = JSON.parse(fs.readFileSync(cachePath, 'utf8')) as CachedJob[];
  const publishedJobs = await getJobs();
  const publishedSlugs = new Map(
    publishedJobs.map((job) => [exactKey(job), job.slug]).filter((entry): entry is [string, string] => Boolean(entry[1]))
  );
  const identitySlugs = new Map(
    publishedJobs.map((job) => [identityKey(job), job.slug]).filter((entry): entry is [string, string] => Boolean(entry[1]))
  );

  let migrated = 0;
  const nextCache = cachedJobs.map((job) => {
    if (job.slug) return job;
    const slug = publishedSlugs.get(exactKey(job)) ?? identitySlugs.get(identityKey(job));
    if (!slug) return job;
    migrated += 1;
    return { ...job, slug };
  });

  fs.writeFileSync(cachePath, `${JSON.stringify(nextCache, null, 2)}\n`);
  console.log(`Persisted ${migrated} existing job slugs.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
