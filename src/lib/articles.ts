
'use server';

import type { Article } from '@/types';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const articlesDirectory = path.join(process.cwd(), 'src/lib/articles');

function removePlaceholderKeyTakeaways(content: string): string {
  const sectionRegex = /(^|\n)## Key Takeaways[\s\S]*?(?=\n## |\n# |\n$)/g;
  return content.replace(sectionRegex, (section) => {
    return section.includes('{Key point') ? '\n' : section;
  });
}

export async function getAllArticles(): Promise<Omit<Article, 'content'>[]> {
  const fileNames = fs.readdirSync(articlesDirectory);
  const allArticlesData = fileNames
    .map((fileName) => {
      if (!fileName.endsWith('.md')) {
        return null;
      }
      const slug = fileName.replace(/\.md$/, '');
      
      const fullPath = path.join(articlesDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const matterResult = matter(fileContents);

      if (typeof matterResult.data.title !== 'string' || 
          typeof matterResult.data.image !== 'string' ||
          typeof matterResult.data.description !== 'string' ||
          typeof matterResult.data.category !== 'string') {
            console.warn(`Article with slug "${slug}" is missing frontmatter.`);
            return null;
      }

      return {
        slug,
        ...(matterResult.data as { title: string; image: string; description: string; category: string; ['data-ai-hint']?: string; }),
      };
    })
    .filter((article): article is Omit<Article, 'content'> => article !== null);

  return allArticlesData.sort((a, b) => a.title.localeCompare(b.title));
}

export async function getArticle(slug: string): Promise<Article | undefined> {
  const fullPath = path.join(articlesDirectory, `${slug}.md`);
  
  if (!fs.existsSync(fullPath)) {
    return undefined;
  }

  try {
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = matter(fileContents);
    
    const sanitizedContent = removePlaceholderKeyTakeaways(matterResult.content);

    const processedContent = await remark()
      .use(html)
      .process(sanitizedContent);
    const content = processedContent.toString();

    return {
      slug,
      content,
      ...(matterResult.data as { title: string; image: string; description: string; category: string; ['data-ai-hint']?: string; }),
    };
  } catch (err) {
    console.error(`Error reading or processing article ${slug}:`, err);
    return undefined;
  }
}
