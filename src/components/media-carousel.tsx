'use client';

import * as React from 'react';
import { ResponsiveImage } from './responsive-image';
import type { ResponsiveImagePlan } from '@/lib/responsive-images';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';

interface Logo {
  name: string;
  src: string;
}

interface MediaCarouselProps {
  logos: Logo[];
  imageVariants?: Record<string, ResponsiveImagePlan>;
}

export function MediaCarousel({ logos, imageVariants = {} }: MediaCarouselProps) {
  const plugin = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: false })
  );

  return (
    <div className="w-full">
      <div className="text-center mb-3">
        <h2 className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
          As seen on
        </h2>
      </div>
      <Carousel
        plugins={[plugin.current]}
        className="w-full"
        opts={{
          align: 'start',
          loop: true,
        }}
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {logos.map((logo, index) => (
            <CarouselItem key={index} className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/5">
              <div className="p-1">
                <div className="relative h-10 sm:h-12 w-full" title={logo.name}>
                  <ResponsiveImage
                    src={`${logo.src}?v=2`} 
                    variants={imageVariants[logo.src]}
                    alt={`Logo of ${logo.name} media outlet, where Hashtag Web3 has been featured`} 
                    className="absolute inset-0 h-full w-full object-contain"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                    loading="lazy"
                  />
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <p className="text-center text-xs text-muted-foreground mt-4 sm:mt-6">and many more...</p>
    </div>
  );
}
