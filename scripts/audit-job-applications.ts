import fs from 'node:fs';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { load } from 'cheerio';
import type { Job } from '../src/types';
import { getAtsBoardFromUrl, getJobAtsBoards, type AtsBoard } from '../src/lib/ats-board-identity';
import { getJobIdentity, normalizeJobLink } from '../src/lib/job-slugs';
import { applicationAuditSubjects } from './lib/job-application-subjects';

type Posting = { id: string | number; title?: string; location?: string | { name?: string; is_remote?: boolean }; categories?: { location?: string }; isRemote?: boolean; remote?: boolean; workplaceType?: string; city?: string; country?: string; atsLocation?: { city?: string; state?: string; country?: string }; jobUrl?: string; hostedUrl?: string; absolute_url?: string };
export type ApplicationAudit = { identity: string; slug?: string; url: string; checkedAt: string; status: 'open' | 'not-found' | 'closed' | 'unverified'; evidence: string; location?: string; isRemote?: boolean; workplaceType?: string };
type ResponseData = { status: number; url: string; text: string; error?: string };
const output = path.resolve('.cache/job-applications/audit.json');
const jobs = applicationAuditSubjects();
const corporateBoards = new Map<string, Map<string, AtsBoard>>();
for (const job of jobs) {
  if (job.source === 'Archived listing') continue;
  const board = getJobAtsBoards(job).find(item => item.provider === 'greenhouse');
  if (!board) continue;
  const host = new URL(job.applyUrl || job.link).hostname;
  const known = corporateBoards.get(host) || new Map<string, AtsBoard>();
  known.set(`${board.provider}:${board.board}`, board); corporateBoards.set(host, known);
}
const hosts = new Map<string, { active: number; waiters: Array<() => void> }>();
const boards = new Map<string, Promise<{ url: string; jobs: Map<string, Posting> } | null>>();
let requests = 0;

function ashbyData(html: string): { posting: (Posting & { locationName?: string }) | null; organization?: unknown; maintenanceMode?: boolean } | null {
  const match = html.match(/window\.__appData\s*=\s*(\{[^\n\r]*\});/);
  if (!match) return null;
  try { return JSON.parse(match[1]); } catch { return null; }
}

function closedRedirect(url: string): boolean {
  const target = new URL(url);
  return (target.hostname === 'ats.rippling.com' && target.searchParams.get('rr_message') === 'job_not_found')
    || (target.hostname === 'apply.workable.com' && target.searchParams.get('not_found') === 'true')
    || (target.hostname.endsWith('.linkedin.com') && target.searchParams.get('trk') === 'expired_jd_redirect')
    || (target.hostname.endsWith('.bamboohr.com') && target.pathname === '/settings/account/expired.php');
}

async function request(url: string): Promise<ResponseData> {
  const target = new URL(url);
  if (!/^https?:$/.test(target.protocol) || target.username || target.password) return { status: 0, url, text: '', error: 'Unsupported URL' };
  const queue = hosts.get(target.hostname) || { active: 0, waiters: [] };
  hosts.set(target.hostname, queue);
  if (queue.active >= 3) await new Promise<void>(resolve => queue.waiters.push(resolve));
  else queue.active++;
  requests++;
  try {
    const response = await fetch(url, { headers: { 'User-Agent': 'HashtagWeb3-JobLinkCheck/1.0 (+https://hashtagweb3.com)', Accept: 'application/json,text/html;q=0.9' }, redirect: 'follow', signal: AbortSignal.timeout(15000) });
    return { status: response.status, url: response.url, text: await response.text() };
  } catch (error) { return { status: 0, url, text: '', error: error instanceof Error ? error.message : String(error) }; }
  finally { const next = queue.waiters.shift(); if (next) next(); else queue.active--; }
}

