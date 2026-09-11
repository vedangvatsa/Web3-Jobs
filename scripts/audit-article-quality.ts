import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const articlesDirectory = path.join(process.cwd(), 'content/articles');
const minimumWords = 1500;
const reportOnly = process.argv.includes('--report');
const verbose = process.argv.includes('--verbose');
const editorialPatterns = [
  /\bcomprehensive guide\b/gi,
  /\brapidly evolving\b/gi,
  /\bever-evolving\b/gi,
  /\bdelve into\b/gi,
  /\bnavigate the landscape\b/gi,
  /\bunlock the potential\b/gi,
  /\bgame[- ]changer\b/gi,
  /\bin conclusion\b/gi,
  /\bit is important to note\b/gi,
  /\bmarking a pivotal moment\b/gi,
  /\bushering in a new era\b/gi,
];

type ArticleIssue = {
  file: string;
  words: number;
  issues: string[];
};

function countWords(content: string): number {
  const prose = content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/[#*_>`|]/g, ' ');
  return (prose.match(/[\p{L}\p{N}][\p{L}\p{N}'-]*/gu) || []).length;
}

function hasReferenceDump(content: string): boolean {
  const lines = content.split('\n');
  const referenceHeading = /^(#{2,3})\s+(?:(?:authoritative (?:research|documentation)(?: and technical documentation)?)|(?:references|sources|further reading|technical documentation)\b.*)$/i;

  for (let index = 0; index < lines.length; index++) {
    const heading = lines[index].match(referenceHeading);
    if (!heading) continue;
    const level = heading[1].length;
    let items = 0;
    for (let next = index + 1; next < lines.length; next++) {
      const nextHeading = lines[next].match(/^(#{1,6})\s+/);
      if (nextHeading && nextHeading[1].length <= level) break;
      if (/^\s*[-*+]\s+/.test(lines[next])) items++;
    }
    if (items > 6) return true;
  }

  return false;
}

const issues: ArticleIssue[] = [];
for (const file of fs.readdirSync(articlesDirectory).filter((name) => name.endsWith('.md')).sort()) {
  const { data, content } = matter(fs.readFileSync(path.join(articlesDirectory, file), 'utf8'));
  const articleIssues: string[] = [];
  const words = countWords(content);
  const title = typeof data.title === 'string' ? data.title.trim() : '';

  if (words < minimumWords) articleIssues.push(`under ${minimumWords} words`);
  if (!title || /^[a-z]/.test(title)) articleIssues.push('title needs editorial review');
  if (hasReferenceDump(content)) articleIssues.push('reference dump exceeds six entries');
  if ((content.match(/```[\s\S]*?\+[-+]{8,}\+[\s\S]*?\+[-+]{8,}\+[\s\S]*?```/g) || []).length) {
    articleIssues.push('ASCII diagram block');
  }

  const matchedPatterns = editorialPatterns
    .filter((pattern) => pattern.test(content))
    .map((pattern) => pattern.source.replace(/\\b|\\/g, ''));
  if (matchedPatterns.length) articleIssues.push(`template phrasing: ${matchedPatterns.join(', ')}`);

  if (articleIssues.length) issues.push({ file, words, issues: articleIssues });
}

console.log(JSON.stringify({
  articles: fs.readdirSync(articlesDirectory).filter((name) => name.endsWith('.md')).length,
  passing: fs.readdirSync(articlesDirectory).filter((name) => name.endsWith('.md')).length - issues.length,
  failing: issues.length,
  issues: verbose ? issues : issues.slice(0, 25),
}, null, 2));

if (!reportOnly && issues.length) process.exitCode = 1;
