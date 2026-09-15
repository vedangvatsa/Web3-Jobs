/**
 * Precomputed hiring report metrics (content/hiring-report-stats.json).
 * Regenerated offline via `npm run hiring-report:stats` — never computed on page requests.
 */
import data from '../../content/hiring-report-stats.json';

export type HiringReportStats = typeof data;

export const hiringReportStats: HiringReportStats = data;

export function fmtInt(n: number): string {
  return n.toLocaleString('en-US');
}

export function fmtPct(n: number, decimals = 1): string {
  return n.toFixed(decimals);
}

export function fmtUsd(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

export function fmtUsdK(n: number): string {
  return `$${Math.round(n / 1000)}k`;
}

export function pctOfTotal(count: number, total: number): number {
  return Math.round((1000 * count) / total) / 10;
}
