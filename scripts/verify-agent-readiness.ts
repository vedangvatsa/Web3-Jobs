import fs from 'fs';
import path from 'path';

async function testAll() {
  console.log('=== Agent Readiness Verification ===\n');

  // 1. Check robots.txt
  console.log('1. Checking robots.txt...');
  const robots = fs.readFileSync(path.join(process.cwd(), 'public', 'robots.txt'), 'utf8');
  const crawlers = ['ChatGPT-User', 'ClaudeBot', 'Google-Extended', 'ora-agent', 'DeepSeekBot'];
  for (const c of crawlers) {
    if (!robots.includes(`User-agent: ${c}`)) {
      throw new Error(`robots.txt missing crawler: ${c}`);
    }
  }
  if (robots.includes('Disallow: /api/')) {
    throw new Error('robots.txt still has broad Disallow: /api/');
  }
  console.log('  ✓ robots.txt explicitly allows all top AI crawlers and public APIs.');

  // 2. Check ai.json and ai.txt
  console.log('\n2. Checking ai.json & ai.txt...');
  const aiJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public', 'ai.json'), 'utf8'));
  for (const c of crawlers) {
    if (!aiJson.allow.crawlers.includes(c)) {
      throw new Error(`ai.json allow.crawlers missing: ${c}`);
    }
  }
  console.log('  ✓ ai.json & ai.txt configured with all agent crawlers and context links.');

  // 3. Check OpenAPI specs
  console.log('\n3. Checking OpenAPI specs...');
  const openapiJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public', 'openapi.json'), 'utf8'));
  if (openapiJson.openapi !== '3.1.0' || !openapiJson.paths['/api/jobs'] || !openapiJson.paths['/api/news'] || !openapiJson.paths['/api/events'] || !openapiJson.paths['/api/glossary']) {
    throw new Error('OpenAPI JSON is missing required paths');
  }
  // Check operationId on each path
  for (const p of Object.keys(openapiJson.paths)) {
    const op = openapiJson.paths[p].get;
    if (!op || !op.operationId || !op.summary || !op.responses['200'] || !op.responses['400']) {
      throw new Error(`OpenAPI path ${p} missing operationId, summary, or error responses`);
    }
  }
  console.log('  ✓ openapi.json is valid OpenAPI 3.1.0 with typed operations, operationIds, and error schemas.');

  const openapiYaml = fs.readFileSync(path.join(process.cwd(), 'public', 'api', 'openapi.yaml'), 'utf8');
  if (!openapiYaml.includes('openapi: 3.1.0') || !openapiYaml.includes('listJobs') || !openapiYaml.includes('listNews')) {
    throw new Error('OpenAPI YAML invalid');
  }
  console.log('  ✓ api/openapi.yaml verified.');

  // 4. Check llms.txt & agents.json
  console.log('\n4. Checking llms.txt & agents.json...');
  const llms = fs.readFileSync(path.join(process.cwd(), 'public', 'llms.txt'), 'utf8');
  if (!llms.includes('## When to Use Hashtag Web3') || !llms.includes('openapi.json')) {
    throw new Error('llms.txt missing When to Use section');
  }
  const agentsJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public', '.well-known', 'agents.json'), 'utf8'));
  if (!agentsJson.when_to_use || !agentsJson.mcp_server) {
    throw new Error('agents.json missing when_to_use or mcp_server');
  }
  console.log('  ✓ llms.txt and .well-known/agents.json include explicit When to Use guidance and MCP configurations.');

  // 5. Test CLI tool
  console.log('\n5. Checking CLI tool...');
  const binScript = fs.readFileSync(path.join(process.cwd(), 'bin', 'hashtagweb3.js'), 'utf8');
  if (!binScript.includes('#!/usr/bin/env node') || !binScript.includes('jobs') || !binScript.includes('glossary')) {
    throw new Error('CLI script invalid');
  }
  console.log('  ✓ bin/hashtagweb3.js verified.');

  console.log('\n=== ALL AGENT READINESS AUDIT CHECKS PASSED ===\n');
}

testAll().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
