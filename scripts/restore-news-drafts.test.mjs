import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { test } from 'node:test';
import { restoreNewsDrafts } from './restore-news-drafts.mjs';

const DAY = '2026-10-19';
const RESEARCH = '.cache/news-research';
const RECOVERY = `${RESEARCH}/recovery`;
const copy = value => structuredClone(value);

function fixture(t, day = DAY) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'news-recovery-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const cwd = path.join(root, 'checkout'), artifact = path.join(root, 'artifact');
  const write = (base, relative, text) => { const file = path.join(base, relative); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, text); };
  const json = (base, relative, value) => write(base, relative, JSON.stringify(value, null, 2) + '\n');
  const read = (base, relative) => fs.readFileSync(path.join(base, relative));
  const manifest = () => JSON.parse(read(cwd, `${RESEARCH}/restored.json`));
  const report = { day, outcomes: [] };
  const run = { day, candidateIds: [], outcomes: {}, baselineSlugs: [] };
  const ledger = { version: 1, candidates: {}, runs: { [day]: run } };
  const persist = () => { json(artifact, `${RESEARCH}/report.json`, report); json(artifact, 'content/news-research.json', ledger); };
  const addDraft = (articleSlug, options = {}) => {
    const record = { id: `candidate-${articleSlug}`, articleSlug, title: `Reporting about ${articleSlug}`, link: `https://news.example/${articleSlug}`,
      status: 'ready', reason: 'verified-event', note: 'Previously attempted source checks; recovery still needs independent review.', reviewedAt: `${day}T04:00:00.000Z`,
      sourceChecks: [{ url: `https://primary.example/${articleSlug}`, outcome: 'read', note: 'Original evidence note' }, { url: `https://independent.example/${articleSlug}`, outcome: 'blocked', httpStatus: 403 }, { url: `https://archive.example/${articleSlug}`, outcome: 'unavailable' }] };
    ledger.candidates[record.id] = { ...copy(record), lastReviewedDay: day };
    run.candidateIds.push(record.id);
    run.outcomes[record.id] = copy(record);
    report.outcomes.push(copy(record));
    write(artifact, `${RECOVERY}/content/articles/${articleSlug}.md`, options.bytes || `---\r\ncategory: ${options.category || 'News'}\r\nimage: ${options.image || `/images/news/${articleSlug}.jpg`}\r\npublishedDate: '${options.publishedDate || day}'\r\n---\r\nUnpublished draft — café.\r\n`);
    write(artifact, `${RECOVERY}/public/images/news/${articleSlug}.jpg`, Buffer.from([0, 255, 13, 10, 128, 72, 87, 51]));
    persist();
    return record;
  };
  json(cwd, `${RESEARCH}/current.json`, { day: DAY });
  json(cwd, 'content/news-research.json', { version: 1, candidates: {}, runs: {} });
  const record = addDraft('story');
  return { root, cwd, artifact, now: Date.parse(`${DAY}T12:00:00Z`), write, json, read, manifest, report, run, ledger, persist, addDraft, record };
}

function snapshot(root) {
  const files = {};
  const visit = relative => {
    for (const item of fs.readdirSync(path.join(root, relative), { withFileTypes: true })) {
      const file = path.join(relative, item.name);
      if (item.isDirectory()) visit(file);
      else files[file] = item.isSymbolicLink() ? `symlink:${fs.readlinkSync(path.join(root, file))}` : createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');
    }
  };
  visit('');
  return files;
}

function failsWithoutChanges(f, pattern) {
  const before = snapshot(f.cwd), artifactBefore = snapshot(f.artifact);
  assert.throws(() => restoreNewsDrafts(f), pattern);
  assert.deepEqual(snapshot(f.cwd), before);
  assert.deepEqual(snapshot(f.artifact), artifactBefore);
}

function resetOutcome(f, record) {
  f.ledger.candidates[record.id].status = 'pending';
  delete f.run.outcomes[record.id];
  f.report.outcomes = f.report.outcomes.map(item => item.id === record.id ? { id: record.id, title: record.title, link: record.link, status: 'unreviewed' } : item);
  f.persist();
}

