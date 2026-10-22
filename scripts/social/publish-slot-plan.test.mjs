import assert from 'node:assert/strict';
import { test } from 'node:test';
import { planSlot, planRecovery, recordSlot } from './publish-slot-plan.mjs';

const today = '2026-09-25';
test('failed news retries do not repeat successful job ingestion', () => {
  const state = recordSlot({}, planSlot({}, 'morning', today), { ingest: 'success', news: 'failure', deploy: 'failure' });
  const retry = planSlot(state, 'afternoon', today);
  assert.equal(retry.morning, false); assert.equal(retry.news, true); assert.equal(retry.skip, false);
  const done = recordSlot(state, retry, { news: 'success' });
  assert.equal(done.morning, today);
});
test('news and deployment remain one daily batch while social has three slots', () => {
  const state = recordSlot({ deployed: today }, planSlot({}, 'morning', today), { ingest: 'success', news: 'success', posts: 'success', telegram: 'success' });
  for (const slot of ['morning', 'afternoon', 'evening']) {
    const plan = planSlot(state, slot, today);
    assert.equal(plan.news, false);
    assert.equal(plan.deploy, false);
  }
  assert.equal(planSlot(state, 'afternoon', today).social, true);
  assert.equal(planSlot(state, 'evening', today).social, true);
  assert.equal(planSlot(state, 'morning', '2026-09-26').news, true);
});

test('on-time social completion survives news failure while the single rollout remains due', () => {
  const date = '2026-10-22';
  const morning = planSlot({}, 'morning', date, '2026-10-22T03:33:00Z');
  assert.equal(morning.social, true);
  const state = recordSlot({}, morning, { ingest: 'success', news: 'failure', deploy: 'skipped', posts: 'success', telegram: 'success' });
  assert.equal(state.slots.morning, date);
  assert.equal(planSlot(state, 'morning', date, '2026-10-22T04:00:00Z').social, false);
  const late = planSlot(state, 'morning', date, '2026-10-22T05:25:00Z');
  assert.deepEqual([late.morning, late.news, late.deploy, late.social, late.skip], [false, true, true, false, false]);
  const afternoon = planSlot(state, 'afternoon', date, '2026-10-22T11:30:00Z');
  assert.deepEqual([afternoon.morning, afternoon.news, afternoon.deploy, afternoon.social], [false, true, true, true]);
});

test('old false morning stamp still retries deployment', () => {
  const plan = planSlot({ morning: today, afternoon: today }, 'afternoon', today);
  assert.equal(plan.skip, false);
  assert.equal(plan.deploy, true);
  assert.equal(plan.morning, false);
  assert.equal(plan.social, false);
});
test('deployment failure retries without repeating successful ingestion or social posts', () => {
  const first = planSlot({}, 'morning', today);
  const state = recordSlot({}, first, { ingest: 'success', news: 'success', deploy: 'failure', posts: 'success', telegram: 'success', alerts: 'failure' });
  assert.equal(state.deployed, undefined);
  const retry = planSlot(state, 'morning', today);
  assert.deepEqual([retry.morning, retry.social, retry.deploy, retry.skip], [false, false, true, false]);
  const done = recordSlot({ ...state, deployed: today }, retry, { deploy: 'success' });
  assert.equal(planSlot(done, 'morning', today).skip, true);
  assert.equal(planSlot(done, 'afternoon', today).deploy, false);
  assert.equal(planSlot(done, 'afternoon', today).social, true);
});
test('email failures cannot clear a successful deployment or stop other slots', () => {
  const state = recordSlot({ deployed: today }, planSlot({}, 'morning', today), { ingest: 'success', news: 'success', posts: 'success', telegram: 'success', alerts: 'failure' });
  assert.equal(state.deployed, today);
  assert.equal(planSlot(state, 'morning', today).skip, true);
  assert.equal(planSlot(state, 'evening', today).social, true);
});
test('cancelled or skipped deploy does not count as completion; failed social remains due', () => {
  for (const deploy of ['cancelled', 'skipped', 'failure']) {
    const state = recordSlot({}, planSlot({}, 'evening', today), { ingest: 'success', news: 'success', deploy, posts: 'failure', telegram: 'success' });
    const retry = planSlot(state, 'evening', today);
    assert.equal(retry.deploy, true);
    assert.equal(retry.social, true);
  }
});
test('next day resets due work and records the original run date', () => {
  const state = recordSlot({ deployed: today }, planSlot({}, 'morning', today), { ingest: 'success', news: 'success', posts: 'success', telegram: 'success' });
  const nextDay = planSlot(state, 'morning', '2026-09-26');
  assert.deepEqual([nextDay.morning, nextDay.deploy, nextDay.social], [true, true, true]);
  assert.equal(state.deployed, today);
});

test('recovered articles after an already completed daily rollout wait for the next day', () => {
  const morning = { ingested: today, deployed: today, newsDeployPending: true };
  const recovery = planSlot(morning, 'afternoon', today);
  assert.equal(recovery.deploy, false);
  assert.equal(recovery.news, true);
  for (const deploy of ['failure', 'cancelled', 'skipped', 'success']) {
    const pending = recordSlot(morning, recovery, { news: 'success', newsChanged: 'true', deploy });
    const retry = planSlot(pending, 'evening', today);
    assert.equal(retry.deploy, false);
    assert.equal(retry.morning, false);
    assert.equal(retry.news, false);
    assert.equal(pending.newsDeployPending, true);
    const next = planSlot(pending, 'morning', '2026-09-26');
    assert.deepEqual([next.morning, next.news, next.deploy], [true, true, true]);
  }
});

test('explicit recovery respects deployment completion and refreshes missing daily jobs', () => {
  assert.deepEqual(planRecovery({}, today), { morning: true, news: true, deploy: true, social: false, videos: false, slot: 'recovery', skip: false, date: today });
  const state = { ingested: today, deployed: today, slots: { afternoon: today } };
  const plan = planRecovery(state, today);
  assert.equal(plan.morning, false); assert.equal(plan.deploy, false); assert.equal(plan.news, true);
  const next = recordSlot(state, plan, { news: 'success', newsChanged: 'true', deploy: 'failure' });
  assert.equal(next.news, today);
  assert.equal(planSlot(next, 'evening', today).deploy, false);
  assert.deepEqual(next.slots, state.slots);
});

test('parent results never invent, clear or regress durable rollout evidence', () => {
  const plan = planSlot({}, 'morning', today);
  assert.equal(recordSlot({}, plan, { deploy: 'success' }).deployed, undefined);
  const newer = { deployed: '2026-09-26', newsDeployPending: true };
  for (const deploy of ['success', 'failure', 'skipped', 'cancelled']) {
    assert.equal(recordSlot(newer, plan, { deploy }).deployed, '2026-09-26');
  }
});
