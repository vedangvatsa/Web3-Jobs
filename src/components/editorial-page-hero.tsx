import Image from 'next/image';
import type { ReactNode } from 'react';

export function EditorialPageHero({
  eyebrow,
  title,
  description,
  image,
  imageAlt,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  children?: ReactNode;
}) {
  return (
    <section className="grid items-end gap-8 lg:grid-cols-[1.08fr_.92fr]">
      <div className="max-w-3xl">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-primary">{eyebrow}</p>
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">{title}</h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">{description}</p>
        {children && <div className="mt-7 flex flex-wrap gap-3">{children}</div>}
      </div>
      <div className="relative min-h-[240px] overflow-hidden rounded-2xl border border-border/70 bg-muted shadow-sm sm:min-h-[300px]">
        <Image src={image} alt={imageAlt} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 45vw" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 rounded-full border border-white/30 bg-black/35 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
          Hashtag Web3 community
        </div>
      </div>
    </section>
  );
}
