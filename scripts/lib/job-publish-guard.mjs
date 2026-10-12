import { isJobAgeEligible, jobAgeExclusionReason } from '../../src/lib/job-age-policy.mjs';
import { isIP } from 'node:net';
import { isGreenhouseBoardHost, sameApplicationIdentity, trustedApplicationIdentity } from './job-application-identity.mjs';

export const PUBLISHED_JOBS_URL = 'https://hashtagweb3.com/data/jobs-runtime.json';
export const MAX_PREFLIGHT_CANDIDATES = 10;

export function assertJobAge(job, now = Date.now()) {
  const reason = jobAgeExclusionReason(job, now);
  if (reason) throw new Error(`Job publication blocked (${job?.slug || job?.id || 'unknown'}): ${reason}`);
}

function assertJobRecord(job) {
  for (const key of ['id', 'slug', 'title', 'company', 'link']) {
    if (typeof job?.[key] !== 'string' || !job[key].trim()) throw new Error(`Job publication blocked: missing or invalid ${key}`);
  }
}

export async function loadPublishedJobs(request = fetch) {
  const response = await request(PUBLISHED_JOBS_URL, {
    method: 'GET', cache: 'no-store', redirect: 'error',
    headers: { 'Cache-Control': 'no-cache' }, signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`Published job catalog unverified: HTTP ${response.status}`);
  const jobs = await response.json();
  if (!Array.isArray(jobs)) throw new Error('Published job catalog is not an array');
  return jobs.filter(job => isJobAgeEligible(job));
}

function employerUrl(value, allowHttpUpgrade = false) {
  let url;
  try { url = new URL(value); } catch { throw new Error('Employer application unverified: missing or invalid URL'); }
  const canUpgrade = allowHttpUpgrade && url.protocol === 'http:' && trustedApplicationIdentity(url)?.detail;
  if ((url.protocol !== 'https:' && !canUpgrade) || url.username || url.password || url.port
    || /^(?:www\.)?hashtagweb3\.com$/i.test(url.hostname)
    || !url.hostname.includes('.') || isIP(url.hostname.replace(/^\[|\]$/g, ''))
    || /(?:^|\.)(?:localhost|local|localdomain|internal|test|invalid)$/.test(url.hostname)) {
    throw new Error('Employer application unverified: expected a direct public employer HTTPS URL');
  }
  return url;
}

const normalize = value => String(value || '').replace(/&amp;/g, '&').replace(/&#39;|&apos;/g, "'")
  .replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ').replace(/&#\d+;/g, ' ')
  .replace(/<[^>]*>/g, ' ').normalize('NFKC').replace(/[^\p{L}\p{N}]+/gu, ' ').trim().toLowerCase();

export function jobPostings(html) {
  const found = [];
  const visit = value => {
    if (Array.isArray(value)) return value.forEach(visit);
    if (!value || typeof value !== 'object') return;
    if ([value['@type']].flat().includes('JobPosting')) found.push(value);
    if (value['@graph']) visit(value['@graph']);
  };
  for (const match of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try { visit(JSON.parse(match[1])); } catch { /* Invalid structured data is not evidence of an open job. */ }
  }
  return found;
}

async function boundedText(response) {
  const reader = response.body?.getReader();
  if (!reader) throw new Error('Employer application unverified: empty response');
  const chunks = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 2 * 1024 * 1024) throw new Error('Employer application unverified: response too large');
      chunks.push(value);
    }
  } finally { await reader.cancel(); }
  return Buffer.concat(chunks).toString('utf8');
}

