'use client';

import { useEffect } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';
import { maplibreGL } from '@maplibre/maplibre-gl-leaflet';
import 'maplibre-gl/dist/maplibre-gl.css';

const credit = '&copy; <a href="https://carto.com/attributions">CARTO</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export function VectorBasemap() {
  const map = useMap();
  useEffect(() => {
    let active = true, vector: L.MaplibreGL | undefined, fallback: L.TileLayer | undefined;
    const container = map.getContainer();
    container.dataset.basemapReady = 'false';

    function removeVector() {
      if (vector && map.hasLayer(vector)) {
        try { map.removeLayer(vector); } catch { vector.getContainer()?.remove(); }
      }
      map.attributionControl.removeAttribution(credit);
    }
    function useFallback() {
      if (!active || fallback) return;
      removeVector();
      container.dataset.basemap = 'openstreetmap';
      fallback = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19, className: 'grayscale',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).on('load', () => { if (active) container.dataset.basemapReady = 'true'; }).addTo(map);
    }
    try {
      vector = maplibreGL({ style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json', attributionControl: false });
      vector.addTo(map);
      map.attributionControl.addAttribution(credit);
      container.dataset.basemap = 'carto-vector';
      const renderer = vector.getMaplibreMap();
      renderer.on('dataloading', () => { if (active && !fallback) container.dataset.basemapReady = 'false'; });
      renderer.on('idle', () => { if (active && !fallback) container.dataset.basemapReady = 'true'; });
      renderer.on('error', () => { if (active && !renderer.isStyleLoaded()) useFallback(); });
    } catch { useFallback(); }

    return () => {
      active = false;
      removeVector();
      if (fallback && map.hasLayer(fallback)) map.removeLayer(fallback);
    };
  }, [map]);
  return null;
}
