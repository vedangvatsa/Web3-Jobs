import type { Hackathon } from '@/types';
import hackathonsData from '../../content/hackathons-runtime.json';

const hackathons = hackathonsData as Hackathon[];

export function getHackathonsSync(): Hackathon[] {
  return hackathons;
}

export function getHackathonEcosystems(): string[] {
  const ecosystems = new Set<string>();
  hackathons.forEach((h) => {
    if (h.ecosystem) ecosystems.add(h.ecosystem);
  });
  return ['All', ...Array.from(ecosystems).sort()];
}

export function getHackathonFormats(): string[] {
  const formats = new Set<string>();
  hackathons.forEach((h) => {
    if (h.format) formats.add(h.format);
  });
  return ['All', ...Array.from(formats).sort()];
}
