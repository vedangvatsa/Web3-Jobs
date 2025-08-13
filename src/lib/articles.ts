
import type { Article } from '@/types';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const articlesDirectory = path.join(process.cwd(), 'content/articles');

// List of slugs to exclude from the blog
const excludedSlugs = [
  'answering-why-web3-crafting-your-personal-narrative-for-interviews',
  'breaking-into-web3-a-guide-for-non-technical-professionals',
  'how-to-become-a-web3-legal-consultant',
  'how-to-present-your-web3-portfolio-to-get-noticed',
  'the-rise-of-the-crypto-native-hr-professional',
  'the-role-of-a-tokenomics-designer-architecting-digital-economies'
];

export async function getAllArticles(): Promise<Omit<Article, 'content'>[]> {
  const fileNames = fs.readdirSync(articlesDirectory);
  const allArticlesData = fileNames
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, '');
      
      // Exclude the specified slugs
      if (excludedSlugs.includes(slug)) {
        return null;
      }

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
  // If the requested slug is in the exclusion list, treat it as not found
  if (excludedSlugs.includes(slug)) {
    return undefined;
  }
  
  const fullPath = path.join(articlesDirectory, `${slug}.md`);
  
  try {
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = matter(fileContents);

    const processedContent = await remark()
      .use(html)
      .process(matterResult.content);
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
