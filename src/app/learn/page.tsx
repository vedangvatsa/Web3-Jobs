import { Header } from '@/components/header';
import { getCategories } from '@/lib/learn';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
 Globe, Landmark, Code, Briefcase, ArrowRight, Clock, Users,
} from 'lucide-react';

export const metadata: Metadata = {
 title: 'Learn Web3 - Free Courses on Blockchain, DeFi, Smart Contracts & Careers',
 description: 'Structured courses to learn Web3 from scratch. 66 structured lessons with diagrams, quizzes, and career guidance. Written for beginners, developers, and job seekers.',
 alternates: { canonical: 'https://hashtagweb3.com/learn' },
 openGraph: {
  type: 'website',
  title: 'Learn Web3 - Free Structured Courses',
  description: 'From zero to building on-chain. 66 structured lessons with diagrams and quizzes for beginners, developers, and job seekers.',
  url: 'https://hashtagweb3.com/learn',
  images: [{ url: 'https://hashtagweb3.com/api/og?type=article&title=Learn%20Web3&category=Free%20Courses', width: 1200, height: 630, alt: 'Learn Web3 - Free structured courses on Hashtag Web3' }],
 },
 twitter: {
  card: 'summary_large_image',
  title: 'Learn Web3 - Free Structured Courses',
  description: 'From zero to building on-chain. 66 structured lessons with diagrams and quizzes.',
  images: ['https://hashtagweb3.com/api/og?type=article&title=Learn%20Web3&category=Free%20Courses'],
 },
};

const iconMap: Record<string, React.ElementType> = {
 Globe, Landmark, Code, Briefcase,
};

const audienceIcon: Record<string, React.ElementType> = {
 'Everyone': Users,
 'Finance-interested': Landmark,
 'Developers': Code,
 'Job seekers': Briefcase,
};

export default function LearnPage() {
 const categories = getCategories();
 const totalLessons = categories.reduce((sum, c) => sum + c.lessonCount, 0);
 const coreCategory = categories.find((c: any) => c.type === 'core');
 const electives = categories.filter((c: any) => c.type === 'elective');

 return (
  <div className="flex flex-col min-h-screen">
   <Header />
   <main className="flex-grow">
    {/* Hero */}
    <section className="border-b bg-muted/10">
     <div className="container mx-auto px-4 py-16 md:py-24 max-w-5xl">
      <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
       Learn Web3
      </h1>
      <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
       {totalLessons} free lessons with diagrams, quizzes, and real examples. 
       Start with the fundamentals, then pick your path.
      </p>
     </div>
    </section>

    <div className="container mx-auto px-4 py-12 md:py-16 max-w-5xl">
     {/* Core course - prominent */}
     {coreCategory && (
      <div className="mb-12">
       <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
        Start here
       </p>
       <Link href={`/learn/${coreCategory.slug}`}>
        <Card className="group hover:border-primary transition-all border-2">
         <CardContent className="p-6 md:p-8">
          <div className="flex items-start justify-between gap-4 mb-3">
           <div>
            <h2 className="text-2xl font-bold group-hover:text-foreground transition-colors mb-2">
             {coreCategory.title}
            </h2>
            <p className="text-muted-foreground">
             {coreCategory.description}
            </p>
           </div>
           <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0 mt-1" />
          </div>
          <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
           <span>{coreCategory.lessonCount} lessons</span>
           <span>·</span>
           <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {(coreCategory as any).duration}
           </span>
           <span>·</span>
           <Badge variant="secondary" className="text-[10px] uppercase bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Beginner
           </Badge>
          </div>
         </CardContent>
        </Card>
       </Link>
      </div>
     )}

     {/* Electives */}
     {electives.length > 0 && (
      <div>
       <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
        Then pick your path
       </p>
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {electives.map((category) => {
         const IconComponent = iconMap[category.icon] || Globe;
         return (
          <Link key={category.slug} href={`/learn/${category.slug}`}>
           <Card className="group hover:border-primary transition-all h-full">
            <CardContent className="p-5">
             <IconComponent className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors mb-3" />
             <h3 className="font-semibold mb-1 group-hover:text-foreground transition-colors">
              {category.title}
             </h3>
             <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {category.description}
             </p>
             <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{category.lessonCount} lessons</span>
              <span>·</span>
              <span>{(category as any).audience}</span>
             </div>
            </CardContent>
           </Card>
          </Link>
         );
        })}
       </div>
      </div>
     )}
    </div>
   </main>
  </div>
 );
}
