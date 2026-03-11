/**
 * Stamps today's date as `lastUpdated` in every article's frontmatter.
 * Also sets `publishedDate` if not already present (uses today as fallback).
 * Run before deploy to keep dates fresh for AI citability.
 *
 * Usage: npx tsx scripts/stamp-article-dates.ts
 */

import fs from 'fs';
import path from 'path';

const articlesDir = path.join(process.cwd(), 'content/articles');
const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"

const files = fs.readdirSync(articlesDir).filter(f => f.endsWith('.md'));
let updated = 0;

for (const file of files) {
  const filePath = path.join(articlesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Must have frontmatter
  if (!content.startsWith('---')) continue;

  const fmEnd = content.indexOf('---', 3);
  if (fmEnd === -1) continue;

  let frontmatter = content.slice(3, fmEnd);
  const body = content.slice(fmEnd + 3);

  // Set publishedDate if missing
  if (!/^publishedDate:/m.test(frontmatter)) {
    frontmatter += `publishedDate: "${today}"\n`;
  }

  // Set or update lastUpdated
  if (/^lastUpdated:/m.test(frontmatter)) {
    frontmatter = frontmatter.replace(/^lastUpdated:.*$/m, `lastUpdated: "${today}"`);
  } else {
    frontmatter += `lastUpdated: "${today}"\n`;
  }

  fs.writeFileSync(filePath, `---${frontmatter}---${body}`, 'utf8');
  updated++;
}

console.log(`Stamped ${updated} articles with lastUpdated: ${today}`);
