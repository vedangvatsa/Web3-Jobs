import { Quiz } from '@/components/quiz';
import { getCategory, getLesson, getLessons, getAdjacentLessons } from '@/lib/learn';
import { PageHeader } from "@/components/page-header";
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Clock, ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface Props {
 params: { category: string; slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
 const lesson = getLesson(params.category, params.slug);
 if (!lesson) return {};
 const category = getCategory(params.category);
 const siteUrl = 'https://hashtagweb3.com';
 const pageTitle = `${lesson.title} - ${category?.title || 'Learn'}`;
 const ogImageUrl = `${siteUrl}/api/og?type=article&title=${encodeURIComponent(lesson.title)}&category=${encodeURIComponent(category?.title || 'Learn Web3')}`;
 return {
  title: pageTitle,
  description: lesson.description,
  alternates: { canonical: `https://hashtagweb3.com/learn/${params.category}/${params.slug}` },
  openGraph: {
   title: pageTitle,
   description: lesson.description,
   url: `https://hashtagweb3.com/learn/${params.category}/${params.slug}`,
   type: 'article',
   images: [{ url: ogImageUrl, width: 1200, height: 630, alt: lesson.title }],
  },
  twitter: {
   card: 'summary_large_image',
   title: pageTitle,
   description: lesson.description,
   images: [ogImageUrl],
  },
 };
}

export async function generateStaticParams() {
 const { getCategories } = await import('@/lib/learn');
 const categories = getCategories();
 const params: { category: string; slug: string }[] = [];
 for (const cat of categories) {
  const lessons = getLessons(cat.slug);
  for (const lesson of lessons) {
   params.push({ category: cat.slug, slug: lesson.slug });
  }
 }
 return params;
}

const difficultyColors: Record<string, string> = {
 beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
 intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
 advanced: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export default function LessonPage({ params }: Props) {
 const lesson = getLesson(params.category, params.slug);
 if (!lesson) notFound();

 const category = getCategory(params.category);
 const allLessons = getLessons(params.category);
 const { prev, next } = getAdjacentLessons(params.category, params.slug);

 // Convert markdown to simple HTML (headings, paragraphs, bold, lists, code)
 const htmlContent = markdownToHtml(lesson.content);

 return (
  <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
    <div className="container mx-auto px-4 page-section max-w-6xl">
     <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
      {/* Sidebar */}
      <aside className="hidden lg:block w-56 shrink-0">
       <div className="sticky top-24">
        <Link
         href={`/learn/${params.category}`}
         className="text-sm font-semibold text-foreground mb-4 block"
        >
         {category?.title}
        </Link>
        <nav className="space-y-0.5">
         {allLessons.map((l) => (
          <Link
           key={l.slug}
           href={`/learn/${params.category}/${l.slug}`}
           className={`block text-sm py-2 px-3 rounded-md transition-colors ${
            l.slug === params.slug
             ? 'bg-primary/10 text-primary font-medium border-l-2 border-primary'
             : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
           }`}
          >
           {l.title}
          </Link>
         ))}
        </nav>
       </div>
      </aside>

      {/* Content */}
      <article className="flex-1 min-w-0 max-w-4xl">
       {/* Breadcrumb */}
       <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/learn" className="hover:text-foreground transition-colors">Learn</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href={`/learn/${params.category}`} className="hover:text-foreground transition-colors">
         {category?.title}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{lesson.title}</span>
       </nav>

       <PageHeader title={lesson.title} />

       <div className="flex items-center gap-3 mb-8 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
         <Clock className="h-3.5 w-3.5" />
         {lesson.readTime}
        </span>
        <Badge variant="secondary" className={`text-[10px] uppercase ${difficultyColors[lesson.difficulty] || ''}`}>
         {lesson.difficulty}
        </Badge>
       </div>

       {/* Rendered content */}
       <div
        className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-p:leading-7 prose-p:mb-4 prose-li:leading-7 prose-strong:font-semibold prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-muted prose-pre:border prose-pre:rounded-lg [&_svg]:mx-auto [&_svg]:my-8 [&_svg]:block [&_.diagram]:my-8 [&_.diagram]:p-6 [&_.diagram]:bg-muted/30 [&_.diagram]:border [&_.diagram]:rounded-lg [&_.callout]:my-6 [&_.callout]:p-4 [&_.callout]:border-l-4 [&_.callout]:border-primary [&_.callout]:bg-primary/5 [&_.callout]:rounded-r-lg [&_.comparison-table]:my-8 [&_.comparison-table_table]:w-full [&_table]:w-full [&_table]:border-collapse [&_th]:text-left [&_th]:p-3 [&_th]:border-b-2 [&_th]:font-semibold [&_td]:p-3 [&_td]:border-b"
       dangerouslySetInnerHTML={{ __html: htmlContent }}
       />

       {/* Quiz */}
       {lesson.quiz.length > 0 && (
        <Quiz questions={lesson.quiz} title={`Quiz: ${lesson.title}`} />
       )}

       {/* Prev/Next navigation */}
       <div className="flex items-center justify-between mt-12 pt-8 border-t gap-4">
        {prev ? (
         <Link
          href={`/learn/${params.category}/${prev.slug}`}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
         >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <div>
           <div className="text-xs text-muted-foreground">Previous</div>
           <div className="font-medium text-foreground">{prev.title}</div>
          </div>
         </Link>
        ) : <div />}
        {next ? (
         <Link
          href={`/learn/${params.category}/${next.slug}`}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group text-right"
         >
          <div>
           <div className="text-xs text-muted-foreground">Next</div>
           <div className="font-medium text-foreground">{next.title}</div>
          </div>
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
         </Link>
        ) : <div />}
       </div>
      </article>
     </div>
    </div>
   </main>
  </div>
 );
}

/**
 * Markdown-to-HTML converter.
 * Supports: headings, paragraphs, bold, italic, inline code,
 * code blocks, nested lists (indented with spaces), links, tables, and raw HTML/SVG passthrough.
 */
function markdownToHtml(md: string): string {
  const lines = md.split('\n');
  let html = '';
  let inCodeBlock = false;
  let inTable = false;
  let inHtmlBlock = false;
  let htmlBlockContent = '';

  // Nested list state: stack of { type, indent }
  const listStack: Array<{ type: 'ul' | 'ol'; indent: number }> = [];

  function closeListsDownTo(targetIndent: number) {
    while (listStack.length > 0 && listStack[listStack.length - 1].indent > targetIndent) {
      const popped = listStack.pop()!;
      html += `</${popped.type}>\n`;
    }
  }

  function closeAllLists() {
    while (listStack.length > 0) {
      const popped = listStack.pop()!;
      html += `</${popped.type}>\n`;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Raw HTML/SVG blocks (pass through)
    if (!inHtmlBlock && /^<(div|svg|table|figure|section|aside)\b/.test(line.trim())) {
      closeAllLists();
      inHtmlBlock = true;
      htmlBlockContent = line;
      const tagMatch = line.trim().match(/^<(\w+)/);
      if (tagMatch && line.includes(`</${tagMatch[1]}>`)) {
        html += line + '\n';
        inHtmlBlock = false;
        htmlBlockContent = '';
      }
      continue;
    }
    if (inHtmlBlock) {
      htmlBlockContent += '\n' + line;
      if (/<\/(div|svg|table|figure|section|aside)>\s*$/.test(line.trim())) {
        html += htmlBlockContent + '\n';
        inHtmlBlock = false;
        htmlBlockContent = '';
      }
      continue;
    }

    // Code blocks
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        html += '</code></pre>\n';
        inCodeBlock = false;
      } else {
        closeAllLists();
        const lang = line.trim().slice(3).trim();
        html += `<pre><code class="language-${lang || 'text'}">`;
        inCodeBlock = true;
      }
      continue;
    }
    if (inCodeBlock) {
      html += escapeHtml(line) + '\n';
      continue;
    }

    // Detect list item (unordered or ordered) with indentation
    const ulMatch = line.match(/^(\s*)[-*]\s+(.*)/);
    const olMatch = line.match(/^(\s*)\d+\.\s+(.*)/);
    const listMatch = ulMatch || olMatch;

    if (listMatch) {
      const indent = listMatch[1].length;
      const content = listMatch[2];
      const type: 'ul' | 'ol' = ulMatch ? 'ul' : 'ol';

      if (listStack.length === 0) {
        // Start first list
        html += `<${type}>\n`;
        listStack.push({ type, indent });
      } else {
        const current = listStack[listStack.length - 1];
        if (indent > current.indent) {
          // Go deeper — open nested list
          html += `<${type}>\n`;
          listStack.push({ type, indent });
        } else if (indent < current.indent) {
          // Go shallower — close until matching level
          closeListsDownTo(indent);
          // If no matching level, ensure we're at the right one
          if (listStack.length === 0 || listStack[listStack.length - 1].indent !== indent) {
            html += `<${type}>\n`;
            listStack.push({ type, indent });
          }
        }
        // Same indent: stay in current list
      }

      html += `<li>${inlineFormat(content)}</li>\n`;
      continue;
    }

    // Table
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      closeAllLists();
      if (!inTable) {
        html += '<table>\n';
        inTable = true;
        const cells = line.split('|').filter(c => c.trim()).map(c => `<th>${inlineFormat(c.trim())}</th>`).join('');
        html += `<thead><tr>${cells}</tr></thead>\n<tbody>\n`;
        i++; // Skip separator row
        continue;
      }
      const cells = line.split('|').filter(c => c.trim()).map(c => `<td>${inlineFormat(c.trim())}</td>`).join('');
      html += `<tr>${cells}</tr>\n`;
      continue;
    }
    if (inTable && !line.trim().startsWith('|')) {
      html += '</tbody></table>\n';
      inTable = false;
    }

    // Empty line — close lists only if followed by a non-list line
    if (line.trim() === '') {
      // Peek ahead: if next non-empty line is NOT a list item, close lists
      let nextNonEmpty = '';
      for (let j = i + 1; j < lines.length; j++) {
        if (lines[j].trim() !== '') { nextNonEmpty = lines[j]; break; }
      }
      if (nextNonEmpty && !nextNonEmpty.match(/^\s*[-*]\s/) && !nextNonEmpty.match(/^\s*\d+\.\s/)) {
        closeAllLists();
      }
      continue;
    }

    // Close any open lists before headings/paragraphs
    closeAllLists();

    // Headings
    if (line.startsWith('## ')) {
      const text = line.slice(3).trim();
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      html += `<h2 id="${id}">${inlineFormat(text)}</h2>\n`;
      continue;
    }
    if (line.startsWith('### ')) {
      const text = line.slice(4).trim();
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      html += `<h3 id="${id}">${inlineFormat(text)}</h3>\n`;
      continue;
    }

    // Regular paragraph
    html += `<p>${inlineFormat(line)}</p>\n`;
  }

  // Close any open blocks
  closeAllLists();
  if (inTable) html += '</tbody></table>\n';
  if (inCodeBlock) html += '</code></pre>\n';

  return html;
}

function inlineFormat(text: string): string {
  return text
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

