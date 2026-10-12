import assert from 'node:assert/strict';
import { test, type TestContext } from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { mergeEventState, persistEventState, type EventDelivery } from './social/telegram-event-state';
import { assertEventDeliveryAvailable, deliverEventsOnce, eventIdentity } from './lib/telegram-event-delivery';
import type { Web3Event } from '../src/lib/events';

const posted = '.telegram-events-posted-hashtagweb3.json';
const deliveries = '.telegram-events-deliveries-hashtagweb3.json';
const mirrors = '.telegram-events-mirrors-hashtagweb3.json';
const last = '.telegram-events-last-hashtagweb3.json';
const event: Web3Event = { id: 'test-event', slug: 'test-event', name: 'Ethereum meeting', startDate: '2026-10-07', location: 'Singapore', url: 'https://luma.com/test', description: '', coverImage: null };
const reservation: EventDelivery = { status: 'reserved', reservedAt: '2026-09-28T10:00:00Z', chatId: '@hashtagweb3', threadId: 1454, events: [eventIdentity(event)] };
const env = { ...process.env, GIT_AUTHOR_NAME: 'Test', GIT_COMMITTER_NAME: 'Test', GIT_AUTHOR_EMAIL: 'test@example.com', GIT_COMMITTER_EMAIL: 'test@example.com' };
const git = (cwd: string, ...args: string[]) => execFileSync('git', args, { cwd, env, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();

function repository(t: TestContext) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'event-state-race-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const remote = path.join(root, 'remote.git'), local = path.join(root, 'local'), other = path.join(root, 'other');
  const write = (cwd: string, name: string, value: unknown) => fs.writeFileSync(path.join(cwd, name), JSON.stringify(value, null, 2) + '\n');
  const read = (cwd: string, name: string) => JSON.parse(fs.readFileSync(path.join(cwd, name), 'utf8'));
  git(root, 'init', '--bare', remote);
  git(root, 'clone', remote, local);
  git(local, 'checkout', '-b', 'main');
  write(local, posted, ['old']);
  write(local, deliveries, {});
  write(local, mirrors, {});
  write(local, last, { postedAt: '2026-09-27T00:00:00Z' });
  fs.writeFileSync(path.join(local, 'events.json'), 'original');
  git(local, 'add', '.'); git(local, 'commit', '-m', 'initial'); git(local, 'push', 'origin', 'main');
  git(root, 'clone', '-b', 'main', remote, other);
  const publishOther = () => {
    git(other, 'add', '.'); git(other, 'commit', '-m', 'competing publisher'); git(other, 'push', 'origin', 'main');
  };
  const remoteState = (name: string) => JSON.parse(git(remote, 'show', `refs/heads/main:${name}`));
  const waits = t.mock.method(Atomics, 'wait', () => 'timed-out');
  const warnings = t.mock.method(console, 'warn', () => {});
  return { remote, local, other, write, read, publishOther, remoteState, waits, warnings };
}

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

test('event receipts survive seven competing same-file commits without changing HEAD or the dirty index', t => {
  const f = repository(t);
  t.mock.method(Math, 'random', () => 0.5);
  const history = ['old', ...Array.from({ length: 599 }, (_, index) => `historical-${index}`)];
  const localSent: EventDelivery = { ...reservation, status: 'sent', messageId: 321, sentAt: '2026-09-28T10:01:00Z' };
  const remoteSent: EventDelivery = { ...reservation, status: 'sent', messageId: 654, sentAt: '2026-09-28T11:01:00Z' };
  const mirror = { fromChatId: '@hashtagweb3', sourceMessageId: 321, destination: '@eventsweb3', status: 'sent', deliveredMessageId: 789, attempts: 1 };
  f.write(f.local, posted, [...history, 'local receipt']);
  f.write(f.local, deliveries, { local: localSent, remote: reservation, ambiguous: reservation });
  f.write(f.local, mirrors, { local: mirror });
  f.write(f.local, last, { postedAt: localSent.sentAt });
  fs.writeFileSync(path.join(f.local, 'events.json'), 'staged catalog');
  git(f.local, 'add', 'events.json', posted, deliveries);
  fs.writeFileSync(path.join(f.local, 'events.json'), 'unstaged catalog');
  fs.writeFileSync(path.join(f.local, 'scratch.txt'), 'untracked evidence');
  const head = git(f.local, 'rev-parse', 'HEAD');
  const index = fs.readFileSync(path.join(f.local, '.git', 'index'));
  const bases = new Set<string>();
  let validations = 0;
  persistEventState({ cwd: f.local, validateRemote: state => {
    bases.add(git(f.local, 'rev-parse', 'FETCH_HEAD'));
    const attempt = ++validations;
    if (attempt > 1) assert.ok((state.get(posted) as string[]).includes(`remote-${attempt - 1}`));
    if (attempt === 8) return;
    f.write(f.other, posted, [...history, ...Array.from({ length: attempt }, (_, index) => `remote-${index + 1}`)]);
    f.write(f.other, deliveries, { local: reservation, remote: attempt >= 3 ? remoteSent : reservation, competing: reservation });
    f.write(f.other, mirrors, { local: { ...mirror, status: 'reserved', deliveredMessageId: undefined }, remote: { ...mirror, sourceMessageId: 654 } });
    f.write(f.other, last, { postedAt: remoteSent.sentAt });
    fs.writeFileSync(path.join(f.other, 'events.json'), `catalog-${attempt}`);
    f.publishOther();
  } });
  assert.equal(validations, 8);
  assert.equal(bases.size, 8);
  assert.equal(f.waits.mock.callCount(), 7);
  const delays = f.waits.mock.calls.map(call => Number(call.arguments[3]));
  assert.ok(delays.reduce((sum, delay) => sum + delay, 0) >= 45_500);
  assert.ok(delays.every(delay => delay >= 500 && delay <= 30_000));
  assert.equal(f.warnings.mock.callCount(), 7);
  assert.deepEqual(new Set(f.remoteState(posted)), new Set([...history, 'local receipt', ...Array.from({ length: 7 }, (_, index) => `remote-${index + 1}`)]));
  assert.deepEqual(f.remoteState(deliveries), { local: localSent, remote: remoteSent, competing: reservation, ambiguous: reservation });
  assert.deepEqual(f.remoteState(last), { postedAt: remoteSent.sentAt });
  assert.deepEqual(f.remoteState(mirrors), { local: mirror, remote: { ...mirror, sourceMessageId: 654 } });
  for (const name of [posted, deliveries, last, mirrors]) assert.deepEqual(f.read(f.local, name), f.remoteState(name));
  assert.equal(git(f.remote, 'show', 'refs/heads/main:events.json'), 'catalog-7');
  assert.equal(git(f.local, 'rev-parse', 'HEAD'), head);
  assert.deepEqual(fs.readFileSync(path.join(f.local, '.git', 'index')), index);
  assert.equal(fs.readFileSync(path.join(f.local, 'events.json'), 'utf8'), 'unstaged catalog');
  assert.equal(fs.readFileSync(path.join(f.local, 'scratch.txt'), 'utf8'), 'untracked evidence');
  const saved = git(f.remote, 'rev-parse', 'refs/heads/main');
  persistEventState({ cwd: f.local });
  assert.equal(git(f.remote, 'rev-parse', 'refs/heads/main'), saved);
});

for (const status of ['reserved', 'sent'] as const) {
  test(`a competing ${status} receipt on the seventh race blocks the losing runner before sending`, async t => {
    const f = repository(t);
    const winner: EventDelivery = status === 'reserved' ? reservation
      : { ...reservation, status, messageId: 654, sentAt: '2026-09-28T11:01:00Z' };
    let validations = 0;
    let sends = 0;
    await assert.rejects(deliverEventsOnce({ cwd: f.local, events: [event], chatId: '@hashtagweb3', threadId: 1454,
      persist: options => persistEventState({ ...options, validateRemote: state => {
        validations++;
        options?.validateRemote?.(state);
        fs.writeFileSync(path.join(f.other, 'events.json'), `catalog-${validations}`);
        if (validations === 7) f.write(f.other, deliveries, { winner });
        f.publishOther();
      } }),
      send: async () => { sends++; return { ok: true, result: { message_id: 999 } }; },
    }), status === 'reserved' ? /Unconfirmed/ : /already posted/);
    assert.equal(validations, 8);
    assert.equal(sends, 0);
    assert.equal(f.waits.mock.callCount(), 7);
    assert.deepEqual(f.remoteState(deliveries), { winner });
    assert.deepEqual(f.read(f.local, deliveries), {});
    persistEventState({ cwd: f.local, syncOnly: true });
    assert.deepEqual(f.read(f.local, deliveries), { winner });
    await assert.rejects(deliverEventsOnce({ cwd: f.local, events: [event], chatId: '@hashtagweb3', threadId: 1454, force: true,
      send: async () => { assert.fail('A competing reservation or receipt must block resend'); },
    }), status === 'reserved' ? /Unconfirmed/ : /already posted/);
  });
}

test('exhausted post-send pushes retain recoverable receipts and a remote reservation blocks another send', async t => {
  const f = repository(t);
  const hook = path.join(f.remote, 'hooks', 'pre-receive');
  const head = git(f.local, 'rev-parse', 'HEAD');
  const index = fs.readFileSync(path.join(f.local, '.git', 'index'));
  let sends = 0;
  await assert.rejects(deliverEventsOnce({ cwd: f.local, events: [event], chatId: '@hashtagweb3', threadId: 1454, mirrorChannelId: '@eventsweb3',
    send: async () => {
      sends++;
      fs.writeFileSync(hook, '#!/bin/sh\nprintf "%s\\n" "https://bot:fake-password@example.invalid/repo?token=fake-query Authorization: Bearer fake-header" >&2\nexit 1\n', { mode: 0o755 });
      return { ok: true, result: { message_id: 321 } };
    },
  }), (error: Error) => {
    assert.match(error.message, /history push failed after 8 attempts; local receipts retained for recovery/);
    assert.match(error.message, /pre-receive hook declined/);
    assert.doesNotMatch(error.message, /fake-password|fake-query|fake-header|https:\/\//);
    assert.equal('cause' in error, false);
    return true;
  });
  assert.equal(sends, 1);
  assert.equal(f.waits.mock.callCount(), 7);
  assert.doesNotMatch(JSON.stringify(f.warnings.mock.calls), /fake-password|fake-query|fake-header/);
  const [receipt] = Object.values(f.read(f.local, deliveries)) as EventDelivery[];
  assert.equal(receipt.status, 'sent');
  assert.equal(receipt.messageId, 321);
  assert.equal(f.read(f.local, last).postedAt, receipt.sentAt);
  assert.deepEqual(new Set(f.read(f.local, posted)), new Set(['old', ...eventIdentity(event).keys]));
  assert.equal(Object.keys(f.read(f.local, mirrors)).length, 1);
  assert.equal((Object.values(f.remoteState(deliveries)) as EventDelivery[])[0].status, 'reserved');
  assert.equal(git(f.local, 'rev-parse', 'HEAD'), head);
  assert.deepEqual(fs.readFileSync(path.join(f.local, '.git', 'index')), index);
  await assert.rejects(deliverEventsOnce({ cwd: f.other, events: [event], chatId: '@hashtagweb3', threadId: 1454, force: true,
    send: async () => { assert.fail('Remote reservation must block another send after confirmation push failure'); },
  }), /Unconfirmed/);
  fs.unlinkSync(hook);
  persistEventState({ cwd: f.local });
  for (const name of [posted, deliveries, last, mirrors]) assert.deepEqual(f.remoteState(name), f.read(f.local, name));
  assert.equal((Object.values(f.remoteState(deliveries)) as EventDelivery[])[0].messageId, 321);
  assert.equal(sends, 1);
});
