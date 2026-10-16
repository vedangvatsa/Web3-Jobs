import test, {type TestContext} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {createSocialStateStore, deliverSocialPost, mergeSocialStates, validateSocialState, SocialStateError, type SocialState, type SocialHistoryEntry} from './job-social-state';
import {main, postToThreads, verifyLinkedInBuffer} from './post-job-openings';

const empty = (): SocialState => ({lastIndex: 0, postedSlugs: [], pendingSlugs: [], history: []});
const snapshot = () => ({slug: 'engineer1', id: 'original-id', company: 'Example', title: 'Engineer', link: 'https://careers.example.com/roles/engineer1', date: new Date(Date.now() - 86400000).toISOString(), dateVerified: true, active: true});
function entry(fields: Partial<SocialHistoryEntry> = {}): SocialHistoryEntry {
  const job = snapshot();
  return {slug: job.slug, company: job.company, title: job.title, postedAt: '2026-10-16T04:20:55Z', platform: 'x',
    expectedText: 'Example is hiring Engineer\n\nhttps://hashtagweb3.com/engineer1/x?og=7', snapshot: job,
    payload: {text: 'Original post text', url: 'https://hashtagweb3.com/engineer1/x?og=7'}, ...fields};
}
const conflict = () => Response.json({message: 'Conflict'}, {status: 409});

class ContentsServer {
  state: SocialState;
  revision = 1;
  gets = 0;
  puts: SocialState[] = [];
  onPut?: (state: SocialState, attempt: number) => Response | undefined;
  onGet?: () => Response | undefined;
  constructor(state: SocialState) {this.state = structuredClone(state);}
  change(state: SocialState) {this.state = structuredClone(state); this.revision++;}
  response() {return Response.json({sha: `sha-${this.revision}`, content: Buffer.from(JSON.stringify(this.state)).toString('base64'), encoding: 'base64'});}
  request: typeof fetch = async (url, init) => {
    const target = new URL(String(url));
    assert.equal(target.origin + target.pathname, 'https://api.github.com/repos/vedangvatsa/Web3-Jobs/contents/scripts/social/jobs-social-posted.json');
    if (init?.method === 'GET') {assert.equal(target.search, '?ref=main'); this.gets++; return this.onGet?.() || this.response();}
    assert.equal(init?.method, 'PUT');
    const body = JSON.parse(String(init.body));
    assert.equal(body.branch, 'main');
    const state = JSON.parse(Buffer.from(body.content, 'base64').toString()); validateSocialState(state);
    this.puts.push(state);
    const override = this.onPut?.(state, this.puts.length);
    if (override) return override;
    if (body.sha !== `sha-${this.revision}`) return conflict();
    this.change(state);
    return Response.json({content: {sha: `sha-${this.revision}`}});
  };
}

async function harness(t: TestContext, server = new ContentsServer(empty()), disk = server.state) {
  const directory = await fs.mkdtemp(join(tmpdir(), 'job-social-state-'));
  t.after(() => fs.rm(directory, {recursive: true, force: true}));
  const file = join(directory, 'ledger.json');
  await fs.writeFile(file, JSON.stringify(disk));
  const sleeps: number[] = [];
  const options = {file, token: 'offline', request: server.request, sleep: async (ms: number) => {sleeps.push(ms);}};
  const store = createSocialStateStore(options);
  const state = await store.loadState(true);
  const read = async () => JSON.parse(await fs.readFile(file, 'utf8')) as SocialState;
  const journal = async () => (await fs.readFile(join(directory, 'ledger.recovery.jsonl'), 'utf8')).trim().split('\n').map(line => JSON.parse(line).state as SocialState);
  return {store, server, state, file, directory, sleeps, options, read, journal};
}

test('historical receipts validate and malformed or invented verified receipts fail closed', async () => {
  const state = JSON.parse(await fs.readFile(new URL('./jobs-social-posted.json', import.meta.url), 'utf8'));
  validateSocialState(state);
  assert.deepEqual(mergeSocialStates(state, state), state);
  for (const bad of [null, {...empty(), history: {}}, {...empty(), history: [entry({verification: 'verified'})]},
    {...empty(), history: [entry({verification: 'verified', postId: 'unknown'})]}]) assert.throws(() => validateSocialState(bad), /Invalid social ledger/);
});

