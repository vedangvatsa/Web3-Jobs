import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const ARTICLES_DIR = path.join(process.cwd(), 'content', 'articles');

const SLOP_TERMS = [
  'landscape', 'leverage', 'leveraging', 'robust', 'foster', 'fostering',
  'embrace', 'embracing', 'comprehensive', 'navigate', 'navigating', 'empower',
  'empowering', 'seamless', 'seamlessly', 'realm', 'delve', 'delving',
  'paradigm', 'pivotal', 'unprecedented', 'revolutionize', 'revolutionizing',
  'cutting-edge', 'harness', 'harnessing', 'unlock', 'unlocking', 'game-changing',
  'in today\'s fast-paced world', 'it\'s worth noting that', 'in the fast-paced world',
  'it is important to note', 'at the end of the day', 'tapestry', 'testament'
];

export type ArticleAuditResult = {
  slug: string;
  title: string;
  category: string;
  linkCount: number;
  wordCount: number;
  slopMatches: string[];
  passes10Links: boolean;
  passesNoSlop: boolean;
};

export function auditArticle(filePath: string): ArticleAuditResult {
  const content = fs.readFileSync(filePath, 'utf-8');
  const slug = path.basename(filePath, '.md');
  const parsed = matter(content);
  const body = parsed.content;

  // Match all markdown links [text](https://...)
  const links = body.match(/\[[^\]]+\]\(https?:\/\/[^\)]+\)/g) || [];
  const linkCount = links.length;

  const words = body.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const foundSlop: string[] = [];
  const bodyLower = body.toLowerCase();
  for (const term of SLOP_TERMS) {
    const re = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (re.test(bodyLower)) {
      foundSlop.push(term);
    }
  }

  return {
    slug,
    title: parsed.data.title || slug,
    category: parsed.data.category || 'Uncategorized',
    linkCount,
    wordCount,
    slopMatches: foundSlop,
    passes10Links: linkCount >= 10,
    passesNoSlop: foundSlop.length === 0,
  };
}

export function runFullAudit() {
  const files = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.md'));
  const results: ArticleAuditResult[] = [];

  for (const file of files) {
    results.push(auditArticle(path.join(ARTICLES_DIR, file)));
  }

  const passed10Links = results.filter(r => r.passes10Links).length;
  const passedNoSlop = results.filter(r => r.passesNoSlop).length;
  const passedBoth = results.filter(r => r.passes10Links && r.passesNoSlop).length;
  const totalLinks = results.reduce((acc, r) => acc + r.linkCount, 0);

  console.log(`\n=== ARTICLE QUALITY AUDIT REPORT ===`);
  console.log(`Total Articles: ${files.length}`);
  console.log(`Total Sourced Links: ${totalLinks} (Avg: ${(totalLinks / files.length).toFixed(1)} links/article)`);
  console.log(`Articles with 10+ Sourced Links: ${passed10Links} / ${files.length} (${((passed10Links / files.length) * 100).toFixed(1)}%)`);
  console.log(`Articles Free of AI Slop Terms: ${passedNoSlop} / ${files.length} (${((passedNoSlop / files.length) * 100).toFixed(1)}%)`);
  console.log(`Articles Passing ALL Quality Standards: ${passedBoth} / ${files.length} (${((passedBoth / files.length) * 100).toFixed(1)}%)`);
  console.log(`===================================\n`);

  return results;
}

if (require.main === module || process.argv[1]?.endsWith('audit-articles-thesis.ts')) {
  runFullAudit();
}
