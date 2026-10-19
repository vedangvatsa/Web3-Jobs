import assert from 'node:assert/strict';
import { test } from 'node:test';
import { planSlot, recordSlot } from './publish-slot-plan.mjs';

const today = '2026-09-25';
test('failed news retries do not repeat successful job ingestion', () => {
  const state = recordSlot({}, planSlot({}, 'morning', today), { ingest: 'success', news: 'failure', deploy: 'failure' });
  const retry = planSlot(state, 'afternoon', today);
  assert.equal(retry.morning, false); assert.equal(retry.news, true); assert.equal(retry.skip, false);
  const done = recordSlot(state, retry, { news: 'success' });
  assert.equal(done.morning, today);
});
test('news and deployment remain one daily batch while social has three slots', () => {
  const state = recordSlot({}, planSlot({}, 'morning', today), { ingest: 'success', news: 'success', deploy: 'success', posts: 'success', telegram: 'success' });
  for (const slot of ['morning', 'afternoon', 'evening']) {
    const plan = planSlot(state, slot, today);
    assert.equal(plan.news, false);
    assert.equal(plan.deploy, false);
  }
  assert.equal(planSlot(state, 'afternoon', today).social, true);
  assert.equal(planSlot(state, 'evening', today).social, true);
  assert.equal(planSlot(state, 'morning', '2026-09-26').news, true);
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

test('news recovered after the jobs rollout stays deployment-due until shipped', () => {
  const morning = recordSlot({}, planSlot({}, 'morning', today), { ingest: 'success', news: 'failure', deploy: 'success' });
  const recovery = planSlot(morning, 'afternoon', today);
  assert.equal(recovery.deploy, false);
  assert.equal(recovery.news, true);
  for (const deploy of ['failure', 'cancelled', 'skipped']) {
    const pending = recordSlot(morning, recovery, { news: 'success', newsChanged: 'true', deploy });
    const retry = planSlot(pending, 'evening', today);
    assert.equal(retry.deploy, true);
    assert.equal(retry.morning, false);
    assert.equal(retry.news, false);
    const done = recordSlot(pending, retry, { deploy: 'success' });
    assert.equal(planSlot(done, 'evening', today).deploy, false);
    assert.equal(done.newsDeployPending, undefined);
  }
  const shipped = recordSlot(morning, recovery, { news: 'success', newsChanged: 'true', deploy: 'success' });
  assert.equal(planSlot(shipped, 'evening', today).deploy, false);
  const quiet = recordSlot(morning, recovery, { news: 'success', newsChanged: 'false', deploy: 'skipped' });
  assert.equal(planSlot(quiet, 'evening', today).deploy, false);
});

test('news-only recovery records publication and failed rollout without stamping social slots', () => {
  const state = { ingested: today, deployed: today, slots: { afternoon: today } };
  const next = recordSlot(state, { date: today, slot: 'recovery', morning: false, news: true, deploy: true, social: false }, { news: 'success', newsChanged: 'true', deploy: 'failure' });
  assert.equal(next.news, today);
  assert.equal(planSlot(next, 'evening', today).deploy, true);
  assert.deepEqual(next.slots, state.slots);
});
