#!/usr/bin/env node
/**
 * Telegram AI Jobs Poster
 * Fetches jobs from top AI companies via Greenhouse/Ashby APIs,
 * posts a roundup of 5 AI roles to Telegram.
 *
 * Usage:
 *   node scripts/telegram-ai-jobs.mjs              # Post once
 *   node scripts/telegram-ai-jobs.mjs --dry-run    # Preview without posting
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

try { dotenv.config({ path: new URL('../.env.local', import.meta.url).pathname }); } catch {}

const BOT_TOKEN = process.env.TELEGRAM_AI_BOT_TOKEN;
const CHANNEL_ID = process.env.TELEGRAM_AI_CHANNEL_ID;
const JOBS_PER_POST = 5;
const POST_COOLDOWN_HOURS = 7;
const POSTED_LOG = path.join(path.dirname(new URL(import.meta.url).pathname), '../.telegram-ai-jobs-posted.json');
const LAST_POST_FILE = path.join(path.dirname(new URL(import.meta.url).pathname), '../.telegram-ai-jobs-last.json');

if (!BOT_TOKEN || !CHANNEL_ID) {
  console.error('Missing TELEGRAM_AI_BOT_TOKEN or TELEGRAM_AI_CHANNEL_ID');
  process.exit(1);
}

// ── AI Company boards ──
const GREENHOUSE_BOARDS = [
  { board: 'anthropic', company: 'Anthropic' },
  { board: 'scaleai', company: 'Scale AI' },
  { board: 'databricks', company: 'Databricks' },
  { board: 'xai', company: 'xAI' },
  { board: 'deepmind', company: 'Google DeepMind' },
];

const ASHBY_BOARDS = [
  { board: 'openai', company: 'OpenAI' },
  { board: 'cohere', company: 'Cohere' },
  { board: 'mistral', company: 'Mistral' },
  { board: 'perplexity', company: 'Perplexity' },
];

// ── AI/ML title filter ──
const AI_KEYWORDS = /\b(ai|a\.i\.|machine.?learn|ml\b|llm|nlp|deep.?learn|genai|generative|artificial.?intel|data.?scien|prompt|foundation.?model|computer.?vision|research.?scien|research.?eng|applied.?scien|model|inference|training|neural|reinforcement|rlhf|alignment|safety|fine.?tun|natural.?language|speech|robotics)\b/i;

// Roles to skip
const SKIP_TITLES = /\b(intern|co-op|contractor|part.?time|bounty|mechanic|nurse|driver|janitor|custodian|warehouse|retail|cashier)\b/i;

// ── Posted history ──
function loadPosted() {
  try {
    return new Set(JSON.parse(fs.readFileSync(POSTED_LOG, 'utf8')));
  } catch {
    return new Set();
  }
}

function savePosted(posted) {
  const arr = [...posted].slice(-500);
  fs.writeFileSync(POSTED_LOG, JSON.stringify(arr));
}

// ── Fetch from Greenhouse ──
async function fetchGreenhouse(board, company) {
  try {
    const res = await Promise.race([
      fetch(`https://boards-api.greenhouse.io/v1/boards/${board}/jobs?content=false`),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 15000)),
    ]);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    return (data.jobs || []).map(job => ({
      title: cleanTitle(job.title),
      company,
      link: job.absolute_url,
      location: job.location?.name || 'Remote',
      date: job.first_published || job.updated_at || new Date().toISOString(),
      id: String(job.id),
    })).filter(j => j.title && j.link);
  } catch (e) {
    console.warn(`  Skip ${company} (Greenhouse): ${e.message}`);
    return [];
  }
}

// ── Fetch from Ashby ──
async function fetchAshby(board, company) {
  try {
    const res = await Promise.race([
      fetch(`https://api.ashbyhq.com/posting-api/job-board/${board}`),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 15000)),
    ]);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    return (data.jobs || []).map(job => ({
      title: cleanTitle(job.title),
      company,
      link: job.jobUrl || `https://jobs.ashbyhq.com/${board}/${job.id}`,
      location: job.location || 'Remote',
      date: job.publishedAt || new Date().toISOString(),
      id: job.id,
    })).filter(j => j.title && j.link);
  } catch (e) {
    console.warn(`  Skip ${company} (Ashby): ${e.message}`);
    return [];
  }
}

// ── Clean title ──
function cleanTitle(title) {
  return title
    .replace(/\s*\(.*?\)\s*/g, ' ')  // strip parentheticals
    .replace(/\s*\[.*?\]\s*/g, ' ')   // strip brackets
    .replace(/,\s*(remote|hybrid|onsite)$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ── Fetch all AI jobs ──
async function fetchAllJobs() {
  console.log('  Fetching from Greenhouse...');
  const ghResults = await Promise.all(
    GREENHOUSE_BOARDS.map(b => fetchGreenhouse(b.board, b.company))
  );

  console.log('  Fetching from Ashby...');
  const abResults = await Promise.all(
    ASHBY_BOARDS.map(b => fetchAshby(b.board, b.company))
  );

  const all = [...ghResults.flat(), ...abResults.flat()];
  console.log(`  Total raw jobs: ${all.length}`);

  // Filter for AI/ML roles only
  const aiJobs = all.filter(j =>
    AI_KEYWORDS.test(j.title) && !SKIP_TITLES.test(j.title)
  );
  console.log(`  AI/ML filtered: ${aiJobs.length}`);

  // Sort by date descending (newest first)
  aiJobs.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Dedup by title+company
  const seen = new Set();
  const unique = [];
  for (const job of aiJobs) {
    const key = `${job.title.toLowerCase()}|${job.company.toLowerCase()}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(job);
    }
  }

  return unique;
}

// ── Format Telegram message ──
function formatMessage(jobs) {
  const lines = jobs.map(j => {
    const title = escapeHtml(j.title);
    const company = escapeHtml(j.company);
    const location = escapeHtml(j.location);
    return `<a href="${j.link}"><b>${title}</b></a>\n${company} · ${location}`;
  });

  return lines.join('\n\n');
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ── Send to Telegram ──
async function sendToTelegram(message) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHANNEL_ID,
      text: message,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
  });

  const data = await res.json();
  if (!data.ok) throw new Error(`Telegram API error: ${JSON.stringify(data)}`);
  return data;
}

// ── Main ──
async function postOnce() {
  // ── 7-hour cooldown ──
  try {
    const last = JSON.parse(fs.readFileSync(LAST_POST_FILE, 'utf8'));
    const hoursSince = (Date.now() - new Date(last.timestamp).getTime()) / 3.6e6;
    if (hoursSince < POST_COOLDOWN_HOURS && !process.argv.includes('--force')) {
      console.log(`⏳ Last posted ${hoursSince.toFixed(1)}h ago. Cooldown is ${POST_COOLDOWN_HOURS}h. Skipping.`);
      return;
    }
  } catch {}

  console.log('Fetching AI jobs...');
  const allJobs = await fetchAllJobs();
  console.log(`  ${allJobs.length} unique AI jobs`);

  // Filter out already posted
  const posted = loadPosted();
  const fresh = allJobs.filter(j => !posted.has(j.link));
  console.log(`  ${fresh.length} not yet posted`);

  if (fresh.length < JOBS_PER_POST) {
    console.log('  Not enough fresh jobs, resetting history');
    posted.clear();
    savePosted(posted);
    return postOnce();
  }

  // Pick JOBS_PER_POST jobs, spread across companies
  const selected = [];
  const usedCompanies = new Set();

  // First pass: one per company
  for (const job of fresh) {
    if (selected.length >= JOBS_PER_POST) break;
    if (!usedCompanies.has(job.company)) {
      selected.push(job);
      usedCompanies.add(job.company);
    }
  }

  // Second pass: fill remaining slots
  for (const job of fresh) {
    if (selected.length >= JOBS_PER_POST) break;
    if (!selected.includes(job)) {
      selected.push(job);
    }
  }

  const message = formatMessage(selected);

  if (process.argv.includes('--dry-run')) {
    console.log('\n=== DRY RUN ===\n');
    console.log(message.replace(/<[^>]+>/g, ''));
    console.log(`\n${selected.length} jobs selected`);
    return;
  }

  const result = await sendToTelegram(message);
  const now = new Date().toLocaleString('en-US', { timeZone: 'Asia/Singapore' });
  console.log(`Posted ${selected.length} jobs at ${now} | Message ID: ${result.result.message_id}`);

  // Mark as posted
  for (const j of selected) posted.add(j.link);
  savePosted(posted);

  // Save cooldown timestamp
  fs.writeFileSync(LAST_POST_FILE, JSON.stringify({ timestamp: new Date().toISOString() }));
}

postOnce().catch(e => { console.error(e); process.exit(1); });
