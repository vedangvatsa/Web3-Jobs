import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const WORKFLOW = '.github/workflows/refresh-jobs-cache.yml';
const JOURNAL = '.cache/news-research/recovery-selection.json';
export const RECOVERY_LIMITS = Object.freeze({ perPage: 100, maxPages: 10, maxRequests: 100, requestTimeoutMs: 10_000 });

class RecoveryError extends Error {
  constructor(code, message) { super(message); this.code = code; }
}
function fail(code, message) { throw new RecoveryError(code, message); }
function id(value) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 && String(number) === String(value) ? String(number) : null;
}
function timestamp(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(value)) return NaN;
  const time = Date.parse(value);
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 19) === value.slice(0, 19) ? time : NaN;
}
function utcDay(time) { return Number.isFinite(time) ? new Date(time).toISOString().slice(0, 10) : null; }

function trustedRunIssue(run, repository, repositoryId, workflowId) {
  if (!id(run?.id) || !id(run?.run_attempt) || !id(run?.workflow_id) || !/^[a-f0-9]{40}$/i.test(run?.head_sha || '')) return 'invalid-run-metadata';
  if (run.repository?.full_name?.toLowerCase() !== repository.toLowerCase()
    || run.head_repository?.full_name?.toLowerCase() !== repository.toLowerCase()
    || !id(run.repository?.id) || id(run.head_repository?.id) !== id(run.repository?.id)
    || (repositoryId && id(run.repository.id) !== repositoryId)) return 'wrong-repository';
  if (run.path !== WORKFLOW || (workflowId && id(run.workflow_id) !== workflowId)) return 'wrong-workflow';
  if (run.head_branch !== 'main') return 'wrong-branch';
  if (!['schedule', 'workflow_dispatch'].includes(run.event) || !Array.isArray(run.pull_requests) || run.pull_requests.length) return 'untrusted-event';
  return null;
}

function candidateIssue(run, context) {
  const { repository, current, day, now, explicit } = context;
  const issue = trustedRunIssue(run, repository, id(current.repository.id), id(current.workflow_id));
  if (issue) return issue;
  if (id(run.id) === id(current.id)) return 'current-run';
  if (run.status !== 'completed' || !run.conclusion) return 'run-not-completed';
  if (!explicit && !['failure', 'cancelled'].includes(run.conclusion)) return 'run-not-failed-or-cancelled';
  const created = timestamp(run.created_at), started = timestamp(run.run_started_at), updated = timestamp(run.updated_at);
  if (![created, started, updated].every(Number.isFinite) || started < created || updated < started) return 'invalid-run-time';
  if (utcDay(created) !== day || utcDay(started) !== day) return 'wrong-date';
  if (Number(run.id) >= Number(current.id) || created > timestamp(current.created_at)
    || started > timestamp(current.run_started_at) || updated > now) return 'not-prior-run';
  return null;
}

function artifactAttempt(artifact, run, context) {
  const match = typeof artifact?.name === 'string' && artifact.name.match(/^news-research-([1-9]\d*)-([1-9]\d*)$/);
  if (!match || match[0] !== artifact.name || match[1] !== id(run.id) || !id(match[2]) || Number(match[2]) > Number(run.run_attempt)) return null;
  const created = timestamp(artifact.created_at), expires = timestamp(artifact.expires_at), source = artifact.workflow_run;
  if (!id(artifact.id) || artifact.expired !== false || !Number.isSafeInteger(artifact.size_in_bytes) || artifact.size_in_bytes <= 0
    || utcDay(created) !== context.day || created > context.now || !(expires > context.now)
    || id(source?.id) !== id(run.id) || id(source?.repository_id) !== id(run.repository.id)
    || id(source?.head_repository_id) !== id(run.repository.id) || source?.head_branch !== 'main' || source?.head_sha !== run.head_sha) return null;
  return Number(match[2]);
}

