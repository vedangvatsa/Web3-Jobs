
'use server';

import type { Article } from '@/types';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const articlesDirectory = path.join(process.cwd(), 'content/articles');

export async function getAllArticles(): Promise<Omit<Article, 'content'>[]> {
  const fileNames = fs.readdirSync(articlesDirectory);
  const allArticlesData = fileNames
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, '');
      
      const fullPath = path.join(articlesDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const matterResult = matter(fileContents);

      return {
        slug,
        ...(matterResult.data as { title: string; image: string; description: string; category: string }),
      };
    })
    .filter((article): article is Omit<Article, 'content'> => article !== null);

  return allArticlesData.sort((a, b) => a.title.localeCompare(b.title));
}

export async function getArticle(slug: string): Promise<Article | undefined> {
  const fullPath = path.join(articlesDirectory, `${slug}.md`);
  
  try {
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = matter(fileContents);

    // Replace markdown links with HTML links
    const contentWithHtmlLinks = matterResult.content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
      if (url.startsWith('/')) {
        return `<a href="${url}">${text}</a>`;
      }
      return match; // Keep external links as they are
    });
    
    const processedContent = await remark()
      .use(html)
      .process(contentWithHtmlLinks);
    const content = processedContent.toString();

    return {
      slug,
      content,
      ...(matterResult.data as { title: string; image: string; description: string; category: string }),
    };
  } catch (err) {
    // If the file doesn't exist, return undefined
    return undefined;
  }
}
