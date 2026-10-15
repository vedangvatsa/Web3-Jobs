import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import { test } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { CATALOG_PATHS } from './catalog-publication.mjs';
import { getResendBroadcastPause } from './resend-broadcast-policy.mjs';

const require = createRequire(import.meta.url);
const yaml = createRequire(require.resolve('gray-matter'))('js-yaml');
const root = new URL('../../', import.meta.url);
const policyFile = new URL('./resend-broadcast-policy.json', import.meta.url);

function mockPolicy(t, readPolicy) {
  const read = fs.readFileSync;
  t.mock.method(fs, 'readFileSync', function (file, ...args) {
    return String(file) === policyFile.href ? readPolicy() : Reflect.apply(read, fs, [file, ...args]);
  });
}

test('either pause blocks sending; false or missing env cannot override the user policy', t => {
  let paused = true;
  mockPolicy(t, () => JSON.stringify({ paused }));
  for (const policyPause of [true, false]) {
    paused = policyPause;
    for (const value of [undefined, '', 'false', 'true', ' TrUe ']) {
      assert.equal(getResendBroadcastPause({ RESEND_BROADCASTS_PAUSED: value }).paused,
        paused || String(value).trim().toLowerCase() === 'true');
    }
  }
});

test('missing, unreadable, malformed and non-boolean policy settings fail closed', t => {
  let raw;
  mockPolicy(t, () => {
    if (raw === undefined) throw new Error('unreadable policy');
    return raw;
  });
  for (const value of [undefined, '{', 'null', '{}', '[]', '{"paused":"false"}', '{"paused":0}']) {
    raw = value;
    const result = getResendBroadcastPause({ RESEND_BROADCASTS_PAUSED: 'false' });
    assert.equal(result.paused, true);
    assert.match(result.reason, /refusing to send/);
  }
});

test('policy is reread on each call instead of cached as unpaused', t => {
  let paused = false;
  mockPolicy(t, () => JSON.stringify({ paused }));
  assert.equal(getResendBroadcastPause({}).paused, false);
  paused = true;
  assert.equal(getResendBroadcastPause({}).paused, true);
});

test('dates, expired metadata and force variables never release a pause', t => {
  mockPolicy(t, () => JSON.stringify({ paused: true, requestedAtUtc: '2000-01-01T00:00:00Z', expiresAt: '2000-01-02T00:00:00Z' }));
  assert.equal(getResendBroadcastPause({ FORCE: 'true', FORCE_SEND: 'true', RESEND_BROADCASTS_PAUSED: 'false' }).paused, true);
});

test('real CLI exits 0 before credentials, network or receipts, including forced and preview runs', async t => {
  const cases = [
    { args: [], policy: { paused: true } },
    { args: ['--force'], policy: { paused: true } },
    { args: ['--dry-run'], policy: { paused: true } },
    { args: ['--preview'], policy: { paused: true } },
    { args: ['--force', '--dry-run', '--preview'], policy: { paused: true }, key: 'offline-test-key' },
    { args: ['--force'], policy: { paused: false }, envPause: 'true' },
    { args: ['--force'], policy: null },
  ];
  for (const fixture of cases) {
    await t.test(JSON.stringify(fixture), () => {
      const cli = new URL('../send-resend-broadcast.ts', import.meta.url);
      const script = `
        import fs from 'node:fs';
        import http from 'node:http';
        import https from 'node:https';
        import net from 'node:net';
        import tls from 'node:tls';
        import { syncBuiltinESMExports } from 'node:module';
        const blocked = () => { process.exitCode = 97; throw new Error('Network or receipt access while paused'); };
        globalThis.fetch = blocked;
        http.request = http.get = https.request = https.get = blocked;
        net.connect = net.createConnection = net.Socket.prototype.connect = tls.connect = blocked;
        const read = fs.readFileSync;
        fs.readFileSync = function(file, ...args) {
          if (String(file) === ${JSON.stringify(policyFile.href)}) return ${JSON.stringify(JSON.stringify(fixture.policy))};
          if (/\\.resend-broadcast-(sent|last)\\.json$/.test(String(file))) return blocked();
          return Reflect.apply(read, fs, [file, ...args]);
        };
        fs.writeFileSync = fs.appendFileSync = fs.unlinkSync = fs.renameSync = blocked;
        syncBuiltinESMExports();
        process.argv = [process.execPath, ${JSON.stringify(fileURLToPath(cli))}, ...${JSON.stringify(fixture.args)}];
        await import(${JSON.stringify(cli.href)});
      `;
      const result = spawnSync(process.execPath, ['--import', pathToFileURL(require.resolve('tsx')).href, '--input-type=module', '--eval', script], {
        cwd: os.tmpdir(),
        encoding: 'utf8',
        timeout: 10000,
        env: {
          PATH: process.env.PATH,
          TSX_DISABLE_CACHE: '1',
          TSX_TSCONFIG_PATH: fileURLToPath(new URL('tsconfig.json', root)),
          RESEND_BROADCASTS_PAUSED: fixture.envPause || 'false',
          ...(fixture.key ? { RESEND_API_KEY: fixture.key } : {}),
          FORCE: 'true',
          FORCE_SEND: 'true',
        },
      });
      assert.ifError(result.error);
      assert.equal(result.status, 0, result.stderr);
      assert.equal(result.stderr, '');
      assert.match(result.stdout, /Resend broadcasts PAUSED: skipped\./);
      assert.match(result.stdout, /explicit user instruction; no automatic expiry/);
    });
  }
});

test('both workflow entry points gate only the broadcast job and pass the variable to the CLI', () => {
  const load = name => yaml.safeLoad(fs.readFileSync(new URL(`.github/workflows/${name}`, root), 'utf8'));
  const publisher = load('refresh-jobs-cache.yml');
  const alerts = load('daily-job-alerts.yml');
  const gate = /vars\.RESEND_BROADCASTS_PAUSED != 'true'/;
  assert.match(publisher.jobs['job-alerts'].if, gate);
  assert.match(alerts.jobs['send-job-alerts'].if, gate);
  for (const [name, job] of Object.entries(publisher.jobs)) {
    if (name !== 'job-alerts') assert.doesNotMatch(job.if || '', /RESEND_BROADCASTS_PAUSED/);
  }
  const steps = alerts.jobs['send-job-alerts'].steps;
  assert.equal(steps.find(step => step.uses === 'actions/checkout@v4').with.ref, 'main');
  assert.equal(steps.find(step => step.name === 'Send job alerts broadcast').env.RESEND_BROADCASTS_PAUSED,
    '${{ vars.RESEND_BROADCASTS_PAUSED }}');
  const audit = publisher.jobs['record-slot'].steps.find(step => step.env?.ALERTS);
  assert.match(audit.run, /\[ "\$RESEND_BROADCASTS_PAUSED" != "true" \]/);
});

test('catalog publication cannot overwrite the broadcast policy', () => {
  const file = 'scripts/lib/resend-broadcast-policy.json';
  for (const paths of Object.values(CATALOG_PATHS)) {
    assert.equal(paths.some(scope => scope.endsWith('/') ? file.startsWith(scope) : file === scope), false);
  }
});
