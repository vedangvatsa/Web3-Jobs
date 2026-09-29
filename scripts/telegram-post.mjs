#!/usr/bin/env node
/**
 * Telegram Job Poster
 * Posts five Web3 jobs per destination, at the three scheduled daily slots.
 * 
 * Usage:
 *   node scripts/telegram-post.mjs              # Post once
 *   node scripts/telegram-post.mjs --dry-run    # Preview without posting
 *   node scripts/telegram-post.mjs --schedule   # Run 3x/day daemon
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { deliverJobsOnce, persistJobsState, readJobsState } from './social/telegram-jobs-delivery.mjs';
import { assertPostingWindow, hasSentSlot, postingSlotFromEnv, SLOT_MINUTES_UTC } from './social/posting-slot.mjs';
import {
  isGeneralOrPlaceholderJobTitle,
  isUnrelatedOrNonWeb3JobTitle,
  isInvalidJobLink,
} from '../src/lib/job-filters.js';

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
const URL_LOG = path.join(path.dirname(new URL(import.meta.url).pathname), `../.telegram-job-urls-${channelSlug}.json`);
const POST_COOLDOWN_HOURS = 4;
const LAST_POST_FILE = path.join(path.dirname(new URL(import.meta.url).pathname), `../.telegram-posted-last-${channelSlug}.json`);
const LEDGER_FILE = path.join(path.dirname(new URL(import.meta.url).pathname), `../.telegram-jobs-deliveries-${channelSlug}.json`);

if (!BOT_TOKEN || !CHANNEL_ID) {
  console.error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHANNEL_ID');
  process.exit(1);
}




// ── Load posted history (avoid repeats) ──
function loadPosted() {
  return new Set(readJobsState(POSTED_LOG, []));
}

// ── Build URL with UTM ──
function withUtm(url, params) {
  const qs = new URLSearchParams(params).toString();
  return url + (url.includes('?') ? '&' : '?') + qs;
}

// ── Pick random jobs ──
async function pickJobs(count) {
  const cachePath = path.join(path.dirname(new URL(import.meta.url).pathname), '../content/jobs-runtime.json');
  let jobs;
  try {
    jobs = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  } catch {
    console.error('Could not read jobs-runtime.json');
    process.exit(1);
  }

  const posted = loadPosted();
  
  // Filter out already posted
  const available = jobs.filter(j => j.active !== false && !posted.has(String(j.id || j.link)));
  
  // Shuffle
  const shuffled = available.sort(() => Math.random() - 0.5);
  
  // 1 per company
  const selected = [];
  const usedCompanies = new Set();
  
  for (const j of shuffled) {
    if (selected.length >= count) break;
    const company = (j.company || '').trim();
    const title = (j.title || '').trim();
    const link = (j.link || '').trim();

    // Skip incomplete or invalid jobs missing title, company, or link
    if (!company || !title || !link) continue;
    if (isGeneralOrPlaceholderJobTitle(title)) continue;
    if (isUnrelatedOrNonWeb3JobTitle(title)) continue;
    if (isInvalidJobLink(link)) continue;

    if (usedCompanies.has(company.toLowerCase())) continue;
    usedCompanies.add(company.toLowerCase());
    selected.push(j);
  }
  
  // Shuffle final order
  selected.sort(() => Math.random() - 0.5);

  const results = [];
  for (const j of selected) {
    let chosenUrl = null;

    if (j.slug) {
      const siteUrl = `https://hashtagweb3.com/${j.slug}`;
      const isLive = await verifyJobUrlLive(siteUrl);
      if (isLive) {
        chosenUrl = withUtm(siteUrl, { utm_source: 'telegram', utm_medium: 'social', utm_campaign: 'web3hiring' });
      } else {
        console.warn(`⚠️ [404-check] Page https://hashtagweb3.com/${j.slug} returned 404 on live site. Falling back to direct ATS application link for ${j.company}.`);
      }
    }

    // If no slug or hashtagweb3 page returns 404, fall back to direct employer application link
    if (!chosenUrl && j.link) {
      chosenUrl = withUtm(j.link, { utm_source: 'hashtagweb3', utm_medium: 'telegram', utm_campaign: 'web3hiring' });
    }

    if (!chosenUrl) continue;

    results.push({
      key: String(j.id || j.link),
      slug: j.slug,
      url: chosenUrl,
      company: fixCompanyName((j.company || '').trim()),
      title: truncateTitle((j.title || '').trim()),
    });
  }

  return results;
}

// ── Live HTTP verification before sharing on Telegram ──
async function verifyJobUrlLive(targetUrl) {
  try {
    const urlObj = new URL(targetUrl);
    const cleanUrl = `${urlObj.origin}${urlObj.pathname}`;
    for (const method of ['GET', 'HEAD']) {
      const res = await fetch(cleanUrl, {
        method,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; HashtagWeb3LinkCheck/1.0)',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Dest': 'document',
          Accept: 'text/html,application/xhtml+xml',
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(8000),
      });
      // Only reject definite missing pages — 503/502 are transient Worker issues, not broken slugs.
      if (res.status === 404 || res.status === 410) return false;
      if (res.ok || res.status === 308 || res.status === 307 || res.status === 301 || res.status === 302) {
        return true;
      }
    }
    return true;
  } catch {
    // Network blip — prefer site URL over ATS when we have a slug.
    return true;
  }
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

  return lines.join('\n');
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
    signal: AbortSignal.timeout(30000),
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      ...(threadId ? { message_thread_id: Number(threadId) } : {}),
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Web3 News', url: 'https://t.me/web3newsfeed' }],
        ],
      },
    }),
  });

  const data = await res.json();

  if (!res.ok && data.ok !== false) throw new Error(`Unconfirmed Telegram response for ${chatId}`);
  return data;
}

// ── Post once ──
async function postOnce() {
  const slot = postingSlotFromEnv();
  assertPostingWindow(slot);
  if (!process.argv.includes('--dry-run')) persistJobsState({ syncOnly: true });
  const ledger = readJobsState(LEDGER_FILE, {});
  if (CHANNEL_IDS.every(chat => hasSentSlot(ledger, slot, chat))) { console.log(`Jobs already posted for ${slot.key}.`); return; }
  if (Object.values(ledger).some(receipt => receipt.status === 'reserved')) throw new Error('Unconfirmed Telegram job delivery requires review');
  const retry = slot && Object.values(ledger).find(receipt => receipt.slotKey === slot.key
    || (!receipt.slotKey && Date.parse(receipt.reservedAt) >= slot.start && Date.parse(receipt.reservedAt) < slot.end));
  const last = readJobsState(LAST_POST_FILE, undefined);
  if (!slot && last) {
    const hoursSince = (Date.now() - new Date(last.postedAt).getTime()) / (1000 * 60 * 60);
    if (hoursSince < POST_COOLDOWN_HOURS && !process.argv.includes('--force')) {
      console.log(`⏳ Last posted ${hoursSince.toFixed(1)}h ago. Cooldown is ${POST_COOLDOWN_HOURS}h. Skipping.`);
      return;
    }
  }

  const jobs = retry ? retry.jobs : await pickJobs(JOBS_PER_POST);
  if (!jobs.length) { console.log('No unposted jobs available; skipping.'); return; }
  const message = retry ? retry.message : formatMessage(jobs);
  
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
  await deliverJobsOnce({ jobs, message, chatIds: CHANNEL_IDS, postedFile: POSTED_LOG, lastFile: LAST_POST_FILE, urlFile: URL_LOG, ledgerFile: LEDGER_FILE, slot,
    send: (chat, text) => sendToTelegramChat(chat, text, { threadId: chat === CHANNEL_ID ? THREAD_ID : undefined }) });
}

// ── Schedule mode (3x/day) ──
async function schedule() {
  console.log('Scheduler started — 03:30, 11:30, 19:30 UTC');
  
  const check = async () => {
    const now = new Date();
    const slot = Object.entries(SLOT_MINUTES_UTC).find(([, minute]) => minute === now.getUTCHours() * 60 + now.getUTCMinutes())?.[0];
    if (slot) {
      process.env.TELEGRAM_PUBLISH_SLOT = slot;
      process.env.TELEGRAM_PUBLISH_DATE = now.toISOString().slice(0, 10);
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
  postOnce().catch(e => { console.error(String(e.message || e).replaceAll(BOT_TOKEN, '[redacted]')); process.exit(1); });
}
