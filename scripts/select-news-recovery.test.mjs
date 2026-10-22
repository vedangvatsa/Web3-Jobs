import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { RECOVERY_LIMITS, selectNewsRecovery } from './select-news-recovery.mjs';

const DAY = '2026-10-22', NOW = new Date(`${DAY}T12:30:00Z`), REPOSITORY = 'example/news-site';
const TOKEN = 'test-token-never-log', SHA = 'a'.repeat(40);
function run(runId = 800, changes = {}) {
  return {
    id: runId, run_attempt: 1, workflow_id: 123, path: '.github/workflows/refresh-jobs-cache.yml',
    head_branch: 'main', head_sha: SHA, event: 'workflow_dispatch', pull_requests: [],
    repository: { id: 42, full_name: REPOSITORY }, head_repository: { id: 42, full_name: REPOSITORY },
    status: 'completed', conclusion: 'failure', created_at: `${DAY}T10:00:00Z`,
    run_started_at: `${DAY}T10:00:00Z`, updated_at: `${DAY}T10:50:00Z`,
    display_title: `untrusted title ${TOKEN}`, ...changes,
  };
}
function artifact(runId = 800, attempt = 1, changes = {}) {
  return {
    id: runId * 100 + attempt, name: `news-research-${runId}-${attempt}`, size_in_bytes: 1234,
    expired: false, created_at: `${DAY}T10:40:00Z`, expires_at: '2026-11-22T10:40:00Z',
    workflow_run: { id: runId, repository_id: 42, head_repository_id: 42, head_branch: 'main', head_sha: SHA },
    archive_download_url: `https://untrusted.example/${TOKEN}`, ...changes,
  };
}

function fixture(t, { runs = [], artifacts = {}, attempts = {}, current = run(900, {
  status: 'in_progress', conclusion: null, created_at: `${DAY}T12:00:00Z`, run_started_at: `${DAY}T12:00:00Z`, updated_at: `${DAY}T12:10:00Z`,
}) } = {}) {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'select-news-recovery-'));
  t.after(() => fs.rmSync(cwd, { recursive: true, force: true }));
  fs.mkdirSync(path.join(cwd, '.cache/news-research'), { recursive: true });
  fs.writeFileSync(path.join(cwd, '.cache/news-research/current.json'), JSON.stringify({ day: DAY }));
  const env = { GITHUB_TOKEN: TOKEN, GITHUB_REPOSITORY: REPOSITORY, GITHUB_RUN_ID: '900', GITHUB_OUTPUT: path.join(cwd, 'output') };
  const f = { cwd, env, now: NOW, calls: [], override: null };
  f.fetchImpl = async (input, options) => {
    const url = new URL(input), relative = url.pathname.replace(`/repos/${REPOSITORY}/actions/`, '');
    f.calls.push({ url, options, relative });
    if (f.override) { const response = await f.override(relative, url, options); if (response) return response; }
    if (relative === 'runs/900') return Response.json(current);
    const page = Number(url.searchParams.get('page') || 1), size = Number(url.searchParams.get('per_page') || 100);
    const list = (items, field) => Response.json({ total_count: items.length, [field]: items.slice((page - 1) * size, page * size) });
    if (relative === 'workflows/refresh-jobs-cache.yml/runs') return list(runs, 'workflow_runs');
    const match = relative.match(/^runs\/(\d+)(?:\/(artifacts|attempts)(?:\/(\d+))?)?$/);
    if (match?.[2] === 'artifacts') return list(artifacts[match[1]] || [], 'artifacts');
    const value = match?.[2] === 'attempts' ? attempts[`${match[1]}/${match[3]}`] : runs.find(item => String(item.id) === match?.[1]);
    return value ? Response.json(value) : Response.json({ message: `not found ${TOKEN}` }, { status: 404 });
  };
  f.select = () => selectNewsRecovery(f);
  f.journal = () => JSON.parse(fs.readFileSync(path.join(cwd, '.cache/news-research/recovery-selection.json'), 'utf8'));
  f.output = () => fs.existsSync(env.GITHUB_OUTPUT) ? fs.readFileSync(env.GITHUB_OUTPUT, 'utf8') : '';
  return f;
}

