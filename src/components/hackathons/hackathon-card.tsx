'use client';

import { ListingCard, ListingCardHeader, ListingCardTitle } from '@/components/listing-card';
import type { Hackathon } from '@/types';
import { Trophy, Calendar, MapPin, Globe } from 'lucide-react';

export function HackathonCard({ hackathon }: { hackathon: Hackathon }) {
  return (
    <ListingCard className="flex flex-col justify-between overflow-hidden group">
      <div>
        <ListingCardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                {hackathon.organizer}
              </span>
              <ListingCardTitle as="h2" className="mt-1 group-hover:text-primary transition-colors">
                <a
                  href={hackathon.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="after:absolute after:inset-0 focus:outline-none"
                >
                  {hackathon.title}
                </a>
              </ListingCardTitle>
            </div>
            {hackathon.featured && (
              <span className="shrink-0 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-600 dark:text-amber-400 border border-amber-500/20">
                Featured
              </span>
            )}
          </div>
        </ListingCardHeader>

        <div className="px-4 pb-3 space-y-2 text-sm text-muted-foreground">
          <p className="line-clamp-2 text-xs text-foreground/80 leading-relaxed">
            {hackathon.description}
          </p>

          <div className="pt-2 grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1.5 font-medium text-foreground">
              <Trophy className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              <span className="truncate">{hackathon.prizePool}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{hackathon.submissionPeriod}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{hackathon.location}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Globe className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{hackathon.ecosystem}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 bg-muted/30 border-t border-border/50 flex flex-wrap gap-1.5 items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {hackathon.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
        <span className="text-xs font-medium text-primary group-hover:underline">
          View Hackathon &rarr;
        </span>
      </div>
    </ListingCard>
  );
}
