
'use client';

export function ArticleContent({ content }: { content: string }) {
  return (
    <div
      className="prose prose-lg dark:prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