test('restores exact draft/image bytes and source checks for re-review without changing either research ledger', t => {
  const f = fixture(t), ledgerBefore = f.read(f.cwd, 'content/news-research.json'), artifactBefore = snapshot(f.artifact);
  const contextBefore = f.read(f.cwd, `${RESEARCH}/current.json`);
  assert.deepEqual(restoreNewsDrafts(f), { drafts: 1, files: 2 });
  assert.deepEqual(f.read(f.cwd, 'content/news-research.json'), ledgerBefore);
  assert.deepEqual(f.read(f.cwd, `${RESEARCH}/current.json`), contextBefore);
  assert.deepEqual(snapshot(f.artifact), artifactBefore);
  for (const relative of ['content/articles/story.md', 'public/images/news/story.jpg']) assert.deepEqual(f.read(f.cwd, relative), f.read(f.artifact, `${RECOVERY}/${relative}`));
  const manifest = f.manifest(), [draft] = manifest.drafts;
  assert.equal(manifest.mustReview, true);
  assert.equal(manifest.approved, false);
  assert.equal(draft.status, 'unreviewed');
  assert.equal(draft.previousStatus, 'ready');
  assert.equal(draft.mustReview, true);
  assert.equal(draft.approved, false);
  assert.equal(draft.originalDate, DAY);
  assert.deepEqual(draft.reviewReasons, []);
  assert.deepEqual(draft.sourceChecks, f.record.sourceChecks);
  assert.equal(draft.note, f.record.note);
  assert.equal(draft.reviewedAt, f.record.reviewedAt);
  assert.deepEqual(draft.recoveryReview, Object.fromEntries(['id', 'articleSlug', 'link', 'status', 'reason', 'note', 'reviewedAt', 'sourceChecks'].map(key => [key, f.record[key]])));
  assert.deepEqual(draft.sourceFiles, ['content/articles/story.md', 'public/images/news/story.jpg'].map(relative => ({
    path: relative, sha256: createHash('sha256').update(f.read(f.artifact, `${RECOVERY}/${relative}`)).digest('hex'),
  })));
  assert.deepEqual(manifest.recoverySource, { artifact: fs.realpathSync(f.artifact), reportSha256: createHash('sha256').update(f.read(f.artifact, `${RESEARCH}/report.json`)).digest('hex') });
});

test('same-day unfinished checkpoints restore draft bytes without restoring any ready approval', t => {
  const f = fixture(t);
  resetOutcome(f, f.record);
  const candidate = f.ledger.candidates[f.record.id];
  delete candidate.lastReviewedDay;
  delete candidate.sourceChecks;
  candidate.draftProgress = { id: f.record.id, articleSlug: 'story', day: DAY, sourceChecks: f.record.sourceChecks, note: 'Source work is partial; final checks remain unfinished.', approved: false, mustReview: true };
  f.persist();
  assert.deepEqual(restoreNewsDrafts(f), { drafts: 1, files: 2 });
  const restored = f.manifest().drafts[0];
  assert.equal(restored.status, 'unreviewed'); assert.equal(restored.approved, false);
  assert.equal(restored.recoveryReview, undefined);
  assert.deepEqual(restored.sourceChecks, f.record.sourceChecks);
});

test('recovers all 22 owned drafts from a same-day artifact, flagging 18 older-dated drafts for re-review', t => {
  const f = fixture(t), records = [f.record];
  for (let i = 1; i < 22; i++) records.push(f.addDraft(`story${i}`, { publishedDate: i >= 2 && i < 20 ? '2026-10-18' : DAY }));
  f.json(f.artifact, `${RESEARCH}/restored.json`, { day: DAY, drafts: records.slice(0, 20) });
  for (const record of records.slice(2, 20)) resetOutcome(f, record);
  f.report.outcomes[0].sourceChecks.push({ url: 'https://later.example/new-check', outcome: 'read' });
  f.persist();
  const ledgerBefore = f.read(f.cwd, 'content/news-research.json'), artifactBefore = snapshot(f.artifact);
  assert.equal(f.report.outcomes.filter(item => item.status === 'ready').length, 4);
  assert.deepEqual(restoreNewsDrafts(f), { drafts: 22, files: 44 });
  const manifest = f.manifest();
  assert.equal(new Set(manifest.drafts.map(item => item.articleSlug)).size, 22);
  assert.equal(manifest.drafts.filter(item => item.inherited).length, 20);
  assert.equal(manifest.drafts.filter(item => item.reviewReasons.includes('publication-date-needs-review')).length, 18);
  for (const [index, record] of records.entries()) {
    const draft = manifest.drafts.find(item => item.id === record.id);
    assert.equal(draft.mustReview, true);
    assert.equal(draft.approved, false);
    assert.equal(draft.status, 'unreviewed');
    assert.equal(draft.originalDate, index >= 2 && index < 20 ? '2026-10-18' : DAY);
    assert.equal(Boolean(draft.recoveryReview), !(index >= 2 && index < 20));
    assert.deepEqual(draft.reviewReasons, index >= 2 && index < 20 ? ['publication-date-needs-review'] : []);
    assert.ok(draft.previousReviews.some(item => assertSourceChecks(item.review.sourceChecks, record.sourceChecks)));
    for (const file of [`content/articles/${record.articleSlug}.md`, `public/images/news/${record.articleSlug}.jpg`]) assert.deepEqual(f.read(f.cwd, file), f.read(f.artifact, `${RECOVERY}/${file}`));
  }
  assert.deepEqual(f.read(f.cwd, 'content/news-research.json'), ledgerBefore);
  assert.deepEqual(snapshot(f.artifact), artifactBefore);
});

