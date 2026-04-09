/**
 * Multi-Host Image Uploader with SEO Metadata
 * Uploads images to multiple free image hosting sites with:
 * - SEO-optimized titles
 * - Descriptive alt text / descriptions  
 * - Tags/keywords for discoverability
 * - Branded filenames
 * 
 * Supported hosts:
 * 1. ImgBB (api.imgbb.com) — free, API key required
 * 2. Freeimage.host — free, API key optional
 * 3. Imgur (api.imgur.com) — free, client ID required
 * 
 * Usage:
 *   npx tsx scripts/social/upload-images.ts --host imgbb --limit 10
 *   npx tsx scripts/social/upload-images.ts --host all
 * 
 * Env vars:
 *   IMGBB_API_KEY - from https://api.imgbb.com/
 *   FREEIMAGE_API_KEY - from https://freeimage.host/page/api
 *   IMGUR_CLIENT_ID - from https://api.imgur.com/oauth2/addclient
 */

import * as fs from 'fs';
import * as path from 'path';

const BULK_DIR = path.join(__dirname, 'output/bulk');
const CONTENT_FILE = path.join(__dirname, 'bulk-content.json');
let STATE_FILE = path.join(__dirname, 'upload-state.json');

interface PostMeta {
  type: string;
  tag: string;
  headline: string;
  seoTitle: string;
  seoTags: string[];
}

interface UploadResult {
  host: string;
  filename: string;
  url: string;
  deleteUrl?: string;
  pageUrl?: string;
  timestamp: string;
}

interface UploadState {
  uploaded: Record<string, UploadResult[]>; // filename -> results per host
  lastIndex: number;
}

// --- SEO Metadata Builder (maximized for search indexing) ---
function buildSeoMeta(post: PostMeta, filename: string) {
  const allTags = [...(post.seoTags || []), 'web3', 'web3jobs', 'blockchain', 'crypto', 'hashtagweb3', 'careers', 'defi', 'ethereum', 'solidity', 'smart contracts', 'remote jobs']
    .filter((v, i, a) => a.indexOf(v) === i).slice(0, 20);

  return {
    // Title: keyword-rich, branded, under 70 chars for search snippets
    title: `${post.seoTitle} | Web3 Jobs — HashtagWeb3.com`,

    // Description: keyword-rich with backlink, 150-300 chars for image search
    description: [
      post.headline + '.',
      `Browse 668+ open Web3 positions at https://hashtagweb3.com`,
      `HashtagWeb3.com is the leading Web3 job board for blockchain developers, DeFi analysts, smart contract auditors, and crypto professionals.`,
      `#${allTags.slice(0, 8).join(' #')}`,
    ].join(' '),

    // Tags: maximum keyword coverage
    tags: allTags,

    // Alt text: descriptive, readable, keyword-rich
    altText: `Infographic: ${post.headline} — Web3 career insights from HashtagWeb3.com, the Web3 job board`,

    // Backlink URL to include wherever the platform allows
    sourceUrl: 'https://hashtagweb3.com',

    filename,
  };
}

// --- Upload to ImgBB ---
async function uploadToImgBB(imagePath: string, meta: ReturnType<typeof buildSeoMeta>): Promise<UploadResult | null> {
  const apiKey = process.env.IMGBB_API_KEY;
  if (!apiKey) { console.log('  ⏭  ImgBB: No API key (set IMGBB_API_KEY)'); return null; }

  try {
    const imageData = fs.readFileSync(imagePath);
    const base64 = imageData.toString('base64');

    const formData = new URLSearchParams();
    formData.append('key', apiKey);
    formData.append('image', base64);
    formData.append('name', meta.filename.replace('.png', ''));
    formData.append('title', meta.title);
    formData.append('description', meta.description);

    const res = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();

    if (data.success) {
      return {
        host: 'imgbb',
        filename: meta.filename,
        url: data.data.url,
        deleteUrl: data.data.delete_url,
        pageUrl: data.data.url_viewer,
        timestamp: new Date().toISOString(),
      };
    } else {
      console.log(`  ❌ ImgBB error: ${JSON.stringify(data.error)}`);
      return null;
    }
  } catch (e: any) {
    console.log(`  ❌ ImgBB: ${e.message}`);
    return null;
  }
}

