#!/usr/bin/env node
/**
 * Telegram Job Poster
 * Posts 10 random Web3 jobs to Telegram channel 3x/day
 * 
 * Usage:
 *   node scripts/telegram-post.mjs              # Post once
 *   node scripts/telegram-post.mjs --dry-run    # Preview without posting
 *   node scripts/telegram-post.mjs --schedule   # Run 3x/day daemon
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

try { dotenv.config({ path: new URL('../.env.local', import.meta.url).pathname }); } catch {}

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;
const JOBS_PER_POST = 10;
const CTA_URL = 'https://hashtagweb3.com?utm_source=telegram&utm_medium=social&utm_campaign=daily_jobs';
const POSTED_LOG = path.join(path.dirname(new URL(import.meta.url).pathname), '../.telegram-posted.json');

if (!BOT_TOKEN || !CHANNEL_ID) {
  console.error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHANNEL_ID');
  process.exit(1);
}

// ── CSV Parser ──
function parseCSV(text) {
  const rows = []; let cur = []; let field = ''; let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQ) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') inQ = false;
      else field += ch;
    } else {
      if (ch === '"') inQ = true;
      else if (ch === ',') { cur.push(field); field = ''; }
      else if (ch === '\n' || (ch === '\r' && text[i + 1] === '\n')) {
        cur.push(field); field = '';
        if (cur.length >= 12) rows.push(cur);
        cur = [];
        if (ch === '\r') i++;
      } else field += ch;
    }
  }
  if (cur.length >= 12) rows.push(cur);
  return rows;
}

// ── Load posted history (avoid repeats) ──
function loadPosted() {
  try {
    return new Set(JSON.parse(fs.readFileSync(POSTED_LOG, 'utf8')));
  } catch {
    return new Set();
  }
}

function savePosted(posted) {
  // Keep last 500 to allow cycling
  const arr = [...posted].slice(-500);
  fs.writeFileSync(POSTED_LOG, JSON.stringify(arr));
}

// ── Pick random jobs ──
function pickJobs(count) {
  const csvPath = path.join(path.dirname(new URL(import.meta.url).pathname), '../jobs-extracted.csv');
  const rows = parseCSV(fs.readFileSync(csvPath, 'utf8'));
  const data = rows.slice(1); // skip header

  const posted = loadPosted();
  
  // Filter out already posted
  const available = data.filter(r => !posted.has((r[0] || '').trim()));
  
  // If running low, reset
  if (available.length < count * 3) {
    posted.clear();
    savePosted(posted);
    return pickJobs(count);
  }
  
  // Shuffle
  const shuffled = available.sort(() => Math.random() - 0.5);
  
  // Split into marketing/BD and other
  const BD_DEPTS = ['Marketing', 'Sales', 'Business Development'];
  const bdPool = shuffled.filter(r => BD_DEPTS.includes((r[8] || '').trim()));
  const otherPool = shuffled.filter(r => !BD_DEPTS.includes((r[8] || '').trim()));
  
  // Pick at least 3 marketing/BD, rest from other — 1 per company
  const selected = [];
  const usedCompanies = new Set();
  
  // Pick BD roles first
  for (const r of bdPool) {
    if (selected.length >= 3) break;
    const company = (r[1] || '').trim();
    if (usedCompanies.has(company)) continue;
    usedCompanies.add(company);
    selected.push(r);
  }
  
  // Fill the rest from other
  for (const r of otherPool) {
    if (selected.length >= count) break;
    const company = (r[1] || '').trim();
    if (usedCompanies.has(company)) continue;
    usedCompanies.add(company);
    selected.push(r);
  }
  
  // If still short, allow more BD
  for (const r of bdPool) {
    if (selected.length >= count) break;
    const company = (r[1] || '').trim();
    if (usedCompanies.has(company)) continue;
    usedCompanies.add(company);
    selected.push(r);
  }
  
  // Shuffle final order
  selected.sort(() => Math.random() - 0.5);
  
  // Mark as posted
  for (const r of selected) posted.add((r[0] || '').trim());
  savePosted(posted);
  
  return selected.map(r => ({
    url: (r[0] || '').trim(),
    company: fixCompanyName((r[1] || '').trim()),
    title: truncateTitle((r[3] || '').trim()),
  }));
}

// ── Shorten long titles: drop qualifiers after , or - or ( ──
function truncateTitle(title) {
  // Drop after comma
  const comma = title.indexOf(',');
  if (comma > 0) title = title.slice(0, comma).trim();
  // Drop after " - " (but not hyphens inside words)
  const dash = title.indexOf(' - ');
  if (dash > 0) title = title.slice(0, dash).trim();
  // Drop parenthetical suffixes
  const paren = title.indexOf('(');
  if (paren > 10) title = title.slice(0, paren).trim();
  return title;
}

// ── Fix company name casing ──
const COMPANY_NAMES = {
  'okx': 'OKX',
  'a16z': 'a16z',
};
function fixCompanyName(name) {
  return COMPANY_NAMES[name.toLowerCase()] || name;
}

// ── Format message (Telegram HTML) ──
function formatMessage(jobs) {
  const lines = jobs.map(j => {
    // Escape HTML entities in company and title
    const company = escapeHtml(j.company);
    const title = escapeHtml(j.title);
    return `• ${company} is hiring <a href="${j.url}">${title}</a>`;
  });

  const message = lines.join('\n') +
    '\n\n—\n' +
    `Web3 Jobs: <a href="${CTA_URL}">hashtagweb3.com</a>`;

  return message;
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
  
  if (!data.ok) {
    throw new Error(`Telegram API error: ${JSON.stringify(data)}`);
  }
  
  return data;
}

// ── Post once ──
async function postOnce() {
  const jobs = pickJobs(JOBS_PER_POST);
  const message = formatMessage(jobs);
  
  if (process.argv.includes('--dry-run')) {
    // Write to file if --output-file specified (for CI)
    const fileIdx = process.argv.indexOf('--output-file');
    if (fileIdx > -1 && process.argv[fileIdx + 1]) {
      fs.writeFileSync(process.argv[fileIdx + 1], message);
      console.log(`Message written to ${process.argv[fileIdx + 1]}`);
    }
    console.log('=== DRY RUN ===\n');
    console.log(message.replace(/<[^>]+>/g, '')); // strip HTML for terminal
    console.log(`\n${jobs.length} jobs selected`);
    return;
  }
  
  const result = await sendToTelegram(message);
  const now = new Date().toLocaleString('en-US', { timeZone: 'Asia/Singapore' });
  console.log(`✅ Posted ${jobs.length} jobs at ${now} | Message ID: ${result.result.message_id}`);
}

// ── Schedule mode (3x/day) ──
async function schedule() {
  // Post at 9 AM, 1 PM, 6 PM SGT
  const HOURS = [9, 13, 18];
  
  console.log('📅 Scheduler started — posting at 9AM, 1PM, 6PM SGT');
  
  const check = async () => {
    const now = new Date();
    const sgt = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Singapore' }));
    const hour = sgt.getHours();
    const minute = sgt.getMinutes();
    
    if (HOURS.includes(hour) && minute === 0) {
      try {
        await postOnce();
      } catch (e) {
        console.error(`❌ Error posting: ${e.message}`);
      }
    }
  };
  
  // Check every minute
  setInterval(check, 60 * 1000);
  await check(); // immediate check
}

// ── Main ──
if (process.argv.includes('--schedule')) {
  schedule();
} else {
  postOnce().catch(e => { console.error(e); process.exit(1); });
}
