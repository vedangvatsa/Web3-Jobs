import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import nextConfig from '../next.config.mjs';
import { buildSitemapRoutes } from '../src/lib/sitemap-build';

async function main() {
  const expected = new Map([
    ['/docs', '/developers'],
    ['/api-docs', '/developers'],
    ['/auth', '/developers'],
    ['/api-policy', '/api-policy.md'],
    ['/docs/llms.txt', '/developers/llms.txt'],
    ['/deprecation-policy', '/api-policy.md'],
    ['/versioning-policy', '/api-policy.md'],
  ]);
  const redirects = await nextConfig.redirects();
  for (const [source, destination] of expected) {
    const redirect = redirects.find((entry: { source: string }) => entry.source === source);
    assert.ok(redirect, `Missing compatibility redirect: ${source}`);
    assert.equal(redirect.destination, destination);
    assert.equal(redirect.permanent, true);
    assert.ok(!expected.has(destination), `${source} should not enter a redirect chain`);
    assert.ok(fs.existsSync(destination.endsWith('.md') || destination.endsWith('.txt')
      ? path.join('public', destination)
      : path.join('src/app', destination, 'page.tsx')), `Missing redirect destination ${destination}`);
  }
  const routes = await buildSitemapRoutes();
  for (const route of routes) assert.ok(!expected.has(new URL(route.url).pathname), `Retired URL in sitemap: ${route.url}`);
  for (const route of ['/docs', '/api-docs', '/auth', '/api-policy']) {
    assert.equal(fs.existsSync(path.join('src/app', route, 'page.tsx')), false);
  }
  assert.ok(routes.some((route) => route.url === 'https://hashtagweb3.com/developers'));
  assert.ok(routes.some((route) => route.url === 'https://hashtagweb3.com/contact'));
  assert.ok(!redirects.some((entry: { source: string }) => entry.source === '/contact'), 'OAuth landing page must not redirect');
  console.log('Retired pages: redirects resolve directly, obsolete URLs excluded from sitemap, contact callback preserved.');
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
