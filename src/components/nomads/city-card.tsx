import Link from 'next/link';
import { ArrowUpRight, Wifi } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { CountryFlag } from '@/components/country-flag';
import { cityPath, money, metric, type CitySummary } from '@/lib/nomads/types';
import { CityImage } from './city-image';
import { cn } from '@/lib/utils';

export function CityCard({ city, children, heading = 'h2', compact = false, className }: { city: CitySummary; children?: React.ReactNode; heading?: 'h2' | 'h3'; compact?: boolean; className?: string }) {
  const Heading = heading;
  return <Card data-nomad-city={city.slug} className={cn('group flex min-w-0 flex-col overflow-hidden border-border/70 shadow-none transition-colors hover:border-foreground/25', className)}>
    <Link href={cityPath(city.slug)} prefetch={false} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
      <CityImage name={city.name} country={city.country} src={city.image} thumbnail={city.thumbnail} className={compact ? 'aspect-auto h-24 sm:h-28' : undefined} />
      <div className={cn('px-4 pt-4', compact && 'px-3 pt-3')}><p className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground"><CountryFlag code={city.countryCode} className="h-4 w-5 text-base" />{city.country}</p><div className="flex items-center justify-between gap-2"><Heading className={cn('font-semibold tracking-tight', compact ? 'min-h-10 text-sm leading-5' : 'text-lg')}>{city.name}</Heading>{!compact && <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />}</div></div>
    </Link>
    <div className={cn('flex flex-1 flex-col px-4 pb-4', compact && 'px-3 pb-3')}><p className={cn('font-semibold tabular-nums', compact ? 'mt-2 text-base' : 'mt-3 text-xl')}>{money(city.monthlyCost)}<span className={cn('text-xs font-normal text-muted-foreground', compact ? 'mt-0.5 block' : 'ml-1')}>/ month est.</span></p>{!compact && <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/60 pt-3 text-xs text-muted-foreground"><span className="flex items-center gap-1"><Wifi className="h-3.5 w-3.5" aria-hidden />{metric(city.internetMbps, ' Mbps')}</span><span>{city.placeCount} places</span></div>}{children && <div className="mt-auto pt-4">{children}</div>}</div>
  </Card>;
}
