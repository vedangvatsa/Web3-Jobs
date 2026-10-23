import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const entry = new URL('./publisher-outreach.mjs', import.meta.url).href;
async function run(scenario, mode = 'send', message = 'initial') {
  const cwd = await mkdtemp(path.join(os.tmpdir(), 'publisher-outreach-'));
  try {
    return spawnSync(process.execPath, ['--input-type=module', '-e', `
      const calls = [], writes = [];
      const scenario = ${JSON.stringify(scenario)};
      globalThis.fetch = async (url, options = {}) => {
        const method = options.method || 'GET';
        calls.push(method + ' ' + new URL(url).hostname);
        if (url.includes('api.github.com')) {
          if (method === 'GET' && process.env.PUBLISHER_MESSAGE === 'community-profile' && url.includes('/msn-2026-10-23.json')) {
            if (scenario === 'missing-original') return new Response('', { status: 404 });
            return Response.json({ content: Buffer.from(JSON.stringify({ providerId: 'original-email', status: 'accepted_by_resend', payload: { to: ['partnerhubsupport@microsoft.com'] } })).toString('base64') });
          }
          if (method === 'GET') return scenario === 'existing'
            ? Response.json({ sha: 'previous', content: Buffer.from(JSON.stringify({ status: 'claimed' })).toString('base64') })
            : new Response('', { status: 404 });
          if (scenario === 'race') return new Response('', { status: 409 });
          writes.push(new URL(url).pathname);
          return Response.json({ content: { sha: 'saved' }, commit: { sha: 'commit' } });
        }
        if (method === 'POST') {
          if (scenario === 'timeout') throw new Error('network timeout');
          return Response.json({ id: 'email-1' });
        }
        return Response.json({ id: 'email-1', from: 'Hashtag Web3 <hi@hashtagweb3.com>', to: ['partnerhubsupport@microsoft.com'], last_event: 'delivered' });
      };
      try { await import(${JSON.stringify(entry)}); } catch (e) { console.error(e.message); process.exitCode = 1; }
      console.log('WRITES:' + JSON.stringify(writes));
      console.log('CALLS:' + JSON.stringify(calls));
    `], { cwd, encoding: 'utf8', env: { ...process.env, PUBLISHER_TARGET: 'msn', PUBLISHER_MODE: mode, PUBLISHER_MESSAGE: message, GITHUB_REPOSITORY: 'vedangvatsa/Web3-Jobs', GH_TOKEN: 'test-token', RESEND_API_KEY: 'test-key' } });
  } finally { await rm(cwd, { recursive: true, force: true }); }
}
test('preview never reads credentials or sends network requests', async () => {
  const result = await run('success', 'preview');
  assert.equal(result.status, 0);
  assert.match(result.stdout, /CALLS:\[\]/);
});
test('existing claim or CAS conflict stops before email mutation', async () => {
  for (const scenario of ['existing', 'race']) {
    const result = await run(scenario);
    assert.equal(result.status, 1);
    assert.doesNotMatch(result.stdout, /POST api.resend.com/);
  }
});
test('claim is acknowledged before one send and the returned ID is saved before readback', async () => {
  const result = await run('success');
  assert.equal(result.status, 0, result.stderr);
  const calls = JSON.parse(result.stdout.split('CALLS:')[1]);
  assert.deepEqual(calls, ['GET api.github.com', 'PUT api.github.com', 'POST api.resend.com', 'PUT api.github.com', 'GET api.resend.com', 'PUT api.github.com']);
  assert.match(result.stdout, /"providerEvent":"delivered"/);
});
test('ambiguous email outcome is never retried', async () => {
  const result = await run('timeout');
  assert.equal(result.status, 1);
  assert.deepEqual(JSON.parse(result.stdout.split('CALLS:')[1]), ['GET api.github.com', 'PUT api.github.com', 'POST api.resend.com']);
});

test('community follow-up uses the live profile and feed without changing the original receipt', async () => {
  const preview = await run('success', 'preview', 'community-profile');
  assert.equal(preview.status, 0);
  assert.match(preview.stdout, /100,000 professionals and a knowledge and original news publisher/);
  assert.match(preview.stdout, /https:\/\/hashtagweb3.com\/community/);
  assert.match(preview.stdout, /Live RSS feed/);
  assert.doesNotMatch(preview.stdout, /hashtagweb3.com\/about|not yet available on the live site/);
  const sent = await run('success', 'send', 'community-profile');
  assert.equal(sent.status, 0, sent.stderr);
  const writes = JSON.parse(sent.stdout.split('WRITES:')[1].split('\n')[0]);
  assert.equal(writes.length, 3);
  assert.ok(writes.every(url => url.endsWith('/msn-community-profile-2026-10-23.json')));
  assert.equal(JSON.parse(sent.stdout.split('CALLS:')[1]).filter(call => call === 'POST api.resend.com').length, 1);
});

test('follow-up cannot send without a confirmed original or when it is already claimed', async () => {
  for (const scenario of ['missing-original', 'existing', 'race']) {
    const result = await run(scenario, 'send', 'community-profile');
    assert.equal(result.status, 1);
    assert.doesNotMatch(result.stdout, /POST api.resend.com/);
  }
});
