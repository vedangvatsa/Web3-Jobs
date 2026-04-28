
'use client';

import { useState, useMemo, useTransition } from 'react';
import type { Article } from '@/types';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Rss, ArrowRight, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function ArticleCard({ article }: { article: Omit<Article, 'content'> }) {
 return (
  <Card className="flex flex-col transform transition-all duration-200 hover:-translate-y-1 hover:shadow-sm h-full">
   <Link href={`/${article.slug}`} className="block h-full flex flex-col">
    <div className="relative w-full h-48">
     <Image
      src={article.image}
      alt={`${article.title} - Hashtag Web3 Playbook`}
      fill
      className="object-cover rounded-t-lg"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      data-ai-hint={`${article['data-ai-hint'] || ''}`}
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

function ArticleCardSkeleton() {
  return (
    <Card className="flex flex-col h-full">
      <Skeleton className="w-full h-48 rounded-t-lg" />
      <CardHeader>
        <Skeleton className="h-4 w-1/4 mb-2" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-4 w-3/4 mt-2" />
      </CardHeader>
    </Card>
  );
}

export function BlogPageClient({ allArticles, categories }: { allArticles: Omit<Article, 'content'>[], categories: string[] }) {
 const router = useRouter();
 const pathname = usePathname();
 const searchParams = useSearchParams();
 
 const selectedCategory = searchParams.get('category') || 'All';
 const searchQuery = searchParams.get('search') || '';

 const [inputValue, setInputValue] = useState(searchQuery);
 const [isPending, startTransition] = useTransition();

 const handleCategoryClick = (category: string) => {
  const current = new URLSearchParams(Array.from(searchParams.entries()));
  if (category === 'All') {
   current.delete('category');
  } else {
   current.set('category', category);
  }
  const search = current.toString();
  const query = search ? `?${search}` : '';
  router.push(`${pathname}${query}`);
 };

 const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  setInputValue(value);
  startTransition(() => {
   const current = new URLSearchParams(Array.from(searchParams.entries()));
   if (value) {
    current.set('search', value);
   } else {
    current.delete('search');
   }
   const search = current.toString();
   const query = search ? `?${search}` : '';
   router.push(`${pathname}${query}`, { scroll: false });
  });
 };

 const filteredArticles = useMemo(() => {
  let articles = allArticles;
  
  if (selectedCategory && selectedCategory !== 'All') {
   articles = articles.filter((article) => article.category === selectedCategory);
  }

  if (searchQuery) {
    const lowercasedQuery = searchQuery.toLowerCase();
    articles = articles.filter(article => 
      article.title.toLowerCase().includes(lowercasedQuery) ||
      article.description.toLowerCase().includes(lowercasedQuery) ||
      article.category.toLowerCase().includes(lowercasedQuery)
    );
  }

  return articles;
 }, [allArticles, selectedCategory, searchQuery]);

 const headlines = [
   "The Web3 Playbook",
   "Career Guides",
   "Technology Deep Dives",
   "Industry Insights"
 ];

 return (
  <div className="container mx-auto px-4 py-8">
   <section className="text-center mb-12 max-w-4xl mx-auto">
    <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">{headlines[0]}</h1>
   </section>

   <div className="max-w-7xl mx-auto">
    <Card className="p-4 mb-8 sticky top-20 z-10 shadow-sm bg-background border-b">
     <div className="flex flex-col gap-4">
       <div className="relative">
         <Input
           placeholder="Search articles by title or keyword..."
           value={inputValue}
           onChange={handleSearchChange}
           className="w-full text-base pl-10 h-11 rounded-full shadow-sm"
         />
         <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"/>
       </div>
       <div className="flex flex-wrap justify-center gap-2">
         {categories.map((category) => (
           <Button
           key={category}
           variant={selectedCategory === category ? 'default' : 'outline'}
           onClick={() => handleCategoryClick(category)}
           className="rounded-full text-xs h-8"
           >
           {category}
           </Button>
         ))}
       </div>
     </div>
    </Card>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 min-h-[600px]">
      {isPending ? (
         [...Array(12)].map((_, i) => <ArticleCardSkeleton key={i} />)
      ) : (
        filteredArticles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))
      )}
    </div>
    
    {!isPending && filteredArticles.length === 0 && (
      <div className="text-center py-20 border-2 border-dashed rounded-lg col-span-full mt-8">
        <h3 className="text-xl font-semibold">No Articles Found</h3>
        <p className="text-muted-foreground mt-2">Try adjusting your search query or filters.</p>
      </div>
    )}

    <Card className="mt-12 col-span-full bg-primary/5 border-primary/20">
     <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
       
       <div>
         <h3 className="text-xl font-bold text-primary mb-1">Looking for a Web3 Job?</h3>
         <p className="text-muted-foreground">Join our Telegram channel with over 60,000 subscribers to get the latest job postings.</p>
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
 );
}