function assertSourceChecks(actual, expected) {
  return JSON.stringify(actual) === JSON.stringify(expected);
}

test('ledger ownership survives a reset outcome even without a prior restored manifest', t => {
  const f = fixture(t);
  resetOutcome(f, f.record);
  assert.deepEqual(restoreNewsDrafts(f), { drafts: 1, files: 2 });
  assert.deepEqual(f.manifest().drafts[0].sourceChecks, f.record.sourceChecks);
  assert.equal(f.manifest().drafts[0].previousStatus, 'pending');
  assert.equal(f.manifest().drafts[0].recoveryReview, undefined);
});

test('an absent old pending draft does not block recoverable work, but a missing ready draft remains an error', t => {
  const f = fixture(t), missing = f.addDraft('missing');
  resetOutcome(f, missing);
  fs.unlinkSync(path.join(f.artifact, `${RECOVERY}/content/articles/missing.md`));
  assert.deepEqual(restoreNewsDrafts(f), { drafts: 1, files: 2 });
  assert.equal(f.manifest().drafts[0].articleSlug, 'story');
  assert.ok(f.manifest().ignored.some(item => item.file.endsWith('missing.md') && item.reason.includes('still needs research')));
  const ready = fixture(t);
  fs.unlinkSync(path.join(ready.artifact, `${RECOVERY}/content/articles/story.md`));
  failsWithoutChanges(ready, /Missing recovery file/);
});

test('inherited ownership and full source history survive repeated restoration without any ready outcome', t => {
  const first = fixture(t);
  first.write(first.artifact, `${RECOVERY}/content/articles/story.md`, "---\r\ncategory: News\r\nimage: /images/news/story.jpg\r\npublishedDate: '2026-10-18'\r\nlastUpdated: '2026-10-18'\r\neventDate: '2026-10-17'\r\n---\r\nThe issuer announced the event on Oct. 17, 2026 — café.\r\n");
  const originalBytes = first.read(first.artifact, `${RECOVERY}/content/articles/story.md`);
  first.json(first.artifact, `${RESEARCH}/restored.json`, { day: DAY, drafts: [first.record] });
  first.ledger.candidates = {};
  first.run.outcomes = {};
  first.run.candidateIds = [];
  first.report.outcomes = [];
  first.persist();
  const firstLedgerBefore = first.read(first.cwd, 'content/news-research.json'), firstArtifactBefore = snapshot(first.artifact);
  assert.deepEqual(restoreNewsDrafts(first), { drafts: 1, files: 2 });
  assert.deepEqual(first.read(first.cwd, 'content/articles/story.md'), originalBytes);
  assert.deepEqual(first.read(first.cwd, 'content/news-research.json'), firstLedgerBefore);
  assert.deepEqual(snapshot(first.artifact), firstArtifactBefore);
  assert.equal(first.manifest().drafts[0].originalDate, '2026-10-18');
  assert.deepEqual(first.manifest().drafts[0].reviewReasons, ['publication-date-needs-review']);
  const next = fixture(t);
  next.write(next.artifact, `${RECOVERY}/content/articles/story.md`, originalBytes);
  next.json(next.artifact, `${RESEARCH}/restored.json`, first.manifest());
  fs.unlinkSync(path.join(next.artifact, 'content/news-research.json'));
  next.json(next.artifact, `${RESEARCH}/report.json`, { day: DAY, outcomes: [] });
  const nextLedgerBefore = next.read(next.cwd, 'content/news-research.json'), nextArtifactBefore = snapshot(next.artifact);
  assert.deepEqual(restoreNewsDrafts(next), { drafts: 1, files: 2 });
  const [draft] = next.manifest().drafts;
  assert.deepEqual(draft.sourceChecks, first.record.sourceChecks);
  assert.equal(draft.status, 'unreviewed');
  assert.equal(draft.inherited, true);
  assert.equal(draft.mustReview, true);
  assert.equal(draft.approved, false);
  assert.equal(draft.originalDate, '2026-10-18');
  assert.equal(draft.recoveryReview, undefined);
  assert.deepEqual(draft.reviewReasons, ['publication-date-needs-review']);
  assert.deepEqual(next.read(next.cwd, 'content/articles/story.md'), originalBytes);
  assert.deepEqual(next.read(next.cwd, 'content/news-research.json'), nextLedgerBefore);
  assert.deepEqual(snapshot(next.artifact), nextArtifactBefore);
  assert.ok(draft.previousReviews.some(item => assertSourceChecks(item.review.sourceChecks, first.record.sourceChecks)));
  assert.ok(draft.previousReviews.some(item => item.review.originalDate === '2026-10-18' && item.review.reviewReasons.includes('publication-date-needs-review')));
});

