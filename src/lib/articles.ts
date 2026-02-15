
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
      const data = matterResult.data;

      if (typeof data.title !== 'string' || 
          typeof data.description !== 'string' ||
          typeof data.category !== 'string') {
            console.warn(`Article with slug "${slug}" is missing essential frontmatter (title, desc, or category). It will be excluded.`);
            return null;
      }
      
      const image = data.image || `https://picsum.photos/seed/${slug}/1200/630`;

      return {
        slug,
        title: data.title,
        description: data.description,
        category: data.category,
        'data-ai-hint': data['data-ai-hint'],
        image,
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

    const data = matterResult.data as { title: string; image?: string; description: string; category: string; ['data-ai-hint']?: string; };
    const image = data.image || `https://picsum.photos/seed/${slug}/1200/630`;

    return {
      slug,
      content,
      title: data.title,
      description: data.description,
      category: data.category,
      'data-ai-hint': data['data-ai-hint'],
      image,
    };
  } catch (err) {
    console.error(`Error reading or processing article ${slug}:`, err);
    return undefined;
  }
}
