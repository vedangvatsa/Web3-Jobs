import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { test } from 'node:test';
import { canonicalNewsUrl } from './news-discover.mjs';
import { finalizeResearch, researchReport, reviewCandidate } from './lib/news-research.mjs';
import { restoreNewsDrafts } from './restore-news-drafts.mjs';
import { reuseNewsReviews } from './reuse-news-reviews.mjs';

const DAY = '2026-10-22', RESEARCH = '.cache/news-research', LEDGER = 'content/news-research.json';
const RECOVERY = `${RESEARCH}/recovery`;
const hash = bytes => createHash('sha256').update(bytes).digest('hex');

function fixture(t, now = Date.parse(`${DAY}T12:00:00Z`)) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'reuse-news-reviews-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const cwd = path.join(root, 'checkout'), artifact = path.join(root, 'artifact'), day = new Date(now).toISOString().slice(0, 10);
  const write = (base, relative, bytes) => { fs.mkdirSync(path.join(base, path.dirname(relative)), { recursive: true }); fs.writeFileSync(path.join(base, relative), bytes); };
  const json = (base, relative, value) => write(base, relative, JSON.stringify(value, null, 2) + '\n');
  const read = (base, relative) => fs.readFileSync(path.join(base, relative));
  const readJson = (base, relative) => JSON.parse(read(base, relative));
  fs.mkdirSync(cwd);
  const git = (args, input) => execFileSync('git', args, { cwd, input, encoding: 'utf8' }).trim();
  git(['init', '-q']);
  const context = { day, baseSha: git(['mktree'], ''), persist: true };
  const selection = { version: 1, status: 'selected', mode: 'explicit', day, repository: 'example/news-site',
    currentRunId: '39770000000', requestedRunId: '39767087666', workflow: '.github/workflows/refresh-jobs-cache.yml', branch: 'main',
    checkedAt: new Date(now).toISOString(), candidates: [{ runId: '39767087666', decision: 'selected' }],
    selection: { runId: '39767087666', runAttempt: 1, artifactId: '80001', artifactName: 'news-research-39767087666-1', createdAt: new Date(now).toISOString() } };
  const source = { version: 1, candidates: {}, runs: { [day]: { day, status: 'incomplete', candidateIds: [], outcomes: {}, baselineSlugs: [], discovery: { feeds: [{ ok: true }] } } } };
  const local = structuredClone(source); local.runs[day].status = 'prepared';
  const report = { day, status: 'incomplete', outcomes: [], publicationComplete: false };
  const saveSource = () => { json(artifact, LEDGER, source); json(artifact, `${RESEARCH}/report.json`, report); };
  const saveLocal = () => json(cwd, LEDGER, local);
  const add = (articleSlug, { pending = false, publishedDate = day } = {}) => {
    const link = `https://news.example/${articleSlug}`, id = hash(canonicalNewsUrl(link)).slice(0, 20);
    const record = { id, link, title: `Original reporting about ${articleSlug}`, status: 'ready', articleSlug,
      reason: 'verified-event', note: `The issuer and independent report both confirm the ${articleSlug} announcement and date.`,
      sourceChecks: [{ url: `https://primary.example/${articleSlug}`, outcome: 'read', note: 'Original read evidence' },
        { url: `https://independent.example/${articleSlug}`, outcome: 'read' }, { url: `https://blocked.example/${articleSlug}`, outcome: 'blocked', httpStatus: 403 }],
      reviewedAt: `${day}T00:00:00Z` };
    source.candidates[id] = { ...structuredClone(record), attempts: 1, lastReviewedDay: day };
    source.runs[day].candidateIds.push(id);
    if (!pending) source.runs[day].outcomes[id] = structuredClone(record);
    report.outcomes.push(pending ? { id, title: record.title, link, status: 'unreviewed' } : structuredClone(record));
    local.candidates[id] = { id, link, title: record.title, articleSlug, attempts: 0, status: 'pending' };
    local.runs[day].candidateIds.push(id);
    write(artifact, `${RECOVERY}/content/articles/${articleSlug}.md`, `---\r\ntitle: '${record.title}'\r\ncategory: News\r\npublishedDate: '${publishedDate}'\r\nimage: /images/news/${articleSlug}.jpg\r\n---\r\nOriginal article body — café.\r\n`);
    write(artifact, `${RECOVERY}/public/images/news/${articleSlug}.jpg`, Buffer.from([0, 255, 12, 34, 128]));
    return record;
  };
  json(cwd, `${RESEARCH}/current.json`, context);
  json(cwd, `${RESEARCH}/recovery-selection.json`, selection);
  const f = { root, cwd, artifact, now, day, env: {}, context, selection, source, local, report, add, write, json, read, readJson, git, saveSource, saveLocal };
  f.record = add('story');
  f.restore = () => { saveSource(); saveLocal(); return restoreNewsDrafts({ cwd, artifact, now }); };
  f.manifest = () => readJson(cwd, `${RESEARCH}/restored.json`);
  f.updateManifest = update => { const manifest = f.manifest(); update(manifest); json(cwd, `${RESEARCH}/restored.json`, manifest); };
  return f;
}

