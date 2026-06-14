'use client';

import * as React from 'react';
import Image from 'next/image';
import { Card, CardContent } from"@/components/ui/card"
import {
 Carousel,
 CarouselContent,
 CarouselItem,
} from"@/components/ui/carousel"
import Autoplay from"embla-carousel-autoplay"

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
  <div>
    <div className="text-center mb-12">
    <p className="text-primary font-semibold tracking-wider">AS SEEN ON</p>
      
    </div>
    <Carousel
    plugins={[plugin.current]}
    className="w-full"
    opts={{
      align:"start",
      loop: true,
    }}
    >
    <CarouselContent>
      {logos.map((logo, index) => (
      <CarouselItem key={index} className="basis-1/3 md:basis-1/5">
        <div className="p-1">
          <div className="relative h-12 w-full" title={logo.name}>
            <Image 
              src={logo.src} 
              alt={`Logo of ${logo.name} media outlet, where Hashtag Web3 has been featured`} 
              fill 
              className="object-contain" 
              unoptimized
            />
          </div>
        </div>
      </CarouselItem>
      ))}
    </CarouselContent>
    </Carousel>
     <p className="text-center text-xs text-muted-foreground mt-6">and many more...</p>
  </div>
 );
}
