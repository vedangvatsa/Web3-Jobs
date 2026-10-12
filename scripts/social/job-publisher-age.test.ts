import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { postToThreads, postToBluesky, postToFarcaster, postToLinkedInBuffer, postToFacebook } from './post-job-openings';
import { BufferXClient, BUFFER_X_CHANNEL_ID } from './buffer-x';
import { PersonalLinkedInClient } from './linkedin-personal';
import { postToLinkedIn } from '../../src/lib/linkedin';
import { assertPublishableJob } from '../lib/job-publish-guard.mjs';
import { assertEvergreenContent } from './evergreen-content.mjs';

const fresh = () => ({ id: 'source-1', slug: 'engineer1', title: 'Software Engineer', company: 'Example', date: new Date(Date.now() - 86400000).toISOString(), active: true, link: 'https://careers.example.com/roles/engineer1' });
const text = 'Example is hiring Software Engineer: https://hashtagweb3.com/engineer1/li';
const link = { url: 'https://hashtagweb3.com/engineer1/li', title: 'Software Engineer at Example' };
const target = { channelId: 'linkedin-channel', name: 'hashtagweb3', label: '#Web3' };

function transports(beforeSend: () => Promise<void>) {
  return [
    () => new BufferXClient('offline').create(text, beforeSend),
    () => postToThreads(text, link.url, beforeSend),
    () => postToBluesky(text, link.url, 'https://hashtagweb3.com/og/jobs/engineer1.png', 'Example', 'Software Engineer', 'Build distributed systems.', beforeSend),
    () => postToFarcaster(text, link.url, 'jobs', beforeSend),
    () => postToLinkedInBuffer(target, text, link, beforeSend),
    () => new PersonalLinkedInClient({ token: 'offline', memberId: 'member', expiresAt: new Date(Date.now() + 86400000).toISOString(), version: '202609' }).create(text, link, beforeSend),
    () => postToFacebook(text, link.url, beforeSend),
    () => postToLinkedIn({ content: text, linkUrl: link.url, linkTitle: link.title }, beforeSend),
  ];
}

test('all job social transports block expired, unknown and dead applications before provider mutations', async t => {
  t.mock.method(console, 'error', () => {});
  const previous = { ...process.env };
  t.after(() => { process.env = previous; });
  Object.assign(process.env, { THREADS_ACCESS_TOKEN: 'offline', THREADS_USER_ID: 'threads-id', BLUESKY_APP_PASSWORD: 'offline', NEYNAR_API_KEY: 'offline', FARCASTER_SIGNER_UUID: 'offline', BUFFER_ACCESS_TOKEN: 'offline', META_PAGE_ID: 'fb-id', META_PAGE_TOKEN: 'offline', LINKEDIN_ACCESS_TOKEN: 'offline' });
  let mutations = 0;
  t.mock.method(globalThis, 'fetch', async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    if (url === fresh().link) return new Response('Not found', { status: 404 });
    if (url.includes('graph.threads.net') && !init?.method) return Response.json({ id: 'threads-id', username: 'hashtagweb3' });
    if (url.includes('api.buffer.com')) {
      const body = JSON.parse(String(init?.body));
      if (!body.query.includes('mutation')) return Response.json({ data: { channel: body.variables.id === BUFFER_X_CHANNEL_ID
        ? { id: BUFFER_X_CHANNEL_ID, name: 'hashtag_web3', service: 'twitter' } : { id: target.channelId, name: target.name, service: 'linkedin' } } });
    }
    mutations++; throw new Error(`Unexpected mutation: ${url}`);
  });
  for (const change of [{ date: '2024-03-09T05:33:00.298Z' }, { date: '' }, { date: 'invalid' }, { active: false }, {}]) {
    const job = { ...fresh(), ...change };
    const beforeSend = () => assertPublishableJob(job, { loadJobs: async () => [job] });
    for (const send of transports(beforeSend)) await assert.rejects(send(), /publication blocked|application closed/);
  }
  assert.equal(mutations, 0);
});