function boardSnapshot(board: AtsBoard) {
  const key = `${board.provider}:${board.region || ''}:${board.board}`;
  let promise = boards.get(key);
  if (!promise) {
    promise = (async () => {
      let url: string;
      if (board.provider === 'ashby') url = `https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(board.board)}`;
      else if (board.provider === 'greenhouse') url = `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(board.board)}/jobs`;
      else if (board.provider === 'lever') url = `https://api.${board.region === 'eu' ? 'eu.' : ''}lever.co/v0/postings/${encodeURIComponent(board.board)}?mode=json&limit=100`;
      else if (board.provider === 'breezy') url = `https://${board.board}.breezy.hr/json`;
      else if (board.provider === 'workable') url = `https://apply.workable.com/api/v1/widget/accounts/${encodeURIComponent(board.board)}`;
      else if (board.provider === 'bamboohr') url = `https://${board.board}.bamboohr.com/careers/list`;
      else return null;
      const items: Posting[] = [];
      for (let skip = 0; skip < 10000; skip += 100) {
        const response = await request(board.provider === 'lever' ? `${url}&skip=${skip}` : url);
        if (response.status !== 200) return null;
        let data: unknown;
        try { data = JSON.parse(response.text); } catch { return null; }
        let rows = Array.isArray(data) ? data : (data as { jobs?: unknown; result?: unknown })?.jobs || (data as { result?: unknown })?.result;
        if (Array.isArray(rows) && board.provider === 'workable') rows = rows.map(row => ({ ...row, id: row.shortcode || row.code }));
        if (!Array.isArray(rows) || rows.some(row => !row || (typeof row.id !== 'string' && typeof row.id !== 'number'))) return null;
        items.push(...rows);
        if (board.provider !== 'lever' || rows.length < 100) return { url, jobs: new Map(items.map(item => [String(item.id).toLowerCase(), item])) };
      }
      return null;
    })();
    boards.set(key, promise);
  }
  return promise;
}

function postingFields(posting: Posting) {
  const location = typeof posting.location === 'string' ? posting.location : posting.location?.name || posting.categories?.location || (posting.atsLocation ? [posting.atsLocation.city, posting.atsLocation.state, posting.atsLocation.country].filter(Boolean).join(', ') : [posting.city, posting.country].filter(Boolean).join(', '));
  const isRemote = posting.isRemote ?? posting.remote ?? (typeof posting.location === 'object' ? posting.location.is_remote : undefined);
  return { ...(location && { location }), ...(typeof isRemote === 'boolean' && { isRemote }), ...(posting.workplaceType && { workplaceType: posting.workplaceType }) };
}

async function confirmedMissing(url: string, first: ResponseData): Promise<boolean> {
  if (![404, 410].includes(first.status)) return false;
  await delay(400);
  return [404, 410].includes((await request(url)).status);
}

