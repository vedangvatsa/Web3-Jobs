import { getAllTerms, getCategoriesWithCounts, getGlossaryStats } from '@/lib/glossary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { PageHeader } from "@/components/page-header";
import { PageShell } from "@/components/page-shell";

export const metadata: Metadata = {
  title: 'Web3 Glossary',
  description: 'Web3 glossary covering blockchain, cryptocurrency, DeFi, and NFT terminology with plain-language explanations.',
  alternates: {
    canonical: 'https://hashtagweb3.com/glossary',
  },
  openGraph: {
    type: 'website',
    title: 'Web3 Glossary | Hashtag Web3',
    description: 'Complete guide to Web3 terminology. Understand blockchain, DeFi, NFTs, and cryptocurrency concepts.',
    url: 'https://hashtagweb3.com/glossary',
    images: [{
      url: 'https://hashtagweb3.com/api/og?type=default&title=Web3%20Glossary',
      width: 1200,
      height: 630,
      alt: 'Web3 Glossary',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Web3 Glossary | Hashtag Web3',
    description: 'Explore 200+ Web3 and cryptocurrency terms. Complete guide to blockchain, DeFi, NFTs, and decentralized technology concepts.',
    images: ['https://hashtagweb3.com/api/og?type=default&title=Web3%20Glossary'],
  },
};

export const revalidate = 86400;
export const dynamic = 'force-static';

export default async function GlossaryPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const allTerms = await getAllTerms();
  const categories = await getCategoriesWithCounts();
  const stats = await getGlossaryStats();

  const filteredTerms = searchParams.category
    ? allTerms.filter(term => term.category === searchParams.category)
    : allTerms;

  const termsByLetter = filteredTerms.reduce((acc, term) => {
    const firstLetter = term.term[0].toUpperCase();
    if (!acc[firstLetter]) acc[firstLetter] = [];
    acc[firstLetter].push(term);
    return acc;
  }, {} as Record<string, typeof allTerms>);

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const availableLetters = Object.keys(termsByLetter).sort();

  const siteUrl = 'https://hashtagweb3.com';
  const glossaryPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${siteUrl}/glossary#page`,
    url: `${siteUrl}/glossary`,
    name: 'Web3 Glossary | Hashtag Web3',
    description: 'Complete guide to Web3, blockchain, DeFi, NFT, and crypto terminology with plain-language explanations.',
    isPartOf: {
      '@type': 'WebSite',
      url: siteUrl,
      name: 'Hashtag Web3',
    },
    about: {
      '@type': 'DefinedTermSet',
      '@id': `${siteUrl}/glossary#termset`,
      name: 'Web3 Glossary',
      description: 'Comprehensive taxonomy of blockchain, DeFi, and cryptocurrency terms',
      url: `${siteUrl}/glossary`,
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
        { '@type': 'ListItem', position: 2, name: 'Glossary', item: `${siteUrl}/glossary` },
      ],
    },
  };

  return (
    <div className="flex flex-col min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(glossaryPageSchema) }}
      />
      <main className="flex-grow">
        <PageShell>
          <section className="text-center mb-8">
            <div className="site-container">
              {searchParams.category ? (
                <>
                  <div className="mb-3">
                    <Link href="/glossary" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                      <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                      All Terms
                    </Link>
                  </div>
                  <PageHeader
                    title={searchParams.category}
                    description={`Browse all ${searchParams.category} terms in our Web3 glossary.`}
                  />
                </>
              ) : (
                <>
                  <PageHeader
                    title="Web3 Glossary"
                    description="Your complete guide to blockchain, cryptocurrency, and decentralized technology terminology."
                  />
                  <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground mt-4">
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <span><strong>{stats.totalTerms}</strong> terms</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span><strong>{stats.totalCategories}</strong> categories</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>

          <div className="site-container space-y-10">
            {/* Alphabet Navigation */}
            <div className="flex flex-wrap gap-1.5 justify-center py-2">
              {alphabet.map(letter => {
                const isAvailable = availableLetters.includes(letter);
                return isAvailable ? (
                  <Link
                    key={letter}
                    href={`#${letter.toLowerCase()}`}
                    className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-md text-xs font-semibold bg-secondary/80 text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    {letter}
                  </Link>
                ) : (
                  <span
                    key={letter}
                    className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-md text-xs font-semibold text-muted-foreground/40 select-none"
                  >
                    {letter}
                  </span>
                );
              })}
            </div>

            {/* Categories - only show when not filtering */}
            {!searchParams.category && (
              <section>
                <div className="mb-4">
                  <h2 className="text-lg font-bold tracking-tight mb-0.5">Browse by category</h2>
                  <p className="text-xs text-muted-foreground">Explore terms organized by Web3 sector</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.filter(cat => cat.termCount && cat.termCount > 0).map((category) => (
                    <Link key={category.slug} href={`/glossary/${category.slug}`}>
                      <Card className="group border-border/70 bg-card shadow-none hover:border-foreground/25 transition-colors h-full">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-semibold group-hover:text-primary transition-colors flex items-center justify-between">
                            {category.name}
                            <Badge variant="secondary" className="text-[10px]">{category.termCount}</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-xs text-muted-foreground line-clamp-2">{category.description}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* All Terms Alphabetically */}
            <section className="pt-2">
              <div className="mb-6">
                <h2 className="text-lg font-bold tracking-tight mb-0.5">
                  {searchParams.category ? `${searchParams.category} Terms` : 'All terms'}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {searchParams.category ? `${filteredTerms.length} terms in this category` : 'Complete alphabetical listing'}
                </p>
              </div>

              {availableLetters.map(letter => (
                <div key={letter} id={letter.toLowerCase()} className="mb-10 scroll-mt-20">
                  <h3 className="text-base font-bold mb-3 pb-1 border-b border-border/60">{letter}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {termsByLetter[letter].map((term) => (
                      <Link key={term.slug} href={`/${term.slug}`}>
                        <Card className="group border-border/70 bg-card shadow-none hover:border-foreground/25 transition-colors h-full">
                          <CardContent className="p-4">
                            <h4 className="font-semibold text-sm group-hover:text-primary transition-colors mb-1">
                              {term.term}
                            </h4>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {term.description}
                            </p>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          </div>
        </PageShell>
      </main>
    </div>
  );
}
