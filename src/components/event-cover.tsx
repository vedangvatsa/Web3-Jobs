'use client';

import { useState } from 'react';
import Image from 'next/image';

function isRealEventPoster(src?: string | null): src is string {
  const value = (src || '').trim();
  return Boolean(value && !value.includes('/api/og'));
}

function canUseNextImage(src: string): boolean {
  const path = src.split(/[?#]/, 1)[0].toLowerCase();
  return src.startsWith('/') && !src.startsWith('//') && !path.endsWith('.gif');
}

/** Detail-page hero: fit any aspect ratio inside one bounded frame (no crop, no viewport takeover). */
const EVENT_HERO_FRAME_CLASS =
  'relative mx-auto mt-8 flex h-[min(280px,32vh)] w-full max-w-3xl items-center justify-center overflow-hidden rounded-2xl border border-transparent bg-muted/25 sm:h-[min(320px,36vh)] sm:max-w-4xl';

const EVENT_HERO_IMAGE_CLASS =
  'h-auto w-auto max-h-full max-w-full object-contain object-center';

export function EventCardImage({
  src,
  name,
  index,
}: {
  src?: string | null;
  name: string;
  index?: number;
}) {
  const posterSrc = isRealEventPoster(src) ? src : null;
  const [failed, setFailed] = useState(false);

  if (!posterSrc || failed) return null;

  const isAboveFold = index !== undefined && index < 6;

  return (
    <img
      src={posterSrc}
      alt={name}
      className="w-full h-full bg-muted object-cover transition-transform duration-500 ease-out"
      loading={isAboveFold ? 'eager' : 'lazy'}
      fetchPriority={index === 0 ? 'high' : undefined}
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}

export function EventHeroImage({
  src,
  name,
}: {
  src?: string | null;
  name: string;
}) {
  const posterSrc = isRealEventPoster(src) ? src : null;
  const [failed, setFailed] = useState(false);

  if (!posterSrc || failed) return null;

  const useNext = canUseNextImage(posterSrc);

  return (
    <div className={EVENT_HERO_FRAME_CLASS}>
      {useNext ? (
        <Image
          src={posterSrc}
          alt={name}
          width={1600}
          height={900}
          className={EVENT_HERO_IMAGE_CLASS}
          sizes="(max-width: 640px) calc(100vw - 2rem), (max-width: 1280px) 896px, 896px"
          priority
          onError={() => setFailed(true)}
        />
      ) : (
        <img
          src={posterSrc}
          alt={name}
          className={EVENT_HERO_IMAGE_CLASS}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