test('chooses the latest prior failed/cancelled run with a usable artifact, using authenticated scoped reads', async t => {
  const older = run(700, { created_at: `${DAY}T09:00:00Z`, run_started_at: `${DAY}T09:00:00Z` });
  const newest = run(850, { created_at: `${DAY}T11:00:00Z`, run_started_at: `${DAY}T11:00:00Z`, updated_at: `${DAY}T11:50:00Z` });
  const f = fixture(t, {
    runs: [older, newest, run(800, { event: 'schedule', conclusion: 'cancelled' })],
    artifacts: { 700: [artifact(700)], 850: [artifact(850, 1, { expired: true })], 800: [artifact()] },
  });
  const result = await f.select();
  assert.equal(result.status, 'selected');
  assert.deepEqual(result.selection, { runId: '800', runAttempt: 1, artifactId: '80001', artifactName: 'news-research-800-1', createdAt: `${DAY}T10:40:00Z` });
  assert.deepEqual(result.candidates, [{ runId: '850', decision: 'no-matching-artifact' }, { runId: '800', decision: 'selected' }]);
  assert.deepEqual(f.journal(), result);
  assert.equal(f.output(), 'run_id=800\nartifact_name=news-research-800-1\n');
  assert.equal(f.calls.some(call => call.relative === 'runs/700/artifacts'), false);
  for (const { url, options } of f.calls) {
    assert.equal(url.origin, 'https://api.github.com');
    assert.ok(url.pathname.startsWith(`/repos/${REPOSITORY}/actions/`));
    assert.equal(options.method, 'GET');
    assert.equal(options.redirect, 'error');
    assert.equal(options.headers.Authorization, `Bearer ${TOKEN}`);
    assert.equal(options.headers.Accept, 'application/vnd.github+json');
    assert.ok(options.signal instanceof AbortSignal);
  }
  const query = f.calls.find(call => call.relative.startsWith('workflows/')).url.searchParams;
  assert.equal(query.get('created'), DAY); assert.equal(query.get('branch'), 'main'); assert.equal(query.get('status'), 'completed');
  assert.notEqual(query.get('exclude_pull_requests'), 'true');
  assert.doesNotMatch(JSON.stringify(result), /test-token-never-log|untrusted|archive_download_url|display_title/);
});

test('empty or exhausted same-day searches allow fresh research without restoring or changing the queue or ledger', async t => {
  for (const runs of [[], [run()]]) {
    const f = fixture(t, { runs });
    fs.mkdirSync(path.join(f.cwd, 'content'));
    fs.writeFileSync(path.join(f.cwd, 'content/news-research.json'), 'fresh ledger');
    fs.writeFileSync(path.join(f.cwd, '.cache/news-research/queue.json'), 'unreviewed candidates');
    const result = await f.select();
    assert.equal(result.status, 'none'); assert.equal(result.selection, null);
    assert.equal(f.output(), 'run_id=\nartifact_name=\n');
    assert.equal(fs.readFileSync(path.join(f.cwd, 'content/news-research.json'), 'utf8'), 'fresh ledger');
    assert.equal(fs.readFileSync(path.join(f.cwd, '.cache/news-research/queue.json'), 'utf8'), 'unreviewed candidates');
    assert.equal(fs.existsSync(path.join(f.cwd, '.cache/news-research/restored.json')), false);
    assert.equal(fs.existsSync(path.join(f.cwd, 'content/articles')), false);
  }
});

const unsafeRuns = [
  ['wrong branch', { head_branch: 'feature' }],
  ['wrong workflow path', { path: '.github/workflows/other.yml' }],
  ['wrong workflow ID', { workflow_id: 456 }],
  ['wrong repository', { repository: { id: 43, full_name: 'other/repo' } }],
  ['mismatched repository ID', { repository: { id: 43, full_name: REPOSITORY }, head_repository: { id: 43, full_name: REPOSITORY } }],
  ['fork head', { head_repository: { id: 43, full_name: 'fork/news-site' } }],
  ['pull request', { event: 'pull_request' }],
  ['pull request target', { event: 'pull_request_target' }],
  ['associated pull request', { pull_requests: [{ number: 1 }] }],
  ['untrusted trigger', { event: 'workflow_run' }],
  ['incomplete run', { status: 'in_progress' }],
  ['previous UTC date', { created_at: '2026-10-21T23:59:00Z' }],
  ['future UTC date', { created_at: '2026-10-23T10:00:00Z', run_started_at: '2026-10-23T10:00:00Z', updated_at: '2026-10-23T10:10:00Z' }],
  ['later run the same day', { created_at: `${DAY}T12:01:00Z`, run_started_at: `${DAY}T12:01:00Z`, updated_at: `${DAY}T12:10:00Z` }],
  ['future completion', { updated_at: `${DAY}T13:00:00Z` }],
  ['later attempt of an earlier run', { run_attempt: 2, run_started_at: `${DAY}T12:01:00Z`, updated_at: `${DAY}T12:10:00Z` }],
  ['non-UTC or invalid metadata', { run_started_at: '2026-10-22T10:00:00' }],
  ['missing attempt', { run_attempt: undefined }],
  ['current run including prior attempts', { id: 900, run_attempt: 2 }],
  ['future run ID', { id: 950 }],
];
test('automatic and explicit recovery both reject untrusted, wrong-date, current and future sources', async t => {
  for (const [name, changes] of unsafeRuns) await t.test(name, async t => {
    const bad = run(800, changes), good = run(700);
    const f = fixture(t, { runs: [bad, good], artifacts: { [bad.id]: [artifact(bad.id)], 700: [artifact(700)] } });
    assert.equal((await f.select()).selection.runId, '700');
    assert.equal(f.calls.some(call => call.relative === `runs/${bad.id}/artifacts`), false);
    const explicit = fixture(t, { runs: [bad], artifacts: { [bad.id]: [artifact(bad.id)] } });
    explicit.env.NEWS_RECOVERY_RUN = String(bad.id);
    await assert.rejects(explicit.select(), error => ['invalid-requested-run', 'current-run'].includes(error.code));
    assert.equal(explicit.journal().status, 'error'); assert.equal(explicit.output(), '');
  });
});

