/**
 * Assign job slugs in content/jobs-cache.json (keyword + collision suffix).
 *
 * Usage: npx tsx scripts/assign-job-slugs.ts
 */
import path from 'path';
import { assignJobSlugsInCacheFile } from './lib/job-slug-assignment';

const cachePath = path.join(process.cwd(), 'content/jobs-cache.json');

const { jobCount, legacyEntriesAdded } = assignJobSlugsInCacheFile(cachePath);
console.log(
  `Assigned slugs for ${jobCount} jobs${legacyEntriesAdded ? ` (${legacyEntriesAdded} legacy aliases)` : ''}.`,
);
