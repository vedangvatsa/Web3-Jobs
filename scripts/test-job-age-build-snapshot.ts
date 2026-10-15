import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test, type TestContext } from 'node:test';
import type { Job } from '../src/types';
import { isJobAgeEligible } from '../src/lib/job-age-policy.mjs';
import { beginJobAgeBuildSnapshot, captureJobAgeBuildSnapshot, completeJobAgeBuildSnapshot, hasExpiredJobArtifacts, JOB_AGE_BUILD_SNAPSHOT_FILE, readValidatedJobAgeArtifacts, withJobAgeBuildSnapshot } from './lib/job-age-build-snapshot';
import { recordStep, shouldRunStep, type HashManifest } from './lib/prebuild-manifest';
import { retireIneligibleJobs } from './lib/retire-ineligible-jobs';

const stripe: Job = {
  id: '8202831', slug: 'mgr11', title: 'Benefits Program Manager, EMEA', company: 'Stripe',
  link: 'https://stripe.com/jobs/search?gh_jid=8202831', source: 'Greenhouse: Stripe',
  date: '2026-09-15T07:05:28-04:00', dateVerified: true, dateSource: 'Greenhouse.first_published',
};
const generatedAt = Date.parse('2026-10-15T11:05:00.000Z');
const gateAt = Date.parse('2026-10-15T11:06:30.000Z');

