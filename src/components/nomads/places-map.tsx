'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import L from 'leaflet';
import { CircleMarker, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { createLeafletContext, LeafletProvider } from '@react-leaflet/core';
import { ArrowUpRight, LocateFixed, Minus, Plus } from 'lucide-react';
import type { CitySummary, NomadPlace } from '@/lib/nomads/types';
import { cityPath, PLACE_CATEGORIES } from '@/lib/nomads/types';
import { buildPlaceClusterIndex, clusterAppearance, isPlaceCluster, type MapPlaceFeature } from '@/lib/nomads/place-clusters';
import { VectorBasemap } from './vector-basemap';

type Props = { places: NomadPlace[]; cities: Pick<CitySummary, 'slug' | 'name' | 'country' | 'lat' | 'lon'>[]; selectedCity: string; focused?: NomadPlace; focusRequest?: number; viewportKey?: string; fitFiltered?: boolean };
const motionAllowed = () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const worldBounds = L.latLngBounds([[-85, -180], [85, 180]]);

function boundedCenter(map: L.Map, center: L.LatLngExpression, zoom: number) {
  const point = map.project(center, zoom), half = map.getSize().divideBy(2);
  const northWest = map.project(worldBounds.getNorthWest(), zoom).add(half);
  const southEast = map.project(worldBounds.getSouthEast(), zoom).subtract(half);
  return map.unproject(L.point(
    Math.max(northWest.x, Math.min(southEast.x, point.x)),
    Math.max(northWest.y, Math.min(southEast.y, point.y)),
  ), zoom);
}

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

function MapContents({ places, cities, selectedCity, focused, focusRequest, viewportKey, fitFiltered }: Props) {
  const map = useMap();
  const index = useMemo(() => buildPlaceClusterIndex(places), [places]);
  const byId = useMemo(() => new Map(places.map(place => [place.id, place])), [places]);
  const [features, setFeatures] = useState<MapPlaceFeature[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const controls = useRef<HTMLDivElement>(null);
  const current = useRef({ places, cities, selectedCity, fitFiltered });
  const initialized = useRef(false);
  const pendingPopup = useRef<(() => void) | null>(null);
  const zoomTarget = useRef<number | null>(null);
  const [zoom, setZoom] = useState(map.getZoom());
  current.current = { places, cities, selectedCity, fitFiltered };

  const updateClusters = useCallback(() => {
    const bounds = map.getBounds();
    setFeatures(index.getClusters([bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()], Math.floor(map.getZoom())));
    map.getContainer().dataset.zoom = String(map.getZoom());
    setZoom(map.getZoom());
  }, [index, map]);
  const cancelPopup = useCallback(() => {
    if (pendingPopup.current) map.off('moveend', pendingPopup.current);
    pendingPopup.current = null;
  }, [map]);
  useMapEvents({
    movestart: () => { map.getContainer().dataset.moving = 'true'; },
    zoomstart: () => { zoomTarget.current = null; },
    zoom: () => { map.getContainer().dataset.zoom = String(map.getZoom()); },
    moveend: () => { updateClusters(); zoomTarget.current = null; map.getContainer().dataset.moving = 'false'; },
    dragstart: cancelPopup,
    click: () => setSelectedId(null),
  });
  useEffect(() => { updateClusters(); }, [updateClusters]);
  useEffect(() => { cancelPopup(); setSelectedId(null); }, [places, cancelPopup]);
  useEffect(() => cancelPopup, [cancelPopup]);
  useEffect(() => {
    if (controls.current) {
      L.DomEvent.disableClickPropagation(controls.current);
      L.DomEvent.disableScrollPropagation(controls.current);
    }
  }, []);

  const flyTo = useCallback((center: L.LatLngExpression, zoom: number, placeId?: string, animate = true) => {
    cancelPopup();
    setSelectedId(null);
    zoomTarget.current = null;
    zoom = Math.max(map.getMinZoom(), Math.min(map.getMaxZoom(), zoom));
    setZoom(zoom);
    const target = boundedCenter(map, center, zoom);
    const moving = !map.getCenter().equals(target, 1e-7) || Math.abs(map.getZoom() - zoom) > 0.001;
    if (placeId && moving) {
      const onArrival = () => { pendingPopup.current = null; setSelectedId(placeId); };
      pendingPopup.current = onArrival;
      map.once('moveend', onArrival);
    }
    map.flyTo(target, zoom, { animate: animate && moving && motionAllowed(), duration: 0.7 });
    if (placeId && !moving) setSelectedId(placeId);
  }, [map, cancelPopup]);
  const changeZoom = (delta: number) => {
    const currentZoom = zoomTarget.current ?? map.getZoom();
    const target = Math.max(map.getMinZoom(), Math.min(map.getMaxZoom(), delta > 0 ? Math.floor(currentZoom) + 1 : Math.ceil(currentZoom) - 1));
    flyTo(map.getCenter(), target);
    if (Math.abs(map.getZoom() - target) > 0.001) zoomTarget.current = target;
  };
  const focusPlace = useCallback((place: NomadPlace, animate = true) => {
    const zoom = Math.max(16, map.getZoom());
    const center = map.unproject(map.project([place.lat, place.lon], zoom).subtract([0, map.getSize().y * 0.15]), zoom);
    flyTo(center, zoom, place.id, animate);
  }, [map, flyTo]);
  const fitPlaces = useCallback((animate = true) => {
    cancelPopup();
    setSelectedId(null);
    const data = current.current;
    if (data.places.length && (data.selectedCity || data.fitFiltered)) {
      const bounds = L.latLngBounds(data.places.map(place => [place.lat, place.lon] as [number, number]));
      const zoom = Math.min(13, map.getBoundsZoom(bounds, false, L.point(90, 90)));
      const center = map.unproject(map.project(bounds.getNorthWest(), zoom).add(map.project(bounds.getSouthEast(), zoom)).divideBy(2), zoom);
      flyTo(center, zoom, undefined, animate);
    } else {
      const city = data.cities.find(city => city.slug === data.selectedCity);
      flyTo(city ? [city.lat, city.lon] : [20, 20], city ? 12 : 2, undefined, animate);
    }
  }, [map, flyTo, cancelPopup]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      map.invalidateSize({ pan: false, animate: false });
      map.attributionControl.setPrefix(false);
      const animate = initialized.current;
      initialized.current = true;
      if (focused) focusPlace(focused, animate);
      else fitPlaces(animate);
    });
    setSelectedId(null);
    return () => cancelAnimationFrame(frame);
  }, [map, selectedCity, viewportKey, focused, focusRequest, fitPlaces, focusPlace]);

  const selected = selectedId ? byId.get(selectedId) : undefined;
  const selectedPlaceCity = selected ? cities.find(city => city.slug === selected.citySlug) : undefined;
  const controlStyle = 'flex h-11 w-11 items-center justify-center bg-background text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40';
  return <>
    {features.map(feature => {
      const [lon, lat] = feature.geometry.coordinates;
      if (isPlaceCluster(feature)) return <NumberedCluster key={`cluster-${feature.properties.cluster_id}`} feature={feature} onClick={() => {
        setSelectedId(null);
        flyTo([lat, lon], Math.min(index.getClusterExpansionZoom(feature.properties.cluster_id), 18));
      }} />;
      const place = byId.get(feature.properties.placeId);
      return place ? <CircleMarker key={place.id} center={[lat, lon]} radius={selectedId === place.id ? 8 : 5} pathOptions={{ color: '#ffffff', weight: 2, fillColor: '#3b82f6', fillOpacity: 0.95 }} bubblingMouseEvents={false} eventHandlers={{ click: () => focusPlace(place) }} /> : null;
    })}
    {selected && <Popup key={selected.id} position={[selected.lat, selected.lon]} eventHandlers={{ remove: () => setSelectedId(current => current === selected.id ? null : current) }}>
      <div className="min-w-48 max-w-64 space-y-2 text-sm"><h3 className="font-semibold leading-snug">{selected.name}</h3><p className="text-xs">{PLACE_CATEGORIES[selected.category]}{selectedPlaceCity ? ` · ${selectedPlaceCity.name}, ${selectedPlaceCity.country}` : ''}</p>{selected.address && <p className="text-xs">{selected.address}</p>}
        <div className="flex flex-wrap gap-x-4">{selected.website && <a href={selected.website} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center gap-1 text-xs font-medium">Website<ArrowUpRight className="h-3 w-3" aria-hidden /></a>}<a href={`https://www.google.com/maps/search/?api=1&query=${selected.lat},${selected.lon}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center text-xs font-medium">Directions ↗</a><Link href={cityPath(selected.citySlug)} prefetch={false} className="inline-flex min-h-9 items-center text-xs font-medium">City guide ↗</Link></div>
      </div>
    </Popup>}
    <div ref={controls} className="absolute bottom-8 right-3 z-[500] flex flex-col items-end gap-2">
      <div className="overflow-hidden rounded-lg border border-border bg-background shadow-sm"><button type="button" aria-label="Zoom in" disabled={zoom >= map.getMaxZoom()} className={controlStyle} onClick={() => changeZoom(1)}><Plus className="h-5 w-5" aria-hidden /></button><button type="button" aria-label="Zoom out" disabled={zoom <= map.getMinZoom()} className={`${controlStyle} border-t`} onClick={() => changeZoom(-1)}><Minus className="h-5 w-5" aria-hidden /></button></div>
      <button type="button" aria-label="Reset map view" className={`${controlStyle} rounded-lg border border-border shadow-sm`} onClick={() => { setSelectedId(null); fitPlaces(); }}><LocateFixed className="h-5 w-5" aria-hidden /></button>
    </div>
  </>;
}

