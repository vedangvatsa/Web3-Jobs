import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import test from 'node:test';
import { addResearchCandidate, prepareResearch, reviewCandidate } from './news-research.mjs';
import { validateNewsDrafts } from './news-validation.mjs';
import { validateNewsRun } from '../validate-news-run.mjs';

function fixture(t, { articleSlug = 'new-story', publishedBody = 'Existing reporting' } = {}) {
  fs.mkdirSync('.cache', { recursive: true });
  const cwd = fs.mkdtempSync(path.resolve('.cache/news-validation-test-'));
  t.after(() => fs.rmSync(cwd, { recursive: true, force: true }));
  const write = (file, body) => { fs.mkdirSync(path.dirname(path.join(cwd, file)), { recursive: true }); fs.writeFileSync(path.join(cwd, file), body); };
  const env = { ...process.env, GIT_AUTHOR_NAME: 'Test', GIT_AUTHOR_EMAIL: 'test@example.com', GIT_COMMITTER_NAME: 'Test', GIT_COMMITTER_EMAIL: 'test@example.com' };
  const git = args => execFileSync('git', args, { cwd, env, encoding: 'utf8', stdio: 'pipe' }).trim();
  git(['init', '--initial-branch=main']);
  write('content/articles/published-story.md', publishedBody);
  write('public/images/news/published-story.jpg', 'Existing image');
  write('protected-code.mjs', 'Original code');
  write('content/news-research.json', '{}');
  git(['add', '.']); git(['commit', '-m', 'Validation fixture']);
  const day = new Date().toISOString().slice(0, 10), context = { day, baseSha: git(['rev-parse', 'HEAD']) };
  const ledger = { version: 1, candidates: {}, runs: {} };
  prepareResearch({ ledger, day, articles: [{ slug: 'published-story' }], discovery: { total: 1, feeds: [{ ok: true }], candidates: [{ title: 'A new filing changes the protocol rules', link: 'https://source.example/filing', source: 'Test', published: day }] } });
  const id = ledger.runs[day].candidateIds[0];
  write(`content/articles/${articleSlug}.md`, `---\ntitle: A new filing\ncategory: News\nimage: /images/news/${articleSlug}.jpg\npublishedDate: '${day}'\n---\nDraft text.\n`);
  write(`public/images/news/${articleSlug}.jpg`, 'New image fixture');
  reviewCandidate(ledger, day, { id, status: 'ready', articleSlug, note: 'The filing and its stated effective date were read in two independent reports.', sourceChecks: [{ url: 'https://source.example/filing', outcome: 'read' }, { url: 'https://other.example/report', outcome: 'read' }] }, { articles: [{ slug: articleSlug }] });
  write('content/news-research.json', JSON.stringify(ledger));
  write('.cache/news-research/current.json', JSON.stringify(context));
  return { cwd, context, ledger, id, write, git };
}

test('preview validation saves exact gate feedback and recovery copies without publishing or mutating the ledger', t => {
  const { cwd, context, git } = fixture(t);
  const before = fs.readFileSync(path.join(cwd, 'content/news-research.json'), 'utf8');
  const errors = ['new-story.md: under 600 words', 'Source link HTTP 403: https://source.example/filing'];
  const result = validateNewsRun({ cwd, audit: () => errors });
  assert.equal(result.complete, false);
  assert.equal(result.counts.ready, 1); assert.equal(result.counts.published, 0);
  assert.deepEqual(result.validationErrors, errors); assert.deepEqual(result.fatalErrors, []);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(cwd, '.cache/news-research/validation.json'), 'utf8')), result);
  assert.ok(fs.existsSync(path.join(cwd, '.cache/news-research/recovery/content/articles/new-story.md')));
  assert.ok(fs.existsSync(path.join(cwd, '.cache/news-research/recovery/public/images/news/new-story.jpg')));
  assert.equal(fs.readFileSync(path.join(cwd, 'content/news-research.json'), 'utf8'), before);
  assert.equal(git(['rev-parse', 'HEAD']), context.baseSha);
});

