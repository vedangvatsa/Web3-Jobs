/**
 * Seeds .telegram-job-urls-*.json from posted job IDs + cache + legacy archive
 * so verify-telegram-job-urls can audit slugs that may already be on Telegram.
 *
 * Usage: npx tsx scripts/backfill-telegram-job-url-log.ts
 */
import fs from 'fs';
import path from 'path';
import type { Job } from '../src/types';
import { loadJobLegacyArchive } from './lib/job-slug-assignment';

const root = process.cwd();
const cachePath = path.join(root, 'content/jobs-cache.json');

function loadPostedIds(): Map<string, string> {
  /** channelSlug -> posted log path */
  const map = new Map<string, string>();
  for (const name of fs.readdirSync(root)) {
    const m = name.match(/^\.telegram-posted-(?!last-)(.+)\.json$/);
    if (!m) continue;
    map.set(m[1], path.join(root, name));
  }
  return map;
}

function slugsForJobId(
  jobKey: string,
  jobs: Job[],
  archive: Record<string, { id?: string; link?: string }>,
): string[] {
  const found = new Set<string>();
  const job = jobs.find((j) => j.id === jobKey || j.link === jobKey);
  if (job?.slug) found.add(job.slug);

  for (const [slug, entry] of Object.entries(archive)) {
    if (!entry) continue;
    if (entry.id === jobKey || (job?.link && entry.link === job.link)) {
      found.add(slug);
    }
  }
  return [...found];
}

function main() {
  const jobs = JSON.parse(fs.readFileSync(cachePath, 'utf-8')) as Job[];
  const archive = loadJobLegacyArchive();
  const channels = loadPostedIds();
  let updated = 0;

  for (const [channelSlug, postedPath] of channels) {
    const urlLogPath = path.join(root, `.telegram-job-urls-${channelSlug}.json`);
    let urlLog: Record<string, { slugs: string[]; lastSlug?: string; lastUrl?: string; updatedAt?: string }> = {};
    try {
      urlLog = JSON.parse(fs.readFileSync(urlLogPath, 'utf-8'));
    } catch {
      urlLog = {};
    }

    const posted: string[] = JSON.parse(fs.readFileSync(postedPath, 'utf-8'));
    for (const jobKey of posted) {
      const slugs = slugsForJobId(jobKey, jobs, archive);
      if (slugs.length === 0) continue;
      const prior = urlLog[jobKey]?.slugs || [];
      const merged = [...new Set([...prior, ...slugs])];
      const lastSlug = merged[merged.length - 1];
      urlLog[jobKey] = {
        slugs: merged,
        lastSlug,
        lastUrl: `https://hashtagweb3.com/${lastSlug}`,
        updatedAt: urlLog[jobKey]?.updatedAt || new Date().toISOString(),
      };
      updated += 1;
    }

    fs.writeFileSync(urlLogPath, `${JSON.stringify(urlLog, null, 2)}\n`);
    console.log(`  ${channelSlug}: ${posted.length} posted keys, url log ${Object.keys(urlLog).length} entries`);
  }

  console.log(`\n✅ Backfill touched ${updated} posted job key(s).`);
}

main();
