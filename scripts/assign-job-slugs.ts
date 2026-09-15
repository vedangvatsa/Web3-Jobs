/**
 * Assign job slugs in content/jobs-cache.json (short abbrev + exclusive roots).
 *
 * Usage: npx tsx scripts/assign-job-slugs.ts
 */
import path from 'path';
import { assignJobSlugsInCacheFile } from './lib/job-slug-assignment';

const cachePath = path.join(process.cwd(), 'content/jobs-cache.json');

const { jobCount, legacyEntriesAdded, reminted } = assignJobSlugsInCacheFile(cachePath);
console.log(
  `Assigned slugs for ${jobCount} jobs${reminted ? ` (${reminted} reminted)` : ''}${legacyEntriesAdded ? ` (${legacyEntriesAdded} legacy aliases)` : ''}.`,
);
