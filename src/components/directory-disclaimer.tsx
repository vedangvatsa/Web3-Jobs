import { getThirdPartyHostDisclosure } from '@/lib/job-apply-disclosure';

type DirectoryDisclaimerProps =
  | { variant?: 'generic' }
  | {
      variant: 'job';
      entityName: string;
      outboundUrl: string;
      /** Hide outbound note when Apply is unavailable (e.g. expired listing). */
      showOutboundNote?: boolean;
    }
  | {
      variant: 'event';
      entityName: string;
      outboundUrl?: string;
    };

function formatHostPhrase(hostname: string, platformLabel: string | null): string {
  return platformLabel ? `${platformLabel} (${hostname})` : hostname;
}

export function DirectoryDisclaimer(props: DirectoryDisclaimerProps = {}) {
  const variant = props.variant ?? 'generic';

  const baseCopy =
    variant === 'job'
      ? 'Listings and links are informational. Hashtag Web3 is not the employer for roles on this site unless stated otherwise.'
      : variant === 'event'
        ? 'Event listings and links are informational. Hashtag Web3 is not the event organizer unless stated otherwise.'
        : 'Listings and links are informational. Hashtag Web3 is not the employer or event organizer unless stated otherwise.';

  const commonTail =
    'Verify URLs before sharing personal information. Do your own research; Hashtag Web3 assumes no responsibility or liability for actions or outcomes on third-party sites.';

  let outboundParagraph: string | null = null;

  if (variant === 'job' && props.showOutboundNote !== false && props.outboundUrl) {
    const disclosure = getThirdPartyHostDisclosure(props.outboundUrl);
    if (disclosure) {
      const hostPhrase = formatHostPhrase(disclosure.hostname, disclosure.platformLabel);
      outboundParagraph = `The Apply button opens ${props.entityName}'s official application on a third-party careers site (${hostPhrase}). Hashtag Web3 does not host the application form and does not collect résumés, passwords, or payments for this role.`;
    }
  }

  if (variant === 'event' && props.outboundUrl) {
    const disclosure = getThirdPartyHostDisclosure(props.outboundUrl);
    if (disclosure) {
      const hostPhrase = formatHostPhrase(disclosure.hostname, disclosure.platformLabel);
      outboundParagraph = `The Details link opens the organizer's official page for ${props.entityName} on a third-party site (${hostPhrase}). Hashtag Web3 does not run registration, ticketing, or payments for this event.`;
    }
  }

  return (
    <aside
      className="mt-10 space-y-2 rounded-lg border bg-muted/20 px-4 py-3 text-xs leading-relaxed text-muted-foreground"
      role="note"
      aria-label="Directory disclaimer"
    >
      <p>
        <span className="font-medium text-foreground">Disclaimer: </span>
        {baseCopy} {commonTail}
      </p>
      {outboundParagraph ? <p>{outboundParagraph}</p> : null}
    </aside>
  );
}