import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { gunzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import type { Job } from '../src/types';
import type { RemovedJobListing } from '../src/lib/job-source-policy';
import { getJobIdentity, type LegacySlugRecord } from '../src/lib/job-slugs';
import { extractBreezyPostingDate } from '../src/lib/breezy-posting-date';
import { BREEZY_ORIGINAL_DATE_SOURCE, hasRequiredJobDateProvenance, preserveOriginalJobDate, type JobDateHistory } from '../src/lib/job-source-date';
import { isJobAgeEligible, jobAgeExclusionReason } from '../src/lib/job-age-policy.mjs';

type Observation = { status: number; finalUrl: string; checkedAt: string; reason?: string };
type AuditJob = Job & { identity: string; reason: string; observations: Observation[]; atsEvidence?: { verified: boolean; checkedAt: string; url: string } };
type Hop = Observation & { url: string; method: string; bodyFile?: string; bodySha256?: string };
type DateRecord = Pick<Job, 'date' | 'dateVerified' | 'dateSource' | 'dateEvidence'>;
type DateDifference = { identity: string; slug: string; pageDatePosted: string };

const root = process.argv[2];
if (!root) throw new Error('Pass the completed read-only audit directory, then --apply to write verified corrections');
const read = <T,>(file: string): T => JSON.parse(fs.readFileSync(file, 'utf8'));
const report = read<{ summary: { catalogRecords: number; generatedAt: string }; records: AuditJob[] }>(path.join(root, 'report.json'));
const proposed = read<Record<string, RemovedJobListing>>(path.join(root, 'proposed-removed-job-listings.json'));
const differences = read<DateDifference[]>(path.join(root, 'source-date-discrepancies.json'));
const hops: Hop[] = fs.readFileSync(path.join(root, 'http-hops.jsonl'), 'utf8').trim().split('\n').map(line => JSON.parse(line));
const cache = read<Job[]>('content/jobs-cache.json');
const current = new Map(cache.map(job => [getJobIdentity(job), job]));
const bySlug = new Map(cache.map(job => [job.slug, getJobIdentity(job)]));
const archive = read<Record<string, LegacySlugRecord>>('content/legacy-slugs-archive.json');
const exclusions = read<Record<string, RemovedJobListing>>('content/removed-job-listings.json');
const provenance = read<{ checkedAt: string; records: Record<string, DateRecord>; checks: unknown[] }>('content/job-date-provenance.json');
const history = read<JobDateHistory>('content/job-date-history.json');
const gates = report.records.filter(job => job.reason === 'html-api-conflict');
assert.equal(Object.keys(proposed).length, 8);
assert.equal(gates.length, 5);
assert.equal(differences.length, 16);
assert.equal(report.summary.catalogRecords, 1667);

function bodyFor(hop: Hop): string {
  assert.match(hop.bodyFile || '', /^bodies\/[a-f0-9]+\.gz$/);
  const bytes = gunzipSync(fs.readFileSync(path.join(root, hop.bodyFile!)));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), hop.bodySha256, `Body hash mismatch: ${hop.url}`);
  return bytes.toString('utf8');
}

