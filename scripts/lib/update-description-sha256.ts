import { createHash } from 'node:crypto';
import type { Web3Event } from '../../src/lib/events';

export function sha256Description(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}

export function touchEventDescriptionProvenance(
  event: Web3Event,
  description: string,
): Web3Event {
  const next = { ...event, description };
  const hash = sha256Description(description);
  if (next.descriptionSource) {
    next.descriptionSource = { ...next.descriptionSource, sha256: hash };
  }
  if (next.sourceVerification && 'sha256' in next.sourceVerification) {
    next.sourceVerification = { ...next.sourceVerification, sha256: hash };
  }
  return next;
}