export default function PlacesMap(props: Props) {
  const container = useRef<HTMLDivElement>(null);
  const [context, setContext] = useState<ReturnType<typeof createLeafletContext> | null>(null);
  useEffect(() => {
    if (!container.current) return;
    // Own the map in an effect: react-leaflet 4's ref callback initializes twice in Strict Mode.
    const map = L.map(container.current, {
      minZoom: 1, maxZoom: 19, zoomSnap: 0,
      maxBounds: worldBounds, maxBoundsViscosity: 1, bounceAtZoomLimits: false,
      preferCanvas: true, zoomControl: false, zoomAnimation: motionAllowed(), fadeAnimation: motionAllowed(), scrollWheelZoom: true,
    });
    map.setMinZoom(Math.max(1, map.getBoundsZoom(worldBounds, true)));
    const initialZoom = Math.max(2, map.getMinZoom());
    map.setView(boundedCenter(map, [20, 20], initialZoom), initialZoom, { animate: false });
    let width = container.current.clientWidth, height = container.current.clientHeight;
    const resize = () => {
      const element = map.getContainer();
      if (element.clientWidth === width && element.clientHeight === height) return;
      width = element.clientWidth; height = element.clientHeight;
      if (!width || !height) return;
      const center = map.getCenter();
      map.invalidateSize({ pan: false, animate: false });
      // Keep one world large enough to cover the viewport, including after a container-only resize.
      const minimum = Math.max(1, map.getBoundsZoom(worldBounds, true)), zoom = Math.max(map.getZoom(), minimum);
      map.setView(boundedCenter(map, center, zoom), zoom, { animate: false });
      map.setMinZoom(minimum);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(container.current);
    setContext(createLeafletContext(map));
    return () => { observer.disconnect(); map.remove(); };
  }, []);
  return <div className="relative isolate z-0 h-[340px] overflow-hidden rounded-lg border border-border/70 bg-muted sm:h-[420px] lg:h-[460px]" aria-label="Places map">
    <div ref={container} className="h-full w-full">
      {context && <LeafletProvider value={context}>
        <VectorBasemap />
        <MapContents {...props} />
      </LeafletProvider>}
    </div>
  </div>;
}
