/**
 * Precomputed Top 100 Web3 Employers Index data (content/top100-employers.json).
 * Generated offline via `npx tsx scripts/compute-top100.ts`.
 */
import data from '../../content/top100-employers.json';
import type { Top100IndexData, Top100Employer } from '@/types/top100';

export const top100Data: Top100IndexData = data as Top100IndexData;

export function getTop100Employers(): Top100Employer[] {
  return top100Data.employers;
}

export function getTop100EmployerBySlug(slug: string): Top100Employer | undefined {
  return top100Data.employers.find((e) => e.slug.toLowerCase() === slug.toLowerCase());
}

export function fmtInt(n: number): string {
  return n.toLocaleString('en-US');
}

export function fmtPct(n: number): string {
  return `${n}%`;
}
