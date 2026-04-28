import { cn } from '@/lib/utils';

export function ArticleContent({ content, className }: { content: string; className?: string }) {
 return (
  <div
   className={cn(
    "article-prose",
    "prose prose-lg dark:prose-invert max-w-none",
    // Headings: sans font, tight tracking, strong weight
    "prose-headings:font-headline prose-headings:tracking-tight prose-headings:text-zinc-900 dark:prose-headings:text-zinc-50",
    "prose-h2:text-2xl prose-h2:sm:text-3xl prose-h2:font-bold prose-h2:mt-16 prose-h2:mb-5",
    "prose-h3:text-xl prose-h3:sm:text-2xl prose-h3:font-bold prose-h3:mt-12 prose-h3:mb-4",
    "prose-h4:text-lg prose-h4:font-bold prose-h4:mt-8 prose-h4:mb-3",
    // Body: clean, readable, generous line height
    "prose-p:text-[15px] prose-p:sm:text-base prose-p:text-zinc-600 dark:prose-p:text-zinc-400 prose-p:leading-[1.85] prose-p:mb-5",
    // Links: subtle underline with transition
    "prose-a:text-zinc-900 dark:prose-a:text-zinc-100 prose-a:underline prose-a:underline-offset-2 prose-a:decoration-zinc-300 dark:prose-a:decoration-zinc-600 hover:prose-a:decoration-indigo-400 prose-a:transition-colors prose-a:no-underline",
    // Lists: clean spacing
    "prose-li:text-[15px] prose-li:sm:text-base prose-li:text-zinc-600 dark:prose-li:text-zinc-400 prose-li:leading-[1.85] prose-li:mb-1",
    "prose-ul:my-5 prose-ol:my-5",
    // Strong/bold
    "prose-strong:text-zinc-900 dark:prose-strong:text-zinc-100 prose-strong:font-semibold",
    // Code
    "prose-code:text-sm prose-code:bg-zinc-100 dark:prose-code:bg-zinc-800/60 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:font-normal",
    "prose-pre:bg-zinc-950 dark:prose-pre:bg-zinc-900/60 prose-pre:border prose-pre:border-zinc-200 dark:prose-pre:border-zinc-800/40 prose-pre:rounded-lg",
    // Blockquote: elegant left-border callout
    "prose-blockquote:border-l-2 prose-blockquote:border-zinc-900 dark:prose-blockquote:border-zinc-100 prose-blockquote:pl-6 prose-blockquote:py-2 prose-blockquote:my-10 prose-blockquote:not-italic",
    "prose-blockquote:text-lg prose-blockquote:sm:text-xl prose-blockquote:font-serif prose-blockquote:text-zinc-800 dark:prose-blockquote:text-zinc-200 prose-blockquote:leading-relaxed",
    // Images
    "prose-img:rounded-lg prose-img:shadow-sm prose-img:border prose-img:border-zinc-200 dark:prose-img:border-zinc-800/40",
    // HR
    "prose-hr:border-zinc-200 dark:prose-hr:border-zinc-800/50 prose-hr:my-12",
    className
   )}
   dangerouslySetInnerHTML={{ __html: content }}
  />
 );
}