async function inspect(job: Job & { applyUrl?: string }): Promise<ApplicationAudit> {
  const url = job.applyUrl || job.link;
  const base = { identity: getJobIdentity(job), slug: job.slug, url, checkedAt: new Date().toISOString() };
  try {
    const corporate = corporateBoards.get(new URL(url).hostname);
    const board = getAtsBoardFromUrl(url) || getJobAtsBoards(job).find(board => ['greenhouse', 'lever', 'ashby', 'breezy', 'workable', 'bamboohr'].includes(board.provider)) || (corporate?.size === 1 ? [...corporate.values()][0] : undefined), identity = normalizeJobLink(url);
    const id = identity.match(/^(?:ashby|lever|greenhouse|workable):(.+)$/)?.[1] || identity.match(/^breezy:[^:]+:(.+)$/)?.[1] || (board?.provider === 'bamboohr' ? new URL(url).pathname.match(/\/careers\/(\d+)/)?.[1] : undefined);
    if (board && id) {
      const snapshot = await boardSnapshot(board);
      const posting = snapshot?.jobs.get(id.toLowerCase());
      if (posting) return { ...base, status: 'open', evidence: `Listed in live employer API: ${snapshot!.url}`, ...postingFields(posting) };
      // Individual JSON endpoints distinguish unlisted-but-open roles from closed roles.
      const detail = board.provider === 'greenhouse' ? `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(board.board)}/jobs/${id}`
        : board.provider === 'lever' ? `https://api.${board.region === 'eu' ? 'eu.' : ''}lever.co/v0/postings/${encodeURIComponent(board.board)}/${id}?mode=json`
        : board.provider === 'workable' ? `https://apply.workable.com/api/v1/accounts/${encodeURIComponent(board.board)}/jobs/${id.toUpperCase()}`
        : board.provider === 'bamboohr' ? `https://${board.board}.bamboohr.com/careers/${id}/detail` : null;
      if (detail) {
        const response = await request(detail);
        if (snapshot && await confirmedMissing(detail, response)) return { ...base, status: 'closed', evidence: `Absent from live employer board; individual posting API returned ${response.status} twice: ${detail}` };
        if (response.status === 200) {
          try {
            const data = JSON.parse(response.text) as Posting & { shortcode?: string; code?: string; result?: { jobOpening?: Posting & { jobOpeningName?: string } } };
            const posting = data.result?.jobOpening;
            if (String(data.id || data.shortcode || data.code).toLowerCase() === id.toLowerCase() || posting?.jobOpeningName) return { ...base, status: 'open', evidence: `Live individual posting API: ${detail}`, ...postingFields(posting || data) };
          } catch {}
        }
      }
    }
    const target = new URL(url), segments = target.pathname.split('/').filter(Boolean), jobIndex = segments.indexOf('job');
    if (target.hostname.endsWith('.myworkdayjobs.com') && jobIndex > 0 && segments[jobIndex + 1]) {
      const apiUrl = `${target.origin}/wday/cxs/${target.hostname.split('.')[0]}/${segments[jobIndex - 1]}/job/${segments.slice(jobIndex + 1).join('/')}`;
      const response = await request(apiUrl);
      if (await confirmedMissing(apiUrl, response)) return { ...base, status: 'closed', evidence: `Individual Workday posting API returned ${response.status} twice: ${apiUrl}` };
      if (response.status === 200) {
        try { const data = JSON.parse(response.text) as { jobPostingInfo?: { title?: string; location?: string; remoteType?: string } }; if (data.jobPostingInfo?.title) return { ...base, status: 'open', evidence: `Live Workday posting API: ${apiUrl}`, ...(data.jobPostingInfo.location && { location: data.jobPostingInfo.location }), ...(data.jobPostingInfo.remoteType && { workplaceType: data.jobPostingInfo.remoteType }) }; } catch {}
      }
    }
    const response = await request(url);
    if (await confirmedMissing(url, response)) return { ...base, status: 'not-found', evidence: `Application destination returned ${response.status} twice: ${response.url}` };
    if (response.status !== 200) return { ...base, status: 'unverified', evidence: response.error || `HTTP ${response.status}: ${response.url}` };
    if (closedRedirect(response.url) && closedRedirect((await request(url)).url)) return { ...base, status: 'closed', evidence: `Employer redirects twice to an explicit expired/not-found status: ${response.url}` };
    if (board?.provider === 'ashby') {
      const data = ashbyData(response.text);
      if (data && !data.maintenanceMode && data.posting === null) {
        const confirmation = await request(url), again = ashbyData(confirmation.text);
        if (confirmation.status === 200 && again && !again.maintenanceMode && again.posting === null) return { ...base, status: 'closed', evidence: `Ashby hosted job data reports posting=null (Job not found) twice for the requested posting: ${url}` };
      }
      if (data?.posting && String(data.posting.id).toLowerCase() === id?.toLowerCase()) return { ...base, status: 'open', evidence: `Live Ashby hosted posting data: ${url}`, ...postingFields({ ...data.posting, location: data.posting.locationName || data.posting.location }) };
    }
    const $ = load(response.text);
    for (const element of $('script[type="application/ld+json"]').toArray()) {
      try {
        const parsed = JSON.parse($(element).text());
        const objects = Array.isArray(parsed) ? parsed : parsed['@graph'] || [parsed];
        for (const object of objects) {
          if (object['@type'] !== 'JobPosting') continue;
          const normalizeTitle = (value: string) => value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
          if (typeof object.title !== 'string' || normalizeTitle(object.title) !== normalizeTitle(job.title)) continue;
          if (object.validThrough && Date.parse(object.validThrough) < Date.now()) continue;
          return { ...base, status: 'open', evidence: `Matching JobPosting structured data: ${response.url}`, ...(object.jobLocationType === 'TELECOMMUTE' && { isRemote: true }) };
        }
      } catch {}
    }
    $('script,style,noscript,nav,footer').remove();
    const text = $('body').text().replace(/\s+/g, ' ').trim();
    const closed = text.match(/(?:this|the) (?:job (?:posting|opening)|job|position|vacancy) (?:is(?: now)?|has been) (?:no longer (?:available|accepting (?:applications|candidates)|open|active)|closed|filled|removed|expired)|(?:this|the) (?:job|position|vacancy) (?:does not|doesn't) exist|no longer accepting applications for this (?:job|position)|the (?:job|position) you (?:are|were) looking for (?:is no longer available|could not be found)/i);
    const closedHeading = $('h1,h2,[role="alert"]').toArray().map(element => $(element).text().replace(/\s+/g, ' ').trim()).find(heading => /^(?:(?:job|position|vacancy)(?: posting)? (?:closed|expired|not found)|404(?:\s*[-:]?\s*(?:page )?not found)?|page not found)[.!]?$/i.test(heading));
    const missingTenant = new URL(response.url).hostname.endsWith('.freshteam.com') && /we couldn.t find/i.test(text) && /you can claim it now/i.test(text);
    const closedMessage = closed && closed.index! < 2000 ? closed[0] : closedHeading || (missingTenant ? text.slice(0, 200) : null);
    if (closedMessage) {
      await delay(400);
      const confirmation = await request(url);
      const check = load(confirmation.text); check('script,style,noscript,nav,footer').remove();
      if (confirmation.status === 200 && check('body').text().replace(/\s+/g, ' ').includes(closedMessage)) return { ...base, status: 'closed', evidence: `Employer page states: ${closedMessage} (${response.url})` };
    }
    const normalized = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    if (normalized(text).includes(normalized(job.title)) && normalized(job.title).length >= 12) return { ...base, status: 'open', evidence: `Application page contains the role title: ${response.url}` };
    return { ...base, status: 'unverified', evidence: `HTTP 200 without verifiable role content (may require JavaScript): ${response.url}` };
  } catch (error) { return { ...base, status: 'unverified', evidence: error instanceof Error ? error.message : String(error) }; }
}

async function main() {
  if (process.argv.includes('--summary')) {
    const report = JSON.parse(fs.readFileSync(output, 'utf8')) as { results: ApplicationAudit[] };
    const groups: Record<string, { count: number; examples: ApplicationAudit[] }> = {};
    for (const row of report.results.filter(row => row.status === 'unverified')) {
      const host = new URL(row.url).hostname, group = groups[host] ||= { count: 0, examples: [] };
      group.count++; if (group.examples.length < 2) group.examples.push(row);
    }
    console.log(JSON.stringify({ counts: Object.fromEntries(['open', 'closed', 'not-found', 'unverified'].map(status => [status, report.results.filter(row => row.status === status).length])), unverified: groups }, null, 2));
    return;
  }
  const inventory = Object.fromEntries([...jobs.reduce((map, job) => { const provider = getAtsBoardFromUrl(job.applyUrl || job.link)?.provider || new URL(job.applyUrl || job.link).hostname; map.set(provider, (map.get(provider) || 0) + 1); return map; }, new Map<string, number>())].sort((a, b) => b[1] - a[1]));
  console.log(JSON.stringify({ jobs: jobs.length, inventory, hungary: jobs.filter(job => /Hungary/i.test(job.location || '')).map(({ slug, title, location }) => ({ slug, title, location })) }, null, 2));
  if (process.argv.includes('--inventory')) return;
  fs.mkdirSync(path.dirname(output), { recursive: true });
  const previous = fs.existsSync(output) && !process.argv.includes('--fresh') ? JSON.parse(fs.readFileSync(output, 'utf8')) as { results: ApplicationAudit[] } : { results: [] };
  const jobByIdentity = new Map(jobs.map(job => [getJobIdentity(job), job]));
  const results = new Map(previous.results.filter(result => {
    if (!jobByIdentity.has(result.identity) || Date.now() - Date.parse(result.checkedAt) >= 6 * 3600000) return false;
    const refreshHost = process.argv.find(arg => arg.startsWith('--refresh-host='))?.slice('--refresh-host='.length);
    if (result.status === 'unverified' && (refreshHost ? new URL(result.url).hostname === refreshHost : process.argv.includes('--refresh-unverified'))) return false;
    const job = jobByIdentity.get(result.identity);
    if (process.argv.includes('--refresh-supported') && job && !result.location && getJobAtsBoards(job).some(board => ['greenhouse', 'lever', 'ashby', 'breezy'].includes(board.provider))) return false;
    return true;
  }).map(result => [result.identity, result]));
  const pending = jobs.filter(job => !results.has(getJobIdentity(job)));
  let cursor = 0, finished = 0;
  const save = () => fs.writeFileSync(output, JSON.stringify({ checkedAt: new Date().toISOString(), jobs: jobs.length, requests, results: [...results.values()] }, null, 2));
  await Promise.all(Array.from({ length: 16 }, async () => {
    while (cursor < pending.length) {
      const job = pending[cursor++], result = await inspect(job);
      results.set(result.identity, result); finished++;
      if (finished % 100 === 0) { save(); console.log(`Checked ${results.size}/${jobs.length}; requests=${requests}`); }
    }
  }));
  save();
  console.log(JSON.stringify({ checked: results.size, requests, counts: Object.fromEntries(['open', 'closed', 'not-found', 'unverified'].map(status => [status, [...results.values()].filter(result => result.status === status).length])), report: output }, null, 2));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
