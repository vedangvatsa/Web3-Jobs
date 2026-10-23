import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import matter from 'gray-matter';
import { auditFormatting } from './audit-articles-formatting';
import { checkNewsSourceLinks } from './lib/news-source-links.mjs';

type Issue = { file: string; issues?: string[] };
function audit(script: string, args: string[] = []) {
  return JSON.parse(execFileSync(process.execPath, ['--import', 'tsx', `scripts/${script}`, ...args], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }));
}

async function main() {
  const slugs = process.argv.slice(2), files = slugs.map(slug => `${slug}.md`), errors: string[] = [], urls = new Map<string, Set<string>>();
  const articleErrors: Record<string, string[]> = {};
  const recordError = (slug: string, message: string) => {
    if (!errors.includes(message)) errors.push(message);
    (articleErrors[slug] ||= []).push(message);
  };
  if (!slugs.length || slugs.some(slug => !/^[a-z0-9]+(?:-[a-z0-9]+)?$/.test(slug))) throw new Error('Provide new article slugs');
  for (const slug of slugs) {
    if (!/^[a-z0-9]+$/.test(slug)) recordError(slug, `${slug}: new news URLs must use one lowercase word without hyphens`);
    const file = path.join('content/articles', `${slug}.md`);
    const { data, content } = matter(fs.readFileSync(file, 'utf8'));
    if (data.category !== 'News') recordError(slug, `${slug}: category must be News`);
    if (typeof data.publishedDate !== 'string' || data.publishedDate !== process.env.NEWS_DATE) recordError(slug, `${slug}: publishedDate must match the research day`);
    if (typeof data.image !== 'string' || !new RegExp(`^/images/news/${slug}\\.(jpg|jpeg|png|webp)$`).test(data.image) || !fs.existsSync(`public${data.image}`)) recordError(slug, `${slug}: missing self-hosted article image`);
    for (const issue of auditFormatting(file)) recordError(slug, `${slug}: ${issue.issueType}: ${issue.details}`);
    const addSource = (url: string) => { if (!urls.has(url)) urls.set(url, new Set()); urls.get(url)!.add(slug); };
    for (const match of content.matchAll(/\]\((https?:\/\/[^\s)]+)/g)) addSource(match[1]);
    if (typeof data.imageCreditUrl === 'string') addSource(data.imageCreditUrl);
  }
  const quality = audit('audit-article-quality.ts', ['--report', '--verbose']);
  if (!Array.isArray(quality.issues)) throw new Error('Invalid quality-audit response');
  for (const issue of (quality.issues || []) as Issue[]) if (files.includes(issue.file)) recordError(issue.file.slice(0, -3), `${issue.file}: ${(issue.issues || []).join(', ')}`);
  const images = audit('audit-article-images.ts', ['--report']);
  if (!Array.isArray(images.issues)) throw new Error('Invalid image-audit response');
  for (const issue of (images.issues || []) as Issue[]) if (files.includes(issue.file)) recordError(issue.file.slice(0, -3), `${issue.file} image: ${(issue.issues || []).join(', ')}`);
  const duplicates = audit('audit-article-duplicates.ts', ['--report']);
  if (!Array.isArray(duplicates.pairs)) throw new Error('Invalid duplicate-audit response');
  for (const pair of duplicates.pairs || []) for (const file of [pair.a, pair.b]) if (files.includes(file)) recordError(file.slice(0, -3), `Duplicate reporting: ${pair.a} / ${pair.b}`);
  try { execFileSync(process.execPath, ['node_modules/typescript/bin/tsc', '--noEmit'], { stdio: 'pipe', maxBuffer: 16 * 1024 * 1024 }); }
  catch { errors.push('Typecheck failed; no articles may publish on a red tree'); }
  for (const error of await checkNewsSourceLinks(urls.keys())) {
    errors.push(error);
    for (const [url, owners] of urls) if (error.endsWith(`: ${url}`)) for (const slug of owners) (articleErrors[slug] ||= []).push(error);
  }
  console.log(JSON.stringify({ slugs, checkedLinks: urls.size, errors, articleErrors }, null, 2));
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
