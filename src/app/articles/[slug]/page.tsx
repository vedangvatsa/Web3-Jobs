
import { getArticle } from '@/content/articles';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { ArticleRenderer } from '@/components/article-renderer';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface ArticlePageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const article = getArticle(params.slug);

  if (!article) {
    return {};
  }

  return {
    title: article.title,
    description: article.description,
  };
}

export default function ArticlePage({ params }: ArticlePageProps) {
  const article = getArticle(params.slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-4xl mx-auto">
          <Link href="/articles" className="inline-flex items-center text-primary mb-8 hover:underline">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Articles
          </Link>
          <article>
            <header className="mb-8">
              <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl text-primary mb-3">
                {article.title}
              </h1>
              <p className="text-lg text-muted-foreground">{article.description}</p>
            </header>
            
            <div className="prose prose-lg max-w-none text-foreground prose-h2:text-foreground prose-h3:text-foreground prose-strong:text-foreground prose-a:text-primary hover:prose-a:text-primary/80">
                <ArticleRenderer content={article.content} />
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
