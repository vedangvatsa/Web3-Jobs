#!/usr/bin/env node
/**
 * prebake_slugs.js
 * Pre-computes stable sequential slugs for all jobs and writes them
 * directly into content/jobs-cache.json, eliminating all slug computation
 * from the runtime hot path in getJobs().
 */

const fs = require('fs');
const path = require('path');

const CACHE_PATH = path.join(__dirname, '../content/jobs-cache.json');

function getOneWordRole(title) {
  const t = title.toLowerCase();
  if (t.includes('solidity')) return 'solidity';
  if (t.includes('rust')) return 'rust';
  if (t.includes('zk') || t.includes('zero knowledge') || t.includes('cryptograph')) return 'cryptography';
  if (t.includes('frontend') || t.includes('ui') || t.includes('ux')) return 'frontend';
  if (t.includes('backend')) return 'backend';
  if (t.includes('full stack') || t.includes('fullstack')) return 'fullstack';
  if (t.includes('devops') || t.includes('infrastructure')) return 'devops';
  if (t.includes('security') || t.includes('audit')) return 'security';
  if (t.includes('qa') || t.includes('testing') || t.includes('quality')) return 'qa';
  if (t.includes('trader') || t.includes('quant')) return 'trader';
  if (t.includes('product') || t.includes('pm')) return 'product';
  if (t.includes('marketing') || t.includes('growth')) return 'marketing';
  if (t.includes('community')) return 'community';
  if (t.includes('devrel') || t.includes('relations')) return 'devrel';
  if (t.includes('compliance') || t.includes('legal') || t.includes('mlro')) return 'compliance';
  if (t.includes('recruiter') || t.includes('talent') || t.includes('hr')) return 'recruiting';
  if (t.includes('onboarding')) return 'onboarding';
  if (t.includes('supervisor')) return 'supervisor';
  if (t.includes('manager')) return 'manager';
  if (t.includes('analyst')) return 'analyst';
  if (t.includes('developer')) return 'developer';
  if (t.includes('engineer')) return 'engineer';
  if (t.includes('designer')) return 'designer';
  if (t.includes('writer')) return 'writer';
  if (t.includes('sales') || t.includes('account')) return 'sales';
  if (t.includes('operations') || t.includes('ops')) return 'operations';
  if (t.includes('associate') || t.includes('assistant')) return 'associate';
  const words = t.replace(/[^a-z0-9\s]+/g, ' ').trim().split(/\s+/);
  return words[0] || 'job';
}

const BLOCKED_COMPANIES = new Set([
  'notion', 'ashby', 'merge', 'salt ai', 'workable',
  'button', 'breeze', 'citadel securities', 'zipline',
  'greenhouse', 'lever', 'greenhouse io',
]);

function cleanText(text) { return (text || '').replace(/[\u200B-\u200D\uFEFF]/g, '').trim(); }

function cleanJobTitle(title, company) {
  let cleaned = cleanText(title);
  if (company) {
    const escaped = company.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const m = cleaned.replace(new RegExp(`^${escaped}\\s*[-\u2013:]\\s*`, 'i'), '').trim();
    if (m.length > 0) cleaned = m;
  }
  return cleanText(cleaned.replace(/\s+/g, ' ') || title.trim());
}

function sourceQuality(job) {
  const s = job.source.toLowerCase();
  if (/^(greenhouse|lever|ashby|workable|recruitee|workday|smartrecruiters|breezy|bamboohr|comeet|teamtailor|rippling|firstparty|superteam):/.test(s)) return 3;
  if (!s.startsWith('http')) return 2;
  return 1;
}

function normalizeJobLink(link) {
  try {
    const url = new URL(link);
    const hostname = url.hostname.toLowerCase();
    const ghId = url.searchParams.get('gh_jid')
      || (hostname.includes('greenhouse.io') ? (url.pathname.match(/\/jobs\/(\d+)/i)||[])[1] : undefined);
    if (ghId) return `greenhouse:${ghId}`;
    const uuid = (url.pathname.match(/\/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})(?:\/|$)/i)||[])[1];
    if (uuid && hostname.includes('ashbyhq.com')) return `ashby:${uuid.toLowerCase()}`;
    if (uuid && hostname.includes('lever.co')) return `lever:${uuid.toLowerCase()}`;
    const wId = hostname.includes('workable.com') ? (url.pathname.match(/\/j\/([a-z0-9]+)(?:\/|$)/i)||[])[1] : undefined;
    if (wId) return `workable:${wId.toLowerCase()}`;
    const bId = hostname.endsWith('.breezy.hr') ? (url.pathname.match(/\/p\/([a-z0-9]+)(?:-|\/|$)/i)||[])[1] : undefined;
    if (bId) return `breezy:${hostname}:${bId.toLowerCase()}`;
    url.hash = '';
    const TRACKING = new Set(['gh_src','source','ref','referrer','t','utm_campaign','utm_content','utm_medium','utm_source','utm_term']);
    for (const p of [...url.searchParams.keys()]) { if (TRACKING.has(p.toLowerCase())) url.searchParams.delete(p); }
    url.hostname = hostname;
    url.pathname = url.pathname.replace(/\/+$/, '') || '/';
    return url.toString();
  } catch { return (link||'').trim().toLowerCase(); }
}

