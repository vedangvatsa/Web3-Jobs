import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { parseDocument } from 'yaml';
import { linkedInTargets } from './linkedin-targets';
import { verifyLinkedInBuffer, type LinkedInBufferPost } from './job-linkedin-verification';
import { inspectJobLinkedInReceipts } from './inspect-job-linkedin-receipts';
import { postToLinkedInBuffer, main } from './post-job-openings';
import { deliverSocialPost, SocialStateError, type SocialState } from './job-social-state';

const [web3, cv] = linkedInTargets({});
const text = 'Example is hiring Engineer: https://hashtagweb3.com/engineer1/li?og=7';
const sent: LinkedInBufferPost = {
  id: 'buffer-post', text, channelId: web3.channelId, channelService: 'linkedin', status: 'sent',
  externalLink: 'https://www.linkedin.com/feed/update/urn:li:ugcPost:123456789',
};

test('the diagnostic workflow pins code, has read-only repository permissions and only queries explicit IDs', () => {
  const document = parseDocument(readFileSync('.github/workflows/inspect-job-receipts.yml', 'utf8'), { uniqueKeys: true });
  assert.deepEqual(document.errors, []);
  const workflow = document.toJS();
  assert.deepEqual(workflow.permissions, { contents: 'read' });
  assert.deepEqual(Object.keys(workflow.on), ['workflow_dispatch']);
  assert.equal(workflow.on.workflow_dispatch.inputs.post_ids.required, true);
  assert.equal(workflow.jobs.inspect.steps[0].with.ref, '${{ github.sha }}');
  assert.equal(workflow.jobs.inspect.steps[0].with['persist-credentials'], false);
  const inspect = workflow.jobs.inspect.steps.find((step: { run?: string }) => step.run?.includes('inspect-job-linkedin-receipts.ts'));
  assert.equal(inspect.env.POST_IDS, '${{ inputs.post_ids }}');
  assert.equal(inspect.env.BUFFER_ACCESS_TOKEN, '${{ secrets.BUFFER_ACCESS_TOKEN }}');
  assert.doesNotMatch(inspect.run, /post-job-openings|--force|--apply|eval/);
});

function readback(responses: Array<unknown | Response | Error>) {
  const calls: Array<{ query: string; variables: { id: string } }> = [], sleeps: number[] = [];
  const request: typeof fetch = async (url, init) => {
    assert.equal(url, 'https://api.buffer.com/graphql');
    assert.equal(init?.method, 'POST');
    assert.equal(init?.redirect, 'error');
    const body = JSON.parse(String(init?.body));
    assert.match(body.query, /^query LinkedInReceipt\(\$id: PostId!\)/);
    assert.match(body.query, /post\(input: \{id: \$id\}\)/);
    assert.match(body.query, /error \{ message \}/);
    assert.doesNotMatch(body.query, /mutation|createPost/);
    calls.push(body);
    const response = responses.shift();
    assert.notEqual(response, undefined, 'Unexpected readback');
    if (response instanceof Error) throw response;
    return response instanceof Response ? response : Response.json(response);
  };
  return { calls, sleeps, options: { request, token: 'offline-token', sleep: async (ms: number) => { sleeps.push(ms); } } };
}

test('company LinkedIn polls the same accepted ID until sent with a permalink', async () => {
  const h = readback([
    { data: { post: { ...sent, status: 'scheduled', externalLink: null } } },
    { data: { post: { ...sent, status: 'sending', externalLink: null } } },
    { data: { post: { ...sent, externalLink: null } } },
    { data: { post: sent } },
  ]);
  assert.deepEqual(await verifyLinkedInBuffer(web3, sent.id, text, h.options), { permalink: sent.externalLink });
  assert.deepEqual(h.calls.map(call => call.variables), Array(4).fill({ id: sent.id }));
  assert.deepEqual(h.sleeps, [5000, 5000, 5000]);
});

