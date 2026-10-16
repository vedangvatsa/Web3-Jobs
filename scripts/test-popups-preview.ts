import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { load } from 'cheerio';
import { NextRequest } from 'next/server';
import { middleware } from '../src/middleware';
import { SOCIAL_UTM_MAP } from '../src/lib/social-share';
import { collectOgPreviewPaths } from '../src/lib/og-preview';
import { precomputeOgPreviews } from './precompute-og-previews';

const project = process.cwd();
const canonical = 'https://hashtagweb3.com/popups';
const image = 'https://hashtagweb3.com/og/pages/popups.png';

function checkShell(html: string) {
  const $ = load(html);
  assert.equal($('link[rel="canonical"]').attr('href'), canonical);
  assert.equal($('meta[property="og:url"]').attr('content'), canonical);
  assert.equal($('meta[property="og:title"]').attr('content'), 'Startup Societies | Hashtag Web3');
  assert.equal($('meta[property="og:description"]').attr('content'), 'Directory of popup cities, permanent nodes, SEZs, and builder villages for Web3 and frontier tech. Filter by type and region.');
  assert.equal($('meta[property="og:image"]').attr('content'), image);
  assert.equal($('meta[name="twitter:image"]').attr('content'), image);
  assert.equal($('meta[property="og:image:width"]').attr('content'), '1200');
  assert.equal($('meta[property="og:image:height"]').attr('content'), '630');
  assert.equal($('meta[property="og:image:type"]').attr('content'), 'image/png');
}

test('preview generation creates, repairs and preserves the root popups shell', async t => {
  fs.mkdirSync('.cache', { recursive: true });
  const root = fs.mkdtempSync(path.join(project, '.cache/popups-preview-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, 'content'));
  for (const file of ['og-image.png', 'og/pages/popups.png']) {
    const target = path.join(root, 'public', file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(path.join(project, 'public', file), target);
  }
  const preview = path.join(root, 'public/preview/popups.html');
  const manifest = path.join(root, 'public/preview/.preview-manifest.json');
  const paths = (await collectOgPreviewPaths()).filter(contentPath => contentPath === '/popups');
  const generate = (fullRebuild = false) => precomputeOgPreviews({ root, paths, fullRebuild });
  await generate();
  assert.ok(fs.existsSync(preview), 'The crawler rewrite target must be generated from an empty preview directory');
  const expected = fs.readFileSync(preview, 'utf8');
  checkShell(expected);
  const hashes = JSON.parse(fs.readFileSync(manifest, 'utf8'));
  assert.ok(hashes['/popups'], 'The directory must be tracked as a live preview');

  fs.writeFileSync(preview, expected.replace('Startup Societies', 'Outdated directory'));
  hashes['/popups'] = 'stale-metadata';
  fs.writeFileSync(manifest, JSON.stringify(hashes));
  fs.writeFileSync(path.join(root, 'public/preview/marketing4.html'), expected);
  await generate();
  assert.equal(fs.readFileSync(preview, 'utf8'), expected, 'Stale directory metadata must be regenerated');
  assert.equal(fs.existsSync(path.join(root, 'public/preview/marketing4.html')), false, 'Retired-job cleanup must still run');

  const modified = fs.statSync(preview).mtimeMs;
  await generate();
  assert.equal(fs.readFileSync(preview, 'utf8'), expected, 'Incremental cleanup must preserve the directory shell');
  assert.equal(fs.statSync(preview).mtimeMs, modified, 'An unchanged directory preview should be skipped');

  fs.unlinkSync(preview);
  await generate();
  assert.equal(fs.readFileSync(preview, 'utf8'), expected, 'A matching manifest must not prevent a missing shell from being restored');
  await generate(true);
  assert.equal(fs.readFileSync(preview, 'utf8'), expected, 'Full regeneration must retain the directory metadata');
  assert.equal(fs.readFileSync(path.join(project, 'public/preview/popups.html'), 'utf8').trimEnd(), expected, 'The committed preview must match the generator');
});

test('popups social suffixes reach the root preview for crawlers and preserve browser attribution', async () => {
  for (const [suffix, attribution] of Object.entries(SOCIAL_UTM_MAP)) {
    const url = `${canonical}/${suffix}?utm_campaign=nomad-resource-list`;
    for (const method of ['GET', 'HEAD']) {
      for (const userAgent of ['Twitterbot/1.0', 'TelegramBot', 'node-fetch/1.0']) {
        const response = await middleware(new NextRequest(url, { method, headers: { 'user-agent': userAgent } }));
        assert.equal(response.status, 200, `${method} /popups/${suffix} ${userAgent}`);
        assert.equal(response.headers.get('x-middleware-rewrite'), 'https://hashtagweb3.com/preview/popups.html');
      }
    }
    const response = await middleware(new NextRequest(url, { headers: { 'user-agent': 'Mozilla/5.0', 'sec-fetch-mode': 'navigate', 'sec-fetch-dest': 'document' } }));
    assert.equal(response.status, 307);
    const destination = new URL(response.headers.get('location')!);
    assert.equal(destination.pathname, '/popups');
    assert.equal(destination.searchParams.get('utm_source'), attribution.utm_source);
    assert.equal(destination.searchParams.get('utm_medium'), attribution.utm_medium);
    assert.equal(destination.searchParams.get('utm_campaign'), 'nomad-resource-list');
  }
});
