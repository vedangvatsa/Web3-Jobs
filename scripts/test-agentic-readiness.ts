import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

async function runTests() {
  console.log(`\n=== Running Agentic Readiness Verification on ${BASE_URL} ===\n`);
  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`\x1b[32m✓ PASS:\x1b[0m ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`\x1b[31m✗ FAIL:\x1b[0m ${name}`);
      console.error(`  Error: ${err.message}`);
      failed++;
    }
  }

  // 1. Agent-friendly 404s
  await test('1. Nonexistent paths return HTTP 404 with markdown recovery body', async () => {
    const res = await fetch(`${BASE_URL}/some-path-that-does-not-exist-12345`, {
      headers: { 'Accept': 'text/markdown', 'User-Agent': 'ora-agent/1.0' }
    });
    if (res.status !== 404) {
      throw new Error(`Expected HTTP 404, got ${res.status}`);
    }
    const text = await res.text();
    if (!text.includes('404') || !text.includes('sitemap.xml')) {
      throw new Error(`Expected markdown 404 recovery body with sitemap.xml, got: ${text.slice(0, 100)}`);
    }
  });

  // 2. Content without JavaScript (SSR Homepage)
  await test('2. Homepage server-side renders with H1, H2, H3 hierarchy & >500 chars text', async () => {
    const res = await fetch(`${BASE_URL}/`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' }
    });
    const html = await res.text();
    if (!html.includes('<h1') || (!html.includes('Web3 Jobs') && !html.includes('Find Your Next Web3 Job'))) {
      throw new Error('H1 heading missing from SSR HTML');
    }
    if (!html.includes('<h2') || !html.includes('<h3')) {
      throw new Error('H2 and H3 heading hierarchy missing from SSR HTML');
    }
    if (html.length < 500) {
      throw new Error(`Raw HTML is too short (${html.length} chars)`);
    }
  });

  // 3. Static catalog JSON on CDN
  await test('3. /data/jobs-runtime.json is reachable JSON', async () => {
    const res = await fetch(`${BASE_URL}/data/jobs-runtime.json`);
    if (res.status !== 200) {
      throw new Error(`GET /data/jobs-runtime.json failed with status ${res.status}`);
    }
    const json = await res.json();
    const jobs = Array.isArray(json) ? json : json.jobs;
    if (!Array.isArray(jobs) || jobs.length < 1) {
      throw new Error('jobs-runtime.json missing job array');
    }
  });

  // 4 & 5 & 8. Developer resource discoverability & portal
  await test('4, 5, 8. Developer portal (/developers) is reachable with OpenAPI', async () => {
    const res = await fetch(`${BASE_URL}/developers`);
    if (res.status !== 200) {
      throw new Error(`GET /developers returned ${res.status}`);
    }
    const html = await res.text();
    if (!html.includes('openapi.json') || !html.includes('jobs-runtime.json')) {
      throw new Error('Developer portal missing static catalog documentation');
    }
  });

  // 7. Core static catalogs
  await test('7. Static /data/* catalogs return JSON', async () => {
    const paths = [
      '/data/jobs-runtime.json',
      '/data/news-cache.json',
      '/data/events-runtime.json',
      '/data/glossary-runtime.json',
    ];
    for (const p of paths) {
      const res = await fetch(`${BASE_URL}${p}`);
      if (res.status !== 200) {
        throw new Error(`GET ${p} returned ${res.status}`);
      }
      await res.json();
    }
  });

  // 9. Agent instruction / when-to-use
  await test('9. agents.json and llms.txt contain explicit when-to-use guidance', async () => {
    const agentsRes = await fetch(`${BASE_URL}/.well-known/agents.json`);
    const agents = await agentsRes.json();
    const whenToUse = (typeof agents.when_to_use === 'object' && agents.when_to_use) || agents.when_to_use_guidance;
    if (!whenToUse || !whenToUse.best_fit_use_cases) {
      throw new Error('agents.json missing when_to_use.best_fit_use_cases');
    }

    const llmsRes = await fetch(`${BASE_URL}/llms.txt`);
    const llmsText = await llmsRes.text();
    if (!llmsText.includes('## When to use this') && !llmsText.includes('## When to Use Hashtag Web3')) {
      throw new Error('llms.txt missing "## When to Use Hashtag Web3" section');
    }
  });

  // 10. OpenAPI documents static catalogs
  await test('10. openapi.json documents /data/* catalogs', async () => {
    const openapiRes = await fetch(`${BASE_URL}/openapi.json`);
    const openapi = await openapiRes.json();
    if (!openapi.paths['/data/jobs-runtime.json']) {
      throw new Error('openapi.json missing /data/jobs-runtime.json');
    }
  });

  // 11. CLI tool available
  await test('11. Official CLI tool executes with valid output', async () => {
    const output = execSync('node packages/cli/bin/hashtagweb3.js jobs --limit 2', { encoding: 'utf8', cwd: process.cwd() });
    if (!output.includes('Found') && !output.includes('jobs')) {
      throw new Error(`CLI output unexpected: ${output}`);
    }
  });

  // 12. Agent Permissions (agents.txt)
  await test('12. /agents.txt is served with operational permissions', async () => {
    const res = await fetch(`${BASE_URL}/agents.txt`);
    if (res.status !== 200) {
      throw new Error(`GET /agents.txt returned ${res.status}`);
    }
    const text = await res.text();
    if (!text.includes('Allow-action: read') || !text.includes('Disallow-action: write') || !text.includes('Contact:')) {
      throw new Error('agents.txt missing expected directives');
    }
  });

  console.log(`\n=== Verification Complete: ${passed} passed, ${failed} failed ===\n`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test runner error:', err);
  process.exit(1);
});