export async function verifyEmployerApplication(job, { request = fetch, now = Date.now } = {}) {
  assertJobAge(job, now());
  const original = employerUrl(job.link, true);
  const originalIdentity = trustedApplicationIdentity(original);
  const chain = [original];
  let target = original;
  let response;
  try {
    for (let redirects = 0; redirects <= 4; redirects++) {
      response = await request(target.href, {
        method: 'GET', redirect: 'manual', cache: 'no-store', signal: AbortSignal.timeout(10000),
        headers: { Accept: 'text/html,application/xhtml+xml', 'User-Agent': 'HashtagWeb3JobPreflight/1.0', 'Cache-Control': 'no-cache' },
      });
      if (![301, 302, 303, 307, 308].includes(response.status)) break;
      const location = response.headers.get('location');
      await response.body?.cancel();
      if (!location) throw new Error('redirect has no destination');
      const next = employerUrl(new URL(location, target).href);
      if (next.hostname !== target.hostname && !sameApplicationIdentity(originalIdentity, trustedApplicationIdentity(next))) {
        throw new Error('Employer application unverified: redirected away from the requested job');
      }
      if (target.protocol === 'http:' && (next.hostname !== target.hostname
        || !sameApplicationIdentity(originalIdentity, trustedApplicationIdentity(next)))) {
        throw new Error('Employer application unverified: HTTP upgrade changed the job or host');
      }
      target = next;
      chain.push(target);
    }
    if ([404, 410].includes(response.status)) throw new Error(`Employer application closed: HTTP ${response.status}`);
    if (response.status !== 200) throw new Error(`Employer application unverified: HTTP ${response.status}`);
    const final = employerUrl(response.url || target.href);
    if (final.href !== target.href) throw new Error('Employer application unverified: unobserved redirect');
    if (!/text\/html|application\/xhtml\+xml/i.test(response.headers.get('content-type') || '')) throw new Error('Employer application unverified: unsupported response type');
    const html = await boundedText(response);
    const markup = html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '');
    const visible = markup.replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;|&#x0*a0;/gi, ' ').replace(/\s+/g, ' ');
    if (/\b(?:this|the) (?:job|position|role|opening|posting) (?:is (?:no longer (?:available|open|posted)|closed|unavailable)|has (?:been (?:filled|closed|removed)|expired))\b|\b(?:job|position|role|opening) closed\b|\b(?:job|position|page) (?:not found|has expired|does not exist|doesn't exist)\b|\b(?:job|position|role) you(?:'re| are) looking for.{0,80}(?:no longer|not available|does not exist)|\bno longer accepting (?:applications|candidates)\b|\b404\s*[-: ]*\s*(?:error|not found)\b/i.test(visible)) {
      throw new Error('Employer application closed: employer page reports an unavailable job');
    }
    if (/verify (?:you are|that you are) human|access denied|checking your browser|enable javascript and cookies|security checkpoint/i.test(visible)) throw new Error('Employer application unverified: browser challenge');
    const postings = jobPostings(html);
    const matchingPostings = postings.filter(p => normalize(p.title) === normalize(job.title)
      && normalize(p.hiringOrganization?.name) === normalize(job.company?.name || job.company));
    for (const posting of matchingPostings) {
      if (posting.datePosted !== undefined) assertJobAge({ date: posting.datePosted }, now());
      if (posting.validThrough && (!Number.isFinite(Date.parse(posting.validThrough)) || Date.parse(posting.validThrough) < now())) throw new Error('Employer application closed: expired JobPosting');
      if (!normalize(posting.description)) throw new Error('Employer application unverified: empty JobPosting');
      const identifier = posting.identifier?.value ?? (typeof posting.identifier === 'string' ? posting.identifier : undefined);
      if (originalIdentity && identifier !== undefined && String(identifier) !== originalIdentity.id) throw new Error('Employer application unverified: JobPosting identifier changed');
    }
    const cleanPath = url => url.pathname.replace(/\/(?:apply)?\/?$/, '').replace(/\/$/, '');
    const sameEndpoint = url => url.protocol === original.protocol && url.hostname === original.hostname
      && cleanPath(url) === cleanPath(original) && url.searchParams.get('gh_jid') === original.searchParams.get('gh_jid');
    const migrated = chain.some(url => !sameEndpoint(url));
    const finalIdentity = trustedApplicationIdentity(final);
    if (migrated && (!finalIdentity?.detail || !chain.every(url => sameApplicationIdentity(originalIdentity, trustedApplicationIdentity(url)))
      || (original.protocol === 'http:' && original.hostname !== final.hostname))) {
      throw new Error('Employer application unverified: redirected away from the requested job');
    }
    if ((finalIdentity && !finalIdentity.detail) || (isGreenhouseBoardHost(final) && !finalIdentity)
      || /^\/(?:careers?|jobs?|openings?|positions?)?\/?$/i.test(final.pathname)) throw new Error('Employer application unverified: board or home page');
    if (!matchingPostings.length) {
      const headings = [...markup.matchAll(/<(?:h1|h2|title)\b[^>]*>([\s\S]*?)<\/(?:h1|h2|title)>/gi)].map(match => normalize(match[1]));
      const contains = (value, phrase) => phrase && ` ${value} `.includes(` ${phrase} `);
      const headingMatches = headings.some(value => contains(value, normalize(job.title)));
      if (originalIdentity && postings.length) throw new Error('Employer application unverified: JobPosting title or company does not match');
      if (migrated && !headings.some(value => contains(value, normalize(job.title))
        && contains(value, normalize(job.company?.name || job.company)))) throw new Error('Employer application unverified: redirected job title or company does not match');
      const applyAction = /<(?:a|button|input)\b[^>]*(?:>[\s\S]{0,120}?\bapply\b|value=["'][^"']*apply)/i.test(markup)
        || /<form\b[^>]*[\s\S]*?(?:resume|cv|application)/i.test(markup);
      if (!job.title || !headingMatches || !applyAction) throw new Error('Employer application unverified: no matching job and application action');
    }
    assertJobAge(job, now());
  } catch (error) {
    if (/^(?:Employer application|Job publication)/.test(error.message)) throw error;
    throw new Error(`Employer application unverified: ${error.message}`, { cause: error });
  }
}

export function matchLiveJob(job, live, now = Date.now()) {
  assertJobAge(job, now);
  assertJobRecord(job);
  const matches = live.filter(candidate => candidate.slug === job.slug);
  if (matches.length > 1) throw new Error(`Job publication blocked: ambiguous live slug ${job.slug}`);
  const current = matches[0];
  if (!current) throw new Error(`Job publication blocked: ${job.slug || job.id} is absent from the live catalog`);
  assertJobAge(current, now);
  assertJobRecord(current);
  for (const key of ['id', 'title', 'company', 'link', 'date']) {
    if (String(current[key] || '') !== String(job[key] || '')) throw new Error(`Job publication blocked: ${key} changed for ${job.slug || job.id}`);
  }
  return current;
}

export async function assertPublishableJobs(jobs, { request = fetch, now = Date.now, loadJobs = () => loadPublishedJobs(request) } = {}) {
  if (!Array.isArray(jobs) || !jobs.length) throw new Error('Job publication blocked: empty batch');
  if (jobs.length > 20) throw new Error('Job publication blocked: batch exceeds 20 selected jobs');
  // Reject stored unknown/expired payloads before consulting a newer catalog.
  for (const job of jobs) { assertJobAge(job, now()); assertJobRecord(job); }
  const live = await loadJobs();
  const current = jobs.map(job => matchLiveJob(job, live, now()));
  for (const job of current) await verifyEmployerApplication(job, { request, now });
  for (const job of jobs) assertJobAge(job, now());
}

export async function assertPublishableJob(job, options = {}) {
  await assertPublishableJobs([job], options);
}
