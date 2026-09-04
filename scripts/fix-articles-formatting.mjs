#!/usr/bin/env node

/**
 * fix-articles-formatting.mjs
 * 
 * Auto-corrects formatting issues across all 817 markdown articles:
 * 1. Strips invalid leading/trailing whitespace inside bold syntax (** text** -> **text**).
 * 2. Converts pseudo headings (**Pros**, **Cons**, **FAQ**) to proper markdown headers (### Pros, ### Cons).
 * 3. Formats FAQ H3 questions to end with question marks (?).
 * 4. Cleans non-ASCII typography (em dashes, curly quotes, zero-width spaces).
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTICLES_DIR = path.join(__dirname, '..', 'content', 'articles');

const PUNCT_REPLACEMENTS = [
  [/—/g, ' - '],
  [/–/g, '-'],
  [/−/g, '-'],
  [/…/g, '...'],
  [/\u00A0/g, ' '],
  [/[“”„‟]/g, '"'],
  [/[‘’‚‛]/g, "'"],
  [/\u200B|\u200C|\u200D|\uFEFF/g, ''],
];

function fixFormattingInContent(content) {
  let body = content;

  // 1. Clean non-ASCII typography
  for (const [re, rep] of PUNCT_REPLACEMENTS) {
    body = body.replace(re, rep);
  }

  // 2. Fix invalid bold spacing: ** text** or **text ** or ** text ** -> **text**
  body = body.replace(/\*\*([^:*]+?):\s+\*\*/g, '**$1**:');
  body = body.replace(/\*\*\s+([^*]+?)\s+\*\*/g, '**$1**');
  body = body.replace(/\*\*\s+([^*]+?)\*\*/g, '**$1**');
  body = body.replace(/\*\*([^*]+?)\s+\*\*/g, '**$1**');

  // 3. Fix pseudo headings (**Pros**, **Cons**, **FAQ**, etc.)
  body = body.replace(/^(?:\*\*(Pros|Cons|FAQ|Overview|Key Takeaways|Summary|Conclusion|Steps|Requirements)\*\*)$/gm, '### $1');

  // 4. Format FAQ H3 questions to end with ?
  const lines = body.split('\n');
  let inFaq = false;
  const newLines = lines.map((line) => {
    if (/^## (?:FAQ|Frequently Asked Questions)/i.test(line)) {
      inFaq = true;
      return line;
    }
    if (inFaq && /^## /.test(line)) {
      inFaq = false;
      return line;
    }
    if (inFaq && /^### /.test(line)) {
      const trimmed = line.trim();
      if (trimmed.length > 5 && !trimmed.endsWith('?')) {
        return trimmed + '?';
      }
    }
    return line;
  });

  return newLines.join('\n');
}

function processAllArticles() {
  const files = fs.readdirSync(ARTICLES_DIR).filter((f) => f.endsWith('.md'));
  console.log(`Starting formatting cleanup across ${files.length} articles...`);

  let count = 0;
  for (const file of files) {
    const filePath = path.join(ARTICLES_DIR, file);
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = matter(raw);

    const fixedContent = fixFormattingInContent(parsed.content);
    if (fixedContent !== parsed.content) {
      const updated = matter.stringify(fixedContent, parsed.data);
      fs.writeFileSync(filePath, updated, 'utf-8');
      count++;
    }
  }

  console.log(`Formatting cleanup complete. Fixed ${count} / ${files.length} articles.`);
}

processAllArticles();
