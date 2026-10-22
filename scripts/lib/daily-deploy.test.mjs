import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { BACKEND, assertDailyContent, claimDailyDeployment, createDeployStateStore, dailyDeploymentDue, hasDailyDeployment, recordDeploymentResult, runDailyDeployment } from './daily-deploy.mjs';

const date = '2026-10-22';
const now = Date.parse(`${date}T04:00:00Z`);
const sourceCommit = 'a'.repeat(40);
const candidate = 'c'.repeat(20);
function content(day = date) {
  return {
    catalogs: { version: 1, catalogs: { jobs: { checkedAt: `${day}T03:45:00Z`, sourceCommit: 'b'.repeat(40) } } },
    jobs: [], hasArticle: slug => slug === 'original-news',
    research: { version: 1, candidates: { [candidate]: { id: candidate, status: 'published' } }, runs: {
      [day]: { day, status: 'completed', completedAt: `${day}T03:50:00Z`, validationErrors: [], candidateIds: [candidate], baselineSlugs: [],
        discovery: { feeds: [{ ok: true }] }, outcomes: { [candidate]: { status: 'published', articleSlug: 'original-news', publishedAt: `${day}T03:50:00Z` } } },
    } },
  };
}

function harness(initial = {}) {
  const server = { state: structuredClone(initial), revision: 1, puts: [], reads: 0, onPut: undefined };
  const sha = () => server.revision.toString(16).padStart(40, '0');
  const sleeps = [];
  const store = createDeployStateStore({ token: 'offline', sleep: async ms => { sleeps.push(ms); }, request: async (url, init) => {
    assert.equal(new URL(url).origin, 'https://api.github.com');
    assert.equal(init.redirect, 'error');
    if (!init.method) {
      assert.ok(url.endsWith('?ref=main')); server.reads++;
      return Response.json({ sha: sha(), encoding: 'base64', content: Buffer.from(JSON.stringify(server.state)).toString('base64') });
    }
    assert.equal(init.method, 'PUT');
    const body = JSON.parse(init.body), next = JSON.parse(Buffer.from(body.content, 'base64').toString());
    assert.equal(body.branch, 'main'); server.puts.push(structuredClone(next));
    const override = server.onPut?.(next);
    if (override) return override;
    if (body.sha !== sha()) return Response.json({ message: 'sha does not match' }, { status: 409 });
    server.state = next; server.revision++;
    return Response.json({ content: { sha: sha() } });
  } });
  const provider = { writes: [], reads: [], build: 'READY', rollout: 'SUCCEEDED', onRequest: undefined };
  const request = async (url, init) => {
    assert.ok(url.startsWith(`https://firebaseapphosting.googleapis.com/v1beta/${BACKEND}/`));
    const body = init.body && JSON.parse(init.body);
    if (body) provider.writes.push({ url, body }); else provider.reads.push(url);
    const override = provider.onRequest?.(url, init);
    if (override) return override;
    if (body) return Response.json({ name: 'projects/web3-jobs-aggregator/locations/us-central1/operations/accepted' });
    const name = url.split('/v1beta/')[1];
    if (name.includes('/builds/')) return Response.json({ name, state: provider.build, source: { codebase: { hash: sourceCommit } }, ...(provider.build === 'FAILED' ? { error: { message: 'Build failed' } } : {}) });
    return Response.json({ name, state: provider.rollout, build: name.replace('/rollouts/', '/builds/'), ...(provider.rollout === 'FAILED' ? { error: { message: 'Rollout failed' } } : {}) });
  };
  const options = { store, date, id: '123-1', sourceCommit, content: content(), token: 'offline', request, sleep: async () => {}, now: () => now, buildPolls: 2, rolloutPolls: 2 };
  return { server, provider, store, sleeps, options, run: extra => runDailyDeployment({ ...options, ...extra }) };
}

