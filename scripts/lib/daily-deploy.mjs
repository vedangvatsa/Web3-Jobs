import { setTimeout as delay } from 'node:timers/promises';
import { validateResearchPublication } from './news-publication-state.mjs';

export const DEPLOY_STATE_PATH = 'scripts/social/publish-slot-state.json';
export const BACKEND = 'projects/web3-jobs-aggregator/locations/us-central1/backends/studio';
const object = value => value && typeof value === 'object' && !Array.isArray(value);
const timestamp = value => typeof value === 'string' && Number.isFinite(Date.parse(value));
const phases = new Set(['building', 'rolling-out', 'build-failed', 'rollout-failed', 'succeeded']);
const active = attempt => ['building', 'rolling-out'].includes(attempt.phase);
const normalizeResource = name => String(name).replace(/^projects\/227783834156\//, 'projects/web3-jobs-aggregator/');

export function assertDeployDate(date, now) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '') || !Number.isFinite(Date.parse(`${date}T00:00:00Z`))
    || new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) !== date) throw new Error('Invalid daily deployment date');
  if (now !== undefined && new Date(now).toISOString().slice(0, 10) !== date) throw new Error('Daily deployment date is no longer today; a new jobs/news batch is required');
}

export function validateDeployState(state) {
  if (!object(state) || (state.dailyDeployments !== undefined && !object(state.dailyDeployments))) throw new Error('Invalid daily deployment state');
  if (state.deployed !== undefined) assertDeployDate(state.deployed);
  for (const [date, attempts] of Object.entries(state.dailyDeployments || {})) {
    assertDeployDate(date);
    if (!Array.isArray(attempts) || !attempts.length) throw new Error('Invalid deployment attempts');
    const ids = new Set();
    for (const attempt of attempts) {
      if (!object(attempt) || attempt.date !== date || !/^\d+-\d+$/.test(attempt.id) || ids.has(attempt.id)
        || !/^[a-f0-9]{40}$/.test(attempt.sourceCommit) || !phases.has(attempt.phase) || !timestamp(attempt.startedAt)
        || !/^[a-z][a-z0-9-]{0,62}$/.test(attempt.buildId) || !/^[a-z][a-z0-9-]{0,62}$/.test(attempt.rolloutId)
        || (attempt.phase === 'succeeded' && !timestamp(attempt.confirmedAt))) throw new Error('Invalid deployment receipt');
      ids.add(attempt.id);
    }
  }
  return state;
}

export function hasDailyDeployment(state, date) {
  validateDeployState(state);
  return (state.deployed !== undefined && state.deployed >= date)
    || Object.values(state.dailyDeployments || {}).flat().some(attempt => attempt.phase === 'succeeded'
      && (attempt.date === date || attempt.confirmedAt.slice(0, 10) === date));
}

export function dailyDeploymentDue(state, date, now = Date.now()) {
  assertDeployDate(date, now);
  if (hasDailyDeployment(state, date)) return false;
  const pending = Object.values(state.dailyDeployments || {}).flat().find(active);
  if (pending) throw new Error(`Unconfirmed deployment ${pending.date}/${pending.id} (${pending.phase}); inspect build ${pending.buildId} and rollout ${pending.rolloutId} before retrying`);
  return true;
}

export function assertDailyContent({ date, catalogs, research, jobs, hasArticle }, now = Date.now()) {
  assertDeployDate(date, now);
  const sameDay = value => timestamp(value) && new Date(value).toISOString().slice(0, 10) === date && Date.parse(value) <= now;
  const refreshed = catalogs?.catalogs?.jobs;
  if (catalogs?.version !== 1 || !sameDay(refreshed?.checkedAt) || !/^[a-f0-9]{40}$/.test(refreshed?.sourceCommit || '') || !Array.isArray(jobs)) {
    throw new Error('Daily deployment requires today’s published jobs catalogue');
  }
  const run = research?.runs?.[date];
  if (research?.version !== 1 || run?.day !== date
    || !Array.isArray(run.validationErrors) || run.validationErrors.length || !run.discovery?.feeds?.some(feed => feed.ok === true)
    || !Array.isArray(run.candidateIds) || !run.candidateIds.length || new Set(run.candidateIds).size !== run.candidateIds.length
    || !object(run.outcomes) || !Array.isArray(run.baselineSlugs)) throw new Error('Daily deployment requires today’s completed validated news research');
  const publication = validateResearchPublication(research, date);
  if (publication ? !sameDay(publication.completedAt) : run.status !== 'completed' || !sameDay(run.completedAt)) {
    throw new Error('Daily deployment requires today’s completed validated news publication');
  }
  const slugs = [];
  for (const id of run.candidateIds) {
    const outcome = run.outcomes[id];
    const candidate = research.candidates?.[id];
    if (!candidate || (!outcome && !publication) || (outcome && !['published', 'rejected', 'deferred'].includes(outcome.status))) throw new Error('Daily news research still has unpublished or unreviewed candidates');
    if (!outcome) continue;
    if (outcome.status !== 'published') continue;
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)?$/.test(outcome.articleSlug || '') || !sameDay(outcome.publishedAt)
      || run.baselineSlugs.includes(outcome.articleSlug) || !hasArticle(outcome.articleSlug)
      || (publication && (candidate.id !== id || candidate.status !== 'published' || candidate.articleSlug !== outcome.articleSlug
        || candidate.publishedAt !== outcome.publishedAt))) throw new Error('Published daily news article is missing or not new');
    slugs.push(outcome.articleSlug);
  }
  if (!slugs.length || new Set(slugs).size !== slugs.length) throw new Error('Daily deployment requires a nonempty original-news batch');
  return { jobsCheckedAt: refreshed.checkedAt, newsCompletedAt: publication?.completedAt || run.completedAt, articleSlugs: slugs };
}

