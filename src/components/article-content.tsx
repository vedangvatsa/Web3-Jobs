'use client';

import DOMPurify from 'isomorphic-dompurify';

export function ArticleContent({ content }: { content: string }) {
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
      className="prose prose-lg dark:prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
}