function snapshot(root) {
  const result = {};
  const visit = relative => {
    for (const entry of fs.readdirSync(path.join(root, relative), { withFileTypes: true })) {
      const file = path.join(relative, entry.name);
      if (entry.isDirectory()) visit(file);
      else result[file] = entry.isSymbolicLink() ? `symlink:${fs.readlinkSync(path.join(root, file))}` : hash(fs.readFileSync(path.join(root, file)));
    }
  };
  visit(''); return result;
}

function failsWithoutWrites(f, pattern) {
  const before = snapshot(f.cwd), sourceBefore = snapshot(f.artifact);
  assert.throws(() => reuseNewsReviews(f), pattern);
  assert.deepEqual(snapshot(f.cwd), before);
  assert.deepEqual(snapshot(f.artifact), sourceBefore);
}

test('explicitly reuses only 24 direct ready reviews, preserving timestamps/provenance and truthful pending work', t => {
  const f = fixture(t), records = [f.record];
  for (let i = 1; i < 24; i++) records.push(f.add(`story${i}`));
  const inherited = f.add('inherited', { pending: true }), old = f.add('older', { publishedDate: '2026-10-21' });
  f.json(f.artifact, `${RESEARCH}/restored.json`, { day: DAY, drafts: [inherited] });
  f.restore();
  const before = snapshot(f.cwd), sourceBefore = snapshot(f.artifact), originalPending = structuredClone([f.local.candidates[inherited.id], f.local.candidates[old.id]]);
  const dry = reuseNewsReviews({ ...f, reportOnly: true });
  assert.equal(dry.eligible, 24); assert.equal(dry.reused, 0); assert.equal(dry.counts.unreviewed, 26);
  assert.deepEqual(snapshot(f.cwd), before);
  const result = reuseNewsReviews(f), next = f.readJson(f.cwd, LEDGER), report = researchReport(next, DAY);
  assert.equal(result.reused, 24); assert.equal(result.eligible, 24);
  assert.equal(result.approved, false); assert.equal(result.requiresValidation, true);
  assert.deepEqual(result.requiredAudits, ['quality', 'source', 'image', 'date', 'duplicate', 'typecheck']);
  assert.deepEqual(result.skipped.map(item => item.articleSlug), ['inherited', 'older']);
  assert.match(result.skipped[0].reason, /inherited history is not eligible/);
  assert.match(result.skipped[1].reason, /date or review flags/);
  assert.equal(report.counts.ready, 24); assert.equal(report.counts.unreviewed, 2);
  assert.equal(report.counts.published, 0); assert.equal(report.publicationComplete, false); assert.equal(report.complete, false);
  assert.equal(next.runs[DAY].publication, undefined);
  for (const record of records) {
    const outcome = next.runs[DAY].outcomes[record.id], candidate = next.candidates[record.id];
    assert.equal(outcome.reviewedAt, record.reviewedAt);
    assert.equal(candidate.reviewedAt, record.reviewedAt);
    assert.deepEqual(outcome.sourceChecks, record.sourceChecks);
    assert.equal(outcome.note, record.note);
    assert.equal(candidate.attempts, 1);
    assert.equal(outcome.reusedFrom.runId, '39767087666');
    assert.equal(outcome.reusedFrom.artifactId, '80001');
    assert.equal(outcome.reusedFrom.artifactName, 'news-research-39767087666-1');
    assert.equal(outcome.reusedFrom.reportSha256, hash(f.read(f.artifact, `${RESEARCH}/report.json`)));
    assert.equal(outcome.reusedFrom.selectionSha256, hash(f.read(f.cwd, `${RESEARCH}/recovery-selection.json`)));
    assert.deepEqual(outcome.reusedFrom.sourceFiles, f.manifest().drafts.find(item => item.id === record.id).sourceFiles);
    assert.deepEqual(candidate.reusedFrom, outcome.reusedFrom);
  }
  assert.deepEqual([next.candidates[inherited.id], next.candidates[old.id]], originalPending);
  const after = snapshot(f.cwd);
  assert.deepEqual(Object.keys(after).filter(file => after[file] !== before[file]), [LEDGER]);
  assert.deepEqual(snapshot(f.artifact), sourceBefore);
  assert.ok(f.manifest().drafts.every(draft => draft.approved === false && draft.mustReview === true && draft.status === 'unreviewed'));
  failsWithoutWrites(f, /already has a current review/);
});

