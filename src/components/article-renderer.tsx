
'use client';

import type { Article } from '@/types';
import { CheckCircle2 } from 'lucide-react';
import { Fragment } from 'react';

// Function to render content based on the structured data
export function ArticleRenderer({ content }: { content: Article['content'] }) {
  if (!content) return null;

  return content.map((block, index) => {
    switch (block.type) {
      case 'p':
        return (
          <p key={index} className="mb-6">
            {block.children.map((child, childIndex) => {
              if (child.type === 'link') {
                return (
                  <a key={childIndex} href={child.href} target="_blank" rel="noopener noreferrer">
                    {child.value}
                  </a>
                );
              }
              return <Fragment key={childIndex}>{child.value}</Fragment>;
            })}
          </p>
        );
      case 'h2':
        return (
          <h2 key={index}>
            {block.children.map(child => child.value).join('')}
          </h2>
        );
      case 'h3':
        return (
          <h3 key={index}>
            {block.children.map(child => child.value).join('')}
          </h3>
        );
      case 'ul':
        return (
          <ul key={index} className="space-y-4 my-6">
            {block.children.map((li, liIndex) => (
              <li key={liIndex} className="flex gap-x-4">
                 <CheckCircle2 className="mt-1 h-6 w-6 flex-none text-primary" aria-hidden="true" />
                 <span className="flex-1">
                 {li.children.map((child, childIndex) => {
                    if (child.type === 'link') {
                      return (
                        <a key={childIndex} href={child.href} target="_blank" rel="noopener noreferrer">
                          {child.value}
                        </a>
                      );
                    }
                    return <Fragment key={childIndex}>{child.value}</Fragment>;
                  })}
                  </span>
              </li>
            ))}
          </ul>
        );
      default:
        return null;
    }
  });
}
