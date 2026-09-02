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
    if (!html.includes('<h1') || !html.includes('Find Your Next Web3 Job')) {
      throw new Error('H1 heading missing from SSR HTML');
    }
    if (!html.includes('<h2') || !html.includes('<h3')) {
      throw new Error('H2 and H3 heading hierarchy missing from SSR HTML');
    }
    if (html.length < 500) {
      throw new Error(`Raw HTML is too short (${html.length} chars)`);
    }
  });

  // 3. Rate limit response headers
  await test('3. REST endpoints return RFC RateLimit, Sunset, and Deprecation headers', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/jobs?limit=2`);
    if (res.status !== 200) {
      throw new Error(`GET /api/v1/jobs failed with status ${res.status}`);
    }
    const rlLimit = res.headers.get('RateLimit-Limit') || res.headers.get('X-RateLimit-Limit');
    const rlReset = res.headers.get('RateLimit-Reset') || res.headers.get('X-RateLimit-Reset');
    const sunset = res.headers.get('Sunset');
    const apiVer = res.headers.get('API-Version');

    if (!rlLimit) throw new Error('Missing RateLimit-Limit header');
    if (!rlReset) throw new Error('Missing RateLimit-Reset header');
    if (!sunset) throw new Error('Missing Sunset header');
    if (!apiVer) throw new Error('Missing API-Version header');
  });

  // 4 & 5 & 8. Developer resource discoverability & portal
  await test('4, 5, 8. Developer portal (/developers) is reachable with OpenAPI and Auth docs', async () => {
    const res = await fetch(`${BASE_URL}/developers`);
    if (res.status !== 200) {
      throw new Error(`GET /developers returned ${res.status}`);
    }
    const html = await res.text();
    if (!html.includes('openapi.json') || !html.includes('API Quickstart') || !html.includes('Authentication')) {
      throw new Error('Developer portal missing core documentation sections');
    }
  });

  // 6. MCP Server / Manifest
  await test('6. MCP Streamable HTTP endpoint and manifest are accessible', async () => {
    const manifestRes = await fetch(`${BASE_URL}/.well-known/mcp`);
    if (manifestRes.status !== 200) {
      throw new Error(`GET /.well-known/mcp returned ${manifestRes.status}`);
    }
    const manifest = await manifestRes.json();
    if (!manifest.tools || !Array.isArray(manifest.tools)) {
      throw new Error('MCP manifest missing tools array');
    }

    // Test MCP tools/list JSON-RPC POST call
    const rpcRes = await fetch(`${BASE_URL}/api/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: '1', method: 'tools/list' })
    });
    if (rpcRes.status !== 200) {
      throw new Error(`POST /api/mcp tools/list returned ${rpcRes.status}`);
    }
    const rpcJson = await rpcRes.json();
    if (!rpcJson.result?.tools) {
      throw new Error('MCP tools/list JSON-RPC call did not return tools');
    }
  });

  // 7. Public API with reachable endpoints
  await test('7. Public REST API endpoints (/api/v1/* and /api/*) return valid JSON data', async () => {
    const endpoints = [
      '/api/v1/jobs?limit=2',
      '/api/jobs?limit=2',
      '/api/v1/news?limit=2',
      '/api/news?limit=2',
      '/api/v1/events?limit=2',
      '/api/events?limit=2',
      '/api/v1/glossary?limit=2',
      '/api/glossary?limit=2',
    ];

    for (const ep of endpoints) {
      const res = await fetch(`${BASE_URL}${ep}`);
      if (res.status !== 200) {
        throw new Error(`GET ${ep} returned ${res.status}`);
      }
      const json = await res.json();
      if (!json.data || !Array.isArray(json.data)) {
        throw new Error(`GET ${ep} response missing 'data' array`);
      }
    }
  });

  // 9. Agent instruction / when-to-use
  await test('9. agents.json and llms.txt contain explicit when-to-use guidance', async () => {
    const agentsRes = await fetch(`${BASE_URL}/.well-known/agents.json`);
    const agents = await agentsRes.json();
    if (!agents.when_to_use || !agents.when_to_use.best_fit_use_cases) {
      throw new Error('agents.json missing when_to_use.best_fit_use_cases');
    }

    const llmsRes = await fetch(`${BASE_URL}/llms.txt`);
    const llmsText = await llmsRes.text();
    if (!llmsText.includes('## When to Use Hashtag Web3')) {
      throw new Error('llms.txt missing "## When to Use Hashtag Web3" section');
    }
  });

  // 10. REST versioning & deprecation policy
  await test('10. REST versioning and deprecation policy documented and functional', async () => {
    const openapiRes = await fetch(`${BASE_URL}/openapi.json`);
    const openapi = await openapiRes.json();
    if (!openapi.paths['/api/v1/jobs'] || !openapi.paths['/api/jobs']) {
      throw new Error('openapi.json missing /api/v1/jobs or /api/jobs path definitions');
    }
    if (!openapi.info['x-api-versioning']) {
      throw new Error('openapi.json missing x-api-versioning declaration');
    }
  });

  // 11. CLI tool available
  await test('11. Official CLI tool executes with valid output', async () => {
    const output = execSync('node bin/hashtagweb3.js jobs --limit 2', { encoding: 'utf8' });
    if (!output.includes('Found') && !output.includes('jobs')) {
      throw new Error(`CLI output unexpected: ${output}`);
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
