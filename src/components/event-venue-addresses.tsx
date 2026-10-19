import type { Web3Event } from '@/lib/events';
import { formatVenueAddress } from '@/lib/event-address';

export function EventVenueAddresses({ event }: { event: Pick<Web3Event, 'venueAddresses' | 'locationHidden' | 'visibility'> }) {
  if (!event.venueAddresses?.length || event.locationHidden || ['private', 'unlisted'].includes(event.visibility || '')) return null;
  return (
    <section className="mt-8 space-y-4" aria-labelledby="event-venues">
      <h2 id="event-venues" className="text-xl font-bold tracking-tight">Venues</h2>
      <ul className="space-y-4">
        {event.venueAddresses.map((venue, index) => (
          <li key={`${venue.name}-${index}`} className="space-y-1 break-words">
            <h3 className="font-semibold">{venue.name}</h3>
            {venue.dateLabel && <p className="text-sm text-muted-foreground">{venue.dateLabel}</p>}
            <address className="not-italic text-sm text-muted-foreground">{formatVenueAddress(venue)}</address>
            {venue.sourceUrl && <a className="text-sm underline underline-offset-4" href={venue.sourceUrl} target="_blank" rel="noopener noreferrer">Organizer / venue details</a>}
          </li>
        ))}
      </ul>
    </section>
  );
}
