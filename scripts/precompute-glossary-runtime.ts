#!/usr/bin/env tsx

import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import html from 'remark-html';
import type { GlossaryTerm } from '../src/types/glossary';

const ROOT = path.resolve(import.meta.dirname, '..');
const GLOSSARY_DIR = path.join(ROOT, 'content', 'glossary');
const OUTPUT_CONTENT_PATH = path.join(ROOT, 'content', 'glossary-runtime.json');
const OUTPUT_PUBLIC_PATH = path.join(ROOT, 'public', 'data', 'glossary-runtime.json');

async function main(): Promise<void> {
  if (!fs.existsSync(GLOSSARY_DIR)) {
    console.warn(`Glossary directory not found: ${GLOSSARY_DIR}`);
    return;
  }

  const files = fs.readdirSync(GLOSSARY_DIR).filter((f) => f.endsWith('.md'));
  console.log(`[precompute-glossary] Processing ${files.length} glossary markdown files...`);

  const terms: GlossaryTerm[] = await Promise.all(
    files.map(async (filename) => {
      const filePath = path.join(GLOSSARY_DIR, filename);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(fileContent);

      const processedContent = await remark()
        .use(remarkGfm)
        .use(html, { sanitize: false })
        .process(content);

      return {
        term: String(data.term || ''),
        slug: String(data.slug || filename.replace(/\.md$/, '')),
        category: String(data.category || 'Other'),
        difficulty: (data.difficulty as GlossaryTerm['difficulty']) || 'Beginner',
        image: typeof data.image === 'string' ? data.image : undefined,
        imageAlt: typeof data.imageAlt === 'string' ? data.imageAlt : undefined,
        description: String(data.description || ''),
        content: processedContent.toString(),
        relatedTerms: Array.isArray(data.relatedTerms) ? data.relatedTerms : [],
        synonyms: Array.isArray(data.synonyms) ? data.synonyms : [],
        publishedDate: String(data.publishedDate || '2024-01-15T00:00:00.000Z'),
        updatedDate: typeof data.updatedDate === 'string' ? data.updatedDate : typeof data.lastUpdated === 'string' ? data.lastUpdated : undefined,
      };
    })
  );

  terms.sort((a, b) => a.term.localeCompare(b.term));

  fs.mkdirSync(path.dirname(OUTPUT_CONTENT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_CONTENT_PATH, JSON.stringify(terms));

  fs.mkdirSync(path.dirname(OUTPUT_PUBLIC_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PUBLIC_PATH, JSON.stringify(terms));

  console.log(`[precompute-glossary] Successfully wrote ${terms.length} terms to ${OUTPUT_CONTENT_PATH}`);
}

main().catch((err) => {
  console.error('[precompute-glossary] Error:', err);
  process.exit(1);
});
