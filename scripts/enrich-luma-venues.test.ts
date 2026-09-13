import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { PersistentCache, backoffDelayMs, isTransientStatus, normalizeLumaUrl, parseRunOptions, retryAfterMs } from './enrich-luma-venues';

assert.equal(normalizeLumaUrl('https://lu.ma/example/?utm_source=test'), 'https://luma.com/example');
assert.equal(normalizeLumaUrl('https://example.com/event'), null);

assert.equal(retryAfterMs('12', 0), 12_000);
assert.equal(retryAfterMs('Thu, 01 Jan 1970 00:00:05 GMT', 0), 5_000);
assert.equal(retryAfterMs('invalid'), null);
assert.equal(backoffDelayMs(10, null, 1), 30_000, 'backoff must remain bounded');
assert.equal(backoffDelayMs(0, 8_000, 0), 8_000, 'Retry-After must not be shortened by jitter');
assert.equal(isTransientStatus(429), true);
assert.equal(isTransientStatus(503), true);
assert.equal(isTransientStatus(404), false);

assert.deepEqual(parseRunOptions(['--limit', '2', '--retry-failed']), { limit: 2, retryFailed: true, help: false });
assert.throws(() => parseRunOptions(['--limit', '21']), /--limit/);

const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'luma-venue-cache-'));
const cachePath = path.join(directory, 'state.json');
try {
  const cache = new PersistentCache(cachePath);
  cache.set('https://luma.com/example', { kind: 'skip', reason: 'no-event-jsonld' });
  cache.set('https://luma.com/verified', {
    kind: 'success',
    events: [{
      name: 'Verified Event',
      startDate: '2027-05-10T09:00:00-04:00',
      isPhysical: true,
      venue: { name: 'Example Hall', streetAddress: '42 Rue de Rivoli, 75001 Paris' },
    }],
  });
  const resumed = new PersistentCache(cachePath).get('https://luma.com/example');
  assert.deepEqual(resumed?.result, { kind: 'skip', reason: 'no-event-jsonld' });
  assert.equal(new PersistentCache(cachePath).get('https://luma.com/verified')?.result.kind, 'success');
} finally {
  fs.rmSync(directory, { recursive: true, force: true });
}

console.log('Luma venue enrichment tests passed.');
