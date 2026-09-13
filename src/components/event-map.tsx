'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';
import { COUNTRY_NAMES, getEventSlug, type PublicWeb3Event } from '@/lib/events';

type EventGroup = { key: string; label: string; events: PublicWeb3Event[]; coordinates: [number, number] };

const COUNTRY_CODES: Record<string, string> = {
  'united arab emirates': 'AE', bolivia: 'BO', brazil: 'BR', bulgaria: 'BG', canada: 'CA',
  'dominican republic': 'DO', finland: 'FI', france: 'FR', germany: 'DE', ghana: 'GH',
  'hong kong': 'HK', india: 'IN', italy: 'IT', japan: 'JP', malawi: 'MW', portugal: 'PT',
  rwanda: 'RW', singapore: 'SG', 'south africa': 'ZA', 'south korea': 'KR',
  'republic of korea': 'KR', spain: 'ES', switzerland: 'CH', thailand: 'TH', turkey: 'TR',
  'türkiye': 'TR', 'united kingdom': 'GB', 'united states': 'US', 'united states of america': 'US',
};

const CITY_COORDINATES: Record<string, [number, number]> = {
  'abu dhabi|AE': [24.45, 54.38], 'dubai|AE': [25.2, 55.27],
  'cochabamba|BO': [-17.39, -66.16], 'sao paulo|BR': [-23.55, -46.63],
  'sofia|BG': [42.7, 23.32], 'toronto|CA': [43.65, -79.38],
  'punta cana|DO': [18.56, -68.37], 'helsinki|FI': [60.17, 24.94],
  'cannes|FR': [43.55, 7.02], 'nanterre|FR': [48.89, 2.21], 'paris|FR': [48.86, 2.35],
  'berlin|DE': [52.52, 13.41], 'dortmund|DE': [51.51, 7.47], 'accra|GH': [5.56, -0.19],
  'hong kong|HK': [22.32, 114.17], 'bengaluru|IN': [12.97, 77.59], 'jaipur|IN': [26.91, 75.79],
  'mumbai|IN': [19.08, 72.88], 'milan|IT': [45.46, 9.19], 'rome|IT': [41.9, 12.5],
  'bunkyo city|JP': [35.71, 139.75], 'minato city|JP': [35.66, 139.75],
  'nakano city|JP': [35.71, 139.67], 'tokyo|JP': [35.68, 139.76],
  'blantyre|MW': [-15.79, 35.01], 'lisbon|PT': [38.72, -9.14], 'kigali|RW': [-1.94, 30.06],
  'singapore|SG': [1.35, 103.82], 'cape town|ZA': [-33.92, 18.42],
  'johannesburg|ZA': [-26.2, 28.04], 'seoul|KR': [37.57, 126.98],
  'barcelona|ES': [41.39, 2.17], 'madrid|ES': [40.42, -3.7], 'lugano|CH': [46, 8.95],
  'zurich|CH': [47.38, 8.54], 'bangkok|TH': [13.76, 100.5],
  'beyoglu|TR': [41.04, 28.98], 'istanbul|TR': [41.01, 28.98],
  'birmingham|GB': [52.48, -1.9],
  'arlington|US': [38.88, -77.1], 'atlanta|US': [33.75, -84.39], 'austin|US': [30.27, -97.74],
  'boston|US': [42.36, -71.06], 'brooklyn|US': [40.68, -73.94], 'columbus|US': [39.96, -82.99],
  'culver city|US': [34.02, -118.4], 'davie|US': [26.08, -80.25], 'denver|US': [39.74, -104.99],
  'fullerton|US': [33.87, -117.92], 'las vegas|US': [36.17, -115.14], 'miami|US': [25.76, -80.19],
  'miami beach|US': [25.79, -80.13], 'new york|US': [40.71, -74.01],
  'san francisco|US': [37.77, -122.42], 'washington dc|US': [38.91, -77.04],
};

const CITY_ALIASES: Record<string, string> = {
  'abu dhabi uae': 'abu dhabi', 'dubai uae': 'dubai', 'new york city': 'new york',
  'sao paulo': 'sao paulo', 'washington, dc': 'washington dc', 'washington d c': 'washington dc',
  'أبو ظبي': 'abu dhabi',
};

function getCountryCode(country?: string) {
  const value = country?.trim();
  if (!value) return null;
  const code = value.toUpperCase();
  return COUNTRY_NAMES[code] ? code : COUNTRY_CODES[value.toLowerCase()] || null;
}

