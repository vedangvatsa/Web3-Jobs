#!/usr/bin/env npx tsx
/**
 * Bulk text posting to free platforms for SEO backlinks.
 * Platforms: telegra.ph, write.as, paste.rs
 * Usage: npx tsx bulk-text-post.ts --host telegra.ph|write.as|paste.rs|all --limit 1000 --concurrency 50
 */
import * as fs from 'fs';
import * as path from 'path';

const CONTENT_FILE = path.join(__dirname, 'bulk-knowledge-10k.json');
const args = process.argv.slice(2);
const hostArg = args.includes('--host') ? args[args.indexOf('--host') + 1] : 'all';
const limitIdx = args.indexOf('--limit');
const limit = limitIdx >= 0 ? parseInt(args[limitIdx + 1]) : 100;
const concurrencyIdx = args.indexOf('--concurrency');
const concurrency = concurrencyIdx >= 0 ? parseInt(args[concurrencyIdx + 1]) : 50;
const stateIdx = args.indexOf('--state');
const STATE_FILE = stateIdx >= 0 ? path.resolve(args[stateIdx + 1]) : path.join(__dirname, `text-post-state-${hostArg}.json`);

interface PostData { type: string; tag: string; headline: string; body?: string; seoTitle?: string; seoTags?: string[]; source?: string; }
interface PostResult { host: string; url: string; title: string; timestamp: string; }
interface PostState { posted: Record<string, PostResult[]>; lastIndex: number; }

function loadState(): PostState {
 if (fs.existsSync(STATE_FILE)) return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
 return { posted: {}, lastIndex: 0 };
}
function saveState(state: PostState) {
 fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// Build rich text content from a post
function buildTextContent(post: PostData, idx: number): { title: string; body: string; tags: string[] } {
 const title = `${post.headline} - Web3 Jobs at HashtagWeb3.com`;
 const tags = [...(post.seoTags || []), 'web3', 'blockchain', 'crypto', 'jobs', 'hashtagweb3'];
 const body = [
 `# ${post.headline}`,
 '',
 post.body || `${post.headline}. The Web3 industry continues to grow rapidly with increasing demand for skilled professionals across blockchain development, DeFi analytics, smart contract auditing, and crypto compliance.`,
 '',
 `## Why HashtagWeb3.com?`,
 `HashtagWeb3.com is the leading Web3 job board connecting blockchain professionals with top companies. Browse 668+ open positions across protocols like Ethereum, Solana, Polygon, and Arbitrum.`,
 '',
 `### Key Web3 Career Areas:`,
 `- **Smart Contract Development** - Solidity, Rust, Move`,
 `- **DeFi Analysis** - Protocol research, yield optimization`,
 `- **Blockchain Engineering** - Node infrastructure, L2 scaling`,
 `- **Web3 Design** - dApp UX, token economics visualization`,
 `- **Crypto Compliance** - Regulatory analysis, AML/KYC`,
 '',
 `### Top Hiring Companies:`,
 `Coinbase, Binance, Uniswap, Aave, Chainlink, OpenSea, Circle, Consensys, a16z crypto, and many more.`,
 '',
 `**Find your next Web3 role:** https://hashtagweb3.com`,
 '',
 `Tags: ${tags.join(', ')}`,
 '',
 `---`,
 `*Published by HashtagWeb3.com - The Web3 Job Board*`,
 ].join('\n');

 return { title, body, tags };
}

// --- Telegra.ph ---
let telegraphToken: string | null = null;
async function getTelegraphToken(): Promise<string> {
 if (telegraphToken) return telegraphToken;
 const r = await fetch('https://api.telegra.ph/createAccount?short_name=HashtagWeb3&author_name=HashtagWeb3.com&author_url=https://hashtagweb3.com');
 const d: any = await r.json();
 if (d.ok) { telegraphToken = d.result.access_token; return telegraphToken!; }
 throw new Error('Failed to create Telegraph account');
}

async function postToTelegraph(content: { title: string; body: string; tags: string[] }): Promise<PostResult | null> {
 try {
 const token = await getTelegraphToken();
 // Convert markdown-ish body to Telegraph Node format
 const paragraphs = content.body.split('\n').filter(l => l.trim());
 const nodes: any[] = paragraphs.map(p => {
 if (p.startsWith('# ')) return { tag: 'h3', children: [p.slice(2)] };
 if (p.startsWith('## ')) return { tag: 'h4', children: [p.slice(3)] };
 if (p.startsWith('### ')) return { tag: 'h4', children: [p.slice(4)] };
 if (p.startsWith('- ')) return { tag: 'p', children: [p] };
 if (p.startsWith('**Find')) return { tag: 'p', children: [{ tag: 'a', attrs: { href: 'https://hashtagweb3.com' }, children: [p.replace(/\*/g, '')] }] };
 if (p.startsWith('*Published')) return { tag: 'p', children: [{ tag: 'em', children: [p.replace(/\*/g, '')] }] };
 if (p === '---') return { tag: 'hr' };
 return { tag: 'p', children: [p] };
 });

 const r = await fetch('https://api.telegra.ph/createPage', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 access_token: token,
 title: content.title.slice(0, 256),
 author_name: 'HashtagWeb3.com',
 author_url: 'https://hashtagweb3.com',
 content: nodes,
 }),
 });
 const d: any = await r.json();
 if (d.ok) return { host: 'telegra.ph', url: d.result.url, title: content.title, timestamp: new Date().toISOString() };
 return null;
 } catch { return null; }
}

