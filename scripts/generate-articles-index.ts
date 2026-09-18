/**
 * Full article metadata for /api/articles and /api/news on Cloudflare Workers
 * (avoids reading 800+ markdown files per request).
 */
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const articlesDir = path.join(process.cwd(), 'content/articles');
const outPath = path.join(process.cwd(), 'content/articles-index.json');
const NON_ARTICLE = new Set(['AGENTS.md', 'README.md']);

type ArticleIndexEntry = {
  slug: string;
  title: string;
  ogTitle?: string;
  description: string;
  category: string;
  'data-ai-hint'?: string;
  imageFit?: 'contain';
  image: string;
  imageCaption?: string;
  imageCreditUrl?: string;
  publishedDate?: string;
  lastUpdated?: string;
};

const files = fs.readdirSync(articlesDir).filter((f) => f.endsWith('.md') && !NON_ARTICLE.has(f));

const articles: ArticleIndexEntry[] = files
  .map((fileName) => {
    const slug = fileName.replace(/\.md$/, '');
    const { data } = matter(fs.readFileSync(path.join(articlesDir, fileName), 'utf8'));
    if (typeof data.title !== 'string' || !data.title) return null;

    const category = typeof data.category === 'string' && data.category ? data.category : 'General';
    const ogTitle = typeof data.ogTitle === 'string' && data.ogTitle ? data.ogTitle : undefined;
    const displayOgTitle = ogTitle || data.title;
    const image =
      typeof data.image === 'string' && data.image && !data.image.includes('picsum.photos')
        ? data.image
        : category === 'News'
          ? 'https://hashtagweb3.com/og-news.png'
          : 'https://hashtagweb3.com/og-image-blog.png';

    return {
      slug,
      title: data.title,
      ogTitle,
      description:
        typeof data.description === 'string' && data.description
          ? data.description
          : 'No description provided.',
      category,
      'data-ai-hint': typeof data['data-ai-hint'] === 'string' ? data['data-ai-hint'] : undefined,
      imageFit: data.imageFit === 'contain' ? 'contain' : undefined,
      image,
      imageCaption: typeof data.imageCaption === 'string' ? data.imageCaption : undefined,
      imageCreditUrl: typeof data.imageCreditUrl === 'string' ? data.imageCreditUrl : undefined,
      publishedDate: typeof data.publishedDate === 'string' ? data.publishedDate : undefined,
      lastUpdated: typeof data.lastUpdated === 'string' ? data.lastUpdated : undefined,
    };
  })
  .filter((a): a is ArticleIndexEntry => a !== null)
  .sort((a, b) => a.title.localeCompare(b.title));

fs.writeFileSync(outPath, `${JSON.stringify(articles)}\n`);
console.log(`Wrote ${articles.length} articles to ${outPath}`);
