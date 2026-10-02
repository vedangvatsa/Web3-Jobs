import Link from 'next/link';
import { CountryFlag } from '@/components/country-flag';
import { cityPath, type CitySummary } from '@/lib/nomads/types';
import { CityThumbnail } from './city-thumbnail';

export type CityIdentityData = Pick<CitySummary, 'slug' | 'name' | 'country' | 'countryCode' | 'thumbnail'>;

export function CityIdentity({ city, showCountry = true }: { city: CityIdentityData; showCountry?: boolean }) {
  return <Link href={cityPath(city.slug)} prefetch={false} className="flex min-w-48 items-center gap-3 rounded-sm font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
    <CityThumbnail src={city.thumbnail} />
    <span className="min-w-0"><span className="block font-medium leading-snug">{city.name}</span>{showCountry && <span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><CountryFlag code={city.countryCode} className="h-4 w-5 text-base" />{city.country}</span>}</span>
  </Link>;
}

export function CountryIdentity({ name, code, emoji }: { name: string; code?: string | null; emoji?: string }) {
  return <span className="inline-flex items-center gap-2"><CountryFlag code={code} emoji={emoji} /><span>{name}</span></span>;
}
