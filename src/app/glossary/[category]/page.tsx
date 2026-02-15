import { Header } from '@/components/header';
import { getTermsByCategory, getCategory, getAllCategorySlugs } from '@/lib/glossary';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, TrendingUp, Zap, Shield, Coins, Network, Building2, Code2, Scale, Lock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

// Category-specific images and colors
const CATEGORY_VISUALS: Record<string, { image: string; gradient: string; icon: any }> = {
  'blockchain-fundamentals': {
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&h=400&fit=crop',
    gradient: 'from-blue-600 to-cyan-600',
    icon: Network,
  },
  'cryptocurrencies': {
    image: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=1200&h=400&fit=crop',
    gradient: 'from-amber-600 to-orange-600',
    icon: Coins,
  },
  'defi': {
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&h=400&fit=crop',
    gradient: 'from-emerald-600 to-teal-600',
    icon: TrendingUp,
  },
  'nfts': {
    image: 'https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=1200&h=400&fit=crop',
    gradient: 'from-purple-600 to-pink-600',
    icon: Zap,
  },
  'smart-contracts': {
    image: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=1200&h=400&fit=crop',
    gradient: 'from-indigo-600 to-blue-600',
    icon: Code2,
  },
  'protocols': {
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=400&fit=crop',
    gradient: 'from-violet-600 to-purple-600',
    icon: Building2,
  },
  'governance': {
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&h=400&fit=crop',
    gradient: 'from-rose-600 to-red-600',
    icon: Scale,
  },
  'security': {
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1200&h=400&fit=crop',
    gradient: 'from-slate-600 to-gray-600',
    icon: Shield,
  },
  'trading': {
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&h=400&fit=crop',
    gradient: 'from-green-600 to-emerald-600',
    icon: TrendingUp,
  },
  'technical': {
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=400&fit=crop',
    gradient: 'from-cyan-600 to-blue-600',
    icon: Lock,
  },
};

