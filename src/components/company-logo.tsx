'use client';

import { useEffect, useState } from 'react';
import { Building2 } from 'lucide-react';

export function CompanyLogo({
  logoSrc,
  faviconUrl,
  name,
  size = 'h-14 max-w-14',
}: {
  logoSrc: string | null;
  faviconUrl: string | null;
  name: string;
  size?: string;
}) {
  const cleanNameDomain = name.toLowerCase().replace(/[^a-z0-9]+/g, '') + '.com';
  const autoFavicon = `https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${cleanNameDomain}&size=128`;

  const primarySrc = logoSrc ?? faviconUrl ?? autoFavicon;
  const [src, setSrc] = useState<string | null>(primarySrc);

  useEffect(() => {
    setSrc(logoSrc ?? faviconUrl ?? autoFavicon);
  }, [logoSrc, faviconUrl, autoFavicon]);

  if (!src) {
    return <Building2 className={`w-full text-muted-foreground ${size}`} />;
  }

  return (
    <img
      src={src}
      alt={`${name} logo`}
      loading="lazy"
      decoding="async"
      className={`object-contain ${size}`}
      onError={() => {
        if (src === logoSrc && faviconUrl && faviconUrl !== logoSrc) {
          setSrc(faviconUrl);
          return;
        }
        if (src !== autoFavicon) {
          setSrc(autoFavicon);
          return;
        }

        setSrc(null);
      }}
    />
  );
}
