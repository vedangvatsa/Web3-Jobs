import assert from 'node:assert/strict';
import fs from 'node:fs';

type PrerenderManifest = {
  routes: Record<string, { srcRoute?: string | null }>;
  dynamicRoutes: Record<string, { fallback: string | false | null; fallbackRevalidate?: number | false }>;
};

const manifest = JSON.parse(fs.readFileSync('.next/prerender-manifest.json', 'utf8')) as PrerenderManifest;
const routes = Object.entries(manifest.routes);
assert.ok(routes.length <= 300, `Unexpected static generation growth: ${routes.length} routes (budget: 300)`);
assert.equal(routes.filter(([, route]) => route.srcRoute === '/[slug]').length, 0, 'Detail pages must use on-demand ISR');
assert.equal(routes.filter(([, route]) => route.srcRoute === '/jobs/[slug]').length, 0, 'Job aliases must not be bulk-prerendered');
assert.ok(manifest.dynamicRoutes['/[slug]'], 'The detail route must remain available');
assert.notEqual(manifest.dynamicRoutes['/[slug]'].fallback, false, 'Unbuilt detail pages must render on demand instead of returning 404');
for (const route of ['/', '/jobs', '/events', '/news', '/companies']) {
  assert.ok(manifest.routes[route], `${route} must remain prebuilt`);
}
console.log(`Prerender budget passed: ${routes.length} static routes; detail pages and job aliases generated on demand.`);