// Rich category descriptions
const CATEGORY_CONTENT: Record<string, { tagline: string; longDescription: string; whyMatters: string }> = {
  'blockchain-fundamentals': {
    tagline: 'Master the foundation of decentralized technology',
    longDescription: 'Blockchain technology represents a fundamental shift in how we store, verify, and transfer data. Understanding these core concepts is essential for anyone entering the Web3 space, whether you\'re a developer, investor, or entrepreneur.',
    whyMatters: 'These fundamentals form the basis of all Web3 technologies. Without understanding blocks, chains, consensus mechanisms, and distributed networks, it\'s impossible to grasp the more advanced concepts in DeFi, NFTs, or smart contracts.',
  },
  'cryptocurrencies': {
    tagline: 'Digital money powering the decentralized economy',
    longDescription: 'Cryptocurrencies are programmable digital assets that enable peer-to-peer value transfer without intermediaries. From Bitcoin\'s store of value to Ethereum\'s smart contract platform, each cryptocurrency serves unique purposes in the Web3 ecosystem.',
    whyMatters: 'Cryptocurrencies are the fuel that powers Web3. They enable borderless payments, incentivize network participation, and create entirely new economic models. Understanding different types of cryptocurrencies and their use cases is crucial for navigating this space.',
  },
  'defi': {
    tagline: 'Banking and finance without banks',
    longDescription: 'Decentralized Finance (DeFi) recreates traditional financial services—lending, borrowing, trading, and earning yield—on blockchain networks. DeFi protocols are transparent, permissionless, and accessible to anyone with an internet connection.',
    whyMatters: 'DeFi is revolutionizing finance by removing intermediaries, reducing costs, and enabling financial innovation at unprecedented speed. It represents a multi-billion dollar industry with opportunities for users, developers, and entrepreneurs.',
  },
  'nfts': {
    tagline: 'Digital ownership and provenance on the blockchain',
    longDescription: 'Non-Fungible Tokens (NFTs) represent unique digital assets with verifiable ownership and scarcity. Beyond digital art, NFTs enable new models for gaming, music, real estate, identity, and intellectual property.',
    whyMatters: 'NFTs are reshaping how we think about digital ownership, creator economics, and online communities. They enable creators to monetize their work directly, fans to own pieces of culture, and brands to build engaged communities.',
  },
  'smart-contracts': {
    tagline: 'Self-executing code that runs exactly as programmed',
    longDescription: 'Smart contracts are programs deployed on blockchains that automatically execute when conditions are met. They power everything from simple token transfers to complex DeFi protocols and DAOs, all without requiring trust in a third party.',
    whyMatters: 'Smart contracts are the engine of Web3. They enable trustless automation, eliminate intermediaries, and create entirely new types of applications. Every DeFi protocol, NFT marketplace, and DAO runs on smart contracts.',
  },
  'protocols': {
    tagline: 'Standards and frameworks building the Web3 stack',
    longDescription: 'Blockchain protocols and standards define how different systems interact and communicate. From token standards like ERC-20 to scaling solutions like Layer 2s, these protocols enable interoperability and innovation across the ecosystem.',
    whyMatters: 'Protocols are the building blocks of Web3 infrastructure. Understanding standards like ERC-20, ERC-721, and Layer 2 solutions is essential for building, investing in, or working with blockchain applications.',
  },
  'governance': {
    tagline: 'Democratic decision-making in decentralized organizations',
    longDescription: 'Governance in Web3 enables token holders to vote on protocol upgrades, treasury management, and strategic decisions. DAOs (Decentralized Autonomous Organizations) are pioneering new models for collective ownership and decision-making.',
    whyMatters: 'Governance determines how Web3 projects evolve and adapt. As protocols become more decentralized, understanding governance mechanisms becomes crucial for participants, from developers to token holders to contributors.',
  },
  'security': {
    tagline: 'Protecting your assets in the decentralized world',
    longDescription: 'Security in Web3 means taking personal responsibility for protecting your assets. From managing private keys to understanding smart contract risks, security knowledge is essential for safely participating in the decentralized economy.',
    whyMatters: 'With great power comes great responsibility. Web3 gives you control of your assets, but this also means you\'re responsible for securing them. Understanding security fundamentals can protect you from costly mistakes and scams.',
  },
  'trading': {
    tagline: 'Markets, liquidity, and exchange mechanisms',
    longDescription: 'Cryptocurrency trading spans centralized exchanges, decentralized protocols, and various market structures. Understanding trading concepts—from order books to liquidity pools—is essential for navigating Web3 markets effectively.',
    whyMatters: 'Trading is how price discovery happens in crypto markets. Whether you\'re providing liquidity, trading tokens, or building financial applications, understanding market mechanics is fundamental to success in Web3.',
  },
  'technical': {
    tagline: 'Infrastructure powering decentralized networks',
    longDescription: 'The technical layer of Web3 includes nodes, consensus mechanisms, cryptography, and infrastructure. These concepts are crucial for developers building on blockchain and anyone wanting deep technical understanding.',
    whyMatters: 'Technical knowledge separates surface-level understanding from true expertise. For developers, understanding the technical layer is essential. For investors and users, it builds confidence in the technology\'s capabilities and limitations.',
  },
};

export async function generateStaticParams() {
  const categorySlugs = await getAllCategorySlugs();
  return categorySlugs.map(slug => ({ category: slug }));
}

