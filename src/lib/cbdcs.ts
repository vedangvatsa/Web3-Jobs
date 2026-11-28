import type { CbdcProfile } from '@/types';
import cbdcData from '../../content/cbdc-catalog.json';

const cbdcs = cbdcData as CbdcProfile[];

export function getCbdcsSync(): CbdcProfile[] {
  return cbdcs;
}

export function getCbdcBySlug(slug: string): CbdcProfile | undefined {
  return cbdcs.find((c) => c.slug === slug || c.id === slug);
}

export function getAllCbdcSlugs(): string[] {
  return cbdcs.map((c) => c.slug);
}

export function getCbdcStatuses(): string[] {
  const statuses = new Set<string>();
  cbdcs.forEach((c) => {
    if (c.status) statuses.add(c.status);
  });
  return ['All', 'Launched', 'Pilot', 'Proof of concept', 'Research', 'Paused', 'Cancelled'].filter(
    (s) => s === 'All' || statuses.has(s)
  );
}

export function getCbdcTypes(): string[] {
  const types = new Set<string>();
  cbdcs.forEach((c) => {
    if (c.type) types.add(c.type);
  });
  return ['All', ...Array.from(types).sort()];
}

export function getCbdcTechOptions(): string[] {
  return ['All', 'DLT', 'Traditional'];
}
