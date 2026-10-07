import Link from 'next/link';
import { ArrowUpRight, Wifi } from 'lucide-react';
import { ListingCard, ListingCardHeader, ListingCardTitle } from '@/components/listing-card';
import { CountryFlag } from '@/components/country-flag';
import { cityPath, money, metric, type CitySummary } from '@/lib/nomads/types';
import { CityImage } from './city-image';
import { cn } from '@/lib/utils';

type CityCardProps = {
  city: CitySummary;
  children?: React.ReactNode;
  heading?: 'h2' | 'h3';
  compact?: boolean;
  className?: string;
  rank?: number | null;
  primaryMetric?: { label: string; value: string; detail: string };
  action?: React.ReactNode;
};

export function CityCard({ city, children, heading = 'h2', compact = false, className, rank, primaryMetric, action }: CityCardProps) {
  return <ListingCard data-nomad-city={city.slug} className={cn('group overflow-hidden', className)}>
    <Link href={cityPath(city.slug)} prefetch={false} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
      <div className="relative">
        <CityImage name={city.name} country={city.country} src={city.image} thumbnail={city.thumbnail} sizes={compact ? '(min-width: 1280px) 240px, (min-width: 768px) 330px, calc((100vw - 4rem) / 2)' : '(min-width: 1152px) 357px, (min-width: 1024px) calc((100vw - 5rem) / 3), (min-width: 640px) calc((100vw - 4rem) / 2), calc(100vw - 2rem)'} className={compact ? 'aspect-auto h-24 sm:h-28' : 'aspect-auto h-32 sm:h-36'} />
        {rank !== undefined && <span className="absolute left-3 top-3 inline-flex h-7 min-w-7 items-center justify-center rounded-md border border-border/70 bg-background/95 px-2 text-xs font-medium tabular-nums" aria-label={rank === null ? 'Unranked' : `Rank ${rank}`}>{rank ?? '-'}</span>}
      </div>
      <ListingCardHeader className={cn('space-y-1 pb-2', compact && 'px-3 pt-3')}><p className="flex items-center gap-1.5 text-xs text-muted-foreground"><CountryFlag code={city.countryCode} className="h-4 w-5 text-base" /><span className="min-w-0 truncate" title={city.country}>{city.country}</span></p><div className="flex items-center justify-between gap-2"><ListingCardTitle as={heading} className={cn(compact && 'min-h-10 text-sm leading-5')} title={city.name}>{city.name}</ListingCardTitle>{!compact && <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />}</div></ListingCardHeader>
    </Link>
    <div className={cn('flex flex-1 flex-col px-4 pb-4', compact && 'px-3 pb-3')}>
      <div className="mt-auto flex items-center justify-between gap-3 pt-1">
        {primaryMetric ? <div className="min-w-0"><p className="text-base font-semibold tabular-nums" aria-label={`${primaryMetric.label}: ${primaryMetric.value}`}>{primaryMetric.value}</p><p className="mt-0.5 text-xs tabular-nums text-muted-foreground">{primaryMetric.detail}</p></div> : <p className="text-base font-semibold tabular-nums">{money(city.monthlyCost)}<span className={cn('text-xs font-normal text-muted-foreground', compact ? 'mt-0.5 block' : 'ml-1')}>/ month est.</span></p>}
        {action}
      </div>
      {!compact && !primaryMetric && <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/60 pt-3 text-xs text-muted-foreground"><span className="flex items-center gap-1"><Wifi className="h-3.5 w-3.5" aria-hidden />{metric(city.internetMbps, ' Mbps')}</span><span>{city.placeCount} places</span></div>}
      {children && <div className="mt-auto pt-4">{children}</div>}
    </div>
  </ListingCard>;
}