const linkExclusions: Array<{ identity: string; slug: string; reason: string; applicationState: string; atsState: string }> = [];
for (const record of [...report.records.filter(job => proposed[job.identity]), ...gates]) {
  assert.equal(getJobIdentity(record), record.identity);
  assert.ok(!bySlug.has(record.slug) || bySlug.get(record.slug) === record.identity, `Slug now belongs to another role: ${record.slug}`);
  const gate = record.reason === 'html-api-conflict';
  if (gate) assert.equal(record.atsEvidence?.verified, true);
  const observations = record.observations.slice(-2);
  assert.equal(observations.length, 2);
  assert.ok(Date.parse(observations[1].checkedAt) - Date.parse(observations[0].checkedAt) >= 60000);
  const reason = proposed[record.identity]?.reason || 'application-not-found';
  assert.ok(reason === 'application-not-found' || reason === 'application-closed');
  const evidence = observations.map(observation => {
    const hop = hops.find(hop => hop.url === observation.finalUrl && hop.checkedAt === observation.checkedAt && hop.status === observation.status);
    assert.ok(hop, `Missing original HTTP evidence: ${record.slug}`);
    assert.equal(hop.method, 'GET');
    assert.equal(getJobIdentity({ ...record, link: hop.url }), record.identity);
    if (reason === 'application-not-found') assert.equal(hop.status, 404);
    else {
      assert.equal(hop.status, 200);
      assert.match(bodyFor(hop).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '), /Position Closed.*Sorry, this position is no longer accepting candidates/i);
    }
    return { status: hop.status, checkedAt: hop.checkedAt, finalUrl: observation.finalUrl, ...(hop.bodySha256 && { bodySha256: hop.bodySha256 }) };
  });
  const aliases = Object.entries(archive).filter(([, entry]) => entry.link && getJobIdentity(entry as Job) === record.identity).map(([slug]) => slug);
  const previous = exclusions[record.identity];
  const blockedSlugs = [...new Set([...(previous?.blockedSlugs || []), record.slug!, ...aliases])].filter(slug => !bySlug.has(slug) || bySlug.get(slug) === record.identity);
  exclusions[record.identity] = {
    ...previous, slug: record.slug!, link: record.link, reason,
    evidence: gate
      ? `Application URL returned 404 in two GETs; official Lever API still listed the exact role at ${record.atsEvidence!.checkedAt}. Application link unavailable; job closure is not established.`
      : proposed[record.identity].evidence,
    checkedAt: evidence[1].checkedAt, blockedSlugs,
    aliases: [...new Set([...(previous?.aliases || []), ...aliases])], observations: evidence,
    applicationState: reason === 'application-closed' ? 'closed' : 'unavailable', atsState: gate ? 'active' : 'unknown',
  };
  linkExclusions.push({ identity: record.identity, slug: record.slug!, reason, applicationState: exclusions[record.identity].applicationState!, atsState: exclusions[record.identity].atsState! });
}

let invalidatedApiHistory = 0;
for (const [identity, value] of Object.entries(history)) {
  if (!identity.startsWith('breezy:') || value.dateSource === BREEZY_ORIGINAL_DATE_SOURCE) continue;
  if (value.dateVerified !== false || value.dateSource !== 'Breezy.API-republication-unverified' || value.dateEvidence) invalidatedApiHistory++;
  value.dateVerified = false;
  value.dateSource = 'Breezy.API-republication-unverified';
  delete value.dateEvidence;
}
const dates: Array<{ identity: string; slug: string; oldDate: string; date: string; verified: boolean; eligible: boolean; bodySha256?: string; checkedAt?: string; reason?: string }> = [];
for (const job of report.records.filter(job => getJobIdentity(job).startsWith('breezy:'))) {
  const hop = hops.filter(hop => hop.status === 200 && hop.bodyFile && getJobIdentity({ ...job, link: hop.url }) === job.identity).at(-1);
  const html = hop ? bodyFor(hop) : '';
  const verified = hop ? extractBreezyPostingDate(job, html, { url: hop.url, checkedAt: hop.checkedAt, bodySha256: hop.bodySha256! }) : null;
  const correction: DateRecord = verified
    ? { date: verified.date, dateVerified: true, dateSource: verified.dateSource, dateEvidence: verified.dateEvidence }
    : { date: '', dateVerified: false, dateSource: 'Breezy.primary-date-unverified', ...(hop && { dateEvidence: { provider: 'breezy', url: hop.url, checkedAt: hop.checkedAt, bodySha256: hop.bodySha256!, datePosted: '' } }) };
  const expected = differences.find(row => row.identity === job.identity);
  if (expected) { assert.ok(verified, `Missing primary proof for ${job.slug}`); assert.equal(correction.date, expected.pageDatePosted); }
  provenance.records[job.identity] = correction;
  if (verified) {
    assert.ok(hasRequiredJobDateProvenance({ ...job, ...correction }));
    preserveOriginalJobDate({ ...job, ...correction }, history);
  }
  const existing = current.get(job.identity);
  if (existing) Object.assign(existing, correction);
  dates.push({ identity: job.identity, slug: job.slug!, oldDate: job.date, date: correction.date, verified: Boolean(verified), eligible: isJobAgeEligible(correction), ...(hop && { checkedAt: hop.checkedAt, bodySha256: hop.bodySha256 }), ...(!verified ? { reason: 'no-matching-primary-JobPosting-date' } : jobAgeExclusionReason(correction) ? { reason: jobAgeExclusionReason(correction)! } : {}) });
}
const latestPrimaryCheck = dates.map(row => row.checkedAt).filter((value): value is string => Boolean(value)).sort().at(-1);
if (latestPrimaryCheck && Date.parse(latestPrimaryCheck) > Date.parse(provenance.checkedAt)) provenance.checkedAt = latestPrimaryCheck;
provenance.checks = provenance.checks.filter(check => !(check && typeof check === 'object' && 'kind' in check && check.kind === 'breezy-primary-pages' && 'sourceAudit' in check && check.sourceAudit === path.basename(root)));
provenance.checks.push({ kind: 'breezy-primary-pages', sourceAudit: path.basename(root), checkedAt: latestPrimaryCheck, records: dates.length, verified: dates.filter(row => row.verified).length });
const result = {
  sourceAudit: path.basename(root), sourceAuditCompletedAt: report.summary.generatedAt,
  appliedAt: new Date().toISOString(), inputJobs: cache.length, confirmedDeadOrClosed: 8, brokenApplicationApiActive: 5,
  linkExclusions, invalidatedApiHistory, primaryDatesChecked: dates.length,
  verifiedPrimaryDates: dates.filter(row => row.verified).length, originalDateDiscrepancies: differences,
  additionalDateDiscrepancies: dates.filter(row => row.verified && !row.eligible && !differences.some(difference => difference.identity === row.identity)),
  unverifiedPrimaryDates: dates.filter(row => !row.verified), dates,
};
if (process.argv.includes('--apply')) {
  const write = (file: string, value: unknown) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
  write('content/removed-job-listings.json', exclusions);
  write('content/job-date-provenance.json', provenance);
  write('content/job-date-history.json', history);
  write('content/jobs-cache.json', cache);
  const integrationFile = 'content/job-primary-audit-integration.json';
  const previous = fs.existsSync(integrationFile) ? read<{ sourceAuditCompletedAt?: string }>(integrationFile) : null;
  if (previous?.sourceAuditCompletedAt !== result.sourceAuditCompletedAt) write(integrationFile, result);
}
console.log(JSON.stringify({ inputJobs: result.inputJobs, linkExclusions: result.linkExclusions, invalidatedApiHistory, primaryDatesChecked: dates.length, verifiedPrimaryDates: result.verifiedPrimaryDates, excludedPrimaryDates: dates.filter(row => row.verified && !row.eligible).map(row => ({ slug: row.slug, date: row.date, reason: row.reason })), unverifiedPrimaryDates: result.unverifiedPrimaryDates, applied: process.argv.includes('--apply') }, null, 2));
