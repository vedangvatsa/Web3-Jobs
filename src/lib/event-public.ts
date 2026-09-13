import type { EventParty, PublicWeb3Event, Web3Event } from './events';
import { getEventExternalUrl } from './event-external-url';

function getPublicParty(party?: EventParty): EventParty | undefined {
  if (!party) return undefined;
  const { url, ...partyData } = party;
  const externalUrl = url
    ? getEventExternalUrl({ registrationUrl: url, website: undefined, url: '' })
    : undefined;
  return { ...partyData, ...(externalUrl ? { url: externalUrl } : {}) };
}

/** Removes internal provenance and raw destinations before events leave the server. */
export function getPublicEvent(event: Web3Event): PublicWeb3Event {
  const {
    source: _source,
    url: _url,
    website: _website,
    registrationUrl: _registrationUrl,
    partnerOffer,
    organizer,
    performer,
    ...eventData
  } = event;
  const externalUrl = getEventExternalUrl(event);
  const partnerOfferUrl = partnerOffer?.url
    ? getEventExternalUrl({ registrationUrl: partnerOffer.url, website: undefined, url: '' })
    : undefined;

  return {
    ...eventData,
    ...(externalUrl ? { url: externalUrl } : {}),
    ...(organizer ? { organizer: getPublicParty(organizer) } : {}),
    ...(performer ? { performer: getPublicParty(performer) } : {}),
    ...(partnerOffer ? {
      partnerOffer: {
        text: partnerOffer.text,
        ...(partnerOfferUrl ? { url: partnerOfferUrl } : {}),
      },
    } : {}),
  };
}