test('unrecorded orphans are ignored even with source links, a queue candidate, or a ready report entry', t => {
  const f = fixture(t), near = f.addDraft('nearissuance'), orphan = f.addDraft('orphan');
  delete f.ledger.candidates[near.id].articleSlug;
  delete f.ledger.candidates[orphan.id];
  delete f.run.outcomes[orphan.id];
  f.report.outcomes = f.report.outcomes.filter(item => item.id !== orphan.id);
  f.persist();
  assert.deepEqual(restoreNewsDrafts(f), { drafts: 1, files: 2 });
  assert.equal(f.manifest().ignored.length, 2);
  for (const slug of ['nearissuance', 'orphan']) {
    assert.equal(fs.existsSync(path.join(f.cwd, `content/articles/${slug}.md`)), false);
    assert.equal(fs.existsSync(path.join(f.cwd, `public/images/news/${slug}.jpg`)), false);
  }
});

test('an older candidate outside the daily run does not establish ownership', t => {
  const f = fixture(t);
  f.ledger.candidates[f.record.id].lastReviewedDay = '2026-10-18';
  f.report.outcomes = [];
  f.run.candidateIds = [];
  f.run.outcomes = {};
  f.persist();
  assert.deepEqual(restoreNewsDrafts(f), { drafts: 0, files: 0 });
  assert.equal(f.manifest().ignored.length, 1);
});

test('owned drafts require actual recorded source checks rather than just a source URL', t => {
  for (const sourceChecks of [[], undefined, [{ url: 'not a URL', outcome: 'read' }], [{ url: 'file:///unrelated', outcome: 'read' }], [{ url: 'https://example.com', outcome: 'approved' }]]) {
    const f = fixture(t);
    f.ledger.candidates[f.record.id].sourceChecks = sourceChecks;
    f.run.outcomes[f.record.id].sourceChecks = sourceChecks;
    f.report.outcomes[0].sourceChecks = sourceChecks;
    f.persist();
    failsWithoutChanges(f, /no recorded source checks/);
  }
});

test('blocked-only research is recoverable as unapproved work and cannot become a ready outcome', t => {
  const f = fixture(t);
  f.ledger.candidates[f.record.id].sourceChecks = [{ url: 'https://source.example/story', outcome: 'blocked' }];
  resetOutcome(f, f.record);
  assert.deepEqual(restoreNewsDrafts(f), { drafts: 1, files: 2 });
  assert.deepEqual(f.manifest().drafts[0].sourceChecks, f.ledger.candidates[f.record.id].sourceChecks);
  assert.equal(f.manifest().drafts[0].status, 'unreviewed');
  assert.equal(f.manifest().drafts[0].recoveryReview, undefined);
});

