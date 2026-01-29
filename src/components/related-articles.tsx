
import type { Article } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

interface RelatedArticlesProps {
  allArticles: Omit<Article, 'content'>[];
  currentCategory: string;
  currentSlug: string;
}

export function RelatedArticles({ allArticles, currentCategory, currentSlug }: RelatedArticlesProps) {
  // Get up to 4 articles from the same category, excluding the current one
  const inCategory = allArticles
    .filter(article => article.category === currentCategory && article.slug !== currentSlug);

  // Get recent articles from other categories to fill the remaining spots
  const others = allArticles
    .filter(article => article.category !== currentCategory && article.slug !== currentSlug);

  // Combine them, ensuring we have exactly 4 unique related articles if possible
  const related = [...inCategory, ...others].slice(0, 4);

  if (related.length === 0) {
    return null;
  }

  return (
    <div className="my-16">
      <h2 className="text-3xl font-bold text-center mb-8 flex items-center justify-center gap-3"><BookOpen className="h-8 w-8"/> Related Reading</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {related.map(article => (
          <Card key={article.slug} className="flex flex-col transform transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
            <Link href={`/${article.slug}`} className="block h-full flex flex-col">
              <div className="relative w-full h-40">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover rounded-t-lg"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  data-ai-hint={article['data-ai-hint'] || ''}
                />
              </div>
              <CardHeader className="flex-grow">
                <CardTitle className="text-md leading-tight">{article.title}</CardTitle>
              </CardHeader>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
