import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const articlesDirectory = path.join(process.cwd(), 'content/articles');
// Jaccard similarity on significant tokens. Tuned so distinct events on one
// topic pass while a rewritten repeat of the same story trips the gate:
// the current News corpus peaks below 0.50 pairwise.
const THRESHOLD = 0.55;
const reportOnly = process.argv.includes('--report');

function tokens(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 4),
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  return inter / (a.size + b.size - inter);
}

const files = fs.readdirSync(articlesDirectory)
  .filter((name) => name.endsWith('.md') && name !== 'AGENTS.md')
  .sort();

const docs: { file: string; toks: Set<string> }[] = [];
for (const file of files) {
  const { data, content } = matter(fs.readFileSync(path.join(articlesDirectory, file), 'utf8'));
  if (data.category !== 'News') continue;
  docs.push({ file, toks: tokens(`${data.title || ''} ${content}`) });
}

const pairs: { a: string; b: string; similarity: number }[] = [];
for (let i = 0; i < docs.length; i++) {
  for (let j = i + 1; j < docs.length; j++) {
    const s = jaccard(docs[i].toks, docs[j].toks);
    if (s >= THRESHOLD) {
      pairs.push({ a: docs[i].file, b: docs[j].file, similarity: Math.round(s * 100) / 100 });
    }
  }
}
pairs.sort((x, y) => y.similarity - x.similarity);

console.log(JSON.stringify({
  newsArticles: docs.length,
  threshold: THRESHOLD,
  duplicatePairs: pairs.length,
  pairs,
}, null, 2));

if (!reportOnly && pairs.length) process.exitCode = 1;
