/**
 * Writes content/latest-articles.json with the 5 most recently published articles.
 * Run at build time so the footer avoids scanning all 800+ markdown files.
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const articlesDir = path.join(process.cwd(), 'content/articles');
const outPath = path.join(process.cwd(), 'content/latest-articles.json');

type FooterArticle = {
  slug: string;
  title: string;
  description: string;
  category: string;
  publishedDate?: string;
  image: string;
};

const files = fs.readdirSync(articlesDir).filter((f) => f.endsWith('.md'));

const articles: FooterArticle[] = files
  .map((fileName) => {
    const slug = fileName.replace(/\.md$/, '');
    const fullPath = path.join(articlesDir, fileName);
    const { data } = matter(fs.readFileSync(fullPath, 'utf8'));

    if (typeof data.title !== 'string' || !data.title) return null;

    const category =
      typeof data.category === 'string' && data.category ? data.category : 'General';
    const description =
      typeof data.description === 'string' && data.description
        ? data.description
        : 'No description provided.';
    const image =
      typeof data.image === 'string' && data.image && !data.image.includes('picsum.photos')
        ? data.image
        : `https://hashtagweb3.com/api/og?type=article&title=${encodeURIComponent(data.title)}&category=${encodeURIComponent(category)}`;

    return {
      slug,
      title: data.title,
      description,
      category,
      publishedDate:
        typeof data.publishedDate === 'string' ? data.publishedDate : undefined,
      image,
    };
  })
  .filter((article): article is FooterArticle => article !== null)
  .sort(
    (a, b) =>
      new Date(b.publishedDate || 0).getTime() - new Date(a.publishedDate || 0).getTime()
  )
  .slice(0, 5);

fs.writeFileSync(outPath, JSON.stringify(articles, null, 2) + '\n');
console.log(`Wrote ${articles.length} articles to content/latest-articles.json`);
