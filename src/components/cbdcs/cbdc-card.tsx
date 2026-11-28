'use client';

import { ListingCard, ListingCardHeader, ListingCardTitle } from '@/components/listing-card';
import type { CbdcProfile } from '@/types';
import Link from 'next/link';
import { Landmark, Calendar, Cpu, Layers } from 'lucide-react';

function getStatusBadge(status: string) {
  switch (status.toLowerCase()) {
    case 'launched':
      return {
        label: '🟢 Launched',
        className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      };
    case 'pilot':
      return {
        label: '🟡 Pilot',
        className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      };
    case 'proof of concept':
      return {
        label: '🔵 PoC',
        className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      };
    case 'cancelled':
      return {
        label: '🔴 Cancelled',
        className: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      };
    default:
      return {
        label: '⚪ Research',
        className: 'bg-muted text-muted-foreground border-border',
      };
  }
}

export function CbdcCard({ cbdc }: { cbdc: CbdcProfile }) {
  const badge = getStatusBadge(cbdc.status);

  return (
    <ListingCard className="flex flex-col justify-between overflow-hidden group">
      <div>
        <ListingCardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                {cbdc.country}
              </span>
              <ListingCardTitle as="h2" className="mt-1 group-hover:text-primary transition-colors">
                <Link
                  href={`/cbdcs/${cbdc.slug}`}
                  className="after:absolute after:inset-0 focus:outline-none"
                >
                  {cbdc.digitalCurrency}
                </Link>
              </ListingCardTitle>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium border ${badge.className}`}
            >
              {badge.label}
            </span>
          </div>
        </ListingCardHeader>

        <div className="px-4 pb-3 space-y-2 text-sm text-muted-foreground">
          <p className="line-clamp-2 text-xs text-foreground/80 leading-relaxed">
            {cbdc.goals || `Central Bank Digital Currency project developed by ${cbdc.centralBank}.`}
          </p>

          <div className="pt-2 grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1.5 font-medium text-foreground">
              <Landmark className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="truncate">{cbdc.centralBank}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Layers className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{cbdc.type}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Cpu className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{cbdc.dlt}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{cbdc.announcementYear || 'Announced'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 bg-muted/30 border-t border-border/50 flex flex-wrap gap-1.5 items-center justify-between">
        <div className="flex flex-wrap gap-1">
          <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            {cbdc.dlt}
          </span>
          {cbdc.crossBorderProject && (
            <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
              Cross-Border
            </span>
          )}
        </div>
        <span className="text-xs font-medium text-primary group-hover:underline">
          View Profile &rarr;
        </span>
      </div>
    </ListingCard>
  );
}
