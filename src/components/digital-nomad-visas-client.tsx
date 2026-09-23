'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { DigitalNomadVisa } from '@/types';
import { visaData } from '@/lib/visas';
import { ToolUsageTracker } from '@/components/tracking/tool-usage-tracker';
import { CommunityFeedBanner } from '@/components/community-feed-banner';
import { CtaBanner } from '@/components/cta-banner';
import { PageHeader } from '@/components/page-header';
import { ListingEmptyState, ListingToolbar } from '@/components/listing-toolbar';

const CONTINENTS = ['Europe', 'Asia', 'North America', 'South America', 'Africa', 'Oceania'] as const;

function VisaCard({ visa }: { visa: DigitalNomadVisa }) {
  return (
    <Card className="flex flex-col h-full bg-card border-border/70 shadow-none hover:border-foreground/25 transition-colors">
      <CardHeader className="flex flex-row items-start justify-between pb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl" aria-hidden="true">{getFlagEmoji(visa.country)}</span>
          <div>
            <CardTitle className="text-lg font-bold text-foreground">{visa.country}</CardTitle>
            <Badge variant="outline" className="text-[10px] font-mono mt-0.5">
              {visa.continent}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-between pt-0">
        <div>
          <p className="text-muted-foreground mb-4 text-xs leading-relaxed">{visa.description}</p>
          <div className="space-y-3 text-xs border-t border-border/50 pt-3">
            <div>
              <span className="text-muted-foreground block text-[11px] mb-0.5">Minimum Income</span>
              <p className="font-semibold text-foreground text-sm">
                Approx. ${visa.minIncome.toLocaleString()} USD / month
              </p>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px] mb-0.5">Visa Length</span>
              <p className="font-medium text-foreground">{visa.visaLength}</p>
            </div>
            {visa.requirements && visa.requirements.length > 0 && (
              <div>
                <span className="text-muted-foreground block text-[11px] mb-1">Key Requirements</span>
                <ul className="list-disc pl-4 space-y-0.5 text-muted-foreground text-xs">
                  {visa.requirements.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getFlagEmoji(countryName: string): string {
  const countryCode = Object.keys(countryMap).find((code) => countryMap[code] === countryName);
  if (!countryCode) return '';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

const countryMap: Record<string, string> = {
  AD: 'Andorra',
  AL: 'Albania',
  AG: 'Antigua and Barbuda',
  AR: 'Argentina',
  AM: 'Armenia',
  AW: 'Aruba',
  BS: 'Bahamas',
  BB: 'Barbados',
  BT: 'Bhutan',
  BZ: 'Belize',
  BM: 'Bermuda',
  BR: 'Brazil',
  BG: 'Bulgaria',
  KH: 'Cambodia',
  CV: 'Cabo Verde',
  KY: 'Cayman Islands',
  CO: 'Colombia',
  CR: 'Costa Rica',
  HR: 'Croatia',
  CW: 'Curacao',
  CY: 'Cyprus',
  CZ: 'Czech Republic',
  DM: 'Dominica',
  EC: 'Ecuador',
  SV: 'El Salvador',
  EE: 'Estonia',
  FR: 'France',
  GE: 'Georgia',
  DE: 'Germany',
  GR: 'Greece',
  GD: 'Grenada',
  HU: 'Hungary',
  IS: 'Iceland',
  ID: 'Indonesia',
  IE: 'Ireland',
  IT: 'Italy',
  JP: 'Japan',
  KG: 'Kyrgyzstan',
  LV: 'Latvia',
  MY: 'Malaysia',
  MT: 'Malta',
  MU: 'Mauritius',
  MX: 'Mexico',
  ME: 'Montenegro',
  MS: 'Montserrat',
  MA: 'Morocco',
  NA: 'Namibia',
  NL: 'Netherlands',
  MK: 'North Macedonia',
  NO: 'Norway',
  PA: 'Panama',
  PY: 'Paraguay',
  PE: 'Peru',
  PH: 'Philippines',
  PL: 'Poland',
  PT: 'Portugal',
  PR: 'Puerto Rico',
  RO: 'Romania',
  LC: 'Saint Lucia',
  RS: 'Serbia',
  SC: 'Seychelles',
  ZA: 'South Africa',
  KR: 'South Korea',
  ES: 'Spain',
  LK: 'Sri Lanka',
  TW: 'Taiwan',
  TH: 'Thailand',
  TR: 'Turkey',
  AE: 'UAE (Dubai)',
  UY: 'Uruguay',
  VN: 'Vietnam',
};

export function DigitalNomadVisasContent() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [continentFilter, setContinentFilter] = React.useState<string | null>(null);

  const filteredVisas = React.useMemo(() => {
    return visaData
      .filter((visa) => {
        const matchesContinent = !continentFilter || visa.continent === continentFilter;
        const q = searchTerm.toLowerCase();
        const matchesSearch =
          !q ||
          visa.country.toLowerCase().includes(q) ||
          visa.description.toLowerCase().includes(q) ||
          visa.requirements.join(' ').toLowerCase().includes(q);
        return matchesContinent && matchesSearch;
      })
      .sort((a, b) => a.country.localeCompare(b.country));
  }, [searchTerm, continentFilter]);

  const isFiltering = searchTerm.length > 0 || Boolean(continentFilter);

  return (
    <div>
      <ToolUsageTracker toolName="Digital Nomad Visas" />
      <PageHeader title="Visas for Digital Nomads" />
      <CommunityFeedBanner variant="community" />

      <ListingToolbar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search countries, requirements..."
        searchAriaLabel="Search visas"
        selects={[
          {
            value: continentFilter || '',
            onChange: (value) => setContinentFilter(value === '' ? null : value),
            label: 'Filter by continent',
            placeholder: 'Continents',
            options: CONTINENTS.map((c) => ({ value: c, label: c })),
            className: 'md:max-w-[180px]',
          },
        ]}
        resultCount={isFiltering ? filteredVisas.length : null}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVisas.map((visa) => <VisaCard key={visa.country} visa={visa} />)}
      </div>

      {filteredVisas.length > 0 && (
        <CtaBanner
          variant="jobs"
          title="Looking for a Web3 Job?"
          className="col-span-full"
        />
      )}

      {filteredVisas.length === 0 && (
        <ListingEmptyState
          title="No visas found"
          onClear={
            isFiltering
              ? () => {
                  setSearchTerm('');
                  setContinentFilter(null);
                }
              : undefined
          }
        />
      )}
    </div>
  );
}
