import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { runNewsSourceReadiness, SOURCE_READINESS_FILES } from './check-news-sources.mjs';
import { recordResearchBatch, writeReport, writeResearch } from './news-research.mjs';

const day = '2026-10-22', time = Date.parse(`${day}T04:00:00Z`);
const ids = ['00000000000000000001', '00000000000000000002'];
const lookupFn = async () => [{ address: '93.184.216.34', family: 4 }];

function fixture(t) {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'news-source-readiness-'));
  t.after(() => fs.rmSync(cwd, { recursive: true, force: true }));
  const write = (relative, data) => {
    const file = path.join(cwd, relative);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, typeof data === 'string' ? data : JSON.stringify(data));
  };
  const read = relative => JSON.parse(fs.readFileSync(path.join(cwd, relative), 'utf8'));
  fs.mkdirSync(path.join(cwd, 'content/articles'), { recursive: true });
  const ledger = { version: 1, candidates: Object.fromEntries(ids.map((id, i) => [id, {
    id, title: `Protocol ${i} submits a new governance proposal`, link: `https://news.example.com/story-${i}`, sources: [],
    status: 'pending', attempts: 0, published: `${day}T01:00:00Z`, expiresAt: '2026-10-25T01:00:00Z',
  }])), runs: { [day]: { day, status: 'prepared', baselineSlugs: [], candidateIds: ids, outcomes: {}, discovery: { feeds: [{ ok: true }] } } } };
  write('content/news-research.json', ledger);
  write('.cache/news-research/current.json', { day, persist: true, baseSha: 'test', checkpointSha: 'test' });
  return { cwd, write, read, ledger, lookupFn, now: () => time, request: async url => ({ status: url.endsWith('0') ? 403 : 200, headers: {} }) };
}

test('CLI writes diagnostics and review JSON, then calls only the existing atomic record-batch command', async t => {
  const f = fixture(t), current = f.read('.cache/news-research/current.json');
  let calls = 0;
  const summary = await runNewsSourceReadiness({ ...f, env: { GITHUB_ACTIONS: 'true', NEWS_DRY_RUN: 'false' }, record: (binary, args, options) => {
    calls++;
    assert.equal(binary, process.execPath);
    assert.deepEqual(args, ['scripts/news-research.mjs', 'record-batch', `--reviews=${SOURCE_READINESS_FILES.reviews}`]);
    assert.equal(options.cwd, fs.realpathSync(f.cwd));
    assert.equal(options.env.NEWS_DRY_RUN, 'true');
    const reviews = f.read(SOURCE_READINESS_FILES.reviews), diagnostic = f.read(SOURCE_READINESS_FILES.diagnostics);
    assert.equal(reviews.length, 1);
    assert.equal(diagnostic.recording, 'pending');
    assert.deepEqual(diagnostic.reviews, reviews);
    assert.deepEqual(f.read('content/news-research.json'), f.ledger);
    const next = recordResearchBatch(f.read('content/news-research.json'), day, reviews, []);
    writeResearch(next, f.cwd);
    writeReport(next, day, f.cwd);
  } });
  assert.equal(calls, 1);
  assert.equal(summary.recording, 'recorded');
  assert.equal(summary.counts.deferredCandidates, 1);
  assert.equal(summary.counts.researchCandidates, 1);
  assert.deepEqual(summary.files, SOURCE_READINESS_FILES);
  assert.equal(f.read(SOURCE_READINESS_FILES.diagnostics).recording, 'recorded');
  assert.equal(f.read('content/news-research.json').candidates[ids[0]].status, 'deferred');
  assert.equal(f.read('content/news-research.json').candidates[ids[1]].status, 'pending');
  assert.equal(f.read('.cache/news-research/queue.json').remaining, 1);
  assert.deepEqual(f.read('.cache/news-research/current.json'), current);
  assert.deepEqual(fs.readdirSync(path.join(f.cwd, 'content/articles')), []);
});

test('dry-run produces evidence files without calling record or changing the ledger', async t => {
  const f = fixture(t), before = fs.readFileSync(path.join(f.cwd, 'content/news-research.json'), 'utf8');
  const summary = await runNewsSourceReadiness({ ...f, dryRun: true, record: () => assert.fail('Dry-run must not record') });
  assert.equal(summary.recording, 'dry-run');
  assert.equal(f.read(SOURCE_READINESS_FILES.reviews).length, 1);
  assert.equal(fs.readFileSync(path.join(f.cwd, 'content/news-research.json'), 'utf8'), before);
  assert.equal(f.read(SOURCE_READINESS_FILES.diagnostics).sourceChecks[1].outcome, undefined);
});

test('an empty eligible batch never invokes record-batch or labels accessible sources read', async t => {
  const f = fixture(t);
  const summary = await runNewsSourceReadiness({ ...f, request: async () => ({ status: 200, headers: {} }), record: () => assert.fail('Empty batch must not record') });
  assert.equal(summary.recording, 'no-reviews');
  assert.equal(summary.counts.researchCandidates, 2);
  assert.deepEqual(f.read(SOURCE_READINESS_FILES.reviews), []);
  assert.deepEqual(f.read('content/news-research.json'), f.ledger);
  assert.ok(f.read(SOURCE_READINESS_FILES.diagnostics).sourceChecks.every(check => check.availability === 'responded' && !check.outcome));
});

