#!/usr/bin/env npx tsx
/**
 * Bulk text posting V3: Token rotation + 100 aggregate concurrency.
 */
import * as fs from 'fs';
import * as path from 'path';

const CONTENT_FILE = path.join(__dirname, 'bulk-knowledge-10k.json');
const TOKEN_FILE = path.join(__dirname, 'telegraph-tokens.json');
const args = process.argv.slice(2);
const limit = args.includes('--limit') ? parseInt(args[args.indexOf('--limit') + 1]) : 1000;
const concurrency = args.includes('--concurrency') ? parseInt(args[args.indexOf('--concurrency') + 1]) : 50;
const stateSuffix = args.includes('--state') ? args[args.indexOf('--state') + 1] : 'v3';
const STATE_FILE = path.join(__dirname, `text-post-state-${stateSuffix}.json`);

interface PostData { title: string; body: string; tags: string[]; headline: string; }
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

async function postToTelegraph(content: PostData, token: string): Promise<PostResult | null> {
  try {
    const r = await fetch('https://api.telegra.ph/createPage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_token: token,
        title: content.title.slice(0, 256),
        author_name: 'HashtagWeb3.com',
        author_url: 'https://hashtagweb3.com',
        content: [{ tag: 'p', children: [content.body] }, { tag: 'p', children: [{ tag: 'a', attrs: { href: 'https://hashtagweb3.com' }, children: ['Browse Web3 Jobs'] }] }],
      }),
    });
    const d: any = await r.json();
    if (d.ok) return { host: 'telegra.ph', url: d.result.url, title: content.title, timestamp: new Date().toISOString() };
    return null;
  } catch { return null; }
}

async function postToPasteRs(content: PostData): Promise<PostResult | null> {
  try {
    const r = await fetch('https://paste.rs/', { method: 'POST', body: content.title + '\n\n' + content.body });
    const u = (await r.text()).trim();
    if (u.startsWith('http')) return { host: 'paste.rs', url: u, title: content.title, timestamp: new Date().toISOString() };
    return null;
  } catch { return null; }
}

async function main() {
  const posts: PostData[] = JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf-8'));
  const state = loadState();
  const startIdx = state.lastIndex;
  const batch = posts.slice(startIdx, startIdx + limit);

  console.log(`🚀 V3 Explosion: ${batch.length} articles to 2 hosts | Concurrency: ${concurrency} each | Total: ${concurrency * 2}`);

  let completed = 0;
  const startTime = Date.now();

  async function worker(host: string, workerId: number) {
    while (true) {
      const idx = completed++;
      if (idx >= batch.length) break;
      const post = batch[idx];
      const token = tokens[(workerId + idx) % tokens.length];

      let res: PostResult | null = null;
      if (host === 'telegra.ph') res = await postToTelegraph(post, token);
      else if (host === 'paste.rs') res = await postToPasteRs(post);

      if (res) {
        if (!state.posted[`post-${startIdx + idx}`]) state.posted[`post-${startIdx + idx}`] = [];
        state.posted[`post-${startIdx + idx}`].push(res);
      }

      if (idx % 20 === 0) {
        const rate = (idx / ((Date.now() - startTime) / 1000)).toFixed(1);
        process.stdout.write(`\r  [${idx}/${batch.length}] ${rate} articles/s — Processing...`);
        saveState(state);
      }
      const delay = 500 + Math.random() * 1000; // 0.5s - 1.5s randomized delay
      await new Promise(r => setTimeout(r, delay));
    }
  }

  const workers = [
    ...Array.from({ length: concurrency }, (_, i) => worker('telegra.ph', i)),
    ...Array.from({ length: concurrency }, (_, i) => worker('paste.rs', i + concurrency))
  ];

  await Promise.all(workers);
  state.lastIndex = startIdx + batch.length;
  saveState(state);
  console.log(`\n📊 V3 Blast Complete! State: ${STATE_FILE}`);
}

main().catch(console.error);
