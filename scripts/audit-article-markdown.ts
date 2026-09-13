import path from 'node:path';
import { auditArticles } from './lib/article-markdown';

const rootFlag = process.argv.indexOf('--root');
const articlesDirectory = rootFlag >= 0
  ? path.resolve(process.argv[rootFlag + 1])
  : path.join(process.cwd(), 'content/articles');
const report = auditArticles(articlesDirectory);

console.log(JSON.stringify(report, null, 2));
if (report.errorCount) process.exitCode = 1;
