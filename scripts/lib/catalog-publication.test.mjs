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
  write(cwd, 'content/events-runtime.json', '[{"id":"old-event","slug":"old"}]');
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
    'content/sources/country-local-import.json': { before: 1, after: 1, added: [], reports: [{ source: 'country', outcome: 'expired' }] },
    'content/sources/hiring-links-636-import.json': { before: 1, after: 1, added: [], reports: [{ source: 'expansion', outcome: 'unknown-date' }] },
  };
  for (const [name, value] of Object.entries(files)) write(cwd, name, JSON.stringify(value));
  write(cwd, 'unrelated.json', '{"preserve":true}');
  for (const name of ['content/sources/raw-response.json', 'content/sources/research-leads.csv']) write(cwd, name, 'private research');
  fs.unlinkSync(path.join(cwd, 'public/og/jobs/old.png'));
  await run();
  for (const [name, value] of Object.entries(files)) assert.deepEqual(JSON.parse(git(['--git-dir', remote, 'show', `main:${name}`])), value);
  assert.throws(() => git(['--git-dir', remote, 'show', 'main:public/og/jobs/old.png']));
  assert.throws(() => git(['--git-dir', remote, 'show', 'main:unrelated.json']));
  for (const name of ['content/sources/raw-response.json', 'content/sources/research-leads.csv']) assert.throws(() => git(['--git-dir', remote, 'show', `main:${name}`]));
});

test('event publication preserves concurrently refreshed job and company previews, including expired job deletions from its stale checkout', async t => {
  const { cwd, remote, peer, git, write, run } = fixture(t);
  const manifestPath = 'public/preview/.preview-manifest.json';
  const baseManifest = { '/eng41': 'old-job', '/bitget': 'old-company', '/old': 'old-event', '/old-alias': 'old-alias', '/retired': 'old-retired', '/events': 'old-hub', __default__: 'old-default' };
  write(cwd, manifestPath, JSON.stringify(baseManifest));
  write(cwd, 'content/event-slug-history.json', '{"old-event":{"slug":"old","aliases":["old-alias"]}}');
  write(cwd, 'content/event-tombstones.json', '{"retired-event":{"slugs":["retired"],"until":"2027-10-15T00:00:00Z"}}');
  for (const slug of ['eng41', 'bitget', 'old', 'old-alias', 'retired', 'events', 'default']) write(cwd, `public/preview/${slug}.html`, `old ${slug}`);
  git(['add', '.']); git(['commit', '-m', 'Shared preview fixture']); git(['push', 'origin', 'main']);
  git(['pull', '--ff-only', 'origin', 'main'], peer);

  write(cwd, 'content/events-runtime.json', '[{"id":"old-event","slug":"old","aliases":["new-alias"]}]');
  write(cwd, manifestPath, JSON.stringify({ '/bitget': 'stale-company', '/old': 'new-event', '/new-alias': 'new-alias', '/events': 'new-hub', __default__: 'stale-default' }));
  for (const slug of ['eng41', 'old-alias', 'retired']) fs.unlinkSync(path.join(cwd, `public/preview/${slug}.html`));
  for (const slug of ['old', 'new-alias', 'events', 'bitget', 'default', 'unrelated']) write(cwd, `public/preview/${slug}.html`, `local ${slug}`);

  const remoteManifest = { ...baseManifest, '/eng41': 'new-job', '/bitget': 'new-company', '/remote-story': 'remote-story', __default__: 'remote-default' };
  write(peer, manifestPath, JSON.stringify(remoteManifest));
  write(peer, 'public/preview/eng41.html', 'new job');
  write(peer, 'public/preview/bitget.html', 'new company');
  write(peer, 'public/preview/default.html', 'remote default');
  write(peer, 'public/preview/remote-story.html', 'remote story');
  git(['add', '.'], peer); git(['commit', '-m', 'Concurrent job previews'], peer); git(['push', 'origin', 'main'], peer);

  await run({ kind: 'events' });
  const published = JSON.parse(git(['--git-dir', remote, 'show', `main:${manifestPath}`]));
  const expected = { ...remoteManifest, '/old': 'new-event', '/new-alias': 'new-alias', '/events': 'new-hub' };
  delete expected['/old-alias']; delete expected['/retired'];
  assert.deepEqual(published, expected);
  assert.equal(git(['--git-dir', remote, 'show', 'main:public/preview/eng41.html']), 'new job');
  assert.equal(git(['--git-dir', remote, 'show', 'main:public/preview/bitget.html']), 'new company');
  assert.equal(git(['--git-dir', remote, 'show', 'main:public/preview/default.html']), 'remote default');
  for (const slug of ['old', 'new-alias', 'events']) assert.equal(git(['--git-dir', remote, 'show', `main:public/preview/${slug}.html`]), `local ${slug}`);
  for (const slug of ['old-alias', 'retired', 'unrelated']) assert.throws(() => git(['--git-dir', remote, 'show', `main:public/preview/${slug}.html`]));
  assert.equal(fs.existsSync(path.join(cwd, 'public/preview/eng41.html')), false);
  assert.equal(fs.readFileSync(path.join(cwd, 'public/preview/bitget.html'), 'utf8'), 'local bitget');
});

test('event preview scoping still rejects conflicting event fingerprints and HTML', async t => {
  for (const file of ['public/preview/.preview-manifest.json', 'public/preview/old.html']) {
    await t.test(file, async t => {
      const { cwd, remote, peer, git, write, run } = fixture(t);
      const data = value => file.endsWith('.json') ? JSON.stringify({ '/old': value }) : value;
      write(cwd, file, data('base'));
      git(['add', '.']); git(['commit', '-m', 'Event preview fixture']); git(['push', 'origin', 'main']);
      git(['pull', '--ff-only', 'origin', 'main'], peer);
      write(cwd, file, data('local'));
      write(peer, file, data('remote'));
      git(['add', '.'], peer); git(['commit', '-m', 'Concurrent event preview'], peer); git(['push', 'origin', 'main'], peer);
      await assert.rejects(run({ kind: 'events' }), /Concurrent catalogue conflict|Newer main changed/);
      assert.equal(git(['--git-dir', remote, 'show', `main:${file}`]), data('remote'));
      assert.ok(fs.existsSync(path.join(cwd, '.cache/catalog-publication/events/snapshot.json')));
    });
  }
});

test('event publication cannot remove the shared preview manifest', async t => {
  const { cwd, remote, git, write, run } = fixture(t);
  const file = 'public/preview/.preview-manifest.json';
  const manifest = JSON.stringify({ '/old': 'event', '/eng41': 'job', __default__: 'default' });
  write(cwd, file, manifest);
  git(['add', '.']); git(['commit', '-m', 'Shared manifest']); git(['push', 'origin', 'main']);
  fs.unlinkSync(path.join(cwd, file));
  await assert.rejects(run({ kind: 'events' }), /cannot delete the shared preview manifest/);
  assert.equal(git(['--git-dir', remote, 'show', `main:${file}`]), manifest);
});