test('daily content requires current jobs plus completed validated coverage and newly published original articles', () => {
  assert.deepEqual(assertDailyContent({ date, ...content() }, now).articleSlugs, ['original-news']);
  const invalid = [
    c => { c.catalogs.catalogs.jobs.checkedAt = '2026-10-21T03:45:00Z'; },
    c => { c.catalogs.catalogs.jobs.checkedAt = `${date}T05:00:00Z`; },
    c => { c.research.runs[date].status = 'incomplete'; },
    c => { c.research.runs[date].validationErrors = ['source unavailable']; },
    c => { c.research.runs[date].discovery.feeds = [{ ok: false }]; },
    c => { delete c.research.runs[date].outcomes[candidate]; },
    c => { c.research.runs[date].outcomes[candidate].status = 'ready'; },
    c => { c.research.runs[date].outcomes[candidate].status = 'rejected'; },
    c => { c.research.runs[date].outcomes[candidate].publishedAt = '2026-10-21T03:45:00Z'; },
    c => { c.research.runs[date].baselineSlugs.push('original-news'); },
    c => { c.hasArticle = () => false; },
  ];
  for (const change of invalid) {
    const c = content(); change(c);
    assert.throws(() => assertDailyContent({ date, ...c }, now));
  }
});

test('incomplete news causes zero claims or provider calls; completed jobs and news deploy exactly once', async () => {
  const h = harness({ slots: { morning: date }, custom: { preserve: true } });
  const incomplete = content(); incomplete.research.runs[date].status = 'incomplete';
  await assert.rejects(h.run({ content: incomplete }), /completed validated/);
  assert.equal(h.server.puts.length, 0); assert.equal(h.provider.writes.length, 0);
  const result = await h.run();
  assert.equal(result.deployed, true);
  assert.equal(h.provider.writes.length, 2);
  assert.deepEqual(h.provider.writes[0].body, { source: { codebase: { commit: sourceCommit } } });
  assert.deepEqual(h.server.state.slots, { morning: date }); assert.deepEqual(h.server.state.custom, { preserve: true });
  assert.equal(h.server.state.deployed, date);
  assert.equal(h.server.state.dailyDeployments[date][0].phase, 'succeeded');
  assert.deepEqual(h.server.state.dailyDeployments[date][0].articleSlugs, ['original-news']);
  assert.equal((await h.run({ id: '124-1' })).deployed, false);
  assert.equal(h.provider.writes.length, 2);
});

test('two previously due queued parents cannot create two successful daily rollouts', async () => {
  const h = harness();
  const firstPlan = await h.store.read(), queuedPlan = await h.store.read();
  assert.equal(dailyDeploymentDue(firstPlan.state, date, now), true);
  assert.equal(dailyDeploymentDue(queuedPlan.state, date, now), true);
  await h.run();
  assert.equal((await h.run({ id: '124-1' })).deployed, false);
  assert.equal(h.provider.writes.length, 2);
});

test('Contents CAS also prevents competing callers from both claiming a daily build', async () => {
  const h = harness();
  const results = await Promise.allSettled([
    claimDailyDeployment(h.options), claimDailyDeployment({ ...h.options, id: '124-1' }),
  ]);
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
  assert.match(results.find(result => result.status === 'rejected').reason.message, /Unconfirmed deployment/);
  assert.equal(h.server.state.dailyDeployments[date].length, 1);
});

test('October 22’s existing deployed stamp blocks all recovery overrides without changing receipts', async () => {
  const state = { deployed: date, ingested: date, news: '2026-10-21' };
  const h = harness({ ...state, newsDeployPending: true });
  assert.equal((await h.run()).deployed, false);
  assert.equal(h.provider.writes.length, 0); assert.equal(h.server.puts.length, 0);
});

test('live verification failure cannot erase successful rollout acknowledgement or permit a repeat', async () => {
  const h = harness();
  await assert.rejects(async () => { await h.run(); throw new Error('Live catalog verification failed'); }, /Live catalog/);
  assert.equal(h.server.state.deployed, date);
  assert.equal((await h.run({ id: '124-1' })).deployed, false);
  assert.equal(h.provider.writes.length, 2);
});

test('optional evidence writing fails visibly after success is durably acknowledged', async () => {
  const h = harness();
  await assert.rejects(h.run({ evidence: async (name, resource) => { if (name === 'rollout' && resource.state === 'SUCCEEDED') throw new Error('Artifact disk full'); } }), /Artifact disk full/);
  assert.equal(h.server.state.deployed, date);
  assert.equal((await h.run({ id: '124-1' })).deployed, false);
});

