import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import matter from 'gray-matter';
import { auditFormatting } from './audit-articles-formatting';

type Issue = { file: string; issues?: string[] };
function audit(script: string, args: string[] = []) {
  return JSON.parse(execFileSync(process.execPath, ['--import', 'tsx', `scripts/${script}`, ...args], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }));
}

async function main() {
  const slugs = process.argv.slice(2), files = slugs.map(slug => `${slug}.md`), errors: string[] = [], urls = new Set<string>();
  if (!slugs.length || slugs.some(slug => !/^[a-z0-9]+(?:-[a-z0-9]+)?$/.test(slug))) throw new Error('Provide new article slugs');
  for (const slug of slugs) {
    const file = path.join('content/articles', `${slug}.md`);
    const { data, content } = matter(fs.readFileSync(file, 'utf8'));
    if (data.category !== 'News') errors.push(`${slug}: category must be News`);
    if (typeof data.publishedDate !== 'string' || data.publishedDate !== process.env.NEWS_DATE) errors.push(`${slug}: publishedDate must match the research day`);
    if (typeof data.image !== 'string' || !new RegExp(`^/images/news/${slug}\\.(jpg|jpeg|png|webp)$`).test(data.image) || !fs.existsSync(`public${data.image}`)) errors.push(`${slug}: missing self-hosted article image`);
    for (const issue of auditFormatting(file)) errors.push(`${slug}: ${issue.issueType}: ${issue.details}`);
    for (const match of content.matchAll(/\]\((https?:\/\/[^\s)]+)/g)) urls.add(match[1]);
    if (typeof data.imageCreditUrl === 'string') urls.add(data.imageCreditUrl);
  }
  const quality = audit('audit-article-quality.ts', ['--report', '--verbose']);
  if (!Array.isArray(quality.issues)) throw new Error('Invalid quality-audit response');
  for (const issue of (quality.issues || []) as Issue[]) if (files.includes(issue.file)) errors.push(`${issue.file}: ${(issue.issues || []).join(', ')}`);
  const images = audit('audit-article-images.ts', ['--report']);
  if (!Array.isArray(images.issues)) throw new Error('Invalid image-audit response');
  for (const issue of (images.issues || []) as Issue[]) if (files.includes(issue.file)) errors.push(`${issue.file} image: ${(issue.issues || []).join(', ')}`);
  const duplicates = audit('audit-article-duplicates.ts', ['--report']);
  if (!Array.isArray(duplicates.pairs)) throw new Error('Invalid duplicate-audit response');
  for (const pair of duplicates.pairs || []) if (files.includes(pair.a) || files.includes(pair.b)) errors.push(`Duplicate reporting: ${pair.a} / ${pair.b}`);
  try { execFileSync(process.execPath, ['node_modules/typescript/bin/tsc', '--noEmit'], { stdio: 'pipe', maxBuffer: 16 * 1024 * 1024 }); }
  catch { errors.push('Typecheck failed; no articles may publish on a red tree'); }
  for (const url of urls) {
    try {
      const parsed = new URL(url);
      if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password || /^(localhost|127\.|10\.|192\.168\.|169\.254\.|\[)/.test(parsed.hostname)) throw new Error('Invalid source URL');
      const response = await fetch(url, { headers: { 'User-Agent': 'HashtagWeb3NewsBot/1.0 (+https://hashtagweb3.com)' }, signal: AbortSignal.timeout(15000) });
      await response.body?.cancel();
      if (response.status !== 200) errors.push(`Source link HTTP ${response.status}: ${url}`);
    } catch { errors.push(`Source link unavailable: ${url}`); }
  }
  console.log(JSON.stringify({ slugs, checkedLinks: urls.size, errors }, null, 2));
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
