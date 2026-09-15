'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';
import { getEventSlug, type PublicWeb3Event } from '@/lib/events';
import { groupEventsForMap, type EventMapGroup } from '@/lib/event-map-locations';

function MapViewport({ groups, selected }: { groups: EventMapGroup[]; selected: EventMapGroup | null }) {
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
  const groups = useMemo(() => groupEventsForMap(events), [events]);
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
