import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const entry = new URL('./publisher-outreach.mjs', import.meta.url).href;
async function run(scenario, mode = 'send') {
  const cwd = await mkdtemp(path.join(os.tmpdir(), 'publisher-outreach-'));
  try {
    return spawnSync(process.execPath, ['--input-type=module', '-e', `
      const calls = [];
      const scenario = ${JSON.stringify(scenario)};
      globalThis.fetch = async (url, options = {}) => {
        const method = options.method || 'GET';
        calls.push(method + ' ' + new URL(url).hostname);
        if (url.includes('api.github.com')) {
          if (method === 'GET') return scenario === 'existing'
            ? Response.json({ sha: 'previous', content: Buffer.from(JSON.stringify({ status: 'claimed' })).toString('base64') })
            : new Response('', { status: 404 });
          if (scenario === 'race') return new Response('', { status: 409 });
          return Response.json({ content: { sha: 'saved' }, commit: { sha: 'commit' } });
        }
        if (method === 'POST') {
          if (scenario === 'timeout') throw new Error('network timeout');
          return Response.json({ id: 'email-1' });
        }
        return Response.json({ id: 'email-1', from: 'Hashtag Web3 <hi@hashtagweb3.com>', to: ['partnerhubsupport@microsoft.com'], last_event: 'delivered' });
      };
      try { await import(${JSON.stringify(entry)}); } catch (e) { console.error(e.message); process.exitCode = 1; }
      console.log('CALLS:' + JSON.stringify(calls));
    `], { cwd, encoding: 'utf8', env: { ...process.env, PUBLISHER_TARGET: 'msn', PUBLISHER_MODE: mode, GITHUB_REPOSITORY: 'vedangvatsa/Web3-Jobs', GH_TOKEN: 'test-token', RESEND_API_KEY: 'test-key' } });
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