test('a passing repair clears previous validation errors but leaves the draft ready for the publisher', t => {
  const { cwd, context, git } = fixture(t);
  validateNewsRun({ cwd, persist: true, audit: () => ['new-story.md: under 600 words'] });
  const result = validateNewsRun({ cwd, persist: true, audit: () => [] });
  assert.equal(result.complete, true); assert.equal(result.counts.ready, 1); assert.equal(result.counts.published, 0);
  const ledger = JSON.parse(fs.readFileSync(path.join(cwd, 'content/news-research.json'), 'utf8'));
  assert.deepEqual(ledger.runs[context.day].validationErrors, []);
  assert.notEqual(ledger.runs[context.day].status, 'completed');
  assert.equal(ledger.runs[context.day].completedAt, undefined);
  assert.equal(git(['rev-parse', 'HEAD']), context.baseSha);
});

test('an unclaimed draft or missing image cannot be hidden by a complete review ledger', t => {
  const { cwd, context, ledger, write } = fixture(t);
  write('content/articles/unclaimed-story.md', 'Unclaimed draft');
  fs.unlinkSync(path.join(cwd, 'public/images/news/new-story.jpg'));
  const result = validateNewsDrafts({ cwd, context, ledger, audit: () => assert.fail('Structural failures precede article audits') });
  assert.ok(result.validationErrors.includes('Draft has no ready review outcome: content/articles/unclaimed-story.md'));
  assert.ok(result.validationErrors.includes('Missing article-specific image: new-story'));
});

test('protected edits and attempts to replace published reporting require an operator', t => {
  const { cwd, context, ledger, id, write } = fixture(t);
  write('protected-code.mjs', 'Changed validator or code');
  ledger.runs[context.day].outcomes[id].articleSlug = 'published-story';
  const result = validateNewsDrafts({ cwd, context, ledger, audit: () => assert.fail('Must not audit an unsafe tree') });
  assert.ok(result.fatalErrors.includes('Drafter changed a protected or generated file: protected-code.mjs'));
  assert.ok(result.fatalErrors.includes('New reporting cannot overwrite a published file: content/articles/published-story.md'));
});

test('validator crashes and malformed output fail closed instead of authorizing publication', t => {
  const { cwd, context, ledger } = fixture(t);
  for (const audit of [() => { throw new Error('Audit crashed'); }, () => undefined, () => [null]]) {
    const result = validateNewsDrafts({ cwd, context, ledger, audit });
    assert.equal(result.fatalErrors.length, 1);
    assert.match(result.fatalErrors[0], /Article validation could not finish/);
  }
  const result = validateNewsDrafts({ cwd, context, ledger, audit: () => ['Typecheck failed; no articles may publish on a red tree'] });
  assert.equal(result.fatalErrors.length, 1);
});

test('an unfinished or unconfirmed writer blocks independent final publication before staging or audits', t => {
  for (const state of ['running', 'unsafe']) {
    const f = fixture(t);
    f.write('.cache/news-research/writer-state.json', JSON.stringify({ version: 1, day: f.context.day, state, startedAt: `${f.context.day}T04:00:00Z` }));
    const result = validateNewsDrafts({ cwd: f.cwd, context: f.context, ledger: f.ledger, publishReadyBatch: true, audit: () => assert.fail('Writer may still modify files') });
    assert.equal(result.draftsValid, false);
    assert.equal(result.safeToPersist, false);
    assert.match(result.fatalErrors.join('; '), /shutdown is unconfirmed/);
    assert.ok(fs.existsSync(path.join(f.cwd, 'content/articles/new-story.md')));
  }
  const f = fixture(t);
  f.write('.cache/news-research/writer-state.json', JSON.stringify({ version: 1, day: f.context.day, state: 'stopped', startedAt: `${f.context.day}T04:00:00Z`, stoppedAt: `${f.context.day}T04:01:00Z` }));
  assert.equal(validateNewsDrafts({ cwd: f.cwd, context: f.context, ledger: f.ledger, publishReadyBatch: true, audit: () => [] }).draftsValid, true);
});

