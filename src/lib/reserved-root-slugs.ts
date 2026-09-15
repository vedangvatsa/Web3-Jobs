import fs from 'fs';
import path from 'path';
import { getAllResourcePages } from '@/lib/pseo/resources';
import { getPopupSlugs } from '@/lib/popups';
import { getEventSlug } from '@/lib/events';

/** App Router paths that must never be used as job slugs. */
export const RESERVED_APP_ROUTE_SLUGS: readonly string[] = [
  'jobs',
  'blog',
  'glossary',
  'companies',
  'community',
  'learn',
  'news',
  'developers',
  'api-docs',
  'docs',
  'auth',
  'api-policy',
  'resources',
  'events',
  'contact',
  'privacy',
  'ask',
  'mcp',
  'developer',
  'dev',
  'about',
  'popups',
];

const NON_ARTICLE_MARKDOWN = new Set(['AGENTS.md', 'README.md']);

function markdownSlugsInDir(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith('.md') && !NON_ARTICLE_MARKDOWN.has(name))
    .map((name) => name.replace(/\.md$/, '').toLowerCase());
}

function companySlugsFromDisk(): string[] {
  const dir = path.join(process.cwd(), 'content', 'companies');
  return markdownSlugsInDir(dir);
}

function hyphenSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[’'"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

function companySlugsFromJobsCache(): string[] {
  const cachePath = path.join(process.cwd(), 'content', 'jobs-cache.json');
  if (!fs.existsSync(cachePath)) return [];
  try {
    const jobs = JSON.parse(fs.readFileSync(cachePath, 'utf-8')) as Array<{ company?: string }>;
    if (!Array.isArray(jobs)) return [];
    const slugs = new Set<string>();
    for (const job of jobs) {
      const slug = hyphenSlug(job.company || '');
      if (slug) slugs.add(slug);
    }
    return [...slugs];
  } catch {
    return [];
  }
}

function appRouteSlugsFromDisk(): string[] {
  const appDir = path.join(process.cwd(), 'src', 'app');
  if (!fs.existsSync(appDir)) return [];
  return fs
    .readdirSync(appDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => !name.startsWith('[') && !name.startsWith('_') && name !== 'api')
    .map((name) => name.toLowerCase());
}

function eventSlugsFromCache(): string[] {
  const cachePath = path.join(process.cwd(), 'content', 'events-cache.json');
  if (!fs.existsSync(cachePath)) return [];
  try {
    const events = JSON.parse(fs.readFileSync(cachePath, 'utf-8')) as Array<{ slug?: string; name?: string }>;
    if (!Array.isArray(events)) return [];
    return events
      .map((event) =>
        getEventSlug({ name: event.name ?? '', slug: event.slug }),
      )
      .map((slug) => slug.toLowerCase().trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

/**
 * Root slugs owned by site content (not jobs).
 * Job minting never assigns these, and any existing job sitting on one is reminted.
 */
export function loadReservedRootSlugsSync(): Set<string> {
  const reserved = new Set<string>();

  for (const slug of RESERVED_APP_ROUTE_SLUGS) {
    reserved.add(slug.toLowerCase());
  }
  for (const slug of appRouteSlugsFromDisk()) {
    reserved.add(slug);
  }

  for (const slug of markdownSlugsInDir(path.join(process.cwd(), 'content', 'articles'))) {
    reserved.add(slug);
  }
  for (const slug of markdownSlugsInDir(path.join(process.cwd(), 'content', 'glossary'))) {
    reserved.add(slug);
  }
  for (const slug of companySlugsFromDisk()) {
    reserved.add(slug);
  }
  for (const slug of companySlugsFromJobsCache()) {
    reserved.add(slug);
  }
  for (const slug of getPopupSlugs()) {
    reserved.add(slug.toLowerCase());
  }
  for (const page of getAllResourcePages()) {
    reserved.add(page.seo.canonicalSlug.toLowerCase());
  }
  for (const slug of eventSlugsFromCache()) {
    reserved.add(slug);
  }

  return reserved;
}
