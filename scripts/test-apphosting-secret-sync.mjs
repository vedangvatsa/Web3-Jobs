import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { isSecretValueUnchanged } from './check-apphosting-secret-value.mjs';

const input = { projectId: 'test-project', name: 'TEST_SECRET', value: Buffer.from('test-value') };
const token = async () => 'test-access-token';
const response = value => Response.json({ payload: { data: Buffer.from(value).toString('base64') } });

test('only byte-identical values skip synchronization, including whitespace and Unicode', async () => {
  for (const value of ['test-value', 'test-value\n', '  leading\ntrailing  ', 'Unicode ✓\n']) {
    const request = async (url, options) => {
      assert.equal(url, 'https://secretmanager.googleapis.com/v1/projects/test-project/secrets/TEST_SECRET/versions/latest:access');
      assert.equal(options.method, 'GET');
      assert.equal(options.headers.Authorization, 'Bearer test-access-token');
      return response(value);
    };
    assert.equal(await isSecretValueUnchanged({ ...input, value: Buffer.from(value) }, { token, request }), true);
    assert.equal(await isSecretValueUnchanged({ ...input, value: Buffer.from(`${value}\n`) }, { token, request }), false);
  }
});

test('missing, disabled, inaccessible, changed or malformed secrets use the existing update path', async () => {
  for (const status of [400, 403, 404, 429, 500]) {
    assert.equal(await isSecretValueUnchanged(input, { token, request: async () => new Response('', { status }) }), false);
  }
  for (const payload of [{}, { payload: {} }, { payload: { data: 'not base64!' } }, { payload: { data: 'ZGlmZmVyZW50' } }]) {
    assert.equal(await isSecretValueUnchanged(input, { token, request: async () => Response.json(payload) }), false);
  }
  assert.equal(await isSecretValueUnchanged(input, { token: async () => { throw new Error('No gcloud'); } }), false);
  assert.equal(await isSecretValueUnchanged(input, { token, request: async () => { throw new Error('Network error'); } }), false);
  assert.equal(await isSecretValueUnchanged({ ...input, projectId: undefined }, { token }), false);
  assert.equal(await isSecretValueUnchanged({ ...input, value: Buffer.alloc(0) }, { token }), false);
});

test('shell integration preserves updates, empty-value behavior and backend access grants without logging values', () => {
  fs.mkdirSync('.cache', { recursive: true });
  const directory = fs.mkdtempSync(path.resolve('.cache/secret-sync-test-'));
  try {
    const callsFile = path.join(directory, 'calls.jsonl');
    fs.writeFileSync(path.join(directory, 'node'), `#!${process.execPath}\nprocess.stdin.resume(); process.stdin.on('end', () => process.exit(Number(process.env.TEST_DECISION)));\n`, { mode: 0o755 });
    fs.writeFileSync(path.join(directory, 'npx'), `#!${process.execPath}\nconst fs = require('node:fs'); let input = ''; process.stdin.on('data', chunk => input += chunk); process.stdin.on('end', () => { const args = process.argv.slice(2); fs.appendFileSync(process.env.TEST_CALLS, JSON.stringify({ args, input }) + '\\n'); const access = args.indexOf('apphosting:secrets:access'); process.exit(access >= 0 && args[access + 1] !== 'NEXT_PUBLIC_FIREBASE_API_KEY' ? 1 : 0); });\n`, { mode: 0o755 });
    for (const scenario of [
      { decision: '0', backend: 'studio', value: 'test-canary-secret', updates: 0 },
      { decision: '1', backend: 'studio', value: 'rotated-test-canary-secret\n', updates: 1 },
      { decision: '2', backend: 'studio', value: 'read-failure-test-canary', updates: 1 },
      { decision: '0', backend: '', value: 'test-canary-secret', updates: 1 },
      { decision: '0', backend: 'studio', value: '', updates: 0 },
    ]) {
      fs.writeFileSync(callsFile, '');
      const result = spawnSync('bash', ['scripts/sync-firebase-apphosting-secrets.sh'], { encoding: 'utf8', timeout: 20000, env: {
        ...process.env,
        PATH: `${directory}${path.delimiter}${process.env.PATH}`,
        TEST_CALLS: callsFile, TEST_DECISION: scenario.decision,
        FIREBASE_APPHOSTING_PROJECT_ID: 'test-project', FIREBASE_APPHOSTING_BACKEND: scenario.backend,
        NEXT_PUBLIC_FIREBASE_API_KEY: scenario.value,
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: '', NEXT_PUBLIC_FIREBASE_PROJECT_ID: '', NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: '', NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: '', NEXT_PUBLIC_FIREBASE_APP_ID: '', NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: '', RESEND_API_KEY: '', CRON_SECRET: '',
      } });
      assert.equal(result.status, 0, result.stderr);
      const calls = fs.readFileSync(callsFile, 'utf8').trim().split('\n').filter(Boolean).map(line => JSON.parse(line));
      const updates = calls.filter(call => call.args.includes('apphosting:secrets:set'));
      assert.equal(updates.length, scenario.updates);
      if (scenario.updates) assert.equal(updates[0].input, scenario.value);
      if (scenario.backend) assert.ok(calls.some(call => call.args.includes('apphosting:secrets:grantaccess')));
      assert.ok(!`${result.stdout}${result.stderr}`.includes('test-canary-secret'));
      assert.ok(!calls.some(call => call.args.some(arg => /destroy|disable|delete/.test(arg))));
    }
    const linked = path.join(directory, 'check-secret.mjs');
    fs.symlinkSync(path.resolve('scripts/check-apphosting-secret-value.mjs'), linked);
    const result = spawnSync(process.execPath, [linked, 'invalid/project', 'TEST_SECRET'], { input: 'test-canary-secret', encoding: 'utf8' });
    assert.equal(result.status, 1, 'A symlinked CLI must not silently report unchanged');
    assert.equal(result.stdout, '');
    assert.equal(result.stderr, '');
  } finally { fs.rmSync(directory, { recursive: true, force: true }); }
});
