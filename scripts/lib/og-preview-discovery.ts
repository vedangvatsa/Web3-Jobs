import fs from 'node:fs';
import path from 'node:path';

export function discoverAppPageRoutes(directory = path.join(process.cwd(), 'src/app'), segments: string[] = []): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    if (entry.isDirectory()) {
      if (/^[_\.]/.test(entry.name)) return [];
      const nextSegments = entry.name.startsWith('@') || /^\([^.)][^/]*\)$/.test(entry.name)
        ? segments : [...segments, entry.name];
      return discoverAppPageRoutes(path.join(directory, entry.name), nextSegments);
    }
    return /^page\.(tsx?|jsx?|mdx)$/.test(entry.name) ? [`/${segments.join('/')}`] : [];
  });
}

export function assertStaticPagePreviewCoverage(paths: Iterable<string>, directory?: string): void {
  const collected = new Set(paths);
  const missing = discoverAppPageRoutes(directory).filter(route => !route.includes('[') && !collected.has(route));
  if (missing.length) throw new Error(`Public pages missing OG preview metadata: ${missing.join(', ')}`);
}
