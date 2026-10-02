'use client';

import Link from 'next/link';
import { ArrowUpRight, BedDouble, Building2, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { PLACE_CATEGORIES, type NomadPlace } from '@/lib/nomads/types';

export function PlaceCard({ place, cityName, onLocate, heading = 'h2' }: { place: NomadPlace; cityName?: string; onLocate?: () => void; heading?: 'h2' | 'h3' }) {
  const Icon = place.category === 'coworking' ? Building2 : BedDouble;
  const Heading = heading;
  const actionStyle = 'inline-flex min-h-11 items-center gap-1.5 rounded-sm text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';
  return <Card data-nomad-place={place.id} className="flex h-full min-w-0 flex-col border-border/70 shadow-none">
    <CardHeader className="flex flex-row items-start gap-3 space-y-0 px-4 pb-2 pt-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-border/60 bg-muted/40"><Icon className="h-5 w-5 text-muted-foreground" aria-hidden /></span>
      <div className="min-w-0"><p className="mb-1 text-xs text-muted-foreground">{PLACE_CATEGORIES[place.category]}{cityName ? ` · ${cityName}` : ''}</p><Heading className="line-clamp-2 text-base font-semibold leading-snug" title={place.name}>{place.name}</Heading></div>
    </CardHeader>
    <CardContent className="flex flex-1 flex-col px-4 pb-3 pt-1">
      {place.address && <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{place.address}</p>}
      <div className="mt-auto flex flex-wrap gap-x-4 pt-2">
        {onLocate ? <button className={actionStyle} onClick={onLocate}><MapPin className="h-3.5 w-3.5" aria-hidden />Locate</button> : <Link href={`/places?city=${place.citySlug}&q=${encodeURIComponent(place.name)}&view=map`} prefetch={false} className={actionStyle}><MapPin className="h-3.5 w-3.5" aria-hidden />View on map</Link>}
        {place.website && <a href={place.website} target="_blank" rel="noopener noreferrer" className={actionStyle}>Website<ArrowUpRight className="h-3.5 w-3.5" aria-hidden /></a>}
      </div>
    </CardContent>
  </Card>;
}
