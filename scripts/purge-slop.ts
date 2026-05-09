#!/usr/bin/env node

/**
 * Batch purge AI slop words from all content files.
 * 
 * Usage:
 *   npx tsx scripts/purge-slop.ts          # dry-run (shows what would change)
 *   npx tsx scripts/purge-slop.ts --apply  # actually write changes
 */

import * as fs from 'fs';
import * as path from 'path';

const APPLY = process.argv.includes('--apply');

// ── Replacement rules ────────────────────────────────────────────────
// Each rule: [pattern (case-insensitive), replacement]
// Rules are applied in order. Patterns use word boundaries to avoid
// partial matches. Context-aware rules come first to protect valid usage.

interface Rule {
  pattern: RegExp;
  replacement: string;
  /** If set, only apply in these directories (relative to repo root) */
  scope?: string[];
}

const RULES: Rule[] = [
  // ── PROTECT: false positives ──────────────────────────────────────
  // "token unlock" / "unlock schedule" are domain terms — skip them
  // "Paradigm" as a company name — skip
  // "robust" in engineering contexts (tests, systems) — mostly fine
  // "comprehensive health insurance" — valid phrase

  // ── PHRASE-LEVEL replacements (most impactful, fewest false positives) ──
  { pattern: /\bat the forefront of\b/gi, replacement: 'leading' },
  { pattern: /\bat the forefront\b/gi, replacement: 'leading' },
  { pattern: /\bin today'?s rapidly evolving\b/gi, replacement: 'in today\'s' },
  { pattern: /\brapidly evolving\b/gi, replacement: 'fast-moving' },
  { pattern: /\bdive deep into\b/gi, replacement: 'explore' },
  { pattern: /\bdive deep\b/gi, replacement: 'look closely' },
  { pattern: /\bit'?s important to note that\b/gi, replacement: '' },
  { pattern: /\bit'?s worth noting that\b/gi, replacement: '' },
  { pattern: /\bin essence,?\s*/gi, replacement: '' },
  { pattern: /\bin conclusion,?\s*/gi, replacement: '' },
  { pattern: /\beverr?-evolving\b/gi, replacement: 'changing' },
  { pattern: /\bnext-generation\b/gi, replacement: 'modern' },
  { pattern: /\bnext generation\b(?!\s+of)/gi, replacement: 'modern' },
  { pattern: /\bstate-of-the-art\b/gi, replacement: 'advanced' },
  { pattern: /\bbest-in-class\b/gi, replacement: 'top-tier' },
  { pattern: /\bworld-class\b/gi, replacement: 'top-tier' },
  { pattern: /\bcutting-edge\b/gi, replacement: 'advanced' },
  { pattern: /\bgame-?changer\b/gi, replacement: 'major shift' },

  // ── SINGLE-WORD replacements ──────────────────────────────────────
  // "seamless" → delete or replace with "smooth"
  { pattern: /\bseamless(?:ly)?\b/gi, replacement: 'smooth' },
  // "innovative" → specific or delete
  { pattern: /\binnovative\b/gi, replacement: 'new' },
  // "leverage" (when not financial) → "use"
  { pattern: /\bleverag(?:e|es|ed|ing)\b/gi, replacement: 'use' },
  // "streamline" → "simplify"
  { pattern: /\bstreamlin(?:e|es|ed|ing)\b/gi, replacement: 'simplify' },
  // "empower" → "enable" or "give"
  { pattern: /\bempower(?:s|ed|ing)?\b/gi, replacement: 'enable' },
  // "elevate" → "improve"
  { pattern: /\belevat(?:e|es|ed|ing)\b/gi, replacement: 'improve' },
  // "foster" → "support" or "build"
  { pattern: /\bfoster(?:s|ed|ing)?\b/gi, replacement: 'build' },
  // "vibrant" → "active"
  { pattern: /\bvibrant\b/gi, replacement: 'active' },
  // "thriving" → "growing"
  { pattern: /\bthriving\b/gi, replacement: 'growing' },
  // "bustling" → "busy"
  { pattern: /\bbustling\b/gi, replacement: 'busy' },
  // "transformative" → "significant"
  { pattern: /\btransformative\b/gi, replacement: 'significant' },
  // "groundbreaking" → "notable"
  { pattern: /\bgroundbreaking\b/gi, replacement: 'notable' },
  // "pioneering" → "early"
  { pattern: /\bpioneering\b/gi, replacement: 'early' },
  // "unprecedented" → "unusual" or "rare"
  { pattern: /\bunprecedented\b/gi, replacement: 'rare' },
  // "unparalleled" → "strong"
  { pattern: /\bunparalleled\b/gi, replacement: 'strong' },
  // "disruptive" → "new"
  { pattern: /\bdisruptive\b/gi, replacement: 'new' },
  // "revolutionize" → "change"
  { pattern: /\brevolutioniz(?:e|es|ed|ing)\b/gi, replacement: 'change' },
  // "supercharge" → "speed up"
  { pattern: /\bsupercharg(?:e|es|ed|ing)\b/gi, replacement: 'speed up' },
  // "unleash" → "release"
  { pattern: /\bunleash(?:es|ed|ing)?\b/gi, replacement: 'release' },
  // "meticulously" → "carefully"
  { pattern: /\bmeticulously\b/gi, replacement: 'carefully' },
  // "multifaceted" → "complex"
  { pattern: /\bmultifaceted\b/gi, replacement: 'complex' },
  // "holistic" → "complete"
  { pattern: /\bholistic(?:ally)?\b/gi, replacement: 'complete' },
  // "synergy" / "synergies" → "cooperation"
  { pattern: /\bsynerg(?:y|ies)\b/gi, replacement: 'cooperation' },
  // "delve" → "look" or "dig"
  { pattern: /\bdelv(?:e|es|ed|ing)\b/gi, replacement: 'dig' },
  // "tapestry" → drop or "mix"
  { pattern: /\btapestry\b/gi, replacement: 'mix' },
  // "realm" → "area"
  { pattern: /\brealm\b/gi, replacement: 'area' },

  // ── FILLER WORDS (delete entirely) ────────────────────────────────
  // "Moreover, " / "Furthermore, " / "Additionally, " at start of sentence
  { pattern: /\bMoreover,\s*/g, replacement: '' },
  { pattern: /\bFurthermore,\s*/g, replacement: '' },
  { pattern: /\bAdditionally,\s*/g, replacement: '' },
];

// Files/patterns to skip
const SKIP_PATTERNS = [
  /node_modules/,
  /\.next/,
  /jobs-cache\.json$/,
  /package\.json$/,
  /package-lock\.json$/,
  /tsconfig/,
];

// Directories to process
const CONTENT_DIRS = [
  'content/articles',
  'content/companies',
  'content/glossary',
  'content/learn',
  'content/generated',
];

function getFiles(dir: string, exts: string[]): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...getFiles(fullPath, exts));
    } else if (exts.some(ext => entry.name.endsWith(ext))) {
      results.push(fullPath);
    }
  }
  return results;
}

