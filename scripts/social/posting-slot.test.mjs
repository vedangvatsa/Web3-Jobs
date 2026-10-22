import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { assertPostingWindow, assertUnsentSlot, hasSentSlot, isPostingWindow, postingSlot, postingSlotFromEnv } from './posting-slot.mjs';
import { planSlot } from './publish-slot-plan.mjs';
import { prepareTelegramSlot } from './prepare-telegram-slot.mjs';

const require = createRequire(import.meta.url);
const yaml = createRequire(require.resolve('gray-matter'))('js-yaml');
const workflow = yaml.safeLoad(fs.readFileSync('.github/workflows/refresh-jobs-cache.yml', 'utf8'));

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

test('Oct 22 publishers can start in the morning window before the delayed news and rollout finish', () => {
  const date = '2026-10-22';
  const slot = postingSlot('morning', date);
  const finishedAt = Object.fromEntries(Object.entries({
    gate: '03:33', ingest: '03:45', 'publish-news': '05:05', deploy: '05:25',
  }).map(([job, time]) => [job, Date.parse(`${date}T${time}:00Z`)]));
  assert.equal(planSlot({}, 'morning', date, finishedAt.gate).social, true);
  assert.throws(() => assertPostingWindow(slot, finishedAt.deploy), /Outside posting window/);
  for (const name of ['refresh-and-post', 'post-openings']) {
    const job = workflow.jobs[name];
    const readyAt = Math.max(...job.needs.map(dependency => finishedAt[dependency]));
    assert.equal(readyAt, finishedAt.gate, `${name} must not wait for daily publication`);
    assert.doesNotThrow(() => assertPostingWindow(slot, readyAt));
    assert.match(job.if, /needs\.gate\.result == 'success'/);
    assert.match(job.if, /needs\.gate\.outputs\.skip != 'true'/);
    assert.match(job.if, /needs\.gate\.outputs\.social == 'true'/);
    assert.doesNotMatch(job.if, /needs\.(?:ingest|deploy|publish-news)\.|always\(\)/);
  }
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

test('independent Telegram jobs use only live source dates within 30 days, never the unpublished checkout', async t => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'telegram-jobs-catalog-'));
  t.after(() => fs.rmSync(cwd, { recursive: true, force: true }));
  fs.mkdirSync(path.join(cwd, 'content'));
  const file = path.join(cwd, 'content', 'jobs-runtime.json');
  const slot = postingSlot('morning', '2026-10-22');
  const now = slot.start + 3 * 60000;
  t.mock.method(Date, 'now', () => now);
  const job = (slug, fields = {}) => ({ id: slug, slug, title: 'Engineer', company: 'Example', link: `https://careers.example.com/${slug}`, date: new Date(now - 86400000).toISOString(), dateVerified: true, ...fields });
  fs.writeFileSync(file, JSON.stringify([job('unpublished')]));
  const cutoff = now - 30 * 86400000;
  const eligible = [job('published'), job('exactly-30-days', { date: new Date(cutoff).toISOString() })];
  const excluded = [
    job('expired', { date: new Date(cutoff - 1).toISOString(), updatedAt: new Date(now).toISOString() }),
    job('unknown', { date: null }), job('unverified', { dateVerified: false }),
    job('future', { date: new Date(now + 1).toISOString() }), job('inactive', { active: false }),
  ];
  await prepareTelegramSlot('jobs', { cwd, slot, request: async url => {
    assert.equal(url, 'https://hashtagweb3.com/data/jobs-runtime.json');
    return Response.json([...eligible, ...excluded]);
  } });
  assert.deepEqual(JSON.parse(fs.readFileSync(file, 'utf8')), eligible);
  await prepareTelegramSlot('jobs', { cwd, slot, request: async () => Response.json(excluded) });
  assert.deepEqual(JSON.parse(fs.readFileSync(file, 'utf8')), []);
});

test('queued Telegram publishers reject expired slots before fetching catalogs or changing snapshots', async t => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'telegram-expired-slot-'));
  t.after(() => fs.rmSync(cwd, { recursive: true, force: true }));
  fs.mkdirSync(path.join(cwd, 'content'));
  const file = path.join(cwd, 'content', 'jobs-runtime.json');
  fs.writeFileSync(file, '["previous"]');
  const slot = postingSlot('morning', '2026-10-22');
  t.mock.method(Date, 'now', () => Date.parse('2026-10-22T05:25:00Z'));
  for (const kind of workflow.jobs['refresh-and-post'].strategy.matrix.kind) {
    await assert.rejects(prepareTelegramSlot(kind, { cwd, slot, request: async () => assert.fail('Expired slots must not fetch') }), /Outside posting window/);
  }
  assert.equal(fs.readFileSync(file, 'utf8'), '["previous"]');
});

test('workflow isolates Telegram publishers from daily publication and backs up each matrix leg', () => {
  const telegram = workflow.jobs['refresh-and-post'];
  assert.deepEqual(telegram.strategy.matrix.kind, ['jobs', 'events', 'news', 'group-news', 'ai-news']);
  assert.equal(telegram.strategy['fail-fast'], false);
  assert.deepEqual(telegram.needs, ['gate']);
  assert.equal(telegram.env.TELEGRAM_PUBLISH_DATE, '${{ needs.gate.outputs.date }}');
  assert.equal(telegram.env.TELEGRAM_PUBLISH_SLOT, '${{ needs.gate.outputs.slot }}');
  const ready = telegram.steps.findIndex(step => step.id === 'ready');
  assert.equal(telegram.steps[ready].run, "node scripts/social/prepare-telegram-slot.mjs '${{ matrix.kind }}'");
  for (const [index, step] of telegram.steps.entries()) if (step.name?.startsWith('Post to Telegram')) {
    assert.ok(index > ready);
    assert.match(step.if, /steps\.ready\.outcome == 'success'/);
    assert.doesNotMatch(step.run, /--force/);
  }
  assert.ok(telegram.steps.every(step => !/fetch-web3-events|sync-token2049-events/.test(step.run || '')));
  assert.ok(telegram.steps.find(step => step.name === 'Preserve Telegram receipts').with['include-hidden-files']);
  assert.match(telegram.steps.find(step => step.name === 'Persist Telegram history independently').if, /always\(\)/);
  const refresh = workflow.jobs['refresh-events'].steps;
  assert.ok(refresh.findIndex(step => step.id === 'token2049') < refresh.findIndex(step => /fetch-web3-events/.test(step.run || '')));
});
