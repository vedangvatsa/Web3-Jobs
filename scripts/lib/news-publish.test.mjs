import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { test } from 'node:test';
import { allowedNewsPath, pushNewsFiles } from './news-publish.mjs';
import { prepareResearch } from './news-research.mjs';

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
