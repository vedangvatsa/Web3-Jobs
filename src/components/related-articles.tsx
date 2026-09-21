import type { Article } from '@/types';
import type { NewsItem } from '@/types';
import { ArticleCard } from '@/components/article-card';
import { sortNewsListingItems } from '@/lib/news';

interface RelatedArticlesProps {
  allArticles: Omit<Article, 'content'>[];
  currentCategory: string;
  currentSlug: string;
  newsItems?: NewsItem[];
}

export function RelatedArticles({ allArticles, currentCategory, currentSlug, newsItems = [] }: RelatedArticlesProps) {
  const isNews = currentCategory === 'News';

  if (isNews) {
    const moreNews = sortNewsListingItems(newsItems)
      .filter((item) => item.link !== `/${currentSlug}`)
      .slice(0, 4);

    if (moreNews.length === 0) return null;

    return (
      <section className="mt-16 pt-12 border-t border-border/70 w-full">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Read More</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {moreNews.map((item) => {
            const isExternal = item.link.startsWith('http');
            return (
            <a
              key={item.link}
              href={item.link}
              target={isExternal ? '_blank' : undefined}
              rel={isExternal ? 'noopener noreferrer' : undefined}
              className="group rounded-lg border bg-card p-4 transition-shadow hover:shadow-sm"
            >
              <div className="mb-2 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                <span className="font-semibold uppercase tracking-wide text-foreground">
                  {item.source === 'Hashtag Web3' ? 'Hashtag Web3' : item.source}
                </span>
                <time dateTime={item.pubDate}>{new Date(item.pubDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</time>
              </div>
              <h3 className="text-base font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">{item.title}</h3>
            </a>
            );
          })}
        </div>
      </section>
    );
  }

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
    <section className="mt-16 pt-12 border-t border-border/70 w-full">
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
