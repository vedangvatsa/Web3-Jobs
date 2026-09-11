
'use server';

import type { Article } from '@/types';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import html from 'remark-html';
import sanitizeHtml from 'sanitize-html';

const contentArticlesDirectory = path.join(process.cwd(), 'content/articles');
type ArticleMetadata = Omit<Article, 'content' | 'rawContent'>;

// Article files are immutable within a deployed server/build process. Cache the
// parsed frontmatter so shared layout consumers (notably the footer) do not
// re-read all article bodies for every prerendered route.
let articleMetadataCache: ArticleMetadata[] | undefined;

function readArticlesFromDirectory(directory: string): ArticleMetadata[] {
 if (!fs.existsSync(directory)) {
  return [];
 }

 const fileNames = fs.readdirSync(directory);
 return fileNames
  .map((fileName) => {
   if (!fileName.endsWith('.md')) {
    return null;
   }
   const slug = fileName.replace(/\.md$/, '');

   const fullPath = path.join(directory, fileName);
   const fileContents = fs.readFileSync(fullPath, 'utf8');
   const matterResult = matter(fileContents);
   const data = matterResult.data;

   if (typeof data.title !== 'string' || !data.title) {
    console.warn(`Article with slug"${slug}" is missing a title.`);
    return null;
   }

   const category = typeof data.category === 'string' && data.category ? data.category : 'General';
   const image = typeof data.image === 'string' && data.image && !data.image.includes('picsum.photos')
    ? data.image
    : `https://hashtagweb3.com/api/og?type=article&title=${encodeURIComponent(data.title)}&category=${encodeURIComponent(category)}`;
   const description = typeof data.description === 'string' && data.description ? data.description : 'No description provided.';

   return {
    slug,
    title: data.title,
    description,
     category,
     'data-ai-hint': data['data-ai-hint'],
     imageFit: data.imageFit === 'contain' ? 'contain' : undefined,
     image,
    publishedDate: typeof data.publishedDate === 'string' ? data.publishedDate : undefined,
    lastUpdated: typeof data.lastUpdated === 'string' ? data.lastUpdated : undefined,
   };
  })
  .filter((article): article is NonNullable<typeof article> => article !== null) as ArticleMetadata[];
}

function removePlaceholderKeyTakeaways(content: string): string {
  const sectionRegex = /(^|\n)## Key Takeaways[\s\S]*?(?=\n## |\n# |\n$)/g;
  return content.replace(sectionRegex, (section) => {
    return section.includes('{Key point') ? '\n' : section;
  });
}

function removeDuplicateHeroImage(content: string, heroImage?: string): string {
  if (!heroImage) return content;

  const lines = content.split('\n');
  const normalizedHero = heroImage.trim();
  const repaired: string[] = [];

  for (let index = 0; index < lines.length; index++) {
    const match = lines[index].match(/^\s*!\[[^\]]*\]\(<?([^\s)>]+)>?(?:\s+"[^"]*")?\)\s*$/);
    if (!match || match[1] !== normalizedHero) {
      repaired.push(lines[index]);
      continue;
    }

    // A featured image is already rendered above the article body.
    if (/^\s*\*(?:Figure|Source)\b/i.test(lines[index + 1] || '')) index++;
  }

  return repaired.join('\n');
}

