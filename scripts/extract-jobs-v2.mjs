#!/usr/bin/env node

/**
 * Job Data Extraction Pipeline v2
 *
 * Phase 1 (no API key needed): Fetch structured data from ATS APIs
 *   - Greenhouse API → full description, location, department
 *   - Lever API      → full description, location, department, commitment
 *   - Ashby API      → full description, location, department, employment type
 *   - Generic pages  → curl + strip HTML for description
 *
 * Phase 2 (needs OPENAI_API_KEY): Extract skills, compensation, seniority via AI
 *
 * Output columns:
 *   URL, Company, Company URL, Job Title, Location, Remote, Job Type,
 *   Seniority, Department, Skills, Compensation, Source, Category,
 *   Published Date, Description
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const JOBS_CACHE = path.join(__dirname, '..', 'content', 'jobs-cache.json');
const OUTPUT_CSV = path.join(__dirname, '..', 'jobs-extracted-v2.csv');
const PROGRESS_FILE = path.join(__dirname, '..', 'jobs-extract-v2-progress.json');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SKIP_AI = !OPENAI_API_KEY;

if (SKIP_AI) {
  console.log('⚠️  No OPENAI_API_KEY found — running Phase 1 only (ATS fetch, no AI skill extraction)');
} else {
  console.log('✅ OPENAI_API_KEY found — running full extraction (Phase 1 + Phase 2 AI)');
}

const CONCURRENCY = 10;
const FETCH_TIMEOUT = 20000;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Progress ───────────────────────────────────────────────────────────
let progress = {};
if (fs.existsSync(PROGRESS_FILE)) {
  progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
}

function saveProgress() {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

// ── CSV helpers ────────────────────────────────────────────────────────
function csvEscape(val) {
  if (val === null || val === undefined) return '';
  const s = String(val).replace(/"/g, '""');
  return (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r'))
    ? `"${s}"` : s;
}

const CSV_HEADERS = [
  'URL', 'Company', 'Company URL', 'Job Title', 'Location', 'Remote',
  'Job Type', 'Seniority', 'Department', 'Skills', 'Compensation',
  'Source', 'Category', 'Published Date', 'Description',
];

// ── HTML → plain text ──────────────────────────────────────────────────
function htmlToText(html) {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?(p|div|li|h[1-6]|tr|ul|ol)[^>]*>/gi, '\n')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#\d+;/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ── Well-known company URLs (so we don't need AI for these) ────────────
const COMPANY_URLS = {
  'Coinbase': 'coinbase.com',
  'Ripple': 'ripple.com',
  'Robinhood': 'robinhood.com',
  'OKX': 'okx.com',
  'Binance': 'binance.com',
  'BitGo': 'bitgo.com',
  'Fireblocks': 'fireblocks.com',
  'Alchemy': 'alchemy.com',
  'Consensys': 'consensys.io',
  'Gemini': 'gemini.com',
  'Circle': 'circle.com',
  'Stripe': 'stripe.com',
  'a16z': 'a16z.com',
  'Revolut': 'revolut.com',
  'Aptos Labs': 'aptoslabs.com',
  'Ava Labs': 'avax.network',
  'LayerZero': 'layerzero.network',
  'Galaxy Digital': 'galaxy.com',
  'Blockchain.com': 'blockchain.com',
  'Nansen': 'nansen.ai',
  'NEAR': 'near.org',
  'DCG': 'dcg.co',
  'Hedera': 'hedera.com',
  'Jump Crypto': 'jumpcrypto.com',
  'Bybit': 'bybit.com',
  'BitMEX': 'bitmex.com',
  'Luno': 'luno.com',
  'Paradigm': 'paradigm.xyz',
  'Zora': 'zora.co',
  'Securitize': 'securitize.io',
  'Figment': 'figment.io',
  'OpenZeppelin': 'openzeppelin.com',
  'Immunefi': 'immunefi.com',
  'B2C2': 'b2c2.com',
  'Brave': 'brave.com',
  'Flow Traders': 'flowtraders.com',
  'TaxBit': 'taxbit.com',
  'Grayscale': 'grayscale.com',
  'ComplyAdvantage': 'complyadvantage.com',
  'Ramp Network': 'ramp.network',
  'Bitpanda': 'bitpanda.com',
  'Shakepay': 'shakepay.com',
  'Polygon Labs': 'polygon.technology',
  'Mysten Labs': 'mystenlabs.com',
  'Base': 'base.org',
  'Injective': 'injective.com',
  'Polymarket': 'polymarket.com',
  'Uniswap': 'uniswap.org',
  'Compound': 'compound.finance',
  'Morpho': 'morpho.org',
  'OpenSea': 'opensea.io',
  'Magic Eden': 'magiceden.io',
  'Phantom': 'phantom.app',
  'Safe': 'safe.global',
  'Gelato': 'gelato.network',
  'QuickNode': 'quicknode.com',
  'Helius': 'helius.dev',
  'LI.FI': 'li.fi',
  'Elliptic': 'elliptic.co',
  'Maple Finance': 'maple.finance',
  'Stacks': 'stacks.co',
  'Stellar': 'stellar.org',
  'Nethermind': 'nethermind.io',
  'Anchorage Digital': 'anchorage.com',
  'MoonPay': 'moonpay.com',
  'Ledger': 'ledger.com',
  'Ethena': 'ethena.fi',
  '1inch': '1inch.io',
  'Gate.io': 'gate.io',
  'CoinGecko': 'coingecko.com',
  'Animoca Brands': 'animocabrands.com',
  'Jito': 'jito.network',
  'Parity Technologies': 'parity.io',
  'Sardine': 'sardine.ai',
  'Notabene': 'notabene.id',
  'Delphi Digital': 'delphidigital.io',
  'Flipside Crypto': 'flipsidecrypto.com',
  'Render Network': 'rendernetwork.com',
  'Chainalysis': 'chainalysis.com',
  'Kraken': 'kraken.com',
  'CoinDCX': 'coindcx.com',
  'StreamingFast': 'streamingfast.io',
  'Hadrian': 'hadrian.co',
  'Genies': 'genies.com',
  'Wave Mobile Money': 'wave.com',
  'Citadel Securities': 'citadelsecurities.com',
  'Sorare': 'sorare.com',
  'Backpack': 'backpack.exchange',
  'Sei': 'sei.io',
  'Artemis': 'artemis.xyz',
  'Dune': 'dune.com',
  'OP Labs': 'oplabs.co',
  'Eigen Labs': 'eigenlayer.xyz',
  'Aztec': 'aztec.network',
  'Cantina': 'cantina.xyz',
};

// ── Detect source type from URL ────────────────────────────────────────
function detectSource(url) {
  if (/greenhouse\.io/.test(url)) return 'greenhouse';
  if (/coinbase\.com\/careers/.test(url)) return 'greenhouse-coinbase';
  if (/lever\.co/.test(url)) return 'lever';
  if (/ashbyhq\.com/.test(url)) return 'ashby';
  return 'generic';
}

// ── Greenhouse API ─────────────────────────────────────────────────────
async function fetchGreenhouseJob(url) {
  let board, jobId;

  // Coinbase special case
  const cbMatch = url.match(/coinbase\.com\/careers\/positions\/(\d+)/);
  if (cbMatch) {
    board = 'coinbase';
    jobId = cbMatch[1];
  } else {
    const ghMatch = url.match(/greenhouse\.io\/([^/]+)\/jobs\/(\d+)/);
    if (ghMatch) { board = ghMatch[1]; jobId = ghMatch[2]; }
  }

  if (!board || !jobId) return null;

  try {
    const res = await fetch(
      `https://boards-api.greenhouse.io/v1/boards/${board}/jobs/${jobId}`,
      { signal: AbortSignal.timeout(FETCH_TIMEOUT) }
    );
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

function parseGreenhouseJob(data, cacheJob) {
  const loc = data.location?.name || '';
  const isRemote = /remote/i.test(loc);
  const desc = htmlToText(data.content || '');
  const depts = (data.departments || []).map(d => d.name).filter(Boolean);

  // Try to extract compensation from metadata
  let comp = '';
  if (data.metadata) {
    const compMeta = data.metadata.find(m =>
      /salary|compensation|pay/i.test(m.name)
    );
    if (compMeta) comp = String(compMeta.value);
  }

  return {
    url: cacheJob.link,
    company: cacheJob.company,
    company_url: COMPANY_URLS[cacheJob.company] || '',
    job_title: data.title || cacheJob.title,
    location: loc,
    remote: isRemote ? 'Yes' : 'No',
    job_type: '',
    seniority: '',
    department: depts.join(', '),
    skills: '',
    compensation: comp,
    source: cacheJob.source,
    category: '',
    published_date: cacheJob.date,
    description: desc,
    _needs_ai: desc.length > 50,
  };
}

// ── Lever API ──────────────────────────────────────────────────────────
async function fetchLeverJob(url) {
  const m = url.match(/jobs\.lever\.co\/([^/]+)\/([a-f0-9-]+)/i);
  if (!m) return null;
  try {
    const res = await fetch(
      `https://api.lever.co/v0/postings/${m[1]}/${m[2]}`,
      { signal: AbortSignal.timeout(FETCH_TIMEOUT) }
    );
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

function parseLeverJob(data, cacheJob) {
  const cats = data.categories || {};
  const loc = cats.location || '';
  const isRemote = /remote/i.test(loc) || data.workplaceType === 'remote';

  // Build description from lists + additional
  const parts = [];
  if (data.descriptionPlain) parts.push(data.descriptionPlain);
  else if (data.description) parts.push(htmlToText(data.description));

  if (data.additional) parts.push(htmlToText(data.additional));

  (data.lists || []).forEach(l => {
    if (l.text) parts.push(l.text);
    if (l.content) parts.push(htmlToText(l.content));
  });

  const desc = parts.filter(Boolean).join('\n\n');
  const dept = cats.department || cats.team || '';
  const commitment = cats.commitment || '';

  // Lever sometimes has salaryRange
  let comp = '';
  if (data.salaryRange) {
    const sr = data.salaryRange;
    if (sr.min && sr.max) {
      comp = `${sr.currency || '$'}${sr.min.toLocaleString()} - ${sr.currency || '$'}${sr.max.toLocaleString()}`;
    }
  }

  return {
    url: cacheJob.link,
    company: cacheJob.company,
    company_url: COMPANY_URLS[cacheJob.company] || '',
    job_title: data.text || cacheJob.title,
    location: loc,
    remote: isRemote ? 'Yes' : (data.workplaceType === 'onSite' ? 'No' : ''),
    job_type: commitment,
    seniority: '',
    department: dept,
    skills: '',
    compensation: comp,
    source: cacheJob.source,
    category: '',
    published_date: cacheJob.date,
    description: desc,
    _needs_ai: desc.length > 50,
  };
}

// ── Ashby API ──────────────────────────────────────────────────────────
async function fetchAshbyJob(url) {
  const m = url.match(/jobs\.ashbyhq\.com\/([^/]+)\/([a-f0-9-]+)/i);
  if (!m) return null;
  try {
    const res = await fetch('https://api.ashbyhq.com/posting-api/posting-info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobBoardName: m[1], postingId: m[2] }),
      signal: AbortSignal.timeout(FETCH_TIMEOUT),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

function parseAshbyJob(data, cacheJob) {
  const info = data.info || data;
  const loc = info.locationName || info.location || '';
  const isRemote = /remote/i.test(loc) || info.isRemote;
  const desc = htmlToText(info.descriptionHtml || info.descriptionPlain || '');
  const dept = info.departmentName || info.department || '';
  const empType = info.employmentType || '';

  // Ashby sometimes has compensation
  let comp = '';
  if (info.compensationTierSummary) {
    comp = info.compensationTierSummary;
  } else if (info.compensation) {
    comp = typeof info.compensation === 'string' ? info.compensation : JSON.stringify(info.compensation);
  }

  return {
    url: cacheJob.link,
    company: cacheJob.company,
    company_url: COMPANY_URLS[cacheJob.company] || '',
    job_title: info.title || cacheJob.title,
    location: loc,
    remote: isRemote ? 'Yes' : 'No',
    job_type: empType,
    seniority: '',
    department: dept,
    skills: '',
    compensation: comp,
    source: cacheJob.source,
    category: '',
    published_date: cacheJob.date,
    description: desc,
    _needs_ai: desc.length > 50,
  };
}

// ── Generic page scrape ────────────────────────────────────────────────
async function fetchGenericPage(url) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(FETCH_TIMEOUT),
    });
    if (!res.ok) return null;
    const html = await res.text();
    return htmlToText(html).slice(0, 8000);
  } catch { return null; }
}

// ── AI extraction (Phase 2 — only for skills/seniority/comp/category) ─
const AI_SYSTEM = `You extract structured fields from a real job posting. 
ONLY return data explicitly stated in the text. If not mentioned, return null.

Return ONLY valid JSON:
{
  "company_url": "main domain (e.g. coinbase.com) or null",
  "location": "location as stated or null",
  "remote": "Yes/No/Hybrid or null",
  "job_type": "Full-time/Part-time/Contract/Internship or null",
  "seniority": "Entry/Mid/Senior/Lead/Staff/Principal or null",
  "department": "department if stated or null",
  "skills": ["Solidity","React","Python",...],
  "compensation": "salary verbatim from page or null",
  "category": "DeFi/NFT/Infrastructure/Trading/Security/Gaming/Payments/Compliance or null"
}

Rules:
- skills: specific technical skills only (e.g. "Solidity", "React", "Go"). Max 10. No soft skills.
- compensation: copy EXACTLY from page. Do NOT invent numbers.
- If text is too short or ambiguous, return null.`;

async function extractWithAI(pageText, partialResult) {
  if (SKIP_AI) return null;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: AI_SYSTEM },
            { role: 'user', content: `Company: ${partialResult.company}\nTitle: ${partialResult.job_title}\n\nPage text:\n${pageText.slice(0, 5000)}` },
          ],
          max_tokens: 600,
          temperature: 0,
          response_format: { type: 'json_object' },
        }),
      });
      if (response.status === 429) { await sleep(4000 + Math.random() * 3000); continue; }
      if (!response.ok) throw new Error(`API ${response.status}`);
      const data = await response.json();
      return JSON.parse(data.choices[0].message.content);
    } catch (err) {
      if (attempt < 2) { await sleep(2000); continue; }
      return null;
    }
  }
}

// ── Process a single job ───────────────────────────────────────────────
async function processJob(job, index, total) {
  if (progress[job.id]) return progress[job.id];

  const sourceType = detectSource(job.link);
  let result = null;
  let pageText = '';

  try {
    // Step 1: Fetch from ATS API
    if (sourceType === 'greenhouse' || sourceType === 'greenhouse-coinbase') {
      const data = await fetchGreenhouseJob(job.link);
      if (data) result = parseGreenhouseJob(data, job);
    } else if (sourceType === 'lever') {
      const data = await fetchLeverJob(job.link);
      if (data) result = parseLeverJob(data, job);
    } else if (sourceType === 'ashby') {
      const data = await fetchAshbyJob(job.link);
      if (data) result = parseAshbyJob(data, job);
    }

    // Step 2: Generic fallback — scrape page
    if (!result) {
      pageText = await fetchGenericPage(job.link) || '';
      result = {
        url: job.link,
        company: job.company,
        company_url: COMPANY_URLS[job.company] || '',
        job_title: job.title,
        location: '',
        remote: '',
        job_type: '',
        seniority: '',
        department: '',
        skills: '',
        compensation: '',
        source: job.source,
        category: '',
        published_date: job.date,
        description: pageText.slice(0, 4000),
        _needs_ai: pageText.length > 50,
      };
    }

    // Step 3: AI enrichment (only if OPENAI_API_KEY is set)
    if (!SKIP_AI && result._needs_ai) {
      const textForAI = pageText || result.description || '';
      if (textForAI.length > 50) {
        const ai = await extractWithAI(textForAI, result);
        if (ai) {
          if (!result.company_url && ai.company_url) result.company_url = ai.company_url;
          if (!result.location && ai.location) result.location = ai.location;
          if (!result.remote || result.remote === '') result.remote = ai.remote || result.remote || '';
          if (!result.job_type && ai.job_type) result.job_type = ai.job_type;
          if (!result.seniority && ai.seniority) result.seniority = ai.seniority;
          if (!result.department && ai.department) result.department = ai.department;
          if (!result.skills && ai.skills) result.skills = (ai.skills || []).join('; ');
          if (!result.compensation && ai.compensation) result.compensation = ai.compensation;
          if (!result.category && ai.category) result.category = ai.category;
        }
      }
    }

    delete result._needs_ai;
  } catch (err) {
    result = {
      url: job.link,
      company: job.company,
      company_url: COMPANY_URLS[job.company] || '',
      job_title: job.title,
      location: '',
      remote: '',
      job_type: '',
      seniority: '',
      department: '',
      skills: '',
      compensation: '',
      source: job.source,
      category: '',
      published_date: job.date,
      description: `[Error fetching: ${err.message || 'unknown'}]`,
    };
  }

  progress[job.id] = result;
  const tag = result.description?.length > 50 ? '✅' : '⚠️';
  console.log(`[${index}/${total}] ${tag} ${job.company}: ${job.title}`);
  return result;
}

// ── Main ───────────────────────────────────────────────────────────────
async function main() {
  const allJobs = JSON.parse(fs.readFileSync(JOBS_CACHE, 'utf-8'));
  const alreadyDone = Object.keys(progress).length;
  const pending = allJobs.filter(j => !progress[j.id]);
  console.log(`\nTotal jobs: ${allJobs.length}`);
  console.log(`Already extracted: ${alreadyDone}`);
  console.log(`Pending: ${pending.length}\n`);

  if (pending.length === 0) {
    console.log('Nothing to do — writing CSV from existing progress...');
  }

  const startTime = Date.now();
  let done = 0;

  for (let i = 0; i < pending.length; i += CONCURRENCY) {
    const batch = pending.slice(i, i + CONCURRENCY);
    await Promise.all(
      batch.map((job, j) => processJob(job, alreadyDone + i + j + 1, allJobs.length))
    );
    done += batch.length;
    saveProgress();

    if (done % 50 === 0 || done === pending.length) {
      const elapsed = ((Date.now() - startTime) / 60000).toFixed(1);
      const pct = ((alreadyDone + done) / allJobs.length * 100).toFixed(1);
      console.log(`--- ${pct}% | Done: ${alreadyDone + done}/${allJobs.length} | Elapsed: ${elapsed}m ---`);
    }
  }

  // ── Write CSV ────────────────────────────────────────────────────────
  const rows = allJobs.map(j => {
    const r = progress[j.id];
    if (!r) return null;
    return [
      r.url || j.link,
      r.company || j.company,
      r.company_url || '',
      r.job_title || j.title,
      r.location || '',
      r.remote || '',
      r.job_type || '',
      r.seniority || '',
      r.department || '',
      r.skills || '',
      r.compensation || '',
      r.source || j.source,
      r.category || '',
      r.published_date || j.date,
      r.description || '',
    ].map(csvEscape).join(',');
  }).filter(Boolean);

  fs.writeFileSync(OUTPUT_CSV, [CSV_HEADERS.join(','), ...rows].join('\n'), 'utf-8');

  // Stats
  const all = allJobs.map(j => progress[j.id]).filter(Boolean);
  const withDesc = all.filter(r => r.description && r.description.length > 50);
  const withComp = all.filter(r => r.compensation);
  const withSkills = all.filter(r => r.skills);
  const withLoc = all.filter(r => r.location);

  const elapsed = ((Date.now() - startTime) / 60000).toFixed(1);
  console.log(`\n=== DONE ===`);
  console.log(`Total rows: ${rows.length}`);
  console.log(`With description: ${withDesc.length} (${(withDesc.length/rows.length*100).toFixed(1)}%)`);
  console.log(`With compensation: ${withComp.length} (${(withComp.length/rows.length*100).toFixed(1)}%)`);
  console.log(`With skills: ${withSkills.length} (${(withSkills.length/rows.length*100).toFixed(1)}%)`);
  console.log(`With location: ${withLoc.length} (${(withLoc.length/rows.length*100).toFixed(1)}%)`);
  console.log(`Time: ${elapsed}m`);
  console.log(`CSV: ${OUTPUT_CSV}`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
