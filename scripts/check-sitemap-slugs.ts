#!/usr/bin/env tsx
/**
 * Fail prebuild if sitemap root slugs are absent from the content and learning route registries.
 */
import fs from 'node:fs';
import path from 'node:path';
import { learnRoutes } from '../src/lib/learn-routes';
import { nomadRoutes } from '../src/lib/nomads/metadata';

const ROOT = path.resolve(import.meta.dirname, '..');

function loadKnownSlugs(): Set<string> {
  const types = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'content', 'slug-types.json'), 'utf8'),
  ) as Record<string, string[]>;
  const known = new Set<string>([...learnRoutes.map(route => route.slug), ...nomadRoutes().map(route => route.path.slice(1))]);
  for (const value of Object.values(types)) {
    if (!Array.isArray(value)) continue;
    for (const slug of value) known.add(String(slug).toLowerCase());
  }
  return known;
}

function main(): void {
  const known = loadKnownSlugs();
  const routes = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'content', 'sitemap-routes.json'), 'utf8'),
  ) as { url: string }[];

  const orphans: string[] = [];
  for (const route of routes) {
    const pathname = new URL(route.url).pathname.replace(/\/+$/, '');
    if (!pathname || pathname === '/' || pathname.includes('/', 1)) continue;
    const slug = pathname.slice(1).toLowerCase();
    // Root static assets (public/*.txt, etc.) are not slug-types entries.
    if (slug.includes('.')) continue;
    if (!known.has(slug)) orphans.push(slug);
  }

  if (orphans.length > 0) {
    console.error(`[check-sitemap-slugs] ${orphans.length} sitemap URL(s) not in route registries (would 404):`);
    for (const slug of orphans.slice(0, 40)) console.error(`  - /${slug}`);
    if (orphans.length > 40) console.error(`  … and ${orphans.length - 40} more`);
    process.exit(1);
  }

  console.log(`[check-sitemap-slugs] OK — ${routes.length} routes, all root slugs resolve in route registries.`);
}

main();