test('success and timed-out runs are not automatic sources; explicit completed runs still require full validation', async t => {
  for (const conclusion of ['success', 'timed_out']) {
    const f = fixture(t, { runs: [run(800, { conclusion })], artifacts: { 800: [artifact()] } });
    assert.equal((await f.select()).status, 'none');
    const explicit = fixture(t, { runs: [run(800, { conclusion })], artifacts: { 800: [artifact()] } });
    explicit.env.NEWS_RECOVERY_RUN = '800';
    assert.equal((await explicit.select()).selection.runId, '800');
    assert.equal(explicit.calls.some(call => call.relative.startsWith('workflows/')), false);
  }
});

test('uses the highest eligible artifact attempt, including a saved earlier attempt after a partial rerun', async t => {
  for (const mode of ['automatic', 'explicit']) for (const latestAvailable of [true, false]) {
    const source = run(800, { run_attempt: 3, run_started_at: `${DAY}T10:30:00Z` });
    const f = fixture(t, {
      runs: [source],
      artifacts: { 800: [artifact(800, 1, { created_at: `${DAY}T10:05:00Z` }), artifact(800, 3, { expired: !latestAvailable }), artifact(800, 2, { created_at: `${DAY}T10:20:00Z` })] },
      attempts: { '800/2': run(800, { run_attempt: 2, run_started_at: `${DAY}T10:10:00Z`, updated_at: `${DAY}T10:25:00Z` }) },
    });
    if (mode === 'explicit') f.env.NEWS_RECOVERY_RUN = '800';
    const result = await f.select(), expectedAttempt = latestAvailable ? 3 : 2;
    assert.equal(result.selection.runAttempt, expectedAttempt);
    assert.equal(result.selection.artifactName, `news-research-800-${expectedAttempt}`);
    assert.equal(f.output(), `run_id=800\nartifact_name=news-research-800-${expectedAttempt}\n`);
    assert.equal(f.calls.some(call => call.relative === 'runs/800/attempts/2'), !latestAvailable);
  }
});

test('earlier artifact attempts need their own trusted completed same-day attempt metadata', async t => {
  for (const changes of [
    { run_attempt: 1 }, { id: 799 }, { event: 'pull_request_target' }, { head_branch: 'feature' },
    { status: 'in_progress' }, { conclusion: 'success' }, { head_sha: 'b'.repeat(40) },
    { created_at: '2026-10-21T20:00:00Z', run_started_at: '2026-10-21T20:00:00Z' },
  ]) {
    const f = fixture(t, {
      runs: [run(800, { run_attempt: 3 })], artifacts: { 800: [artifact(800, 2)] },
      attempts: { '800/2': run(800, { run_attempt: 2, ...changes }) },
    });
    assert.equal((await f.select()).status, 'none');
    assert.ok(f.calls.some(call => call.relative === 'runs/800/attempts/2'));
  }
});