// --- Write.as ---
async function postToWriteAs(content: { title: string; body: string }): Promise<PostResult | null> {
 try {
 const r = await fetch('https://write.as/api/posts', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ body: content.body, title: content.title }),
 });
 const d: any = await r.json();
 if (d.data?.id) return { host: 'write.as', url: `https://write.as/${d.data.id}`, title: content.title, timestamp: new Date().toISOString() };
 return null;
 } catch { return null; }
}

// --- Paste.rs ---
async function postToPasteRs(content: { title: string; body: string }): Promise<PostResult | null> {
 try {
 const r = await fetch('https://paste.rs/', { method: 'POST', body: `${content.title}\n\n${content.body}`, headers: { 'Content-Type': 'text/plain' } });
 const url = (await r.text()).trim();
 if (url.startsWith('http')) return { host: 'paste.rs', url, title: content.title, timestamp: new Date().toISOString() };
 return null;
 } catch { return null; }
}

// --- Main ---
async function main() {
 if (!fs.existsSync(CONTENT_FILE)) {
 // Fall back to original content file
 const alt = path.join(__dirname, 'bulk-content.json');
 if (!fs.existsSync(alt)) { console.error('No content file found'); process.exit(1); }
 }
 const posts: PostData[] = JSON.parse(fs.readFileSync(fs.existsSync(CONTENT_FILE) ? CONTENT_FILE : path.join(__dirname, 'bulk-content.json'), 'utf-8'));
 const state = loadState();
 const resumeFrom = args.includes('--resume');
 const startIdx = resumeFrom ? state.lastIndex : 0;
 const batch = posts.slice(startIdx, startIdx + limit);

 console.log(`📝 Posting ${batch.length} texts to ${hostArg} | Concurrency: ${concurrency}`);

 let successCount = 0;
 let failCount = 0;
 let completed = 0;
 const startTime = Date.now();

 async function postOne(i: number) {
 const post = batch[i];
 const content = buildTextContent(post, startIdx + i);
 const results: PostResult[] = [];

 if (hostArg === 'all' || hostArg === 'telegra.ph') {
 const r = await postToTelegraph(content);
 if (r) results.push(r);
 }
 if (hostArg === 'all' || hostArg === 'write.as') {
 const r = await postToWriteAs(content);
 if (r) results.push(r);
 }
 if (hostArg === 'all' || hostArg === 'paste.rs') {
 const r = await postToPasteRs(content);
 if (r) results.push(r);
 }

 if (results.length > 0) {
 state.posted[`post-${startIdx + i}`] = results;
 successCount += results.length;
 } else {
 failCount++;
 }

 completed++;
 if (completed % 50 === 0 || completed === batch.length) {
 state.lastIndex = startIdx + completed;
 saveState(state);
 const rate = (completed / ((Date.now() - startTime) / 1000)).toFixed(1);
 console.log(`  [${completed}/${batch.length}] ${rate} posts/s - ✅ ${successCount} ok, ❌ ${failCount} fail`);
 }
 }

 const queue = Array.from({ length: batch.length }, (_, i) => i);
 const workers = Array.from({ length: Math.min(concurrency, batch.length) }, async () => {
 while (queue.length > 0) {
 const idx = queue.shift()!;
 try { await postOne(idx); } catch { failCount++; completed++; }
 await new Promise(r => setTimeout(r, 200));
 }
 });

 await Promise.all(workers);

 const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
 state.lastIndex = startIdx + batch.length;
 saveState(state);
 console.log(`\n📊 Done! ${successCount} posts, ${failCount} failures in ${elapsed}s (${(completed / parseFloat(elapsed)).toFixed(1)} posts/s)`);
}

main().catch(err => { console.error(err); process.exit(1); });