test('accepted or sent-without-permalink posts stay pending after six read-only attempts', async () => {
  for (const post of [{ ...sent, status: 'scheduled' }, { ...sent, status: 'sending' }, { ...sent, externalLink: null }]) {
    const h = readback(Array(6).fill({ data: { post } }));
    await assert.rejects(verifyLinkedInBuffer(web3, sent.id, text, h.options), /remains pending.*(?:status=|without a permalink).*read-only reconciliation/);
    assert.equal(h.calls.length, 6);
    assert.equal(h.sleeps.length, 5);
  }
});

test('identity, exact text, missing posts and terminal statuses fail without polling past the discrepancy', async () => {
  const cases: Array<[LinkedInBufferPost | null, RegExp]> = [
    [null, /post not found/],
    [{ ...sent, id: 'different' }, /post ID mismatch/],
    [{ ...sent, channelId: cv.channelId }, /channel ID mismatch/],
    [{ ...sent, channelService: 'twitter' }, /channel service mismatch/],
    [{ ...sent, text: text + ' ' }, /text mismatch/],
    [{ ...sent, text: text.replace('https://hashtagweb3.com/engineer1/li?og=7', 'https://buff.ly/abc') }, /text mismatch/],
    [{ ...sent, status: 'error', error: { message: 'Reconnect channel' } }, /status=error: Reconnect channel/],
    [{ ...sent, status: 'draft' }, /status=draft/],
    [{ ...sent, status: 'needs_approval' }, /status=needs_approval/],
    [{ ...sent, status: 'unexpected' }, /status=unexpected/],
  ];
  for (const [post, reason] of cases) {
    const h = readback([{ data: { post } }, { data: { post: sent } }]);
    await assert.rejects(verifyLinkedInBuffer(web3, sent.id, text, h.options), reason);
    assert.equal(h.calls.length, 1);
    assert.deepEqual(h.sleeps, []);
  }
});

test('share, activity, UGC and account-specific named permalinks verify for both company channels', async () => {
  for (const target of [web3, cv]) {
    for (const externalLink of [
      'https://www.linkedin.com/feed/update/urn:li:share:123/',
      'https://linkedin.com/feed/update/urn:li:activity:123?utm_source=share',
      'https://www.linkedin.com/feed/update/urn:li:ugcPost:123',
      `https://www.linkedin.com/posts/${target.name}_hiring-activity-123-abcd/`,
    ]) {
      const h = readback([{ data: { post: { ...sent, channelId: target.channelId, externalLink } } }]);
      assert.deepEqual(await verifyLinkedInBuffer(target, sent.id, text, h.options), { permalink: externalLink });
    }
  }
});

test('profile URLs, bare permalink prefixes, other named accounts and lookalike URLs cannot prove delivery', async () => {
  for (const externalLink of [
    'https://www.linkedin.com/company/89714573', 'https://www.linkedin.com/company/hashtagweb3/',
    'https://www.linkedin.com/posts/', 'https://www.linkedin.com/feed/update/',
    'https://www.linkedin.com/feed/update/urn:li:ugcPost:not-a-number',
    'https://www.linkedin.com/feed/update/urn:li:share:123/extra',
    'https://www.linkedin.com/posts/cvinbio_hiring-activity-123-abcd',
    'http://www.linkedin.com/feed/update/urn:li:share:123',
    'https://www.linkedin.com.evil.test/feed/update/urn:li:share:123',
    'https://user:pass@www.linkedin.com/feed/update/urn:li:share:123',
    'https://www.linkedin.com:8443/feed/update/urn:li:share:123', 'not a URL',
  ]) {
    const h = readback([{ data: { post: { ...sent, externalLink } } }]);
    await assert.rejects(verifyLinkedInBuffer(web3, sent.id, text, h.options), /invalid LinkedIn post permalink/);
    assert.equal(h.calls.length, 1);
  }
});

