import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { assertCanonicalLinkPath, platformLink, SITE_ORIGIN } from './platform-links.mjs';
import { postingSlot, isPostingWindow, assertPostingWindow } from './posting-slot.mjs';
import { hasEventEnded } from '../lib/event-dates.mjs';
import { assertPublicThread, usesPublicCopyPolicy } from './public-copy-guard.mjs';

export const CAMPAIGN = 'knowledge-threads-month-2026-10-17';
export const ASSET_DIRECTORY = 'social-assets/knowledge-threads-month';
export const START = '2026-10-18';
export const END = '2026-11-16';
export const sha256 = value => createHash('sha256').update(value).digest('hex');
const SITE_HOST = new URL(SITE_ORIGIN).hostname;
const resourcePaths = new Set([
  '/building-web3-portfolio', '/resume-builder', '/jobs', '/invoice-generator',
  '/how-to-contribute-to-daos-and-get-paid', '/jd-builder', '/interview-questions',
  '/content-strategy-for-web3-projects', '/web3-community-manager-career', '/remote-work-in-web3',
  '/nomads', '/visas', '/popups', '/building-relationships-in-web3', '/remote-work-checklist',
  '/citizenship', '/coffee-chat-etiquette-for-professionals',
  '/salary-calculator', '/web3-career-quiz', '/learn', '/events',
]);

export function assertKnowledgeOnly(value) {
  if (!value || typeof value !== 'object') return;
  for (const key of ['job', 'jobs', 'jobId', 'jobSlug', 'picturedJobs', 'activeJobs', 'snapshot', 'applicationUrl', 'applyUrl']) {
    assert.ok(!(key in value), 'Actual vacancies require the guarded job publisher');
  }
  Object.values(value).forEach(assertKnowledgeOnly);
}

export function renderThread(thread, platform) {
  assert.ok(['x', 'threads'].includes(platform));
  return thread.posts.map(post => {
    if (post.linkPath !== null) {
      assertCanonicalLinkPath(post.linkPath);
      assert.ok(resourcePaths.has(post.linkPath), `Unapproved resource path: ${post.linkPath}`);
    }
    const text = post.text + (post.linkPath ? `\n\n${platformLink(`${SITE_HOST}${post.linkPath}`, platform)}` : '');
    const weightedText = post.text + (post.linkPath ? `\n\n${'x'.repeat(23)}` : '');
    const alt = post.alt || `${post.visual.headline}. ${post.visual.labels.join('. ')}.`;
    assert.ok(alt.length >= 20 && alt.length <= 1000, 'Image alt text must describe the visual');
    assert.ok([...weightedText].length <= 280, `${thread.id}/${post.number} exceeds X limit`);
    assert.ok([...text].length <= 500, `${thread.id}/${post.number} exceeds Threads limit`);
    return { number: post.number, text, alt, image: `${ASSET_DIRECTORY}/images/${thread.id}-${String(post.number).padStart(2, '0')}.jpg` };
  });
}

