import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isJobAgeEligible } from '../src/lib/job-age-policy.mjs';
import { jobExpiryTime, jobCacheHeaders, jobListingCacheWindow, visibleJobListingExpiries } from '../src/lib/job-age-cache.mjs';

const base = Date.parse('2026-10-12T20:37:00.321Z');
const near = { date: new Date(base - 30 * 86400000 + 10000).toISOString() };
const later = { date: new Date(base - 86400000).toISOString() };
test('shared cache freshness ends before the earliest posting deadline', () => {
  const headers = jobCacheHeaders([later, near], base);
  assert.equal(headers['Cache-Control'], 'public, max-age=0, s-maxage=9, must-revalidate');
  assert.ok(Date.parse(headers.Expires) < jobExpiryTime(near));
  assert.equal(Date.parse(headers.Date) + 9000, Date.parse(headers.Expires));
  assert.doesNotMatch(headers['Cache-Control'], /stale|private/);
  assert.equal(jobCacheHeaders([later], base)['Cache-Control'], 'public, max-age=0, s-maxage=3600, must-revalidate');
  assert.equal(jobCacheHeaders([], base)['Cache-Control'], 'public, max-age=0, s-maxage=3600, must-revalidate');
});
test('subsecond boundaries cannot acquire a positive cache lifetime', () => {
  const expiry = jobExpiryTime(near);
  assert.equal(isJobAgeEligible(near, expiry - 1), true);
  assert.equal(isJobAgeEligible(near, expiry), false);
  for (const now of [expiry - 999, expiry - 1, expiry, expiry + 1]) assert.equal(jobCacheHeaders([near], now)['Cache-Control'], 'no-store');
});
test('an ISR listing cache key changes at the exact expiry inside its one-hour interval', () => {
  const deadlines = [jobExpiryTime(near), jobExpiryTime(later)];
  assert.deepEqual(jobListingCacheWindow(deadlines, base), { key: '0', deadline: deadlines[0] });
  assert.equal(jobListingCacheWindow(deadlines, deadlines[0] - 1).key, '0');
  assert.deepEqual(jobListingCacheWindow(deadlines, deadlines[0]), { key: '1', deadline: deadlines[1] });
  assert.deepEqual(jobListingCacheWindow(deadlines, deadlines[1]), { key: '2', deadline: Infinity });
});
test('limited listing deadlines cover future replacements without invalidating for never-visible jobs', () => {
  const at = milliseconds => ({ date: new Date(base - 30 * 86400000 + milliseconds).toISOString() });
  const first = at(10000), hidden = at(5000), replacement = at(20000), last = at(30000);
  assert.deepEqual(visibleJobListingExpiries([first, hidden, replacement, last], 1), [first, replacement, last].map(jobExpiryTime));
});
