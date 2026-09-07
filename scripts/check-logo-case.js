#!/usr/bin/env node
// Fails when a /logo/* URL referenced in src has no EXACT (case-sensitive)
// match under public/. macOS checkouts are case-insensitive so these break
// only in production on Linux (e.g. /logo/companies/jp_morgan.webp vs
// JP_Morgan.webp on disk rendered as broken tiles on /community).
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const PUBLIC = path.join(ROOT, 'public');

const REF_RE = /["'](\/logo\/[\w\-./]+\.(?:webp|png|svg|avif|jpg|jpeg))["']/g;

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === '.next') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(tsx?|mdx?|css)$/.test(e.name)) out.push(p);
  }
  return out;
}

let bad = 0;
for (const file of walk(SRC)) {
  const text = fs.readFileSync(file, 'utf8');
  const seen = new Set();
  let m;
  REF_RE.lastIndex = 0;
  while ((m = REF_RE.exec(text)) !== null) {
    const ref = m[1];
    if (seen.has(ref)) continue;
    seen.add(ref);
    const disk = path.join(PUBLIC, ref.slice(1));
    let names;
    try {
      names = fs.readdirSync(path.dirname(disk));
    } catch {
      console.error(`MISSING-DIR  ${ref}  (from ${path.relative(ROOT, file)})`);
      bad++;
      continue;
    }
    if (!names.includes(path.basename(disk))) {
      const alts = names.filter((n) => n.toLowerCase() === path.basename(disk).toLowerCase());
      console.error(`CASE-MISMATCH  ${ref}  on-disk:${alts.join(',') || '(absent)'}  (from ${path.relative(ROOT, file)})`);
      bad++;
    }
  }
}

if (bad > 0) {
  console.error(`\nFAIL: ${bad} logo reference(s) with no exact on-disk match.`);
  process.exit(1);
}
console.log('OK: all /logo/* references resolve case-sensitively.');