export function validateCampaign(content, calendar) {
  assert.equal(content.id, CAMPAIGN);
  assert.equal(content.siteOrigin, SITE_ORIGIN);
  assert.equal(content.threads.length, 30);
  assertKnowledgeOnly(content.threads);
  const sorted = [...content.threads].sort((a, b) => a.sequence - b.sequence);
  assert.equal(new Set(sorted.map(t => t.id)).size, 30);
  assert.equal(new Set(sorted.map(t => t.posts[0].text)).size, 30);
  sorted.forEach((thread, i) => {
    if (usesPublicCopyPolicy({ campaign: content.id, ...thread })) assertPublicThread(thread);
    assert.equal(thread.sequence, i + 1);
    assert.match(thread.id, /^[CEN](?:0[1-9]|10)$/);
    assert.equal(thread.posts.length, 6);
    assert.ok(thread.sources?.length, `${thread.id} needs sources`);
    thread.posts.forEach((post, index) => {
      assert.equal(post.number, index + 1);
      assert.ok(typeof post.text === 'string' && post.text.trim() === post.text && post.text.length > 30);
      assert.ok(!/https?:\/\/|www\.|\b[a-z0-9-]+\.(?:com|org|net|io|xyz|dev|app|co|ai)\b/i.test(post.text), 'Post links belong only in linkPath');
      assert.ok(!/\bis hiring\b|\bwe(?:'|’)re hiring\b|\bapply now\b|\bhiring now\b/i.test(post.text), 'Job announcements are not evergreen');
      assert.ok(!/[\u2013\u2014\u2018\u2019\u201c\u201d\u2026\u2022]/u.test(post.text), 'Post text fails noslop punctuation rules');
    });
    renderThread(thread, 'x');
    renderThread(thread, 'threads');
  });
  assert.equal(calendar.campaign, CAMPAIGN);
  assert.equal(calendar.start, START);
  assert.equal(calendar.end, END);
  assert.equal(calendar.slot, 'afternoon');
  assert.equal(calendar.timeUTC, '11:30');
  assert.equal(calendar.windowMinutes, 60);
  assert.deepEqual(calendar.platforms, ['x', 'threads']);
  assert.equal(calendar.dates.length, 30);
  calendar.dates.forEach((entry, i) => {
    assert.equal(entry.date, new Date(Date.parse(`${START}T00:00:00Z`) + i * 86400000).toISOString().slice(0, 10));
    assert.deepEqual(entry, { date: entry.date, id: sorted[i].id, title: sorted[i].title, sequence: i + 1 });
  });
  return sorted;
}

export function selectKnowledgeDate(calendar, { date, slot = 'afternoon', now = Date.now(), flags = {} } = {}) {
  const blocked = ['website_recovery', 'only_news', 'news_dry_run', 'dry_run', 'diagnose_telegram', 'diagnose_content', 'diagnose'];
  if (blocked.some(key => flags[key] === true || flags[key] === 'true')) return { due: false, reason: 'excluded-mode' };
  date ||= new Date(now).toISOString().slice(0, 10);
  const entry = calendar.dates.find(item => item.date === date);
  if (!entry) return { due: false, reason: 'outside-campaign' };
  if (slot !== 'afternoon') return { due: false, reason: 'wrong-slot' };
  const window = postingSlot(slot, date);
  if (!isPostingWindow(window, now)) return { due: false, reason: 'outside-window' };
  return { due: true, entry, window };
}

export function assertKnowledgeWindow(date, now = Date.now()) {
  assert.ok(date >= START && date <= END, 'Outside campaign dates');
  assertPostingWindow(postingSlot('afternoon', date), now);
}

function eventCalendarDate(value, timezone) {
  assert.ok(typeof value === 'string' && Number.isFinite(Date.parse(value)), 'Invalid event date');
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  if (!timezone && /[+-]\d{2}:\d{2}$/.test(value)) return value.slice(0, 10);
  const parts = new Intl.DateTimeFormat('en', { timeZone: timezone || 'UTC', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(value));
  const date = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${date.year}-${date.month}-${date.day}`;
}

export function assertThreadResourceFreshness(thread, events, now = Date.now()) {
  if (!thread.freshness) return;
  const { kind, eventIds, expectedDates, expectedDetails } = thread.freshness;
  assert.equal(kind, 'events', 'Unsupported resource freshness rule');
  assert.ok(Array.isArray(eventIds) && eventIds.length > 0 && new Set(eventIds).size === eventIds.length, 'Event threads need unique source identities');
  assert.ok(Number.isFinite(now), 'Invalid resource review clock');
  for (const id of eventIds) {
    const event = events.find(item => item.id === id);
    assert.ok(event, `${thread.id}: event no longer listed: ${id}`);
    assert.ok(!['private', 'unlisted'].includes(event.visibility) && event.publicationStatus !== 'needs-review', `${thread.id}: event no longer public: ${id}`);
    assert.ok(!['EventCancelled', 'EventPostponed'].includes(event.eventStatus), `${thread.id}: cancelled or postponed event: ${id}`);
    assert.ok(!hasEventEnded(event, now), `${thread.id}: event has ended: ${id}`);
    assert.ok(!['closed', 'sold-out'].includes(event.registrationAvailability), `${thread.id}: registration closed: ${id}`);
    const expected = expectedDates?.[id];
    assert.ok(expected, `${thread.id}: missing reviewed event dates: ${id}`);
    assert.equal(eventCalendarDate(event.startDate, event.timezone), expected.startDate, `${thread.id}: start date changed: ${id}`);
    assert.equal(eventCalendarDate(event.endDate || event.startDate, event.timezone), expected.endDate, `${thread.id}: end date changed: ${id}`);
    assert.ok(expectedDetails?.[id], `${thread.id}: missing reviewed event details: ${id}`);
    for (const [key, value] of Object.entries(expectedDetails[id])) assert.deepEqual(event[key] ?? null, value, `${thread.id}: ${key} changed: ${id}`);
  }
}

export async function verifyPostLinks(posts, fetcher = fetch) {
  const links = posts.flatMap(post => post.text.match(/https?:\/\/\S+|(?<![\w@./:-])(?:[a-z0-9-]+\.)+[a-z]{2,}(?:[/:?#@]\S*)?/gi) || []);
  const codeMembers = new Set(['msg.sender', 'msg.value', 'tx.origin', 'tx.from']);
  const urls = new Set(links.filter(link => !codeMembers.has(link)).map(link => /^https?:\/\//i.test(link) ? link : `https://${link}`));
  for (const url of urls) {
    const source = new URL(url);
    assert.equal(source.origin, SITE_ORIGIN, 'Only own-site links may be published');
    assert.ok(!source.username && !source.password, 'Post links must not contain credentials');
    const response = await fetcher(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(30000) });
    try {
      assert.equal(response.status, 200, `Post link is unavailable: ${url}`);
      const destination = new URL(response.url);
      assert.equal(destination.origin, SITE_ORIGIN, 'Post link redirected off-site');
      assert.notEqual(destination.pathname, '/', 'Post link redirected to the homepage');
    } finally { await response.body?.cancel(); }
  }
}