function pendingDraft(f, { slug = 'unfinished', owned = true } = {}) {
  const { cwd, ledger, context, write } = f;
  let id;
  if (owned) {
    id = addResearchCandidate(ledger, context.day, { title: 'Validators vote on a fresh collateral proposal', link: `https://pending.example/${slug}`, published: new Date().toISOString() });
    ledger.candidates[id].articleSlug = slug;
  }
  const article = `content/articles/${slug}.md`, image = `public/images/news/${slug}.jpg`;
  const bytes = Buffer.from(`---\r\ntitle: Unfinished investigation\r\ncategory: News\r\nimage: /images/news/${slug}.jpg\r\npublishedDate: '2026-01-01'\r\n---\r\nUnreviewed notes retain exact bytes: café.\r\n[Unread source](https://pending.example/${slug})\r\n`);
  const imageBytes = Buffer.from([0, 255, 1, 2, 128, 13, 10]);
  write(article, bytes); write(image, imageBytes);
  write('content/news-research.json', JSON.stringify(ledger));
  return { id, article, image, bytes, imageBytes, cwd };
}

function tree(cwd) {
  const entries = {};
  const walk = (directory, prefix = '') => {
    for (const name of fs.readdirSync(directory).sort()) {
      if (name === '.git') continue;
      const file = path.join(directory, name), relative = `${prefix}${name}`, stat = fs.lstatSync(file);
      if (stat.isSymbolicLink()) entries[relative] = { link: fs.readlinkSync(file) };
      else if (stat.isDirectory()) { entries[`${relative}/`] = null; walk(file, `${relative}/`); }
      else entries[relative] = fs.readFileSync(file);
    }
  };
  walk(cwd);
  return entries;
}

