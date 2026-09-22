import curated from '../../content/events/sources/curated-events.json';
import kbw from '../../content/events/sources/kbw-luma-events.json';
import ibw from '../../content/events/sources/ibw-side-events.json';
import india from '../../content/events/sources/india-luma-events.json';
import crypto from '../../content/events/sources/luma-crypto-events.json';
import batch from '../../content/events/sources/luma-batch-events.json';
import cache from '../../content/events/sources/events-cache.json';
import type { Web3Event } from './events';

// Build-time registry. Order matches listing precedence; keep raw feeds out of client bundles.
export const EVENT_SOURCES: Array<{ file: string; events: Web3Event[] }> = [
  { file: 'curated-events.json', events: curated as Web3Event[] },
  { file: 'kbw-luma-events.json', events: kbw as Web3Event[] },
  { file: 'ibw-side-events.json', events: ibw as Web3Event[] },
  { file: 'india-luma-events.json', events: india as Web3Event[] },
  { file: 'luma-crypto-events.json', events: crypto as Web3Event[] },
  { file: 'luma-batch-events.json', events: batch as Web3Event[] },
  { file: 'events-cache.json', events: cache as Web3Event[] },
];