test('HTTP, GraphQL, malformed and lost readbacks remain pending with distinct redacted reasons', async () => {
  for (const [response, reason] of [
    [new Response('Unauthorized', { status: 401 }), /HTTP 401/],
    [new Response('Slow down', { status: 429 }), /HTTP 429/],
    [{ data: { post: sent }, errors: [{ extensions: { code: 'FORBIDDEN' }, message: 'Token offline-token cannot read' }] }, /GraphQL: FORBIDDEN: Token \[redacted\] cannot read/],
    [new Response('<html>not JSON</html>'), /invalid JSON/],
    [{}, /missing post data/],
    [null, /missing post data/],
    [new Error('Request failed with Bearer offline-token'), /network, redirect or timeout/],
    [{ data: { post: { ...sent, status: 'error', error: { message: 'Provider rejected Bearer offline-token' } } } }, /status=error/],
  ] as const) {
    const h = readback([response]);
    await assert.rejects(verifyLinkedInBuffer(web3, sent.id, text, h.options), error => {
      assert.match(String(error), /remains pending/);
      assert.match(String(error), reason);
      assert.doesNotMatch(String(error), /offline-token/);
      return true;
    });
    assert.equal(h.calls.length, 1);
    assert.deepEqual(h.sleeps, []);
  }
});

const empty = (): SocialState => ({ lastIndex: 0, postedSlugs: [], pendingSlugs: [], history: [] });
const entry = () => ({ slug: 'engineer1', company: 'Example', title: 'Engineer', platform: 'linkedin', postedAt: '2026-10-22T00:00:00Z', provider: 'buffer', account: web3.channelId, expectedText: text });

test('the accepted company post ID is saved as pending before polling; timeout cannot create a duplicate', async t => {
  const env = { ...process.env };
  t.after(() => { process.env = env; });
  process.env.BUFFER_ACCESS_TOKEN = 'offline-token';
  const state = empty(), saved: SocialState[] = [];
  let creates = 0, reads = 0, sleeps = 0;
  t.mock.method(globalThis, 'fetch', async (_url: string | URL | Request, init?: RequestInit) => {
    const body = JSON.parse(String(init?.body));
    if (body.query.includes('LinkedInChannel')) return Response.json({ data: { channel: { id: web3.channelId, name: web3.name, service: 'linkedin' } } });
    if (body.query.includes('mutation')) {
      assert.equal(saved.at(-1)?.history[0].verification, 'creating');
      creates++;
      return Response.json({ data: { createPost: { post: { id: sent.id } } } });
    }
    reads++;
    assert.equal(saved.at(-1)?.history[0].postId, sent.id);
    assert.equal(saved.at(-1)?.history[0].verification, 'pending');
    return Response.json({ data: { post: { ...sent, status: 'sending' } } });
  });
  const options = {
    state, entry: entry(), save: async () => { saved.push(structuredClone(state)); }, beforeSend: async () => {},
    send: () => postToLinkedInBuffer(web3, text, { url: 'https://hashtagweb3.com/engineer1/li?og=7' }, async () => {}),
    verify: (id: string) => verifyLinkedInBuffer(web3, id, text, { sleep: async () => { sleeps++; } }),
  };
  await assert.rejects(deliverSocialPost(options), /status=sending/);
  assert.equal(creates, 1);
  assert.equal(reads, 6);
  assert.equal(sleeps, 5);
  assert.equal(state.history[0].postId, sent.id);
  assert.equal(state.history[0].verification, 'pending');
  await assert.rejects(deliverSocialPost(options), /creation blocked/);
  assert.equal(creates, 1);
});

test('failure to checkpoint a company receipt stops before verification or further creation', async () => {
  const state = empty();
  let creates = 0, reads = 0;
  await assert.rejects(deliverSocialPost({
    state, entry: entry(), beforeSend: async () => {},
    save: async () => { if (state.history[0]?.postId) throw new SocialStateError('checkpoint failed'); },
    send: async () => { creates++; return sent.id; },
    verify: async () => { reads++; return { permalink: sent.externalLink! }; },
  }), SocialStateError);
  assert.equal(creates, 1);
  assert.equal(reads, 0);
  assert.equal(state.history[0].postId, sent.id);
  assert.equal(state.history[0].verification, 'pending');
});