test('artifact names, provenance, lifetime and upload times must match the validated run and attempt', async t => {
  const invalid = [
    ['unrelated name', { name: 'news-research-latest' }], ['wrong run name', { name: 'news-research-799-1' }],
    ['future attempt', { name: 'news-research-800-2' }], ['attempt zero', { name: 'news-research-800-0' }],
    ['noncanonical attempt', { name: 'news-research-800-01' }], ['output injection', { name: 'news-research-800-1\nrun_id=42' }],
    ['expired flag', { expired: true }], ['expired timestamp', { expires_at: NOW.toISOString() }],
    ['missing expiry', { expires_at: null }], ['empty archive', { size_in_bytes: 0 }],
    ['previous day upload', { created_at: '2026-10-21T23:59:00Z' }], ['future upload', { created_at: `${DAY}T13:00:00Z` }],
    ['before attempt', { created_at: `${DAY}T09:59:00Z` }], ['after completion', { created_at: `${DAY}T11:00:00Z` }],
    ['missing provenance', { workflow_run: null }],
    ...['id', 'repository_id', 'head_repository_id', 'head_branch', 'head_sha'].map(key => [`wrong ${key}`, { workflow_run: { ...artifact().workflow_run, [key]: key.startsWith('head_') && key !== 'head_repository_id' ? 'other' : 999 } }]),
  ];
  for (const [name, changes] of invalid) await t.test(name, async t => {
    const f = fixture(t, { runs: [run()], artifacts: { 800: [artifact(800, 1, changes)] } });
    assert.equal((await f.select()).status, 'none');
    const explicit = fixture(t, { runs: [run()], artifacts: { 800: [artifact(800, 1, changes)] } });
    explicit.env.NEWS_RECOVERY_RUN = '800';
    await assert.rejects(explicit.select(), { code: 'missing-artifact' });
    assert.equal(explicit.output(), '');
  });
});

test('explicit overrides fail on missing runs or artifacts instead of selecting another run', async t => {
  for (const exists of [true, false]) {
    const f = fixture(t, { runs: exists ? [run(), run(700)] : [run(700)], artifacts: { 700: [artifact(700)] } });
    f.env.NEWS_RECOVERY_RUN = '800';
    await assert.rejects(f.select(), { code: exists ? 'missing-artifact' : 'api-http' });
    assert.equal(f.journal().status, 'error'); assert.equal(f.output(), '');
    assert.equal(f.calls.some(call => call.relative.startsWith('workflows/') || call.relative === 'runs/700/artifacts'), false);
  }
});

test('paginates runs and artifacts and never follows API-supplied pagination URLs', async t => {
  const ignoredRuns = Array.from({ length: 100 }, (_, index) => run(500 + index, { head_branch: 'other' }));
  const ignoredArtifacts = Array.from({ length: 99 }, (_, index) => artifact(800, 1, { id: index + 1, name: `unrelated-${index}` }));
  const f = fixture(t, {
    runs: [...ignoredRuns, run(800, { run_attempt: 3, run_started_at: `${DAY}T10:30:00Z` })],
    artifacts: { 800: [...ignoredArtifacts, artifact(800, 1, { created_at: `${DAY}T10:05:00Z` }), artifact(800, 3)] },
  });
  f.override = (relative, url) => {
    if (relative.startsWith('workflows/') && url.searchParams.get('page') === '1') {
      return Response.json({ total_count: 101, workflow_runs: ignoredRuns }, { headers: { link: '<https://untrusted.example/steal-token>; rel="next"' } });
    }
  };
  assert.equal((await f.select()).selection.artifactName, 'news-research-800-3');
  for (const relative of ['workflows/refresh-jobs-cache.yml/runs', 'runs/800/artifacts']) {
    assert.deepEqual(f.calls.filter(call => call.relative === relative).map(call => call.url.searchParams.get('page')), ['1', '2']);
  }
  assert.ok(f.calls.every(call => call.url.origin === 'https://api.github.com'));
});

test('API failures remain errors with sanitized journals and no recovery outputs or fresh-search fallback', async t => {
  const failures = [
    ...[302, 401, 403, 404, 429, 500].map(status => () => Response.json({ message: TOKEN }, { status })),
    () => new Response(`invalid JSON ${TOKEN}`, { status: 200 }),
    () => { throw new Error(`network error with ${TOKEN}`); },
  ];
  for (const failResponse of failures) {
    const f = fixture(t, { runs: [run(), run(700)], artifacts: { 700: [artifact(700)] } });
    f.override = relative => relative === 'runs/800/artifacts' ? failResponse() : null;
    await assert.rejects(f.select(), error => { assert.doesNotMatch(error.message, new RegExp(TOKEN)); return /^api-/.test(error.code); });
    const journal = f.journal();
    assert.equal(journal.status, 'error'); assert.equal(journal.selection, null); assert.equal(f.output(), '');
    assert.deepEqual(journal.lastRequest, { resource: 'runs/800/artifacts', page: 1 });
    assert.doesNotMatch(JSON.stringify(journal), new RegExp(TOKEN));
    assert.equal(f.calls.some(call => call.relative === 'runs/700/artifacts'), false);
  }
});

