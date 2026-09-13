import path from 'node:path';
import { repairArticles } from './lib/article-markdown';

const dryRun = process.argv.includes('--dry-run');
const rootFlag = process.argv.indexOf('--root');
const articlesDirectory = rootFlag >= 0
  ? path.resolve(process.argv[rootFlag + 1])
  : path.join(process.cwd(), 'content/articles');
const files = repairArticles(articlesDirectory, dryRun);
const totals: Record<string, number> = {};
for (const file of files) {
  for (const [kind, count] of Object.entries(file.changes)) totals[kind] = (totals[kind] || 0) + count;
}

console.log(JSON.stringify({ dryRun, files, totals: Object.fromEntries(Object.entries(totals).sort(([left], [right]) => left.localeCompare(right))) }, null, 2));