function normalizeCity(city: string) {
  const normalized = city
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
  return CITY_ALIASES[normalized] || normalized.split(',')[0].trim();
}

function MapViewport({ groups, selected }: { groups: EventGroup[]; selected: EventGroup | null }) {
  const map = useMap();

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      map.invalidateSize();
      if (selected) map.flyTo(selected.coordinates, 7, { duration: 0.5 });
      else if (groups.length) map.fitBounds(groups.map((group) => group.coordinates), { padding: [32, 32], maxZoom: 4 });
    });
    return () => cancelAnimationFrame(frame);
  }, [groups, map, selected]);

  return null;
}

export function EventMap({ events }: { events: PublicWeb3Event[] }) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const groups = useMemo(() => {
    const locations = new Map<string, EventGroup>();

    events.forEach((event) => {
      if (!event.city || /^(global|tba|virtual)$/i.test(event.city)) return;
      const countryCode = getCountryCode(event.country);
      if (!countryCode) return;
      const city = normalizeCity(event.city);
      const coordinates = CITY_COORDINATES[`${city}|${countryCode}`];
      if (!coordinates) return;
      const key = `${city}|${countryCode}`;
      const label = `${event.city.split(',')[0].trim()}, ${COUNTRY_NAMES[countryCode] || event.country}`;
      const group = locations.get(key) || { key, label, events: [], coordinates };
      group.events.push(event);
      locations.set(key, group);
    });

    return [...locations.values()].sort((a, b) => b.events.length - a.events.length || a.label.localeCompare(b.label));
  }, [events]);
  const selected = groups.find((group) => group.key === selectedKey) || null;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="relative isolate z-0 h-[520px] overflow-hidden rounded-xl border bg-muted/20">
        <MapContainer center={[20, 0]} zoom={2} className="h-full w-full" scrollWheelZoom attributionControl={false}>
          <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapViewport groups={groups} selected={selected} />
          {groups.map((group) => (
            <CircleMarker
              key={group.key}
              center={group.coordinates}
              radius={Math.min(18, 6 + Math.log2(group.events.length) * 3)}
              pathOptions={{ color: selected?.key === group.key ? '#c2410c' : '#0284c7', fillColor: selected?.key === group.key ? '#ea580c' : '#0284c7', fillOpacity: 0.75 }}
              eventHandlers={{ click: () => setSelectedKey(group.key) }}
            >
              <Popup><div className="min-w-48 space-y-2"><strong>{group.label}</strong><p>{group.events.length} event{group.events.length === 1 ? '' : 's'}</p>{group.events.slice(0, 5).map((event) => <Link key={event.id} href={`/${getEventSlug(event)}`} className="block text-sm text-sky-700 underline">{event.name}</Link>)}</div></Popup>
            </CircleMarker>
          ))}
        </MapContainer>
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="absolute bottom-1 right-1 z-10 rounded bg-background/85 px-1.5 py-0.5 text-[10px] text-muted-foreground shadow-sm">© OpenStreetMap contributors</a>
      </div>

      <aside className="h-[520px] rounded-xl border bg-card p-3">
        {selected ? (
          <div className="space-y-3">
            <button onClick={() => setSelectedKey(null)} className="text-xs font-medium text-primary hover:underline">All locations</button>
            <div><h2 className="font-semibold">{selected.label}</h2><p className="text-sm text-muted-foreground">{selected.events.length} event{selected.events.length === 1 ? '' : 's'}</p></div>
            <div className="max-h-[405px] space-y-2 overflow-y-auto pr-1">
              {selected.events.map((event) => <Link key={event.id} href={`/${getEventSlug(event)}`} className="block rounded-md border p-2 text-sm font-medium hover:bg-muted">{event.name}</Link>)}
            </div>
          </div>
        ) : (
          <div className="space-y-3"><div><h2 className="font-semibold">Event locations</h2><p className="text-sm text-muted-foreground">{groups.length} cities with upcoming events</p></div><div className="max-h-[445px] space-y-1 overflow-y-auto pr-1">{groups.map((group) => <button key={group.key} onClick={() => setSelectedKey(group.key)} className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-muted"><span className="truncate">{group.label}</span><span className="rounded-full bg-muted px-1.5 py-0.5 text-xs tabular-nums">{group.events.length}</span></button>)}</div></div>
        )}
      </aside>
    </div>
  );
}
