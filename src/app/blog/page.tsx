
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import Link from 'next/link';
import Image from 'next/image';
import type { Article } from '@/types';
import { Button } from '@/components/ui/button';
import { getAllArticles } from '@/lib/articles';
import { BlogCategoryFilter } from '@/components/blog-category-filter';
import { TransitioningHeadline } from '@/components/transitioning-headline';


function ArticleCard({ article }: { article: Omit<Article, 'content'> }) {
  return (
    <Card className="flex flex-col transform transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
      <Link href={`/${article.slug}`} className="block h-full">
        <div className="relative w-full h-48">
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover rounded-t-lg"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            data-ai-hint={`${article.slug.replace(/-/g, ' ')}`}
          />
        </div>
        <CardHeader className="flex-grow">
          <p className="text-sm font-medium text-primary mb-1">{article.category}</p>
          <CardTitle className="text-xl">{article.title}</CardTitle>
          <CardDescription className="pt-2">{article.description}</CardDescription>
        </CardHeader>
      </Link>
    </Card>
  );
}


export default async function PlaybookIndexPage({ searchParams }: { searchParams?: { category?: string }}) {
  const allArticles = await getAllArticles();
  const categories = ['All', ...[...new Set(allArticles.map(a => a.category))].sort()];
  
  const selectedCategory = searchParams?.category;

  const filteredArticles = selectedCategory && selectedCategory !== 'All' 
    ? allArticles.filter((article) => article.category === selectedCategory)
    : allArticles;

  const headlines = [
      "The Web3 Playbook",
      "Career Guides",
      "Technology Deep Dives",
      "Industry Insights"
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <section className="text-center mb-12 max-w-4xl mx-auto">
             <TransitioningHeadline phrases={headlines} />
          </section>

          <div className="mb-12">
            <BlogCategoryFilter categories={categories} />
          </div>

          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article) => (
                <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
