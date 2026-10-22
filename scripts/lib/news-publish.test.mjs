import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { test } from 'node:test';
import { allowedNewsPath, pushNewsFiles } from './news-publish.mjs';
import { prepareResearch, researchReport, reviewCandidate } from './news-research.mjs';
import { validateNewsDrafts } from './news-validation.mjs';
import { assertDailyContent } from './daily-deploy.mjs';
import { publishNewsRun } from '../publish-news-run.mjs';

function fixture(t) {
  fs.mkdirSync('.cache', { recursive: true });
  const directory = fs.mkdtempSync(path.resolve('.cache/news-publish-test-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const remote = path.join(directory, 'remote.git'), cwd = path.join(directory, 'writer');
  const env = { ...process.env, GIT_AUTHOR_NAME: 'Test', GIT_AUTHOR_EMAIL: 'test@example.com', GIT_COMMITTER_NAME: 'Test', GIT_COMMITTER_EMAIL: 'test@example.com' };
  const git = (args, root = cwd) => execFileSync('git', args, { cwd: root, env, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  git(['init', '--bare', remote], directory);
  git(['init', '--initial-branch=main', cwd], directory);
  fs.mkdirSync(path.join(cwd, 'content'), { recursive: true });
  fs.writeFileSync(path.join(cwd, 'content/news-research.json'), '{"version":1}\n');
  for (const file of ['slug-types', 'legacy-slugs-archive', 'event-slug-history']) fs.writeFileSync(path.join(cwd, `content/${file}.json`), '{}\n');
  git(['add', '.']); git(['commit', '-m', 'Initial fixture']);
  git(['remote', 'add', 'origin', remote]); git(['push', 'origin', 'main']);
  const baseSha = git(['rev-parse', 'HEAD']);
  const run = (files, expectedBaseSha = baseSha) => {
    const previous = process.env.GITHUB_ACTIONS;
    process.env.GITHUB_ACTIONS = 'true';
    try { return pushNewsFiles({ cwd, baseSha, expectedBaseSha, files, day: '2026-10-04' }); }
    finally { if (previous === undefined) delete process.env.GITHUB_ACTIONS; else process.env.GITHUB_ACTIONS = previous; }
  };
  return { directory, cwd, remote, git, baseSha, run };
}

test('publication commits only approved paths and preserves newer unrelated main changes', t => {
  const { directory, cwd, remote, git, run } = fixture(t);
  const peer = path.join(directory, 'peer'); git(['clone', '--branch=main', remote, peer], directory);
  fs.writeFileSync(path.join(peer, 'other-writer.txt'), 'Concurrent work');
  git(['add', '.'], peer); git(['commit', '-m', 'Another writer'], peer); git(['push', 'origin', 'main'], peer);
  fs.mkdirSync(path.join(cwd, 'content/articles'), { recursive: true });
  fs.writeFileSync(path.join(cwd, 'content/articles/fee-vote.md'), 'Approved article fixture');
  fs.writeFileSync(path.join(cwd, 'content/generated-unrelated.json'), 'Do not publish');
  fs.writeFileSync(path.join(cwd, 'content/news-research.json'), '{"version":1,"complete":true}\n');
  const sha = run(['content/news-research.json', 'content/articles/fee-vote.md']);
  assert.equal(git(['--git-dir', remote, 'show', 'main:other-writer.txt']), 'Concurrent work');
  assert.equal(git(['--git-dir', remote, 'show', 'main:content/articles/fee-vote.md']), 'Approved article fixture');
  assert.throws(() => git(['--git-dir', remote, 'show', 'main:content/generated-unrelated.json']));
  assert.equal(run(['content/news-research.json', 'content/articles/fee-vote.md']), sha, 'Identical retry creates no extra commit');
});

test('a conflicting research ledger is retained on main rather than overwritten', t => {
  const { directory, cwd, remote, git, run } = fixture(t);
  const peer = path.join(directory, 'peer'); git(['clone', '--branch=main', remote, peer], directory);
  fs.writeFileSync(path.join(peer, 'content/news-research.json'), '{"newer":"review"}');
  git(['add', '.'], peer); git(['commit', '-m', 'Newer review'], peer); git(['push', 'origin', 'main'], peer);
  fs.writeFileSync(path.join(cwd, 'content/news-research.json'), '{"older":"review"}');
  assert.throws(() => run(['content/news-research.json']), /Newer main changed/);
  assert.equal(git(['--git-dir', remote, 'show', 'main:content/news-research.json']), '{"newer":"review"}');
});

test('each review can checkpoint before the final batch without changing the writer checkout', t => {
  const { cwd, remote, git, baseSha, run } = fixture(t);
  fs.writeFileSync(path.join(cwd, 'content/news-research.json'), '{"prepared":true}');
  const checkpoint = run(['content/news-research.json']);
  fs.writeFileSync(path.join(cwd, 'content/news-research.json'), '{"reviewed":true}');
  run(['content/news-research.json'], checkpoint);
  assert.equal(git(['rev-parse', 'HEAD']), baseSha);
  assert.equal(git(['--git-dir', remote, 'show', 'main:content/news-research.json']), '{"reviewed":true}');
});

test('publication rejects unrelated files, path traversal and drafter-created commits', t => {
  for (const file of ['.env.local', 'content/articles/../../secret.md', 'content/articles/AGENTS.md', 'next.config.mjs', 'content/prebuild-input-hashes.json']) assert.equal(allowedNewsPath(file), false);
  const { cwd, git, run } = fixture(t);
  assert.throws(() => run(['next.config.mjs']), /Invalid news publication paths/);
  fs.writeFileSync(path.join(cwd, 'local-only.txt'), 'Unauthorized commit'); git(['add', '.']); git(['commit', '-m', 'Drafter commit']);
  assert.throws(() => run(['content/news-research.json']), /drafter changed Git history/);
});

test('publication cannot take a job or historical root URL added by another writer', t => {
  const { directory, cwd, remote, git, run } = fixture(t);
  const peer = path.join(directory, 'peer'); git(['clone', '--branch=main', remote, peer], directory);
  fs.writeFileSync(path.join(peer, 'content/slug-types.json'), '{"jobs":["fee-vote"]}');
  git(['add', '.'], peer); git(['commit', '-m', 'Reserve a job URL'], peer); git(['push', 'origin', 'main'], peer);
  fs.mkdirSync(path.join(cwd, 'content/articles'), { recursive: true });
  fs.writeFileSync(path.join(cwd, 'content/articles/fee-vote.md'), 'Draft');
  assert.throws(() => run(['content/articles/fee-vote.md']), /already occupied/);
});

test('publication cannot overwrite an existing article even if it was a guide', t => {
  const { cwd, git } = fixture(t);
  fs.mkdirSync(path.join(cwd, 'content/articles'), { recursive: true });
  fs.writeFileSync(path.join(cwd, 'content/articles/guide.md'), 'Existing guide');
  git(['add', '.']); git(['commit', '-m', 'Existing guide']); git(['push', 'origin', 'main']);
  const baseSha = git(['rev-parse', 'HEAD']);
  fs.writeFileSync(path.join(cwd, 'content/articles/guide.md'), 'News replacing a guide');
  const previous = process.env.GITHUB_ACTIONS; process.env.GITHUB_ACTIONS = 'true';
  try { assert.throws(() => pushNewsFiles({ cwd, baseSha, files: ['content/articles/guide.md'], day: '2026-10-04' }), /cannot overwrite/); }
  finally { if (previous === undefined) delete process.env.GITHUB_ACTIONS; else process.env.GITHUB_ACTIONS = previous; }
});

test('dry-run coordinator reports incomplete coverage without committing or changing the ledger', t => {
  const { cwd, git, baseSha } = fixture(t), day = '2026-10-04';
  const ledger = { version: 1, candidates: {}, runs: {} };
  prepareResearch({ ledger, day, now: Date.parse(`${day}T03:30:00Z`), articles: [], discovery: { total: 1, feeds: [{ ok: true }], candidates: [{ title: 'A protocol upgrade vote', link: 'https://example.com/vote', source: 'Test', published: day }] } });
  const before = JSON.stringify(ledger);
  fs.writeFileSync(path.join(cwd, 'content/news-research.json'), before);
  fs.mkdirSync(path.join(cwd, '.cache/news-research'), { recursive: true });
  fs.writeFileSync(path.join(cwd, '.cache/news-research/current.json'), JSON.stringify({ day, baseSha }));
  assert.throws(() => execFileSync(process.execPath, [path.resolve('scripts/publish-news-run.mjs'), '--dry-run'], { cwd, encoding: 'utf8', stdio: 'pipe' }), /Command failed/);
  const report = JSON.parse(fs.readFileSync(path.join(cwd, '.cache/news-research/report.json'), 'utf8'));
  assert.equal(report.complete, false);
  assert.equal(report.counts.unreviewed, 1);
  assert.equal(fs.readFileSync(path.join(cwd, 'content/news-research.json'), 'utf8'), before);
  assert.equal(git(['rev-parse', 'HEAD']), baseSha);
});

test('the daily CLI checkpoints its queue and decisions, then completes one deferred batch', t => {
  const { cwd, remote, git } = fixture(t), day = new Date().toISOString().slice(0, 10);
  fs.mkdirSync(path.join(cwd, 'content/articles'), { recursive: true });
  fs.writeFileSync(path.join(cwd, 'content/news-research.json'), JSON.stringify({ version: 1, candidates: {}, runs: {} }));
  fs.writeFileSync(path.join(cwd, 'content/news-tips.md'), '# News tips\n');
  git(['add', '.']); git(['commit', '-m', 'Prepare research fixture']); git(['push', 'origin', 'main']);
  const base = git(['rev-parse', 'HEAD']);
  const env = { ...process.env, GITHUB_ACTIONS: 'true', NEWS_DATE: day, NEWS_DRY_RUN: 'false', GITHUB_OUTPUT: '', GITHUB_STEP_SUMMARY: '' };
  const xml = `<rss><channel><item><title>Protocol approves a new fee proposal</title><link>https://source.example/vote</link><pubDate>${new Date().toISOString()}</pubDate></item></channel></rss>`;
  const preload = `data:text/javascript,${encodeURIComponent(`globalThis.fetch = async () => new Response(${JSON.stringify(xml)});`)}`;
  const cli = path.resolve('scripts/news-research.mjs');
  execFileSync(process.execPath, ['--import', preload, cli, 'prepare'], { cwd, env, stdio: 'pipe' });
  let ledger = JSON.parse(git(['--git-dir', remote, 'show', 'main:content/news-research.json']));
  const id = ledger.runs[day].candidateIds[0];
  assert.equal(ledger.candidates[id].status, 'pending');
  execFileSync(process.execPath, [cli, 'record', `--id=${id}`, '--status=deferred', '--reason=needs-corroboration', '--note=The proposal is readable but independent confirmation has not been found.', '--read=https://source.example/vote', '--search=Find independent reporting confirming this governance vote'], { cwd, env, stdio: 'pipe' });
  ledger = JSON.parse(git(['--git-dir', remote, 'show', 'main:content/news-research.json']));
  assert.equal(ledger.candidates[id].status, 'deferred');
  execFileSync(process.execPath, [path.resolve('scripts/publish-news-run.mjs')], { cwd, env, stdio: 'pipe' });
  ledger = JSON.parse(git(['--git-dir', remote, 'show', 'main:content/news-research.json']));
  assert.equal(ledger.runs[day].status, 'completed');
  assert.equal(ledger.candidates[id].status, 'deferred');
  assert.equal(git(['rev-parse', 'HEAD']), base);
  const completed = git(['--git-dir', remote, 'rev-parse', 'main']);
  const noFetch = `data:text/javascript,${encodeURIComponent('globalThis.fetch = async () => { throw new Error("Unexpected repeat discovery"); };')}`;
  execFileSync(process.execPath, ['--import', noFetch, cli, 'prepare'], { cwd, env, stdio: 'pipe' });
  assert.equal(git(['--git-dir', remote, 'rev-parse', 'main']), completed);
});

function coordinatorFixture(t) {
  const base = fixture(t), { cwd, baseSha } = base;
  const day = '2026-10-04', now = Date.parse(`${day}T03:30:00Z`);
  const ledger = { version: 1, candidates: {}, runs: {} };
  const write = (file, body) => { fs.mkdirSync(path.dirname(path.join(cwd, file)), { recursive: true }); fs.writeFileSync(path.join(cwd, file), body); };
  const read = file => fs.readFileSync(path.join(cwd, file), 'utf8');
  prepareResearch({ ledger, day, now, articles: [], discovery: { total: 2, feeds: [{ ok: true }], candidates: [
    { title: 'Protocol approves a new fee schedule', link: 'https://source.example/fees', source: 'Source', published: day },
    { title: 'Exchange files corporate acquisition notice', link: 'https://source.example/acquisition', source: 'Source', published: day },
  ] } });
  const [id, pendingId] = ledger.runs[day].candidateIds;
  for (const slug of ['fee-vote', 'pending-story']) {
    write(`content/articles/${slug}.md`, `---\ntitle: A fixture story\ncategory: News\nimage: /images/news/${slug}.jpg\npublishedDate: '${day}'\n---\nFixture content for the injected article auditor.\n`);
    write(`public/images/news/${slug}.jpg`, 'Fixture bytes for the injected image auditor');
  }
  reviewCandidate(ledger, day, { id, status: 'ready', articleSlug: 'fee-vote',
    note: 'Read the protocol decision and independent confirmation of the approved fee schedule.',
    sourceChecks: [{ url: 'https://source.example/fees', outcome: 'read' }, { url: 'https://primary.example/proposal', outcome: 'read' }],
  }, { articles: [{ slug: 'fee-vote' }], now });
  ledger.candidates[pendingId].articleSlug = 'pending-story';
  write('content/news-research.json', JSON.stringify(ledger));
  write('content/news-tips.md', '# Tips\n- https://source.example/fees - Protocol fee vote\n');
  write('.cache/news-research/current.json', JSON.stringify({ day, baseSha, checkpointSha: baseSha, persist: true }));
  const audits = [], publications = [];
  const validate = (options, audit = () => []) => {
    assert.equal(options.publishReadyBatch, true);
    return validateNewsDrafts({ ...options, audit: (slugs, context) => { audits.push(slugs); return audit(slugs, context); } });
  };
  const publish = options => {
    publications.push({ ...options, ledger: JSON.parse(read('content/news-research.json')) });
    return 'b'.repeat(40);
  };
  const run = options => publishNewsRun({ cwd, now, env: { GITHUB_ACTIONS: 'true' }, validate, publish, ...options });
  return { ...base, day, now, ledger, id, pendingId, write, read, validate, run, audits, publications };
}

test('the coordinator audits and publishes only ready article files plus the truthful partial ledger', t => {
  const h = coordinatorFixture(t), pending = structuredClone(h.ledger.candidates[h.pendingId]);
  const result = h.run();
  assert.equal(result.complete, true); assert.equal(result.articlesChanged, true);
  assert.equal(result.report.complete, false); assert.equal(result.report.publicationComplete, true);
  assert.deepEqual(result.report.counts, { published: 1, ready: 0, rejected: 0, deferred: 0, unreviewed: 1 });
  assert.deepEqual(h.audits, [['fee-vote']]); assert.equal(h.publications.length, 1);
  assert.deepEqual(h.publications[0].files, ['content/news-research.json', 'content/articles/fee-vote.md', 'public/images/news/fee-vote.jpg']);
  const saved = h.publications[0].ledger;
  assert.equal(saved.runs[h.day].outcomes[h.id].status, 'published');
  assert.equal(saved.runs[h.day].outcomes[h.pendingId], undefined);
  assert.deepEqual(saved.candidates[h.pendingId], pending);
  assert.deepEqual(saved.runs[h.day].publication.pendingIds, [h.pendingId]);
  assert.deepEqual(assertDailyContent({ date: h.day, research: saved, jobs: [],
    catalogs: { version: 1, catalogs: { jobs: { checkedAt: new Date(h.now).toISOString(), sourceCommit: h.baseSha } } },
    hasArticle: slug => fs.existsSync(path.join(h.cwd, 'content/articles', `${slug}.md`)),
  }, h.now).articleSlugs, ['fee-vote']);
  assert.match(h.read('content/news-tips.md'), /source\.example\/fees/);
  assert.ok(fs.existsSync(path.join(h.cwd, '.cache/news-research/recovery/content/articles/pending-story.md')));
  assert.ok(fs.existsSync(path.join(h.cwd, '.cache/news-research/recovery/public/images/news/pending-story.jpg')));
  assert.equal(h.git(['rev-parse', 'HEAD']), h.baseSha);
});

test('audits crossing UTC midnight cannot publish a batch under the previous date', t => {
  const h = coordinatorFixture(t);
  let now = h.now;
  const result = h.run({ now: () => now, validate: options => {
    const audit = h.validate(options); now += 86400000; return audit;
  } });
  assert.equal(result.complete, false);
  assert.equal(result.report.counts.published, 0);
  assert.match(result.report.validationErrors.join('; '), /day changed/);
  assert.deepEqual(h.publications[0].files, ['content/news-research.json']);
});

test('a completed partial publication is idempotent and CLI outputs separate workflow and coverage completion', t => {
  const h = coordinatorFixture(t);
  h.run();
  const before = h.read('content/news-research.json');
  const second = h.run({ validate: () => assert.fail('Do not re-audit a published batch'), publish: () => assert.fail('No second publication') });
  assert.equal(second.alreadyPublished, true); assert.equal(second.articlesChanged, false);
  assert.equal(second.publishedSha, 'b'.repeat(40)); assert.equal(second.report.complete, false);
  assert.equal(h.read('content/news-research.json'), before);
  const outputs = path.join(h.cwd, '.cache/outputs');
  const env = { ...process.env, GITHUB_ACTIONS: 'true', NEWS_DRY_RUN: 'false', GITHUB_OUTPUT: outputs, GITHUB_STEP_SUMMARY: '' };
  execFileSync(process.execPath, [path.resolve('scripts/news-research.mjs'), 'prepare', `--date=${h.day}`], { cwd: h.cwd, env, stdio: 'pipe' });
  execFileSync(process.execPath, [path.resolve('scripts/publish-news-run.mjs')], { cwd: h.cwd, env, stdio: 'pipe' });
  const emitted = fs.readFileSync(outputs, 'utf8');
  assert.match(emitted, /^needs_writer=false$/m); assert.match(emitted, /^articles_changed=false$/m);
  assert.match(emitted, /^complete=true$/m); assert.match(emitted, /^coverage_complete=false$/m); assert.match(emitted, /^publication_complete=true$/m);
  assert.match(emitted, new RegExp(`^published_sha=${'b'.repeat(40)}$`, 'm'));
  assert.equal(h.read('content/news-research.json'), before);
  assert.equal(h.git(['--git-dir', h.remote, 'rev-parse', 'main']), h.baseSha);
});

for (const failure of ['audit-error', 'audit-crash', 'invalid-response']) test(`${failure} cannot publish a ready batch while coverage is pending`, t => {
  const h = coordinatorFixture(t), before = h.read('content/news-research.json');
  const result = h.run({ validate: options => h.validate(options, () => {
    if (failure === 'audit-crash') throw new Error('Editorial auditor unavailable');
    return failure === 'invalid-response' ? undefined : ['The article failed the image credit audit'];
  }) });
  assert.deepEqual(h.audits, [['fee-vote']]);
  assert.equal(result.complete, false); assert.equal(result.articlesChanged, false);
  assert.equal(result.report.publicationComplete, false); assert.equal(result.report.counts.ready, 1); assert.equal(result.report.counts.published, 0);
  assert.equal(result.report.counts.unreviewed, 1); assert.ok(result.report.validationErrors.length);
  if (failure === 'audit-error') {
    assert.deepEqual(h.publications[0].files, ['content/news-research.json']);
    assert.equal(h.publications[0].ledger.runs[h.day].publication, undefined);
  } else {
    assert.equal(h.publications.length, 0);
    assert.equal(h.read('content/news-research.json'), before);
  }
  assert.ok(fs.existsSync(path.join(h.cwd, 'content/articles/fee-vote.md')));
});

test('an unsafe report destination cannot be written or checkpointed after a fatal validation failure', t => {
  const h = coordinatorFixture(t), before = h.read('content/news-research.json');
  h.write('protected.txt', 'Preserve this unrelated file exactly');
  fs.symlinkSync(path.join(h.cwd, 'protected.txt'), path.join(h.cwd, '.cache/news-research/report.md'));
  const result = h.run();
  assert.equal(result.complete, false); assert.equal(result.report.publicationComplete, false);
  assert.match(result.report.validationErrors.join('\n'), /Symlink/);
  assert.deepEqual(h.audits, []); assert.deepEqual(h.publications, []);
  assert.equal(h.read('content/news-research.json'), before);
  assert.equal(h.read('protected.txt'), 'Preserve this unrelated file exactly');
});

test('an empty error list without a passing article audit cannot authorize publication', t => {
  const h = coordinatorFixture(t);
  const result = h.run({ validate: options => ({ ...h.validate(options), audited: false, draftsValid: false, validationErrors: [] }) });
  assert.equal(result.complete, false); assert.equal(result.report.publicationComplete, false);
  assert.equal(result.report.counts.ready, 1); assert.equal(result.report.counts.published, 0);
  assert.match(result.report.validationErrors[0], /did not pass the article validator/);
  assert.deepEqual(h.publications[0].files, ['content/news-research.json']);
  assert.equal(h.publications[0].ledger.runs[h.day].publication, undefined);
});

for (const failure of ['throw', 'unconfirmed']) test(`failed push (${failure}) clears publication state and retains ready drafts for an audited retry`, t => {
  const h = coordinatorFixture(t), pending = structuredClone(h.ledger.candidates[h.pendingId]);
  assert.throws(() => h.run({ publish: () => {
    if (failure === 'throw') throw new Error('News push failed');
  } }), /push failed|no confirmed commit/);
  const saved = JSON.parse(h.read('content/news-research.json')), run = saved.runs[h.day];
  assert.equal(run.publication, undefined); assert.equal(run.completedAt, undefined); assert.equal(run.status, 'incomplete');
  assert.equal(run.outcomes[h.id].status, 'ready'); assert.equal(run.outcomes[h.id].publishedAt, undefined);
  assert.equal(saved.candidates[h.id].status, 'ready'); assert.equal(saved.candidates[h.id].publishedAt, undefined);
  assert.deepEqual(saved.candidates[h.id].sourceChecks, h.ledger.candidates[h.id].sourceChecks);
  assert.deepEqual(saved.candidates[h.pendingId], pending);
  assert.match(run.validationErrors.at(-1), /Publication not confirmed/);
  assert.equal(researchReport(saved, h.day).publicationComplete, false);
  assert.ok(fs.existsSync(path.join(h.cwd, 'content/articles/fee-vote.md')));
  assert.ok(fs.existsSync(path.join(h.cwd, 'public/images/news/fee-vote.jpg')));
  assert.equal(h.run().report.publicationComplete, true);
  assert.deepEqual(h.audits, [['fee-vote'], ['fee-vote']]);
});

test('a dry-run audits the ready batch without inventing published outcomes or persisting a receipt', t => {
  const h = coordinatorFixture(t), before = h.read('content/news-research.json');
  const result = h.run({ dryRun: true, publish: () => assert.fail('A preview cannot push') });
  assert.equal(result.publicationReady, true); assert.equal(result.articlesChanged, false);
  assert.equal(result.report.publicationComplete, false); assert.equal(result.report.complete, false);
  assert.equal(result.report.counts.ready, 1); assert.equal(result.report.counts.published, 0); assert.equal(result.report.counts.unreviewed, 1);
  assert.deepEqual(h.audits, [['fee-vote']]);
  assert.equal(h.read('content/news-research.json'), before);
});
