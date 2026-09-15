import type { Article } from '@/types';
import { buildArticleOgImageUrl, SITE_URL } from '@/lib/job-og';

export type ArticleOgPageMeta = {
  title: string;
  description: string;
  ogImageUrl: string;
  canonicalUrl: string;
};

type ArticleOgFields = Pick<Article, 'slug' | 'title' | 'description' | 'ogTitle' | 'category'>;

/** Open Graph fields for root-level articles (/{slug}), shared by page metadata and og-meta. */
export function buildArticlePageMeta(article: ArticleOgFields): ArticleOgPageMeta {
  const description =
    article.description.length > 155 ? `${article.description.slice(0, 152)}...` : article.description;

  return {
    title: article.title,
    description,
    ogImageUrl: buildArticleOgImageUrl(article, SITE_URL),
    canonicalUrl: `${SITE_URL}/${article.slug}`,
  };
}
