import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { mergeNewsState, persistNewsState } from './telegram-news-state.mjs';

const posted = '.telegram-news-posted-web3newsfeed.json';
const last = '.telegram-news-last-web3newsfeed.json';
const env = {
  ...process.env,
  GIT_AUTHOR_NAME: 'Test', GIT_COMMITTER_NAME: 'Test',
  GIT_AUTHOR_EMAIL: 'test@example.com', GIT_COMMITTER_EMAIL: 'test@example.com',
};
const git = (cwd, ...args) => execFileSync('git', args, { cwd, env, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();

test('merges both posting histories and keeps the newest cooldown', () => {
  assert.deepEqual(mergeNewsState(posted, ['old', 'local'], ['old', 'remote']), ['old', 'remote', 'local']);
  assert.deepEqual(mergeNewsState(last, { postedAt: '2026-09-25T00:00:00Z' }, { postedAt: '2026-09-26T00:00:00Z' }), { postedAt: '2026-09-26T00:00:00Z' });
  assert.throws(() => mergeNewsState(posted, {}, []), /Invalid posted history/);
  assert.throws(() => mergeNewsState(last, { postedAt: 'invalid' }, undefined), /Invalid cooldown/);
  assert.deepEqual(mergeNewsState('.telegram-news-deliveries-test.json', { a: { status: 'reserved' } }, { a: { status: 'sent', messageId: 123 } }), { a: { status: 'sent', messageId: 123 } });
});

test('publishes receipts from a stale dirty checkout without overwriting newer remote code or history', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'news-state-test-'));
  try {
    const remote = path.join(root, 'remote.git');
    const local = path.join(root, 'local');
    const other = path.join(root, 'other');
    git(root, 'init', '--bare', remote);
    git(root, 'clone', remote, local);
    git(local, 'checkout', '-b', 'main');
    fs.writeFileSync(path.join(local, posted), JSON.stringify(['old']));
    fs.writeFileSync(path.join(local, 'events.json'), 'original');
    git(local, 'add', '.');
    git(local, 'commit', '-m', 'initial');
    git(local, 'push', 'origin', 'main');
    git(root, 'clone', '-b', 'main', remote, other);
    fs.writeFileSync(path.join(other, posted), JSON.stringify(['old', 'concurrent receipt']));
    fs.writeFileSync(path.join(other, 'events.json'), 'remote update');
    git(other, 'add', '.');
    git(other, 'commit', '-m', 'concurrent update');
    git(other, 'push', 'origin', 'main');
    const originalHead = git(local, 'rev-parse', 'HEAD');
    fs.writeFileSync(path.join(local, posted), JSON.stringify(['old', 'Peirce departure receipt']));
    fs.writeFileSync(path.join(local, 'events.json'), 'local conflicting update');
    git(local, 'add', 'events.json');
    const originalIndex = git(local, 'write-tree');
    persistNewsState({ cwd: local });
    git(other, 'fetch', 'origin', 'main');
    assert.deepEqual(JSON.parse(git(other, 'show', `FETCH_HEAD:${posted}`)), ['old', 'concurrent receipt', 'Peirce departure receipt']);
    assert.equal(git(other, 'show', 'FETCH_HEAD:events.json'), 'remote update');
    assert.equal(git(local, 'rev-parse', 'HEAD'), originalHead);
    assert.equal(git(local, 'write-tree'), originalIndex);
    assert.equal(fs.readFileSync(path.join(local, 'events.json'), 'utf8'), 'local conflicting update');
    const saved = git(other, 'rev-parse', 'FETCH_HEAD');
    persistNewsState({ cwd: local });
    git(other, 'fetch', 'origin', 'main');
    assert.equal(git(other, 'rev-parse', 'FETCH_HEAD'), saved);
    fs.writeFileSync(path.join(local, posted), JSON.stringify(['old']));
    persistNewsState({ cwd: local, syncOnly: true });
    assert.ok(JSON.parse(fs.readFileSync(path.join(local, posted))).includes('Peirce departure receipt'));
    fs.writeFileSync(path.join(local, posted), JSON.stringify(['old', 'race receipt']));
    let validations = 0;
    persistNewsState({ cwd: local, validateRemote: () => {
      if (++validations !== 1) return;
      git(other, 'reset', '--hard', 'FETCH_HEAD');
      fs.writeFileSync(path.join(other, 'events.json'), 'racing remote update');
      git(other, 'add', 'events.json');
      git(other, 'commit', '-m', 'race during receipt push');
      git(other, 'push', 'origin', 'main');
    } });
    assert.equal(validations, 2);
    git(other, 'fetch', 'origin', 'main');
    assert.equal(git(other, 'show', 'FETCH_HEAD:events.json'), 'racing remote update');
    assert.ok(JSON.parse(git(other, 'show', `FETCH_HEAD:${posted}`)).includes('race receipt'));
    fs.writeFileSync(path.join(remote, 'hooks', 'pre-receive'), '#!/bin/sh\nexit 1\n', { mode: 0o755 });
    fs.writeFileSync(path.join(local, posted), JSON.stringify(['unsaved receipt']));
    assert.throws(() => persistNewsState({ cwd: local, attempts: 2 }), /push failed/);
    assert.ok(JSON.parse(fs.readFileSync(path.join(local, posted))).includes('unsaved receipt'));
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