export function createDeployStateStore({ token, repository = 'vedangvatsa/Web3-Jobs', request = fetch, sleep = delay }) {
  if (!token || !/^[\w.-]+\/[\w.-]+$/.test(repository)) throw new Error('GitHub deployment state authorization is required');
  const endpoint = `https://api.github.com/repos/${repository}/contents/${DEPLOY_STATE_PATH}`;
  async function read() {
    const response = await request(`${endpoint}?ref=main`, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.object+json', 'Cache-Control': 'no-cache' }, redirect: 'error', signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw new Error(`Cannot read daily deployment state: HTTP ${response.status}`);
    const body = await response.json();
    if (!/^[a-f0-9]{40}$/.test(body.sha || '') || body.encoding !== 'base64' || typeof body.content !== 'string') throw new Error('Invalid deployment Contents response');
    return { sha: body.sha, state: validateDeployState(JSON.parse(Buffer.from(body.content, 'base64').toString())) };
  }
  async function update(change) {
    for (let attempt = 0; attempt < 8; attempt++) {
      const { sha, state } = await read();
      const next = change(structuredClone(state));
      if (!next) return state;
      validateDeployState(next);
      const response = await request(endpoint, {
        method: 'PUT', redirect: 'error', signal: AbortSignal.timeout(30000),
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ branch: 'main', sha, message: 'chore: record daily deployment evidence [skip ci]', content: Buffer.from(JSON.stringify(next, null, 2) + '\n').toString('base64') }),
      });
      if (response.ok) {
        const body = await response.json();
        if (!/^[a-f0-9]{40}$/.test(body.content?.sha || '')) throw new Error('Daily deployment state write has no acknowledgement');
        return next;
      }
      const detail = await response.json().catch(() => ({}));
      const conflict = [409, 422].includes(response.status) && /^(?:Conflict\.?$)|sha.*does not match|is at [a-f0-9]+ but expected|not a fast forward|reference update failed/i.test(detail.message || '');
      if (!conflict || attempt === 7) throw new Error(`Cannot persist daily deployment evidence: HTTP ${response.status}`);
      await sleep(Math.min(250 * 2 ** attempt, 4000));
    }
    throw new Error('Daily deployment state contention exhausted');
  }
  return { read, update };
}

export async function claimDailyDeployment({ store, date, id, sourceCommit, content, now = Date.now }) {
  if (!/^\d+-\d+$/.test(id) || !/^[a-f0-9]{40}$/.test(sourceCommit || '')) throw new Error('Invalid deployment run or source revision');
  let claim;
  await store.update(state => {
    claim = undefined;
    if (!dailyDeploymentDue(state, date, now())) return null;
    const evidence = assertDailyContent({ ...content, date }, now());
    if (state.dailyDeployments?.[date]?.some(attempt => attempt.id === id)) throw new Error('Deployment attempt ID already used; do not repeat provider creates');
    claim = { date, id, sourceCommit, ...evidence, phase: 'building', startedAt: new Date(now()).toISOString(),
      buildId: `daily-${date.replaceAll('-', '')}-${id}`, rolloutId: `daily-${date.replaceAll('-', '')}-${id}` };
    state.dailyDeployments ||= {};
    (state.dailyDeployments[date] ||= []).push(claim);
    return state;
  });
  return claim;
}

