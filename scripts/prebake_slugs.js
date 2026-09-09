#!/usr/bin/env node
/**
 * prebake_slugs.js
 * Pre-computes stable sequential slugs for all jobs and writes them
 * directly into content/jobs-cache.json, eliminating all slug computation
 * from the runtime hot path in getJobs().
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CACHE_PATH = path.join(__dirname, '../content/jobs-cache.json');

function getOneWordRole(title) {
  const t = title.toLowerCase();
  if (t.includes('solidity')) return 'solidity';
  if (t.includes('rust')) return 'rust';
  if (t.includes('zk') || t.includes('zero knowledge') || t.includes('cryptograph')) return 'cryptography';
  if (t.includes('frontend') || /\b(ui|ux)\b/i.test(t)) return 'frontend';
  if (t.includes('backend')) return 'backend';
  if (t.includes('full stack') || t.includes('fullstack')) return 'fullstack';
  if (t.includes('devops') || t.includes('infrastructure')) return 'devops';
  if (t.includes('security') || t.includes('audit')) return 'security';
  if (/\bqa\b/i.test(t) || t.includes('testing') || t.includes('quality')) return 'qa';
  if (t.includes('trader') || t.includes('quant')) return 'trader';
  if (t.includes('product') || /\bpm\b/i.test(t)) return 'product';
  if (t.includes('marketing') || t.includes('growth')) return 'marketing';
  if (t.includes('community')) return 'community';
  if (t.includes('devrel') || t.includes('developer relations')) return 'devrel';
  if (t.includes('compliance') || t.includes('legal') || t.includes('mlro')) return 'compliance';
  if (t.includes('recruiter') || t.includes('talent') || /\bhr\b/i.test(t)) return 'recruiting';
  if (t.includes('onboarding')) return 'onboarding';
  if (t.includes('supervisor')) return 'supervisor';
  if (t.includes('manager')) return 'manager';
  if (t.includes('analyst')) return 'analyst';
  if (t.includes('developer')) return 'developer';
  if (t.includes('engineer')) return 'engineer';
  if (t.includes('designer')) return 'designer';
  if (t.includes('writer')) return 'writer';
  if (t.includes('sales') || t.includes('account') || t.includes('business development') || /\bbd\b/i.test(t)) return 'sales';
  if (t.includes('operations') || /\bops\b/i.test(t)) return 'operations';
  if (t.includes('architect')) return 'architect';
  if (t.includes('intern')) return 'intern';
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

const GENERAL_APP_REGEX = /(general application|general interest|general opening|general opportunity|expression of interest|talent community|talent pool|talent network|future opportunities|future consideration|future builders|future roles|join our talent|dream job|spontaneous application|open position|open application|speculative application|unsolicited application|general pool|general submission|register your interest|submit your (?:cv|resume)|create your own role|don.?t see (?:a|your|the|any) role|role that fits|can.?t find (?:a|your) role|looking for something else|stay in touch|keep in touch|connect with us|work with us|join our team\s*\(general\)|general candidate pool)/i;

const NON_WEB3_DISQUALIFIED_REGEX = /\b(flow cytometry|profiling lab|wet lab|histology|assay development|molecular biology|in vitro|in vivo|clinical trial|physician|surgeon|dentist|dental hygienist|registered nurse|nurse|injector|med spa|spa coordinator|pharmacist|pharmacology|medical doctor|veterinarian|livestock|agronomist|personal banker|mortgage lender|teller|lending officer|special assets officer)\b/i;

function isConcreteJobOpening(title, link) {
  if (!title) return false;
  const t = title.toLowerCase().trim();
  if (['default template','new job template','test job','(sample)'].some(x => t.includes(x)) || t === 'test' || t === 'testextrenal' || t === '[template] default template') return false;
  if (GENERAL_APP_REGEX.test(t)) return false;
  if (NON_WEB3_DISQUALIFIED_REGEX.test(t)) return false;
  if (link) {
    const l = link.toLowerCase().trim();
    if (
      l.includes('/search-results') ||
      l.includes('keywords=') ||
      l.includes('search_query=') ||
      l.includes('search-jobs') ||
      /\/(?:careers|jobs)\/?$/.test(l) ||
      /\/(?:careers|jobs)\/list\/?$/.test(l)
    ) return false;
  }
  return true;
}

const KNOWN_COMPANY_CLEAN_MAP = {
  'ritual (ai + web3)': 'Ritual',
  'hyperbolic (ai + web3)': 'Hyperbolic',
  'consensys (metamask)': 'Consensys',
  'arbitrum (offchain labs)': 'Arbitrum',
  'aztec labs (privacy l2)': 'Aztec Labs',
  'helius (solana infra)': 'Helius',
  'grass (wynd labs depin)': 'Grass',
  'optimism (op labs)': 'Optimism',
  'mysten labs (sui)': 'Mysten Labs',
  'bob (build on bitcoin)': 'BOB',
  'wincent (market maker)': 'Wincent',
  'provable (aleo)': 'Provable',
  'zerogravity (0g ai)': '0G Labs',
  'succinct labs (zk)': 'Succinct Labs',
  'sky (makerdao)': 'Sky',
  'symbiotic restaking': 'Symbiotic',
};

function cleanCompanyName(company) {
  if (!company) return 'Web3';
  const raw = company.trim();
  const lower = raw.toLowerCase();
  if (KNOWN_COMPANY_CLEAN_MAP[lower]) return KNOWN_COMPANY_CLEAN_MAP[lower];
  return raw
    .replace(/\s*\((?:ai\s*\+?\s*web3|solana\s*infra|privacy\s*l2|depin|zk|aleo|sui|market\s*maker|build\s*on\s*bitcoin|makerdao|op\s*labs|offchain\s*labs)\)/gi, '')
    .replace(/\s+(?:inc\.?|llc\.?|ltd\.?|corp\.?)$/i, '')
    .trim();
}

const t0 = Date.now();
console.log('Reading jobs-cache.json...');
const raw = fs.readFileSync(CACHE_PATH, 'utf-8');
const rawJobs = JSON.parse(raw);
console.log(`  ${rawJobs.length} raw jobs (${Math.round(raw.length/1024)}KB)`);

// Normalize company names, titles, and prune non-standalone/placeholder roles
const validJobs = rawJobs
  .filter(job => {
    if (BLOCKED_COMPANIES.has((job.company || '').toLowerCase())) return false;
    return isConcreteJobOpening(job.title, job.link);
  })
  .map(job => ({
    ...job,
    title: cleanJobTitle(job.title, job.company),
    company: cleanCompanyName(cleanText(job.company)),
  }));

const roleCounters = {};
const existingSlugs = new Set(validJobs.map(j => j.slug).filter(Boolean));

// --- Slug stability & preservation ---------------------------------------
// A job's slug must survive refreshes: reuse the previous slug whenever the
// employer URL identity matches, never reassign a retired slug to a
// different posting, and record disappeared slugs in the legacy archive so
// old links 308 to the live posting instead of 404ing.
const ARCHIVE_PATH = path.join(__dirname, '../content/legacy-slugs-archive.json');
let legacyArchive = {};
try {
  if (fs.existsSync(ARCHIVE_PATH)) legacyArchive = JSON.parse(fs.readFileSync(ARCHIVE_PATH, 'utf-8'));
} catch (e) { console.warn('  ⚠️ Could not read legacy archive:', e.message); }
const archivedSlugs = new Set(Object.keys(legacyArchive));
// Never mint over a live slug OR any slug that ever existed.
const takenSlugs = new Set([...existingSlugs, ...archivedSlugs]);

// identity -> slug from archive first, live entries win ties (restore the
// live URL when known; resurrect the retired URL when the posting returns).
// slug -> identity for the archive, to detect newcomers squatting retired slugs.
const identityToSlug = new Map();
const archiveIdentityBySlug = new Map();
for (const [slug, entry] of Object.entries(legacyArchive)) {
  if (!entry) continue;
  const k = getJobIdentity({ id: entry.id, title: entry.title, company: entry.company, link: entry.link });
  if (!k) continue;
  if (!identityToSlug.has(k)) identityToSlug.set(k, slug);
  if (!archiveIdentityBySlug.has(slug)) archiveIdentityBySlug.set(slug, k);
}
for (const job of validJobs) {
  if (!job.slug) continue;
  const k = getJobIdentity(job);
  if (!k) continue;
  // Skip live entries squatting a retired slug that belongs to someone else:
  // enshrining them here would cement the collision. They fall through to
  // reuse-or-mint below and get a slug of their own.
  const retired = archiveIdentityBySlug.get(job.slug);
  if (retired && retired !== k) continue;
  identityToSlug.set(k, job.slug);
}

// Count existing role counts
for (const s of existingSlugs) {
  const m = s.match(/^([a-z]+)(\d+)$/);
  if (m) {
    const role = m[1];
    const num = parseInt(m[2], 10);
    roleCounters[role] = Math.max(roleCounters[role] || 0, num);
  }
}

let updated = 0;
let reused = 0;
const assignedSlugs = new Set();
const outputJobs = validJobs.map(job => {
  if (job.slug && !assignedSlugs.has(job.slug)) {
    const myIdentity = getJobIdentity(job);
    const retiredIdentity = archiveIdentityBySlug.get(job.slug);
    // Keep: fresh slug, or rightful restoration (retired slug, same posting).
    // A newcomer holding a retired slug that belongs to someone else falls
    // through to reuse-or-mint so history is never overwritten.
    if (!retiredIdentity || !myIdentity || retiredIdentity === myIdentity) {
      assignedSlugs.add(job.slug);
      return job;
    }
  }
  // Same posting as a previous refresh (matched by employer-URL identity)?
  // Reuse its slug so the URL never churns.
  const reuse = identityToSlug.get(getJobIdentity(job));
  if (reuse && !assignedSlugs.has(reuse)) {
    assignedSlugs.add(reuse);
    reused++;
    return { ...job, slug: reuse };
  }
  const role = getOneWordRole(job.title || 'job');
  roleCounters[role] = (roleCounters[role] || 0) + 1;
  let newSlug = `${role}${roleCounters[role]}`;
  while (takenSlugs.has(newSlug) || assignedSlugs.has(newSlug)) {
    roleCounters[role]++;
    newSlug = `${role}${roleCounters[role]}`;
  }
  takenSlugs.add(newSlug);
  assignedSlugs.add(newSlug);
  updated++;
  return { ...job, slug: newSlug };
});

// Preserve every retired slug: anything prod currently addresses (the last
// committed file) or that entered this run but drops out of the output gets
// an archive record (identity included) so old links 308 to the live posting
// instead of 404ing.
const outSlugs = new Set(outputJobs.map(j => j.slug));
let archivedCount = 0;
const retireSlug = (slug, job) => {
  if (!slug || outSlugs.has(slug) || legacyArchive[slug]) return;
  legacyArchive[slug] = { id: job.id, link: job.link, company: job.company, title: job.title };
  archivedCount++;
};
// (a) entries dropped by prebake's own filters (blocked/placeholder roles)
for (const job of rawJobs) {
  if (!job || typeof job !== 'object') continue;
  retireSlug(job.slug, job);
}
// (b) entries dropped upstream by ingest (never reach prebake): compare
// against the last committed file, which is what prod currently serves.
// Scoped with -C to the repo root so a stray cwd can never diff the wrong tree.
try {
  const repoRoot = path.join(__dirname, '..');
  const prevRaw = execSync('git -C "' + repoRoot + '" show HEAD:content/jobs-cache.json', { maxBuffer: 128 * 1024 * 1024 }).toString('utf-8');
  for (const job of JSON.parse(prevRaw)) {
    if (!job || typeof job !== 'object') continue;
    retireSlug(job.slug, job);
  }
} catch (e) {
  console.warn('  ⚠️ slug-retirement scan skipped (no git HEAD cache):', e.message);
}
if (archivedCount > 0) {
  fs.writeFileSync(ARCHIVE_PATH, JSON.stringify(legacyArchive, null, 2));
  console.log(`  ${archivedCount} retired slugs preserved in legacy archive`);
}

fs.writeFileSync(CACHE_PATH, JSON.stringify(outputJobs, null, 2));
console.log(`\n✅ Done in ${Date.now()-t0}ms — ${updated} new slugs added, ${reused} reused by identity, ${outputJobs.length} total valid jobs saved`);
