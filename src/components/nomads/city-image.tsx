'use client';
import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ResponsiveImage } from '@/components/responsive-image';
import { cityImagePlan } from '@/lib/nomads/images';

export function CityImage({ name, country, src, thumbnail, hero = false, className, sizes }: { name: string; country: string; src: string | null; thumbnail?: string | null; hero?: boolean; className?: string; sizes?: string }) {
  const [failed, setFailed] = useState(false);
  return <div className={cn('relative aspect-[16/10] overflow-hidden bg-muted', className)}>{src && !failed ? <ResponsiveImage src={src} variants={cityImagePlan(src)} sizes={sizes || (hero ? '(min-width: 1152px) 602px, (min-width: 1024px) 55vw, calc(100vw - 3rem)' : '(min-width: 1280px) 250px, (min-width: 1024px) 330px, (min-width: 640px) calc((100vw - 4rem) / 2), calc(100vw - 3rem)')} alt={`${name}, ${country}`} loading={hero ? 'eager' : 'lazy'} fetchPriority={hero ? 'high' : undefined} onError={() => setFailed(true)} className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 motion-safe:group-hover:scale-[1.025]" /> : <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground"><MapPin className="h-8 w-8" aria-hidden /><span className="text-sm">{name}</span></div>}</div>;
}
