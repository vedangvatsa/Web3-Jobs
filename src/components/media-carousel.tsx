'use client';

import * as React from 'react';
import Image from 'next/image';
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
}

export function MediaCarousel({ logos }: MediaCarouselProps) {
  const plugin = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: false })
  );

  return (
    <div className="w-full">
      <div className="text-center mb-6 sm:mb-10">
        <p className="text-primary font-semibold tracking-wider text-xs sm:text-sm uppercase">AS SEEN ON</p>
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
                  <Image 
                    src={`${logo.src}?v=2`} 
                    alt={`Logo of ${logo.name} media outlet, where Hashtag Web3 has been featured`} 
                    fill 
                    className="object-contain"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                    unoptimized={logo.src.toLowerCase().endsWith('.svg')}
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
