import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { assertKnowledgeWindow } from './newknowledge-content.mjs';
import { verifyXReceipt, verifyThreadsReceipt } from './newknowledge-providers.mjs';
import { sleep } from './newknowledge-state.mjs';

export async function runKnowledgePlatform({
  spec, store, client, verifyImage, mode = 'publish', initialState,
  clock = Date.now, wait = sleep, journal = async () => {}, recovery,
}) {
  assert.ok(['preflight', 'publish', 'reconcile'].includes(mode));
  let state = initialState === undefined ? await store.load() : initialState;
  const stamp = () => new Date(clock()).toISOString();
  const guard = () => {
    assert.equal(mode, 'publish', 'Read-only provider operation');
    assertKnowledgeWindow(spec.date, clock());
  };
  const save = async () => { state = await store.save(state); };
  if (state) assert.deepEqual(state.spec, spec, 'Claimed content, account or image pin changed');
  if (state?.status === 'verified' && mode === 'publish') return { status: 'already-sent', state };
  if (mode === 'publish') guard();
  const account = await client.account();
  if (state) assert.equal(state.accountId, account.id, 'Receipt belongs to another provider account');
  if (!state) {
    const history = await client.history(account);
    assert.ok(!history.some(post => post.text === spec.posts[0].text), 'Matching root exists; manual reconciliation required');
    if (mode !== 'publish') return { status: 'ready', spec };
    guard();
    state = { version: 1, spec, accountId: account.id, claimId: randomUUID(), startedAt: stamp(), status: 'claimed', steps: {} };
    await save();
    if (spec.platform === 'x') {
      guard();
      const id = await client.create(spec.posts, spec.assets);
      assert.ok(id, 'X create has no ID; manual reconciliation required');
      state.postId = id;
      state.status = 'accepted';
      await save();
    }
  }

  if (spec.platform === 'x') {
    if (recovery?.postId) {
      assert.equal(mode, 'reconcile');
      assert.ok(!state.postId || state.postId === recovery.postId, 'Recovery cannot replace a known X ID');
      const post = await client.post(recovery.postId);
      await verifyXReceipt(post, spec, verifyImage);
      assert.equal(post.id, recovery.postId);
      state.postId = recovery.postId;
      state.status = 'accepted';
      await save();
    }
    assert.ok(state.postId, 'Ambiguous earlier X creation; reconcile manually without resending');
    const attempts = mode === 'publish' ? 36 : 1;
    for (let attempt = 0; attempt < attempts; attempt++) {
      const post = await client.post(state.postId);
      assert.equal(post.id, state.postId);
      await journal(post, 'x-provider-receipt');
      await verifyXReceipt(post, spec, verifyImage);
      assert.notEqual(post.status, 'error', 'X provider failed; keep the ID and reconcile manually');
      if (post.status === 'sent') {
        if (mode !== 'preflight') {
          state.status = 'verified';
          state.permalink = post.externalLink;
          state.verifiedAt ||= stamp();
          await save();
        }
        return { status: 'verified', state };
      }
      if (attempt + 1 < attempts) await wait(5000);
    }
    throw new Error('X post ID saved but not sent; reconcile without creating another thread');
  }

  if (recovery?.postId) assert.ok(state.steps[recovery.index - 1], 'Recovery requires the requested post to have an existing claim');
  for (let index = 0; index < 6; index++) {
    const expected = spec.posts[index];
    const previousId = index ? state.steps[index - 1]?.postId : undefined;
    if (index) assert.ok(previousId && state.steps[index - 1].status === 'verified', 'Previous Threads reply must be verified');
    let step = state.steps[index];
    if (recovery?.postId && recovery.index === index + 1) {
      assert.equal(mode, 'reconcile');
      assert.ok(step && (!step.postId || step.postId === recovery.postId), 'Recovery requires an existing claim and cannot replace an ID');
      const post = await client.post(recovery.postId);
      await verifyThreadsReceipt(post, recovery.postId, expected, spec.assets[index], previousId, verifyImage);
      step.postId = recovery.postId;
      step.status = 'accepted';
      await save();
      step = state.steps[index];
    }
    if (!step) {
      if (mode !== 'publish') return { status: 'incomplete', nextPost: index + 1, state };
      guard();
      state.steps[index] = { createClaim: randomUUID(), startedAt: stamp(), status: 'claimed', ...(previousId ? { replyTo: previousId } : {}) };
      await save();
      guard();
      const id = await client.createContainer(expected, spec.assets[index], previousId);
      assert.ok(id, 'Threads container ID missing; manual reconciliation required');
      state.steps[index].containerId = id;
      state.steps[index].status = 'container-created';
      await save();
      step = state.steps[index];
    }
    if (!step.postId) {
      assert.ok(step.containerId, 'Ambiguous earlier Threads creation; reconcile manually without recreating');
      assert.ok(!step.publishClaim, 'Ambiguous earlier Threads publish; reconcile manually without republishing');
      let ready = false;
      const attempts = mode === 'publish' ? 24 : 1;
      for (let attempt = 0; attempt < attempts; attempt++) {
        const container = await client.container(step.containerId);
        await journal({ index: index + 1, containerId: step.containerId, ...container }, 'threads-container');
        if (container.status === 'FINISHED') { ready = true; break; }
        assert.ok(['IN_PROGRESS'].includes(container.status), `Threads container ${container.status}; manual reconciliation required`);
        if (attempt + 1 < attempts) await wait(5000);
      }
      if (mode !== 'publish') return { status: ready ? 'container-ready' : 'container-pending', nextPost: index + 1, state };
      assert.ok(ready, 'Threads container not ready; saved container may resume inside its date window');
      guard();
      state.steps[index].publishClaim = randomUUID();
      state.steps[index].status = 'publishing';
      await save();
      guard();
      const id = await client.publishContainer(step.containerId);
      assert.ok(id, 'Threads publish ID missing; manual reconciliation required');
      state.steps[index].postId = id;
      state.steps[index].status = 'accepted';
      await save();
      step = state.steps[index];
    }
    const post = await client.post(step.postId);
    await journal(post, `threads-post-${index + 1}`);
    await verifyThreadsReceipt(post, step.postId, expected, spec.assets[index], previousId, verifyImage);
    state.steps[index].status = 'verified';
    state.steps[index].permalink = post.permalink;
    state.steps[index].verifiedAt ||= stamp();
    if (mode !== 'preflight') await save();
  }
  state.status = 'verified';
  state.permalink = state.steps[0].permalink;
  state.verifiedAt ||= stamp();
  if (mode !== 'preflight') await save();
  return { status: 'verified', state };
}
