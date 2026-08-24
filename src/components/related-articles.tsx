import type { Article } from '@/types';
import { BookOpen } from 'lucide-react';
import { ArticleCard } from '@/components/article-card';

interface RelatedArticlesProps {
  allArticles: Omit<Article, 'content'>[];
  currentCategory: string;
  currentSlug: string;
}

export function RelatedArticles({ allArticles, currentCategory, currentSlug }: RelatedArticlesProps) {
  // Get up to 4 articles from the same category, excluding the current one
  const inCategory = allArticles.filter(
    (article) => article.category === currentCategory && article.slug !== currentSlug
  );

  // Get recent articles from other categories to fill the remaining spots
  const others = allArticles.filter(
    (article) => article.category !== currentCategory && article.slug !== currentSlug
  );

  // Combine them, ensuring we have exactly 4 unique related articles if possible
  const related = [...inCategory, ...others].slice(0, 4);

  if (related.length === 0) {
    return null;
  }

  return (
    <div className="my-16 site-container px-4">
      <h2 className="text-2xl font-bold text-center mb-8 flex items-center justify-center gap-3">
        <BookOpen className="h-6 w-6" /> Related Reading
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {related.map((article) => (
          <ArticleCard key={article.slug} article={article} variant="related" />
        ))}
      </div>
    </div>
  );
}
