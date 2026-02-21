'use client';

import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export function ArticleContent({ content, className }: { content: string; className?: string }) {
  const [sanitizedContent, setSanitizedContent] = useState('');

  useEffect(() => {
    // Only run DOMPurify in the browser
    if (typeof window !== 'undefined') {
      import('dompurify').then((DOMPurify) => {
        const clean = DOMPurify.default.sanitize(content, {
          ALLOWED_TAGS: [
            'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'a', 'img', 'table',
            'thead', 'tbody', 'tr', 'th', 'td', 'hr', 'div', 'span'
          ],
          ALLOWED_ATTR: ['href', 'title', 'alt', 'src', 'target', 'rel', 'class'],
          KEEP_CONTENT: true,
        });
        setSanitizedContent(clean);
      });
    }
  }, [content]);

  // Show unsanitized content during SSR, will be sanitized on client
  return (
    <div
      className={cn("prose prose-lg dark:prose-invert max-w-none", className)}
      dangerouslySetInnerHTML={{ __html: sanitizedContent || content }}
    />
  );
}
