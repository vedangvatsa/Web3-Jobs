import fs from 'fs';
import path from 'path';
import {
  assignJobSlugsAndSyncLegacyArchive,
  getJobIdentity,
  type LegacySlugRecord,
} from '../../src/lib/job-slugs';
import { loadReservedRootSlugsSync } from '../../src/lib/reserved-root-slugs';
import type { Job } from '../../src/types';

export const JOB_LEGACY_ARCHIVE_PATH = path.join(
  process.cwd(),
  'content/legacy-slugs-archive.json',
);

export function loadJobLegacyArchive(): Record<string, LegacySlugRecord> {
  try {
    if (fs.existsSync(JOB_LEGACY_ARCHIVE_PATH)) {
      return JSON.parse(fs.readFileSync(JOB_LEGACY_ARCHIVE_PATH, 'utf-8')) as Record<
        string,
        LegacySlugRecord
      >;
    }
  } catch (err) {
    console.warn('[legacy-slugs-archive] Could not read archive:', err);
  }
  return {};
}

export function writeJobLegacyArchive(archive: Record<string, LegacySlugRecord>): void {
  fs.writeFileSync(JOB_LEGACY_ARCHIVE_PATH, `${JSON.stringify(archive, null, 2)}\n`);
}

import { execSync } from 'child_process';

/** Read cache, assign exclusive slugs, persist cache + legacy redirects when anything changed. */
export function assignJobSlugsInCacheFile(cachePath: string): {
  jobCount: number;
  legacyEntriesAdded: number;
  reminted: number;
  wrote: boolean;
} {
  const raw = fs.readFileSync(cachePath, 'utf-8');
  let jobs = JSON.parse(raw) as Job[];

  // Deduplicate by source-stable identity to eliminate feed collisions
  const seenIdentities = new Set<string>();
  jobs = jobs.filter((job) => {
    const id = getJobIdentity(job);
    if (!id || seenIdentities.has(id)) return false;
    seenIdentities.add(id);
    return true;
  });

  const archive = loadJobLegacyArchive();
  const reservedRoot = loadReservedRootSlugsSync();
  const curIdentities = new Set(jobs.map((job) => getJobIdentity(job)));

  // Preserve stable slugs from git HEAD and retire vanished jobs into legacy archive
  let headRetiredCount = 0;
  try {
    const headRaw = execSync('git show HEAD:content/jobs-cache.json', {
      maxBuffer: 128 * 1024 * 1024,
      cwd: process.cwd(),
    }).toString('utf-8');
    const headJobs = JSON.parse(headRaw) as Job[];
    const headSlugByIdentity = new Map<string, string>();
    for (const hj of headJobs) {
      if (hj && hj.slug && !hj.slug.startsWith('role')) {
        const id = getJobIdentity(hj);
        headSlugByIdentity.set(id, hj.slug);
        // If this job is no longer in the active cache, retire its slug
        if (!curIdentities.has(id) && !archive[hj.slug] && !reservedRoot.has(hj.slug.toLowerCase())) {
          archive[hj.slug] = {
            id: hj.id,
            link: hj.link,
            company: hj.company,
            title: hj.title,
          };
          headRetiredCount += 1;
        }
      }
    }
    for (const job of jobs) {
      const prevSlug = headSlugByIdentity.get(getJobIdentity(job));
      if (prevSlug) {
        job.slug = prevSlug;
      } else {
        job.slug = '';
      }
    }
  } catch {
    // Git HEAD unavailable; keep existing job.slug
  }

  const beforeByIdentity = new Map(jobs.map((job) => [getJobIdentity(job), job.slug || '']));
  const legacyEntriesAdded = assignJobSlugsAndSyncLegacyArchive(jobs, archive, reservedRoot);
  const reminted = jobs.filter(
    (job) => (job.slug || '') !== (beforeByIdentity.get(getJobIdentity(job)) || ''),
  ).length;
  const wrote = reminted > 0 || jobs.length !== (JSON.parse(raw) as Job[]).length;
  if (wrote) {
    jobs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    fs.writeFileSync(cachePath, `${JSON.stringify(jobs, null, 2)}\n`);
  }
  if (legacyEntriesAdded > 0 || headRetiredCount > 0) {
    writeJobLegacyArchive(archive);
    console.log(`  ${legacyEntriesAdded + headRetiredCount} retired job slug(s) added to legacy archive`);
  }
  return { jobCount: jobs.length, legacyEntriesAdded: legacyEntriesAdded + headRetiredCount, reminted, wrote };
}