test('fresh job delivery preserves complete provider bodies and checks each send, including Threads publish', async t => {
  const previous = { ...process.env };
  t.after(() => { process.env = previous; });
  Object.assign(process.env, { THREADS_ACCESS_TOKEN: 'offline', THREADS_USER_ID: 'threads-id', BLUESKY_APP_PASSWORD: 'offline', NEYNAR_API_KEY: 'offline', FARCASTER_SIGNER_UUID: 'offline', BUFFER_ACCESS_TOKEN: 'offline', META_PAGE_ID: 'fb-id', META_PAGE_TOKEN: 'offline', LINKEDIN_ACCESS_TOKEN: 'offline' });
  const job = fresh();
  let lastEmployerGet = 0, checks = 0;
  const bodies: unknown[] = [];
  t.mock.method(globalThis, 'fetch', async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    if (url === job.link) {
      assert.equal(init?.method, 'GET'); lastEmployerGet = ++checks;
      return new Response('<html><head><title>Software Engineer at Example</title></head><body><h1>Software Engineer</h1><p>Build distributed systems at Example.</p><a href="apply">Apply now</a></body></html>', { headers: { 'content-type': 'text/html' } });
    }
    if (url.includes('/userinfo')) return Response.json({ sub: 'member', name: 'Test member' });
    if (url.includes('graph.threads.net') && !init?.method) return Response.json({ id: 'threads-id', username: 'hashtagweb3' });
    if (url.includes('/og/jobs/')) return new Response(null, { status: 404 });
    if (url.includes('createSession')) return Response.json({ accessJwt: 'offline', did: 'did:plc:test' });
    const body = init?.body instanceof URLSearchParams ? Object.fromEntries(init.body) : String(init?.body).startsWith('{') ? JSON.parse(String(init?.body)) : Object.fromEntries(new URLSearchParams(String(init?.body)));
    if (body.query && !body.query.includes('mutation')) return Response.json({ data: { channel: body.variables.id === BUFFER_X_CHANNEL_ID
      ? { id: BUFFER_X_CHANNEL_ID, name: 'hashtag_web3', service: 'twitter' } : { id: target.channelId, name: target.name, service: 'linkedin' } } });
    assert.ok(lastEmployerGet > 0, `Employer GET required before ${url}`); lastEmployerGet = 0;
    bodies.push(body);
    if (url.includes('api.buffer.com')) {
      assert.equal(body.variables.input.text, text); assert.equal(body.variables.input.mode, 'shareNow');
      return Response.json({ data: { createPost: { post: { id: 'buffer-id' } } } });
    }
    if (url.endsWith('/threads')) { assert.equal(body.text, text); assert.equal(body.link_attachment, link.url); return Response.json({ id: 'threads-container' }); }
    if (url.endsWith('/threads_publish')) { assert.equal(body.creation_id, 'threads-container'); return Response.json({ id: 'threads-post' }); }
    if (url.includes('createRecord')) { assert.equal(body.record.text, text); assert.equal(body.record.facets[0].features[0].uri, link.url); return Response.json({ uri: 'at://did:plc:test/app.bsky.feed.post/id' }); }
    if (url.includes('neynar')) { assert.equal(body.text, text); assert.deepEqual(body.embeds, [{ url: link.url }]); assert.equal(body.channel_id, 'jobs'); return Response.json({ cast: { hash: '0x123' } }); }
    if (url.endsWith('/fb-id/feed')) { assert.equal(body.message, text); assert.equal(body.link, link.url); return Response.json({ id: 'fb-post' }); }
    assert.ok(body.commentary === text || body.specificContent?.['com.linkedin.ugc.ShareContent'].commentary === text);
    return Response.json({ id: 'linkedin-post' }, { status: 201, headers: { 'x-restli-id': 'urn:li:share:123' } });
  });
  const beforeSend = () => assertPublishableJob(job, { loadJobs: async () => [job] });
  for (const send of transports(beforeSend)) await send();
  assert.equal(bodies.length, 9);
  assert.ok(checks >= bodies.length);
});

test('--force cannot select an expired explicit slug or refill an empty eligible pool', () => {
  const expired = { ...fresh(), slug: 'marketing4', date: '2024-03-09T05:33:00.298Z' };
  const preload = `globalThis.fetch = async (url, init) => { if (String(url) !== 'https://hashtagweb3.com/data/jobs-runtime.json' || init.method !== 'GET') throw new Error('Unexpected outbound request'); return Response.json(${JSON.stringify([expired])}); };`;
  for (const extra of [[], ['--slug', 'marketing4']]) {
    const result = spawnSync(process.execPath, ['--import', 'tsx', '--import', `data:text/javascript,${encodeURIComponent(preload)}`, 'scripts/social/post-job-openings.ts', '--platform', 'all', '--dry-run', '--force', ...extra], { encoding: 'utf8' });
    assert.equal(result.status, extra.length ? 1 : 0, result.stderr);
    assert.match(result.stdout + result.stderr, /No eligible unposted jobs|not found in cache/);
    assert.doesNotMatch(result.stdout + result.stderr, /Selected Job:|Resetting cycle history|Unexpected outbound/);
  }
});

test('generic provider queues refuse job records and old stored announcement payloads regardless of due date', () => {
  for (const payload of [fresh(), { snapshot: fresh() }, { type: 'job', date: new Date().toISOString() },
    { text: 'Harmony is hiring Marketing Lead', dueAt: new Date().toISOString() },
    { linkedin: { text: 'Apply: https://hashtagweb3.com/marketing4/li' } }, { text: fresh().link.replace('careers.example.com/roles/engineer1', 'jobs.lever.co/example/id') }]) {
    assert.throws(() => assertEvergreenContent(payload), /guarded job publisher/);
  }
  assert.doesNotThrow(() => assertEvergreenContent({ text: 'How to prepare for a technical interview. Read more at hashtagweb3.com/li' }));
});
