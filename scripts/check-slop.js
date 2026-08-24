#!/usr/bin/env node
/**
 * Fail if published-facing content or code contains noslop violations.
 * See /noslop.md
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BAD_PUNCT = /[—–…]|[“”„‟‘’‚‛]/;
const AI_WORDS = [
  'delve',
  'navigate the landscape',
  'tapestry',
  'testament to',
  'demystify',
  'unveil',
  "in today's fast-paced",
  'unlock your potential',
  'game-changing',
];

const SCAN_DIRS = [
  'src',
  'content/articles',
  'content/companies',
  'content/glossary',
  'content/learn',
  'scripts/social',
];

const EXTRA_FILES = [
  'content/jobs-cache.json',
  'content/events-cache.json',
  'content/jobs-full-text.json',
];

function getFiles(dir, exts = ['.ts', '.tsx', '.js', '.jsx', '.md', '.mdx', '.json']) {
  const fullDir = path.join(ROOT, dir);
  if (!fs.existsSync(fullDir)) return [];
  const results = [];
  const entries = fs.readdirSync(fullDir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(fullDir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.next') continue;
      results.push(...getFiles(path.join(dir, entry.name), exts));
    } else if (exts.some(ext => entry.name.endsWith(ext))) {
      results.push(path.join(dir, entry.name));
    }
  }
  return results;
}

let files = [];
for (const d of SCAN_DIRS) {
  files.push(...getFiles(d));
}
for (const f of EXTRA_FILES) {
  if (fs.existsSync(path.join(ROOT, f))) files.push(f);
}

let issues = 0;

for (const rel of files) {
  // Skip noslop documentation files and the check/clean scripts themselves
  if (
    rel.includes('noslop.md') ||
    rel.includes('noslop.ts') ||
    rel.includes('check-slop') ||
    rel.includes('clean-slop') ||
    rel.includes('purge-slop') ||
    rel.includes('deslop-articles') ||
    rel.endsWith('.enc')
  ) {
    continue;
  }

  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) continue;
  const text = fs.readFileSync(full, 'utf8');

  const lines = text.split('\n');
  lines.forEach((line, i) => {
    const trimmed = line.trim();
    // Skip comment lines in code
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return;
    if (trimmed.includes('// em dash') || trimmed.includes('U+2014')) return;

    // Check for bad punctuation
    if (BAD_PUNCT.test(line)) {
      // If code file, only flag if it contains quotes/strings
      if (rel.startsWith('src/') || rel.startsWith('scripts/')) {
        if (/['"`]/.test(line)) {
          const match = line.match(BAD_PUNCT);
          console.log(`SLOP punct ${JSON.stringify(match[0])} in ${rel}:${i + 1}: ${trimmed.slice(0, 100)}`);
          issues++;
        }
      } else {
        const match = line.match(BAD_PUNCT);
        console.log(`SLOP punct ${JSON.stringify(match[0])} in ${rel}:${i + 1}: ${trimmed.slice(0, 100)}`);
        issues++;
      }
    }

    // Check AI words in markdown content & UI strings
    if (rel.endsWith('.md') || rel.endsWith('.mdx')) {
      const lower = trimmed.toLowerCase();
      for (const w of AI_WORDS) {
        const re = new RegExp(`\\b${w}\\b`, 'i');
        if (re.test(lower)) {
          console.log(`SLOP phrase "${w}" in ${rel}:${i + 1}: ${trimmed.slice(0, 100)}`);
          issues++;
        }
      }
    }
  });
}

console.log('\n' + (issues === 0 ? 'check-slop: clean' : `check-slop: ${issues} issue(s) found`));
process.exit(issues > 0 ? 1 : 0);
