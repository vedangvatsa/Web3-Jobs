'use client';

import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import type { Hackathon } from '@/types';
import { Trophy, Calendar, MapPin, ExternalLink } from 'lucide-react';

export function HackathonCard({ hackathon }: { hackathon: Hackathon }) {
  return (
    <a
      href={hackathon.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block h-full min-w-0 group"
    >
      <Card className="flex h-full min-w-0 flex-col justify-between border-border/70 bg-card shadow-none transition-colors hover:border-foreground/25">
        <CardHeader className="p-4 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-2 min-w-0">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-primary truncate">
              {hackathon.organizer}
            </span>
            {hackathon.featured && (
              <span className="shrink-0 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400 border border-amber-500/20">
                Featured
              </span>
            )}
          </div>

          <CardTitle
            className="text-base leading-snug font-semibold line-clamp-2 group-hover:text-primary transition-colors"
            title={hackathon.title}
          >
            {hackathon.title}
          </CardTitle>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground pt-1">
            <div className="flex items-center gap-1 font-medium text-foreground">
              <Trophy className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              <span className="truncate">{hackathon.prizePool}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{hackathon.location}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{hackathon.submissionPeriod}</span>
            </div>
          </div>
        </CardHeader>

        <div className="px-4 py-2 bg-muted/20 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
          <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground truncate max-w-[150px]">
            {hackathon.ecosystem}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary group-hover:underline">
            Apply <ExternalLink className="h-3 w-3" />
          </span>
        </div>
      </Card>
    </a>
  );
}
