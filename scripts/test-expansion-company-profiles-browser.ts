import assert from 'node:assert/strict';
import fs from 'node:fs';
import net from 'node:net';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import { load } from 'cheerio';

async function main() {
  const socket = net.createServer();
  await new Promise<void>(resolve => socket.listen(0, '127.0.0.1', resolve));
  const port = (socket.address() as net.AddressInfo).port;
  await new Promise<void>((resolve, reject) => socket.close(error => error ? reject(error) : resolve()));
  const origin = `http://127.0.0.1:${port}`;
  const server = spawn(process.execPath, ['.next/standalone/server.js'], { cwd: process.cwd(), env: { ...process.env, PORT: String(port), HOSTNAME: '127.0.0.1', NODE_ENV: 'production' }, stdio: ['ignore', 'pipe', 'pipe'] });
  let output = '';
  server.stdout.on('data', chunk => { output += chunk; }); server.stderr.on('data', chunk => { output += chunk; });
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext();
    await context.route('**/*', route => new URL(route.request().url()).origin === origin && ['GET', 'HEAD'].includes(route.request().method()) ? route.continue() : route.abort());
    for (let attempt = 0; ; attempt++) {
      try { if ((await fetch(`${origin}/bit2me`)).ok) break; } catch {}
      if (attempt >= 60) throw new Error(`Standalone server did not start: ${output}`);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    const profiles = JSON.parse(fs.readFileSync('content/company-profile-overrides.json', 'utf8'));
    const companies = JSON.parse(fs.readFileSync('content/companies-runtime.json', 'utf8'));
    const queue = Object.entries(profiles) as [string, { name: string; website: string; description: string; logo: string; socialLinks: Record<string, string> }][];
    let checked = 0;
    await Promise.all(Array.from({ length: 6 }, async () => {
      for (;;) {
        const target = queue.shift(); if (!target) return;
        const [slug, row] = target;
        const response = await fetch(`${origin}/${slug}`, { signal: AbortSignal.timeout(20000) });
        assert.equal(response.status, 200, `${slug}: production HTTP`);
        const $ = load(await response.text());
        assert.equal($('h1').text(), row.name, `${slug}: name`);
        assert.ok($('body').text().includes(row.description), `${slug}: About`);
        assert.ok($(`a[href="${row.website}"]`).length, `${slug}: official root link`);
        for (const url of Object.values(row.socialLinks)) assert.ok($(`a[href="${url}"]`).length, `${slug}: verified social`);
        assert.ok($('title').text().includes(row.name));
        assert.equal($('link[rel="canonical"]').attr('href'), `https://hashtagweb3.com/${slug}`);
        const og = $('meta[property="og:image"]').attr('content') || '';
        assert.ok(og.includes(`/og/companies/${slug}.png`), `${slug}: branded OG`);
        const image = await fetch(`${origin}${new URL(og).pathname}`);
        assert.equal(image.status, 200); assert.ok(image.headers.get('content-type')?.includes('image/png'));
        const logo = await fetch(`${origin}${row.logo}`);
        assert.equal(logo.status, 200); assert.ok(logo.headers.get('content-type')?.includes('image/png'));
        const organization = $('script[type="application/ld+json"]').map((_, el) => { try { return JSON.parse($(el).text()); } catch { return null; } }).get().find(schema => schema?.['@type'] === 'Organization' && schema.name === row.name);
        assert.ok(organization); assert.equal(organization.description, row.description);
        assert.deepEqual(new Set(organization.sameAs || []), new Set(Object.values(row.socialLinks)));
        if (!companies[slug].jobCount) assert.ok($('body').text().includes('No open roles currently listed'), `${slug}: honest zero jobs`);
        const shell = await fetch(`${origin}/${slug}`, { headers: { 'User-Agent': 'Twitterbot/1.0' } });
        assert.equal(shell.status, 200); assert.ok((await shell.text()).includes(row.description));
        checked++;
      }
    }));
    const page = await context.newPage();
    for (const slug of ['bit2me', 'coinmotion', 'axiom', 'eco-protocol', 'double-jump-tokyo']) {
      await page.goto(`${origin}/${slug}`, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(300);
      const logo = page.getByAltText(`${profiles[slug].name} logo`).first();
      await logo.scrollIntoViewIfNeeded();
      await page.waitForFunction(name => { const img = [...document.images].find(img => img.alt === `${name} logo`); return img?.complete && img.naturalWidth > 0; }, profiles[slug].name);
      assert.ok(await logo.isVisible());
      assert.ok(!(await logo.getAttribute('src'))?.includes('gstatic.com'));
      assert.equal(await page.locator('h1').textContent(), profiles[slug].name);
      console.log(`${slug}: hydrated company page, official asset rendered, ${companies[slug].jobCount} actual jobs`);
    }
    const legacyEco = await fetch(`${origin}/eco`);
    const legacyHtml = load(await legacyEco.text());
    assert.notEqual(legacyHtml('h1').text(), 'Eco', 'Legacy job URL must not become the Eco company overview');
    assert.notEqual(legacyHtml('link[rel="canonical"]').attr('href'), 'https://hashtagweb3.com/eco-protocol');
    assert.ok(!legacyEco.url.endsWith('/eco-protocol'));
    const catalog = await (await fetch(`${origin}/data/companies-runtime.json`)).json();
    for (const slug of Object.keys(profiles)) assert.ok(catalog[slug], `${slug}: standalone public catalog`);
    fs.writeFileSync('content/sources/company-profile-browser-verification.json', JSON.stringify({ checkedAt: new Date().toISOString(), mode: 'production-standalone', employers: checked, companyPages: checked, hydratedSamples: ['bit2me', 'coinmotion', 'axiom', 'eco-protocol', 'double-jump-tokyo'], zeroJobPages: Object.keys(profiles).filter(slug => !companies[slug].jobCount).length, legacyEcoStatus: legacyEco.status, legacyEcoTitle: legacyHtml('h1').text() }, null, 2));
    console.log(`Production verification passed: ${checked} company pages, crawler shells, official assets, OG images, and standalone catalog rows.`);
  } finally {
    await browser.close();
    server.kill('SIGTERM');
    await new Promise(resolve => server.once('exit', resolve));
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
