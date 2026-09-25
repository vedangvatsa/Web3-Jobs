import assert from 'node:assert/strict';
import { test } from 'node:test';
import { planSlot, recordSlot } from './publish-slot-plan.mjs';

const today = '2026-09-25';
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
  const done = recordSlot(state, retry, { deploy: 'success' });
  assert.equal(planSlot(done, 'morning', today).skip, true);
  assert.equal(planSlot(done, 'afternoon', today).deploy, false);
  assert.equal(planSlot(done, 'afternoon', today).social, true);
});
test('email failures cannot clear a successful deployment or stop other slots', () => {
  const state = recordSlot({}, planSlot({}, 'morning', today), { ingest: 'success', news: 'success', deploy: 'success', posts: 'success', telegram: 'success', alerts: 'failure' });
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
  const state = recordSlot({}, planSlot({}, 'morning', today), { ingest: 'success', news: 'success', deploy: 'success', posts: 'success', telegram: 'success' });
  const nextDay = planSlot(state, 'morning', '2026-09-26');
  assert.deepEqual([nextDay.morning, nextDay.deploy, nextDay.social], [true, true, true]);
  assert.equal(state.deployed, today);
});
