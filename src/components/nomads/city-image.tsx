'use client';
import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CityImage({ name, country, src, thumbnail, hero = false, className, sizes }: { name: string; country: string; src: string | null; thumbnail?: string | null; hero?: boolean; className?: string; sizes?: string }) {
  const [failed, setFailed] = useState(false);
  return <div className={cn('relative aspect-[16/10] overflow-hidden bg-muted', className)}>{src && !failed ? <img src={hero ? src : thumbnail || src} srcSet={thumbnail ? `${thumbnail} 480w, ${src} 1280w` : undefined} sizes={sizes || (hero ? '(min-width: 1024px) 60vw, 100vw' : '(min-width: 1280px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw')} alt={`${name}, ${country}`} width={1280} height={800} loading={hero ? 'eager' : 'lazy'} decoding="async" onError={() => setFailed(true)} className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 motion-safe:group-hover:scale-[1.025]" /> : <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground"><MapPin className="h-8 w-8" aria-hidden /><span className="text-sm">{name}</span></div>}</div>;
}
