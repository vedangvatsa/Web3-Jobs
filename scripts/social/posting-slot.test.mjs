import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { assertPostingWindow, assertUnsentSlot, hasSentSlot, isPostingWindow, postingSlot, postingSlotFromEnv } from './posting-slot.mjs';
import { planSlot } from './publish-slot-plan.mjs';
import { prepareTelegramSlot } from './prepare-telegram-slot.mjs';

test('three daily windows use UTC, including the next-day IST evening slot', () => {
  for (const [name, utc, ist] of [['morning', '03:30', '09:00'], ['afternoon', '11:30', '17:00'], ['evening', '19:30', '01:00']]) {
    const slot = postingSlot(name, '2026-09-29');
    assert.equal(new Date(slot.start).toISOString(), `2026-09-29T${utc}:00.000Z`);
    assert.equal(new Date(slot.start).toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }), ist);
    assert.equal(isPostingWindow(slot, slot.start - 1), false);
    assert.equal(isPostingWindow(slot, slot.start), true);
    assert.equal(isPostingWindow(slot, slot.end - 1), true);
    assert.equal(isPostingWindow(slot, slot.end), false);
  }
  assert.equal(postingSlotFromEnv({}), null);
  assert.throws(() => postingSlotFromEnv({ TELEGRAM_PUBLISH_SLOT: 'morning' }), /Invalid/);
  assert.throws(() => postingSlot('morning', '2026-02-30'), /Invalid/);
});

test('observed late backup runs cannot trigger social posts or reset slot completion', () => {
  const state = { morning: '2026-09-29', deployed: '2026-09-29' };
  const late = planSlot(state, 'morning', '2026-09-29', '2026-09-29T09:59:24Z');
  assert.equal(late.social, false);
  assert.equal(late.skip, true);
  assert.equal(planSlot(state, 'afternoon', '2026-09-29', '2026-09-29T11:30:08Z').social, true);
  assert.equal(planSlot(state, 'afternoon', '2026-09-29', '2026-09-29T18:40:09Z').social, false);
  assert.equal(planSlot(state, 'evening', '2026-09-29', '2026-09-29T23:52:07Z').social, false);
});

test('slot receipts and legacy on-time receipts prevent repeats independently per destination', () => {
  const slot = postingSlot('morning', '2026-09-29');
  const ledger = { sent: { status: 'sent', slotKey: slot.key, chatId: '@first' } };
  assert.equal(hasSentSlot(ledger, slot, '@first'), true);
  assert.equal(hasSentSlot(ledger, slot, '@second'), false);
  assert.throws(() => assertUnsentSlot(ledger, slot, '@first', slot.start + 5000), /already completed/);
  assert.throws(() => assertPostingWindow(slot, slot.end + 1), /Outside posting window/);
  assert.equal(hasSentSlot({ old: { status: 'sent', sentAt: '2026-09-29T04:15:14Z' } }, slot), true);
  assert.equal(hasSentSlot({ old: { status: 'sent', sentAt: '2026-09-29T00:01:25Z' } }, slot), false);
});

test('posting uses only a validated live catalog and preserves the snapshot on fetch failure', async t => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'telegram-catalog-'));
  t.after(() => fs.rmSync(cwd, { recursive: true, force: true }));
  fs.mkdirSync(path.join(cwd, 'content'));
  const file = path.join(cwd, 'content', 'events-runtime.json');
  fs.writeFileSync(file, '["previous"]');
  await assert.rejects(prepareTelegramSlot('events', { cwd, slot: null, request: async () => Response.json({}, { status: 429 }) }), /HTTP 429/);
  assert.equal(fs.readFileSync(file, 'utf8'), '["previous"]');
  const events = [{ id: 'verified', slug: 'verified', name: 'Verified event' }];
  await prepareTelegramSlot('events', { cwd, slot: null, request: async url => { assert.match(String(url), /^https:\/\/hashtagweb3.com\/data\//); return Response.json(events); } });
  assert.deepEqual(JSON.parse(fs.readFileSync(file, 'utf8')), events);
});

test('workflow isolates Telegram publishers from event fetching and backs up each matrix leg', () => {
  const require = createRequire(import.meta.url);
  const yaml = createRequire(require.resolve('gray-matter'))('js-yaml');
  const workflow = yaml.safeLoad(fs.readFileSync('.github/workflows/refresh-jobs-cache.yml', 'utf8'));
  const telegram = workflow.jobs['refresh-and-post'];
  assert.deepEqual(telegram.strategy.matrix.kind, ['jobs', 'events', 'news', 'group-news', 'ai-news']);
  assert.equal(telegram.strategy['fail-fast'], false);
  assert.ok(!telegram.needs.includes('refresh-events'));
  assert.ok(telegram.env.TELEGRAM_PUBLISH_DATE && telegram.env.TELEGRAM_PUBLISH_SLOT);
  assert.ok(telegram.steps.every(step => !/fetch-web3-events|sync-token2049-events/.test(step.run || '')));
  assert.ok(telegram.steps.find(step => step.name === 'Preserve Telegram receipts').with['include-hidden-files']);
  assert.match(telegram.steps.find(step => step.name === 'Persist Telegram history independently').if, /always\(\)/);
  const refresh = workflow.jobs['refresh-events'].steps;
  assert.ok(refresh.findIndex(step => step.id === 'token2049') < refresh.findIndex(step => /fetch-web3-events/.test(step.run || '')));
});