test('publish-ready mode preserves ready paths and exact unapproved backlog bytes without changing review outcomes', t => {
  const f = fixture(t), owned = pendingDraft(f), unknown = pendingDraft(f, { slug: 'unclaimed', owned: false });
  f.write('src/unrelated.mjs', 'Unrelated new code'); f.write('public/data/generated.json', '{"unrelated":true}');
  const { cwd, context, ledger } = f, before = JSON.stringify(ledger);
  const readyPaths = ['content/articles/new-story.md', 'public/images/news/new-story.jpg'];
  const readyBytes = readyPaths.map(file => fs.readFileSync(path.join(cwd, file)));
  let audits = 0;
  const audit = (slugs, options) => {
    audits++;
    assert.deepEqual(slugs, ['new-story']); assert.equal(options.day, context.day);
    assert.deepEqual(fs.readdirSync(path.join(cwd, 'content/articles')).sort(), ['new-story.md', 'published-story.md']);
    assert.deepEqual(fs.readdirSync(path.join(cwd, 'public/images/news')).sort(), ['new-story.jpg', 'published-story.jpg']);
    return [];
  };
  const result = validateNewsDrafts({ ...f, publishReadyBatch: true, audit });
  assert.equal(audits, 1); assert.equal(result.audited, true); assert.equal(result.draftsValid, true);
  assert.equal(result.before.complete, false); assert.equal(result.partialPublicationEligible, true);
  assert.deepEqual(result.validationErrors, []); assert.deepEqual(result.fatalErrors, []);
  assert.deepEqual(result.draftPaths, readyPaths);
  assert.equal(JSON.stringify(ledger), before);
  assert.equal(fs.readFileSync(path.join(cwd, 'src/unrelated.mjs'), 'utf8'), 'Unrelated new code');
  assert.equal(fs.readFileSync(path.join(cwd, 'public/data/generated.json'), 'utf8'), '{"unrelated":true}');
  readyPaths.forEach((file, i) => assert.deepEqual(fs.readFileSync(path.join(cwd, file)), readyBytes[i]));
  const manifest = JSON.parse(fs.readFileSync(path.join(cwd, result.stagingManifest), 'utf8'));
  assert.equal(manifest.files.length, 4);
  for (const draft of [owned, unknown]) for (const [file, bytes] of [[draft.article, draft.bytes], [draft.image, draft.imageBytes]]) {
    assert.ok(result.quarantinedPaths.includes(file)); assert.ok(!result.draftPaths.includes(file));
    assert.equal(fs.existsSync(path.join(cwd, file)), false);
    assert.deepEqual(fs.readFileSync(path.join(cwd, '.cache/news-research/recovery', file)), bytes);
    const saved = manifest.files.find(entry => entry.path === file);
    assert.equal(saved.status, 'pending'); assert.equal(saved.approved, false); assert.equal(saved.mustReview, true);
    assert.equal(saved.candidateId, draft.id || null); assert.equal(saved.ownerRequired, !draft.id);
    assert.deepEqual(fs.readFileSync(path.join(cwd, saved.recoveryPath)), bytes);
  }
  const feedback = validateNewsRun({ cwd, persist: true, publishReadyBatch: true, audit });
  assert.equal(audits, 2); assert.equal(feedback.complete, false); assert.equal(feedback.draftsValid, true);
  assert.equal(feedback.audited, true); assert.equal(feedback.partialPublicationEligible, true);
  assert.equal(feedback.counts.unreviewed, 1); assert.equal(feedback.counts.published, 0);
  assert.deepEqual(feedback.readySlugs, ['new-story']); assert.deepEqual(feedback.draftPaths, readyPaths);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(cwd, '.cache/news-research/validation.json'), 'utf8')), feedback);
  const persisted = JSON.parse(fs.readFileSync(path.join(cwd, 'content/news-research.json'), 'utf8'));
  assert.equal(persisted.candidates[owned.id].status, 'pending');
  assert.equal(persisted.runs[context.day].outcomes[owned.id], undefined);
});

test('coverage or a ready ledger alone never claims an audit passed, and defaults still hold unreviewed batches', t => {
  const f = fixture(t);
  pendingDraft(f);
  const before = tree(f.cwd);
  const strict = validateNewsDrafts({ ...f, audit: () => assert.fail('Strict mode waits for all reviews') });
  assert.equal(strict.audited, false); assert.equal(strict.draftsValid, false); assert.equal(strict.publishReadyBatch, false);
  assert.ok(strict.validationErrors.includes('Draft has no ready review outcome: content/articles/unfinished.md'));
  for (const file of ['content/articles/unfinished.md', 'public/images/news/unfinished.jpg']) assert.deepEqual(fs.readFileSync(path.join(f.cwd, file)), before[file]);
  delete f.ledger.runs[f.context.day].outcomes[f.id];
  f.ledger.candidates[f.id].status = 'pending';
  const empty = validateNewsDrafts({ ...f, publishReadyBatch: true, audit: () => assert.fail('No ready articles to audit') });
  assert.equal(empty.audited, false); assert.equal(empty.draftsValid, false); assert.equal(empty.partialPublicationEligible, false);
  assert.deepEqual(empty.draftPaths, []);
});

