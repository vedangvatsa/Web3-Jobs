import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import test from 'node:test';
import { prepareResearch, reviewCandidate } from './news-research.mjs';
import { validateNewsDrafts } from './news-validation.mjs';
import { validateNewsRun } from '../validate-news-run.mjs';

function fixture(t) {
  fs.mkdirSync('.cache', { recursive: true });
  const cwd = fs.mkdtempSync(path.resolve('.cache/news-validation-test-'));
  t.after(() => fs.rmSync(cwd, { recursive: true, force: true }));
  const write = (file, body) => { fs.mkdirSync(path.dirname(path.join(cwd, file)), { recursive: true }); fs.writeFileSync(path.join(cwd, file), body); };
  const env = { ...process.env, GIT_AUTHOR_NAME: 'Test', GIT_AUTHOR_EMAIL: 'test@example.com', GIT_COMMITTER_NAME: 'Test', GIT_COMMITTER_EMAIL: 'test@example.com' };
  const git = args => execFileSync('git', args, { cwd, env, encoding: 'utf8', stdio: 'pipe' }).trim();
  git(['init', '--initial-branch=main']);
  write('content/articles/published-story.md', 'Existing reporting');
  write('public/images/news/published-story.jpg', 'Existing image');
  write('protected-code.mjs', 'Original code');
  write('content/news-research.json', '{}');
  git(['add', '.']); git(['commit', '-m', 'Validation fixture']);
  const day = new Date().toISOString().slice(0, 10), context = { day, baseSha: git(['rev-parse', 'HEAD']) };
  const ledger = { version: 1, candidates: {}, runs: {} };
  prepareResearch({ ledger, day, articles: [{ slug: 'published-story' }], discovery: { total: 1, feeds: [{ ok: true }], candidates: [{ title: 'A new filing changes the protocol rules', link: 'https://source.example/filing', source: 'Test', published: day }] } });
  const id = ledger.runs[day].candidateIds[0];
  write('content/articles/new-story.md', `---\ntitle: A new filing\ncategory: News\nimage: /images/news/new-story.jpg\npublishedDate: '${day}'\n---\nDraft text.\n`);
  write('public/images/news/new-story.jpg', 'New image fixture');
  reviewCandidate(ledger, day, { id, status: 'ready', articleSlug: 'new-story', note: 'The filing and its stated effective date were read in two independent reports.', sourceChecks: [{ url: 'https://source.example/filing', outcome: 'read' }, { url: 'https://other.example/report', outcome: 'read' }] }, { articles: [{ slug: 'new-story' }] });
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
