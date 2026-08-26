'use client';

import { useState } from 'react';
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

  if (!src) {
    return <Building2 className="h-10 w-10 text-primary" />;
  }

  return (
    <img
      src={src}
      alt={`${name} logo`}
      loading="lazy"
      decoding="async"
      className={`object-contain ${size}`}
      onError={() => {
        if (src !== faviconUrl) setSrc(faviconUrl);
      }}
    />
  );
}
