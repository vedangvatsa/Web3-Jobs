import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { mergeEventState, persistEventState, type EventDelivery } from './social/telegram-event-state';
import { assertEventDeliveryAvailable, eventIdentity } from './lib/telegram-event-delivery';
import type { Web3Event } from '../src/lib/events';

const posted = '.telegram-events-posted-hashtagweb3.json';
const deliveries = '.telegram-events-deliveries-hashtagweb3.json';
const mirrors = '.telegram-events-mirrors-hashtagweb3.json';
const last = '.telegram-events-last-hashtagweb3.json';
const event: Web3Event = { id: 'test-event', slug: 'test-event', name: 'Ethereum meeting', startDate: '2026-10-07', location: 'Singapore', url: 'https://luma.com/test', description: '', coverImage: null };
const reservation: EventDelivery = { status: 'reserved', reservedAt: '2026-09-28T10:00:00Z', chatId: '@hashtagweb3', threadId: 1454, events: [eventIdentity(event)] };
const env = { ...process.env, GIT_AUTHOR_NAME: 'Test', GIT_COMMITTER_NAME: 'Test', GIT_AUTHOR_EMAIL: 'test@example.com', GIT_COMMITTER_EMAIL: 'test@example.com' };
const git = (cwd: string, ...args: string[]) => execFileSync('git', args, { cwd, env, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();

test('event receipts merge monotonically without trimming old event identities', () => {
  const history = Array.from({ length: 600 }, (_, index) => `event-${index}`);
  assert.equal((mergeEventState(posted, ['new'], history) as string[]).length, 601);
  const sent = { ...reservation, status: 'sent', messageId: 123, sentAt: '2026-09-28T10:01:00Z' };
  assert.deepEqual(mergeEventState(deliveries, { a: reservation }, { a: sent }), { a: sent });
  assert.deepEqual(mergeEventState(last, { postedAt: '2026-09-27T00:00:00Z' }, { postedAt: '2026-09-28T00:00:00Z' }), { postedAt: '2026-09-28T00:00:00Z' });
  const mirror = { fromChatId: '@hashtagweb3', sourceMessageId: 123, destination: '@eventsweb3', status: 'reserved', attempts: 1 };
  assert.deepEqual(mergeEventState(mirrors, { a: { ...mirror, status: 'rejected' } }, { a: mirror }), { a: { ...mirror, status: 'rejected' } });
  assert.deepEqual(mergeEventState(mirrors, { a: { ...mirror, attempts: 2 } }, { a: { ...mirror, status: 'rejected' } }), { a: { ...mirror, attempts: 2 } });
  assert.deepEqual(mergeEventState(mirrors, { a: mirror }, { a: { ...mirror, deliveredMessageId: 456 } }), { a: { ...mirror, deliveredMessageId: 456 } });
  assert.throws(() => mergeEventState(posted, {}, []), /Invalid/);
  assert.throws(() => mergeEventState(deliveries, { a: { status: 'sent' } }, {}), /Invalid/);
  assert.throws(() => mergeEventState(mirrors, { a: { ...mirror, status: 'sent' } }, {}), /Invalid/);
});

test('event state survives a stale dirty checkout, cache rebases, and competing reservations', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'event-state-git-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const remote = path.join(root, 'remote.git'), local = path.join(root, 'local'), other = path.join(root, 'other');
  git(root, 'init', '--bare', remote);
  git(root, 'clone', remote, local);
  git(local, 'checkout', '-b', 'main');
  fs.writeFileSync(path.join(local, posted), '["old"]');
  fs.writeFileSync(path.join(local, 'events.json'), 'original');
  git(local, 'add', '.'); git(local, 'commit', '-m', 'initial'); git(local, 'push', 'origin', 'main');
  git(root, 'clone', '-b', 'main', remote, other);
  fs.writeFileSync(path.join(other, posted), '["old","other receipt"]');
  fs.writeFileSync(path.join(other, 'events.json'), 'newer catalog');
  git(other, 'add', '.'); git(other, 'commit', '-m', 'other update'); git(other, 'push', 'origin', 'main');
  const head = git(local, 'rev-parse', 'HEAD');
  fs.writeFileSync(path.join(local, posted), '["old","local receipt"]');
  fs.writeFileSync(path.join(local, 'events.json'), 'local catalog');
  git(local, 'add', 'events.json');
  const index = git(local, 'write-tree');
  persistEventState({ cwd: local });
  git(other, 'fetch', 'origin', 'main');
  assert.deepEqual(JSON.parse(git(other, 'show', `FETCH_HEAD:${posted}`)), ['old', 'other receipt', 'local receipt']);
  assert.equal(git(other, 'show', 'FETCH_HEAD:events.json'), 'newer catalog');
  assert.equal(git(local, 'rev-parse', 'HEAD'), head);
  assert.equal(git(local, 'write-tree'), index);
  fs.writeFileSync(path.join(local, deliveries), JSON.stringify({ local: reservation }));
  let validations = 0;
  assert.throws(() => persistEventState({ cwd: local, validateRemote: state => {
    assertEventDeliveryAvailable([event], (state.get(posted) || []) as string[], (state.get(deliveries) || {}) as Record<string, EventDelivery>);
    if (++validations === 1) {
      fs.writeFileSync(path.join(other, deliveries), JSON.stringify({ winner: reservation }));
      persistEventState({ cwd: other });
    }
  } }), /Unconfirmed/);
  git(other, 'fetch', 'origin', 'main');
  assert.deepEqual(Object.keys(JSON.parse(git(other, 'show', `FETCH_HEAD:${deliveries}`))), ['winner']);
  fs.unlinkSync(path.join(local, deliveries));
  persistEventState({ cwd: local, syncOnly: true });
  assert.deepEqual(Object.keys(JSON.parse(fs.readFileSync(path.join(local, deliveries), 'utf8'))), ['winner']);

  // The cache commit must not re-stage histories already published on a newer main.
  git(local, 'add', '.');
  git(local, 'restore', '--source=HEAD', '--staged', '--worktree', '--', '.telegram-events-*.json');
  assert.equal(git(local, 'diff', '--cached', '--name-only'), 'events.json');
  assert.equal(fs.existsSync(path.join(local, deliveries)), false);
});