function githubReader({ repository, token, fetchImpl, journal, persist }) {
  async function get(relative, query = {}) {
    if (journal.requests >= RECOVERY_LIMITS.maxRequests) fail('request-limit', 'News recovery API request limit reached; selection is incomplete.');
    journal.requests++;
    journal.lastRequest = { resource: relative, page: query.page || null };
    persist();
    const url = new URL(`https://api.github.com/repos/${repository}/actions/${relative}`);
    url.search = new URLSearchParams(query).toString();
    let response;
    try {
      response = await fetchImpl(url.href, {
        method: 'GET', redirect: 'error', signal: AbortSignal.timeout(RECOVERY_LIMITS.requestTimeoutMs),
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
      });
    } catch { fail('api-network', 'GitHub news recovery API request failed or timed out.'); }
    if (!response.ok) {
      const status = Number.isInteger(response.status) ? response.status : 'unknown';
      fail('api-http', `GitHub news recovery API returned HTTP ${status}; selection is incomplete.`);
    }
    let data;
    try { data = await response.json(); }
    catch { fail('api-json', 'GitHub news recovery API returned invalid JSON.'); }
    return { data, hasNext: /<[^>]+>;\s*rel="next"/.test(response.headers.get('link') || '') };
  }
  async function list(relative, field, query = {}) {
    const result = [];
    for (let page = 1; page <= RECOVERY_LIMITS.maxPages; page++) {
      const { data, hasNext } = await get(relative, { ...query, per_page: RECOVERY_LIMITS.perPage, page });
      if (!Array.isArray(data?.[field]) || !Number.isSafeInteger(data.total_count) || data.total_count < 0 || data[field].length > RECOVERY_LIMITS.perPage) {
        fail('api-shape', 'GitHub news recovery API returned an invalid list.');
      }
      if (data.total_count > RECOVERY_LIMITS.perPage * RECOVERY_LIMITS.maxPages) fail('page-limit', 'News recovery API page limit exceeded; selection is incomplete.');
      result.push(...data[field]);
      if (!hasNext && result.length >= data.total_count) return result;
      if (!data[field].length) fail('api-pagination', 'GitHub news recovery API pagination is incomplete.');
    }
    fail('page-limit', 'News recovery API page limit reached; selection is incomplete.');
  }
  return { get: async relative => (await get(relative)).data, list };
}

async function selectArtifact(run, context, api) {
  const artifacts = await api.list(`runs/${id(run.id)}/artifacts`, 'artifacts');
  const candidates = artifacts.map(artifact => ({ artifact, attempt: artifactAttempt(artifact, run, context) }))
    .filter(item => item.attempt !== null).sort((a, b) => b.attempt - a.attempt);
  for (const { artifact, attempt } of candidates) {
    const source = attempt === Number(run.run_attempt) ? run : await api.get(`runs/${id(run.id)}/attempts/${attempt}`);
    if (id(source?.id) !== id(run.id) || Number(source?.run_attempt) !== attempt || source?.head_sha !== run.head_sha || candidateIssue(source, context)) continue;
    const created = timestamp(artifact.created_at);
    if (created < timestamp(source.run_started_at) || created > timestamp(source.updated_at)) continue;
    if (artifacts.filter(item => item?.name === artifact.name).length !== 1) fail('ambiguous-artifact', 'Multiple artifacts have the selected news recovery name.');
    return { runId: id(run.id), runAttempt: attempt, artifactId: id(artifact.id), artifactName: artifact.name, createdAt: artifact.created_at };
  }
  return null;
}

