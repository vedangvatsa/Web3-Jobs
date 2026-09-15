'use client';

import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

export function PopupCoverImages({
  images,
  popupName,
}: {
  images: string[];
  popupName: string;
}) {
  if (!images.length) return null;

  const slideClass =
    'relative aspect-[16/10] overflow-hidden rounded-lg border border-border/60 bg-muted/30';

  if (images.length === 1) {
    return (
      <section className="mt-8" aria-label={`${popupName} photos`}>
        <div className={slideClass}>
          <Image
            src={images[0]}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>
      </section>
    );
  }

  if (images.length === 2) {
    return (
      <section className="mt-8" aria-label={`${popupName} photos`}>
        <div className="grid grid-cols-2 gap-3">
          {images.map((src, index) => (
            <div key={src} className={slideClass}>
              <Image
                src={src}
                alt=""
                fill
                sizes="(max-width: 640px) 50vw, 40vw"
                className="object-cover"
                priority={index === 0}
              />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mt-8" aria-label={`${popupName} photos`}>
      <Carousel className="w-full" opts={{ align: 'start', loop: true }}>
        <CarouselContent className="-ml-3">
          {images.map((src, index) => (
            <CarouselItem key={src} className="basis-1/2 pl-3">
              <div className={slideClass}>
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 50vw, 40vw"
                  className="object-cover"
                  priority={index === 0}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2 border-border/70 bg-background/90" />
        <CarouselNext className="right-2 border-border/70 bg-background/90" />
      </Carousel>
    </section>
  );
}
