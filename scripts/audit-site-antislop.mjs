import fs from 'node:fs';
import path from 'node:path';

const articlesDir = 'content/articles';
const files = fs.readdirSync(articlesDir).filter(f => f.endsWith('.md'));

const bannedTokens = [
  'delve', 'delving', 'tapestry', 'landscape', 'beacon', 'foster', 'fostering',
  'unlock', 'unlocking', 'harness', 'harnessing', 'testament',
  'furthermore', 'moreover', 'revolutionize', 'revolutionizing', 'revolutionary',
  'seamless', 'seamlessly', 'game-changer', 'plethora', 'myriad',
  "in today's world", "in today's rapidly evolving", "in today's fast-paced",
  "it's important to note", "it is important to note", "it's notable that",
  'bustling', 'vibrant', 'nestled', 'only time will tell', 'the question remains',
  'a double-edged sword', 'marking a pivotal moment', 'ushering in a new era',
  "let's dive in", "let's delve", 'in conclusion'
];

let totalConclusionHeadings = 0;
let totalEmDashes = 0;
let totalBannedWords = 0;
const flaggedArticles = [];

for (const file of files) {
  const content = fs.readFileSync(path.join(articlesDir, file), 'utf8');
  const issues = [];

  // Check Conclusion heading
  const conclusionMatch = content.match(/^#{1,4}\s+(In\s+)?Conclusion\b/gmi);
  if (conclusionMatch) {
    totalConclusionHeadings += conclusionMatch.length;
    issues.push(`${conclusionMatch.length}x Conclusion heading`);
  }

  // Check em-dashes
  const emDashes = (content.match(/—/g) || []).length;
  if (emDashes > 0) {
    totalEmDashes += emDashes;
    issues.push(`${emDashes} em-dashes`);
  }

  // Check banned tokens
  for (const token of bannedTokens) {
    const reg = new RegExp(`\\b${token}\\b`, 'gi');
    const matches = content.match(reg);
    if (matches) {
      totalBannedWords += matches.length;
      issues.push(`${matches.length}x "${token}"`);
    }
  }

  if (issues.length > 0) {
    flaggedArticles.push({ file, issues });
  }
}

console.log(`--- ARTICLES AUDIT ---`);
console.log(`Total articles: ${files.length}`);
console.log(`Articles with issues: ${flaggedArticles.length}`);
console.log(`Total 'Conclusion' headings: ${totalConclusionHeadings}`);
console.log(`Total em-dashes: ${totalEmDashes}`);
console.log(`Total banned AI tokens: ${totalBannedWords}`);

// Also check UI / src pages
console.log(`\n--- UI / SOURCE CODE AUDIT ---`);
function scanDir(dir, exts) {
  let found = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name !== 'node_modules' && e.name !== '.next' && e.name !== '.git') {
        found = found.concat(scanDir(p, exts));
      }
    } else if (exts.includes(path.extname(e.name))) {
      found.push(p);
    }
  }
  return found;
}

const srcFiles = scanDir('src', ['.tsx', '.ts']);
const flaggedSrc = [];
for (const file of srcFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const issues = [];
  const emDashes = (content.match(/—/g) || []).length;
  if (emDashes > 0) {
    issues.push(`${emDashes} em-dashes`);
  }
  for (const token of bannedTokens) {
    const reg = new RegExp(`\\b${token}\\b`, 'gi');
    const matches = content.match(reg);
    if (matches) {
      issues.push(`${matches.length}x "${token}"`);
    }
  }
  if (issues.length > 0) {
    flaggedSrc.push({ file, issues });
  }
}
console.log(`Total src files scanned: ${srcFiles.length}`);
console.log(`Src files with issues: ${flaggedSrc.length}`);
for (const s of flaggedSrc) {
  console.log(`  ${s.file}: ${s.issues.join(', ')}`);
}