test('fresh file and selection hashes replace inherited evidence while nested ready history never becomes recoveryReview', t => {
  const f = fixture(t);
  const selection = { status: 'selected', selection: { runId: '39767087666' } };
  f.json(f.cwd, `${RESEARCH}/recovery-selection.json`, selection);
  f.ledger.candidates[f.record.id].recoveryReview = copy(f.record);
  f.json(f.artifact, `${RESEARCH}/restored.json`, { day: DAY, drafts: [{ ...f.record, recoveryReview: f.record,
    sourceFiles: [{ path: 'content/articles/story.md', sha256: '0'.repeat(64) }], previousReviews: [{ source: 'report', review: f.record }] }] });
  resetOutcome(f, f.record);
  restoreNewsDrafts(f);
  const manifest = f.manifest(), [draft] = manifest.drafts;
  assert.equal(draft.recoveryReview, undefined);
  assert.equal(draft.status, 'unreviewed');
  assert.equal(draft.approved, false);
  assert.equal(draft.mustReview, true);
  assert.equal(draft.sourceFiles.length, 2);
  assert.ok(draft.sourceFiles.every(file => file.sha256 === createHash('sha256').update(f.read(f.artifact, `${RECOVERY}/${file.path}`)).digest('hex')));
  assert.equal(manifest.recoverySource.selectionSha256, createHash('sha256').update(f.read(f.cwd, `${RESEARCH}/recovery-selection.json`)).digest('hex'));
});

test('current report alone supplies reuse evidence even when ledger and inherited ready reviews disagree', t => {
  const f = fixture(t);
  f.json(f.artifact, `${RESEARCH}/restored.json`, { day: DAY, drafts: [{ ...f.record, reviewedAt: '2026-10-18T04:00:00Z' }] });
  f.report.outcomes[0].reviewedAt = `${DAY}T06:00:00Z`;
  f.report.outcomes[0].sourceChecks.push({ url: 'https://new.example/current', outcome: 'read' });
  f.persist();
  restoreNewsDrafts(f);
  const [draft] = f.manifest().drafts;
  assert.equal(draft.recoveryReview.reviewedAt, `${DAY}T06:00:00Z`);
  assert.deepEqual(draft.recoveryReview.sourceChecks, f.report.outcomes[0].sourceChecks);
  assert.equal(draft.inherited, true);
  assert.equal(draft.approved, false);
});

test('different-day, missing-image and overwrite conflicts fail before copying any drafts', t => {
  for (const issue of ['date', 'image', 'overwrite', 'article', 'manifest']) {
    const f = fixture(t, issue === 'date' ? '2026-10-18' : DAY);
    if (issue === 'image') fs.unlinkSync(path.join(f.artifact, `${RECOVERY}/public/images/news/story.jpg`));
    if (issue === 'overwrite') f.write(f.cwd, 'public/images/news/story.jpg', 'published image');
    if (issue === 'article') f.write(f.cwd, 'content/articles/story.md', 'existing article');
    if (issue === 'manifest') f.write(f.cwd, `${RESEARCH}/restored.json`, 'existing manifest');
    failsWithoutChanges(f);
  }
});

test('future and invalid publishedDate still fail without redating or partial restoration', t => {
  for (const publishedDate of ['2026-10-20', '2026-02-30', '2026-02-29', '2026-10-19T00:00:00Z', '2026-2-9', 'not-a-date']) {
    const f = fixture(t);
    f.addDraft('later', { publishedDate });
    failsWithoutChanges(f, /publishedDate must be a valid YYYY-MM-DD date on or before/);
  }
  for (const value of ['publishedDate: 2026-10-19', 'publishedDate: null', 'lastUpdated: 2026-10-19']) {
    const f = fixture(t);
    f.write(f.artifact, `${RECOVERY}/content/articles/story.md`, `---\ncategory: News\nimage: /images/news/story.jpg\n${value}\n---\nUnpublished draft.`);
    failsWithoutChanges(f, /publishedDate must be a valid YYYY-MM-DD date on or before/);
  }
});

test('current context and inherited manifest must belong to the actual recovery day', t => {
  for (const day of ['2026-10-18', '2026-10-20', '2026-02-30', '../2026-10-19']) {
    const f = fixture(t);
    f.json(f.cwd, `${RESEARCH}/current.json`, { day });
    failsWithoutChanges(f, /actual current UTC news date/);
  }
  const f = fixture(t);
  f.json(f.artifact, `${RESEARCH}/restored.json`, { day: '2026-10-18', drafts: [f.record] });
  failsWithoutChanges(f, /different-day restored/);
  assert.throws(() => restoreNewsDrafts({ ...f, day: DAY }), /only allowed in report-only/);
});

