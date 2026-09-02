#!/usr/bin/env npx tsx
/**
 * Bulk text posting to 10+ free platforms for SEO backlinks.
 * Strategy: Low concurrency per host to avoid IP blocks, high aggregate concurrency.
 */
import * as fs from 'fs';
import * as path from 'path';

const CONTENT_FILE = path.join(__dirname, 'bulk-knowledge-10k.json');
const args = process.argv.slice(2);
const limit = args.includes('--limit') ? parseInt(args[args.indexOf('--limit') + 1]) : 100;
const concurrency = args.includes('--concurrency') ? parseInt(args[args.indexOf('--concurrency') + 1]) : 10;
const stateSuffix = args.includes('--state') ? args[args.indexOf('--state') + 1] : 'all';
const STATE_FILE = path.join(__dirname, `text-post-state-${stateSuffix}.json`);

interface PostData { type: string; tag: string; headline: string; body?: string; seoTitle?: string; seoTags?: string[]; }
interface PostResult { host: string; url: string; title: string; timestamp: string; }
interface PostState { posted: Record<string, PostResult[]>; lastIndex: number; }

function loadState(): PostState {
 if (fs.existsSync(STATE_FILE)) return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
 return { posted: {}, lastIndex: 0 };
}
function saveState(state: PostState) {
 fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function buildTextContent(post: PostData) {
 const title = `${post.headline} - Web3 Jobs at HashtagWeb3.com`;
 const body = `${post.body}\n\nSearch 668+ open roles in ${post.tag} including smart contract development, DeFi analysis, and blockchain engineering at https://hashtagweb3.com.`;
 return { title, body };
}

// --- Multi-Host Dispatcher ---
async function postToHost(host: string, content: { title: string; body: string }): Promise<PostResult | null> {
 const t = new Date().toISOString();
 try {
 if (host === 'telegra.ph') {
 const acc = await fetch('https://api.telegra.ph/createAccount?short_name=HashtagWeb3&author_name=HashtagWeb3.com');
 const ad: any = await acc.json();
 if (!ad.ok) return null;
 const r = await fetch('https://api.telegra.ph/createPage', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 access_token: ad.result.access_token,
 title: content.title.slice(0, 256),
 author_name: 'HashtagWeb3.com',
 content: [{ tag: 'p', children: [content.body] }, { tag: 'p', children: [{ tag: 'a', attrs: { href: 'https://hashtagweb3.com' }, children: ['Browse Web3 Jobs'] }] }],
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
 if (host === 'hastebin') {
 const r = await fetch('https://hastebin.com/documents', { method: 'POST', body: content.title + '\n\n' + content.body });
 const d: any = await r.json();
 if (d.key) return { host: 'hastebin', url: `https://hastebin.com/raw/${d.key}`, title: content.title, timestamp: t };
 }
 if (host === 'dpaste.org') {
 const fd = new URLSearchParams();
 fd.append('content', content.body);
 fd.append('title', content.title);
 const r = await fetch('https://dpaste.org/api/', { method: 'POST', body: fd });
 const u = (await r.text()).trim();
 if (u.includes('dpaste')) return { host: 'dpaste.org', url: u, title: content.title, timestamp: t };
 }
 if (host === 'bashify.io') {
 const fd = new URLSearchParams();
 fd.append('text', content.body);
 fd.append('title', content.title);
 const r = await fetch('https://bashify.io/ajax/paste', { method: 'POST', body: fd });
 const d: any = await r.json();
 if (d.url) return { host: 'bashify.io', url: d.url, title: content.title, timestamp: t };
 }
 if (host === '8upload.com') {
 const fd = new URLSearchParams();
 fd.append('text', content.body);
 fd.append('title', content.title);
 const r = await fetch('https://8upload.com/api/paste', { method: 'POST', body: fd });
 const d: any = await r.json();
 if (d.url) return { host: '8upload.com', url: d.url, title: content.title, timestamp: t };
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
 return null;
 } catch { return null; }
}

async function main() {
 const posts: PostData[] = JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf-8'));
 const state = loadState();
 const startIdx = state.lastIndex;
 const batch = posts.slice(0, limit); // Start from beginning for new hosts
 const hosts = ['telegra.ph', 'paste.rs', 'hastebin', 'dpaste.org', 'bashify.io', '8upload.com', 'paste.ee'];

 console.log(`🚀 Final Blast: ${batch.length} posts to ${hosts.length} hosts | Concurrency: ${concurrency} per host`);


 let completed = 0;
 const startTime = Date.now();

 async function worker(host: string) {
 while (true) {
 const currentIdx = startIdx + completed;
 if (currentIdx >= startIdx + batch.length) break;
 const post = posts[currentIdx];
 if (!post) break;
 
 // Increment completed early to keep queue moving
 completed++;
 
 const content = buildTextContent(post);
 const res = await postToHost(host, content);
 if (res) {
 if (!state.posted[`post-${currentIdx}`]) state.posted[`post-${currentIdx}`] = [];
 state.posted[`post-${currentIdx}`].push(res);
 }

 if (completed % 10 === 0) {
 state.lastIndex = currentIdx;
 saveState(state);
 const rate = (completed / ((Date.now() - startTime) / 1000)).toFixed(1);
 process.stdout.write(`\r  [${completed}/${batch.length}] ${rate} posts/s - ${host} active...`);
 }
 await new Promise(r => setTimeout(r, 1000)); // 1s delay to be human-like
 }
 }

 // Launch workers for each host
 const allWorkers = [];
 for (const host of hosts) {
 for (let c = 0; c < concurrency; c++) {
 allWorkers.push(worker(host));
 }
 }

 await Promise.all(allWorkers);
 state.lastIndex = startIdx + batch.length;
 saveState(state);
 console.log(`\n📊 Explosion complete! State saved to ${STATE_FILE}`);
}

main().catch(err => { console.error(err); process.exit(1); });
