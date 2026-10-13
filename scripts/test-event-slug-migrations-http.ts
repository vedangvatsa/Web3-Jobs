import assert from 'node:assert/strict';
import events from '../content/events-runtime.json';
import migrations from '../content/events/slug-migrations.json';
import history from '../content/event-slug-history.json';
import { EVENT_SOURCES } from '../src/lib/event-sources';
import { hasEventEnded } from './lib/event-dates.mjs';
import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { SOCIAL_UTM_MAP } from '../src/lib/social-share';

async function main() {
  const origin = process.env.TEST_BASE_URL || 'http://localhost:3096';
  const headers = { 'user-agent': 'Mozilla/5.0 EventCatalogRegression', 'sec-fetch-mode': 'navigate', 'sec-fetch-dest': 'document' };
  let aliases = 0;
  for (const event of events) {
    for (const alias of event.aliases || []) {
      const response = await fetch(`${origin}/${alias}?audit=1&utm_source=regression`, { redirect: 'manual', headers });
      assert.ok([301, 308].includes(response.status), `${alias}: expected permanent redirect, got ${response.status}`);
      const location = response.headers.get('location') || '';
      assert.ok(!location.includes(','), `${alias}: duplicate Location header`);
      const destination = new URL(location, origin);
      assert.equal(destination.pathname, `/${event.slug}`);
      assert.equal(destination.searchParams.get('audit'), '1');
      assert.equal(destination.searchParams.get('utm_source'), 'regression');
      aliases++;
    }
  }
  let activeMigrations = 0;
  let endedMigrations = 0;
  for (const [alias, slug] of Object.entries(migrations)) {
    if (!events.some(event => event.slug === slug)) {
      const owner = Object.entries(history).find(([, record]) => record.slug === slug);
      assert.ok(owner, `Missing historical owner for /${slug}`);
      assert.ok(owner[1].aliases.includes(alias), `Historical alias lost /${alias}`);
      const source = EVENT_SOURCES.flatMap(source => source.events).find(event => event.id === owner[0]);
      assert.ok(source && hasEventEnded(source), `Unexpired migration missing /${slug}`);
      for (const path of [alias, slug]) {
        const response = await fetch(`${origin}/${path}`, { headers });
        assert.ok([404, 410].includes(response.status), `Ended /${path}: ${response.status}`);
      }
      endedMigrations++;
      continue;
    }
    const response = await fetch(`${origin}/${slug}`, { headers });
    assert.equal(response.status, 200, slug);
    const html = await response.text();
    assert.ok(html.includes(`https://hashtagweb3.com/${slug}`), `${slug}: missing canonical`);
    assert.ok(html.includes('schema.org'), `${slug}: missing structured data`);
    activeMigrations++;
  }
  for (const suffix of Object.keys(SOCIAL_UTM_MAP)) {
    const response = await fetch(`${origin}/0ej7kbb0/${suffix}?audit=social`, { headers });
    assert.equal(response.status, 200);
    const url = new URL(response.url);
    assert.equal(url.pathname, '/ethwali');
    assert.equal(url.searchParams.get('audit'), 'social');
    assert.equal(url.searchParams.get('utm_source'), SOCIAL_UTM_MAP[suffix].utm_source);
  }
  for (const suffix of ['linkedin', 'twitter']) {
    const response = await fetch(`${origin}/0ej7kbb0/${suffix}`, { headers: { 'user-agent': suffix === 'linkedin' ? 'LinkedInBot' : 'Twitterbot' } });
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.ok(html.includes('https://hashtagweb3.com/ethwali'));
    assert.ok(html.includes('og:image'));
  }
  console.log(`HTTP migration checks passed: ${aliases} aliases, ${activeMigrations} active canonical pages, ${endedMigrations} ended migrations and social-query preservation.`);
}
async function run() {
  if (!process.argv.includes('--start')) return main();
  fs.cpSync('.next/static', '.next/standalone/.next/static', { recursive: true });
  const server = spawn(process.execPath, ['.next/standalone/server.js'], { env: { ...process.env, PORT: '3096', HOSTNAME: '127.0.0.1' }, stdio: 'ignore' });
  try {
    let ready = false;
    for (let attempt = 0; attempt < 40; attempt++) {
      if (server.exitCode !== null) throw Error(`Test server exited: ${server.exitCode}`);
      try { ready = (await fetch('http://localhost:3096/')).ok; } catch { /* Wait for the owned test server. */ }
      if (ready) break;
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    assert.ok(ready, 'Test server did not become ready');
    if (!process.argv.includes('--browser-only')) await main();
    execFileSync(process.execPath, ['node_modules/tsx/dist/cli.mjs', 'scripts/test-event-page-browser.ts'], {
      stdio: 'inherit', env: { ...process.env, TEST_BASE_URL: 'http://localhost:3096', CHROMIUM_PATH: process.env.CHROMIUM_PATH || '.cache/nomads/browsers/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell' },
    });
  } finally { server.kill('SIGTERM'); }
}
run().catch(error => { console.error(error); process.exitCode = 1; });
