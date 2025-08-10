
'use client';

import type { Article } from '@/types';
import { Fragment } from 'react';

// Function to render content based on the structured data
export function ArticleRenderer({ content }: { content: Article['content'] }) {
  if (!content) return null;

  return content.map((block, index) => {
    switch (block.type) {
      case 'p':
        return (
          <p key={index}>
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
          <ul key={index}>
            {block.children.map((li, liIndex) => (
              <li key={liIndex}>
                 {li.children.map((child, childIndex) => {
                    if (child.type === 'link') {
                      return (
                        <a key={childIndex} href={child.href} target="_blank" rel="noopener noreferrer">
                          {child.value}
                        </a>
                      );
                    }
                     if (child.type === 'icon') {
                        // Icons are handled by prose list styling now
                        return null;
                    }
                    return <Fragment key={childIndex}>{child.value}</Fragment>;
                  })}
              </li>
            ))}
          </ul>
        );
      default:
        return null;
    }
  });
}
