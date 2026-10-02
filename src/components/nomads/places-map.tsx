'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import L from 'leaflet';
import { CircleMarker, MapContainer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { ArrowUpRight, LocateFixed, Minus, Plus } from 'lucide-react';
import type { CitySummary, NomadPlace } from '@/lib/nomads/types';
import { cityPath, PLACE_CATEGORIES } from '@/lib/nomads/types';
import { buildPlaceClusterIndex, clusterAppearance, isPlaceCluster, type MapPlaceFeature } from '@/lib/nomads/place-clusters';
import { VectorBasemap } from './vector-basemap';

type Props = { places: NomadPlace[]; cities: CitySummary[]; selectedCity: string; focused?: NomadPlace; focusRequest?: number };

function NumberedCluster({ feature, onClick }: { feature: Extract<MapPlaceFeature, { properties: { cluster: true } }>; onClick: () => void }) {
  const marker = useRef<L.Marker>(null);
  const { point_count: count, point_count_abbreviated: abbreviation } = feature.properties;
  const { color, size } = clusterAppearance(count);
  const label = `Zoom into ${count.toLocaleString('en-US')} places`;
  const icon = useMemo(() => L.divIcon({
    className: 'nomad-place-cluster rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    html: `<span style="display:flex;width:100%;height:100%;align-items:center;justify-content:center;border-radius:50%;border:2px solid white;background:${color}d9;color:white;font:500 13px system-ui">${String(abbreviation)}</span>`,
    iconSize: [size, size], iconAnchor: [size / 2, size / 2],
  }), [abbreviation, color, size]);
  useEffect(() => { marker.current?.getElement()?.setAttribute('aria-label', label); }, [label, icon]);
  return <Marker ref={marker} position={[feature.geometry.coordinates[1], feature.geometry.coordinates[0]]} icon={icon} title={label} eventHandlers={{ click: onClick }} />;
}

function MapContents({ places, cities, selectedCity, focused, focusRequest }: Props) {
  const map = useMap();
  const index = useMemo(() => buildPlaceClusterIndex(places), [places]);
  const byId = useMemo(() => new Map(places.map(place => [place.id, place])), [places]);
  const [features, setFeatures] = useState<MapPlaceFeature[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const controls = useRef<HTMLDivElement>(null);
  const current = useRef({ places, cities, selectedCity });
  current.current = { places, cities, selectedCity };

  const updateClusters = useCallback(() => {
    const bounds = map.getBounds();
    setFeatures(index.getClusters([bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()], Math.floor(map.getZoom())));
    map.getContainer().dataset.zoom = String(map.getZoom());
  }, [index, map]);
  useMapEvents({ moveend: updateClusters, zoomend: updateClusters, click: () => setSelectedId(null) });
  useEffect(() => { updateClusters(); }, [updateClusters]);
  useEffect(() => { setSelectedId(null); }, [places]);
  useEffect(() => {
    if (controls.current) {
      L.DomEvent.disableClickPropagation(controls.current);
      L.DomEvent.disableScrollPropagation(controls.current);
    }
  }, []);

  const fitPlaces = useCallback(() => {
    const data = current.current;
    if (data.places.length && data.selectedCity) {
      map.fitBounds(data.places.map(place => [place.lat, place.lon] as [number, number]), { padding: [45, 45], maxZoom: 13, animate: false });
    } else {
      const city = data.cities.find(city => city.slug === data.selectedCity);
      map.setView(city ? [city.lat, city.lon] : [20, 20], city ? 12 : 2, { animate: false });
    }
  }, [map]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      map.invalidateSize({ pan: false, animate: false });
      map.attributionControl.setPrefix(false);
      fitPlaces();
    });
    setSelectedId(null);
    return () => cancelAnimationFrame(frame);
  }, [map, selectedCity, fitPlaces]);

  useEffect(() => {
    if (!focused) return;
    const frame = requestAnimationFrame(() => {
      map.setView([focused.lat, focused.lon], 16, { animate: false });
      setSelectedId(focused.id);
    });
    return () => cancelAnimationFrame(frame);
  }, [map, focused?.id, focusRequest]);

  const selected = selectedId ? byId.get(selectedId) : undefined;
  const selectedPlaceCity = selected ? cities.find(city => city.slug === selected.citySlug) : undefined;
  const controlStyle = 'flex h-11 w-11 items-center justify-center bg-background text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring';
  return <>
    {features.map(feature => {
      const [lon, lat] = feature.geometry.coordinates;
      if (isPlaceCluster(feature)) return <NumberedCluster key={`cluster-${feature.properties.cluster_id}`} feature={feature} onClick={() => {
        setSelectedId(null);
        map.setView([lat, lon], Math.min(index.getClusterExpansionZoom(feature.properties.cluster_id), 18), { animate: false });
      }} />;
      const place = byId.get(feature.properties.placeId);
      return place ? <CircleMarker key={place.id} center={[lat, lon]} radius={selectedId === place.id ? 8 : 5} pathOptions={{ color: '#ffffff', weight: 2, fillColor: '#3b82f6', fillOpacity: 0.95 }} bubblingMouseEvents={false} eventHandlers={{ click: () => setSelectedId(place.id) }} /> : null;
    })}
    {selected && <Popup key={selected.id} position={[selected.lat, selected.lon]} eventHandlers={{ remove: () => setSelectedId(current => current === selected.id ? null : current) }}>
      <div className="min-w-48 max-w-64 space-y-2 text-sm"><h3 className="font-semibold leading-snug">{selected.name}</h3><p className="text-xs">{PLACE_CATEGORIES[selected.category]}{selectedPlaceCity ? ` · ${selectedPlaceCity.name}, ${selectedPlaceCity.country}` : ''}</p>{selected.address && <p className="text-xs">{selected.address}</p>}
        <div className="flex flex-wrap gap-x-4">{selected.website && <a href={selected.website} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center gap-1 text-xs font-medium">Website<ArrowUpRight className="h-3 w-3" aria-hidden /></a>}<a href={`https://www.google.com/maps/search/?api=1&query=${selected.lat},${selected.lon}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center text-xs font-medium">Directions ↗</a><Link href={cityPath(selected.citySlug)} prefetch={false} className="inline-flex min-h-9 items-center text-xs font-medium">City guide ↗</Link></div>
      </div>
    </Popup>}
    <div ref={controls} className="absolute bottom-8 right-3 z-[500] flex flex-col items-end gap-2">
      <div className="overflow-hidden rounded-lg border border-border bg-background shadow-sm"><button type="button" aria-label="Zoom in" className={controlStyle} onClick={() => map.zoomIn()}><Plus className="h-5 w-5" aria-hidden /></button><button type="button" aria-label="Zoom out" className={`${controlStyle} border-t`} onClick={() => map.zoomOut()}><Minus className="h-5 w-5" aria-hidden /></button></div>
      <button type="button" aria-label="Reset map view" className={`${controlStyle} rounded-lg border border-border shadow-sm`} onClick={() => { setSelectedId(null); fitPlaces(); }}><LocateFixed className="h-5 w-5" aria-hidden /></button>
    </div>
  </>;
}

export default function PlacesMap(props: Props) {
  return <div className="relative isolate z-0 h-[360px] overflow-hidden rounded-lg border border-border/70 bg-muted sm:h-[520px] lg:h-[600px]" aria-label="Places map">
    <MapContainer center={[20, 20]} zoom={2} minZoom={1} maxZoom={19} maxBounds={[[-85, -Infinity], [85, Infinity]]} maxBoundsViscosity={1} className="h-full w-full" preferCanvas zoomControl={false} zoomAnimation={false} fadeAnimation={false} scrollWheelZoom={false}>
      <VectorBasemap />
      <MapContents {...props} />
    </MapContainer>
  </div>;
}
