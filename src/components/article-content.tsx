import { cn } from '@/lib/utils';

export function ArticleContent({ content, className }: { content: string; className?: string }) {
  return (
    <div
      className={cn("prose prose-lg dark:prose-invert max-w-none", className)}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
