'use client';

import { Header } from '@/components/header';
import Link from 'next/link';
import type { ResourcePage, IdeaItem, ChecklistItem, MistakeItem, ToolItem } from '@/types/pseo';
import { useState, useEffect } from 'react';

interface ResourcePageViewProps {
  page: ResourcePage;
  nicheResources?: ResourcePage[];
}

// Simple date formatter
function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Convert resource title to slug
function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Detect links in text and convert to anchor tags
function linkify(text: string): string {
  // Match URLs and convert to links
  const urlPattern = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlPattern, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">$1</a>');
}

export function ResourcePageView({ page, nicheResources }: ResourcePageViewProps) {
  const contentType = page.meta.contentType;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <article className="container mx-auto px-4 py-12 max-w-4xl">
          {/* Breadcrumb */}
          <nav className="mb-8 text-sm text-muted-foreground">
            <Link href="/resources" className="hover:text-foreground">
              Resources
            </Link>
            <span className="mx-2">/</span>
            <span className="capitalize">{contentType}</span>
          </nav>

          {/* Header */}
          <header className="mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
              {page.seo.title}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              {page.content.intro}
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span>For: <strong className="text-foreground capitalize">{page.meta.niche.replace(/-/g, ' ')}</strong></span>
              <span>•</span>
              <span>Updated: {formatDate(page.meta.generatedAt)}</span>
            </div>
          </header>

          {/* Content based on type */}
          {contentType === 'ideas' && <IdeasContent sections={page.content.sections as any} />}
          {contentType === 'checklists' && <ChecklistContent sections={page.content.sections as any} slug={page.seo.canonicalSlug} />}
          {contentType === 'mistakes' && <MistakesContent sections={page.content.sections as any} />}
          {contentType === 'tools' && <ToolsContent sections={page.content.sections as any} />}
          
          {/* Default fallback for other types */}
          {!['ideas', 'checklists', 'mistakes', 'tools'].includes(contentType) && (
            <DefaultContent sections={page.content.sections} />
          )}

          {/* Pro Tips */}
          {(page.content.proTips?.length ?? 0) > 0 && (
            <section className="mt-16 pt-8 border-t">
              <h2 className="text-xl font-semibold mb-6">Tips from the field</h2>
              <ul className="space-y-4">
                {page.content.proTips?.map((tip, idx) => (
                  <li key={idx} className="flex gap-4">
                    <span className="text-muted-foreground font-mono text-sm">{idx + 1}.</span>
                    <p className="text-muted-foreground">{tip}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Conclusion */}
          {page.content.conclusion && (
            <section className="mt-12 p-6 bg-muted/30 rounded-lg">
              <p className="text-muted-foreground">{page.content.conclusion}</p>
            </section>
          )}

          {/* Related */}
          {(page.content.relatedResources?.length ?? 0) > 0 && (
            <section className="mt-12">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">Related reading</h3>
              <ul className="space-y-2">
                {page.content.relatedResources.map((resource, idx) => {
                  // Support both {title, slug} objects and plain strings
                  const label = typeof resource === 'object' ? (resource as any).title : resource;
                  const slug = typeof resource === 'object' ? (resource as any).slug : titleToSlug(resource);
                  return (
                    <li key={idx} className="text-sm">
                      <span className="text-muted-foreground">→</span>{' '}
                      <Link href={`/${slug}`} className="text-foreground hover:text-primary hover:underline">
                        {label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {/* More resources for this niche */}
          {nicheResources && nicheResources.length > 0 && (
            <section className="mt-12 pt-8 border-t">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">
                More for <span className="capitalize">{page.meta.niche.replace(/-/g, ' ')}</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {nicheResources.map((r) => (
                  <Link
                    key={r.seo.canonicalSlug}
                    href={`/${r.seo.canonicalSlug}`}
                    className="text-sm px-3 py-1.5 border rounded-md hover:bg-muted/50 transition-colors"
                  >
                    {r.seo.title}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Back link */}
          <div className="mt-16 pt-8 border-t">
            <Link href="/resources" className="text-sm text-muted-foreground hover:text-foreground">
              ← Back to resources
            </Link>
          </div>
        </article>
      </main>
    </div>
  );
}

// Ideas content - clean table-style layout
function IdeasContent({ sections }: { sections: Array<{ heading: string; description: string; items: IdeaItem[] }> }) {
  return (
    <div className="space-y-12">
      {sections.map((section, idx) => (
        <section key={idx}>
          <h2 className="text-2xl font-semibold mb-2">{section.heading}</h2>
          <p className="text-muted-foreground mb-6">{section.description}</p>
          
          <div className="space-y-4">
            {section.items.map((item, itemIdx) => (
              <div key={itemIdx} className="p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="font-medium">{item.title}</h3>
                  <div className="flex gap-2 text-xs shrink-0">
                    <span className={`px-2 py-0.5 rounded ${
                      item.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                      item.difficulty === 'intermediate' ? 'bg-blue-100 text-blue-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {item.difficulty}
                    </span>
                    <span className="text-muted-foreground">{item.timeToComplete}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

// Checklist content - interactive with local storage
function ChecklistContent({ sections, slug }: { sections: Array<{ heading: string; description: string; items: ChecklistItem[] }>; slug: string }) {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  useEffect(() => {
    const saved = localStorage.getItem(`checklist-${slug}`);
    if (saved) setChecked(new Set(JSON.parse(saved)));
  }, [slug]);

  useEffect(() => {
    localStorage.setItem(`checklist-${slug}`, JSON.stringify([...checked]));
  }, [checked, slug]);

  const toggle = (id: string) => {
    setChecked(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const total = sections.reduce((acc, s) => acc + s.items.length, 0);
  const done = checked.size;

  return (
    <div className="space-y-12">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{done} of {total} complete</span>
        {done > 0 && (
          <button onClick={() => setChecked(new Set())} className="hover:text-foreground">
            Reset
          </button>
        )}
      </div>

      {sections.map((section, sIdx) => (
        <section key={sIdx}>
          <h2 className="text-2xl font-semibold mb-2">{section.heading}</h2>
          <p className="text-muted-foreground mb-6">{section.description}</p>
          
          <div className="space-y-2">
            {section.items.map((item, iIdx) => {
              const id = `${sIdx}-${iIdx}`;
              const isChecked = checked.has(id);
              
              return (
                <label
                  key={iIdx}
                  className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                    isChecked ? 'bg-muted/50 border-muted' : 'hover:bg-muted/30'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggle(id)}
                    className="mt-1 h-4 w-4 rounded border-gray-300"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-medium ${isChecked ? 'line-through text-muted-foreground' : ''}`}>
                        {item.title ?? (item as any).text}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        item.priority === 'critical' ? 'bg-red-100 text-red-800' :
                        item.priority === 'important' ? 'bg-amber-100 text-amber-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {item.priority}
                      </span>
                    </div>
                    {item.description && (
                      <p className={`text-sm ${isChecked ? 'text-muted-foreground/50' : 'text-muted-foreground'}`}>
                        {item.description}
                      </p>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

// Mistakes content - problem/solution format
function MistakesContent({ sections }: { sections: Array<{ heading: string; description: string; items: MistakeItem[] }> }) {
  return (
    <div className="space-y-12">
      {sections.map((section, idx) => (
        <section key={idx}>
          <h2 className="text-2xl font-semibold mb-2">{section.heading}</h2>
          <p className="text-muted-foreground mb-6">{section.description}</p>
          
          <div className="space-y-6">
            {section.items.map((item, itemIdx) => (
              <div key={itemIdx} className="border-l-2 border-muted pl-6">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-medium">{item.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    item.severity === 'critical' ? 'bg-red-100 text-red-800' :
                    item.severity === 'major' ? 'bg-amber-100 text-amber-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {item.severity}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{item.mistake}</p>
                <div className="text-sm space-y-2">
                  <p><strong className="text-foreground">What happens:</strong> {item.consequence}</p>
                  <p><strong className="text-foreground">Fix:</strong> {item.solution}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

// Tools content - simple list with links
function ToolsContent({ sections }: { sections: Array<{ heading: string; description: string; items: ToolItem[] }> }) {
  return (
    <div className="space-y-12">
      {sections.map((section, idx) => (
        <section key={idx}>
          <h2 className="text-2xl font-semibold mb-2">{section.heading}</h2>
          <p className="text-muted-foreground mb-6">{section.description}</p>
          
          <div className="grid gap-4 sm:grid-cols-2">
            {section.items.map((item, itemIdx) => (
              <a
                key={itemIdx}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 border rounded-lg hover:bg-muted/30 transition-colors group"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-medium group-hover:text-primary">{item.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded shrink-0 ${
                    item.pricing?.toLowerCase() === 'free' ? 'bg-green-100 text-green-800' :
                    item.pricing?.toLowerCase() === 'freemium' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {item.pricing}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </a>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

// Default content for other types
function DefaultContent({ sections }: { sections: Array<{ heading: string; description: string; items: any[] }> }) {
  return (
    <div className="space-y-12">
      {sections.map((section, idx) => (
        <section key={idx}>
          <h2 className="text-2xl font-semibold mb-2">{section.heading}</h2>
          <p className="text-muted-foreground mb-6">{section.description}</p>
          
          <div className="space-y-4">
            {section.items.map((item, itemIdx) => (
              <div key={itemIdx} className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">{item.title || item.name || item.skill}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
