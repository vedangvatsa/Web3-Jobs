'use client';

import type { Hackathon } from '@/types';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Calendar } from 'lucide-react';

export function HackathonCard({ hackathon }: { hackathon: Hackathon }) {
  // Generate ecosystem badge initials or short mark for the 40x40 container
  const ecoInitial = hackathon.ecosystem ? hackathon.ecosystem.slice(0, 2).toUpperCase() : 'W3';

  return (
    <a
      href={hackathon.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block h-full min-w-0"
    >
      <Card className="flex h-full min-w-0 flex-col border-border/70 bg-card shadow-none hover:border-foreground/25">
        <CardHeader className="px-4 pb-3 pt-4 min-w-0">
          <div className="flex min-w-0 items-start gap-3">
            <div className="h-10 w-10 shrink-0 rounded-md border border-border/60 bg-muted/40 flex items-center justify-center overflow-hidden font-bold text-xs text-foreground uppercase tracking-wider">
              {ecoInitial}
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle
                className="text-base leading-snug font-semibold line-clamp-2"
                title={hackathon.title}
              >
                {hackathon.title}
              </CardTitle>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {hackathon.organizer}
              </p>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground truncate">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                  {hackathon.prizePool}
                </span>
                <span className="text-muted-foreground/60 shrink-0">•</span>
                <span className="truncate">{hackathon.format}</span>
                {hackathon.submissionPeriod && (
                  <>
                    <span className="text-muted-foreground/60 shrink-0">•</span>
                    <span className="truncate">{hackathon.submissionPeriod}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>
    </a>
  );
}
