'use client';

import { useMemo, useState } from 'react';
import { PopupCard } from '@/components/popup-card';
import { ListingEmptyState, ListingToolbar } from '@/components/listing-toolbar';
import { POPUP_TYPE_LABELS, POPUP_TYPES } from '@/lib/popups';
import type { Popup, PopupType } from '@/types/popup';

const REGIONS = [
  'Africa',
  'Asia',
  'Europe',
  'Latin America',
  'Middle East',
  'North America',
  'Oceania',
  'Global',
] as const;

function inferRegion(location: string): string {
  const l = location.toLowerCase();
  if (/global|various|network school/.test(l)) return 'Global';
  if (/nigeria|kenya|ghana|tanzania|zanzibar|ethiopia|africa|lagos/.test(l)) return 'Africa';
  if (/japan|thailand|singapore|malaysia|china|shanghai|india|kerala|vietnam|philippines|bhutan|kazakhstan|sri lanka|mirissa|asia|chiang mai|bangkok|nagano|dandeli/.test(l)) return 'Asia';
  if (/switzerland|austria|germany|berlin|montenegro|portugal|greece|mykonos|uk|europe|swiss/.test(l)) return 'Europe';
  if (/argentina|brazil|honduras|roatán|roatan|patagonia|buenos|latin|punta cana|dominican/.test(l)) return 'Latin America';
  if (/palau/.test(l)) return 'Oceania';
  if (/australia|sydney/.test(l)) return 'Oceania';
  if (/turkey|ka[sş]/.test(l)) return 'Middle East';
  if (/usa|united states|san francisco|texas|utah|arizona|tempe|california/.test(l)) return 'North America';
  return 'Global';
}

export function PopupsBoard({ popups }: { popups: Popup[] }) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<PopupType | ''>('');
  const [regionFilter, setRegionFilter] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return popups.filter((popup) => {
      if (typeFilter && popup.type !== typeFilter) return false;
      if (regionFilter && inferRegion(popup.location) !== regionFilter) return false;
      if (!q) return true;
      const haystack = [
        popup.name,
        popup.tagline,
        popup.summary,
        popup.location,
        ...popup.themes,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [popups, search, typeFilter, regionFilter]);

  const isFiltering = Boolean(search) || Boolean(typeFilter) || Boolean(regionFilter);

  return (
    <div>
      <ListingToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search popups..."
        searchAriaLabel="Search popups"
        selects={[
          {
            value: typeFilter,
            onChange: (value) => setTypeFilter((value || '') as PopupType | ''),
            label: 'Filter by type',
            placeholder: 'Types',
            options: POPUP_TYPES.map((type) => ({
              value: type,
              label: POPUP_TYPE_LABELS[type],
            })),
            className: 'md:max-w-[160px]',
          },
          {
            value: regionFilter,
            onChange: setRegionFilter,
            label: 'Filter by region',
            placeholder: 'Regions',
            options: REGIONS.map((region) => ({ value: region, label: region })),
            className: 'md:max-w-[160px]',
          },
        ]}
        resultCount={isFiltering ? filtered.length : null}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((popup) => (
          <PopupCard key={popup.slug} popup={popup} />
        ))}
      </div>

      {filtered.length === 0 && (
        <ListingEmptyState
          title="No popups found"
          onClear={
            isFiltering
              ? () => {
                  setSearch('');
                  setTypeFilter('');
                  setRegionFilter('');
                }
              : undefined
          }
        />
      )}
    </div>
  );
}
