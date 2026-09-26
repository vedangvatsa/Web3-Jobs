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
  assert.equal(saves, 1);
  queueEventMirror(queue, '@hashtagweb3', 123, '@eventsweb3');
  await deliverEventMirrors(queue, 'test-token', () => saves++, async () => { throw new Error('Duplicate delivery'); });
  assert.equal(saves, 1);
});

test('failed copies remain pending and can retry independently of the group cooldown', async () => {
  const queue: EventMirrorQueue = {};
  queueEventMirror(queue, '@hashtagweb3', 123, '@eventsweb3');
  const errors = await deliverEventMirrors(queue, 'test-token', () => assert.fail('Failure must not be saved as success'), async () => Response.json({ ok: false, description: 'bot is not an administrator' }, { status: 403 }));
  assert.equal(errors.length, 1);
  assert.equal(Object.values(queue)[0].deliveredMessageId, undefined);
  const persisted = JSON.parse(JSON.stringify(queue));
  assert.deepEqual(await deliverEventMirrors(persisted, 'test-token', () => {}, async () => Response.json({ ok: true, result: { message_id: 789 } })), []);
  assert.equal(Object.values(persisted as EventMirrorQueue)[0].deliveredMessageId, 789);
});

test('invalid receipts and transport errors do not mark deliveries complete or expose tokens', async () => {
  const queue: EventMirrorQueue = {};
  queueEventMirror(queue, '@hashtagweb3', 123, '@eventsweb3');
  for (const id of [undefined, 0, -1]) {
    const failures = await deliverEventMirrors(queue, 'test-token', () => assert.fail(), async () => Response.json({ ok: true, result: { message_id: id } }));
    assert.equal(failures.length, 1);
  }
  const failures = await deliverEventMirrors(queue, 'test-token', () => assert.fail(), async () => { throw new Error('Request failed: bottest-token/copyMessage'); });
  assert.ok(!failures[0].includes('test-token'));
  assert.throws(() => queueEventMirror(queue, '@hashtagweb3', 0, '@eventsweb3'));
  assert.throws(() => queueEventMirror(queue, '@hashtagweb3', 1, '@hashtagweb3'));
});