test('normal restoration never reuses reviews and does not require a selection journal', t => {
  const f = fixture(t);
  fs.unlinkSync(path.join(f.cwd, `${RESEARCH}/recovery-selection.json`));
  f.restore();
  assert.deepEqual(f.readJson(f.cwd, LEDGER), f.local);
  assert.equal(researchReport(f.local, DAY).counts.ready, 0);
  failsWithoutWrites(f, /Missing recovery file/);
});

test('nested historical ready reviews and ledger-only ready states cannot be promoted', t => {
  const f = fixture(t);
  f.report.outcomes[0] = { id: f.record.id, link: f.record.link, status: 'unreviewed' };
  f.json(f.artifact, `${RESEARCH}/restored.json`, { day: DAY, drafts: [{ ...f.record, recoveryReview: f.record,
    previousReviews: [{ source: 'report', review: f.record }] }] });
  f.restore();
  assert.equal(f.manifest().drafts[0].recoveryReview, undefined);
  f.updateManifest(manifest => { manifest.drafts[0].recoveryReview = f.record; });
  failsWithoutWrites(f, /No eligible.*inherited history is not eligible/);
});

test('old dates and review flags cannot be bypassed by a ready status or a forged current originalDate', t => {
  for (const mode of ['older', 'flags', 'forged-date']) {
    const f = fixture(t);
    if (mode !== 'flags') f.write(f.artifact, `${RECOVERY}/content/articles/story.md`, f.read(f.artifact, `${RECOVERY}/content/articles/story.md`).toString().replace(DAY, '2026-10-21'));
    f.restore();
    if (mode === 'flags') f.updateManifest(manifest => { manifest.drafts[0].reviewReasons.push('publication-date-needs-review'); });
    if (mode === 'forged-date') f.updateManifest(manifest => { manifest.drafts[0].originalDate = DAY; manifest.drafts[0].reviewReasons = []; });
    failsWithoutWrites(f, /No eligible|current-day News article/);
  }
});

test('all reviews are validated before any ledger write, including the existing independent-host rules', t => {
  for (const checks of [
    [{ url: 'https://one.example/a', outcome: 'read' }],
    [{ url: 'https://www.one.example/a', outcome: 'read' }, { url: 'https://amp.one.example/b', outcome: 'read' }],
    [{ url: 'https://one.example/a', outcome: 'read' }, { url: 'https://hashtagweb3.com/b', outcome: 'read' }],
    [{ url: 'https://one.example/a', outcome: 'read' }, { url: 'https://two.example/b', outcome: 'blocked' }],
    [{ url: 'https://one.example/a', outcome: 'read' }, { url: 'https://two.example/b', outcome: 'unavailable' }],
    [{ url: 'https://one.example/a', outcome: 'read' }, { url: 'https://user:password@two.example/b', outcome: 'read' }],
  ]) {
    const f = fixture(t), second = f.add('second');
    f.report.outcomes.find(item => item.id === second.id).sourceChecks = checks;
    f.restore();
    failsWithoutWrites(f, /two independent|Invalid source checks/);
    assert.equal(f.readJson(f.cwd, LEDGER).runs[DAY].outcomes[f.record.id], undefined);
  }
});

test('original review timestamps must be strict, real same-day UTC times, non-future and before upload', t => {
  for (const reviewedAt of ['2026-10-21T23:59:00Z', '2026-10-23T00:00:00Z', `${DAY}T12:00:01Z`, `${DAY}T24:00:00Z`,
    '2026-02-30T04:00:00Z', `${DAY}T04:00:00`, `${DAY}T04:00:00+00:00`, 'not-a-date', undefined]) {
    const f = fixture(t);
    f.report.outcomes[0].reviewedAt = reviewedAt;
    f.restore(); failsWithoutWrites(f, /Original reviewedAt/);
  }
  const f = fixture(t);
  f.selection.selection.createdAt = `${DAY}T02:00:00Z`;
  f.json(f.cwd, `${RESEARCH}/recovery-selection.json`, f.selection);
  f.report.outcomes[0].reviewedAt = `${DAY}T03:00:00.123Z`;
  f.restore(); failsWithoutWrites(f, /before artifact upload/);
});

