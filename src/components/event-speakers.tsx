'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import type { EventSpeaker } from '@/lib/events';

export function EventSpeakers({ speakers, sourceUrl }: { speakers: EventSpeaker[]; sourceUrl: string }) {
  const [query, setQuery] = useState('');
  const visibleSpeakers = speakers.filter((speaker) =>
    `${speaker.name} ${speaker.title ?? ''} ${speaker.organization ?? ''}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <section className="mt-12 border-t pt-8" aria-labelledby="event-speakers-heading">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="event-speakers-heading" className="text-2xl font-bold tracking-tight">Official Speakers</h2>
          <p className="mt-1 text-sm text-muted-foreground">{speakers.length} announced speakers. Roster from the <a href={sourceUrl} target="_blank" rel="noopener noreferrer nofollow" className="text-primary underline underline-offset-4">official TOKEN2049 directory</a>.</p>
        </div>
        <label className="relative block sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search speakers" className="h-9 w-full rounded-md border bg-background pl-9 pr-3 text-sm" />
        </label>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visibleSpeakers.map((speaker) => (
          <div key={speaker.name} className="rounded-lg border bg-card p-4">
            <p className="font-semibold">{speaker.name}</p>
            {(speaker.title || speaker.organization) && <p className="mt-1 text-sm leading-5 text-muted-foreground">{[speaker.title, speaker.organization].filter(Boolean).join(', ')}</p>}
          </div>
        ))}
      </div>
      {visibleSpeakers.length === 0 && <p className="mt-5 text-sm text-muted-foreground">No speakers match that search.</p>}
    </section>
  );
}
