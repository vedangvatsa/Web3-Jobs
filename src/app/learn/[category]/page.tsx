import { Header } from '@/components/header';
import { getCategory, getLessons } from '@/lib/learn';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface Props {
 params: { category: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
 const category = getCategory(params.category);
 if (!category) return {};
 const pageTitle = `${category.title} - Learn Web3`;
 const ogImageUrl = `/api/og?type=article&title=${encodeURIComponent(category.title)}&category=Learn%20Web3`;
 return {
  title: pageTitle,
  description: category.description,
  alternates: { canonical: `https://hashtagweb3.com/learn/${params.category}` },
  openGraph: {
   title: pageTitle,
   description: category.description,
   url: `https://hashtagweb3.com/learn/${params.category}`,
   images: [{ url: ogImageUrl, width: 1200, height: 630, alt: category.title }],
  },
  twitter: {
   card: 'summary_large_image',
   title: pageTitle,
   description: category.description,
   images: [ogImageUrl],
  },
 };
}

const difficultyColors: Record<string, string> = {
 beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
 intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
 advanced: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export default function CategoryPage({ params }: Props) {
 const category = getCategory(params.category);
 if (!category) notFound();

 const lessons = getLessons(params.category);

 return (
  <div className="flex flex-col min-h-screen">
   <Header />
   <main className="flex-grow">
    <div className="container mx-auto px-4 py-8 max-w-3xl">
     {/* Breadcrumb */}
     <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
      <Link href="/learn" className="hover:text-foreground transition-colors">Learn</Link>
      <ChevronRight className="h-3 w-3" />
      <span className="text-foreground font-medium">{category.title}</span>
     </nav>

     <div className="mb-10">
      <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">
       {category.title}
      </h1>
      <p className="text-muted-foreground text-lg">
       {category.description}
      </p>
      <p className="text-sm text-muted-foreground mt-2">
       {lessons.length} {lessons.length === 1 ? 'lesson' : 'lessons'}
      </p>
     </div>

     {/* Lesson list */}
     <div className="border rounded-lg overflow-hidden bg-background divide-y">
      {lessons.map((lesson, index) => (
       <Link
        key={lesson.slug}
        href={`/learn/${params.category}/${lesson.slug}`}
        className="block hover:bg-muted/50 transition-colors"
       >
        <div className="flex items-center gap-4 p-5">
         <span className="text-sm font-mono text-muted-foreground w-6 text-right shrink-0">
          {index + 1}
         </span>
         <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground mb-1">
           {lesson.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-1">
           {lesson.description}
          </p>
         </div>
         <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-muted-foreground flex items-center gap-1 hidden sm:flex">
           <Clock className="h-3 w-3" />
           {lesson.readTime}
          </span>
          <Badge variant="secondary" className={`text-[10px] uppercase ${difficultyColors[lesson.difficulty] || ''}`}>
           {lesson.difficulty}
          </Badge>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
         </div>
        </div>
       </Link>
      ))}
     </div>

     {lessons.length === 0 && (
      <div className="text-center py-16 text-muted-foreground">
       <p className="text-lg mb-2">Lessons coming soon.</p>
       <p className="text-sm">We are writing high-quality content for this track.</p>
      </div>
     )}

     <div className="mt-8">
      <Link
       href="/learn"
       className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
      >
       <ArrowLeft className="h-3 w-3" />
       All tracks
      </Link>
     </div>
    </div>
   </main>
  </div>
 );
}