function getJobIdentity(job) {
  const nl = normalizeJobLink(job.link || '');
  if (nl) return nl;
  return [job.company, job.id, job.title].map(v => (v||'').trim().toLowerCase().replace(/\s+/g,' ')).join('|');
}

function deduplicateJobs(jobs) {
  const m = new Map();
  for (const job of jobs) {
    const k = getJobIdentity(job);
    const ex = m.get(k);
    if (!ex || sourceQuality(job) > sourceQuality(ex)) m.set(k, job);
  }
  return [...m.values()];
}

function distributeJobsByCompany(jobs) {
  const MAX = 2;
  const groups = new Map();
  for (const job of jobs) {
    const k = job.company.toLowerCase();
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(job);
  }
  const sorted = Array.from(groups.values()).sort((a, b) => new Date(b[0].date) - new Date(a[0].date));
  const result = [];
  const ptrs = new Array(sorted.length).fill(0);
  let hasMore = true;
  while (hasMore) {
    hasMore = false;
    for (let i = 0; i < sorted.length; i++) {
      const g = sorted[i]; const s = ptrs[i]; const e = Math.min(s + MAX, g.length);
      for (let j = s; j < e; j++) result.push(g[j]);
      ptrs[i] = e;
      if (e < g.length) hasMore = true;
    }
  }
  return result;
}

const t0 = Date.now();
console.log('Reading jobs-cache.json...');
const raw = fs.readFileSync(CACHE_PATH, 'utf-8');
const rawJobs = JSON.parse(raw);
console.log(`  ${rawJobs.length} raw jobs (${Math.round(raw.length/1024)}KB)`);

const jobs = rawJobs.map(job => ({ ...job, title: cleanJobTitle(job.title, job.company), company: cleanText(job.company) }));
const web3Jobs = jobs.filter(job => {
  if (BLOCKED_COMPANIES.has(job.company.toLowerCase())) return false;
  const tl = job.title.toLowerCase();
  return !['default template','new job template','test job','(sample)'].some(x => tl.includes(x))
    && tl !== 'test' && tl !== 'testextrenal' && tl !== '[template] default template';
});

const distributed = distributeJobsByCompany(deduplicateJobs(web3Jobs));
console.log(`  After dedup/distribute: ${distributed.length} jobs`);

// Assign slugs
const slugById = new Map();
const maxPerRole = new Map();
const claimed = new Set();

for (const job of distributed) {
  const rawSlug = (job.slug || '').toLowerCase().trim();
  if (rawSlug && /^[a-z]+\d+$/.test(rawSlug) && !claimed.has(rawSlug)) {
    slugById.set(job.id, rawSlug);
    claimed.add(rawSlug);
    const role = rawSlug.replace(/\d+$/, '');
    const num = parseInt(rawSlug.slice(role.length), 10);
    if (!isNaN(num)) maxPerRole.set(role, Math.max(maxPerRole.get(role)||0, num));
  }
}

const needsSlug = distributed.filter(j => !slugById.has(j.id))
  .sort((a, b) => { const d = new Date(a.date)-new Date(b.date); return d !== 0 ? d : a.id.localeCompare(b.id); });

let newSlugs = 0;
for (const job of needsSlug) {
  const role = getOneWordRole(job.title);
  let next = (maxPerRole.get(role)||0) + 1;
  let candidate = `${role}${next}`;
  while (claimed.has(candidate)) { next++; candidate = `${role}${next}`; }
  slugById.set(job.id, candidate);
  claimed.add(candidate);
  maxPerRole.set(role, next);
  newSlugs++;
}
console.log(`  ${slugById.size - newSlugs} existing slugs preserved, ${newSlugs} new slugs assigned`);

// Write slugs back into the original array
let updated = 0;
const outputJobs = rawJobs.map(job => {
  const slug = slugById.get(job.id);
  if (slug && job.slug !== slug) { updated++; return { ...job, slug }; }
  return job;
});

fs.writeFileSync(CACHE_PATH, JSON.stringify(outputJobs, null, 2));
console.log(`\n✅ Done in ${Date.now()-t0}ms — ${updated} updated, ${outputJobs.length} total`);