test('record failure retains diagnostics and does not claim a persisted review', async t => {
  const f = fixture(t);
  await assert.rejects(runNewsSourceReadiness({ ...f, record: () => { throw new Error('Mock validation refused batch'); } }), /record-batch failed/);
  assert.equal(f.read(SOURCE_READINESS_FILES.diagnostics).recording, 'failed');
  assert.deepEqual(f.read('content/news-research.json'), f.ledger);
  assert.equal(f.read(SOURCE_READINESS_FILES.reviews).length, 1);
});

test('ledger, current-run, restored-context and active-article changes abort before recording', async t => {
  for (const changed of ['ledger', 'current', 'restored', 'article']) {
    const f = fixture(t);
    let didChange = false;
    await assert.rejects(runNewsSourceReadiness({ ...f, request: async () => {
      if (!didChange) {
        didChange = true;
        if (changed === 'ledger') { const ledger = structuredClone(f.ledger); ledger.candidates[ids[0]].articleSlug = 'new-draft'; f.write('content/news-research.json', ledger); }
        if (changed === 'current') f.write('.cache/news-research/current.json', { day: '2026-10-23' });
        if (changed === 'restored') f.write('.cache/news-research/restored.json', { day, drafts: [{ id: ids[0], articleSlug: 'saved-draft' }] });
        if (changed === 'article') f.write('content/articles/new-draft.md', '---\ncategory: News\ntitle: A newly saved research draft\npublishedDate: 2026-10-22\n---\n[Source](https://news.example.com/story-0)\n');
      }
      return { status: 403, headers: {} };
    }, record: () => assert.fail('Changed context must not be recorded') }), /changed during source checks/, changed);
    assert.equal(f.read(SOURCE_READINESS_FILES.diagnostics).recording, 'state-changed');
    assert.equal(f.read('content/news-research.json').runs[day].outcomes[ids[0]], undefined);
  }
});

test('restored metadata and article source matches protect drafts even when every GET is denied', async t => {
  const f = fixture(t);
  f.write('.cache/news-research/restored.json', { day, drafts: [{ id: ids[0], articleSlug: 'missing-file',
    sourceChecks: [{ url: 'https://primary.example.com/filing', outcome: 'read' }] }] });
  f.write('content/articles/active-draft.md', '---\ncategory: News\ntitle: This draft has a different title\npublishedDate: 2026-10-22\n---\n[Source](https://news.example.com/story-1)\n');
  const seen = [];
  const summary = await runNewsSourceReadiness({ ...f, request: async url => { seen.push(url); return { status: 403, headers: {} }; }, record: () => assert.fail('Drafts must be preserved') });
  assert.equal(summary.counts.protectedDraftCandidates, 2);
  assert.equal(summary.counts.deferredCandidates, 0);
  assert.ok(seen.includes('https://primary.example.com/filing'));
  assert.deepEqual(f.read('content/news-research.json'), f.ledger);
});

test('persisted diagnostics retain Retry-After across CLI invocations without inferred statuses', async t => {
  const f = fixture(t);
  let calls = 0;
  const request = async () => { calls++; return { status: 429, headers: { 'retry-after': '172800' } }; };
  await runNewsSourceReadiness({ ...f, request, dryRun: true, record: () => assert.fail('Dry-run') });
  assert.equal(calls, 1);
  const summary = await runNewsSourceReadiness({ ...f, now: () => time + 1000, request, record: () => assert.fail('No new HTTP evidence') });
  assert.equal(calls, 1);
  assert.equal(summary.counts.attemptedUrls, 0);
  assert.equal(summary.recording, 'no-reviews');
  const report = f.read(SOURCE_READINESS_FILES.diagnostics);
  assert.equal(report.cooldowns.length, 1);
  assert.ok(report.sourceChecks.every(check => check.status === null && !check.attempted));
});

test('symlinked cache directories and output files cannot overwrite outside targets', async t => {
  for (const target of ['.cache', '.cache/news-research', SOURCE_READINESS_FILES.diagnostics, SOURCE_READINESS_FILES.reviews]) {
    const f = fixture(t), victim = path.join(f.cwd, 'outside');
    const destination = path.join(f.cwd, target);
    if (target === '.cache' || target === '.cache/news-research') {
      fs.renameSync(destination, victim);
      fs.symlinkSync(victim, destination);
    } else {
      fs.writeFileSync(victim, '{"sentinel":"do not overwrite"}');
      fs.symlinkSync(victim, destination);
    }
    await assert.rejects(runNewsSourceReadiness({ ...f, record: () => assert.fail('Unsafe cache must not record') }), /real directory|Unsafe source readiness file/);
    if (target.endsWith('.json')) assert.equal(fs.readFileSync(victim, 'utf8'), '{"sentinel":"do not overwrite"}');
    assert.deepEqual(f.read('content/news-research.json'), f.ledger);
  }
});

test('a missing prepared context or mismatched restored day fails before network or record', async t => {
  const f = fixture(t);
  f.write('.cache/news-research/restored.json', { day: '2026-10-21', drafts: [] });
  const options = { ...f, request: () => assert.fail('Invalid context must not request'), record: () => assert.fail('Invalid context must not record') };
  await assert.rejects(runNewsSourceReadiness(options), /Restored draft context/);
  fs.unlinkSync(path.join(f.cwd, '.cache/news-research/current.json'));
  await assert.rejects(runNewsSourceReadiness(options), /ENOENT/);
});