function shouldSkip(filePath: string): boolean {
  return SKIP_PATTERNS.some(p => p.test(filePath));
}

// Protect domain-specific terms from false positive replacement
function protectDomainTerms(content: string): { content: string; placeholders: Map<string, string> } {
  const placeholders = new Map<string, string>();
  let idx = 0;
  
  // Protect "token unlock" / "unlock schedule" / "cliff unlock" etc.
  const protectedPatterns = [
    /\b(?:token|cliff|linear|vesting|schedule)\s+unlock(?:s|ed|ing)?\b/gi,
    /\bunlock(?:s|ed|ing)?\s+(?:schedule|period|event|date|token|cliff)\b/gi,
    /\bParadigm\b/g, // company name
    /\bcomprehensive health insurance\b/gi,
    /\brobust (?:test|system|logging|queue|solution|architecture|design|indexer|infrastructure)\b/gi,
  ];
  
  let result = content;
  for (const pat of protectedPatterns) {
    result = result.replace(pat, (match) => {
      const placeholder = `__PROTECTED_${idx++}__`;
      placeholders.set(placeholder, match);
      return placeholder;
    });
  }
  
  return { content: result, placeholders };
}

function restoreDomainTerms(content: string, placeholders: Map<string, string>): string {
  let result = content;
  for (const [placeholder, original] of placeholders) {
    result = result.replace(placeholder, original);
  }
  return result;
}

function processFile(filePath: string): { changed: boolean; diffs: string[] } {
  const original = fs.readFileSync(filePath, 'utf-8');
  const diffs: string[] = [];
  
  // Protect domain terms
  const { content: protected_, placeholders } = protectDomainTerms(original);
  
  let result = protected_;
  
  for (const rule of RULES) {
    const before = result;
    result = result.replace(rule.pattern, rule.replacement);
    
    if (before !== result) {
      // Find what changed for reporting
      const matches = before.match(rule.pattern);
      if (matches) {
        diffs.push(`  ${rule.pattern.source} → "${rule.replacement}" (${matches.length}×)`);
      }
    }
  }
  
  // Clean up: fix double spaces, empty sentences from deletions
  result = result.replace(/  +/g, ' ');
  result = result.replace(/\.\s+\./g, '.');
  result = result.replace(/,\s+\./g, '.');
  result = result.replace(/^\s+$/gm, '');
  
  // Restore protected terms
  result = restoreDomainTerms(result, placeholders);
  
  const changed = result !== original;
  
  if (changed && APPLY) {
    fs.writeFileSync(filePath, result, 'utf-8');
  }
  
  return { changed, diffs };
}

// ── Main ─────────────────────────────────────────────────────────────
console.log(APPLY ? '🔧 APPLYING changes...' : '🔍 DRY RUN (use --apply to write changes)\n');

let totalFiles = 0;
let changedFiles = 0;
let totalReplacements = 0;

for (const dir of CONTENT_DIRS) {
  const fullDir = path.join(process.cwd(), dir);
  const files = getFiles(fullDir, ['.md', '.mdx', '.json']);
  
  for (const file of files) {
    if (shouldSkip(file)) continue;
    totalFiles++;
    
    const { changed, diffs } = processFile(file);
    if (changed) {
      changedFiles++;
      const relPath = path.relative(process.cwd(), file);
      if (!APPLY) {
        console.log(`📝 ${relPath}`);
        diffs.forEach(d => console.log(d));
        totalReplacements += diffs.length;
      }
    }
  }
}

console.log(`\n${'─'.repeat(50)}`);
console.log(`📊 Scanned: ${totalFiles} files`);
console.log(`📝 Changed: ${changedFiles} files`);
if (!APPLY) {
  console.log(`🔄 Replacements: ${totalReplacements}`);
  console.log(`\n💡 Run with --apply to write changes`);
} else {
  console.log(`\n✅ All changes written to disk`);
}