test('pending snapshots survive later revisions and corrupted archives stop the entire next staging attempt', t => {
  const f = fixture(t), pending = pendingDraft(f);
  const first = validateNewsDrafts({ ...f, publishReadyBatch: true, audit: () => [] });
  const original = JSON.parse(fs.readFileSync(path.join(f.cwd, first.stagingManifest), 'utf8')).files;
  const revised = Buffer.concat([pending.bytes, Buffer.from('More unreviewed notes.\n')]);
  f.write(pending.article, revised); f.write(pending.image, pending.imageBytes);
  const second = validateNewsDrafts({ ...f, publishReadyBatch: true, audit: () => [] });
  assert.equal(second.draftsValid, true);
  const entries = JSON.parse(fs.readFileSync(path.join(f.cwd, second.stagingManifest), 'utf8')).files;
  assert.equal(entries.length, 3);
  for (const entry of original) assert.deepEqual(fs.readFileSync(path.join(f.cwd, entry.recoveryPath)), entry.path === pending.article ? pending.bytes : pending.imageBytes);
  assert.deepEqual(fs.readFileSync(path.join(f.cwd, '.cache/news-research/recovery', pending.article)), revised);
  f.write(original[0].recoveryPath, 'Corrupted archive');
  f.write(pending.article, revised); f.write(pending.image, pending.imageBytes);
  const before = tree(f.cwd);
  const failed = validateNewsDrafts({ ...f, publishReadyBatch: true, audit: () => assert.fail('Archive failure must precede all moves') });
  assert.equal(failed.draftsValid, false); assert.match(failed.fatalErrors.join('\n'), /archive is missing or changed/);
  assert.deepEqual(tree(f.cwd), before);
});

test('missing ready images and actual audit errors remain publication blockers with an unreviewed backlog', t => {
  const f = fixture(t);
  pendingDraft(f);
  fs.unlinkSync(path.join(f.cwd, 'public/images/news/new-story.jpg'));
  const missing = validateNewsDrafts({ ...f, publishReadyBatch: true, audit: () => assert.fail('Missing ready image blocks the batch') });
  assert.equal(missing.draftsValid, false); assert.equal(missing.audited, false);
  assert.ok(missing.validationErrors.includes('Missing article-specific image: new-story'));
  f.write('public/images/news/new-story.jpg', 'Image still needs the image audit');
  for (const errors of [['new-story.md image: hero file is not a valid image'], ['Source link HTTP 403: https://source.example/filing'], ['Typecheck failed; no articles may publish on a red tree']]) {
    const result = validateNewsDrafts({ ...f, publishReadyBatch: true, audit: () => errors });
    assert.equal(result.audited, true); assert.equal(result.draftsValid, false); assert.equal(result.partialPublicationEligible, false);
    assert.deepEqual(result.validationErrors, errors);
  }
  for (const audit of [() => undefined, () => [null], () => { throw new Error('Audit crashed with backlog'); }]) {
    const result = validateNewsDrafts({ ...f, publishReadyBatch: true, audit });
    assert.equal(result.audited, false); assert.equal(result.draftsValid, false);
    assert.match(result.fatalErrors.join('\n'), /Article validation could not finish/);
  }
});

test('an invalid ready image reference is preserved for repair rather than quarantined with another draft', t => {
  const f = fixture(t), pending = pendingDraft(f);
  const article = fs.readFileSync(path.join(f.cwd, 'content/articles/new-story.md'), 'utf8').replace('/images/news/new-story.jpg', '/images/news/unfinished.jpg');
  f.write('content/articles/new-story.md', article);
  const result = validateNewsDrafts({ ...f, publishReadyBatch: true, audit: () => assert.fail('Wrong ready image must be repaired') });
  assert.equal(result.draftsValid, false); assert.equal(result.audited, false);
  assert.deepEqual(result.fatalErrors, []);
  assert.ok(result.validationErrors.includes('Missing article-specific image: new-story'));
  assert.deepEqual(result.quarantinedPaths, []);
  assert.deepEqual(fs.readFileSync(path.join(f.cwd, pending.image)), pending.imageBytes);
  assert.deepEqual(fs.readFileSync(path.join(f.cwd, pending.article)), pending.bytes);
  assert.equal(fs.readFileSync(path.join(f.cwd, 'content/articles/new-story.md'), 'utf8'), article);
});

