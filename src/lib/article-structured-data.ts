import type { Article as ArticleSchema, BreadcrumbList, NewsArticle, ScholarlyArticle, WithContext } from 'schema-dts';

const SCHOLARLY_CATEGORIES = ['AI & The Future of Work', 'Web3 Career Guides'];

export type ArticleStructuredDataInput = {
  slug: string;
  title: string;
  description: string;
  category: string;
  image: string;
  publishedDate?: string;
  lastUpdated?: string;
  'data-ai-hint'?: string;
};

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function resolvedImageUrl(image: string, siteUrl: string): string {
  if (isHttpUrl(image)) return image;
  const path = image.startsWith('/') ? image : `/${image}`;
  return `${siteUrl.replace(/\/$/, '')}${path}`;
}

/** Diagnostics for Article / NewsArticle / ScholarlyArticle JSON-LD (Google Search). */
export function getArticleSchemaIssues(article: ArticleStructuredDataInput): string[] {
  const issues: string[] = [];
  if (!article.title?.trim()) issues.push('missing-headline');
  const description = article.description?.trim() ?? '';
  if (!description || description === 'No description provided.') issues.push('missing-description');
  if (!article.image?.trim()) issues.push('missing-image');
  const published = article.publishedDate || article.lastUpdated;
  if (!published || !Number.isFinite(Date.parse(published))) issues.push('missing-date-published');
  return issues;
}

export function buildArticleStructuredData(
  article: ArticleStructuredDataInput,
  siteUrl: string,
): WithContext<ArticleSchema | NewsArticle | ScholarlyArticle> | null {
  if (getArticleSchemaIssues(article).length) return null;

  const isNews = article.category === 'News';
  const isScholarly = SCHOLARLY_CATEGORIES.includes(article.category);
  const imageUrl = resolvedImageUrl(article.image, siteUrl);
  const articleUrl = `${siteUrl.replace(/\/$/, '')}/${article.slug}`;
  const datePublished = article.publishedDate || article.lastUpdated!;
  const dateModified = article.lastUpdated || article.publishedDate || datePublished;

  return {
    '@context': 'https://schema.org',
    '@type': isNews ? 'NewsArticle' : isScholarly ? 'ScholarlyArticle' : 'Article',
    headline: article.title,
    description: article.description,
    image: imageUrl,
    datePublished,
    dateModified,
    url: articleUrl,
    articleSection: article.category,
    inLanguage: 'en',
    isAccessibleForFree: true,
    keywords: [article.category, article['data-ai-hint'], 'Web3', 'crypto', 'blockchain'].filter(Boolean).join(', '),
    author: {
      '@type': 'Organization',
      name: 'Hashtag Web3',
      url: siteUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Hashtag Web3',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl.replace(/\/$/, '')}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
  };
}

export function buildArticleBreadcrumbStructuredData(
  article: Pick<ArticleStructuredDataInput, 'title' | 'slug' | 'category'>,
  siteUrl: string,
): WithContext<BreadcrumbList> {
  const base = siteUrl.replace(/\/$/, '');
  const isNews = article.category === 'News';
  const articleUrl = `${base}/${article.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: base },
      { '@type': 'ListItem', position: 2, name: isNews ? 'News' : 'Blog', item: `${base}/${isNews ? 'news' : 'blog'}` },
      { '@type': 'ListItem', position: 3, name: article.title, item: articleUrl },
    ],
  };
}