test('candidate IDs, canonical URLs and existing draft owners must agree', t => {
  for (const mode of ['url', 'source-url', 'missing', 'not-queued', 'different-slug', 'current-outcome', 'other-owner', 'source-owner', 'report-owner']) {
    const f = fixture(t), other = f.add('other');
    if (mode === 'source-url') f.source.candidates[f.record.id].link = 'https://unrelated.example/other';
    f.restore();
    if (['source-owner', 'report-owner'].includes(mode)) {
      if (mode === 'source-owner') f.source.candidates[other.id].articleSlug = 'story';
      if (mode === 'report-owner') f.report.outcomes.find(item => item.id === other.id).articleSlug = 'story';
      f.saveSource();
      f.updateManifest(manifest => { manifest.recoverySource.reportSha256 = hash(f.read(f.artifact, `${RESEARCH}/report.json`)); });
    }
    if (mode === 'url') f.local.candidates[f.record.id].link = 'https://unrelated.example/other';
    if (mode === 'missing') { delete f.local.candidates[f.record.id]; f.local.runs[DAY].candidateIds.shift(); }
    if (mode === 'not-queued') f.local.runs[DAY].candidateIds.shift();
    if (mode === 'different-slug') f.local.candidates[f.record.id].articleSlug = 'different';
    if (mode === 'current-outcome') f.local.runs[DAY].outcomes[f.record.id] = { ...f.record, status: 'rejected' };
    if (mode === 'other-owner') f.local.candidates[other.id].articleSlug = 'story';
    f.saveLocal();
    failsWithoutWrites(f, /identity|ownership|owns this draft|already has a current review/);
  }
  const canonical = fixture(t); canonical.restore();
  canonical.local.candidates[canonical.record.id].link = 'https://www.news.example/story/?utm_source=test#fragment'; canonical.saveLocal();
  assert.equal(reuseNewsReviews(canonical).reused, 1);
});

test('changed article/image bytes and changed manifest or artifact evidence cannot reuse', t => {
  for (const mode of ['body', 'image', 'source-body', 'source-image', 'hash', 'evidence', 'report', 'selection', 'source-path', 'missing-image']) {
    const f = fixture(t); f.restore();
    if (mode === 'body') f.write(f.cwd, 'content/articles/story.md', Buffer.concat([f.read(f.cwd, 'content/articles/story.md'), Buffer.from('Changed body')]));
    if (mode === 'image') f.write(f.cwd, 'public/images/news/story.jpg', 'changed image');
    if (mode === 'source-body') f.write(f.artifact, `${RECOVERY}/content/articles/story.md`, 'changed source');
    if (mode === 'source-image') f.write(f.artifact, `${RECOVERY}/public/images/news/story.jpg`, 'changed image');
    if (mode === 'hash') f.updateManifest(manifest => { manifest.drafts[0].sourceFiles[0].sha256 = '0'.repeat(64); });
    if (mode === 'evidence') f.updateManifest(manifest => { manifest.drafts[0].recoveryReview.reviewedAt = `${DAY}T01:00:00Z`; });
    if (mode === 'report') f.json(f.artifact, `${RESEARCH}/report.json`, { ...f.report, extra: true });
    if (mode === 'selection') f.json(f.cwd, `${RESEARCH}/recovery-selection.json`, { ...f.selection, extra: true });
    if (mode === 'source-path') f.updateManifest(manifest => { manifest.drafts[0].sourceFiles[0].path = 'content/articles/../story.md'; });
    if (mode === 'missing-image') fs.unlinkSync(path.join(f.cwd, 'public/images/news/story.jpg'));
    failsWithoutWrites(f, /hash|recoveryReview|Unsafe restored|Missing recovery/);
  }
});

