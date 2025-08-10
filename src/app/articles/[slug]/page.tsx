
import { getArticle } from '@/content/articles';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { ArticleRenderer } from '@/components/article-renderer';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { TableOfContents } from '@/components/table-of-contents';

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
                <div className="max-w-6xl mx-auto">
                    <Link href="/articles" className="inline-flex items-center text-primary mb-8 hover:underline">
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Back to Articles
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 max-w-6xl mx-auto">
                    {/* Main Content */}
                    <article className="lg:col-span-3">
                        <header className="mb-12">
                            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-primary mb-4">
                                {article.title}
                            </h1>
                            <p className="text-xl text-muted-foreground">{article.description}</p>
                        </header>
                        
                        <div className="prose prose-lg max-w-none text-foreground prose-h2:text-3xl prose-h2:font-bold prose-h2:mb-4 prose-h2:mt-10 prose-h3:text-2xl prose-h3:font-bold prose-p:leading-relaxed prose-a:text-primary hover:prose-a:text-primary/80 prose-ul:list-none prose-ul:p-0 prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-muted-foreground">
                            <ArticleRenderer content={article.content} />
                        </div>
                    </article>

                    {/* Table of Contents */}
                    <aside className="hidden lg:block lg:col-span-1">
                        <div className="sticky top-24">
                           <h4 className="font-semibold text-lg mb-4">Table of Contents</h4>
                           <TableOfContents content={article.content} />
                        </div>
                    </aside>
                </div>
            </div>
        </main>
        <Footer />
    </div>
  );
}
