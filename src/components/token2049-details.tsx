import type { EventSpeaker } from '@/lib/events';

export function Token2049Details({ speakers }: { speakers: EventSpeaker[] }) {
  const namedSpeakers = speakers
    .filter((speaker) => ['Shayne Coplan', 'Balaji Srinivasan', 'Jeff Yan', 'Adena Friedman', 'Arthur Hayes', 'Richard Teng', 'Jesse Pollak'].includes(speaker.name))
    .map((speaker) => `${speaker.name}${speaker.organization ? ` of ${speaker.organization}` : ''}`);

  return (
    <section className="mt-8 max-w-none space-y-5 text-base leading-relaxed text-muted-foreground">
      <h2 className="text-2xl font-bold tracking-tight text-foreground">TOKEN2049 Singapore 2026</h2>
      <p>
        <a href="https://token2049.com/singapore" target="_blank" rel="noopener noreferrer nofollow" className="text-primary underline underline-offset-4">TOKEN2049 Singapore</a>
        {' '}runs on 7 and 8 October 2026 at Marina Bay Sands. The organizer describes this edition as a two-day crypto gathering and publishes a capacity of 25,000 attendees, 7,000 companies, more than 300 speakers, and more than 500 exhibitors. Those are organizer figures, not independently audited attendance results. The event is ticketed, and the official site links to its own checkout flow for registration.
      </p>
      <p>
        Marina Bay Sands is the venue named by the organizer. TOKEN2049 says the program will use all five floors of the building and frames the event as a temporary conference city rather than a single-stage program. That matters for planning: the official program, partner activations, meetings, and satellite events can be spread across the venue and the wider city. Check the official schedule and ticket terms before making travel or meeting plans because session times, access rules, and event locations can change.
      </p>
      <h3 className="text-xl font-bold tracking-tight text-foreground">Speakers and program</h3>
      <p>
        The <a href="https://token2049.com/singapore/speakers" target="_blank" rel="noopener noreferrer nofollow" className="text-primary underline underline-offset-4">official speaker directory</a> currently lists {speakers.length} named speakers in its structured roster. It includes {namedSpeakers.join(', ')}. The directory gives each speaker&apos;s current role or organization, but it does not assign every speaker to a session on the public page. Treat the roster as an announced lineup, not a session timetable, and use the official agenda for stage and time information when it is published.
      </p>
      <p>
        The main site highlights two adjacent programs. <a href="https://token2049.com/singapore/2049-origins" target="_blank" rel="noopener noreferrer nofollow" className="text-primary underline underline-offset-4">TOKEN2049 Origins</a> is presented as a 36-hour hackathon for teams moving from an idea to a working product with mentors. <a href="https://token2049.com/singapore/nexus-startup-competition" target="_blank" rel="noopener noreferrer nofollow" className="text-primary underline underline-offset-4">NEXUS</a> is the organizer&apos;s startup competition: its page describes a process of 500 applicants, 10 finalists, and one global stage. Both have separate application or event information, so a TOKEN2049 ticket should not be assumed to grant entry to every related activity.
      </p>
      <p>
        The organizer also lists After2049 as its official closing party on 9 October at the Marina Bay Sands SkyPark Observation Deck. The side-event directory below is separate from the main conference program. It contains 196 unique events matched to TOKEN2049&apos;s official Singapore week spreadsheet, with each card linking to the organizer&apos;s registration page. It is a planning index, not a guarantee of admission. Some listings are paid, require approval, or have limited capacity.
      </p>
      <h3 className="text-xl font-bold tracking-tight text-foreground">Tickets and access</h3>
      <p>
        Registration should be completed through the <a href="https://checkout.token2049.com/events/asia" target="_blank" rel="noopener noreferrer nofollow" className="text-primary underline underline-offset-4">official ticket checkout</a>. The organizer&apos;s site says its checkout accepts credit cards and offers a separate crypto payment path through MoonPay Commerce. It also promotes exhibitor, sponsor, media-partnership, affiliate, and startup-village routes, each with its own application or contact process. These are different from an attendee ticket. The site says the event draws people from more than 160 countries and that more than 60% of its attendees are C-level, both organizer claims that should be read as audience-profile information rather than independently verified measurements. For a current price, refund terms, access conditions, or venue instructions, rely on the official checkout and event pages rather than a cached listing.
      </p>
    </section>
  );
}