for (const kind of ['build', 'rollout']) test(`a confirmed ${kind} failure remains recorded and permits a fresh attempt`, async () => {
  const h = harness(); h.provider[kind] = 'FAILED';
  await assert.rejects(h.run(), /confirmed failure remains retryable/);
  assert.equal(h.server.state.dailyDeployments[date][0].phase, `${kind}-failed`);
  assert.equal(h.server.state.deployed, undefined);
  h.provider[kind] = kind === 'build' ? 'READY' : 'SUCCEEDED';
  await h.run({ id: '123-2' });
  assert.deepEqual(h.server.state.dailyDeployments[date].map(attempt => attempt.phase), [`${kind}-failed`, 'succeeded']);
  assert.equal(h.server.state.deployed, date);
});

for (const kind of ['build', 'rollout']) test(`unknown ${kind} results survive retries and block another provider creation`, async () => {
  const h = harness(); h.provider[kind] = kind === 'build' ? 'BUILDING' : 'PROGRESSING';
  await assert.rejects(h.run(), /result unknown/);
  const before = structuredClone(h.server.state), writes = h.provider.writes.length;
  await assert.rejects(h.run({ id: '124-1' }), /Unconfirmed deployment/);
  assert.deepEqual(h.server.state, before); assert.equal(h.provider.writes.length, writes);
  assert.throws(() => dailyDeploymentDue(before, '2026-10-23', Date.parse('2026-10-23T04:00:00Z')), /Unconfirmed deployment/);
});

test('lost provider create response retains its claim instead of retrying a second build', async () => {
  const h = harness();
  h.provider.onRequest = (_url, init) => { if (init.method === 'POST') throw new Error('Connection lost'); };
  await assert.rejects(h.run(), /Connection lost/);
  assert.equal(h.server.state.dailyDeployments[date][0].phase, 'building');
  await assert.rejects(h.run({ id: '124-1' }), /Unconfirmed deployment/);
  assert.equal(h.provider.writes.length, 1);
});

for (const accepted of [false, true]) test(`lost success acknowledgement with accepted=${accepted} never permits a blind second rollout`, async () => {
  const h = harness();
  const observed = [];
  h.server.onPut = next => {
    if (next.dailyDeployments?.[date]?.[0].phase !== 'succeeded') return;
    if (accepted) { h.server.state = structuredClone(next); h.server.revision++; }
    throw new Error('Contents response lost');
  };
  await assert.rejects(h.run({ evidence: async (kind, resource) => { observed.push({ kind, resource }); } }), /Contents response lost/);
  assert.ok(observed.some(({ kind, resource }) => kind === 'rollout' && resource.state === 'SUCCEEDED'));
  if (accepted) assert.equal((await h.run({ id: '124-1' })).deployed, false);
  else await assert.rejects(h.run({ id: '124-1' }), /Unconfirmed deployment/);
  assert.equal(h.provider.writes.length, 2);
});

test('CAS retries merge the success marker with fresh unrelated state instead of overwriting it', async () => {
  const h = harness(); let races = 0;
  h.server.onPut = next => {
    if (next.dailyDeployments?.[date]?.[0].phase === 'succeeded' && races++ < 4) {
      h.server.state.slots = { afternoon: date, concurrent: races };
      h.server.state.news = date; h.server.revision++;
      return Response.json({ message: 'sha does not match' }, { status: 409 });
    }
  };
  await h.run();
  assert.deepEqual(h.server.state.slots, { afternoon: date, concurrent: 4 });
  assert.equal(h.server.state.news, date); assert.equal(h.server.state.deployed, date);
  assert.deepEqual(h.sleeps, [250, 500, 1000, 2000]);
  assert.equal(h.provider.writes.length, 2);
});

test('claim persistence failure prevents provider mutations and does not treat auth errors as CAS races', async () => {
  for (const status of [401, 403, 422, 500]) {
    const h = harness(); h.server.onPut = () => Response.json({ message: 'Denied' }, { status });
    await assert.rejects(h.run(), /Cannot persist/);
    assert.equal(h.provider.writes.length, 0); assert.equal(h.server.puts.length, 1); assert.equal(h.sleeps.length, 0);
  }
});

