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
const rootStaticPaths = routes.filter(([, route]) => route.srcRoute === '/[slug]').map(([pathname]) => pathname);
assert.deepEqual(new Set(rootStaticPaths), new Set(learnRoutes.map(route => `/${route.slug}`)), 'Only finite learning pages should be prebuilt under /[slug]');
assert.equal(routes.filter(([, route]) => route.srcRoute === '/jobs/[slug]').length, 0, 'Job aliases must not be bulk-prerendered');
assert.ok(manifest.dynamicRoutes['/[slug]'], 'Details must retain on-demand ISR');
assert.notEqual(manifest.dynamicRoutes['/[slug]'].fallback, false);
assert.equal(routes.filter(([, route]) => route.srcRoute?.startsWith('/job-listing-cache/')).length, 0, 'Expiry windows must not be bulk-prerendered');
for (const route of ['/', '/jobs', '/companies', '/community', '/events', '/news']) {
  assert.ok(manifest.routes[route], `${route} must remain prebuilt`);
}
console.log(`Prerender budget passed: ${routes.length} static routes; details retain ISR and job listing cache windows are built on demand.`);
