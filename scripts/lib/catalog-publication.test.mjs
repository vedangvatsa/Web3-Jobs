import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import test from 'node:test';
import { mergeCatalogMap, publishCatalog } from './catalog-publication.mjs';

function fixture(t) {
  fs.mkdirSync('.cache', { recursive: true });
  const root = fs.mkdtempSync(path.resolve('.cache/catalog-publish-test-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const cwd = path.join(root, 'writer'), remote = path.join(root, 'remote.git'), peer = path.join(root, 'peer');
  const env = { ...process.env, GIT_AUTHOR_NAME: 'Test', GIT_AUTHOR_EMAIL: 'test@example.com', GIT_COMMITTER_NAME: 'Test', GIT_COMMITTER_EMAIL: 'test@example.com' };
  const git = (args, directory = cwd) => execFileSync('git', args, { cwd: directory, env, encoding: 'utf8', stdio: 'pipe' }).trim();
  const write = (directory, file, data) => { fs.mkdirSync(path.dirname(path.join(directory, file)), { recursive: true }); fs.writeFileSync(path.join(directory, file), data); };
  git(['init', '--bare', remote], root); git(['init', '--initial-branch=main', cwd], root);
  write(cwd, 'content/jobs-runtime.json', '["old"]');
  write(cwd, 'content/news-research.json', '{}');
  write(cwd, 'content/prebuild-input-hashes.json', '{"version":1,"steps":{"jobs":{"inputHash":"old"},"events":{"inputHash":"old"}}}');
  write(cwd, 'public/og/jobs/old.png', 'old asset');
  git(['add', '.']); git(['commit', '-m', 'Catalogue fixture']); git(['remote', 'add', 'origin', remote]); git(['push', 'origin', 'main']);
  git(['clone', '--branch=main', remote, peer], root);
  const head = git(['rev-parse', 'HEAD']);
  const run = async options => {
    const previous = process.env.GITHUB_ACTIONS; process.env.GITHUB_ACTIONS = 'true';
    try { return await publishCatalog({ kind: 'jobs', cwd, wait: async () => {}, ...options }); }
    finally { if (previous === undefined) delete process.env.GITHUB_ACTIONS; else process.env.GITHUB_ACTIONS = previous; }
  };
  return { root, cwd, remote, peer, git, write, head, run };
}

test('catalogues survive more than three concurrent research pushes without rebasing a dirty checkout', async t => {
  const { cwd, remote, peer, git, write, head, run } = fixture(t);
  write(cwd, 'content/jobs-runtime.json', '["new"]');
  write(cwd, 'unrelated-dirty.txt', 'Keep local work');
  git(['add', 'unrelated-dirty.txt']);
  fs.unlinkSync(path.join(cwd, 'public/og/jobs/old.png'));
  const result = await run({ beforePush: ({ attempt }) => {
    if (attempt > 4) return;
    write(peer, 'content/news-research.json', JSON.stringify({ checkpoint: attempt }));
    git(['add', '.'], peer); git(['commit', '-m', `Research checkpoint ${attempt}`], peer); git(['push', 'origin', 'main'], peer);
  } });
  assert.equal(result.attempt, 5);
  assert.equal(git(['--git-dir', remote, 'show', 'main:content/jobs-runtime.json']), '["new"]');
  assert.equal(JSON.parse(git(['--git-dir', remote, 'show', 'main:content/news-research.json'])).checkpoint, 4);
  assert.throws(() => git(['--git-dir', remote, 'show', 'main:public/og/jobs/old.png']));
  assert.throws(() => git(['--git-dir', remote, 'show', 'main:unrelated-dirty.txt']));
  assert.equal(git(['rev-parse', 'HEAD']), head);
  assert.equal(git(['diff', '--cached', '--name-only']), 'unrelated-dirty.txt');
});

test('different generator hashes merge while genuinely conflicting catalogue updates fail visibly', async t => {
  const { cwd, remote, peer, git, write, run } = fixture(t);
  write(cwd, 'content/prebuild-input-hashes.json', '{"version":1,"steps":{"jobs":{"inputHash":"new"},"events":{"inputHash":"old"}}}');
  write(peer, 'content/prebuild-input-hashes.json', '{"version":1,"steps":{"jobs":{"inputHash":"old"},"events":{"inputHash":"new"}}}');
  git(['add', '.'], peer); git(['commit', '-m', 'Event generation'], peer); git(['push', 'origin', 'main'], peer);
  await run();
  const merged = JSON.parse(git(['--git-dir', remote, 'show', 'main:content/prebuild-input-hashes.json']));
  assert.deepEqual(merged.steps, { jobs: { inputHash: 'new' }, events: { inputHash: 'new' } });
  git(['pull', '--ff-only', 'origin', 'main'], peer);
  write(peer, 'content/jobs-runtime.json', '["newer remote"]'); git(['add', '.'], peer); git(['commit', '-m', 'Newer jobs'], peer); git(['push', 'origin', 'main'], peer);
  write(cwd, 'content/jobs-runtime.json', '["older local"]');
  await assert.rejects(run(), /Newer main changed content\/jobs-runtime/);
  assert.equal(git(['--git-dir', remote, 'show', 'main:content/jobs-runtime.json']), '["newer remote"]');
  assert.ok(fs.existsSync(path.join(cwd, '.cache/catalog-publication/jobs/snapshot.json')));
});

test('shared-map merge preserves independent additions and deletions and rejects competing values', () => {
  const result = mergeCatalogMap({ keep: 1, remove: 2 }, { keep: 1, added: 3 }, { keep: 1, remove: 2, remote: 4 });
  assert.deepEqual(JSON.parse(JSON.stringify(result)), { keep: 1, added: 3, remote: 4 });
  assert.throws(() => mergeCatalogMap({ value: 1 }, { value: 2 }, { value: 3 }), /Concurrent catalogue conflict/);
});

test('event publication carries tombstones and asset/guide deletions without unrelated files', async t => {
  const { cwd, remote, git, write, run } = fixture(t);
  for (const file of ['public/events/old.webp', 'public/preview/old.html', 'public/responsive/old/320.webp']) write(cwd, file, 'old');
  write(cwd, 'src/lib/event-guides.ts', 'old guide');
  git(['add', '.']); git(['commit', '-m', 'Event assets']); git(['push', 'origin', 'main']);
  for (const file of ['public/events/old.webp', 'public/preview/old.html', 'public/responsive/old/320.webp']) fs.unlinkSync(path.join(cwd, file));
  write(cwd, 'src/lib/event-guides.ts', 'retained guides');
  write(cwd, 'content/event-tombstones.json', '{"old":{"until":"2027-10-12T00:00:00Z","slugs":["old"]}}');
  write(cwd, 'unrelated.txt', 'leave alone');
  await run({ kind: 'events' });
  for (const file of ['public/events/old.webp', 'public/preview/old.html', 'public/responsive/old/320.webp', 'unrelated.txt']) assert.throws(() => git(['--git-dir', remote, 'show', `main:${file}`]));
  assert.equal(JSON.parse(git(['--git-dir', remote, 'show', 'main:content/event-tombstones.json'])).old.slugs[0], 'old');
  assert.equal(git(['--git-dir', remote, 'show', 'main:src/lib/event-guides.ts']), 'retained guides');
});

test('job publication retains original-date evidence and expiry indexes with asset deletions', async t => {
  const { cwd, remote, git, write, run } = fixture(t);
  const files = {
    'content/job-date-history.json': { posting: { date: '2024-03-09T05:33:00.298Z' } },
    'content/job-date-provenance.json': { records: { posting: { dateVerified: true } } },
    'content/job-age-paths.json': { marketing4: '2024-03-09T05:33:00.298Z' },
    'content/job-age-page-scopes.json': { '/': 'catalog' },
    'content/removed-job-listings.json': { posting: { reason: 'application-not-found' } },
    'content/image-redirects.json': { '/og/jobs/old.png': '/og-image.png' },
  };
  for (const [name, value] of Object.entries(files)) write(cwd, name, JSON.stringify(value));
  write(cwd, 'unrelated.json', '{"preserve":true}');
  fs.unlinkSync(path.join(cwd, 'public/og/jobs/old.png'));
  await run();
  for (const [name, value] of Object.entries(files)) assert.deepEqual(JSON.parse(git(['--git-dir', remote, 'show', `main:${name}`])), value);
  assert.throws(() => git(['--git-dir', remote, 'show', 'main:public/og/jobs/old.png']));
  assert.throws(() => git(['--git-dir', remote, 'show', 'main:unrelated.json']));
});
