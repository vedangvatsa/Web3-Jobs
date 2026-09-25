import assert from 'node:assert/strict';
import { test } from 'node:test';
import { linkedInTargets, hasLinkedInReceipt, publishLinkedInTargets, type LinkedInReceipt } from './linkedin-targets';

const targets = linkedInTargets({});
const slug = 'engineer';
test('default LinkedIn targets include #Web3 and CVin.Bio exactly once', () => {
  assert.deepEqual(targets.map((target) => target.name), ['hashtagweb3', 'cvinbio']);
  assert.throws(() => linkedInTargets({ BUFFER_LINKEDIN_CHANNEL_ID: 'same', BUFFER_CVINBIO_CHANNEL_ID: 'same' }), /different/);
});
test('legacy #Web3 receipt does not mark CVin.Bio as posted', () => {
  const history: LinkedInReceipt[] = [{ slug, platform: 'linkedin', postId: 'old-receipt' }];
  assert.equal(hasLinkedInReceipt(history, slug, targets[0]), true);
  assert.equal(hasLinkedInReceipt(history, slug, targets[1]), false);
  assert.equal(hasLinkedInReceipt(history, 'other-job', targets[0]), false);
});
test('each account receives a post and its own receipt; repeat run skips both', async () => {
  const history: LinkedInReceipt[] = [];
  const calls: string[] = [];
  const publish = async (target: typeof targets[number]) => { calls.push(target.name); return `receipt-${target.name}`; };
  const save = (target: typeof targets[number], postId: string) => { history.push({ slug, platform: 'linkedin', postId, account: target.channelId, verification: 'verified' }); };
  await publishLinkedInTargets(history, slug, targets, publish, save);
  assert.deepEqual(calls, ['hashtagweb3', 'cvinbio']);
  const retry = await publishLinkedInTargets(history, slug, targets, publish, save);
  assert.deepEqual(retry.map((result) => result.status), ['skipped', 'skipped']);
  assert.equal(calls.length, 2);
});
test('one account failure does not block the other and retry only submits the missing target', async () => {
  const history: LinkedInReceipt[] = [];
  const save = (target: typeof targets[number], postId: string) => { history.push({ slug, platform: 'linkedin', postId, account: target.channelId }); };
  const first = await publishLinkedInTargets(history, slug, targets, async (target) => {
    if (target.name === 'hashtagweb3') throw new Error('Temporary Buffer error');
    return 'cvinbio-receipt';
  }, save);
  assert.deepEqual(first.map((result) => result.status), ['failed', 'submitted']);
  const calls: string[] = [];
  await publishLinkedInTargets(history, slug, targets, async (target) => { calls.push(target.name); return 'web3-receipt'; }, save);
  assert.deepEqual(calls, ['hashtagweb3']);
});
test('missing or placeholder receipts never mark an account complete', async () => {
  for (const postId of ['', 'unknown', 'published']) {
    const history: LinkedInReceipt[] = [{ slug, platform: 'linkedin', postId, account: targets[0].channelId }];
    assert.equal(hasLinkedInReceipt(history, slug, targets[0]), false);
    const results = await publishLinkedInTargets([], slug, [targets[0]], async () => postId, () => assert.fail('Invalid receipt persisted'));
    assert.equal(results[0].status, 'failed');
  }
});
