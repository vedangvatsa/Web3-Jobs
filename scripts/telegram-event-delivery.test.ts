import assert from 'node:assert/strict';
import { test, type TestContext } from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { Web3Event } from '../src/lib/events';
import { deliverEventsOnce, eventIdentity, selectUnpostedEvents } from './lib/telegram-event-delivery';
import { eventStatePaths, mergeEventState, readEventState, writeEventState, type EventDeliveries, type EventPersistenceOptions } from './social/telegram-event-state';
import type { EventMirrorQueue } from './lib/telegram-event-mirror';
import { postingSlot } from './social/posting-slot.mjs';

const event: Web3Event = { id: 'luma-old', slug: 'crypto-house-seoul', name: 'Crypto House Seoul', startDate: '2026-09-28T05:00:00Z', timezone: 'Asia/Seoul', location: 'Seoul', city: 'Seoul', url: 'https://lu.ma/house?utm_source=calendar', description: '', coverImage: null };
const second: Web3Event = { ...event, id: 'other', slug: 'different-event', name: 'Ethereum workshop', url: 'https://luma.com/workshop' };

function fixture(t: TestContext) {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'event-delivery-'));
  t.after(() => fs.rmSync(cwd, { recursive: true, force: true }));
  const files = eventStatePaths('@hashtagweb3', cwd);
  const remote = new Map<string, unknown>();
  const persist = (options: EventPersistenceOptions = {}) => {
    options.validateRemote?.(remote);
    for (const file of Object.values(files)) if (fs.existsSync(file)) {
      const name = path.basename(file);
      const merged = mergeEventState(name, JSON.parse(fs.readFileSync(file, 'utf8')), remote.get(name));
      remote.set(name, structuredClone(merged));
      writeEventState(file, merged);
    }
  };
  return { cwd, files, remote, persist, options: { cwd, persist, chatId: '@hashtagweb3', threadId: 1454, events: [event] } };
}

test('selection blocks source-ID changes, alias changes, and duplicate calendar entries without recycling old events', () => {
  const keys = eventIdentity(event).keys;
  const changed = { ...event, id: 'token2049-new', slug: 'new-slug', url: 'https://luma.com/HOUSE?ref=other' };
  assert.deepEqual(selectUnpostedEvents([changed], keys), []);
  assert.deepEqual(selectUnpostedEvents([{ ...changed, aliases: [event.id], url: 'https://elsewhere.com/new' }], [event.id]), []);
  assert.deepEqual(selectUnpostedEvents([event, changed, second], []), [event, second]);
  assert.deepEqual(selectUnpostedEvents([event], keys), []);
  const named = { ...changed, url: 'https://elsewhere.com/new' };
  assert.deepEqual(selectUnpostedEvents([named], keys), []);
  assert.equal(selectUnpostedEvents([{ ...named, startDate: '2027-09-28T05:00:00Z' }], keys).length, 1);
});

test('persists a group reservation before sending and saves its receipt and pending mirror immediately', async t => {
  const f = fixture(t);
  await deliverEventsOnce({ ...f.options, mirrorChannelId: '@eventsweb3', send: async () => {
    const ledger = f.remote.get(path.basename(f.files.deliveries)) as EventDeliveries;
    assert.equal(Object.values(ledger)[0].status, 'reserved');
    return { ok: true, result: { message_id: 123 } };
  } });
  assert.equal(Object.values(f.remote.get(path.basename(f.files.deliveries)) as EventDeliveries)[0].status, 'sent');
  assert.equal(Object.values(f.remote.get(path.basename(f.files.mirrors)) as EventMirrorQueue)[0].sourceMessageId, 123);
  assert.ok((f.remote.get(path.basename(f.files.posted)) as string[]).includes(event.id));
  writeEventState(f.files.posted, []);
  writeEventState(f.files.deliveries, {});
  fs.unlinkSync(f.files.last);
  await assert.rejects(deliverEventsOnce({ ...f.options, force: true, send: async () => { assert.fail('Stale runner must not send again'); } }), /already posted/);
});

