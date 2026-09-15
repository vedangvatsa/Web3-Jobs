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

/** Read cache, assign exclusive slugs, persist cache + legacy redirects when anything changed. */
export function assignJobSlugsInCacheFile(cachePath: string): {
  jobCount: number;
  legacyEntriesAdded: number;
  reminted: number;
  wrote: boolean;
} {
  const raw = fs.readFileSync(cachePath, 'utf-8');
  const jobs = JSON.parse(raw) as Job[];
  const beforeByIdentity = new Map(jobs.map((job) => [getJobIdentity(job), job.slug || '']));
  const archive = loadJobLegacyArchive();
  const reservedRoot = loadReservedRootSlugsSync();
  const legacyEntriesAdded = assignJobSlugsAndSyncLegacyArchive(jobs, archive, reservedRoot);
  const reminted = jobs.filter(
    (job) => (job.slug || '') !== (beforeByIdentity.get(getJobIdentity(job)) || ''),
  ).length;
  const wrote = reminted > 0;
  if (wrote) {
    jobs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    fs.writeFileSync(cachePath, `${JSON.stringify(jobs, null, 2)}\n`);
  }
  if (legacyEntriesAdded > 0) {
    writeJobLegacyArchive(archive);
    console.log(`  ${legacyEntriesAdded} retired job slug(s) added to legacy archive`);
  }
  return { jobCount: jobs.length, legacyEntriesAdded, reminted, wrote };
}
