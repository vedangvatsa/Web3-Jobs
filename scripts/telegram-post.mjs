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
const THREAD_ID = process.env.TELEGRAM_THREAD_ID;
// Cross-post channel digests to @jobsweb3. Skip extras for forum-topic posts
// (hashtagweb3 group) so we don't fire a second, different roundup there.
const EXTRA_CHANNEL_IDS = THREAD_ID
  ? []
  : (process.env.TELEGRAM_EXTRA_CHANNEL_IDS ?? '@jobsweb3')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
const CHANNEL_IDS = [...new Set([CHANNEL_ID, ...EXTRA_CHANNEL_IDS].filter(Boolean))];
const JOBS_PER_POST = 5;
const CTA_URL = 'https://hashtagweb3.com?utm_source=telegram&utm_medium=social&utm_campaign=daily_jobs';
// Use channel-specific state files so channel + group posts don't share cooldowns
const channelSlug = (CHANNEL_ID || '').replace(/[^a-zA-Z0-9]/g, '');
const POSTED_LOG = path.join(path.dirname(new URL(import.meta.url).pathname), `../.telegram-posted-${channelSlug}.json`);
const POST_COOLDOWN_HOURS = 7;
const LAST_POST_FILE = path.join(path.dirname(new URL(import.meta.url).pathname), `../.telegram-posted-last-${channelSlug}.json`);

if (!BOT_TOKEN || !CHANNEL_ID) {
  console.error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHANNEL_ID');
  process.exit(1);
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
  const cachePath = path.join(path.dirname(new URL(import.meta.url).pathname), '../content/jobs-cache.json');
  let jobs;
  try {
    jobs = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  } catch {
    console.error('Could not read jobs-cache.json');
    process.exit(1);
  }

  const posted = loadPosted();
  
  // Filter out already posted
  const available = jobs.filter(j => !posted.has(j.id || j.link));
  
  // If running low, reset
  if (available.length < count * 3) {
    posted.clear();
    savePosted(posted);
    return pickJobs(count);
  }
  
  // Shuffle
  const shuffled = available.sort(() => Math.random() - 0.5);
  
  // 1 per company
  const selected = [];
  const usedCompanies = new Set();
  
  for (const j of shuffled) {
    if (selected.length >= count) break;
    const company = (j.company || '').trim();
    if (usedCompanies.has(company.toLowerCase())) continue;
    usedCompanies.add(company.toLowerCase());
    selected.push(j);
  }
  
  // Shuffle final order
  selected.sort(() => Math.random() - 0.5);
  
  // Mark as posted
  for (const j of selected) posted.add(j.id || j.link);
  savePosted(posted);
  
  return selected.map(j => ({
    url: j.link,
    company: fixCompanyName((j.company || '').trim()),
    title: truncateTitle((j.title || '').trim()),
  }));
}

// ── Shorten long titles: drop qualifiers after , or - or ( ──
function truncateTitle(title) {
  // Drop after comma (only if result is meaningful: 2+ words, 8+ chars)
  const comma = title.indexOf(',');
  if (comma > 0) {
    const before = title.slice(0, comma).trim();
    if (before.split(/\s+/).length >= 2 && before.length >= 8) title = before;
  }
  // Drop the short side of " - " splits
  const dash = title.indexOf(' - ');
  if (dash > 0) {
    const before = title.slice(0, dash).trim();
    const after = title.slice(dash + 3).trim();
    if (before.split(/\s+/).length >= 2 && before.length >= 8) {
      title = before; // before is meaningful, drop suffix
    } else if (after.split(/\s+/).length >= 2 && after.length >= 8) {
      title = after;  // before is a short qualifier like "Mid", keep after
    }
  }
  // Drop parenthetical suffixes
  const paren = title.indexOf('(');
  if (paren > 10) title = title.slice(0, paren).trim();
  return title;
}

