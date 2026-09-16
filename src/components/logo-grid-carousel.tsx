'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Autoplay from 'embla-carousel-autoplay';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import type { LogoItem } from '@/components/logo-strip';
import { chunkArray } from '@/lib/community-data';
import { cn } from '@/lib/utils';

export function LogoGridCarousel({
  logos,
  chunkSize = 12,
  delay = 2500,
  className,
}: {
  logos: LogoItem[];
  chunkSize?: number;
  delay?: number;
  className?: string;
}) {
  const plugin = useRef(Autoplay({ delay, stopOnInteraction: false }));
  const chunks = chunkArray(logos, chunkSize);

  if (logos.length === 0) return null;

  return (
    <Carousel
      className={cn('w-full', className)}
      plugins={[plugin.current]}
      opts={{ loop: true }}
    >
      <CarouselContent>
        {chunks.map((chunk, pageIndex) => (
          <CarouselItem key={pageIndex}>
            <div className="grid grid-cols-3 gap-2 p-2 sm:grid-cols-4 sm:gap-4 sm:p-4">
              {chunk.map((logo) => {
                const scale = logo.scale ?? 1;
                const insetClass =
                  scale > 1 ? 'absolute inset-1 sm:inset-1.5' : 'absolute inset-2.5 sm:inset-3';
                return (
                <div
                  key={logo.name}
                  className="relative h-14 w-full overflow-hidden rounded-md border border-border/50 bg-background shadow-sm sm:h-16"
                  title={logo.name}
                >
                  <div className={insetClass}>
                    <Image
                      src={logo.src}
                      alt={logo.alt ?? `Logo of ${logo.name}`}
                      fill
                      className="object-contain"
                      style={scale > 1 ? { transform: `scale(${scale})` } : undefined}
                      sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 16vw"
                      unoptimized={logo.src.toLowerCase().endsWith('.svg')}
                    />
                  </div>
                </div>
              );
              })}
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
