#!/usr/bin/env npx tsx
/**
 * Upload images to additional free hosts (tmpfiles.org, uguu.se)
 * These are temporary hosts but provide short-term SEO indexing.
 * Usage: npx tsx upload-extra-hosts.ts --host uguu|tmpfiles|all --limit 5289 --concurrency 100
 */
import * as fs from 'fs';
import * as path from 'path';

const BULK_DIR = path.join(__dirname, 'output/bulk');
const args = process.argv.slice(2);
const hostArg = args.includes('--host') ? args[args.indexOf('--host') + 1] : 'all';
const limitIdx = args.indexOf('--limit');
const limit = limitIdx >= 0 ? parseInt(args[limitIdx + 1]) : 100;
const concurrencyIdx = args.indexOf('--concurrency');
const concurrency = concurrencyIdx >= 0 ? parseInt(args[concurrencyIdx + 1]) : 100;
const stateIdx = args.indexOf('--state');
const STATE_FILE = stateIdx >= 0 ? path.resolve(args[stateIdx + 1]) : path.join(__dirname, `upload-state-${hostArg}.json`);

interface UploadResult { host: string; filename: string; url: string; timestamp: string; }
interface UploadState { uploaded: Record<string, UploadResult[]>; lastIndex: number; }

function loadState(): UploadState {
  if (fs.existsSync(STATE_FILE)) return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
  return { uploaded: {}, lastIndex: 0 };
}
function saveState(state: UploadState) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function buildMultipartBody(fieldName: string, filename: string, fileData: Buffer): { body: Buffer; boundary: string } {
  const boundary = '----FormBoundary' + Date.now() + Math.random().toString(36).slice(2);
  const header = `--${boundary}\r\nContent-Disposition: form-data; name="${fieldName}"; filename="${filename}"\r\nContent-Type: image/png\r\n\r\n`;
  const footer = `\r\n--${boundary}--\r\n`;
  return {
    body: Buffer.concat([Buffer.from(header), fileData, Buffer.from(footer)]),
    boundary,
  };
}

async function uploadToTmpfiles(imagePath: string, filename: string): Promise<UploadResult | null> {
  try {
    const fileData = fs.readFileSync(imagePath);
    const { body, boundary } = buildMultipartBody('file', filename, fileData);
    const r = await fetch('https://tmpfiles.org/api/v1/upload', {
      method: 'POST',
      headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}` },
      body,
    });
    const d = await r.json() as any;
    if (d.status === 'success' && d.data?.url) {
      // Convert page URL to direct link
      const directUrl = d.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
      return { host: 'tmpfiles', filename, url: directUrl, timestamp: new Date().toISOString() };
    }
    return null;
  } catch { return null; }
}

async function uploadToUguu(imagePath: string, filename: string): Promise<UploadResult | null> {
  try {
    const fileData = fs.readFileSync(imagePath);
    const { body, boundary } = buildMultipartBody('files[]', filename, fileData);
    const r = await fetch('https://uguu.se/upload', {
      method: 'POST',
      headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}` },
      body,
    });
    const d = await r.json() as any;
    if (d.success && d.files?.[0]?.url) {
      return { host: 'uguu', filename, url: d.files[0].url, timestamp: new Date().toISOString() };
    }
    return null;
  } catch { return null; }
}

async function main() {
  const images = fs.readdirSync(BULK_DIR).filter(f => f.endsWith('.png')).sort();
  const state = loadState();
  const resumeFrom = args.includes('--resume');
  const startIdx = resumeFrom ? state.lastIndex : 0;
  const filesToUpload = images.slice(startIdx, startIdx + limit);

  console.log(`📤 Uploading ${filesToUpload.length} images to ${hostArg} | Concurrency: ${concurrency}`);

  let successCount = 0;
  let failCount = 0;
  let completed = 0;
  const startTime = Date.now();

  async function uploadOne(i: number) {
    const filename = filesToUpload[i];
    const imagePath = path.join(BULK_DIR, filename);
    const results: UploadResult[] = [];

    if (hostArg === 'all' || hostArg === 'tmpfiles') {
      const r = await uploadToTmpfiles(imagePath, filename);
      if (r) results.push(r);
    }
    if (hostArg === 'all' || hostArg === 'uguu') {
      const r = await uploadToUguu(imagePath, filename);
      if (r) results.push(r);
    }

    if (results.length > 0) {
      state.uploaded[filename] = results;
      successCount += results.length;
    } else {
      failCount++;
    }

    completed++;
    if (completed % 50 === 0 || completed === filesToUpload.length) {
      state.lastIndex = startIdx + completed;
      saveState(state);
      const rate = (completed / ((Date.now() - startTime) / 1000)).toFixed(1);
      console.log(`  [${completed}/${filesToUpload.length}] ${rate} img/s — ✅ ${successCount} ok, ❌ ${failCount} fail`);
    }
  }

  const queue = Array.from({ length: filesToUpload.length }, (_, i) => i);
  const workers = Array.from({ length: concurrency }, async () => {
    while (queue.length > 0) {
      const idx = queue.shift()!;
      try { await uploadOne(idx); } catch { failCount++; completed++; }
      await new Promise(r => setTimeout(r, 100));
    }
  });

  await Promise.all(workers);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  state.lastIndex = startIdx + filesToUpload.length;
  saveState(state);
  console.log(`\n📊 Done! ${successCount} uploads, ${failCount} failures in ${elapsed}s (${(completed / parseFloat(elapsed)).toFixed(1)} img/s)`);
}

main().catch(err => { console.error(err); process.exit(1); });
