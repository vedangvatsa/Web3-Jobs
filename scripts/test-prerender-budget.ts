import assert from 'node:assert/strict';
import fs from 'node:fs';
import { learnRoutes } from '../src/lib/learn-routes';

type PrerenderManifest = {
  routes: Record<string, { srcRoute?: string | null }>;
  dynamicRoutes: Record<string, { fallback: string | false | null; fallbackRevalidate?: number | false }>;
};

const manifest = JSON.parse(fs.readFileSync('.next/prerender-manifest.json', 'utf8')) as PrerenderManifest;
const routes = Object.entries(manifest.routes);
assert.ok(routes.length <= 300, `Unexpected static generation growth: ${routes.length} routes (budget: 300)`);
const learningPaths = new Set(learnRoutes.map(route => `/${route.slug}`));
const rootStaticPaths = routes.filter(([, route]) => route.srcRoute === '/[slug]').map(([pathname]) => pathname);
assert.deepEqual(new Set(rootStaticPaths), learningPaths, 'Only the registered learning pages should be prebuilt under /[slug]');
assert.equal(routes.filter(([, route]) => route.srcRoute === '/jobs/[slug]').length, 0, 'Job aliases must not be bulk-prerendered');
assert.ok(manifest.dynamicRoutes['/[slug]'], 'The detail route must remain available');
assert.notEqual(manifest.dynamicRoutes['/[slug]'].fallback, false, 'Unbuilt detail pages must render on demand instead of returning 404');
for (const route of ['/', '/jobs', '/events', '/news', '/companies']) {
  assert.ok(manifest.routes[route], `${route} must remain prebuilt`);
}
console.log(`Prerender budget passed: ${routes.length} static routes, including ${learningPaths.size} learning pages; other detail pages use ISR.`);
