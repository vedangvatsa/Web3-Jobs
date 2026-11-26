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
    }
  | {
      variant: 'grant';
      entityName: string;
      outboundUrl: string;
    }
  | {
      variant: 'api';
      entityName: string;
      outboundUrl: string;
    };

function formatHostPhrase(hostname: string, platformLabel: string | null): string {
  if (!platformLabel) return hostname;
  const labelKey = platformLabel.toLowerCase().replace(/[^a-z0-9]/g, '');
  const hostKey = hostname.replace(/^www\./, '').split('.')[0].toLowerCase();
  if (hostKey.includes(labelKey) || labelKey.includes(hostKey)) return platformLabel;
  return `${platformLabel} on ${hostname}`;
}

export function DirectoryDisclaimer(props: DirectoryDisclaimerProps = {}) {
  const variant = props.variant ?? 'generic';

  const baseCopy =
    variant === 'job'
      ? 'This role is listed for information only. Hashtag Web3 is not the employer. Verify the official link before you apply; we are not responsible for third-party sites.'
      : variant === 'event'
        ? 'This event is listed for information only. Hashtag Web3 is not the organizer. Verify the official link before you register; we are not responsible for third-party sites.'
        : variant === 'grant'
          ? 'This program is listed for information only. Hashtag Web3 does not administer the grant or run its application. Apply only via the official Details link; this page is not a form and will never ask for passwords, seed phrases, or wallet signatures.'
          : variant === 'api'
            ? 'This endpoint is listed for developer information only. Hashtag Web3 does not operate the API service or manage its infrastructure. Review official documentation before integrating into production; this directory will never ask for keys, seeds, or wallet signatures.'
            : 'Listings are for information only. Hashtag Web3 is not the employer or event organizer. Verify official links; we are not responsible for third-party sites.';

  let outboundNote: string | null = null;

  if (props.variant === 'job' && props.showOutboundNote !== false && props.outboundUrl) {
    const disclosure = getThirdPartyHostDisclosure(props.outboundUrl);
    if (disclosure) {
      const hostPhrase = formatHostPhrase(disclosure.hostname, disclosure.platformLabel);
      outboundNote = `The Apply link opens ${props.entityName}'s careers page on ${hostPhrase}. We do not host the application or collect résumés for this role.`;
    }
  }

  if (props.variant === 'event' && props.outboundUrl) {
    const disclosure = getThirdPartyHostDisclosure(props.outboundUrl);
    if (disclosure) {
      const hostPhrase = formatHostPhrase(disclosure.hostname, disclosure.platformLabel);
      outboundNote = `The Details link opens the organizer's page for ${props.entityName} on ${hostPhrase}. We do not handle registration, tickets, or payments.`;
    }
  }

  if (props.variant === 'grant' && props.outboundUrl) {
    const disclosure = getThirdPartyHostDisclosure(props.outboundUrl);
    if (disclosure) {
      const hostPhrase = formatHostPhrase(disclosure.hostname, disclosure.platformLabel);
      outboundNote = `The Details link opens ${props.entityName}'s official page on ${hostPhrase}. We do not host applications or collect submissions for this program.`;
    }
  }

  return (
    <aside
      className="mt-8 rounded-lg border bg-muted/20 px-4 py-3 text-xs leading-relaxed text-muted-foreground"
      role="note"
      aria-label="Directory disclaimer"
    >
      <p className="m-0">
        <span className="font-medium text-foreground">Disclaimer: </span>
        {baseCopy}
        {outboundNote ? ` ${outboundNote}` : null}
      </p>
    </aside>
  );
}