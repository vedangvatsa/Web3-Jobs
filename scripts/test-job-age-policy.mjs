import assert from 'node:assert/strict';
import { test } from 'node:test';
import { execFileSync } from 'node:child_process';
import { MAX_JOB_AGE_DAYS, jobAgeExclusionReason, isJobAgeEligible, parseJobPostingDate } from '../src/lib/job-age-policy.mjs';

const now = Date.parse('2026-10-12T20:37:00.000Z');
const boundary = now - 30 * 86400000;
test('30 days is inclusive to the millisecond, regardless of ATS active status', () => {
  assert.equal(MAX_JOB_AGE_DAYS, 30);
  assert.equal(isJobAgeEligible({ date: new Date(boundary).toISOString(), active: true }, now), true);
  assert.equal(jobAgeExclusionReason({ date: new Date(boundary - 1).toISOString(), active: true }, now), 'expired');
  assert.equal(isJobAgeEligible({ date: new Date(now).toISOString() }, now), true);
  assert.equal(jobAgeExclusionReason({ date: new Date(now + 1).toISOString() }, now), 'future-date');
});
test('Harmony marketing4 remains excluded even when an ATS still lists it', () => {
  const harmony = { id: 'e18deeab-40ef-4a00-b627-d20fae6cb410', title: 'Marketing Lead', company: 'Harmony', date: '2024-03-09T05:33:00.298Z', active: true };
  assert.equal(jobAgeExclusionReason(harmony, now), 'expired');
});
test('unknown source dates fail closed and discovery timestamps cannot supply a date', () => {
  for (const date of [undefined, null, '']) assert.equal(jobAgeExclusionReason({ date }, now), 'missing-date');
  assert.equal(jobAgeExclusionReason({ fetchedAt: new Date(now).toISOString(), updatedAt: new Date(now).toISOString() }, now), 'missing-date');
  assert.equal(jobAgeExclusionReason({ date: new Date(now).toISOString(), dateVerified: false }, now), 'unverified-date');
  assert.equal(jobAgeExclusionReason({ date: new Date(now).toISOString(), active: false }, now), 'inactive');
});
test('strict calendar validation rejects rollover and timezone-less timestamps', () => {
  for (const date of ['2026-02-29', '2026-04-31', '2026-13-01', '2026-00-01', '2026-10-00', '2026-10-12T24:00:00Z', '2026-10-12T12:00:00', '10/12/2026', '2026-10-12T12:00:00+01:60', 123]) {
    assert.equal(jobAgeExclusionReason({ date }, now), 'invalid-date', String(date));
  }
  assert.equal(parseJobPostingDate('2024-02-29'), Date.parse('2024-02-29T00:00:00Z'));
  assert.equal(Number.isFinite(parseJobPostingDate('2026-10-11T11:31:34.545895+00:00')), true);
});
test('date-only and offset timestamps behave identically in multiple local timezones', () => {
  const moduleUrl = new URL('../src/lib/job-age-policy.mjs', import.meta.url).href;
  const script = `import assert from 'node:assert/strict'; import { isJobAgeEligible, parseJobPostingDate } from ${JSON.stringify(moduleUrl)}; assert.equal(parseJobPostingDate('2026-10-12'), Date.parse('2026-10-12T00:00:00Z')); assert.equal(isJobAgeEligible({date: '2026-09-13T02:07:00+05:30'}, ${now}), true); assert.equal(isJobAgeEligible({date: '2026-09-12T16:36:59.999-04:00'}, ${now}), false);`;
  for (const TZ of ['UTC', 'America/New_York', 'Asia/Kolkata', 'Pacific/Auckland']) execFileSync(process.execPath, ['--input-type=module', '-e', script], { env: { ...process.env, TZ } });
});
