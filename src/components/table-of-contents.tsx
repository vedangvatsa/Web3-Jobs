
'use client';

import { ArticleContent } from "@/types";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TocEntry {
  level: number;
  id: string;
  title: string;
}

export function TableOfContents({ content }: { content: ArticleContent }) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const headings = content
    .filter(block => block.type === 'h2' || block.type === 'h3')
    .map(block => {
      if (block.type === 'h2' || block.type === 'h3') {
        const title = block.children.map(c => c.value).join('');
        const id = title.toLowerCase().replace(/\s+/g, '-').replace(/[?]/g, '');
        return {
          level: block.type === 'h2' ? 2 : 3,
          id,
          title
        };
      }
      return null;
    }).filter((h): h is TocEntry => h !== null);

  useEffect(() => {
    const handleScroll = () => {
      let currentId: string | null = null;
      for (let i = headings.length - 1; i >= 0; i--) {
        const heading = headings[i];
        const element = document.getElementById(heading.id);
        if (element && element.getBoundingClientRect().top < 150) {
          currentId = heading.id;
          break;
        }
      }
      setActiveId(currentId);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); 

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [headings]);
  
  return (
    <nav>
      <ul className="space-y-2">
        {headings.map(heading => (
          <li key={heading.id} className={cn(
              "text-sm text-muted-foreground hover:text-foreground transition-colors",
              heading.level === 3 && "pl-4",
              activeId === heading.id && "text-primary font-semibold"
          )}>
            <a href={`#${heading.id}`}
              onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(heading.id)?.scrollIntoView({
                      behavior: "smooth",
                      block: "start"
                  });
              }}
            >
              {heading.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
