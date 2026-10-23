import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

export const root = path.dirname(fileURLToPath(import.meta.url));
export const repo = path.resolve(root, '../..');
export const executablePath = '/Users/vedang/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
export const hash = value => createHash('sha256').update(value).digest('hex');
export const readJSON = async file => JSON.parse(await fs.readFile(path.resolve(root, file), 'utf8'));
export const writeJSON = async (file, value) => fs.writeFile(path.resolve(root, file), JSON.stringify(value, null, 2) + '\n');
export const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export async function protect({initialize = false} = {}) {
  const guard = await readJSON('assets/revision/protected-prefix.json');
  const content = await readJSON('content.json');
  const calendar = await readJSON('calendar.json');
  const manifest = await readJSON('image-manifest.json');
  for (const t of guard.threads) assert.deepEqual(content.threads.find(c => c.id === t.id), t, `Frozen thread ${t.id}`);
  assert.deepEqual(calendar.dates.slice(0, 3), guard.calendar, 'Frozen publication dates');
  for (const [file, sha] of Object.entries(guard.imageHashes)) assert.equal(hash(await fs.readFile(path.join(root, file))), sha, file);
  const file = 'assets/revision/frozen-visual-baseline.json';
  let baseline;
  try { baseline = await readJSON(file); } catch (e) {
    if (!initialize || e.code !== 'ENOENT') throw e;
    const contactSheets = {};
    for (const name of await fs.readdir(path.join(root, 'contact-sheets'))) {
      if (/^(C01|E01|N01)\.jpg$|^mobile-/.test(name)) contactSheets[`contact-sheets/${name}`] = hash(await fs.readFile(path.join(root, 'contact-sheets', name)));
    }
    baseline = {recordedAt: new Date().toISOString(), protectedGuardSha256: hash(await fs.readFile(path.join(root, 'assets/revision/protected-prefix.json'))), manifestEntries: manifest.images.filter(i => i.threadSequence <= 3), contactSheets};
    await writeJSON(file, baseline);
  }
  assert.equal(baseline.protectedGuardSha256, hash(await fs.readFile(path.join(root, 'assets/revision/protected-prefix.json'))));
  assert.deepEqual(manifest.images.filter(i => i.threadSequence <= 3), baseline.manifestEntries, 'Published manifest entries');
  for (const [file, sha] of Object.entries(baseline.contactSheets)) assert.equal(hash(await fs.readFile(path.join(root, file))), sha, file);
  const published = await readJSON('assets/revision/published-prefix-2026-10-22.json');
  for (const thread of published.threads) assert.deepEqual(content.threads.find(item => item.id === thread.id), thread, `Published thread ${thread.id}`);
  for (const entry of published.calendarEntries) assert.deepEqual(calendar.dates.find(item => item.id === entry.id), entry, `Published date ${entry.id}`);
  for (const entry of published.manifestEntries) assert.deepEqual(manifest.images.find(item => item.path === entry.path), entry, `Published image declaration ${entry.path}`);
  for (const [file, sha] of Object.entries(published.files)) assert.equal(hash(await fs.readFile(path.join(root, file))), sha, `Published file ${file}`);
  const exports = await readJSON('exports/manifest.json');
  for (const entry of published.exportEntries) assert.deepEqual(exports.threads.find(item => item.id === entry.id), entry, `Published export ${entry.id}`);
  return {guard, baseline, published};
}

export async function serve(port = 0) {
  const types = {'.html':'text/html','.css':'text/css','.mjs':'text/javascript','.json':'application/json','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2','.svg':'image/svg+xml'};
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    if(url.pathname==='/favicon.ico')return res.writeHead(204).end();
    const target = path.resolve(root, '.' + decodeURIComponent(url.pathname === '/' ? '/preview.html' : url.pathname));
    if (!target.startsWith(root + path.sep)) return res.writeHead(403).end();
    try { const bytes = await fs.readFile(target); res.writeHead(200, {'Content-Type':types[path.extname(target)] || 'application/octet-stream'}).end(bytes); }
    catch { res.writeHead(404).end(); }
  });
  await new Promise(resolve => server.listen(port, '127.0.0.1', resolve));
  return {server, url:`http://127.0.0.1:${server.address().port}`};
}
