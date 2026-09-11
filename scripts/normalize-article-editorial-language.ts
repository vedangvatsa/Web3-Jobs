import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const articlesDirectory = path.join(process.cwd(), 'content/articles');

const replacements: Array<[RegExp, string]> = [
  [/\bin today's fast-paced world\b/gi, 'today'],
  [/\bit's worth noting that\s*/gi, ''],
  [/\bit is important to note that\s*/gi, ''],
  [/\bin the fast-paced world of\s*/gi, 'in '],
  [/\bat the end of the day\b/gi, 'ultimately'],
  [/\bfurthermore,?\s*/gi, ''],
  [/\bmoreover,?\s*/gi, ''],
  [/\bat its core\b/gi, 'fundamentally'],
  [/\ba testament to\b/gi, 'evidence of'],
  [/\btestament to\b/gi, 'evidence of'],
  [/\bcutting-edge\b/gi, 'advanced'],
  [/\bgame-changing\b/gi, 'significant'],
  [/\bnavigate the landscape\b/gi, 'work through the field'],
  [/\blandscape\b/gi, 'field'],
  [/\bleveraging\b/gi, 'using'],
  [/\bleverage\b/gi, 'use'],
  [/\brobust\b/gi, 'reliable'],
  [/\bfostering\b/gi, 'supporting'],
  [/\bfoster\b/gi, 'support'],
  [/\bembracing\b/gi, 'adopting'],
  [/\bembrace\b/gi, 'adopt'],
  [/\bcomprehensive\b/gi, 'detailed'],
  [/\bnavigating\b/gi, 'working through'],
  [/\bnavigate\b/gi, 'manage'],
  [/\bempowering\b/gi, 'enabling'],
  [/\bempower\b/gi, 'enable'],
  [/\bseamlessly\b/gi, 'smoothly'],
  [/\bseamless\b/gi, 'smooth'],
  [/\brealm\b/gi, 'field'],
  [/\bdelving\b/gi, 'examining'],
  [/\bdelve\b/gi, 'examine'],
  [/\bparadigm\b/gi, 'model'],
  [/\bpivotal\b/gi, 'important'],
  [/\bunprecedented\b/gi, 'unusual'],
  [/\brevolutionizing\b/gi, 'changing'],
  [/\brevolutionize\b/gi, 'change'],
  [/\bharnessing\b/gi, 'using'],
  [/\bharness\b/gi, 'use'],
  [/\bunlocking\b/gi, 'enabling'],
  [/\bunlock\b/gi, 'enable'],
  [/\btapestry\b/gi, 'mix'],
  [/\btestament\b/gi, 'evidence'],
];

function preserveInitialCase(match: string, replacement: string): string {
  if (!replacement) return replacement;
  return /^[A-Z]/.test(match) ? replacement[0].toUpperCase() + replacement.slice(1) : replacement;
}

let filesChanged = 0;
let replacementsMade = 0;

function normalizeText(text: string): string {
  let normalized = text;
  for (const [pattern, replacement] of replacements) {
    normalized = normalized.replace(pattern, (match) => {
      replacementsMade++;
      return preserveInitialCase(match, replacement);
    });
  }
  return normalized;
}

for (const file of fs.readdirSync(articlesDirectory).filter((name) => name.endsWith('.md')).sort()) {
  const filePath = path.join(articlesDirectory, file);
  const raw = fs.readFileSync(filePath, 'utf8');
  const parsed = matter(raw);
  const content = normalizeText(parsed.content);
  const description = typeof parsed.data.description === 'string'
    ? normalizeText(parsed.data.description)
    : parsed.data.description;

  if (content === parsed.content && description === parsed.data.description) continue;
  filesChanged++;
  fs.writeFileSync(filePath, matter.stringify(content, { ...parsed.data, description }), 'utf8');
}

console.log(JSON.stringify({ filesChanged, replacementsMade }, null, 2));
