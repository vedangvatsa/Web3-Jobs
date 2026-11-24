import fs from 'node:fs';
import path from 'node:path';

const legacyPath = path.join(process.cwd(), 'content/articles/legacy-slugs.json');
const articlesDir = path.join(process.cwd(), 'content/articles');

const legacy = JSON.parse(fs.readFileSync(legacyPath, 'utf8')) as Record<string, string>;

const oneWord = /^[a-z0-9]+$/;

for (const [from, to] of Object.entries(legacy)) {
  if (from === to) throw new Error(`legacy slug self-map: ${from}`);
  if (!oneWord.test(to)) {
    throw new Error(`Article legacy target /${to} must be a single short slug (lowercase, no hyphens); got legacy map from /${from}`);
  }
  const target = path.join(articlesDir, `${to}.md`);
  if (!fs.existsSync(target)) {
    throw new Error(`Article legacy redirect /${from} → /${to} but ${target} is missing`);
  }
  const stale = path.join(articlesDir, `${from}.md`);
  if (fs.existsSync(stale)) {
    throw new Error(`Article ${from}.md still exists; canonical slug should be ${to}`);
  }
}

console.log(`✓ ${Object.keys(legacy).length} article legacy slugs point at published markdown files`);