test('non-news drafts and mismatched, remote or traversing images fail before copying', t => {
  for (const options of [{ category: 'Guides' }, { image: '/images/news/story.jpg' }, { image: 'https://example.com/later.jpg' }, { image: '/images/news/../later.jpg' }, { image: '/images/news/later.svg' }, { image: '"/images/news/later.jpg\\n"' }]) {
    const f = fixture(t);
    f.addDraft('later', options);
    failsWithoutChanges(f, /non-news|matching article-specific/);
  }
});

test('recovery refuses executable front matter', t => {
  const f = fixture(t);
  const marker = 'newsRecoveryExecutedUntrustedFrontMatter';
  f.write(f.artifact, `${RECOVERY}/content/articles/story.md`, `---javascript\n(globalThis.${marker} = true, { category: 'News', publishedDate: '${DAY}', image: '/images/news/story.jpg' })\n---\nDraft`);
  failsWithoutChanges(f, /YAML front matter/);
  assert.equal(globalThis[marker], undefined);
});

test('recovery rejects traversal in reports, ledger owners and inherited manifests', t => {
  for (const articleSlug of ['../../unrelated', '/absolute', '..\\unrelated', 'story/../other', 'story\0', '%2e%2e', 'story\n', ['story'], { slug: 'story' }]) {
    for (const source of ['report', 'ledger', 'restored']) {
      const f = fixture(t);
      if (source === 'report') f.report.outcomes[0].articleSlug = articleSlug;
      if (source === 'ledger') f.ledger.candidates[f.record.id].articleSlug = articleSlug;
      if (source === 'restored') f.json(f.artifact, `${RESEARCH}/restored.json`, { day: DAY, drafts: [{ ...f.record, articleSlug }] });
      f.persist();
      failsWithoutChanges(f, /Unsafe recovery article slug/);
    }
  }
});

test('recovery rejects source file, directory and metadata symlinks, including links within the artifact', t => {
  for (const relative of [`${RECOVERY}/content/articles/story.md`, `${RECOVERY}/public/images/news/story.jpg`, `${RECOVERY}/content/articles`, `${RECOVERY}/public/images`, `${RESEARCH}/report.json`, 'content/news-research.json', `${RESEARCH}/restored.json`]) {
    const f = fixture(t);
    if (relative.endsWith('restored.json')) f.json(f.artifact, relative, { day: DAY, drafts: [f.record] });
    const source = path.join(f.artifact, relative), saved = `${source}-saved`;
    fs.renameSync(source, saved);
    fs.symlinkSync(saved, source);
    failsWithoutChanges(f, /Unsafe recovery path/);
  }
  const f = fixture(t), image = path.join(f.artifact, `${RECOVERY}/public/images/news/story.jpg`);
  fs.unlinkSync(image);
  fs.symlinkSync(path.join(f.cwd, `${RESEARCH}/current.json`), image);
  failsWithoutChanges(f, /Unsafe recovery path/);
  const alias = path.join(f.root, 'artifact-link');
  fs.symlinkSync(f.artifact, alias);
  assert.throws(() => restoreNewsDrafts({ ...f, artifact: alias }), /not a symlink/);
});

test('recovery rejects destination symlink ancestors, dangling links, metadata links and non-directories', t => {
  for (const relative of ['content/articles', 'public/images/news', 'content/articles/story.md', 'public/images/news/story.jpg', `${RESEARCH}/restored.json`, `${RESEARCH}/current.json`]) {
    const f = fixture(t), target = path.join(f.cwd, relative);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    if (fs.existsSync(target)) fs.unlinkSync(target);
    fs.symlinkSync(path.join(f.root, 'absent'), target);
    failsWithoutChanges(f, /Unsafe recovery path/);
  }
  const f = fixture(t);
  f.write(f.cwd, 'public/images', 'not a directory');
  failsWithoutChanges(f, /Unsafe recovery path/);
});

test('duplicate associations copy each image once and identical existing images are reused without rewriting', t => {
  const f = fixture(t);
  f.report.outcomes.push(copy(f.record));
  f.json(f.artifact, `${RESEARCH}/restored.json`, { day: DAY, drafts: [f.record, f.record] });
  f.persist();
  f.write(f.cwd, 'public/images/news/story.jpg', f.read(f.artifact, `${RECOVERY}/public/images/news/story.jpg`));
  const image = path.join(f.cwd, 'public/images/news/story.jpg'), before = fs.statSync(image);
  assert.deepEqual(restoreNewsDrafts(f), { drafts: 1, files: 1 });
  assert.equal(f.manifest().drafts.length, 1);
  const after = fs.statSync(image);
  assert.equal(after.ino, before.ino);
  assert.equal(after.mtimeMs, before.mtimeMs);
  failsWithoutChanges(f, /cannot overwrite/);
});

