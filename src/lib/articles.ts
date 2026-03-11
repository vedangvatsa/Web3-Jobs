
'use server';

import type { Article } from '@/types';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import sanitizeHtml from 'sanitize-html';

const contentArticlesDirectory = path.join(process.cwd(), 'content/articles');

function readArticlesFromDirectory(directory: string): Omit<Article, 'content' | 'rawContent'>[] {
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
        console.warn(`Article with slug "${slug}" is missing a title.`);
        return null;
      }

      const image = typeof data.image === 'string' && data.image ? data.image : `https://picsum.photos/seed/${slug}/1200/630`;
      const description = typeof data.description === 'string' && data.description ? data.description : 'No description provided.';
      const category = typeof data.category === 'string' && data.category ? data.category : 'General';

      return {
        slug,
        title: data.title,
        description,
        category,
        'data-ai-hint': data['data-ai-hint'],
        image,
      };
    })
    .filter((article): article is Omit<Article, 'content' | 'rawContent'> => article !== null);
}

function removePlaceholderKeyTakeaways(content: string): string {
  const sectionRegex = /(^|\n)## Key Takeaways[\s\S]*?(?=\n## |\n# |\n$)/g;
  return content.replace(sectionRegex, (section) => {
    return section.includes('{Key point') ? '\n' : section;
  });
}

export async function getAllArticles(): Promise<Omit<Article, 'content' | 'rawContent'>[]> {
  const contentArticles = readArticlesFromDirectory(contentArticlesDirectory);
  return contentArticles.sort((a, b) => a.title.localeCompare(b.title));
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
      console.error(`Article with slug "${slug}" is missing a title.`);
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
    };
  } catch (err) {
    console.error(`Error reading or processing article ${slug}:`, err);
    return undefined;
  }
}
