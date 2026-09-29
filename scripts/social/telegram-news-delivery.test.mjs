import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { deliverNewsOnce, uniqueNewsStories } from './telegram-news-delivery.mjs';
import { postingSlot } from './posting-slot.mjs';

const story = {
  link: 'https://example.com/peirce-departure',
  headline: 'SEC Commissioner Hester Peirce to leave post on Oct. 2',
  originalTitle: 'Securities and Exchange Commission Commissioner Hester Peirce to depart',
  summary: 'The long-serving commissioner will leave the agency next week.',
};

function fixture(t) {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'news-delivery-test-'));
  t.after(() => fs.rmSync(cwd, { recursive: true, force: true }));
  const postedFile = path.join(cwd, '.telegram-news-posted-test.json');
  const lastFile = path.join(cwd, '.telegram-news-last-test.json');
  const ledgerFile = path.join(cwd, '.telegram-news-deliveries-test.json');
  return { cwd, postedFile, lastFile, ledgerFile, stories: [story] };
}

test('persists a reservation before sending and a message receipt afterwards', async t => {
  const options = fixture(t);
  const calls = [];
  await deliverNewsOnce({
    ...options,
    persist: ({ validateRemote }) => {
      validateRemote?.(new Map());
      calls.push(Object.values(JSON.parse(fs.readFileSync(options.ledgerFile)))[0].status);
    },
    send: async () => {
      assert.deepEqual(calls, ['reserved']);
      calls.push('send');
      return { ok: true, result: { message_id: 65703 } };
    },
  });
  assert.deepEqual(calls, ['reserved', 'send', 'sent']);
  assert.equal(Object.values(JSON.parse(fs.readFileSync(options.ledgerFile)))[0].messageId, 65703);
  assert.ok(JSON.parse(fs.readFileSync(options.lastFile)).postedAt);
});

test('never sends if reservation persistence fails', async t => {
  const options = fixture(t);
  await assert.rejects(deliverNewsOnce({
    ...options, persist: () => { throw new Error('push rejected'); },
    send: () => assert.fail('must not send'),
  }), /push rejected/);
  assert.deepEqual(JSON.parse(fs.readFileSync(options.ledgerFile)), {});
  assert.deepEqual(JSON.parse(fs.readFileSync(options.postedFile)), []);
});

test('uncertain delivery blocks automatic retries, including a different next digest', async t => {
  const options = fixture(t);
  await assert.rejects(deliverNewsOnce({
    ...options, persist: () => {}, send: async () => { throw new Error('connection lost after acceptance'); },
  }), /connection lost/);
  const receipt = Object.values(JSON.parse(fs.readFileSync(options.ledgerFile)))[0];
  assert.equal(receipt.status, 'reserved');
  for (const stories of [[story], [{ ...story, link: 'https://example.com/other', headline: 'Unrelated news' }]]) {
    await assert.rejects(deliverNewsOnce({
      ...options, stories, persist: () => assert.fail('must not persist'), send: () => assert.fail('must not resend'),
    }), /requires review/);
  }
});

test('checks fresh remote history before claiming and rejects a concurrent duplicate', async t => {
  const options = fixture(t);
  await assert.rejects(deliverNewsOnce({
    ...options,
    persist: ({ validateRemote }) => validateRemote(new Map([[path.basename(options.postedFile), [story.link]]])),
    send: () => assert.fail('must not send'),
  }), /already posted or reserved/);
});

test('missing Telegram receipt stays reserved and a failed confirmation keeps the local receipt', async t => {
  const options = fixture(t);
  await assert.rejects(deliverNewsOnce({
    ...options, persist: () => {}, send: async () => ({ ok: true, result: {} }),
  }), /no valid receipt/);
  assert.equal(Object.values(JSON.parse(fs.readFileSync(options.ledgerFile)))[0].status, 'reserved');
  const other = fixture(t);
  let writes = 0;
  await assert.rejects(deliverNewsOnce({
    ...other, persist: () => { if (++writes === 2) throw new Error('confirmation push failed'); },
    send: async () => ({ ok: true, result: { message_id: 123 } }),
  }), /confirmation push failed/);
  assert.equal(Object.values(JSON.parse(fs.readFileSync(other.ledgerFile)))[0].messageId, 123);
});

test('corrupt history fails closed', async t => {
  const options = fixture(t);
  fs.writeFileSync(options.postedFile, '{broken');
  await assert.rejects(deliverNewsOnce({
    ...options, persist: () => assert.fail('must not persist'), send: () => assert.fail('must not send'),
  }), /Cannot read Telegram news history/);
});

test('final digest removes cross-source native/RSS duplicates and malformed selections', () => {
  const unrelated = { link: 'https://example.com/privacy', headline: 'Hester Peirce proposes privacy safeguards', summary: 'A distinct development.' };
  assert.deepEqual(uniqueNewsStories([
    story,
    { ...story, link: 'https://another.com/peirce', headline: 'US Securities and Exchange Commission commissioner Hester Peirce to resign' },
    { headline: 'Missing link' },
    unrelated,
  ]), [story, unrelated]);
});

test('explicit Telegram rejection does not consume the stories or block a safe retry', async t => {
  const options = fixture(t);
  await assert.rejects(deliverNewsOnce({ ...options, persist: () => {}, send: async () => ({ ok: false }) }), /rejected/);
  assert.deepEqual(JSON.parse(fs.readFileSync(options.postedFile)), []);
  assert.equal(Object.values(JSON.parse(fs.readFileSync(options.ledgerFile)))[0].status, 'rejected');
  await deliverNewsOnce({ ...options, persist: () => {}, send: async () => ({ ok: true, result: { message_id: 789 } }) });
  assert.ok(JSON.parse(fs.readFileSync(options.postedFile)).includes(story.link));
});

test('a completed scheduled slot cannot post a second digest even with different stories', async t => {
  const options = fixture(t);
  const slot = postingSlot('morning', '2026-09-29');
  t.mock.method(Date, 'now', () => slot.start + 10000);
  await deliverNewsOnce({ ...options, slot, persist: () => {}, send: async () => ({ ok: true, result: { message_id: 456 } }) });
  const remoteLedger = JSON.parse(fs.readFileSync(options.ledgerFile));
  const stories = [{ link: 'https://example.com/unrelated', headline: 'New quantum computing research', summary: 'A distinct research result.' }];
  await assert.rejects(deliverNewsOnce({ ...options, slot, stories, persist: () => assert.fail(), send: async () => assert.fail() }), /already completed/);
  fs.writeFileSync(options.ledgerFile, '{}');
  await assert.rejects(deliverNewsOnce({ ...options, slot, stories, persist: ({ validateRemote }) => validateRemote(new Map([[path.basename(options.ledgerFile), remoteLedger]])), send: async () => assert.fail() }), /already completed/);
});

test('a late cron run cannot create a reservation or send news', async t => {
  const options = fixture(t);
  const slot = postingSlot('morning', '2026-09-29');
  t.mock.method(Date, 'now', () => Date.parse('2026-09-29T09:59:24Z'));
  await assert.rejects(deliverNewsOnce({ ...options, slot, persist: () => assert.fail(), send: async () => assert.fail() }), /Outside posting window/);
  assert.equal(fs.existsSync(options.ledgerFile), false);
});