test('unsafe files, directories, roots, metadata symlinks and hard links fail without writing', t => {
  for (const base of ['cwd', 'artifact']) for (const relative of [
    ...(base === 'cwd' ? ['content/articles/story.md', 'public/images/news/story.jpg', 'content/articles', `${RESEARCH}/current.json`, `${RESEARCH}/recovery-selection.json`, `${RESEARCH}/restored.json`]
      : [`${RECOVERY}/content/articles/story.md`, `${RECOVERY}/public/images/news/story.jpg`, `${RECOVERY}/public/images`, `${RESEARCH}/report.json`]), LEDGER,
  ]) {
    const f = fixture(t); f.restore();
    const original = path.join(f[base], relative), saved = `${original}-saved`;
    fs.renameSync(original, saved); fs.symlinkSync(saved, original);
    failsWithoutWrites(f, /Unsafe recovery path/);
  }
  for (const base of ['cwd', 'artifact']) {
    const f = fixture(t); f.restore();
    const alias = path.join(f.root, `${base}-alias`); fs.symlinkSync(f[base], alias);
    assert.throws(() => reuseNewsReviews({ ...f, [base]: alias }), /not a symlink/);
  }
  const f = fixture(t); f.restore();
  fs.linkSync(path.join(f.cwd, 'content/articles/story.md'), path.join(f.cwd, 'hardlink'));
  failsWithoutWrites(f, /Hard-linked/);
});

test('published records, ledger baselines, closed runs and Git baselines cannot be reopened', t => {
  for (const mode of ['published', 'publishedAt', 'baseline', 'history', 'closed', 'publishedSha', 'git-article', 'git-image']) {
    const f = fixture(t); f.restore();
    if (mode === 'published') f.local.candidates[f.record.id].status = 'published';
    if (mode === 'publishedAt') f.local.candidates[f.record.id].publishedAt = `${DAY}T05:00:00Z`;
    if (mode === 'baseline') f.local.runs[DAY].baselineSlugs.push('story');
    if (mode === 'history') f.local.runs['2026-10-21'] = { day: '2026-10-21', status: 'incomplete', candidateIds: [f.record.id], baselineSlugs: [], outcomes: { [f.record.id]: { ...f.record, status: 'published' } } };
    if (mode === 'closed') f.local.runs[DAY].status = 'completed';
    if (mode === 'publishedSha') { f.context.publishedSha = 'a'.repeat(40); f.json(f.cwd, `${RESEARCH}/current.json`, f.context); }
    if (mode.startsWith('git-')) {
      const image = mode === 'git-image', blob = f.git(['hash-object', '-w', '--stdin'], 'Published');
      let tree = f.git(['mktree'], `100644 blob ${blob}\tstory.${image ? 'jpg' : 'md'}\n`);
      for (const directory of image ? ['news', 'images', 'public'] : ['articles', 'content']) tree = f.git(['mktree'], `040000 tree ${tree}\t${directory}\n`);
      f.context.baseSha = tree; f.json(f.cwd, `${RESEARCH}/current.json`, f.context);
    }
    f.saveLocal(); failsWithoutWrites(f, /published|baseline/);
  }
});

test('an incomplete run with a completed partial-publication receipt still prohibits a second daily publication', t => {
  const f = fixture(t), published = f.add('published'); f.restore();
  reviewCandidate(f.local, DAY, published, { articles: [{ slug: published.articleSlug }], now: f.now });
  finalizeResearch(f.local, DAY, { allowBacklogPublication: true, now: f.now });
  assert.equal(f.local.runs[DAY].status, 'incomplete');
  assert.equal(researchReport(f.local, DAY).publicationComplete, true);
  f.saveLocal();
  failsWithoutWrites(f, /open, unpublished daily research run/);
});

test('source publication/baselines and wrong-day or conflicting current-report identities cannot be relabeled for reuse', t => {
  for (const mode of ['source-published', 'source-baseline', 'source-closed', 'report-published', 'report-day', 'report-duplicate', 'report-slug']) {
    const f = fixture(t); f.restore();
    if (mode === 'source-published') f.source.candidates[f.record.id].status = 'published';
    if (mode === 'source-baseline') f.source.runs[DAY].baselineSlugs.push('story');
    if (mode === 'source-closed') f.source.runs[DAY].status = 'completed';
    if (mode === 'report-published') f.report.outcomes[0].status = 'published';
    if (mode === 'report-day') f.report.day = '2026-10-21';
    if (mode === 'report-duplicate') f.report.outcomes.push(structuredClone(f.record));
    if (mode === 'report-slug') f.report.outcomes[0].articleSlug = 'different';
    f.saveSource();
    f.updateManifest(manifest => { manifest.recoverySource.reportSha256 = hash(f.read(f.artifact, `${RESEARCH}/report.json`)); });
    failsWithoutWrites(f, /published|baseline|closed|publication|wrong-day|matching restored draft/);
  }
});