export async function recordDeploymentResult({ store, claim, resource, kind, now = Date.now }) {
  const build = `${BACKEND}/builds/${claim.buildId}`, rollout = `${BACKEND}/rollouts/${claim.rolloutId}`;
  if (normalizeResource(resource?.name) !== (kind === 'build' ? build : rollout)) throw new Error('Deployment resource identity mismatch');
  if (kind === 'rollout' && normalizeResource(resource.build) !== build) throw new Error('Rollout build identity mismatch');
  const failed = resource.state === 'FAILED' || resource.state === 'CANCELLED';
  if (!failed && resource.state !== (kind === 'build' ? 'READY' : 'SUCCEEDED')) throw new Error('Deployment result is not terminal; retain the active claim');
  if (kind === 'build' && !failed) {
    if ((resource.source?.codebase?.hash || resource.source?.codebase?.commit) !== claim.sourceCommit) throw new Error('Ready build does not match the validated source revision');
    assertDeployDate(claim.date, now());
  }
  const phase = failed ? `${kind}-failed` : kind === 'build' ? 'rolling-out' : 'succeeded';
  return store.update(state => {
    const receipt = state.dailyDeployments?.[claim.date]?.find(attempt => attempt.id === claim.id);
    if (!receipt || receipt.sourceCommit !== claim.sourceCommit || receipt.buildId !== claim.buildId || receipt.rolloutId !== claim.rolloutId) throw new Error('Durable deployment claim is missing or changed');
    if (receipt.phase === phase && phase !== 'rolling-out') return null;
    if (receipt.phase !== (kind === 'build' ? 'building' : 'rolling-out')) throw new Error('Deployment transition already consumed or conflicts with saved evidence');
    if (phase === 'rolling-out') {
      assertDeployDate(claim.date, now());
      if (hasDailyDeployment(state, claim.date)) throw new Error('Daily rollout already succeeded');
    }
    Object.assign(receipt, { phase, [`${kind}State`]: resource.state, observedAt: new Date(now()).toISOString() });
    if (phase === 'succeeded') {
      receipt.confirmedAt = new Date(now()).toISOString();
      state.deployed = [state.deployed || '', claim.date, receipt.confirmedAt.slice(0, 10)].sort().at(-1);
    }
    return state;
  });
}

export async function runDailyDeployment({ store, date, id, sourceCommit, content, token, request = fetch, sleep = delay, now = Date.now, evidence = async () => {}, buildPolls = 80, rolloutPolls = 40 }) {
  if (!token) throw new Error('Firebase deployment authorization is required');
  const claim = await claimDailyDeployment({ store, date, id, sourceCommit, content, now });
  if (!claim) return { deployed: false };
  await evidence('claim', claim);
  const api = async (resource, body) => {
    const response = await request(`https://firebaseapphosting.googleapis.com/v1beta/${resource}`, {
      method: body ? 'POST' : 'GET', redirect: 'error', signal: AbortSignal.timeout(30000),
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}),
    });
    if (!response.ok) throw new Error(`Firebase deployment HTTP ${response.status}; durable claim retained`);
    const result = await response.json();
    if (!result?.name || (body && result.error)) throw new Error('Firebase response is unconfirmed; durable claim retained');
    return result;
  };
  const poll = async (kind, polls) => {
    const name = `${BACKEND}/${kind}s/${kind === 'build' ? claim.buildId : claim.rolloutId}`;
    for (let attempt = 0; attempt < polls; attempt++) {
      const resource = await api(name);
      if (['READY', 'SUCCEEDED', 'FAILED', 'CANCELLED'].includes(resource.state)) {
        // Record success before optional artifact or live-site verification can fail.
        try {
          await recordDeploymentResult({ store, claim, resource, kind, now });
        } catch (error) {
          try { await evidence(kind, resource); }
          catch (artifactError) { throw new AggregateError([error, artifactError], `Deployment acknowledgement and evidence persistence failed: ${error.message}`); }
          throw error;
        }
        await evidence(kind, resource);
        if (['FAILED', 'CANCELLED'].includes(resource.state)) throw new Error(`Firebase ${kind} ${resource.state}; confirmed failure remains retryable`);
        return;
      }
      await evidence(kind, resource);
      if (attempt + 1 < polls) await sleep(30000);
    }
    throw new Error(`Firebase ${kind} result unknown; durable claim retained for inspection`);
  };
  assertDeployDate(date, now());
  await evidence('build-create', await api(`${BACKEND}/builds?buildId=${claim.buildId}`, { source: { codebase: { commit: sourceCommit } } }));
  await poll('build', buildPolls);
  assertDeployDate(date, now());
  await evidence('rollout-create', await api(`${BACKEND}/rollouts?rolloutId=${claim.rolloutId}`, { build: `${BACKEND}/builds/${claim.buildId}` }));
  await poll('rollout', rolloutPolls);
  return { deployed: true, startedAt: claim.startedAt };
}
