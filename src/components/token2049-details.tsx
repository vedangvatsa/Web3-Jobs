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
        {' '}runs on 7 and 8 October 2026 at Marina Bay Sands. The organizer publishes figures of 25,000 attendees, 7,000 companies, more than 300 speakers, and more than 500 exhibitors for this edition. These are organizer figures. The event is ticketed through the official checkout.
      </p>
      <p>
        TOKEN2049 says it will use all five floors of Marina Bay Sands. Its Singapore site lists the conference program, ticket sales, exhibitor information, the NEXUS startup competition, the Origins hackathon, and After2049. The organizer describes the venue program as a pop-up city with conference sessions, exhibitors, partner activations, and networking activity.
      </p>
      <h3 className="text-xl font-bold tracking-tight text-foreground">Speakers and program</h3>
      <p>
        The <a href="https://token2049.com/singapore/speakers" target="_blank" rel="noopener noreferrer nofollow" className="text-primary underline underline-offset-4">official speaker directory</a> currently lists {speakers.length} named speakers in its structured roster, including {namedSpeakers.join(', ')}. The directory identifies their roles and organizations. Its public roster does not attach every speaker to a session, stage, or time.
      </p>
      <p>
        The main site highlights two related programs. <a href="https://token2049.com/singapore/2049-origins" target="_blank" rel="noopener noreferrer nofollow" className="text-primary underline underline-offset-4">TOKEN2049 Origins</a> is a 36-hour hackathon for developers, founders, and mentors. <a href="https://token2049.com/singapore/nexus-startup-competition" target="_blank" rel="noopener noreferrer nofollow" className="text-primary underline underline-offset-4">NEXUS</a> is the organizer&apos;s startup competition. Its page describes 500 applicants, 10 finalists, and one global stage. Origins and NEXUS each have separate event and application pages.
      </p>
      <p>
        The organizer lists After2049 as its official closing party on 9 October at the Marina Bay Sands SkyPark Observation Deck. The side-event directory below contains 196 unique events matched to TOKEN2049&apos;s official Singapore week spreadsheet. Each event card links to the registration page supplied by its organizer. The directory includes paid events, free events, and invite-only listings.
      </p>
      <h3 className="text-xl font-bold tracking-tight text-foreground">Tickets and access</h3>
      <p>
        The <a href="https://checkout.token2049.com/events/asia" target="_blank" rel="noopener noreferrer nofollow" className="text-primary underline underline-offset-4">official ticket checkout</a> accepts credit-card payment. The TOKEN2049 site also offers crypto payment through MoonPay Commerce. Its Singapore pages include separate routes for exhibitors, sponsors, media partners, affiliates, speakers, and Startup Village applicants. The organizer says the event brings together attendees from more than 160 countries and that more than 60% of its audience is C-level. It publishes these as audience-profile figures.
      </p>
    </section>
  );
}