test('four branch conflicts preserve the original payload and perform exactly one provider POST', async t => {
  const h = await harness(t);
  let conflicts = 0, creates = 0;
  h.server.onPut = state => state.history[0]?.postId && conflicts++ < 4 ? conflict() : undefined;
  const original = entry();
  const options = {state: h.state, entry: original, save: () => h.store.saveState(h.state), beforeSend: async () => {},
    send: async () => {creates++; return 'accepted-id';}, verify: async () => ({permalink: 'https://twitter.com/hashtag_web3/status/123'})};
  await deliverSocialPost(options);
  await deliverSocialPost(options);
  assert.equal(creates, 1);
  assert.deepEqual(h.sleeps, [250, 500, 1000, 2000]);
  assert.deepEqual(h.server.state.history[0].snapshot, original.snapshot);
  assert.deepEqual(h.server.state.history[0].payload, original.payload);
  assert.equal(h.server.state.history[0].verification, 'verified');
});

test('same-file concurrent deliveries and acknowledged receipts survive stale remote reads and caller deletions', async t => {
  const h = await harness(t);
  const first = entry({verification: 'verified', postId: 'first'});
  h.state.history.push(first);
  await h.store.saveState(h.state);
  h.state.history.length = 0;
  const concurrent = empty(); concurrent.history.push(entry({platform: 'facebook', postId: 'other', verification: 'verified'}));
  h.server.change(concurrent);
  await h.store.saveState(h.state);
  assert.equal(h.state.history.length, 2);
  assert.equal(h.server.state.history.find(receipt => receipt.platform === 'x')?.postId, 'first');
  assert.equal(h.server.state.history.find(receipt => receipt.platform === 'facebook')?.postId, 'other');
  const reference = h.state.history[0];
  h.state.history[0].permalink = 'https://twitter.com/hashtag_web3/status/123';
  await h.store.saveState(h.state);
  assert.equal(h.state.history[0], reference);
});

test('receipt ID, text, payload and original source date conflicts retain both sides and never overwrite', async t => {
  for (const change of [{postId: 'different'}, {expectedText: 'changed'}, {snapshot: {...snapshot(), date: '2026-10-01T00:00:00Z'}}, {payload: {url: 'https://example.com/different'}}]) {
    const initial = empty(); initial.history.push(entry({postId: 'real', verification: 'pending'}));
    const h = await harness(t, new ContentsServer(initial));
    const remote = structuredClone(initial); Object.assign(remote.history[0], change);
    h.server.change(remote);
    await assert.rejects(h.store.saveState(h.state), /conflict/);
    assert.equal(h.server.puts.length, 1);
    assert.deepEqual((await h.read()).history, initial.history);
    assert.ok((await h.journal()).some(state => JSON.stringify(state.history) === JSON.stringify(remote.history)));
  }
});

test('CAS attempts are bounded at eight; local accepted receipts survive exhaustion and prevent restart POSTs', async t => {
  const h = await harness(t);
  let creates = 0;
  h.server.onPut = state => state.history[0]?.postId ? conflict() : undefined;
  await assert.rejects(deliverSocialPost({state: h.state, entry: entry(), save: () => h.store.saveState(h.state), beforeSend: async () => {},
    send: async () => {creates++; return 'accepted';}}), SocialStateError);
  assert.equal(h.server.puts.length, 9);
  assert.equal(h.sleeps.length, 7);
  assert.equal((await h.read()).history[0].postId, 'accepted');
  assert.ok((await h.journal()).some(state => state.history[0]?.postId === 'accepted'));
  const store = createSocialStateStore(h.options), state = await store.loadState(true);
  await deliverSocialPost({state, entry: entry(), save: () => store.saveState(state), beforeSend: async () => {}, send: async () => {creates++; return 'duplicate';}});
  assert.equal(creates, 1);
  // A clean runner has the durable pre-send claim even when its artifact is not restored.
  const clean = await harness(t, h.server);
  await assert.rejects(deliverSocialPost({state: clean.state, entry: entry(), save: () => clean.store.saveState(clean.state), beforeSend: async () => {}, send: async () => {creates++; return 'duplicate';}}), /read-only reconciliation/);
  assert.equal(creates, 1);
});

