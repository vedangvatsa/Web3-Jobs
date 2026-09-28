import assert from 'node:assert/strict';
import { test } from 'node:test';
import { queueEventMirror, deliverEventMirrors, EVENTS_REPLY_MARKUP, type EventMirrorQueue } from './lib/telegram-event-mirror';

test('copies the exact group message to the channel without a forum thread', async () => {
  const queue: EventMirrorQueue = {};
  queueEventMirror(queue, '@hashtagweb3', 123, '@eventsweb3');
  let saves = 0;
  const request: typeof fetch = async (url, init) => {
    assert.equal(String(url), 'https://api.telegram.org/bottest-token/copyMessage');
    assert.deepEqual(JSON.parse(String(init?.body)), {
      chat_id: '@eventsweb3', from_chat_id: '@hashtagweb3', message_id: 123, reply_markup: EVENTS_REPLY_MARKUP,
    });
    return Response.json({ ok: true, result: { message_id: 456 } });
  };
  assert.deepEqual(await deliverEventMirrors(queue, 'test-token', () => saves++, request), []);
  assert.equal(saves, 2);
  queueEventMirror(queue, '@hashtagweb3', 123, '@eventsweb3');
  await deliverEventMirrors(queue, 'test-token', () => saves++, async () => { throw new Error('Duplicate delivery'); });
  assert.equal(saves, 2);
});

test('failed copies remain pending and can retry independently of the group cooldown', async () => {
  const queue: EventMirrorQueue = {};
  queueEventMirror(queue, '@hashtagweb3', 123, '@eventsweb3');
  const errors = await deliverEventMirrors(queue, 'test-token', () => {}, async () => Response.json({ ok: false, description: 'bot is not an administrator' }, { status: 403 }));
  assert.equal(errors.length, 1);
  assert.equal(Object.values(queue)[0].deliveredMessageId, undefined);
  assert.equal(Object.values(queue)[0].status, 'rejected');
  const persisted = JSON.parse(JSON.stringify(queue));
  assert.deepEqual(await deliverEventMirrors(persisted, 'test-token', () => {}, async () => Response.json({ ok: true, result: { message_id: 789 } })), []);
  assert.equal(Object.values(persisted as EventMirrorQueue)[0].deliveredMessageId, 789);
});

test('invalid receipts and ambiguous transport errors block automatic copies', async () => {
  for (const id of [undefined, 0, -1]) {
    const queue: EventMirrorQueue = {};
    queueEventMirror(queue, '@hashtagweb3', 123, '@eventsweb3');
    const failures = await deliverEventMirrors(queue, 'test-token', () => {}, async () => Response.json({ ok: true, result: { message_id: id } }));
    assert.equal(failures.length, 1);
    assert.equal(Object.values(queue)[0].status, 'reserved');
    await deliverEventMirrors(queue, 'test-token', () => {}, async () => { assert.fail('Ambiguous copies must not retry'); });
  }
  const queue: EventMirrorQueue = {};
  queueEventMirror(queue, '@hashtagweb3', 123, '@eventsweb3');
  const failures = await deliverEventMirrors(queue, 'test-token', () => {}, async () => { throw new Error('Request failed: bottest-token/copyMessage'); });
  assert.ok(!failures[0].includes('test-token'));
  assert.throws(() => queueEventMirror(queue, '@hashtagweb3', 0, '@eventsweb3'));
  assert.throws(() => queueEventMirror(queue, '@hashtagweb3', 1, '@hashtagweb3'));
});

test('a failed pre-send mirror reservation prevents the Telegram request', async () => {
  const queue: EventMirrorQueue = {};
  queueEventMirror(queue, '@hashtagweb3', 123, '@eventsweb3');
  const failures = await deliverEventMirrors(queue, 'test-token', () => { throw new Error('History push failed'); }, async () => { assert.fail('No durable reservation'); });
  assert.equal(failures.length, 1);
  assert.equal(Object.values(queue)[0].status, 'pending');
});

test('a successful copy is not resent when saving its confirmation fails', async () => {
  const queue: EventMirrorQueue = {};
  queueEventMirror(queue, '@hashtagweb3', 123, '@eventsweb3');
  let calls = 0;
  await deliverEventMirrors(queue, 'test-token', claim => { if (!claim) throw new Error('Confirmation push failed'); }, async () => { calls++; return Response.json({ ok: true, result: { message_id: 789 } }); });
  assert.equal(Object.values(queue)[0].deliveredMessageId, 789);
  await deliverEventMirrors(queue, 'test-token', () => {}, async () => { calls++; throw new Error('Duplicate'); });
  assert.equal(calls, 1);
});
