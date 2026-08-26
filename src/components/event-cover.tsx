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
  const label =
    type === 'hackathon'
      ? 'Hackathon'
      : type === 'conference'
      ? 'Conference'
      : format === 'online'
      ? 'Virtual Event'
      : 'Web3 Event';

  return (
    <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center relative overflow-hidden`}>
      <div className="absolute inset-0 opacity-15">
        <div className="absolute -top-6 -right-6 w-32 h-32 border border-white/40 rounded-full" />
        <div className="absolute -bottom-8 -left-8 w-40 h-40 border border-white/40 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border border-white/20 rounded-xl rotate-45" />
      </div>
      <div className="flex flex-col items-center gap-1.5 relative z-10">
        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20 shadow-md">
          <span className="text-xl font-bold text-white tracking-wider">{getInitial(name)}</span>
        </div>
        {type ? (
          <span className="text-[11px] font-medium uppercase tracking-wider text-white/80">{label}</span>
        ) : (
          <span className="text-xs font-medium uppercase tracking-wider text-white/80 max-w-[80%] truncate">{name}</span>
        )}
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