test('only known CAS 409/422 responses retry; auth, validation, policy and lost responses stop', async t => {
  const h = await harness(t);
  h.server.onPut = (_state, attempt) => attempt === 1 ? Response.json({message: 'sha does not match current blob'}, {status: 422}) : undefined;
  await h.store.saveState(h.state);
  assert.equal(h.server.puts.length, 2);
  for (const [status, message] of [[422, 'Validation Failed'], [422, 'sha was not supplied'], [401, 'Bad credentials'], [403, 'Forbidden'], [409, 'Repository policy prevents update'], [500, 'Server error']] as const) {
    const h = await harness(t);
    h.state.history.push(entry({postId: 'retained', verification: 'pending'}));
    h.server.onPut = () => Response.json({message}, {status});
    await assert.rejects(h.store.saveState(h.state), new RegExp(`HTTP ${status}`));
    assert.equal(h.server.puts.length, 1); assert.equal(h.sleeps.length, 0);
    assert.equal((await h.read()).history[0].postId, 'retained');
  }
  const lost = await harness(t);
  lost.server.onPut = saved => {lost.server.change(saved); throw new TypeError('response lost');};
  await assert.rejects(lost.store.saveState(lost.state), /response lost/);
  assert.equal(lost.server.puts.length, 1);
});

test('an immutable ledger larger than the Contents inline limit is read by its exact blob SHA', async t => {
  const h = await harness(t);
  const sha = 'a'.repeat(40), requests: string[] = [];
  const store = createSocialStateStore({...h.options, request: async (url, init) => {
    assert.equal(init?.method, 'GET');
    requests.push(String(url));
    if (requests.length === 1) return Response.json({sha, encoding: 'none', content: ''});
    assert.ok(String(url).endsWith(`/git/blobs/${sha}`));
    return Response.json({sha, encoding: 'base64', content: Buffer.from(JSON.stringify(empty())).toString('base64')});
  }});
  assert.deepEqual(await store.loadState(true), empty());
  assert.equal(requests.length, 2);
});

test('malformed refreshed state and failed refreshes retain local IDs and the original conflict', async t => {
  for (const invalid of [false, true]) {
    const h = await harness(t);
    h.state.history.push(entry({postId: 'accepted', verification: 'pending'}));
    h.server.onPut = conflict;
    h.server.onGet = () => invalid
      ? Response.json({sha: 'bad', encoding: 'base64', content: Buffer.from('{"history":{}}').toString('base64')})
      : Response.json({message: 'Forbidden'}, {status: 403});
    await assert.rejects(h.store.saveState(h.state), error => {
      assert.ok(error instanceof SocialStateError && error.cause instanceof AggregateError);
      assert.match(String(error.cause.errors[0]), /HTTP 409/);
      assert.match(String(error.cause.errors[1]), invalid ? /Invalid social ledger/ : /HTTP 403/);
      return true;
    });
    assert.equal(h.server.puts.length, 1);
    assert.equal((await h.read()).history[0].postId, 'accepted');
  }
});

test('competing creation claims and ambiguous provider responses cannot produce another POST', async t => {
  const first = await harness(t), second = await harness(t, first.server);
  let creates = 0;
  await deliverSocialPost({state: first.state, entry: entry(), save: () => first.store.saveState(first.state), beforeSend: async () => {}, send: async () => {creates++; return 'one';}});
  await assert.rejects(deliverSocialPost({state: second.state, entry: entry(), save: () => second.store.saveState(second.state), beforeSend: async () => {}, send: async () => {creates++; return 'two';}}), /competing creation/);
  assert.equal(creates, 1);
  const h = await harness(t);
  const options = {state: h.state, entry: entry(), save: () => h.store.saveState(h.state), beforeSend: async () => {}, send: async () => {creates++; throw new Error('provider response lost');}};
  await assert.rejects(deliverSocialPost(options), /provider response lost/);
  await assert.rejects(deliverSocialPost(options), /read-only reconciliation/);
  assert.equal(creates, 2);
  assert.equal(h.server.state.history[0].verification, 'creating');
});

test('receipt upgrades are monotonic and source snapshots never refresh original dates', () => {
  const a = empty(); a.history.push(entry({postId: 'one', verification: 'verified'})); a.postedSlugs.push('engineer1');
  const b = structuredClone(a); b.history[0].verification = 'pending'; b.pendingSlugs.push('engineer1'); b.postedSlugs = [];
  assert.equal(mergeSocialStates(b, a).history[0].verification, 'verified');
  const c = structuredClone(b); c.history[0].snapshot!.date = new Date().toISOString();
  assert.throws(() => mergeSocialStates(a, c), /snapshot/);
});

