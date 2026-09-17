export const WASET_ICBT_SERIES_ID = 'curated-waset-icbt-series';
export const WASET_ICBT_EXACT_NAME = 'International Conference on Blockchain Technology (ICBT)';

type WasetIcbtEventRef = {
  id?: string;
  name?: string;
  source?: string;
  website?: string | null;
  url?: string | null;
};

/** Per-city ConferenceIndex / WASET listings that share one rotating program. */
export function isWasetIcbtDuplicateEvent(event: WasetIcbtEventRef): boolean {
  if (event.id === WASET_ICBT_SERIES_ID) return false;
  if ((event.name || '').trim() !== WASET_ICBT_EXACT_NAME) return false;
  if (event.source === 'conferenceindex') return true;
  if (event.id?.startsWith('ci-') && /blockchain-technology-icbt/i.test(event.id)) return true;
  const href = `${event.website || ''} ${event.url || ''}`;
  return /waset\.org\/blockchain-technology-conference/i.test(href);
}