export async function generateMetadata({ params }: { params: { category: string } }): Promise<Metadata> {
  const category = await getCategory(params.category);
  
  if (!category) {
    return {
      title: 'Category Not Found',
    };
  }

  const siteUrl = 'https://hashtagweb3.com';
  const categoryUrl = `${siteUrl}/glossary/${params.category}`;

  return {
    title: `${category.name} - Web3 Glossary Terms & Definitions`,
    description: `Explore ${category.termCount} essential ${category.name.toLowerCase()} terms. ${category.description}`,
    alternates: {
      canonical: categoryUrl,
    },
    openGraph: {
      title: `${category.name} - Web3 Glossary`,
      description: `Learn ${category.termCount} key terms in ${category.name.toLowerCase()}. Comprehensive definitions and explanations.`,
      url: categoryUrl,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${category.name} - Web3 Glossary`,
      description: category.description,
    },
  };
}

export default async function CategoryPage({ params }: { params: { category: string } }) {
  const category = await getCategory(params.category);
  const terms = await getTermsByCategory(params.category);

  if (!category || terms.length === 0) {
    notFound();
  }

  const visuals = CATEGORY_VISUALS[params.category] || CATEGORY_VISUALS['blockchain-fundamentals'];
  const content = CATEGORY_CONTENT[params.category] || CATEGORY_CONTENT['blockchain-fundamentals'];
  const IconComponent = visuals.icon;

  // Group terms by difficulty
  const beginnerTerms = terms.filter(t => t.difficulty === 'Beginner');
  const intermediateTerms = terms.filter(t => t.difficulty === 'Intermediate');
  const advancedTerms = terms.filter(t => t.difficulty === 'Advanced');

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {/* Hero Section with Image */}
        <section className="relative h-[400px] overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src={visuals.image}
              alt={category.name}
              fill
              className="object-cover"
              priority
            />
            <div className={`absolute inset-0 bg-gradient-to-r ${visuals.gradient} opacity-80`} />
          </div>
          <div className="relative container mx-auto px-4 h-full flex items-center max-w-7xl">
            <div className="text-white max-w-3xl">
              <div className="flex items-center gap-2 mb-4">
                <Link href="/glossary" className="text-white/90 hover:text-white text-sm">
                  ← Web3 Glossary
                </Link>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-5xl md:text-6xl font-bold">{category.name}</h1>
              </div>
              <p className="text-2xl mb-4 text-white/95">{content.tagline}</p>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  <span className="font-semibold">{category.termCount} terms</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  <span className="font-semibold">All levels</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Category Overview */}
        <section className="border-b bg-muted/30">
          <div className="container mx-auto px-4 py-12 max-w-7xl">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-bold mb-4">About this category</h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  {content.longDescription}
                </p>
              </div>
              <div className="bg-card border rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Why this matters
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {content.whyMatters}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-green-600">{beginnerTerms.length}</span>
                </div>
                <div>
                  <div className="font-semibold">Beginner</div>
                  <div className="text-sm text-muted-foreground">Essential basics</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-600">{intermediateTerms.length}</span>
                </div>
                <div>
                  <div className="font-semibold">Intermediate</div>
                  <div className="text-sm text-muted-foreground">Building knowledge</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-red-600">{advancedTerms.length}</span>
                </div>
                <div>
                  <div className="font-semibold">Advanced</div>
                  <div className="text-sm text-muted-foreground">Expert concepts</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Terms by Difficulty */}
        <section className="container mx-auto px-4 py-12 max-w-7xl">
          {/* Beginner Terms */}
          {beginnerTerms.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <Badge variant="default" className="text-sm px-3 py-1">Beginner</Badge>
                <h2 className="text-3xl font-bold">Start here</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {beginnerTerms.map((term) => (
                  <Link key={term.slug} href={`/${term.slug}`}>
                    <Card className="group hover:border-primary hover:shadow-md transition-all h-full">
                      <CardContent className="p-5">
                        <h3 className="font-bold text-lg group-hover:text-primary transition-colors mb-2">
                          {term.term}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {term.description}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Intermediate Terms */}
          {intermediateTerms.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <Badge variant="secondary" className="text-sm px-3 py-1">Intermediate</Badge>
                <h2 className="text-3xl font-bold">Build your knowledge</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {intermediateTerms.map((term) => (
                  <Link key={term.slug} href={`/${term.slug}`}>
                    <Card className="group hover:border-primary hover:shadow-md transition-all h-full">
                      <CardContent className="p-5">
                        <h3 className="font-bold text-lg group-hover:text-primary transition-colors mb-2">
                          {term.term}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {term.description}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Advanced Terms */}
          {advancedTerms.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Badge variant="destructive" className="text-sm px-3 py-1">Advanced</Badge>
                <h2 className="text-3xl font-bold">Expert concepts</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {advancedTerms.map((term) => (
                  <Link key={term.slug} href={`/${term.slug}`}>
                    <Card className="group hover:border-primary hover:shadow-md transition-all h-full">
                      <CardContent className="p-5">
                        <h3 className="font-bold text-lg group-hover:text-primary transition-colors mb-2">
                          {term.term}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {term.description}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* CTA Section */}
        <section className={`relative py-16 overflow-hidden`}>
          <div className={`absolute inset-0 bg-gradient-to-r ${visuals.gradient} opacity-10`} />
          <div className="relative container mx-auto px-4 max-w-4xl text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to explore more Web3 concepts?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Browse our complete glossary with {category.termCount}+ terms across all categories
            </p>
            <Link 
              href="/glossary"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              <BookOpen className="h-5 w-5" />
              Browse All Terms
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