test('broken journal still retains the receipt file; failed rename retains journal evidence', async t => {
  for (const broken of ['journal', 'ledger']) {
    const h = await harness(t);
    const file = broken === 'journal' ? join(h.directory, 'ledger.recovery.jsonl') : h.file;
    await fs.unlink(file); await fs.mkdir(file);
    h.state.history.push(entry({postId: 'accepted', verification: 'pending'}));
    await assert.rejects(h.store.saveState(h.state), /checkpoint failed|journal failed/);
    assert.equal(h.server.puts.length, 0);
    if (broken === 'journal') assert.equal((await h.read()).history[0].postId, 'accepted');
    else assert.ok((await h.journal()).some(state => state.history[0]?.postId === 'accepted'));
  }
});

test('Threads checkpoints its container before media_publish; checkpoint failure stops publication', async t => {
  const previous = {...process.env}; t.after(() => {process.env = previous;});
  Object.assign(process.env, {THREADS_ACCESS_TOKEN: 'offline', THREADS_USER_ID: 'threads-id'});
  const writes: string[] = [];
  t.mock.method(globalThis, 'fetch', async (url: string | URL | Request, init?: RequestInit) => {
    if (!init?.method) return Response.json({id: 'threads-id', username: 'hashtagweb3'});
    writes.push(String(url)); return Response.json({id: 'container'});
  });
  await assert.rejects(postToThreads('text', 'https://hashtagweb3.com/engineer1/th?og=7', async () => {}, async fields => {
    assert.equal(fields.containerId, 'container'); throw new SocialStateError('checkpoint failed');
  }), /checkpoint failed/);
  assert.equal(writes.length, 1);
  assert.ok(writes[0].endsWith('/threads'));
});

test('LinkedIn verification requires sent status plus exact channel, text and permalink', async t => {
  const target = {channelId: 'channel', name: 'hashtagweb3', label: '#Web3'};
  const post = {id: 'buffer', channelId: target.channelId, channelService: 'linkedin', text: 'original', status: 'sent', externalLink: 'https://www.linkedin.com/feed/update/urn:li:share:123'};
  let actual = post;
  t.mock.method(globalThis, 'fetch', async (_url: string | URL | Request, init?: RequestInit) => {
    assert.doesNotMatch(JSON.parse(String(init?.body)).query, /mutation/);
    return Response.json({data: {post: actual}});
  });
  assert.equal((await verifyLinkedInBuffer(target, 'buffer', 'original')).permalink, post.externalLink);
  for (const changed of [{status: 'scheduled'}, {channelId: 'other'}, {text: 'different'}, {externalLink: 'https://example.com/123'}]) {
    actual = {...post, ...changed}; await assert.rejects(verifyLinkedInBuffer(target, 'buffer', 'original'), /remains pending/);
  }
});

test('the real CLI path stops the entire batch on receipt persistence failure', async t => {
  const h = await harness(t);
  const argv = process.argv, env = {...process.env};
  t.after(() => {process.argv = argv; process.env = env;});
  process.argv = ['node', 'poster', '--platform', 'all', '--slug', 'engineer1'];
  Object.assign(process.env, {BUFFER_ACCESS_TOKEN: 'offline'}); delete process.env.GITHUB_TOKEN;
  const job = snapshot(); let mutations = 0;
  t.mock.method(console, 'log', () => {});
  t.mock.method(globalThis, 'fetch', async (url: string | URL | Request, init?: RequestInit) => {
    const address = String(url);
    if (address.endsWith('/data/jobs-runtime.json')) return Response.json([job]);
    if (address === job.link) return new Response('<html><h1>Engineer at Example</h1><a href="apply">Apply now</a></html>', {headers: {'content-type': 'text/html'}});
    if (address.includes('/og/jobs/')) return new Response(new Uint8Array(1500), {headers: {'content-type': 'image/png'}});
    if (address.startsWith('https://hashtagweb3.com/engineer1/')) return new Response('<meta property="og:title" content="Engineer at Example"><meta property="og:image" content="https://hashtagweb3.com/og/jobs/engineer1.png?v=7">');
    if (address === 'https://api.buffer.com/graphql') {
      const body = JSON.parse(String(init?.body));
      if (body.query.includes('XChannel')) return Response.json({data: {channel: {id: '6ab62682ea19ca0bdee284bd', name: 'hashtag_web3', service: 'twitter'}}});
      if (body.query.includes('mutation')) {mutations++; return Response.json({data: {createPost: {post: {id: 'accepted'}}}});}
    }
    throw new Error(`Unexpected outbound request: ${address}`);
  });
  h.server.onPut = state => state.history[0]?.postId ? conflict() : undefined;
  await assert.rejects(main({store: h.store}), SocialStateError);
  assert.equal(mutations, 1);
  assert.equal((await h.read()).history[0].postId, 'accepted');
});