function fixture(t: TestContext, jobs: Job[] = [stripe]) {
  const root = fs.mkdtempSync(path.resolve('.cache/job-age-build-test-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, 'content'));
  let now = generatedAt;
  t.mock.method(Date, 'now', () => now);
  const write = (file: string, value: unknown) => fs.writeFileSync(path.join(root, file), `${JSON.stringify(value)}\n`);
  for (const file of ['jobs-cache', 'jobs-runtime']) write(`content/${file}.json`, jobs);
  const begin = () => beginJobAgeBuildSnapshot(root);
  const prepare = () => {
    const build = begin();
    const capture = captureJobAgeBuildSnapshot(build, now, root);
    completeJobAgeBuildSnapshot(capture, root);
    return capture;
  };
  return { root, write, begin, prepare, advance: (time: number) => { now = time; } };
}

test('the hosted Stripe artifact remains valid as generated when its 30-day deadline passes before the gate', t => {
  const { root, begin, advance } = fixture(t);
  assert.equal(isJobAgeEligible(stripe), true);
  const build = begin();
  const snapshot = captureJobAgeBuildSnapshot(build, generatedAt, root);
  advance(gateAt);
  const jobs = JSON.parse(fs.readFileSync(path.join(root, 'content/jobs-runtime.json'), 'utf8')) as Job[];
  assert.throws(() => assert.ok(jobs.every(job => isJobAgeEligible(job))), /falsy/);
  completeJobAgeBuildSnapshot(snapshot, root);
  withJobAgeBuildSnapshot(authorization => {
    const artifacts = readValidatedJobAgeArtifacts(root, authorization);
    assert.equal(artifacts.validatedAt, generatedAt);
    assert.deepEqual(artifacts.cache, [stripe]);
    assert.deepEqual(artifacts.runtime, [stripe]);
    assert.deepEqual(artifacts.runtime.filter(job => isJobAgeEligible(job)), [], 'The live clock still excludes the expired posting');
    assert.throws(() => readValidatedJobAgeArtifacts(root, null), /mgr11 is expired/, 'Standalone checks must still use the current clock');
  }, root);
  assert.equal(fs.existsSync(path.join(root, JOB_AGE_BUILD_SNAPSHOT_FILE)), false);
});

test('the generation cutoff remains exact when the deadline passes inside the generator itself', t => {
  const { root, begin, advance } = fixture(t);
  const build = begin();
  advance(gateAt);
  const snapshot = captureJobAgeBuildSnapshot(build, generatedAt, root);
  completeJobAgeBuildSnapshot(snapshot, root);
  withJobAgeBuildSnapshot(authorization => assert.equal(readValidatedJobAgeArtifacts(root, authorization).validatedAt, generatedAt), root);
});

test('unchanged FAST hashes do not authorize artifacts that expired before the jobs-generation stage', t => {
  const { root, write, begin, advance } = fixture(t);
  const step = { id: 'jobs-runtime', inputs: ['content/jobs-cache.json'], outputs: ['content/jobs-runtime.json'], command: 'fixture' };
  const manifest: HashManifest = { version: 1, steps: {} };
  recordStep(manifest, step, root);
  const build = begin();
  assert.equal(shouldRunStep(step, manifest, true, undefined, root), false);
  assert.equal(hasExpiredJobArtifacts(root), false);
  advance(gateAt);
  assert.equal(shouldRunStep(step, manifest, true, undefined, root), false);
  assert.equal(hasExpiredJobArtifacts(root), true);
  assert.throws(() => captureJobAgeBuildSnapshot(build, gateAt, root), /mgr11 is expired/);
  write('content/legacy-slugs-archive.json', {});
  assert.equal(retireIneligibleJobs(root).removedJobs, 1);
  write('content/jobs-runtime.json', []);
  const snapshot = captureJobAgeBuildSnapshot(build, gateAt, root);
  completeJobAgeBuildSnapshot(snapshot, root);
  withJobAgeBuildSnapshot(authorization => assert.deepEqual(readValidatedJobAgeArtifacts(root, authorization).runtime, []), root);
});

test('generation and ordinary checks reject unknown, future, invalid, inactive, unverified and non-primary dates', async t => {
  const cases: Array<[string, Partial<Job>]> = [
    ['missing-date', { date: '' }],
    ['invalid-date', { date: '2026-02-30' }],
    ['future-date', { date: '2026-10-16' }],
    ['expired', { date: '2026-09-14' }],
    ['inactive', { active: false }],
    ['unverified-date', { dateVerified: false }],
    ['non-posting-date', { dateSource: 'fetchedAt' }],
    ['non-posting-date', { dateSource: 'updated_at' }],
    ['unverified-primary-date', { source: 'Breezy: Example', link: 'https://example.breezy.hr/p/posting', dateSource: 'Breezy.API.created_date' }],
  ];
  for (const [reason, override] of cases) await t.test(reason, t => {
    const { root, begin } = fixture(t, [{ ...stripe, ...override }]);
    assert.throws(() => captureJobAgeBuildSnapshot(begin(), generatedAt, root), new RegExp(reason));
    assert.throws(() => readValidatedJobAgeArtifacts(root, null), new RegExp(reason));
  });
});

test('a runtime timestamp cannot replace the original source date even if both dates are fresh', t => {
  const { root, write, begin } = fixture(t);
  write('content/jobs-runtime.json', [{ ...stripe, date: '2026-10-15' }]);
  assert.throws(() => captureJobAgeBuildSnapshot(begin(), generatedAt, root), /original source date/);
});

test('exactly 30 days remains inclusive at the validation cutoff', t => {
  const { root, begin, advance } = fixture(t);
  const boundary = Date.parse(stripe.date) + 30 * 86400000;
  const build = begin();
  advance(boundary);
  assert.doesNotThrow(() => captureJobAgeBuildSnapshot(build, boundary, root));
  advance(boundary + 1);
  assert.throws(() => captureJobAgeBuildSnapshot(build, boundary + 1, root), /expired/);
});

test('changed cache or runtime bytes invalidate the snapshot before and during the gate', async t => {
  for (const file of ['content/jobs-cache.json', 'content/jobs-runtime.json']) await t.test(file, t => {
    const { root, prepare } = fixture(t);
    const capture = prepare();
    const original = fs.readFileSync(path.join(root, file));
    fs.appendFileSync(path.join(root, file), ' ');
    assert.throws(() => completeJobAgeBuildSnapshot(capture, root), /artifact bytes/);
    assert.throws(() => withJobAgeBuildSnapshot(() => assert.fail('Do not run gates with changed artifacts'), root), /artifact bytes/);
    fs.writeFileSync(path.join(root, file), original);
    prepare();
    withJobAgeBuildSnapshot(authorization => {
      fs.appendFileSync(path.join(root, file), ' ');
      assert.throws(() => readValidatedJobAgeArtifacts(root, authorization), /artifact bytes/);
    }, root);
  });
});

test('a receipt cannot supply an arbitrary backdate, future cutoff or stale attempt', t => {
  const { root, begin, prepare, advance } = fixture(t);
  const build = begin();
  assert.throws(() => captureJobAgeBuildSnapshot(build, generatedAt - 1, root), /Invalid, future or stale/);
  assert.throws(() => captureJobAgeBuildSnapshot(build, generatedAt + 1, root), /Invalid, future or stale/);
  prepare();
  assert.throws(() => readValidatedJobAgeArtifacts(root, String(generatedAt)), /authorization/);
  advance(generatedAt + 2 * 3600000 + 1);
  assert.throws(() => withJobAgeBuildSnapshot(() => assert.fail('Stale receipt'), root), /Invalid, future or stale/);
});

test('an authorization binds the complete receipt including its cutoff and build identity', t => {
  const { root, prepare, write } = fixture(t);
  prepare();
  withJobAgeBuildSnapshot(authorization => {
    const snapshot = JSON.parse(fs.readFileSync(path.join(root, JOB_AGE_BUILD_SNAPSHOT_FILE), 'utf8'));
    write(JOB_AGE_BUILD_SNAPSHOT_FILE, { ...snapshot, cutoff: snapshot.cutoff - 1000 });
    assert.throws(() => readValidatedJobAgeArtifacts(root, authorization), /authorization/);
  }, root);
});

test('a completed receipt is single-use and a new preparation invalidates an unfinished prior attempt', t => {
  const { root, prepare, begin } = fixture(t);
  prepare();
  withJobAgeBuildSnapshot(authorization => readValidatedJobAgeArtifacts(root, authorization), root);
  assert.throws(() => withJobAgeBuildSnapshot(() => assert.fail('Reused receipt'), root), /ENOENT/);
  prepare();
  begin();
  assert.throws(() => withJobAgeBuildSnapshot(() => assert.fail('Prior attempt'), root), /ENOENT/);
  prepare();
  assert.throws(() => withJobAgeBuildSnapshot(() => { throw new Error('Gate failed'); }, root), /Gate failed/);
  assert.equal(fs.existsSync(path.join(root, JOB_AGE_BUILD_SNAPSHOT_FILE)), false);
});

test('copying an otherwise identical receipt to another build root is rejected', t => {
  const { root, prepare } = fixture(t);
  prepare();
  const other = fs.mkdtempSync(path.resolve('.cache/job-age-build-other-'));
  t.after(() => fs.rmSync(other, { recursive: true, force: true }));
  fs.mkdirSync(path.join(other, 'content'));
  fs.mkdirSync(path.dirname(path.join(other, JOB_AGE_BUILD_SNAPSHOT_FILE)), { recursive: true });
  for (const file of ['content/jobs-cache.json', 'content/jobs-runtime.json', JOB_AGE_BUILD_SNAPSHOT_FILE]) fs.copyFileSync(path.join(root, file), path.join(other, file));
  assert.throws(() => withJobAgeBuildSnapshot(() => assert.fail('Different build'), other), /Invalid, future or stale/);
});
