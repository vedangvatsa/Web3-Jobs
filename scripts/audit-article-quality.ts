import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const articlesDirectory = path.join(process.cwd(), 'content/articles');
const minimumWords = 1500;
const reportOnly = process.argv.includes('--report');
const verbose = process.argv.includes('--verbose');
const articleFiles = fs.readdirSync(articlesDirectory)
  .filter((name) => name.endsWith('.md') && name !== 'AGENTS.md')
  .sort();
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
  /\blandscape\b/gi,
  /\bleverag(?:e|ing)\b/gi,
  /\brobust\b/gi,
  /\bfoster(?:ing)?\b/gi,
  /\bembrac(?:e|ing)\b/gi,
  /\bseamless(?:ly)?\b/gi,
  /\brealm\b/gi,
  /\bdelv(?:e|ing)\b/gi,
  /\bparadigm\b/gi,
  /\bpivotal\b/gi,
  /\bunprecedented\b/gi,
  /\brevolutioniz(?:e|ing)\b/gi,
  /\bcutting-edge\b/gi,
  /\bharness(?:ing)?\b/gi,
  /\bunlock(?:ing)?\b/gi,
  /\btapestry\b/gi,
  /\btestament\b/gi,
  /\bfurthermore\b/gi,
  /\bmoreover\b/gi,
  /\bat its core\b/gi,
  /\bit's worth noting\b/gi,
  /\bin today's fast-paced\b/gi,
];

// These patterns apply only to native news. They encode the standing news
// editorial guide without imposing reporting-style rules on career content.
const newsEditorialPatterns = [
  /\bwhy this matters\b/gi,
  /\bwhat (?:users|builders|readers).{0,30}watch next\b/gi,
  /\bthe bigger picture\b/gi,
  /\bthe announcement is not proof that\b/gi,
  /\bthis is more than\b/gi,
  /\bit is a clearer commitment\b/gi,
  /\bthe distinction is simple on paper\b/gi,
  /\bfor people working in web3\b/gi,
  /\bhere(?:'s| is) the thing\b/gi,
  /\blet me be clear\b/gi,
  /\bthe uncomfortable truth\b/gi,
  /\bwhat most people get wrong\b/gi,
  /\bwhat nobody tells you\b/gi,
  /\bthe part everyone misses\b/gi,
  /\bthis distinction matters\b/gi,
  /\bthe key point is\b/gi,
  /\bas you can see\b/gi,
  /\bexperts agree\b/gi,
  /\bmany argue\b/gi,
  /\bwidely regarded as\b/gi,
  /\bstudies show\b/gi,
  /\bindustry reports suggest\b/gi,
  /\bstands as a testament\b/gi,
  /\bplays a vital role\b/gi,
  /\bsolidifies its position\b/gi,
  /\bunderscores its significance\b/gi,
  /\butiliz(?:e|es|ed|ing)\b/gi,
  /\bfacilitat(?:e|es|ed|ing)\b/gi,
  /\bempower(?:s|ed|ing)?\b/gi,
  /\bstreamlin(?:e|es|ed|ing)\b/gi,
  /\bmultifaceted\b/gi,
  /\bmeticulous\b/gi,
  /\bintricate\b/gi,
  /\bparamount\b/gi,
  /\btransformative\b/gi,
  /\belevat(?:e|es|ed|ing)\b/gi,
  /\bembark(?:s|ed|ing)?\b/gi,
  /\bsupercharg(?:e|es|ed|ing)\b/gi,
  /\bbeacon\b/gi,
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
for (const file of articleFiles) {
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

  const proseContent = content.replace(/```[\s\S]*?```/g, ' ');
  const matchedPatterns = editorialPatterns
    .filter((pattern) => {
      pattern.lastIndex = 0;
      return pattern.test(proseContent);
    })
    .map((pattern) => pattern.source.replace(/\\b|\\/g, ''));
  if (matchedPatterns.length) articleIssues.push(`template phrasing: ${matchedPatterns.join(', ')}`);

  if (data.category === 'News') {
    const matchedNewsPatterns = newsEditorialPatterns
      .filter((pattern) => {
        pattern.lastIndex = 0;
        return pattern.test(proseContent);
      })
      .map((pattern) => pattern.source.replace(/\\b|\\/g, ''));
    if (matchedNewsPatterns.length) articleIssues.push(`news template phrasing: ${matchedNewsPatterns.join(', ')}`);
  }

  if (articleIssues.length) issues.push({ file, words, issues: articleIssues });
}

console.log(JSON.stringify({
  articles: articleFiles.length,
  passing: articleFiles.length - issues.length,
  failing: issues.length,
  issues: verbose ? issues : issues.slice(0, 25),
}, null, 2));

if (!reportOnly && issues.length) process.exitCode = 1;
