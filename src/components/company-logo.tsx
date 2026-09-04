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
  const primarySrc = logoSrc ?? faviconUrl ?? null;
  const [src, setSrc] = useState<string | null>(primarySrc);

  useEffect(() => {
    setSrc(logoSrc ?? faviconUrl ?? null);
  }, [logoSrc, faviconUrl]);

  if (!src) {
    const initial = (name || 'C').trim().charAt(0).toUpperCase();
    return (
      <div className={`flex items-center justify-center rounded-lg bg-muted font-bold text-foreground/70 border border-border/50 select-none ${size}`}>
        <span>{initial}</span>
      </div>
    );
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
        setSrc(null);
      }}
    />
  );
}