test('failure to publish the pre-send reservation causes zero Telegram calls', async t => {
  const f = fixture(t);
  await assert.rejects(deliverEventsOnce({ ...f.options, persist: () => { throw new Error('push rejected'); }, send: async () => { assert.fail('No durable reservation'); } }), /push rejected/);
  assert.deepEqual(readEventState(f.files.deliveries, {}), {});
});

test('a transport timeout leaves a durable reservation that force cannot bypass', async t => {
  const f = fixture(t);
  await assert.rejects(deliverEventsOnce({ ...f.options, send: async () => { throw new Error('timeout after Telegram accepted'); } }), /timeout/);
  await assert.rejects(deliverEventsOnce({ ...f.options, events: [second], force: true, send: async () => { assert.fail('Ambiguous delivery must block retries'); } }), /Unconfirmed/);
});

test('a failed post-send push retains local evidence and blocks a fresh runner through the remote reservation', async t => {
  const f = fixture(t);
  let pushes = 0;
  await assert.rejects(deliverEventsOnce({ ...f.options, persist: options => { if (++pushes === 2) throw new Error('confirmation push failed'); f.persist(options); }, send: async () => ({ ok: true, result: { message_id: 321 } }) }), /confirmation push/);
  assert.equal(Object.values(readEventState<EventDeliveries>(f.files.deliveries, {}))[0].messageId, 321);
  writeEventState(f.files.deliveries, {});
  writeEventState(f.files.posted, []);
  fs.unlinkSync(f.files.last);
  await assert.rejects(deliverEventsOnce({ ...f.options, events: [second], force: true, send: async () => { assert.fail('Remote reservation was lost'); } }), /Unconfirmed/);
});

test('explicit Telegram rejection can retry, while a missing receipt cannot', async t => {
  const f = fixture(t);
  await assert.rejects(deliverEventsOnce({ ...f.options, send: async () => ({ ok: false }) }), /rejected/);
  await deliverEventsOnce({ ...f.options, send: async () => ({ ok: true, result: { message_id: 456 } }) });
  assert.equal(Object.values(readEventState<EventDeliveries>(f.files.deliveries, {})).filter(entry => entry.status === 'sent').length, 1);
  const other = fixture(t);
  await assert.rejects(deliverEventsOnce({ ...other.options, send: async () => ({ ok: true, result: { message_id: 0 } }) }), /no valid receipt/);
  assert.equal(Object.values(readEventState<EventDeliveries>(other.files.deliveries, {}))[0].status, 'reserved');
});

test('corrupt history fails closed and a fresh remote cooldown blocks a stale runner', async t => {
  const f = fixture(t);
  fs.writeFileSync(f.files.posted, 'invalid JSON');
  await assert.rejects(deliverEventsOnce({ ...f.options, send: async () => { assert.fail('Corrupt history'); } }), /Cannot read/);
  fs.unlinkSync(f.files.posted);
  f.remote.set(path.basename(f.files.last), { postedAt: new Date().toISOString() });
  await assert.rejects(deliverEventsOnce({ ...f.options, send: async () => { assert.fail('Remote cooldown'); } }), /cooldown/);
});

test('event scheduling blocks late sends and a second digest in the same slot', async t => {
  const f = fixture(t);
  const slot = postingSlot('afternoon', '2026-09-29');
  t.mock.method(Date, 'now', () => slot.start + 1000);
  await deliverEventsOnce({ ...f.options, slot, send: async () => ({ ok: true, result: { message_id: 123 } }) });
  await assert.rejects(deliverEventsOnce({ ...f.options, slot, events: [second], force: true, send: async () => assert.fail('Repeated slot') }), /already completed/);
  t.mock.method(Date, 'now', () => slot.end + 1);
  await assert.rejects(deliverEventsOnce({ ...f.options, slot, events: [second], force: true, send: async () => assert.fail('Late slot') }), /Outside posting window/);
});
