import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import { buildHtml, buildText } from '../src/lib/resend-daily';
import { createUnsubscribeUrl, verifyUnsubscribeToken } from '../src/lib/email-unsubscribe';
import { lumaSourcePatch } from './luma-source-record';

test('Resend templates and unsubscribe tokens work without the retired SES module', () => {
  const job = { title: 'Test role', company: 'Test employer', location: 'Remote', url: 'https://example.test/job', tags: ['TypeScript'] };
  for (const output of [buildHtml([job]), buildText([job])]) {
    assert.ok(output.includes(job.title));
    assert.ok(output.includes(job.company));
    assert.ok(output.includes(job.url));
  }
  const previous = process.env.UNSUBSCRIBE_SECRET;
  process.env.UNSUBSCRIBE_SECRET = 'local-test-signing-secret';
  try {
    const token = new URL(createUnsubscribeUrl(' Subscriber@example.test ')).searchParams.get('token')!;
    assert.equal(verifyUnsubscribeToken(token), 'subscriber@example.test');
    assert.equal(verifyUnsubscribeToken(`${token}invalid`), null);
  } finally {
    if (previous === undefined) delete process.env.UNSUBSCRIBE_SECRET;
    else process.env.UNSUBSCRIBE_SECRET = previous;
  }
});

test('direct Luma snapshots and historical provider provenance remain readable offline', () => {
  const common = { url: 'https://luma.com/test-event', fetchedAt: '2026-10-05T00:00:00Z' };
  const direct = lumaSourcePatch({ ...common, method: 'luma-api', data: { event: { api_id: 'evt-test', name: 'Test event', start_at: '2026-10-10T12:00:00Z', location_type: 'online' }, description: 'Original source description.' } });
  assert.equal(direct.description, 'Original source description.');
  assert.equal(direct.sourceVerification?.method, 'luma-api');
  const historical = lumaSourcePatch({ ...common, method: 'apify', apifyRunId: 'historical-run', data: { eventId: 'evt-test', name: 'Test event', startAt: '2026-10-10T12:00:00Z', detailsFetched: true, description: 'Original source description.', location: { isVirtual: true } } });
  assert.equal(historical.description, direct.description);
  assert.equal(historical.startDate, direct.startDate);
  assert.equal(historical.sourceVerification?.apifyRunId, 'historical-run');
});

test('retired actor-import arguments fail before creating caches or applying event changes', () => {
  const root = process.cwd();
  fs.mkdirSync('.cache', { recursive: true });
  const directory = fs.mkdtempSync(path.resolve('.cache/retired-integration-'));
  try {
    const result = spawnSync(process.execPath, [path.join(root, 'node_modules/tsx/dist/cli.mjs'), '--tsconfig', path.join(root, 'tsconfig.json'), path.join(root, 'scripts/verify-luma-events.ts'), '--apify-run=retired', '--apply'], { cwd: directory, encoding: 'utf8', timeout: 30000 });
    assert.equal(result.status, 1, result.stderr);
    assert.match(result.stderr, /Unknown option: --apify-run/);
    assert.deepEqual(fs.readdirSync(directory), []);
  } finally { fs.rmSync(directory, { recursive: true, force: true }); }
});
