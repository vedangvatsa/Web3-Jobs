'use client';

import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePill } from '@/components/date-pill';
import { trackNewsClick } from '@/lib/posthog';
import { getEventDatePill } from '@/lib/events';
import type { NewsItem } from '@/types';

export function NewsCard({ item }: { item: NewsItem }) {
  const datePill = getEventDatePill(item.pubDate);
  const showSource = Boolean(item.source && item.source !== 'Hashtag Web3');
  const isExternal = item.link.startsWith('http');

  return (
    <a
      href={item.link}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      onClick={() => trackNewsClick(item.title, item.link, item.source)}
      className="group block h-full"
    >
      <Card className="flex h-full flex-col border-border/70 bg-card shadow-none transition-colors hover:border-foreground/25">
        <CardHeader className="px-4 pb-3 pt-4">
          <div className="flex items-center gap-3">
            <DatePill month={datePill.month} day={datePill.day} />
            <div className="min-w-0">
              <CardTitle
                className="line-clamp-2 text-base font-semibold leading-snug transition-colors group-hover:text-primary"
                title={item.title}
              >
                {item.title}
              </CardTitle>
              {showSource && (
                <p className="mt-0.5 truncate text-xs text-muted-foreground" title={item.source}>
                  {item.source}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>
    </a>
  );
}