test('real CLI reconciliation reads each known company ID once and force cannot resend a pending job', async t => {
  const argv = process.argv, env = { ...process.env };
  t.after(() => { process.argv = argv; process.env = env; });
  process.argv = ['node', 'poster', '--platform', 'linkedin', '--slug', 'engineer1', '--force'];
  Object.assign(process.env, { BUFFER_ACCESS_TOKEN: 'offline-token', BUFFER_LINKEDIN_CHANNEL_ID: web3.channelId, BUFFER_CVINBIO_CHANNEL_ID: cv.channelId, LINKEDIN_PERSONAL_ENABLED: 'false' });
  const state = empty();
  state.history.push({ ...entry(), postId: sent.id, verification: 'pending' });
  state.pendingSlugs.push('engineer1');
  const original = structuredClone(state);
  let reads = 0;
  t.mock.method(console, 'log', () => {});
  t.mock.method(console, 'warn', () => {});
  t.mock.method(globalThis, 'fetch', async (url: string | URL | Request, init?: RequestInit) => {
    if (String(url).endsWith('/data/jobs-runtime.json')) return Response.json([{ slug: 'engineer1', company: 'Example', title: 'Engineer', active: true, date: new Date().toISOString(), link: 'https://careers.example.test/engineer1' }]);
    const body = JSON.parse(String(init?.body));
    assert.match(body.query, /^query LinkedInReceipt/);
    assert.deepEqual(body.variables, { id: sent.id });
    reads++;
    return Response.json({ data: { post: { ...sent, status: 'sending' } } });
  });
  await assert.rejects(main({ store: { loadState: async () => state, saveState: async () => { assert.deepEqual(state, original); } } }), /blocked.*pending or quarantined/);
  assert.equal(reads, 1);
  assert.deepEqual(state, original);
});

test('diagnostics query only explicit ledger IDs and report exact mismatches without changing receipts', async () => {
  const state = { history: [{ ...entry(), postId: sent.id, verification: 'pending' }, { ...entry(), postId: 'cv-post', account: cv.channelId, verification: 'pending' }] };
  const original = structuredClone(state);
  const h = readback([{ data: { post: { ...sent, text: text + ' changed' } } }, { data: { post: { ...sent, id: 'cv-post', channelId: cv.channelId } } }]);
  const report = JSON.parse(await inspectJobLinkedInReceipts(state, [sent.id, 'cv-post'], { env: { BUFFER_ACCESS_TOKEN: 'offline-token' }, request: h.options.request }));
  assert.equal(report.mode, 'read-only');
  assert.equal(report.results[0].assessment.reason, 'text mismatch');
  assert.equal(report.results[0].expectedText, text);
  assert.equal(report.results[0].readback.text, text + ' changed');
  assert.equal(report.results[1].assessment.verified, true);
  assert.deepEqual(h.calls.map(call => call.variables.id), [sent.id, 'cv-post']);
  assert.deepEqual(state, original);
});

test('diagnostics reject unknown, duplicate, incomplete or wrong-provider selections before any request', async () => {
  const h = readback([]), options = { env: { BUFFER_ACCESS_TOKEN: 'offline-token' }, request: h.options.request };
  const state = { history: [{ ...entry(), postId: sent.id }] };
  for (const ids of [[], [sent.id, sent.id], [sent.id, 'unknown']]) await assert.rejects(inspectJobLinkedInReceipts(state, ids, options));
  for (const changes of [{ expectedText: '' }, { account: 'other-channel' }, { platform: 'x' }, { provider: 'linkedin-direct' }]) {
    await assert.rejects(inspectJobLinkedInReceipts({ history: [{ ...state.history[0], ...changes }] }, [sent.id], options));
  }
  assert.equal(h.calls.length, 0);
});