// ── Fix company name casing ──
const COMPANY_NAMES = {
  // Exchanges
  'okx': 'OKX',
  'binance': 'Binance',
  'coinbase': 'Coinbase',
  'robinhood': 'Robinhood',
  'gemini': 'Gemini',
  'bybit': 'Bybit',
  'bitmex': 'BitMEX',
  'bitpanda': 'Bitpanda',
  'luno': 'Luno',
  'gate': 'Gate.io',
  'coingecko': 'CoinGecko',
  'moonpay': 'MoonPay',
  'breezecash': 'Breeze',
  'xapo61': 'Xapo',
  'b2c2': 'B2C2',
  'bcbgroup': 'BCB Group',
  'bitgo': 'BitGo',
  // L1/L2/Infra
  'ripple': 'Ripple',
  'blockchain': 'Blockchain.com',
  'consensys': 'Consensys',
  'alchemy': 'Alchemy',
  'fireblocks': 'Fireblocks',
  'layerzerolabs': 'LayerZero',
  'polygon-labs': 'Polygon Labs',
  'mystenlabs': 'Mysten Labs',
  'aptoslabs': 'Aptos Labs',
  'hashgraph': 'Hedera',
  'offchainlabs': 'Offchain Labs',
  'monad.foundation': 'Monad Foundation',
  'seifoundation': 'Sei Foundation',
  'basejobs': 'Base',
  'cosmos': 'Cosmos',
  'celestia': 'Celestia',
  'walrus': 'Walrus',
  'nexus': 'Nexus',
  // DeFi/Protocols
  'uniswap': 'Uniswap',
  'compound': 'Compound',
  '1inch': '1inch',
  'ethena': 'Ethena',
  'jito': 'Jito',
  // Security/Compliance
  'chainalysis-careers': 'Chainalysis',
  'complyadvantage': 'ComplyAdvantage',
  'cantina': 'Cantina',
  // Funds/Research
  'a16z': 'a16z',
  'paradigm': 'Paradigm',
  'galaxydigitalservices': 'Galaxy Digital',
  'digitalcurrencygroup': 'DCG',
  'grayscaleinvestments': 'Grayscale',
  'delphi': 'Delphi Digital',
  'flipsidecrypto': 'Flipside',
  // Consumer/Gaming
  'brave': 'Brave',
  'phantom': 'Phantom',
  'opensea': 'OpenSea',
  'skymavis': 'Sky Mavis',
  'animocabrands': 'Animoca Brands',
  'immutable': 'Immutable',
  'foundation': 'Foundation',
  // Infra/Tools
  'mesh': 'Mesh',
  'securitize': 'Securitize',
  'lightspark': 'Lightspark',
  'taxbit': 'TaxBit',
  'trust-wallet': 'Trust Wallet',
  'flowtraders': 'Flow Traders',
  'wintermute-trading': 'Wintermute',
  'shakepay': 'Shakepay',
  'blackbird-labs-inc': 'Blackbird',
  'tempo-xyz': 'Tempo',
  'kalshi': 'Kalshi',
  'rampnetwork': 'Ramp Network',
  'figment': 'Figment',
  'noise-labs': 'Noise Labs',
  'sentient': 'Sentient',
  'eigen-labs': 'Eigen Labs',
  'dune': 'Dune',
  'artemis': 'Artemis',
  'ashby': 'Ashby',
  '0x': '0x',
  'm0dbathenextthingltd': 'M0',
  'anchorage': 'Anchorage Digital',
  // Special
  'relay.link': 'Relay',
  'dYdX': 'dYdX',
  '0x Labs': '0x Labs',
};
function fixCompanyName(name) {
  return COMPANY_NAMES[name.toLowerCase()] || COMPANY_NAMES[name] || name;
}

// ── Format message (Telegram HTML) ──
function formatMessage(jobs) {
  const lines = jobs.map(j => {
    // Escape HTML entities in company and title
    const company = escapeHtml(j.company);
    const title = escapeHtml(j.title);
    return `• ${company} is hiring <a href="${j.url}">${title}</a>`;
  });

  let text = lines.join('\n');
  text += `\n\n_\n`;
  text += `Tech Jobs: <a href="https://t.me/techjobsdaily">t.me/techjobsdaily</a>`;
  return text;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ── Send to Telegram ──
async function sendToTelegramChat(chatId, message, { threadId } = {}) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      ...(threadId ? { message_thread_id: Number(threadId) } : {}),
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Turn your CV into a Website', url: 'https://cvin.bio/?utm_source=social&utm_medium=telegram&utm_campaign=web3hiring' }],
        ],
      },
    }),
  });

  const data = await res.json();

  if (!data.ok) {
    throw new Error(`Telegram API error (${chatId}): ${JSON.stringify(data)}`);
  }

  return data;
}

/** Post the same digest to the primary channel (and extras like @jobsweb3). */
async function sendToTelegram(message) {
  const results = [];
  const errors = [];

  for (const chatId of CHANNEL_IDS) {
    // Thread ID only applies to the primary forum destination.
    const threadId = chatId === CHANNEL_ID ? THREAD_ID : undefined;
    try {
      const data = await sendToTelegramChat(chatId, message, { threadId });
      console.log(`  ✅ ${chatId} message ID: ${data.result.message_id}`);
      results.push({ chatId, data });
    } catch (e) {
      console.error(`  ❌ ${chatId}: ${e.message}`);
      errors.push({ chatId, error: e });
    }
  }

  return { results, errors };
}

// ── Post once ──
async function postOnce() {
  // ── 8-hour cooldown ──
  try {
    const last = JSON.parse(fs.readFileSync(LAST_POST_FILE, 'utf8'));
    const hoursSince = (Date.now() - new Date(last.postedAt).getTime()) / (1000 * 60 * 60);
    if (hoursSince < POST_COOLDOWN_HOURS && !process.argv.includes('--force')) {
      console.log(`⏳ Last posted ${hoursSince.toFixed(1)}h ago. Cooldown is ${POST_COOLDOWN_HOURS}h. Skipping.`);
      return;
    }
  } catch {}

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
  
  console.log(`📢 Destinations: ${CHANNEL_IDS.join(', ')}`);
  const { results, errors } = await sendToTelegram(message);
  if (results.length === 0) {
    throw errors[0]?.error || new Error('Telegram post failed for all channels');
  }

  const now = new Date().toLocaleString('en-US', { timeZone: 'Asia/Singapore' });
  console.log(
    `✅ Posted ${jobs.length} jobs at ${now} → ${results.map((r) => r.chatId).join(', ')}`
  );

  // Save cooldown even on partial success so @web3hiring isn't double-fired.
  fs.writeFileSync(LAST_POST_FILE, JSON.stringify({ postedAt: new Date().toISOString() }));

  if (errors.length > 0) {
    const detail = errors.map((e) => `${e.chatId}: ${e.error.message}`).join('; ');
    throw new Error(`Posted to ${results.map((r) => r.chatId).join(', ')}, but failed: ${detail}`);
  }
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