test('all protected paths, symlinks and quarantine destinations are checked before retaining or moving any output', async t => {
  const cases = {
    'protected code': f => f.write('protected-code.mjs', 'Changed code'),
    'published article': f => f.write('content/articles/published-story.md', 'Changed reporting'),
    'published image': f => f.write('public/images/news/published-story.jpg', 'Changed image'),
    'tracked new draft': f => f.git(['add', 'content/articles/unfinished.md']),
    'tracked new image': f => f.git(['add', 'public/images/news/unfinished.jpg']),
    'ledger baseline': f => f.ledger.runs[f.context.day].baselineSlugs.push('unfinished'),
    'published candidate': f => { f.ledger.candidates[f.pending.id].status = 'published'; },
    'unrelated article': f => f.write('content/articles/guide.md', '---\ncategory: Careers\n---\nNot a News draft.'),
    'unrelated code': f => f.write('content/articles/helper.mjs', 'export const value = 1;'),
    'generated data': f => f.write('public/images/news/generated.json', '{}'),
    'unowned image': f => f.write('public/images/news/orphan.jpg', 'Not tied to any new draft'),
    'ready image symlink': f => {
      fs.unlinkSync(path.join(f.cwd, 'public/images/news/new-story.jpg'));
      fs.symlinkSync('published-story.jpg', path.join(f.cwd, 'public/images/news/new-story.jpg'));
    },
    'pending symlink': f => {
      fs.unlinkSync(path.join(f.cwd, f.pending.article));
      fs.symlinkSync('new-story.md', path.join(f.cwd, f.pending.article));
    },
    'dangling pending image': f => {
      fs.unlinkSync(path.join(f.cwd, f.pending.image));
      fs.symlinkSync('missing.jpg', path.join(f.cwd, f.pending.image));
    },
    'source parent symlink': f => {
      fs.renameSync(path.join(f.cwd, 'content/articles'), path.join(f.cwd, 'saved-articles'));
      fs.symlinkSync('../saved-articles', path.join(f.cwd, 'content/articles'));
    },
    'recovery parent symlink': f => {
      fs.mkdirSync(path.join(f.cwd, '.cache/news-research/recovery'), { recursive: true });
      fs.symlinkSync(path.join(f.cwd, 'public'), path.join(f.cwd, '.cache/news-research/recovery/public'));
    },
    'late recovery file symlink': f => {
      fs.mkdirSync(path.join(f.cwd, '.cache/news-research/recovery/public/images/news'), { recursive: true });
      fs.symlinkSync(path.join(f.cwd, 'protected-code.mjs'), path.join(f.cwd, '.cache/news-research/recovery/public/images/news/unfinished.jpg'));
    },
    'hard-linked recovery file': f => {
      fs.mkdirSync(path.join(f.cwd, '.cache/news-research/recovery/public/images/news'), { recursive: true });
      fs.linkSync(path.join(f.cwd, 'protected-code.mjs'), path.join(f.cwd, '.cache/news-research/recovery/public/images/news/unfinished.jpg'));
    },
    'hard-linked pending image': f => {
      fs.unlinkSync(path.join(f.cwd, f.pending.image));
      fs.linkSync(path.join(f.cwd, 'public/images/news/published-story.jpg'), path.join(f.cwd, f.pending.image));
    },
    'tracked recovery target': f => {
      f.write('.cache/news-research/recovery/public/images/news/unfinished.jpg', 'Tracked recovery target');
      f.git(['add', '.cache/news-research/recovery/public/images/news/unfinished.jpg']);
    },
    'manifest symlink': f => {
      fs.mkdirSync(path.join(f.cwd, '.cache/news-research/recovery'), { recursive: true });
      fs.symlinkSync(path.join(f.cwd, 'protected-code.mjs'), path.join(f.cwd, '.cache/news-research/recovery/staging.json'));
    },
    'feedback symlink': f => fs.symlinkSync(path.join(f.cwd, 'protected-code.mjs'), path.join(f.cwd, '.cache/news-research/validation.json')),
  };
  for (const [name, change] of Object.entries(cases)) await t.test(name, t => {
    const f = fixture(t); f.pending = pendingDraft(f); change(f);
    const before = tree(f.cwd);
    const result = validateNewsDrafts({ ...f, publishReadyBatch: true, audit: () => assert.fail('Unsafe trees cannot be audited') });
    assert.ok(result.fatalErrors.length, JSON.stringify(result));
    assert.equal(result.audited, false); assert.equal(result.draftsValid, false);
    assert.deepEqual(result.quarantinedPaths, []);
    assert.deepEqual(tree(f.cwd), before);
  });
});

