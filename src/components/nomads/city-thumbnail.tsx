'use client';

import { useState } from 'react';
import { MapPin } from 'lucide-react';

export function CityThumbnail({ src }: { src: string | null }) {
  const [failed, setFailed] = useState(false);
  const thumbnail = src?.replace(/-480\.webp$/, '-128.webp');
  return <span className="flex h-11 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border/60 bg-muted">
    {thumbnail && !failed ? <img data-city-thumbnail src={thumbnail} alt="" width={128} height={96} loading="lazy" decoding="async" className="h-full w-full object-cover" onError={() => setFailed(true)} /> : <MapPin className="h-5 w-5 text-muted-foreground" aria-hidden />}
  </span>;
}
