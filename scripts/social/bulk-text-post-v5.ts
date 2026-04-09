#!/usr/bin/env npx tsx
/**
 * Bulk text posting V5: 10 Hosts + Token Rotation + 400+ Total Concurrency.
 */
import * as fs from 'fs';
import * as path from 'path';

const CONTENT_FILE = path.join(__dirname, 'bulk-knowledge-10k.json');
const TOKEN_FILE = path.join(__dirname, 'telegraph-tokens.json');
const args = process.argv.slice(2);
const limit = args.includes('--limit') ? parseInt(args[args.indexOf('--limit') + 1]) : 10000;
const concurrencyPerHost = args.includes('--concurrency') ? parseInt(args[args.indexOf('--concurrency') + 1]) : 40;
const stateSuffix = args.includes('--state') ? args[args.indexOf('--state') + 1] : 'v5-massive';
const STATE_FILE = path.join(__dirname, `text-post-state-${stateSuffix}.json`);

interface PostData { title: string; body: string; tags: string[]; headline: string; anchorText?: string; }
interface PostResult { host: string; url: string; title: string; timestamp: string; }
interface PostState { posted: Record<string, PostResult[]>; lastIndex: number; }

const tokens: string[] = JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf-8'));

function loadState(): PostState {
  if (fs.existsSync(STATE_FILE)) return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
  return { posted: {}, lastIndex: 0 };
}
function saveState(state: PostState) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// --- Host Methods ---
async function postToHost(host: string, content: PostData, token?: string): Promise<PostResult | null> {
  const t = new Date().toISOString();
  try {
    if (host === 'telegra.ph' && token) {
      const r = await fetch('https://api.telegra.ph/createPage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: token,
          title: content.title.slice(0, 256),
          author_name: 'HashtagWeb3.com',
          author_url: 'https://hashtagweb3.com',
          content: [
            { tag: 'p', children: [content.body] },
            { tag: 'p', children: [{ tag: 'a', attrs: { href: 'https://hashtagweb3.com' }, children: [content.anchorText || 'Browse Web3 Jobs'] }] }
          ],
        }),
      });
      const d: any = await r.json();
      if (d.ok) return { host: 'telegra.ph', url: d.result.url, title: content.title, timestamp: t };
    }
    if (host === 'paste.rs') {
      const r = await fetch('https://paste.rs/', { method: 'POST', body: content.title + '\n\n' + content.body });
      const u = (await r.text()).trim();
      if (u.startsWith('http')) return { host: 'paste.rs', url: u, title: content.title, timestamp: t };
    }
    if (host === 'dpaste.org') {
      const fd = new URLSearchParams();
      fd.append('content', content.body);
      fd.append('title', content.title);
      const r = await fetch('https://dpaste.org/api/', { method: 'POST', body: fd, headers: { 'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36` } });
      const u = (await r.text()).trim();
      if (u.includes('dpaste')) return { host: 'dpaste.org', url: u, title: content.title, timestamp: t };
    }
    if (host === 'paste.ee') {
      const r = await fetch('https://api.paste.ee/v1/pastes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections: [{ name: content.title, contents: content.body }] }),
      });
      const d: any = await r.json();
      if (d.link) return { host: 'paste.ee', url: d.link, title: content.title, timestamp: t };
    }
    if (host === 'bashify.io') {
      const fd = new URLSearchParams();
      fd.append('text', content.body);
      fd.append('title', content.title);
      const r = await fetch('https://bashify.io/ajax/paste', { method: 'POST', body: fd });
      const d: any = await r.json();
      if (d.url) return { host: 'bashify.io', url: d.url, title: content.title, timestamp: t };
    }
    if (host === 'vpaste.net') {
      const r = await fetch('https://vpaste.net/api/paste', { method: 'POST', body: content.body });
      const u = (await r.text()).trim();
      if (u.includes('vpaste')) return { host: 'vpaste.net', url: u, title: content.title, timestamp: t };
    }
    if (host === 'shrib.com') {
      const r = await fetch(`https://shrib.com/${Math.random().toString(36).slice(2, 10)}`, { method: 'POST', body: content.body });
      if (r.ok) return { host: 'shrib.com', url: r.url, title: content.title, timestamp: t };
    }
    if (host === 'p.rst.im') {
      const r = await fetch('https://p.rst.im/', { method: 'POST', body: content.body });
      if (r.ok) return { host: 'p.rst.im', url: r.url, title: content.title, timestamp: t };
    }
    if (host === 'textbin.net') {
      const fd = new URLSearchParams();
      fd.append('text', content.body);
      fd.append('title', content.title);
      const r = await fetch('https://textbin.net/api/paste', { method: 'POST', body: fd });
      const d: any = await r.json();
      if (d.url) return { host: 'textbin.net', url: d.url, title: content.title, timestamp: t };
    }
    return null;
  } catch { return null; }
}

async function main() {
  const posts: PostData[] = JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf-8'));
  const state = loadState();
  const startIdx = state.lastIndex;
  const batch = posts.slice(startIdx, startIdx + limit);
  // Using 9 hosts now to increase distribution and avoid IP bans.
  const hosts = ['telegra.ph', 'paste.rs', 'dpaste.org', 'paste.ee', 'bashify.io', 'vpaste.net', 'shrib.com', 'p.rst.im', 'textbin.net'];

  console.log(`🚀 V5 ULTRA Massive Blast: ${batch.length} posts to ${hosts.length} hosts | Concurrency: ${concurrencyPerHost} per host | Total: ${concurrencyPerHost * hosts.length}`);

  let completed = 0;
  const startTime = Date.now();

  async function worker(host: string, workerId: number) {
    while (true) {
      const idx = completed++;
      if (idx >= batch.length) break;
      const post = batch[idx];
      const token = tokens[(workerId + idx) % tokens.length];

      const res = await postToHost(host, post, token);
      if (res) {
        if (!state.posted[`post-${startIdx + idx}`]) state.posted[`post-${startIdx + idx}`] = [];
        state.posted[`post-${startIdx + idx}`].push(res);
      }

      if (idx % 20 === 0) {
        const rate = (idx / ((Date.now() - startTime) / 1000)).toFixed(1);
        process.stdout.write(`\r  [${idx}/${batch.length}] ${rate} articles/s — Processing ${host}...`);
        saveState(state);
      }
      const delay = 500 + Math.random() * 3000;
      await new Promise(r => setTimeout(r, delay));
    }
  }

  const allWorkers = [];
  for (const host of hosts) {
    for (let c = 0; c < concurrencyPerHost; c++) {
      allWorkers.push(worker(host, c));
    }
  }

  await Promise.all(allWorkers);
  state.lastIndex = startIdx + batch.length;
  saveState(state);
  console.log(`\n📊 V5 Blast Complete! State: ${STATE_FILE}`);
}

main().catch(console.error);