function trimReferenceDumps(content: string): string {
  const lines = content.split('\n');
  const repaired: string[] = [];
  const referenceHeading = /^(#{2,3})\s+(?:(?:authoritative (?:research|documentation)(?: and technical documentation)?)|(?:references|sources|further reading|technical documentation)\b.*)$/i;

  for (let index = 0; index < lines.length; index++) {
    const heading = lines[index].match(referenceHeading);
    if (!heading) {
      repaired.push(lines[index]);
      continue;
    }

    const level = heading[1].length;
    let end = index + 1;
    while (end < lines.length) {
      const nextHeading = lines[end].match(/^(#{1,6})\s+/);
      if (nextHeading && nextHeading[1].length <= level) break;
      end++;
    }

    const listItems = lines.slice(index + 1, end).filter((line) => /^\s*[-*+]\s+/.test(line));
    if (listItems.length <= 6) {
      repaired.push(...lines.slice(index, end));
      index = end - 1;
      continue;
    }

    // Keep a short, useful reading list instead of a generated bibliography dump.
    repaired.push(`${heading[1]} Further reading`, '', ...listItems.slice(0, 6), '');
    index = end - 1;
  }

  return repaired.join('\n');
}

function removeAsciiDiagrams(content: string): string {
  return content.replace(/```[^\n]*\n([\s\S]*?)```/g, (block: string, diagram: string) => {
    const borderLines = diagram.split('\n').filter((line) => /\+[-+]{8,}\+/.test(line));
    return borderLines.length >= 2 ? '' : block;
  });
}

function repairDiagramMarkup(content: string): string {
  const diagramTags = /^(\s*)(\/?(?:svg|g|path|rect|circle|line|polygon|polyline|text|tspan|defs|use|marker)\b.*)$/;
  const lines = content.split('\n');
  const repaired: string[] = [];

  for (let index = 0; index < lines.length; index++) {
    if (!/^<div class="my-8 overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm">$/.test(lines[index])) {
      repaired.push(lines[index]);
      continue;
    }

    const diagram = ['<div class="article-diagram">'];
    index++;

    for (; index < lines.length && lines[index] !== '</div>'; index++) {
      const line = lines[index].trim();
      if (!line) continue;

      if (/^div class=/.test(line)) {
        diagram.push(line.replace(/^div class="[^"]*">/, '<div class="article-diagram-title">'));
        continue;
      }

      const diagramTag = line.match(diagramTags);
      if (!diagramTag) {
        diagram.push(line);
        continue;
      }

      let tag = diagramTag[2];
      if (tag.startsWith('svg ')) {
        tag = /class="[^"]*"/.test(tag)
          ? tag.replace(/class="[^"]*"/, 'class="article-diagram-svg"')
          : tag.replace(/>$/, ' class="article-diagram-svg">');
      }
      diagram.push(`<${tag.endsWith('>') ? tag : `${tag}>`}`);
    }

    diagram.push('</div>');
    // A single raw HTML block prevents remark from wrapping SVG children in paragraphs.
    repaired.push(diagram.join(''));
  }

  return repaired.join('\n');
}

function repairSplitListItems(content: string): string {
  const lines = content.split('\n');
  const repaired: string[] = [];

  for (let index = 0; index < lines.length; index++) {
    const match = lines[index].match(/^(\s*)((?:\d+\.)|[-+*])\s*$/);
    if (!match) {
      repaired.push(lines[index]);
      continue;
    }

    let nextIndex = index + 1;
    while (nextIndex < lines.length && !lines[nextIndex].trim()) nextIndex++;
    const nextLine = lines[nextIndex]?.trim();

    if (!nextLine || /^(?:#|```|(?:\d+\.)|[-+*])(?:\s|$)|^\|/.test(nextLine)) {
      repaired.push(lines[index]);
      continue;
    }

    repaired.push(`${match[1]}${match[2]} ${nextLine}`);
    index = nextIndex;
  }

  return repaired.join('\n');
}

function repairFragmentedTables(content: string): string {
  const lines = content.split('\n');
  const repaired: string[] = [];

  for (let index = 0; index < lines.length; index++) {
    if (lines[index].trim() !== '|') {
      repaired.push(lines[index]);
      continue;
    }

    const cells: string[] = [];
    let nextIndex = index + 1;
    while (nextIndex < lines.length) {
      const candidate = lines[nextIndex].trim();
      if (!candidate) {
        nextIndex++;
        continue;
      }
      if (candidate === '|' || candidate.startsWith('|') || !candidate.endsWith('|')) break;
      cells.push(candidate.slice(0, -1).trim());
      nextIndex++;
    }

    if (cells.length < 2) {
      repaired.push(lines[index]);
      continue;
    }

    repaired.push(`| ${cells.join(' | ')} |`);
    index = nextIndex - 1;
  }

  return repaired.join('\n');
}

function tableCellCount(line: string): number {
  return line.trim().split('|').length - 2;
}

function repairIncompleteTableRows(content: string): string {
  const lines = content.split('\n');
  const repaired: string[] = [];

  for (let index = 0; index < lines.length; index++) {
    const header = lines[index].trim();
    const separatorIndex = index + 1;
    const separator = lines[separatorIndex]?.trim();

    if (!header.startsWith('|') || !header.endsWith('|') || !separator || !/^\|(?:\s*:?-{3,}:?\s*\|)+$/.test(separator)) {
      repaired.push(lines[index]);
      continue;
    }

    const columns = tableCellCount(header);
    repaired.push(lines[index], lines[separatorIndex]);
    index = separatorIndex;

    while (index + 1 < lines.length) {
      let rowIndex = index + 1;
      while (rowIndex < lines.length && !lines[rowIndex].trim()) rowIndex++;
      const row = lines[rowIndex]?.trim();
      if (!row?.startsWith('|') || !row.endsWith('|')) break;

      let completedRow = row;
      let cells = tableCellCount(completedRow);
      let nextIndex = rowIndex + 1;

      while (cells < columns) {
        while (nextIndex < lines.length && !lines[nextIndex].trim()) nextIndex++;
        const fragment = lines[nextIndex]?.trim();
        if (!fragment || fragment.startsWith('|') || !fragment.endsWith('|')) break;
        completedRow = `${completedRow} ${fragment}`;
        cells++;
        nextIndex++;
      }

      repaired.push(completedRow);
      index = nextIndex - 1;
    }
  }

  return repaired.join('\n');
}

function normalizeArticleMarkdown(content: string, heroImage?: string): string {
  return repairDiagramMarkup(
    repairIncompleteTableRows(
      repairFragmentedTables(
        repairSplitListItems(
          removeAsciiDiagrams(
            trimReferenceDumps(
              removeDuplicateHeroImage(removePlaceholderKeyTakeaways(content), heroImage),
            ),
          ),
        ),
      ),
    ),
  );
}

const latestArticlesPath = path.join(process.cwd(), 'content/latest-articles.json');

/** Footer-only: reads precomputed JSON instead of scanning all article files. */
export async function getFooterArticles(): Promise<ArticleMetadata[]> {
 if (fs.existsSync(latestArticlesPath)) {
  try {
   const data = JSON.parse(fs.readFileSync(latestArticlesPath, 'utf8')) as ArticleMetadata[];
   if (Array.isArray(data) && data.length > 0) {
    return data;
   }
  } catch (err) {
   console.error('[getFooterArticles] Could not read latest-articles.json:', err);
  }
 }

 const all = await getAllArticles();
 return [...all]
  .sort(
   (a, b) =>
    new Date(b.publishedDate || 0).getTime() - new Date(a.publishedDate || 0).getTime()
  )
  .slice(0, 5);
}

export async function getAllArticles(): Promise<ArticleMetadata[]> {
 if (process.env.NODE_ENV !== 'production') {
  return readArticlesFromDirectory(contentArticlesDirectory)
   .sort((a, b) => a.title.localeCompare(b.title));
 }

 if (!articleMetadataCache) {
  articleMetadataCache = readArticlesFromDirectory(contentArticlesDirectory)
   .sort((a, b) => a.title.localeCompare(b.title));
 }

 // Callers sort the result for their own views, so return a fresh array while
 // retaining the cached metadata objects and their existing visible values.
 return [...articleMetadataCache];
}

export async function getArticle(slug: string): Promise<Article | undefined> {
 const fullPath = path.join(contentArticlesDirectory, `${slug}.md`);

 if (!fs.existsSync(fullPath)) {
  return undefined;
 }

 try {
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const matterResult = matter(fileContents);

   const data = matterResult.data;
   const sanitizedContent = normalizeArticleMarkdown(matterResult.content, typeof data.image === 'string' ? data.image : undefined);

  const processedContent = await remark()
   .use(remarkGfm)
   .use(html, { sanitize: false }) // We will sanitize manually with a better library
   .process(sanitizedContent);
  const contentHtml = processedContent.toString();

  // Sanitize HTML on the server, preserving inline SVGs for diagrams
  const content = sanitizeHtml(contentHtml, {
   allowedTags: sanitizeHtml.defaults.allowedTags.concat([
    'img', 'div', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'svg', 'g', 'path', 'rect', 'circle', 'line', 'polygon', 'polyline', 'text', 'tspan', 'defs', 'use', 'marker'
   ]),
   allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    '*': [
      'class', 'style', 'id',
       'viewBox', 'viewbox', 'xmlns', 'cx', 'cy', 'r', 'x', 'y', 'x1', 'y1', 'x2', 'y2',
      'width', 'height', 'rx', 'ry', 'fill', 'fill-opacity', 'stroke',
      'stroke-width', 'stroke-opacity', 'stroke-dasharray', 'stroke-linecap',
      'stroke-linejoin', 'transform', 'text-anchor', 'font-family', 'font-size',
      'font-weight', 'marker-end', 'marker-start', 'd', 'points'
    ],
    'a': ['href', 'name', 'target', 'rel'],
    'img': ['src', 'alt', 'title', 'width', 'height', 'data-ai-hint'],
   },
  });

   if (typeof data.title !== 'string' || !data.title) {
   console.error(`Article with slug"${slug}" is missing a title.`);
   return undefined;
  }

  const image = typeof data.image === 'string' && data.image && !data.image.includes('picsum.photos')
    ? data.image
    : `https://hashtagweb3.com/api/og?type=article&title=${encodeURIComponent(data.title)}&category=${encodeURIComponent(typeof data.category === 'string' ? data.category : 'General')}`;
  const description = typeof data.description === 'string' && data.description ? data.description : 'No description provided.';
  const category = typeof data.category === 'string' && data.category ? data.category : 'General';

  return {
   slug,
   content,
   rawContent: sanitizedContent,
   title: data.title,
   description,
    category,
    'data-ai-hint': data['data-ai-hint'],
    imageFit: data.imageFit === 'contain' ? 'contain' : undefined,
    image,
   publishedDate: typeof data.publishedDate === 'string' ? data.publishedDate : undefined,
   lastUpdated: typeof data.lastUpdated === 'string' ? data.lastUpdated : undefined,
  };
 } catch (err) {
  console.error(`Error reading or processing article ${slug}:`, err);
  return undefined;
 }
}
