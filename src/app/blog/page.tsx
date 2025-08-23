
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Header } from '@/components/header';
import Link from 'next/link';
import Image from 'next/image';
import type { Article } from '@/types';
import { Button } from '@/components/ui/button';
import { getAllArticles } from '@/lib/articles';
import { BlogCategoryFilter } from '@/components/blog-category-filter';
import { TransitioningHeadline } from '@/components/transitioning-headline';
import { Rss, Briefcase, ArrowRight } from 'lucide-react';


function ArticleCard({ article }: { article: Omit<Article, 'content'> }) {
  return (
    <Card className="flex flex-col transform transition-all duration-200 hover:-translate-y-1 hover:shadow-xl h-full">
      <Link href={`/${article.slug}`} className="block h-full flex flex-col">
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

          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredArticles.map((article) => (
                    <ArticleCard key={article.slug} article={article} />
                ))}
            </div>

            <Card className="mt-12 col-span-full bg-primary/5 border-primary/20">
              <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                  <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full hidden md:block">
                      <Rss className="h-8 w-8 text-primary"/>
                  </div>
                  <div>
                      <h3 className="text-xl font-bold text-primary mb-1">Looking for a Web3 Job?</h3>
                      <p className="text-muted-foreground">Join our Telegram channel with over 56,000 subscribers to get the latest job postings.</p>
                  </div>
                  <a href="https://t.me/web3hiring" target="_blank" rel="noopener noreferrer" className="flex-shrink-0 mt-4 md:mt-0">
                      <Button size="lg">
                          Join Job Feed <ArrowRight className="ml-2 h-4 w-4"/>
                      </Button>
                  </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
