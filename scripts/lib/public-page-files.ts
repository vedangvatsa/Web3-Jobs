import fs from 'node:fs';
import path from 'node:path';

export function publicRootFiles(root = process.cwd()): string[] {
  const directory = path.join(root, 'public');
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true })
    .filter(entry => entry.isFile() && !entry.name.startsWith('.'))
    .map(entry => `public/${entry.name}`).sort();
}

export function appRootPageSlugs(root = process.cwd()): string[] {
  const slugs = new Set<string>();
  function visit(directory: string, segments: string[]) {
    if (!fs.existsSync(directory)) return;
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (/^[\[_@.]/.test(entry.name)) continue;
        const next = /^\(.*\)$/.test(entry.name) ? segments : [...segments, entry.name];
        if (next.length <= 1) visit(path.join(directory, entry.name), next);
      } else if (/^page\.(?:tsx?|jsx?|mdx)$/.test(entry.name) && segments.length === 1) {
        slugs.add(segments[0]);
      }
    }
  }
  visit(path.join(root, 'src/app'), []);
  return [...slugs].sort();
}
