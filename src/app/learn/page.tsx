import { Header } from '@/components/header';
import { getCategories } from '@/lib/learn';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Globe, Blocks, Landmark, Image, Users, Code, Server, Microscope, Briefcase,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Learn Web3 - Free Courses on Blockchain, DeFi, NFTs & More',
  description: 'Structured courses to learn Web3 from scratch. Blockchain, DeFi, NFTs, DAOs, smart contracts, and more. Written for developers, operators, and newcomers.',
  alternates: { canonical: '/learn' },
  openGraph: {
    title: 'Learn Web3 - Free Structured Courses',
    description: 'From zero to building on-chain. Structured courses for developers, operators, and newcomers.',
    url: 'https://hashtagweb3.com/learn',
  },
};

const iconMap: Record<string, React.ElementType> = {
  Globe, Blocks, Landmark, Image, Users, Code, Server, Microscope, Briefcase,
};

export default function LearnPage() {
  const categories = getCategories();
  const totalLessons = categories.reduce((sum, c) => sum + c.lessonCount, 0);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <section className="border-b bg-muted/10">
          <div className="container mx-auto px-4 py-16 md:py-24 max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              Learn Web3
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
              From zero to building on-chain. {totalLessons} free lessons across {categories.length} tracks, 
              written for developers, operators, and newcomers.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12 md:py-16 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => {
              const IconComponent = iconMap[category.icon] || Globe;
              return (
                <Link key={category.slug} href={`/learn/${category.slug}`}>
                  <Card className="group hover:border-primary transition-all h-full">
                    <CardContent className="p-6">
                      <div className="mb-4">
                        <IconComponent className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <h2 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                        {category.title}
                      </h2>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {category.description}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {category.lessonCount} {category.lessonCount === 1 ? 'lesson' : 'lessons'}
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