test('malformed lists and incomplete pagination cannot be reported as no matching artifacts', async t => {
  for (const [data, code] of [
    [{ total_count: 1, artifacts: null }, 'api-shape'],
    [{ artifacts: [] }, 'api-shape'],
    [{ total_count: 1, artifacts: [] }, 'api-pagination'],
  ]) {
    const f = fixture(t, { runs: [run()] });
    f.override = relative => relative === 'runs/800/artifacts' ? Response.json(data) : null;
    await assert.rejects(f.select(), { code });
    assert.equal(f.journal().status, 'error'); assert.equal(f.output(), '');
  }
});

test('bounded page and request budgets fail visibly rather than guessing from a truncated search', async t => {
  for (const endpoint of ['workflows/refresh-jobs-cache.yml/runs', 'runs/800/artifacts']) {
    const f = fixture(t, { runs: [run()] }), field = endpoint.startsWith('workflows/') ? 'workflow_runs' : 'artifacts';
    f.override = relative => relative === endpoint ? Response.json({ total_count: 1001, [field]: [] }) : null;
    await assert.rejects(f.select(), { code: 'page-limit' });
    assert.equal(f.output(), '');
  }
  const endless = fixture(t);
  endless.override = relative => relative.startsWith('workflows/') ? Response.json({ total_count: 1, workflow_runs: [run()] }, {
    headers: { link: '<https://api.github.com/next>; rel="next"' },
  }) : null;
  await assert.rejects(endless.select(), { code: 'page-limit' });
  assert.equal(endless.calls.length, RECOVERY_LIMITS.maxPages + 1);
  const exhausted = fixture(t, { runs: Array.from({ length: 100 }, (_, index) => run(700 + index)) });
  await assert.rejects(exhausted.select(), { code: 'request-limit' });
  assert.equal(exhausted.calls.length, RECOVERY_LIMITS.maxRequests);
  assert.equal(exhausted.journal().status, 'error'); assert.equal(exhausted.output(), '');
});

test('duplicate artifact names fail instead of allowing the download action to guess', async t => {
  const f = fixture(t, { runs: [run()], artifacts: { 800: [artifact(), artifact(800, 1, { id: 80002 })] } });
  await assert.rejects(f.select(), { code: 'ambiguous-artifact' });
  assert.equal(f.output(), '');
});

test('invalid inputs are rejected before API reads and cannot inject journal fields or action outputs', async t => {
  for (const [key, value] of [
    ['NEWS_RECOVERY_RUN', `800\nartifact_name=${TOKEN}`], ['NEWS_RECOVERY_RUN', '800\n'], ['NEWS_RECOVERY_RUN', '../800'], ['NEWS_RECOVERY_RUN', '0800'],
    ['NEWS_RECOVERY_RUN', '9007199254740992'], ['GITHUB_RUN_ID', ''], ['GITHUB_REPOSITORY', `../${TOKEN}`], ['GITHUB_TOKEN', ''],
  ]) {
    const f = fixture(t); f.env[key] = value;
    await assert.rejects(f.select());
    assert.equal(f.calls.length, 0); assert.equal(f.output(), '');
    assert.equal(f.journal().status, 'error'); assert.doesNotMatch(JSON.stringify(f.journal()), new RegExp(TOKEN));
  }
  for (const day of ['2026-10-23', '2026-02-30', `bad-date-${TOKEN}`]) {
    const f = fixture(t);
    fs.writeFileSync(path.join(f.cwd, '.cache/news-research/current.json'), JSON.stringify({ day }));
    await assert.rejects(f.select(), { code: 'invalid-date' });
    assert.equal(f.calls.length, 0); assert.doesNotMatch(JSON.stringify(f.journal()), new RegExp(TOKEN));
  }
  const missing = fixture(t);
  fs.unlinkSync(path.join(missing.cwd, '.cache/news-research/current.json'));
  await assert.rejects(missing.select(), { code: 'invalid-queue' });
  assert.equal(missing.calls.length, 0);
});

test('the current run must itself belong to the trusted main workflow', async t => {
  for (const changes of [{ head_branch: 'feature' }, { event: 'pull_request_target' }, { path: '.github/workflows/other.yml' }, { repository: { id: 99, full_name: 'other/repo' } }]) {
    const f = fixture(t, { current: run(900, changes) });
    await assert.rejects(f.select(), { code: 'invalid-current-run' });
    assert.equal(f.calls.length, 1); assert.equal(f.output(), '');
  }
});