test('workflow uploads ledger, journal and interrupted atomic writes even after failed persistence', async () => {
  const workflow = await fs.readFile(new URL('../../.github/workflows/post-job-openings-social.yml', import.meta.url), 'utf8');
  assert.match(workflow, /name: Preserve social receipt checkpoints\n\s+id: receipts\n\s+if: \$\{\{ always\(\) \}\}\n\s+uses: actions\/upload-artifact@v4/);
  assert.match(workflow, /jobs-social-posted\.recovery\.jsonl/);
  assert.match(workflow, /jobs-social-posted\.json\.\*\.tmp/);
  assert.ok(workflow.indexOf('uses: actions/upload-artifact') < workflow.indexOf('name: Fail incomplete'));
  assert.doesNotMatch(workflow, /git (?:pull|push|rebase|reset)/);
});

test('isolated Git branch contention retains concurrent Telegram trees through five CAS attempts', async t => {
  const directory = await fs.mkdtemp(join(tmpdir(), 'social-git-cas-'));
  t.after(() => fs.rm(directory, {recursive: true, force: true}));
  const env = {...process.env, GIT_AUTHOR_NAME: 'fixture', GIT_AUTHOR_EMAIL: 'fixture@example.test', GIT_COMMITTER_NAME: 'fixture', GIT_COMMITTER_EMAIL: 'fixture@example.test'};
  const git = (args: string[], input?: string) => execFileSync('git', args, {cwd: directory, env, input, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe']}).trim();
  git(['init', '--bare']);
  const blob = (text: string) => git(['hash-object', '-w', '--stdin'], text);
  const makeCommit = (ledger: SocialState, telegram: string, parent?: string) => {
    const tree = git(['mktree'], `100644 blob ${blob(JSON.stringify(ledger))}\tledger.json\n100644 blob ${blob(telegram)}\ttelegram.json\n`);
    return git(['commit-tree', tree, ...(parent ? ['-p', parent] : []), '-m', 'fixture']);
  };
  git(['update-ref', 'refs/heads/main', makeCommit(empty(), '0')]);
  let attempts = 0;
  const server = new ContentsServer(empty());
  server.request = async (_url, init) => {
    const head = git(['rev-parse', 'refs/heads/main']);
    const sha = git(['rev-parse', `${head}:ledger.json`]);
    if (init?.method === 'GET') return Response.json({sha, encoding: 'base64', content: Buffer.from(git(['show', `${head}:ledger.json`])).toString('base64')});
    const body = JSON.parse(String(init?.body));
    const ledger = JSON.parse(Buffer.from(body.content, 'base64').toString());
    assert.equal(body.sha, sha);
    const commit = makeCommit(ledger, git(['show', `${head}:telegram.json`]), head);
    if (++attempts <= 4) git(['update-ref', 'refs/heads/main', makeCommit(JSON.parse(git(['show', `${head}:ledger.json`])), String(attempts), head), head]);
    try {git(['update-ref', 'refs/heads/main', commit, head]);} catch {return conflict();}
    return Response.json({content: {sha: git(['rev-parse', `${commit}:ledger.json`])}});
  };
  const h = await harness(t, server);
  h.state.history.push(entry({postId: 'immutable-receipt', verification: 'verified'}));
  await h.store.saveState(h.state);
  assert.equal(attempts, 5);
  assert.equal(git(['show', 'refs/heads/main:telegram.json']), '4');
  assert.equal(JSON.parse(git(['show', 'refs/heads/main:ledger.json'])).history[0].postId, 'immutable-receipt');
});
