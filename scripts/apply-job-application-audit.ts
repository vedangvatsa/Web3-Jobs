import fs from 'node:fs';
import assert from 'node:assert/strict';
import type { Job } from '../src/types';
import type { ApplicationAudit } from './audit-job-applications';
import type { RemovedJobListing } from '../src/lib/job-source-policy';
import { getJobIdentity, normalizeJobLink } from '../src/lib/job-slugs';
import { resolveJobLocation } from '../src/lib/job-location';
import { loadReservedRootSlugsSync } from '../src/lib/reserved-root-slugs';
import { applicationAuditSubjects } from './lib/job-application-subjects';

const audit = JSON.parse(fs.readFileSync('.cache/job-applications/audit.json', 'utf8')) as { checkedAt: string; results: ApplicationAudit[] };
assert.ok(Date.now() - Date.parse(audit.checkedAt) < 24 * 3600000, 'Application audit is stale');
const results = new Map(audit.results.map(result => [result.identity, result]));
const jobs = JSON.parse(fs.readFileSync('content/jobs-cache.json', 'utf8')) as Array<Job & { applyUrl?: string }>;
const removed = JSON.parse(fs.readFileSync('content/removed-job-listings.json', 'utf8')) as Record<string, RemovedJobListing>;
const archive = JSON.parse(fs.readFileSync('content/legacy-slugs-archive.json', 'utf8')) as Record<string, Job & { retiredReason?: string }>;
const locationChanges: Array<{ slug?: string; title: string; before?: string; after: string; evidence: string }> = [];
const missingAudit: string[] = [];
const subjects = applicationAuditSubjects();
for (const job of subjects) {
  const identity = getJobIdentity(job), result = results.get(identity);
  if (!result || !['not-found', 'closed'].includes(result.status) || removed[identity]?.reason === 'removed-by-owner') continue;
  assert.ok(job.slug);
  removed[identity] = { slug: job.slug!, link: job.link, reason: result.status === 'not-found' ? 'application-not-found' : 'application-closed', evidence: result.evidence, checkedAt: result.checkedAt };
}
const updated = jobs.map(job => {
  const identity = getJobIdentity(job), result = results.get(identity);
  if (!result) { missingAudit.push(job.slug || identity); return job; }
  assert.equal(normalizeJobLink(job.applyUrl || job.link), normalizeJobLink(result.url), `Application URL changed since audit: ${job.slug}`);
  if (['not-found', 'closed'].includes(result.status) && removed[identity]?.reason !== 'removed-by-owner') {
    assert.ok(job.slug);
    const aliases = Object.entries(archive).filter(([slug, record]) => slug !== job.slug && getJobIdentity(record) === identity).map(([slug]) => slug);
    removed[identity] = { slug: job.slug!, link: job.link, reason: result.status === 'not-found' ? 'application-not-found' : 'application-closed', evidence: result.evidence, checkedAt: result.checkedAt, ...(aliases.length && { aliases }) };
  }
  if (removed[identity]) return job;
  const next = { ...job };
  if (result.status === 'open') {
    if (result.location) next.location = result.location;
    if (result.isRemote !== undefined) next.isRemote = result.isRemote;
    if (result.workplaceType) next.workplaceType = result.workplaceType;
  }
  next.location = resolveJobLocation(next);
  if (next.location !== job.location) locationChanges.push({ slug: job.slug, title: job.title, before: job.location, after: next.location, evidence: result.status === 'open' ? result.evidence : 'Explicit work arrangement in the existing title/location' });
  return next;
});
assert.deepEqual(missingAudit, [], 'Every active listing must be covered before applying');
const removedJobs = jobs.filter(job => removed[getJobIdentity(job)]);
const protectedSlugs = loadReservedRootSlugsSync();
const activeBySlug = new Map(jobs.filter(job => !removed[getJobIdentity(job)]).map(job => [job.slug, getJobIdentity(job)]));
for (const [identity, record] of Object.entries(removed)) {
  const aliases = Object.entries(archive).filter(([slug, archived]) => slug !== record.slug && getJobIdentity(archived) === identity).map(([slug]) => slug);
  if (aliases.length) record.aliases = aliases;
  record.blockedSlugs = [record.slug, ...aliases].filter(slug => {
    if (protectedSlugs.has(slug) || activeBySlug.has(slug)) return false;
    const original = archive[slug];
    return !original || getJobIdentity(original) === identity || Boolean(original.retiredReason || removed[getJobIdentity(original)]);
  });
}
const unverified = audit.results.filter(result => result.status === 'unverified' && !removed[result.identity]);
const groups: Record<string, number> = {};
for (const result of unverified) { const key = `${new URL(result.url).hostname}: ${result.evidence.match(/HTTP \d+|aborted|fetch failed/)?.[0] || 'content not verified'}`; groups[key] = (groups[key] || 0) + 1; }
const previous = fs.existsSync('content/job-application-audit.json') ? JSON.parse(fs.readFileSync('content/job-application-audit.json', 'utf8')) as { locationChanges?: typeof locationChanges } : {};
const changes = new Map((previous.locationChanges || []).map(change => [change.slug, change]));
for (const change of locationChanges) changes.set(change.slug, { ...change, before: changes.get(change.slug)?.before ?? change.before });
const report = { checkedAt: audit.checkedAt, checked: new Set([...results.keys(), ...Object.keys(removed)]).size, removedActive: removedJobs.length, removedIdentities: Object.keys(removed).length, remainingActive: jobs.length - removedJobs.length, locationChanges: [...changes.values()], unverified, unverifiedByHost: groups };
console.log(JSON.stringify({ checked: report.checked, removedActive: report.removedActive, removedIdentities: report.removedIdentities, remainingActive: report.remainingActive, ...(process.argv.includes('--verbose') && { removedJobs: Object.values(removed) }), newLocationChanges: locationChanges.length, totalLocationChanges: report.locationChanges.length, examples: locationChanges.slice(0, 12), hungaryExample: report.locationChanges.find(item => item.slug === 'it3'), unverified: unverified.length, unverifiedByHost: groups }, null, 2));
if (process.argv.includes('--apply')) {
  fs.writeFileSync('content/removed-job-listings.json', `${JSON.stringify(removed, null, 2)}\n`);
  fs.writeFileSync('content/jobs-cache.json', `${JSON.stringify(updated, null, 2)}\n`);
  fs.writeFileSync('content/job-application-audit.json', `${JSON.stringify(report, null, 2)}\n`);
  console.log('Saved source exclusions, location corrections and audit evidence. Run the retirement/prebuild pipeline next.');
}