test('persisted feedback refuses unsafe paths without rewriting ledger, reports or symlinks', t => {
  const f = fixture(t);
  pendingDraft(f);
  fs.symlinkSync(path.join(f.cwd, 'protected-code.mjs'), path.join(f.cwd, '.cache/news-research/validation.json'));
  const before = tree(f.cwd);
  const result = validateNewsRun({ cwd: f.cwd, persist: true, publishReadyBatch: true, audit: () => assert.fail('Unsafe output') });
  assert.equal(result.draftsValid, false); assert.match(result.fatalErrors.join('\n'), /Symlink/);
  assert.deepEqual(tree(f.cwd), before);
});

function realAudits(t, f, { status = 200, typeError = false } = {}) {
  for (const file of ['validate-news-drafts.ts', 'audit-article-quality.ts', 'audit-article-images.ts', 'audit-article-duplicates.ts', 'audit-articles-formatting.ts', 'lib/news-source-links.mjs']) {
    f.write(`scripts/${file}`, fs.readFileSync(path.resolve('scripts', file)));
  }
  f.write('next.config.mjs', 'export default { images: { remotePatterns: [] } };');
  f.write('tsconfig.json', JSON.stringify({ compilerOptions: { noEmit: true, strict: true, skipLibCheck: true }, files: ['checked.ts'] }));
  f.write('checked.ts', `const value: number = ${typeError ? '"not a number"' : '1'};`);
  fs.symlinkSync(path.resolve('node_modules'), path.join(f.cwd, 'node_modules'));
  f.write('.cache/news-research/audit-probe.mjs', `
    import fs from 'node:fs';
    import cp from 'node:child_process';
    import { syncBuiltinESMExports } from 'node:module';
    const record = entry => fs.appendFileSync('.cache/news-research/audit-calls.jsonl', JSON.stringify(entry) + '\\n');
    const execute = cp.execFileSync;
    cp.execFileSync = function(file, args, options) {
      try {
        const output = execute.call(this, file, args, options);
        record({ args, output: String(output) });
        return output;
      } catch (error) { record({ args, failed: true }); throw error; }
    };
    syncBuiltinESMExports();
    globalThis.fetch = async url => { record({ url }); return new Response('Source fixture', { status: ${status} }); };
  `);
  const previous = process.env.NODE_OPTIONS;
  process.env.NODE_OPTIONS = `${previous || ''} --import=${path.join(f.cwd, '.cache/news-research/audit-probe.mjs')}`;
  t.after(() => { if (previous === undefined) delete process.env.NODE_OPTIONS; else process.env.NODE_OPTIONS = previous; });
  return () => fs.readFileSync(path.join(f.cwd, '.cache/news-research/audit-calls.jsonl'), 'utf8').trim().split('\n').map(line => JSON.parse(line));
}

