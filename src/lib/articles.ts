
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

  const sanitizedContent = removePlaceholderKeyTakeaways(matterResult.content);

  const processedContent = await remark()
   .use(remarkGfm)
   .use(html, { sanitize: false }) // We will sanitize manually with a better library
   .process(sanitizedContent);
  const contentHtml = processedContent.toString();

  // Sanitize HTML on the server
  const content = sanitizeHtml(contentHtml, {
   allowedTags: sanitizeHtml.defaults.allowedTags.concat([
    'img', 'div', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'
   ]),
   allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    '*': ['class'],
    'a': ['href', 'name', 'target', 'rel'],
    'img': ['src', 'alt', 'title', 'width', 'height', 'data-ai-hint'],
   },
  });

  const data = matterResult.data;

  if (typeof data.title !== 'string' || !data.title) {
   console.error(`Article with slug"${slug}" is missing a title.`);
   return undefined;
  }

  const image = typeof data.image === 'string' && data.image ? data.image : `https://picsum.photos/seed/${slug}/1200/630`;
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
   image,
   publishedDate: typeof data.publishedDate === 'string' ? data.publishedDate : undefined,
   lastUpdated: typeof data.lastUpdated === 'string' ? data.lastUpdated : undefined,
  };
 } catch (err) {
  console.error(`Error reading or processing article ${slug}:`, err);
  return undefined;
 }
}