test('ready-build and rollout proof must identify the exact reserved revision and resources', async () => {
  for (const changed of ['name', 'source']) {
    const h = harness();
    const claim = await claimDailyDeployment(h.options);
    const resource = { name: `${BACKEND}/builds/${claim.buildId}`, state: 'READY', source: { codebase: { hash: sourceCommit } } };
    if (changed === 'name') resource.name += '-other'; else resource.source.codebase.hash = 'b'.repeat(40);
    await assert.rejects(recordDeploymentResult({ store: h.store, claim, resource, kind: 'build', now: () => now }), /identity|revision/);
    assert.equal(h.server.state.dailyDeployments[date][0].phase, 'building');
  }
  const h = harness(); await h.run();
  const claim = h.server.state.dailyDeployments[date][0];
  await assert.rejects(recordDeploymentResult({ store: h.store, claim, resource: { name: `${BACKEND}/rollouts/${claim.rolloutId}`, build: `${BACKEND}/builds/other`, state: 'SUCCEEDED' }, kind: 'rollout' }), /identity/);
  assert.equal(hasDailyDeployment(h.server.state, date), true);
});

test('a next-day rollout requires both a new jobs refresh and a new completed original-news batch', async () => {
  const h = harness(); await h.run();
  const next = '2026-10-23', later = Date.parse(`${next}T04:00:00Z`);
  await assert.rejects(h.run({ date: next, now: () => later, id: '125-1' }), /today’s published jobs/);
  const fresh = content(next); fresh.research = content().research;
  await assert.rejects(h.run({ date: next, now: () => later, id: '125-1', content: fresh }), /completed validated news/);
  await h.run({ date: next, now: () => later, id: '125-1', content: content(next) });
  assert.equal(h.server.state.deployed, next); assert.equal(h.provider.writes.length, 4);
});

test('a build crossing UTC midnight cannot start yesterday’s rollout', async () => {
  const h = harness(); let clock = now;
  h.provider.onRequest = (url, init) => { if (init.method === 'GET' && url.includes('/builds/')) clock = Date.parse('2026-10-23T00:00:00Z'); };
  await assert.rejects(h.run({ now: () => clock }), /no longer today/);
  assert.equal(h.provider.writes.length, 1); assert.equal(h.server.state.deployed, undefined);
});

test('a started rollout confirmed after midnight consumes both its requested and confirmation day', async () => {
  const h = harness(); let clock = now;
  h.provider.onRequest = (url, init) => { if (init.method === 'GET' && url.includes('/rollouts/')) clock = Date.parse('2026-10-23T00:01:00Z'); };
  await h.run({ now: () => clock });
  assert.equal(h.server.state.deployed, '2026-10-23');
  assert.equal(hasDailyDeployment(h.server.state, date), true);
  assert.equal((await h.run({ date: '2026-10-23', id: '125-1', now: () => clock, content: content('2026-10-23') })).deployed, false);
  assert.equal(h.provider.writes.length, 2);
});

test('automatic empty-date calls cannot fall through to the explicit operator entry', () => {
  const base = { ...process.env, GITHUB_ACTIONS: 'true', GITHUB_OUTPUT: '', GITHUB_ENV: '', DAILY_DEPLOY_DATE: '', GITHUB_TOKEN: '' };
  for (const [event, workflow, success] of [
    ['workflow_dispatch', 'FAH fix secrets and deploy', true],
    ['workflow_dispatch', 'Publish Jobs, Events & Social', false],
    ['schedule', 'FAH fix secrets and deploy', false],
  ]) {
    const result = spawnSync(process.execPath, ['scripts/daily-deploy.mjs', 'plan'], { encoding: 'utf8', env: { ...base, GITHUB_EVENT_NAME: event, GITHUB_WORKFLOW: workflow } });
    assert.equal(result.status, success ? 0 : 1, result.stderr);
    if (!success) assert.match(result.stderr, /explicit date/);
  }
});
