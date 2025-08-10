
import { getArticle } from '@/content/articles';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { ArticleRenderer } from '@/components/article-renderer';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

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
    <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-1">
            <div className="container mx-auto px-4 py-8 md:py-16">
                <div className="max-w-4xl mx-auto">
                <Link href="/articles" className="inline-flex items-center text-primary mb-8 hover:underline">
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back to Articles
                </Link>
                <article>
                    <header className="mb-12">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-primary mb-4">
                        {article.title}
                    </h1>
                    <p className="text-xl text-muted-foreground">{article.description}</p>
                    </header>
                    
                    <div className="prose prose-lg max-w-none text-foreground prose-h2:text-3xl prose-h2:font-bold prose-h2:mb-4 prose-h2:mt-10 prose-h3:text-2xl prose-h3:font-bold prose-p:leading-relaxed prose-a:text-primary hover:prose-a:text-primary/80 prose-ul:list-none prose-ul:p-0">
                        <ArticleRenderer content={article.content} />
                    </div>
                </article>
                </div>
            </div>
        </main>
        <Footer />
    </div>
  );
}