// --- Upload to Freeimage.host ---
async function uploadToFreeimage(imagePath: string, meta: ReturnType<typeof buildSeoMeta>): Promise<UploadResult | null> {
  const apiKey = process.env.FREEIMAGE_API_KEY || '6d207e02198a847aa98d0a2a901485a5'; // public key

  try {
    const imageData = fs.readFileSync(imagePath);
    const base64 = imageData.toString('base64');

    const formData = new URLSearchParams();
    formData.append('key', apiKey);
    formData.append('source', base64);
    formData.append('type', 'base64');
    formData.append('title', meta.title);
    formData.append('description', meta.description);
    formData.append('tags', meta.tags.join(','));

    const res = await fetch('https://freeimage.host/api/1/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();

    if (data.status_code === 200) {
      return {
        host: 'freeimage',
        filename: meta.filename,
        url: data.image?.url || data.image?.display_url,
        pageUrl: data.image?.url_viewer,
        timestamp: new Date().toISOString(),
      };
    } else {
      console.log(`  ❌ Freeimage error: ${data.error?.message || JSON.stringify(data)}`);
      return null;
    }
  } catch (e: any) {
    console.log(`  ❌ Freeimage: ${e.message}`);
    return null;
  }
}

// --- Upload to Imgur ---
async function uploadToImgur(imagePath: string, meta: ReturnType<typeof buildSeoMeta>): Promise<UploadResult | null> {
  const clientId = process.env.IMGUR_CLIENT_ID;
  if (!clientId) { console.log('  ⏭  Imgur: No client ID (set IMGUR_CLIENT_ID)'); return null; }

  try {
    const imageData = fs.readFileSync(imagePath);
    const base64 = imageData.toString('base64');

    const formData = new URLSearchParams();
    formData.append('image', base64);
    formData.append('type', 'base64');
    formData.append('title', meta.title);
    formData.append('description', meta.description);
    formData.append('name', meta.filename);

    const res = await fetch('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: { Authorization: `Client-ID ${clientId}` },
      body: formData,
    });
    const data = await res.json();

    if (data.success) {
      return {
        host: 'imgur',
        filename: meta.filename,
        url: data.data.link,
        deleteUrl: `https://imgur.com/delete/${data.data.deletehash}`,
        pageUrl: `https://imgur.com/${data.data.id}`,
        timestamp: new Date().toISOString(),
      };
    } else {
      console.log(`  ❌ Imgur error: ${data.data?.error || JSON.stringify(data)}`);
      return null;
    }
  } catch (e: any) {
    console.log(`  ❌ Imgur: ${e.message}`);
    return null;
  }
}

// --- Upload to PostImages.org (no signup needed) ---
async function uploadToPostImages(imagePath: string, meta: ReturnType<typeof buildSeoMeta>): Promise<UploadResult | null> {
  try {
    const imageData = fs.readFileSync(imagePath);
    const base64 = imageData.toString('base64');

    const formData = new URLSearchParams();
    formData.append('source', base64);
    formData.append('type', 'base64');
    formData.append('title', meta.title);
    formData.append('description', meta.description);
    formData.append('tags', meta.tags.join(','));

    const res = await fetch('https://postimages.org/json/rr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: formData,
    });
    const data = await res.json();

    if (data.status === 'OK' || data.url) {
      return {
        host: 'postimages',
        filename: meta.filename,
        url: data.url || data.hotlink,
        pageUrl: data.page,
        timestamp: new Date().toISOString(),
      };
    } else {
      console.log(`  ❌ PostImages error: ${JSON.stringify(data).slice(0, 100)}`);
      return null;
    }
  } catch (e: any) {
    console.log(`  ❌ PostImages: ${e.message}`);
    return null;
  }
}

// --- Upload to Thumbsnap.com (free, no API key) ---
async function uploadToThumbsnap(imagePath: string, meta: ReturnType<typeof buildSeoMeta>): Promise<UploadResult | null> {
  try {
    const imageData = fs.readFileSync(imagePath);
    const base64 = imageData.toString('base64');

    const formData = new URLSearchParams();
    formData.append('media', base64);
    formData.append('title', meta.title);
    formData.append('description', meta.description);
    formData.append('tags', meta.tags.join(','));

    const res = await fetch('https://thumbsnap.com/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData,
    });
    const data = await res.json();

    if (data.success || data.data?.url) {
      return {
        host: 'thumbsnap',
        filename: meta.filename,
        url: data.data?.url || data.data?.media,
        pageUrl: data.data?.url,
        timestamp: new Date().toISOString(),
      };
    } else {
      console.log(`  ❌ Thumbsnap error: ${JSON.stringify(data).slice(0, 100)}`);
      return null;
    }
  } catch (e: any) {
    console.log(`  ❌ Thumbsnap: ${e.message}`);
    return null;
  }
}

// --- State Management ---
function loadState(): UploadState {
  if (fs.existsSync(STATE_FILE)) {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
  }
  return { uploaded: {}, lastIndex: 0 };
}

