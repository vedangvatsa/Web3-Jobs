'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';

interface ChecklistItem {
  title?: string;
  task?: string;
  text?: string;
  description?: string;
  priority: 'critical' | 'important' | 'nice-to-have';
}

interface ChecklistSection {
  heading: string;
  description: string;
  items: ChecklistItem[];
}

interface ChecklistContentProps {
  sections: ChecklistSection[];
  slug: string;
}

export function ChecklistContent({ sections, slug }: ChecklistContentProps) {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`checklist-${slug}`);
      if (saved) setChecked(new Set(JSON.parse(saved)));
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }, [slug]);

  useEffect(() => {
    try {
      localStorage.setItem(`checklist-${slug}`, JSON.stringify([...checked]));
    } catch {
      // Ignore storage errors
    }
  }, [checked, slug]);

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const total = sections.reduce((acc, section) => acc + section.items.length, 0);
  const done = checked.size;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="space-y-12">
      <div className="sticky top-14 z-10 bg-background/95 backdrop-blur-sm py-3 border-b border-border mb-6">
        <div className="flex items-center justify-between text-xs font-mono mb-2">
          <span>
            {done} of {total} completed ({pct}%)
          </span>
          {done > 0 && (
            <button
              onClick={() => setChecked(new Set())}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Reset
            </button>
          )}
        </div>
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {sections.map((section, sectionIndex) => (
        <section key={sectionIndex}>
          <h2 className="text-lg font-bold tracking-tight text-foreground mb-1">
            {section.heading}
          </h2>
          {section.description && (
            <p className="text-sm text-muted-foreground mb-4">{section.description}</p>
          )}

          <div className="space-y-2">
            {section.items.map((item, itemIndex) => {
              const id = `${sectionIndex}-${itemIndex}`;
              const isChecked = checked.has(id);
              const itemTitle = item.title || item.task || item.text || '';

              return (
                <label
                  key={itemIndex}
                  className={`flex items-start gap-3 p-3.5 border rounded-lg cursor-pointer transition-colors ${
                    isChecked
                      ? 'bg-muted/30 border-border/50 text-muted-foreground'
                      : 'bg-card border-border hover:bg-muted/20'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggle(id)}
                    className="mt-0.5 h-4 w-4 rounded border-border accent-primary cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className={`text-sm font-medium ${
                          isChecked ? 'line-through' : 'text-foreground'
                        }`}
                      >
                        {itemTitle}
                      </span>
                      {item.priority && (
                        <Badge
                          variant="outline"
                          className="text-[10px] uppercase font-mono tracking-wider"
                        >
                          {item.priority}
                        </Badge>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-xs text-muted-foreground leading-relaxed">
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
