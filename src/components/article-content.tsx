'use client';

import DOMPurify from 'isomorphic-dompurify';
import { cn } from '@/lib/utils';

export function ArticleContent({ content, className }: { content: string; className?: string }) {
  const sanitizedContent = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'a', 'img', 'table',
      'thead', 'tbody', 'tr', 'th', 'td', 'hr', 'div', 'span'
    ],
    ALLOWED_ATTR: ['href', 'title', 'alt', 'src', 'target', 'rel', 'class'],
    KEEP_CONTENT: true,
  });

  return (
    <div
      className={cn("prose prose-lg dark:prose-invert max-w-none", className)}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
}