test('conflicting candidate ownership fails before copying', t => {
  const f = fixture(t);
  f.json(f.artifact, `${RESEARCH}/restored.json`, { day: DAY, drafts: [{ ...f.record, id: 'different-candidate' }] });
  failsWithoutChanges(f, /Conflicting recovery owners/);
  const other = fixture(t);
  other.run.outcomes[other.record.id].id = 'different-candidate';
  other.persist();
  failsWithoutChanges(other, /Invalid recovery outcome owner/);
});

test('published candidates and baseline slugs cannot be resurrected even if destination files are missing', t => {
  for (const source of ['artifact', 'local', 'report', 'restored', 'baseline', 'local-baseline', 'history', 'publishedAt']) {
    const f = fixture(t);
    if (source === 'artifact') f.ledger.candidates[f.record.id].status = 'published';
    if (source === 'publishedAt') f.ledger.candidates[f.record.id].publishedAt = `${DAY}T05:00:00Z`;
    if (source === 'local') f.json(f.cwd, 'content/news-research.json', { candidates: { [f.record.id]: { ...f.record, status: 'published' } }, runs: {} });
    if (source === 'report') f.report.outcomes[0].status = 'published';
    if (source === 'restored') f.json(f.artifact, `${RESEARCH}/restored.json`, { day: DAY, drafts: [{ ...f.record, status: 'published' }] });
    if (source === 'baseline') f.run.baselineSlugs.push('story');
    if (source === 'local-baseline') f.json(f.cwd, 'content/news-research.json', { candidates: {}, runs: { [DAY]: { baselineSlugs: ['story'] } } });
    if (source === 'history') f.ledger.runs['2026-10-18'] = { outcomes: { [f.record.id]: { ...f.record, status: 'published' } } };
    f.persist();
    const ledgerBefore = f.read(f.cwd, 'content/news-research.json');
    assert.deepEqual(restoreNewsDrafts(f), { drafts: 0, files: 0 });
    assert.equal(f.manifest().ignored[0].reason, 'Already published or in the checkout baseline');
    assert.equal(fs.existsSync(path.join(f.cwd, 'content/articles/story.md')), false);
    assert.deepEqual(f.read(f.cwd, 'content/news-research.json'), ledgerBefore);
  }
});

test('the checkout Git tree protects a missing published article independently of ledger state', t => {
  const f = fixture(t);
  const git = (args, input) => execFileSync('git', args, { cwd: f.cwd, input, encoding: 'utf8' }).trim();
  git(['init', '-q']);
  const blob = git(['hash-object', '-w', '--stdin'], 'Published article');
  const articles = git(['mktree'], `100644 blob ${blob}\tstory.md\n`);
  const content = git(['mktree'], `040000 tree ${articles}\tarticles\n`);
  const baseSha = git(['mktree'], `040000 tree ${content}\tcontent\n`);
  f.json(f.cwd, `${RESEARCH}/current.json`, { day: DAY, baseSha });
  assert.deepEqual(restoreNewsDrafts(f), { drafts: 0, files: 0 });
  assert.equal(fs.existsSync(path.join(f.cwd, 'content/articles/story.md')), false);
});

test('report-only distinguishes older publication dates needing review from future-date blockers without writes', t => {
  const f = fixture(t);
  f.addDraft('older', { publishedDate: '2026-10-18' });
  f.addDraft('future', { publishedDate: '2026-10-20' });
  resetOutcome(f, f.record);
  const before = snapshot(f.cwd), artifactBefore = snapshot(f.artifact);
  const report = restoreNewsDrafts({ ...f, reportOnly: true });
  assert.equal(report.reportOnly, true);
  assert.equal(report.ownedDrafts, 3);
  assert.equal(report.drafts, 2);
  assert.equal(report.files, 4);
  assert.equal(report.items.flatMap(item => item.files).length, 6);
  assert.equal(report.errors.length, 1);
  assert.equal(report.errors[0].articleSlug, 'future');
  assert.match(report.errors[0].message, /publishedDate must be a valid YYYY-MM-DD date on or before/);
  const older = report.items.find(item => item.articleSlug === 'older');
  assert.equal(older.originalDate, '2026-10-18');
  assert.equal(older.eligible, true);
  assert.equal(older.status, 'unreviewed');
  assert.equal(older.mustReview, true);
  assert.equal(older.approved, false);
  assert.deepEqual(older.reviewReasons, ['publication-date-needs-review']);
  for (const item of report.items) for (const file of item.files) assert.equal(file.sha256, createHash('sha256').update(f.read(f.artifact, `${RECOVERY}/${file.path}`)).digest('hex'));
  assert.deepEqual(snapshot(f.cwd), before);
  assert.deepEqual(snapshot(f.artifact), artifactBefore);
  failsWithoutChanges(f, /publishedDate must be a valid YYYY-MM-DD date on or before/);
});