function saveState(state: UploadState) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// --- Main ---
async function main() {
  const args = process.argv.slice(2);
  const hostArg = args.includes('--host') ? args[args.indexOf('--host') + 1] : 'all';
  const limitIdx = args.indexOf('--limit');
  const limit = limitIdx >= 0 ? parseInt(args[limitIdx + 1]) : 50; // default 50 per run
  const resumeFrom = args.includes('--resume') ? true : false;
  const stateIdx = args.indexOf('--state');
  if (stateIdx >= 0) STATE_FILE = path.resolve(args[stateIdx + 1]);

  // Load content metadata
  if (!fs.existsSync(CONTENT_FILE)) {
    console.error('❌ No bulk-content.json found. Run generate-content-library.ts first.');
    process.exit(1);
  }
  const posts: PostMeta[] = JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf-8'));

  // Get all image files
  const images = fs.readdirSync(BULK_DIR)
    .filter(f => f.endsWith('.png'))
    .sort();

  if (images.length === 0) {
    console.error('❌ No images found. Run bulk-generate.ts first.');
    process.exit(1);
  }

  // Load upload state
  const state = loadState();
  const startIdx = resumeFrom ? state.lastIndex : 0;
  const filesToUpload = images.slice(startIdx, startIdx + limit);

  const concurrencyIdx = args.indexOf('--concurrency');
  const concurrency = concurrencyIdx >= 0 ? parseInt(args[concurrencyIdx + 1]) : 10;

  console.log(`📤 Uploading ${filesToUpload.length} images (${startIdx + 1}–${startIdx + filesToUpload.length} of ${images.length})`);
  console.log(`   Hosts: ${hostArg} | Concurrency: ${concurrency}`);
  console.log('');

  let successCount = 0;
  let failCount = 0;
  let completed = 0;

  // Upload one image
  async function uploadOne(i: number): Promise<void> {
    const filename = filesToUpload[i];
    const imagePath = path.join(BULK_DIR, filename);
    const postIdx = startIdx + i;
    const post = posts[postIdx] || { type: 'stat', tag: 'Web3', headline: 'Web3 Jobs', seoTitle: 'Web3 Jobs', seoTags: ['web3'] };
    const meta = buildSeoMeta(post, filename);

    const results: UploadResult[] = [];

    if (hostArg === 'all' || hostArg === 'freeimage') {
      const r = await uploadToFreeimage(imagePath, meta);
      if (r) results.push(r);
    }
    if (hostArg === 'all' || hostArg === 'imgbb') {
      const r = await uploadToImgBB(imagePath, meta);
      if (r) results.push(r);
    }
    if (hostArg === 'all' || hostArg === 'imgur') {
      const r = await uploadToImgur(imagePath, meta);
      if (r) results.push(r);
    }
    if (hostArg === 'all' || hostArg === 'postimages') {
      const r = await uploadToPostImages(imagePath, meta);
      if (r) results.push(r);
    }
    if (hostArg === 'all' || hostArg === 'thumbsnap') {
      const r = await uploadToThumbsnap(imagePath, meta);
      if (r) results.push(r);
    }

    if (results.length > 0) {
      state.uploaded[filename] = results;
      successCount += results.length;
    } else {
      failCount++;
    }

    completed++;
    if (completed % 20 === 0 || completed === filesToUpload.length) {
      state.lastIndex = startIdx + completed;
      saveState(state);
      const rate = (completed / ((Date.now() - startTime) / 1000)).toFixed(1);
      console.log(`  [${completed}/${filesToUpload.length}] ${rate} img/s — ✅ ${successCount} ok, ❌ ${failCount} fail`);
    }
  }

  // Parallel worker pool
  const startTime = Date.now();
  const queue = Array.from({ length: filesToUpload.length }, (_, i) => i);
  const workers = Array.from({ length: concurrency }, async () => {
    while (queue.length > 0) {
      const idx = queue.shift()!;
      try {
        await uploadOne(idx);
      } catch (e: any) {
        failCount++;
        completed++;
      }
      // Small delay per worker to avoid hammering the API
      await new Promise(r => setTimeout(r, 200));
    }
  });

  await Promise.all(workers);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  state.lastIndex = startIdx + filesToUpload.length;
  saveState(state);

  console.log(`\n📊 Done! ${successCount} uploads, ${failCount} failures in ${elapsed}s`);
  console.log(`   Rate: ${(completed / parseFloat(elapsed)).toFixed(1)} img/s`);
  console.log(`   State saved. Run with --resume to continue from ${state.lastIndex}.`);
}

main().catch(err => { console.error(err); process.exit(1); });
