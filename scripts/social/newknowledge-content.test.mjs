import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { validateCampaign, renderThread, selectKnowledgeDate, assertKnowledgeOnly, verifyPostLinks } from './newknowledge-content.mjs';

const content = JSON.parse(await fs.readFile(new URL('../../social-assets/knowledge-threads-month/content.json', import.meta.url)));
const calendar = JSON.parse(await fs.readFile(new URL('../../social-assets/knowledge-threads-month/calendar.json', import.meta.url)));
const time = value => Date.parse(value);

test('calendar binds 30 unique threads to 30 consecutive dates and validates all 360 rendered posts', () => {
  const sorted = validateCampaign(content, calendar);
  assert.equal(sorted[0].id, 'C01');
  assert.equal(sorted.at(-1).id, 'N10');
  for (const thread of sorted) for (const platform of ['x', 'threads']) {
    const posts = renderThread(thread, platform);
    assert.equal(posts.length, 6);
    for (const [index, post] of posts.entries()) {
      assert.match(post.image, new RegExp(`${thread.id}-0${index + 1}\\.jpg$`));
      const original = thread.posts[index];
      const expectedLink = original.linkPath ? `\n\nhashtagweb3.com${original.linkPath}/${platform === 'x' ? 'x' : 'th'}` : '';
      assert.equal(post.text, original.text + expectedLink);
      assert.doesNotMatch(post.text, /https?:\/\//);
    }
  }
});

test('bare published links retain the 23-character X URL weight', () => {
  const thread = structuredClone(content.threads[0]);
  thread.posts[5].text = 'a'.repeat(255);
  assert.doesNotThrow(() => renderThread(thread, 'x'));
  thread.posts[5].text += 'a';
  assert.throws(() => renderThread(thread, 'x'), /exceeds X limit/);
});

test('each campaign day has exactly one afternoon window, with an exclusive 12:30 UTC end', () => {
  for (const entry of calendar.dates) {
    for (const clock of ['00:00:00', '03:30:00', '11:29:59', '12:30:00', '19:30:00', '23:59:59']) {
      assert.equal(selectKnowledgeDate(calendar, { now: time(`${entry.date}T${clock}Z`) }).due, false);
    }
    for (const clock of ['11:30:00', '12:00:00', '12:29:59.999']) {
      const plan = selectKnowledgeDate(calendar, { now: time(`${entry.date}T${clock}Z`) });
      assert.equal(plan.due, true);
      assert.equal(plan.entry.id, entry.id);
    }
  }
  assert.equal(selectKnowledgeDate(calendar, { now: time('2026-10-17T11:30:00Z') }).due, false);
  assert.equal(selectKnowledgeDate(calendar, { now: time('2026-11-17T11:30:00Z') }).due, false);
});

test('manual dates cannot publish early or backfill; recovery, news, dry runs and diagnostics are excluded', () => {
  const now = time('2026-10-19T11:30:00Z');
  for (const date of ['2026-10-18', '2026-10-20']) assert.equal(selectKnowledgeDate(calendar, { now, date }).due, false);
  for (const slot of ['morning', 'evening', 'diagnose']) assert.equal(selectKnowledgeDate(calendar, { now, slot }).due, false);
  for (const key of ['website_recovery', 'only_news', 'news_dry_run', 'dry_run', 'diagnose_telegram', 'diagnose_content', 'diagnose']) {
    for (const value of [true, 'true']) assert.equal(selectKnowledgeDate(calendar, { now, flags: { [key]: value } }).due, false);
  }
});

test('frozen vacancies, inline external links, changed calendar sequence and tracking paths fail closed', () => {
  for (const change of [
    value => { value.threads[0].posts[0].text = 'Acme is hiring engineers. Apply now to join the team.'; },
    value => { value.threads[0].posts[0].text += ' https://jobs.ashbyhq.com/acme/1'; },
    value => { value.threads[0].posts[5].linkPath = '/some-active-job'; },
    value => { value.threads[0].posts[5].linkPath = '/jobs/x'; },
    value => { value.threads[0].picturedJobs = [{ slug: 'job1' }]; },
  ]) {
    const edited = structuredClone(content); change(edited);
    assert.throws(() => validateCampaign(edited, calendar));
  }
  const edited = structuredClone(calendar); edited.dates[1].date = edited.dates[0].date;
  assert.throws(() => validateCampaign(content, edited));
  assert.throws(() => assertKnowledgeOnly({ nested: { applyUrl: 'https://employer.example' } }));
});

test('preflight fetches bare links over HTTPS and still accepts explicit HTTPS own-site links', async () => {
  for (const platform of ['x', 'threads']) {
    const posts = renderThread(content.threads[0], platform);
    const expected = `https://hashtagweb3.com/building-web3-portfolio/${platform === 'x' ? 'x' : 'th'}`;
    for (const candidates of [posts, posts.map(post => ({ ...post, text: post.text.replace('hashtagweb3.com/', 'https://hashtagweb3.com/') }))]) {
      const requested = [];
      await verifyPostLinks(candidates, async url => { requested.push(url); return { status: 200, url }; });
      assert.deepEqual(requested, [expected]);
    }
  }
});

test('preflight rejects missing resource links and off-site, false-host or homepage redirects', async () => {
  const posts = renderThread(content.threads[0], 'threads');
  for (const result of [{ status: 404, url: 'https://hashtagweb3.com/building-web3-portfolio/th' }, { status: 200, url: 'https://other.example/guide' }, { status: 200, url: 'https://hashtagweb3.com.evil.example/guide' }, { status: 200, url: 'https://hashtagweb3.com/' }]) {
    await assert.rejects(verifyPostLinks(posts, async () => result));
  }
});

test('preflight rejects off-site and false-host input links before fetching', async () => {
  for (const link of [
    'https://other.example/guide', 'other.example/guide',
    'https://other.example/?next=hashtagweb3.com/jobs/x',
    'https://hashtagweb3.com.evil.example/jobs/x', 'hashtagweb3.com.evil.example/jobs/x',
    'https://sub.hashtagweb3.com/jobs/th', 'sub.hashtagweb3.com/jobs/th',
    'https://hashtagweb3.com@evil.example/jobs/x', 'hashtagweb3.com@evil.example/jobs/x',
    'https://user@hashtagweb3.com/jobs/x',
  ]) {
    let requests = 0;
    await assert.rejects(verifyPostLinks([{ text: `Read more\n\n${link}` }], async url => { requests++; return { status: 200, url }; }));
    assert.equal(requests, 0, link);
  }
});
