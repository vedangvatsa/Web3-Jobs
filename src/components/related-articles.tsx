import type { Article } from '@/types';
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
    <section className="mt-16 pt-12 border-t border-border/70 max-w-5xl mx-auto px-4">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Related Reading
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Explore more guides and career playbooks
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {related.map((article) => (
          <ArticleCard key={article.slug} article={article} variant="related" />
        ))}
      </div>
    </section>
  );
}
