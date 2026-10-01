'use client';

import { useEffect, useState } from 'react';
import { Building2 } from 'lucide-react';
import { ResponsiveImage } from './responsive-image';
import type { ResponsiveImagePlan } from '@/lib/responsive-images';

export function CompanyLogo({
  logoSrc,
  faviconUrl,
  name,
  size = 'h-14 max-w-14',
  imageVariants,
  imageSize = 64,
}: {
  logoSrc: string | null;
  faviconUrl: string | null;
  name: string;
  size?: string;
  imageVariants?: ResponsiveImagePlan;
  imageSize?: number;
}) {
  const primarySrc = logoSrc ?? faviconUrl ?? null;
  const [src, setSrc] = useState<string | null>(primarySrc);

  useEffect(() => {
    setSrc(logoSrc ?? faviconUrl ?? null);
  }, [logoSrc, faviconUrl]);

  if (!src) {
    const initial = (name || 'C').trim().charAt(0).toUpperCase();
    return (
      <div className={`flex items-center justify-center rounded-lg font-bold text-foreground/70 select-none ${size}`}>
        <span>{initial}</span>
      </div>
    );
  }

  return (
    <ResponsiveImage
      src={src}
      variants={src === logoSrc ? imageVariants : undefined}
      sizes={`${imageSize}px`}
      alt={`${name} logo`}
      loading="lazy"
      decoding="async"
      className={`max-h-full max-w-full object-contain ${size}`}
      onError={() => {
        if (src === logoSrc && faviconUrl && faviconUrl !== logoSrc) {
          setSrc(faviconUrl);
          return;
        }
        const initial = (name || 'C').trim().charAt(0).toUpperCase();
        setSrc(null);
      }}
    />
  );
}
