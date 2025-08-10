
import { getArticle, getArticles } from '@/content/articles';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { ArticleRenderer } from '@/components/article-renderer';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { JsonLd } from 'react-schemaorg';
import { Article as ArticleSchema } from 'schema-dts';
import Image from 'next/image';

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

  const siteUrl = 'https://web3-jobs.example.com';

  return {
    title: article.title,
    description: article.description,
    alternates: {
      canonical: `${siteUrl}/articles/${article.slug}`,
    },
    openGraph: {
        title: article.title,
        description: article.description,
        url: `${siteUrl}/articles/${article.slug}`,
        type: 'article',
        images: [
            {
                url: article.image.replace('w=600&h=400', 'w=1200&h=630'),
                width: 1200,
                height: 630,
                alt: article.title,
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: article.title,
        description: article.description,
        images: [article.image.replace('w=600&h=400', 'w=1200&h=630')],
    },
  };
}

// Statically generate routes for all articles
export async function generateStaticParams() {
  const articles = getArticles();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}


export default function ArticlePage({ params }: ArticlePageProps) {
  const article = getArticle(params.slug);

  if (!article) {
    notFound();
  }

  // Structured data for rich snippets
  const articleSchema: ArticleSchema = {
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: article.image,
    author: {
        '@type': 'Organization',
        name: 'Hashtag Web3',
        url: 'https://web3-jobs.example.com'
    },
    publisher: {
        '@type': 'Organization',
        name: 'Hashtag Web3',
        logo: {
            '@type': 'ImageObject',
            url: 'https://web3-jobs.example.com/og-image.png'
        }
    },
    datePublished: new Date().toISOString(), // In a real app, this would be the article's publish date
    mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `https://web3-jobs.example.com/articles/${article.slug}`
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
        <JsonLd item={articleSchema} />
        <Header />
        <main className="flex-1 py-12 md:py-20">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto">
                    <div className="mb-12">
                        <Link href="/articles" className="inline-flex items-center text-primary hover:text-primary/80 transition-colors">
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            Back to Articles
                        </Link>
                    </div>

                    <article>
                        <header className="mb-12">
                             <Image
                                src={article.image}
                                alt={article.title}
                                width={800}
                                height={450}
                                className="w-full h-auto rounded-lg shadow-md mb-8"
                                priority
                                data-ai-hint={article.slug.replace(/-/g, ' ')}
                            />
                            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-primary mb-4 leading-tight">
                                {article.title}
                            </h1>
                            <p className="text-xl text-muted-foreground">{article.description}</p>
                        </header>
                        
                        <div className="prose prose-lg max-w-full text-foreground 
                            prose-p:mb-6
                            prose-h2:text-3xl prose-h2:font-bold prose-h2:mb-4 prose-h2:mt-12 
                            prose-h3:text-2xl prose-h3:font-bold 
                            prose-p:leading-relaxed 
                            prose-a:text-primary hover:prose-a:text-primary/80 
                            prose-ul:list-none prose-ul:p-0 
                            prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-muted-foreground">
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