export async function selectNewsRecovery({ cwd = process.cwd(), env = process.env, fetchImpl = fetch, now = new Date() } = {}) {
  const journal = {
    version: 1, status: 'pending', mode: env.NEWS_RECOVERY_RUN ? 'explicit' : 'automatic',
    day: null, repository: null, currentRunId: null, requestedRunId: null,
    workflow: WORKFLOW, branch: 'main', checkedAt: null, limits: RECOVERY_LIMITS,
    requests: 0, lastRequest: null, candidates: [], selection: null,
  };
  const file = path.join(cwd, JOURNAL);
  const persist = () => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, JSON.stringify(journal, null, 2) + '\n'); };
  try {
    const clock = new Date(now).getTime();
    if (!Number.isFinite(clock)) fail('invalid-clock', 'News recovery needs a valid UTC clock.');
    journal.checkedAt = new Date(clock).toISOString();
    let day;
    try { ({ day } = JSON.parse(fs.readFileSync(path.join(cwd, '.cache/news-research/current.json'), 'utf8'))); }
    catch { fail('invalid-queue', 'News recovery needs the prepared daily queue.'); }
    if (typeof day !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(day) || utcDay(Date.parse(`${day}T00:00:00Z`)) !== day || day > utcDay(clock)) {
      fail('invalid-date', 'News recovery needs a valid, non-future prepared UTC news date.');
    }
    journal.day = day;
    const repository = env.GITHUB_REPOSITORY;
    if (typeof repository !== 'string' || !/^[a-z0-9][a-z0-9-]*\/[a-z0-9][a-z0-9_.-]*$/i.test(repository)) fail('invalid-repository', 'News recovery needs GITHUB_REPOSITORY.');
    journal.repository = repository;
    const currentRunId = id(env.GITHUB_RUN_ID), requestedRunId = id(env.NEWS_RECOVERY_RUN);
    if (!currentRunId) fail('invalid-current-run', 'News recovery needs a valid GITHUB_RUN_ID.');
    journal.currentRunId = currentRunId;
    if (journal.mode === 'explicit' && !requestedRunId) fail('invalid-requested-run', 'NEWS_RECOVERY_RUN must be a positive integer run ID.');
    journal.requestedRunId = requestedRunId;
    if (requestedRunId === currentRunId) fail('current-run', 'News recovery cannot restore from the current run.');
    if (typeof env.GITHUB_TOKEN !== 'string' || !env.GITHUB_TOKEN.trim()) fail('missing-token', 'News recovery needs GITHUB_TOKEN for authenticated GitHub reads.');
    const api = githubReader({ repository, token: env.GITHUB_TOKEN, fetchImpl, journal, persist });
    const current = await api.get(`runs/${currentRunId}`);
    if (id(current?.id) !== currentRunId || trustedRunIssue(current, repository)
      || !Number.isFinite(timestamp(current.created_at)) || !Number.isFinite(timestamp(current.run_started_at))
      || timestamp(current.created_at) > timestamp(current.run_started_at) || timestamp(current.run_started_at) > clock) {
      fail('invalid-current-run', 'Current run must be a trusted main-branch news workflow run.');
    }
    const context = { repository, current, day, now: clock, explicit: journal.mode === 'explicit' };
    const runs = requestedRunId ? [await api.get(`runs/${requestedRunId}`)]
      : await api.list('workflows/refresh-jobs-cache.yml/runs', 'workflow_runs', { branch: 'main', status: 'completed', created: day });
    const eligible = [];
    for (const run of runs) {
      const issue = requestedRunId && id(run?.id) !== requestedRunId ? 'wrong-run' : candidateIssue(run, context);
      if (issue) {
        journal.candidates.push({ runId: id(run?.id), decision: issue });
        if (requestedRunId) fail('invalid-requested-run', `Requested news recovery run is ineligible: ${issue}.`);
      } else eligible.push(run);
    }
    eligible.sort((a, b) => timestamp(b.created_at) - timestamp(a.created_at) || Number(b.id) - Number(a.id));
    for (const run of eligible) {
      const selection = await selectArtifact(run, context, api);
      journal.candidates.push({ runId: id(run.id), decision: selection ? 'selected' : 'no-matching-artifact' });
      if (selection) { journal.selection = selection; break; }
    }
    if (requestedRunId && !journal.selection) fail('missing-artifact', 'Requested news recovery run has no eligible unexpired same-day news artifact.');
    journal.status = journal.selection ? 'selected' : 'none';
    persist();
    if (env.GITHUB_OUTPUT) fs.appendFileSync(env.GITHUB_OUTPUT, `run_id=${journal.selection?.runId || ''}\nartifact_name=${journal.selection?.artifactName || ''}\n`);
    return journal;
  } catch (error) {
    const safe = error instanceof RecoveryError ? error : new RecoveryError('selection-error', 'News recovery selection failed; inspect the recovery selection journal.');
    journal.status = 'error'; journal.selection = null; journal.error = { code: safe.code, message: safe.message };
    persist();
    throw safe;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  selectNewsRecovery().then(journal => {
    console.log(journal.selection ? `Selected ${journal.selection.artifactName} from run ${journal.selection.runId} for fresh review.`
      : 'No eligible same-day news recovery artifact found; fresh research is allowed.');
  }).catch(error => {
    console.error(error instanceof RecoveryError ? error.message : 'News recovery selection failed; could not persist its journal.');
    process.exitCode = 1;
  });
}
