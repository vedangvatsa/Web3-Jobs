import { Header } from '@/components/header';
import { getAllTerms, getCategoriesWithCounts, getGlossaryStats } from '@/lib/glossary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Search, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Web3 Glossary - Complete Guide to Blockchain & Crypto Terms',
  description: 'Comprehensive glossary of Web3, blockchain, cryptocurrency, DeFi, and NFT terminology. Learn the language of decentralized technology.',
  alternates: {
    canonical: '/glossary',
  },
  openGraph: {
    title: 'Web3 Glossary - Blockchain & Crypto Terms Explained',
    description: 'Complete guide to Web3 terminology. Understand blockchain, DeFi, NFTs, and cryptocurrency concepts.',
    url: 'https://hashtagweb3.com/glossary',
  },
};

export const revalidate = 86400; // Revalidate daily

export default async function GlossaryPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const allTerms = await getAllTerms();
  const categories = await getCategoriesWithCounts();
  const stats = await getGlossaryStats();
  
  // Filter by category if provided
  const filteredTerms = searchParams.category
    ? allTerms.filter(term => term.category === searchParams.category)
    : allTerms;
  
  // Group terms by first letter
  const termsByLetter = filteredTerms.reduce((acc, term) => {
    const firstLetter = term.term[0].toUpperCase();
    if (!acc[firstLetter]) acc[firstLetter] = [];
    acc[firstLetter].push(term);
    return acc;
  }, {} as Record<string, typeof allTerms>);
  
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const availableLetters = Object.keys(termsByLetter).sort();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="border-b">
          <div className="container mx-auto px-4 py-12 md:py-20 max-w-7xl">
            <div className="max-w-3xl">
              {searchParams.category ? (
                <>
                  <div className="mb-4">
                    <Link href="/glossary" className="text-sm text-muted-foreground hover:text-primary">
                      ← All Terms
                    </Link>
                  </div>
                  <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                    {searchParams.category}
                  </h1>
                  <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                    Browse all {searchParams.category} terms in our Web3 glossary.
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                    Web3 Glossary
                  </h1>
                  <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                    Your complete guide to blockchain, cryptocurrency, and decentralized technology terminology. 
                    From basic concepts to advanced protocols, understand the language that powers Web3.
                  </p>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      <span><strong>{stats.totalTerms}</strong> terms</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <span><strong>{stats.totalCategories}</strong> categories</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Alphabet Navigation */}
        <section className="border-b bg-muted/30">
          <div className="container mx-auto px-4 py-6 max-w-7xl">
            <div className="flex flex-wrap gap-2 justify-center">
              {alphabet.map(letter => (
                <Link
                  key={letter}
                  href={`#${letter.toLowerCase()}`}
                  className={`w-10 h-10 flex items-center justify-center rounded-md font-semibold transition-colors ${
                    availableLetters.includes(letter)
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  }`}
                >
                  {letter}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Categories - only show when not filtering */}
        {!searchParams.category && (
          <section className="container mx-auto px-4 py-12 md:py-16 max-w-7xl">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Browse by category</h2>
              <p className="text-muted-foreground">Explore terms organized by Web3 sector</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.filter(cat => cat.termCount && cat.termCount > 0).map((category) => (
                <Link key={category.slug} href={`/glossary/${category.slug}`}>
                  <Card className="group hover:border-primary transition-all h-full">
                  <CardHeader>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors flex items-center justify-between">
                      {category.name}
                      <Badge variant="secondary">{category.termCount}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
        )}

        {/* All Terms Alphabetically */}
        <section className="container mx-auto px-4 py-12 md:py-16 max-w-7xl border-t">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">{searchParams.category ? `${searchParams.category} Terms` : 'All terms'}</h2>
            <p className="text-muted-foreground">{searchParams.category ? `${filteredTerms.length} terms in this category` : 'Complete alphabetical listing'}</p>
          </div>
          
          {availableLetters.map(letter => (
            <div key={letter} id={letter.toLowerCase()} className="mb-12 scroll-mt-20">
              <h3 className="text-2xl font-bold mb-4 pb-2 border-b">{letter}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {termsByLetter[letter].map((term) => (
                  <Link key={term.slug} href={`/${term.slug}`}>
                    <Card className="group hover:border-primary hover:shadow-sm transition-all h-full">
                      <CardContent className="p-4">
                        <h4 className="font-semibold group-hover:text-primary transition-colors mb-2">
                          {term.term}
                        </h4>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {term.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {term.category}
                          </Badge>
                          <Badge 
                            variant={term.difficulty === 'Beginner' ? 'default' : term.difficulty === 'Intermediate' ? 'secondary' : 'destructive'} 
                            className="text-xs"
                          >
                            {term.difficulty}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
