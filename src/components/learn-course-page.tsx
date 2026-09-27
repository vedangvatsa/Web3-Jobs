import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, Clock, ArrowLeft } from 'lucide-react';
import { getCategory, getLessons } from '@/lib/learn';
import { getLessonPath } from '@/lib/learn-routes';
import { PageHeader } from '@/components/page-header';
import { PageShell } from '@/components/page-shell';
import { Badge } from '@/components/ui/badge';

export default function LearnCoursePage({ categorySlug }: { categorySlug: string }) {
  const category = getCategory(categorySlug);
  if (!category) notFound();
  const lessons = getLessons(categorySlug);
  return (
    <main className="min-h-screen" id="main-content">
      <PageShell>
        <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/learn" className="hover:text-foreground">Learn</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-medium text-foreground">{category.title}</span>
        </nav>
        <PageHeader title={category.title} description={category.description} />
        <p className="mb-6 text-sm text-muted-foreground">{lessons.length} lessons</p>
        <div className="divide-y overflow-hidden rounded-lg border bg-background">
          {lessons.map((lesson, index) => (
            <Link key={lesson.slug} href={getLessonPath(categorySlug, lesson.slug)} className="block hover:bg-muted/50">
              <div className="flex items-center gap-4 p-5">
                <span className="w-6 shrink-0 text-right font-mono text-sm text-muted-foreground">{index + 1}</span>
                <div className="min-w-0 flex-1">
                  <h2 className="mb-1 font-medium">{lesson.title}</h2>
                  <p className="line-clamp-1 text-sm text-muted-foreground">{lesson.description}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex"><Clock className="h-3 w-3" />{lesson.readTime}</span>
                  <Badge variant="secondary" className="hidden text-[10px] uppercase sm:inline-flex">{lesson.difficulty}</Badge>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </Link>
          ))}
        </div>
        <Link href="/learn" className="mt-8 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-3 w-3" />All tracks</Link>
      </PageShell>
    </main>
  );
}