test('the CLI permits older drafts with review flags but signals future-date blockers in read-only mode', t => {
  const f = fixture(t), script = new URL('./restore-news-drafts.mjs', import.meta.url);
  f.addDraft('older', { publishedDate: '2026-10-18' });
  const before = snapshot(f.cwd), olderArtifactBefore = snapshot(f.artifact);
  const args = [script.pathname, '--artifact', f.artifact, '--report-only', '--day', DAY];
  const olderOutput = JSON.parse(execFileSync(process.execPath, args, { cwd: f.cwd, encoding: 'utf8' }));
  assert.equal(olderOutput.drafts, 2);
  assert.deepEqual(olderOutput.errors, []);
  assert.equal(olderOutput.items.find(item => item.articleSlug === 'older').originalDate, '2026-10-18');
  assert.deepEqual(olderOutput.items.find(item => item.articleSlug === 'older').reviewReasons, ['publication-date-needs-review']);
  assert.deepEqual(snapshot(f.cwd), before);
  assert.deepEqual(snapshot(f.artifact), olderArtifactBefore);
  f.addDraft('future', { publishedDate: '2026-10-20' });
  const artifactBefore = snapshot(f.artifact);
  let output;
  assert.throws(() => execFileSync(process.execPath, args, { cwd: f.cwd, encoding: 'utf8' }), error => {
    assert.equal(error.status, 1);
    output = JSON.parse(error.stdout);
    return true;
  });
  assert.equal(output.ownedDrafts, 3);
  assert.equal(output.drafts, 2);
  assert.equal(output.errors.length, 1);
  assert.equal(output.errors[0].articleSlug, 'future');
  assert.deepEqual(snapshot(f.cwd), before);
  assert.deepEqual(snapshot(f.artifact), artifactBefore);
});

for (const inspection of JSON.parse(process.env.NEWS_RECOVERY_ARTIFACT_CHECKS || '[]')) {
  test(`report-only existing artifact: ${inspection.artifact}`, t => {
    const f = fixture(t), artifact = path.resolve(inspection.artifact);
    const before = snapshot(f.cwd), artifactBefore = snapshot(artifact);
    const report = restoreNewsDrafts({ ...f, artifact, reportOnly: true, day: inspection.day });
    assert.equal(report.ownedDrafts, inspection.ownedDrafts);
    assert.equal(report.drafts, inspection.eligibleDrafts);
    assert.equal(report.items.flatMap(item => item.files).length, inspection.ownedDrafts * 2);
    assert.deepEqual(report.errors, []);
    const dateReview = report.items.filter(item => item.reviewReasons.includes('publication-date-needs-review'));
    assert.equal(dateReview.length, inspection.dateReviewDrafts);
    assert.ok(dateReview.every(item => item.originalDate < inspection.day));
    assert.ok(report.items.every(item => item.eligible && item.status === 'unreviewed' && item.mustReview && !item.approved && item.sourceChecks.length && item.originalDate === item.publishedDate));
    assert.deepEqual(snapshot(f.cwd), before);
    assert.deepEqual(snapshot(artifact), artifactBefore);
    t.diagnostic(JSON.stringify({ artifact, ownedDrafts: report.ownedDrafts, eligibleDrafts: report.drafts, inspectedFiles: report.items.flatMap(item => item.files).length,
      inheritedDrafts: report.items.filter(item => item.inherited).length, dateReviewDrafts: dateReview.length, dateReview: dateReview.map(item => ({ articleSlug: item.articleSlug, originalDate: item.originalDate, reviewReasons: item.reviewReasons })),
      errors: report.errors, unchangedArtifact: true, unchangedCheckout: true }));
  });
}
