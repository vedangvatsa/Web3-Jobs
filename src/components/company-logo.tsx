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
  const [src, setSrc] = useState<string | null>(logoSrc ?? faviconUrl);

  useEffect(() => {
    setSrc(logoSrc ?? faviconUrl);
  }, [logoSrc, faviconUrl]);

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

        setSrc(null);
      }}
    />
  );
}
