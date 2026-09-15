import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
// @ts-ignore - next config is plain JS with a default export
import nextConfig from '../next.config.mjs';

const articlesDirectory = path.join(process.cwd(), 'content/articles');
const publicDirectory = path.join(process.cwd(), 'public');
const MIN_HERO_BYTES = 15 * 1024;

const reportOnly = process.argv.includes('--report');

type ImageIssue = { file: string; issues: string[] };

function isValidImageBuffer(buf: Buffer): boolean {
  if (buf.length < 12) return false;
  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return true;
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47 &&
    buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a
  ) return true;
  // GIF / WebP (RIFF....WEBP)
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return true;
  if (
    buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
    buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50
  ) return true;
  // SVG: starts with < or whitespace then <
  const head = buf.slice(0, 512).toString('utf8').trimStart();
  if (head.startsWith('<svg') || head.startsWith('<?xml')) return true;
  return false;
}

function allowedRemoteHosts(): string[] {
  const patterns = (nextConfig as any)?.images?.remotePatterns;
  if (!Array.isArray(patterns)) return [];
  return patterns.map((p: any) => String(p?.hostname || '')).filter(Boolean);
}

function checkArticle(file: string): ImageIssue | null {
  const raw = fs.readFileSync(path.join(articlesDirectory, file), 'utf8');
  const { data } = matter(raw);
  if (data.category !== 'News') return null;
  const issues: string[] = [];
  const image = typeof data.image === 'string' ? data.image : '';

  if (!image) {
    issues.push('missing hero image');
  } else if (image.includes('/api/og')) {
    // The article template deliberately skips rendering generated OG
    // placeholders as heroes, so these pages show NO image.
    issues.push('placeholder /api/og hero is never rendered');
  } else if (image.startsWith('/')) {
    const abs = path.join(publicDirectory, image.split('?')[0]);
    if (!fs.existsSync(abs)) {
      issues.push(`local hero file missing: ${image}`);
    } else {
      const stat = fs.statSync(abs);
      if (stat.size < MIN_HERO_BYTES) {
        issues.push(`hero file too small (${stat.size}B < ${MIN_HERO_BYTES}B): ${image}`);
      } else if (!isValidImageBuffer(fs.readFileSync(abs))) {
        issues.push(`hero file is not a valid image: ${image}`);
      }
    }
  } else if (/^https?:\/\//i.test(image)) {
    // Remote originals get rate-limited upstream (Wikimedia HTTP 429) and
    // break on-site rendering. Self-host under public/images/news/ instead.
    let host = '';
    try {
      host = new URL(image).hostname;
    } catch {
      issues.push(`unparseable image URL: ${image}`);
    }
    if (host && !allowedRemoteHosts().includes(host)) {
      issues.push(`remote host not in next.config images.remotePatterns: ${host}`);
    } else if (host) {
      issues.push(`remote hero image (self-host to avoid upstream rate limits): ${image}`);
    }
  } else {
    issues.push(`unrecognized image value: ${image}`);
  }

  if (!data.imageCaption || typeof data.imageCaption !== 'string') {
    issues.push('missing imageCaption (photo credit below hero)');
  }
  if (!data.imageCreditUrl || typeof data.imageCreditUrl !== 'string') {
    issues.push('missing imageCreditUrl (photo source link)');
  }
  return issues.length ? { file, issues } : null;
}

const files = fs.readdirSync(articlesDirectory)
  .filter((name) => name.endsWith('.md') && name !== 'AGENTS.md')
  .sort();

const problems: ImageIssue[] = [];
let newsCount = 0;
for (const file of files) {
  const raw = fs.readFileSync(path.join(articlesDirectory, file), 'utf8');
  if (matter(raw).data.category !== 'News') continue;
  newsCount++;
  const issue = checkArticle(file);
  if (issue) problems.push(issue);
}

console.log(JSON.stringify({
  newsArticles: newsCount,
  passing: newsCount - problems.length,
  failing: problems.length,
  issues: problems,
}, null, 2));

if (!reportOnly && problems.length) process.exitCode = 1;