test('wrong-day context and untrusted selection metadata fail even when restored after that metadata was written', t => {
  for (const change of [
    journal => { journal.status = 'none'; }, journal => { journal.version = 2; }, journal => { journal.day = '2026-10-21'; },
    journal => { journal.branch = 'feature'; }, journal => { journal.workflow = '.github/workflows/unrelated.yml'; },
    journal => { journal.selection.artifactName = 'news-research-123-1'; }, journal => { journal.selection.runId = journal.currentRunId; },
    journal => { journal.checkedAt = `${DAY}T12:01:00Z`; }, journal => { journal.selection.createdAt = '2026-10-21T23:59:59Z'; },
    journal => { journal.requestedRunId = '123'; }, journal => { journal.candidates = []; },
  ]) {
    const f = fixture(t); change(f.selection); f.json(f.cwd, `${RESEARCH}/recovery-selection.json`, f.selection);
    f.restore(); failsWithoutWrites(f, /trusted selected|timestamp/);
  }
  for (const day of ['2026-10-21', '2026-10-23', '2026-02-30']) {
    const f = fixture(t); f.restore(); f.json(f.cwd, `${RESEARCH}/current.json`, { ...f.context, day });
    failsWithoutWrites(f, /actual current prepared/);
  }
  for (const env of [{ GITHUB_RUN_ID: '123' }, { GITHUB_REPOSITORY: 'other/repo' }, { NEWS_RECOVERY_RUN: '123' }, { NEWS_DATE: '2026-10-21' }]) {
    const f = fixture(t); f.restore(); failsWithoutWrites({ ...f, env }, /environment|actual current/);
  }
});

test('a changed input during validation aborts without replacing the ledger', t => {
  const f = fixture(t); f.restore();
  const ledgerBefore = f.read(f.cwd, LEDGER), readFile = fs.readFileSync;
  let changed = false;
  t.mock.method(fs, 'readFileSync', function (file, ...args) {
    const bytes = readFile.call(this, file, ...args);
    if (!changed && file === path.join(fs.realpathSync(f.artifact), `${RECOVERY}/public/images/news/story.jpg`)) {
      changed = true; fs.writeFileSync(path.join(f.cwd, 'content/articles/story.md'), 'Changed while validating');
    }
    return bytes;
  });
  assert.throws(() => reuseNewsReviews(f), /changed during validation/);
  assert.equal(changed, true);
  assert.deepEqual(f.read(f.cwd, LEDGER), ledgerBefore);
  assert.equal(fs.readdirSync(path.join(f.cwd, 'content')).some(file => file.includes('.tmp')), false);
});

test('CLI is read-only by default, needs --apply to write locally, and fails visibly with no eligible reviews', t => {
  const f = fixture(t, Date.now()); f.restore();
  const script = new URL('./reuse-news-reviews.mjs', import.meta.url).pathname;
  const env = { ...process.env };
  for (const key of ['GITHUB_REPOSITORY', 'GITHUB_RUN_ID', 'NEWS_RECOVERY_RUN', 'NEWS_DATE']) delete env[key];
  const args = [script, '--artifact', f.artifact], before = snapshot(f.cwd), sourceBefore = snapshot(f.artifact);
  const dry = spawnSync(process.execPath, args, { cwd: f.cwd, encoding: 'utf8', env });
  assert.equal(dry.status, 0, dry.stderr);
  assert.equal(JSON.parse(dry.stdout).reportOnly, true); assert.equal(JSON.parse(dry.stdout).reused, 0);
  assert.deepEqual(snapshot(f.cwd), before);
  const applied = spawnSync(process.execPath, [...args, '--apply'], { cwd: f.cwd, encoding: 'utf8', env });
  assert.equal(applied.status, 0, applied.stderr);
  assert.equal(JSON.parse(applied.stdout).reused, 1); assert.equal(JSON.parse(applied.stdout).publicationComplete, false);
  assert.deepEqual(snapshot(f.artifact), sourceBefore);
  const none = fixture(t, Date.now()); none.report.outcomes[0].status = 'unreviewed'; none.restore();
  const noneBefore = snapshot(none.cwd);
  const failed = spawnSync(process.execPath, [script, '--artifact', none.artifact, '--apply'], { cwd: none.cwd, encoding: 'utf8', env });
  assert.equal(failed.status, 1); assert.match(failed.stderr, /No eligible/); assert.equal(failed.stdout, '');
  assert.deepEqual(snapshot(none.cwd), noneBefore);
});
