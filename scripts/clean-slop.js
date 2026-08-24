#!/usr/bin/env node
/**
 * Comprehensive No-Slop batch cleaner for Web3-Jobs.
 * Normalizes punctuation and replaces AI/corporate filler with meaningful alternatives.
 *
 * Usage:
 *   node scripts/clean-slop.js          # dry-run
 *   node scripts/clean-slop.js --apply  # apply changes to disk
 */

const fs = require('fs');
const path = require('path');

const APPLY = process.argv.includes('--apply');
const ROOT = path.join(__dirname, '..');

// ── Protect Domain Terms & Code Blocks ──────────────────────────────
function protectPatterns(text) {
  const map = new Map();
  let count = 0;

  let protectedText = text;

  // Protect code fences
  protectedText = protectedText.replace(/```[\s\S]*?```/g, (m) => {
    const key = `__CODE_FENCE_${count++}__`;
    map.set(key, m);
    return key;
  });

  // Protect inline code
  protectedText = protectedText.replace(/`[^`\n]+`/g, (m) => {
    const key = `__INLINE_CODE_${count++}__`;
    map.set(key, m);
    return key;
  });

  // Protect financial & domain terms
  const domainPatterns = [
    /\b(?:token|cliff|linear|vesting|schedule)\s+unlock(?:s|ed|ing)?\b/gi,
    /\bunlock(?:s|ed|ing)?\s+(?:schedule|period|event|date|token|cliff)\b/gi,
    /\bParadigm\b/g, // Company name
    /\b(?:financial|margin|trading|debt|capital|2x|3x|5x|10x|20x|50x|100x)\s+leverage\b/gi,
    /\bleverage\s+(?:trading|ratio|facility|protocol|market|tokens?)\b/gi,
    /\bcomprehensive\s+(?:health|medical|dental|vision)\s+insurance\b/gi,
  ];

  for (const pat of domainPatterns) {
    protectedText = protectedText.replace(pat, (m) => {
      const key = `__DOMAIN_TERM_${count++}__`;
      map.set(key, m);
      return key;
    });
  }

  return {
    content: protectedText,
    restore: (str) => {
      let restored = str;
      for (const [key, val] of map) {
        restored = restored.replace(key, val);
      }
      return restored;
    },
  };
}

// ── Punctuation Replacements ─────────────────────────────────────────
function cleanPunctuation(text) {
  return text
    // Em dash
    .replace(/ — /g, ' - ')
    .replace(/—/g, ' - ')
    // En dash
    .replace(/ – /g, ' - ')
    .replace(/(\d+)\s*–\s*(\d+)/g, '$1-$2') // number ranges 0-1
    .replace(/–/g, '-')
    // Ellipsis
    .replace(/…/g, '...')
    // Quotes
    .replace(/[“”„‟]/g, '"')
    .replace(/[‘’‚‛]/g, "'")
    // Bullets & non-breaking spaces
    .replace(/^(\s*)•\s+/gm, '$1- ')
    .replace(/•/g, '-')
    .replace(/·/g, '-')
    .replace(/\u00A0/g, ' ')
    .replace(/\u200B|\u200C|\u200D|\uFEFF/g, '')
    // HTML entities
    .replace(/&mdash;/gi, ' - ')
    .replace(/&ndash;/gi, '-')
    .replace(/&#8212;/g, ' - ')
    .replace(/&#8211;/g, '-')
    .replace(/&#x2014;/gi, ' - ')
    .replace(/&#x2013;/gi, '-')
    .replace(/&hellip;/gi, '...')
    .replace(/&#8230;/g, '...')
    .replace(/&ldquo;|&rdquo;/gi, '"')
    .replace(/&lsquo;|&rsquo;/gi, "'");
}

// ── Meaningful AI & Filler Replacements ──────────────────────────────
const AI_REPLACEMENTS = [
  // Phrases
  [/\bin today'?s fast[- ]paced (?:digital )?world,?\s*/gi, "In today's industry, "],
  [/\bin today'?s rapidly evolving\b/gi, "in today's fast-moving"],
  [/\bnavigate the landscape of\b/gi, 'navigate the market for'],
  [/\bnavigate the landscape\b/gi, 'navigate the market'],
  [/\bat the forefront of\b/gi, 'leading'],
  [/\bdive deep into\b/gi, 'explore'],
  [/\bdive deep\b/gi, 'look closely'],
  [/\bunlock your potential\b/gi, 'grow your career'],
  [/\bgame[- ]changer\b/gi, 'major shift'],
  [/\bgame[- ]changing\b/gi, 'major'],
  [/\bit is important to note that\s+/gi, ''],
  [/\bit'?s important to note that\s+/gi, ''],
  [/\bit is worth noting that\s+/gi, ''],
  [/\bit'?s worth noting that\s+/gi, ''],
  [/\bat the end of the day,?\s*/gi, ''],
  [/\btestament to\b/gi, 'evidence of'],
  [/\bcutting[- ]edge\b/gi, 'advanced'],
  [/\bstate[- ]of[- ]the[- ]art\b/gi, 'modern'],
  [/\bbest[- ]in[- ]class\b/gi, 'top-tier'],
  [/\bworld[- ]class\b/gi, 'leading'],

  // Single Words
  [/\bdelve into\b/gi, 'examine'],
  [/\bdelves into\b/gi, 'examines'],
  [/\bdelved into\b/gi, 'examined'],
  [/\bdelving into\b/gi, 'examining'],
  [/\bdelve\b/gi, 'explore'],
  [/\bdelves\b/gi, 'explores'],
  [/\bdelved\b/gi, 'explored'],
  [/\bdelving\b/gi, 'exploring'],
  [/\btapestry\b/gi, 'mix'],
  [/\bdemystify\b/gi, 'explain'],
  [/\bdemystifies\b/gi, 'explains'],
  [/\bdemystified\b/gi, 'explained'],
  [/\bdemystifying\b/gi, 'explaining'],
  [/\bunveil\b/gi, 'introduce'],
  [/\bunveils\b/gi, 'introduces'],
  [/\bunveiled\b/gi, 'introduced'],
  [/\bunveiling\b/gi, 'introducing'],
  [/\bpivotal\b/gi, 'key'],
  [/\bvibrant\b/gi, 'active'],
  [/\bmeticulous\b/gi, 'thorough'],
  [/\bmeticulously\b/gi, 'carefully'],
  [/\bgroundbreaking\b/gi, 'notable'],
  [/\bseamlessly\b/gi, 'smoothly'],
  [/\bseamless\b/gi, 'smooth'],
  [/\butilize\b/gi, 'use'],
  [/\butilizes\b/gi, 'uses'],
  [/\butilized\b/gi, 'used'],
  [/\butilizing\b/gi, 'using'],
  [/\butilization\b/gi, 'use'],
  [/\bsynergies\b/gi, 'cooperation'],
  [/\bsynergy\b/gi, 'collaboration'],
  [/\bholistic\b/gi, 'complete'],
  [/\bholistically\b/gi, 'comprehensively'],
  [/\bsupercharge\b/gi, 'speed up'],
  [/\bsupercharges\b/gi, 'speeds up'],
  [/\bsupercharged\b/gi, 'accelerated'],
  [/\bsupercharging\b/gi, 'accelerating'],
  [/\breimagine\b/gi, 'rethink'],
  [/\breimagines\b/gi, 'rethinks'],
  [/\breimagined\b/gi, 'redesigned'],
  [/\breimagining\b/gi, 'rethinking'],
  [/\brevolutionize\b/gi, 'transform'],
  [/\brevolutionizes\b/gi, 'transforms'],
  [/\brevolutionized\b/gi, 'transformed'],
  [/\brevolutionizing\b/gi, 'transforming'],
  [/\bleveraging\b/gi, 'using'],
  [/\bleveraged\b/gi, 'used'],
  [/\bleverages\b/gi, 'uses'],
  [/\bleverage\b/gi, 'use'],
];

function cleanContent(text, isMarkdownOrText) {
  // 1. Protect code & domain terms
  const { content: protectedText, restore } = protectPatterns(text);

  // 2. Clean punctuation
  let cleaned = cleanPunctuation(protectedText);

  // 3. Clean AI filler if markdown or text content
  if (isMarkdownOrText) {
    for (const [re, rep] of AI_REPLACEMENTS) {
      cleaned = cleaned.replace(re, rep);
    }
  }

  // 4. Clean up whitespace
  cleaned = cleaned
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/ \./g, '.')
    .replace(/ ,/g, ',')
    .replace(/ - - /g, ' - ');

  // 5. Restore protected terms
  return restore(cleaned);
}

// ── Directory Processing ────────────────────────────────────────────
const TARGET_DIRS = [
  'content/articles',
  'content/companies',
  'content/glossary',
  'content/learn',
  'content/generated',
  'scripts/social',
];

const TARGET_FILES = [
  'content/jobs-cache.json',
  'content/events-cache.json',
  'content/jobs-full-text.json',
];

function scanFiles(dir) {
  const fullDir = path.join(ROOT, dir);
  if (!fs.existsSync(fullDir)) return [];
  const results = [];
  const entries = fs.readdirSync(fullDir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(fullDir, entry.name);
    if (entry.isDirectory()) {
      results.push(...scanFiles(path.join(dir, entry.name)));
    } else if (/\.(md|mdx|json|ts|tsx|js)$/.test(entry.name)) {
      results.push(path.join(dir, entry.name));
    }
  }
  return results;
}

let totalFiles = 0;
let modifiedFiles = 0;

console.log(APPLY ? 'Applying No-Slop Cleanups to Web3-Jobs...\n' : 'Dry-run: Scanning and checking cleanups...\n');

const allTargets = [...TARGET_FILES];
for (const dir of TARGET_DIRS) {
  allTargets.push(...scanFiles(dir));
}

for (const rel of allTargets) {
  if (rel.endsWith('.enc') || rel.includes('check-slop') || rel.includes('clean-slop')) continue;
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) continue;

  totalFiles++;
  const original = fs.readFileSync(full, 'utf8');
  const isMd = rel.endsWith('.md') || rel.endsWith('.mdx') || rel.endsWith('.json');
  const cleaned = cleanContent(original, isMd);

  if (cleaned !== original) {
    modifiedFiles++;
    console.log(`✓ Cleaned ${rel}`);
    if (APPLY) {
      fs.writeFileSync(full, cleaned, 'utf8');
    }
  }
}

console.log(`\n===========================================`);
console.log(`Scanned: ${totalFiles} files`);
console.log(`Modified: ${modifiedFiles} files`);
console.log(APPLY ? 'All changes saved to disk.' : 'Dry-run complete. Run with --apply to save changes.');
