
'use client';

import type { ArticleContent } from '@/types';
import { CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import { Fragment } from 'react';

function renderTextOrLink(child: any, childIndex: number) {
  if (child.type === 'link') {
    return (
      <a key={childIndex} href={child.href} target="_blank" rel="noopener noreferrer">
        {child.value}
      </a>
    );
  }

  if (child.style === 'bold') {
    return <strong key={childIndex}>{child.value}</strong>;
  }

  if (child.style === 'italic') {
    return <em key={childIndex}>{child.value}</em>;
  }

  return <Fragment key={childIndex}>{child.value}</Fragment>;
}

// Function to render content based on the structured data
export function ArticleRenderer({ content }: { content: ArticleContent }) {
  if (!content) return null;

  return content.map((block, index) => {
    switch (block.type) {
      case 'p':
        return (
          <p key={index}>
            {block.children.map(renderTextOrLink)}
          </p>
        );
      case 'h2':
        return (
          <h2 key={index} id={block.children.map(c => c.value).join('').toLowerCase().replace(/\s+/g, '-').replace(/[?]/g, '')}>
            {block.children.map(renderTextOrLink)}
          </h2>
        );
      case 'h3':
        return (
          <h3 key={index} id={block.children.map(c => c.value).join('').toLowerCase().replace(/\s+/g, '-').replace(/[?]/g, '')}>
            {block.children.map(renderTextOrLink)}
          </h3>
        );
      case 'ul':
        return (
          <ul key={index} className="space-y-4 my-6">
            {block.children.map((li, liIndex) => (
              <li key={liIndex} className="flex gap-x-4">
                 <CheckCircle2 className="mt-1 h-6 w-6 flex-none text-primary" aria-hidden="true" />
                 <span className="flex-1">
                  {li.children.map(renderTextOrLink)}
                 </span>
              </li>
            ))}
          </ul>
        );
      case 'blockquote':
        return (
          <blockquote key={index}>
             {block.children.map((child, childIndex) => (
                <p key={childIndex}>{child.children.map(renderTextOrLink)}</p>
             ))}
          </blockquote>
        );
      case 'image':
        return (
          <figure key={index} className="my-8">
            <Image
              src={block.src}
              alt={block.alt}
              width={800}
              height={450}
              className="w-full h-auto rounded-lg shadow-md"
              data-ai-hint={block['data-ai-hint']}
            />
            {block.caption && (
              <figcaption className="text-center text-sm text-muted-foreground mt-2">
                {block.caption}
              </figcaption>
            )}
          </figure>
        )
      default:
        return null;
    }
  });
}
