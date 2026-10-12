import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import type { Job } from '../src/types';
import { getJobIdentity, getJobContentKey } from '../src/lib/job-slugs';
import { hasRequiredJobDateProvenance } from '../src/lib/job-source-date';
import { isJobAgeEligible } from '../src/lib/job-age-policy.mjs';
import { isExpiredJobPath } from '../src/lib/job-age-path';
import { readJobDescriptionStore } from './lib/job-description-store';

const auditRoot = process.argv[2];
if (!auditRoot) throw new Error('Pass the completed audit directory');
const read = <T,>(file: string): T => JSON.parse(fs.readFileSync(file, 'utf8'));
const audit = read<{ records: Array<Job & { state: string; reason: string; identity: string }> }>(path.join(auditRoot, 'report.json'));
const cleanup = read<{ removed: Array<{ slug: string; id: string; link: string; date: string; reason: string }> }>('content/job-application-cleanup-report.json');
const cache = read<Job[]>('content/jobs-cache.json');
const runtime = read<Job[]>('content/jobs-runtime.json');
const byIdentity = new Map(cache.map(job => [getJobIdentity(job), job]));
const excluded = new Set(cleanup.removed.map(record => getJobIdentity(record as Job)));
const preservedStates: Record<string, number> = {};
for (const row of audit.records) {
  const current = byIdentity.get(row.identity);
  if (excluded.has(row.identity)) { assert.equal(current, undefined); continue; }
  assert.ok(current, `Unrelated audit record removed: ${row.slug} (${row.reason})`);
  assert.equal(current.slug, row.slug);
  assert.equal(current.id, row.id);
  assert.equal(current.link, row.link);
  if (!row.identity.startsWith('breezy:')) assert.equal(current.date, row.date);
  preservedStates[row.state] = (preservedStates[row.state] || 0) + 1;
}
const descriptions = readJobDescriptionStore();
for (const row of cleanup.removed) {
  assert.equal(descriptions.descriptions[getJobContentKey(row as Job)], undefined);
  assert.equal(isExpiredJobPath(`/${row.slug}`), true);
  assert.equal(fs.existsSync(`public/preview/${row.slug}.html`), false);
}
assert.equal(runtime.length, cache.length);
assert.ok(runtime.every(job => isJobAgeEligible(job) && hasRequiredJobDateProvenance(job)));
assert.deepEqual(read<Job[]>('public/data/jobs-runtime.json'), runtime);
const library = read<Array<{ slug: string; snapshot?: Pick<Job, 'id' | 'company' | 'title' | 'link'> }>>('scripts/social/job-video-library.json');
const obsoleteVideos = library.filter(video => !video.snapshot || !byIdentity.has(getJobIdentity(video.snapshot))).map(video => ({ slug: video.slug, identity: video.snapshot ? getJobIdentity(video.snapshot) : null }));
const result = { checkedAt: new Date().toISOString(), initialJobs: audit.records.length, remainingJobs: cache.length, removedJobs: cleanup.removed.length, companies: Object.keys(read<Record<string, unknown>>('content/companies-runtime.json')).length, preservedAuditStates: preservedStates, keptBreezy: cache.filter(job => getJobIdentity(job).startsWith('breezy:')).length, videoLibrary: { rows: library.length, obsoleteSnapshots: obsoleteVideos.length, obsolete: obsoleteVideos } };
fs.writeFileSync('content/job-primary-audit-verification.json', `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ ...result, videoLibrary: { rows: library.length, obsoleteSnapshots: obsoleteVideos.length } }, null, 2));
