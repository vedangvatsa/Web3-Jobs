import assert from 'node:assert/strict';
import { test } from 'node:test';
import { BufferXClient, BUFFER_X_CHANNEL_ID } from './buffer-x';

const text = 'Example is hiring Engineer\n\nhttps://hashtagweb3.com/engineer/x?og=v7';
const channel = { id: BUFFER_X_CHANNEL_ID, name: 'hashtag_web3', service: 'twitter' };
const sent = { id: 'buffer-post-1', text, channelId: BUFFER_X_CHANNEL_ID, channelService: 'twitter', status: 'sent', externalLink: 'https://x.com/hashtag_web3/status/123456789' };
function clientFor(responses: Array<unknown | Error>, httpStatus = 200) {
  const calls: Array<{ query: string; variables: Record<string, unknown> }> = [];
  const request: typeof fetch = async (url, init) => {
    assert.equal(url, 'https://api.buffer.com/graphql');
    calls.push(JSON.parse(String(init?.body)));
    const response = responses.shift();
    if (response instanceof Error) throw response;
    assert.notEqual(response, undefined, 'Unexpected API call');
    return new Response(JSON.stringify(response), { status: httpStatus });
  };
  return { client: new BufferXClient('test-token', BUFFER_X_CHANNEL_ID, request, async () => {}), calls };
}

test('submits a text/link post to verified X channel through Buffer', async () => {
  const { client, calls } = clientFor([{ data: { channel } }, { data: { createPost: { post: { id: sent.id } } } }]);
  assert.equal(await client.create(text), sent.id);
  assert.deepEqual(calls[1].variables.input, { channelId: BUFFER_X_CHANNEL_ID, text, schedulingType: 'automatic', mode: 'shareNow' });
});
test('rejects another account or service before creating a post', async () => {
  for (const wrong of [{ ...channel, name: 'other_account' }, { ...channel, service: 'linkedin' }, null]) {
    const { client, calls } = clientFor([{ data: { channel: wrong } }]);
    await assert.rejects(client.create(text), /does not match/);
    assert.equal(calls.length, 1);
  }
});
test('waits for sent status and returns the actual X permalink', async () => {
  const { client } = clientFor([{ data: { post: { ...sent, status: 'sending', externalLink: null } } }, { data: { post: sent } }]);
  assert.equal(await client.verify(sent.id, text), sent.externalLink);
});
test('an accepted but unsent post stays pending; retry verifies without resubmission', async () => {
  const { client, calls } = clientFor([{ data: { post: { ...sent, status: 'scheduled', externalLink: null } } }, { data: { post: sent } }]);
  await assert.rejects(client.verify(sent.id, text, 1), /keeping its receipt pending/);
  assert.equal(await client.verify(sent.id, text, 1), sent.externalLink);
  assert.ok(calls.every((call) => call.query.startsWith('query XReceipt')));
});
test('rejects failed, mismatched, or wrong-account receipts', async () => {
  for (const post of [
    { ...sent, status: 'error', error: { message: 'Reconnect channel' } },
    { ...sent, text: 'Wrong text' },
    { ...sent, channelId: 'other-channel' },
    { ...sent, externalLink: 'https://x.com/other/status/123456789' },
  ]) {
    const { client } = clientFor([{ data: { post } }]);
    await assert.rejects(client.verify(sent.id, text, 1));
  }
});
test('surfaces HTTP, GraphQL, mutation errors and missing receipts', async () => {
  await assert.rejects(clientFor([{}], 401).client.verifyChannel(), /HTTP 401/);
  await assert.rejects(clientFor([{ errors: [{ message: 'Permission denied' }] }]).client.verifyChannel(), /Permission denied/);
  for (const createPost of [{ message: 'Queue limit' }, { post: { id: '' } }]) {
    const { client } = clientFor([{ data: { channel } }, { data: { createPost } }]);
    await assert.rejects(client.create(text), /creation failed/);
  }
});
