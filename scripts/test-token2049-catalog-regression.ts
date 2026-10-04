import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { test } from 'node:test';
import type { Web3Event } from '../src/lib/events';

const checker = path.resolve('scripts/test-token2049-catalog.ts');
const cache = path.resolve('.cache');
const description = 'Sessions cover ERC-4337 account abstraction, hardware-wallet signing and transaction simulation. Attendees will review Solidity examples and discuss recovery procedures with the speakers.';
const current: Web3Event = {
  id: 'current', slug: 'current', name: 'Current workshop',
  description, startDate: '2099-10-07', endDate: '2099-10-08',
  timezone: 'Asia/Singapore', location: 'Singapore',
  url: 'https://example.com/current', coverImage: '/events/current.webp',
  descriptionSource: { url: 'https://example.com/current', fetchedAt: '2026-10-01T00:00:00Z', method: 'reviewed-primary-sources', pageTitle: 'Current workshop', sha256: createHash('sha256').update(description).digest('hex') },
};
const expired = { ...current, id: 'expired', slug: 'expired', name: 'Archived workshop', startDate: '2000-09-28', endDate: '2000-09-28', coverImage: '/events/pruned.webp' };

function check(imported: Web3Event[], catalog: Web3Event[], covers: string[] = []) {
  fs.mkdirSync(cache, { recursive: true });
  const directory = fs.mkdtempSync(path.join(cache, 'token2049-catalog-regression-'));
  try {
    fs.mkdirSync(path.join(directory, 'content/events/sources'), { recursive: true });
    fs.mkdirSync(path.join(directory, 'public/events'), { recursive: true });
    fs.writeFileSync(path.join(directory, 'content/events/sources/token2049-discovered.json'), JSON.stringify(imported));
    fs.writeFileSync(path.join(directory, 'content/events-runtime.json'), JSON.stringify(catalog));
    for (const cover of covers) fs.writeFileSync(path.join(directory, 'public/events', cover), 'fixture');
    return spawnSync(process.execPath, ['--import', 'tsx', checker], { cwd: directory, encoding: 'utf8', timeout: 30000 });
  } finally { fs.rmSync(directory, { recursive: true, force: true }); }
}

test('archived date-only and timestamped events may have pruned covers', () => {
  const timestamped = { ...expired, id: 'timestamped', slug: 'timestamped', startDate: '2000-09-28T09:00:00Z', endDate: '2000-09-28T11:30:00Z' };
  const result = check([expired, timestamped, current], [current], ['current.webp']);
  assert.equal(result.status, 0, result.stderr);
  const counts = JSON.parse(result.stdout.trim());
  assert.equal(counts.localCovers, 1);
  assert.equal(counts.published, 1);
});

test('a missing current-event cover still fails with the event name and path', () => {
  const result = check([current], [current]);
  assert.notEqual(result.status, 0);
  assert.ok(result.stderr.includes('Missing local cover for Current workshop (current): public/events/current.webp'), result.stderr);
});

test('an ongoing event still needs its cover even when its start is in the past', () => {
  const ongoing = { ...current, startDate: '2000-10-07' };
  const result = check([ongoing], [ongoing]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Missing local cover/);
});

test('expiry does not bypass provenance validation', () => {
  const result = check([{ ...expired, descriptionSource: undefined }], []);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Unverified description: Archived workshop/);
});

test('current events must retain their catalog presence and canonical slug', () => {
  const absent = check([current], [], ['current.webp']);
  assert.notEqual(absent.status, 0);
  assert.match(absent.stderr, /Verified imported events are missing from the listing/);
  const renamed = check([current], [{ ...current, slug: 'different' }], ['current.webp']);
  assert.notEqual(renamed.status, 0);
  assert.match(renamed.stderr, /Canonical URL changed/);
});
