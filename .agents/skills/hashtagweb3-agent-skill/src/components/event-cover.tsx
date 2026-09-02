'use client';

import { useState } from 'react';
import type { EventType } from '@/lib/events';

const GRADIENTS = [
  'from-violet-600/80 via-purple-700/80 to-indigo-800/80',
  'from-blue-600/80 via-cyan-700/80 to-teal-800/80',
  'from-emerald-600/80 via-teal-700/80 to-cyan-800/80',
  'from-amber-600/80 via-orange-700/80 to-rose-800/80',
  'from-rose-600/80 via-pink-700/80 to-fuchsia-800/80',
  'from-indigo-600/80 via-blue-700/80 to-sky-800/80',
];

export function getEventGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

function getInitial(name: string): string {
  return name.replace(/[^a-zA-Z0-9]/g, '').charAt(0).toUpperCase() || 'W';
}

export function EventCoverFallback({
  name,
  type,
  format,
}: {
  name: string;
  type?: EventType;
  format?: string;
}) {
  const gradient = getEventGradient(name);
  const initial = getInitial(name);
  const label =
    type === 'hackathon'
      ? 'Hackathon'
      : type === 'conference'
      ? 'Conference'
      : format === 'online'
      ? 'Virtual Event'
      : type
      ? 'Web3 Event'
      : null;

  return (
    <div className={`relative w-full h-full overflow-hidden bg-gradient-to-br ${gradient}`}>
      {/* Layered light blooms */}
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute -top-1/3 -left-1/4 w-3/4 h-3/4 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute -bottom-1/3 -right-1/4 w-2/3 h-2/3 rounded-full bg-black/25 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-1/3 h-1/3 rounded-full bg-white/10 blur-2xl" />
      </div>
      {/* Dot grid texture */}
      <div
        className="absolute inset-0 opacity-25"
        aria-hidden="true"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.55) 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      />
      {/* Giant watermark initial, cropped by overflow */}
      <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
        <span className="text-[11rem] leading-none font-black text-white/10 select-none tracking-tighter">
          {initial}
        </span>
      </div>
      {/* Centered identity */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center gap-2.5 px-6 text-center">
        {label && (
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/70">
            {label}
          </span>
        )}
        <span className="text-lg sm:text-xl font-extrabold text-white leading-tight line-clamp-2 drop-shadow-md max-w-md">
          {name}
        </span>
        <span className="mt-1 h-0.5 w-10 rounded-full bg-white/50" aria-hidden="true" />
      </div>
    </div>
  );
}

export function EventCardImage({
  src,
  name,
  type,
  format,
  index,
}: {
  src?: string | null;
  name: string;
  type: EventType;
  format: string;
  index?: number;
}) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return <EventCoverFallback name={name} type={type} format={format} />;
  }

  const isAboveFold = index !== undefined && index < 3;

  return (
    <img
      src={src}
      alt={name}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
      loading={isAboveFold ? "eager" : "lazy"}
      fetchPriority={index === 0 ? "high" : undefined}
      decoding="async"
      onError={() => setHasError(true)}
    />
  );
}

export function EventHeroImage({ src, name }: { src?: string | null; name: string }) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className="w-full h-64 sm:h-80 md:h-96 rounded-2xl overflow-hidden border">
        <EventCoverFallback name={name} />
      </div>
    );
  }

  return (
    <div className="w-full h-64 sm:h-80 md:h-96 rounded-2xl overflow-hidden bg-muted border">
      <img
        src={src}
        alt={name}
        className="w-full h-full object-cover"
        loading="eager"
        fetchPriority="high"
        decoding="async"
        onError={() => setHasError(true)}
      />
    </div>
  );
}