test('the real audit pipeline runs every normal gate on ready articles plus baseline despite pending duplicate drafts', t => {
  const f = fixture(t, { articleSlug: 'newstory', publishedBody: '---\ntitle: Freight network schedules vessel inspections\ncategory: News\n---\nOcean freight shipping schedules and container inspections.' });
  const pending = pendingDraft(f);
  const article = `---\ntitle: Protocol changes validator collateral rules\ncategory: News\nimage: /images/news/newstory.jpg\nimageCaption: Test photo credit\nimageCreditUrl: https://photo.example/credit\npublishedDate: '${f.context.day}'\n---\n` +
    '[The filing](https://source.example/filing) and [independent reporting](https://other.example/report) describe the decision.\n\n' +
    Array.from({ length: 40 }, (_, i) => `The protocol council recorded vote ${i} after validators submitted evidence about collateral deposits, withdrawal deadlines, voting rights and review procedures.\n`).join('\n');
  f.write('content/articles/newstory.md', article);
  const photo = Buffer.concat([Buffer.from('/9j/', 'base64'), Buffer.alloc(16 * 1024, 1)]);
  f.write('public/images/news/newstory.jpg', photo);
  f.write(pending.article, article.replaceAll('newstory.jpg', 'unfinished.jpg'));
  const calls = realAudits(t, f);
  const result = validateNewsRun({ cwd: f.cwd, persist: true, publishReadyBatch: true });
  assert.equal(result.audited, true); assert.equal(result.draftsValid, true, JSON.stringify(result));
  assert.equal(result.complete, false); assert.equal(result.counts.unreviewed, 1); assert.equal(result.counts.published, 0);
  assert.deepEqual(result.draftPaths, ['content/articles/newstory.md', 'public/images/news/newstory.jpg']);
  const records = calls(), commands = records.filter(entry => entry.args);
  assert.deepEqual(commands.map(entry => entry.args.find(arg => /audit-article-|typescript/.test(arg))), [
    'scripts/audit-article-quality.ts', 'scripts/audit-article-images.ts', 'scripts/audit-article-duplicates.ts', 'node_modules/typescript/bin/tsc',
  ]);
  assert.equal(JSON.parse(commands[0].output).articles, 2);
  assert.equal(JSON.parse(commands[1].output).newsArticles, 2);
  assert.equal(JSON.parse(commands[2].output).newsArticles, 2);
  assert.equal(JSON.parse(commands[2].output).duplicatePairs, 0);
  assert.deepEqual(records.filter(entry => entry.url).map(entry => entry.url).sort(), ['https://other.example/report', 'https://photo.example/credit', 'https://source.example/filing']);
});

test('real audits report word count, sources, HTTP 200, dates, images, formatting, duplicate baseline and typecheck failures with backlog', t => {
  const body = 'Validator collateral deposits change after a recorded council vote. &amp; [The filing](https://source.example/filing)';
  const f = fixture(t, { articleSlug: 'newstory', publishedBody: `---\ntitle: Protocol changes validator collateral rules\ncategory: News\n---\n${body}` });
  pendingDraft(f);
  f.write('content/articles/newstory.md', `---\ntitle: Protocol changes validator collateral rules\ncategory: News\nimage: /images/news/newstory.jpg\nimageCaption: Test credit\nimageCreditUrl: https://photo.example/credit\npublishedDate: '2026-10-01'\n---\n${body}`);
  f.write('public/images/news/newstory.jpg', Buffer.alloc(16 * 1024, 1));
  const calls = realAudits(t, f, { status: 403, typeError: true });
  const result = validateNewsRun({ cwd: f.cwd, persist: true, publishReadyBatch: true });
  assert.equal(result.audited, true); assert.equal(result.draftsValid, false); assert.equal(result.complete, false);
  for (const pattern of [/under 600 words/, /at least 2 external sources/, /Source link HTTP 403/, /publishedDate must match/, /not a valid image/, /Raw HTML Entities/, /Duplicate reporting: .*published-story/, /Typecheck failed;/]) {
    assert.match(result.validationErrors.join('\n'), pattern);
  }
  assert.equal(calls().filter(entry => entry.args).length, 4);
  assert.equal(calls().filter(entry => entry.url).length, 2);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(f.cwd, '.cache/news-research/validation.json'), 'utf8')), result);
  assert.equal(result.counts.ready, 1); assert.equal(result.counts.unreviewed, 1); assert.equal(result.counts.published, 0);
});
