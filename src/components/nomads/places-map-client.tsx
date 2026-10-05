'use client';

import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

export const PlacesMapClient = dynamic(() => import('./places-map'), {
  ssr: false,
  loading: () => <div className="flex h-[340px] items-center justify-center rounded-lg border bg-muted/20 text-sm text-muted-foreground sm:h-[420px] lg:h-[460px]" role="status">Loading map...</div>,
});
