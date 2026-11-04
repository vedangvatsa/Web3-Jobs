import homepageJobs from '../../content/homepage-jobs.json';

/**
 * Returns dynamic title freshness strings evaluated at build-time.
 * Because all consumer pages are statically rendered ('force-static'),
 * this incurs zero runtime SSR / server compute cost.
 */

export function getFreshnessDate(date: Date = new Date()): { month: string; year: number; monthYear: string } {
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const year = date.getFullYear();
  return {
    month,
    year,
    monthYear: `${month} ${year}`,
  };
}

export function getTotalActiveJobsCount(): number {
  return typeof homepageJobs?.total === 'number' && homepageJobs.total > 0
    ? homepageJobs.total
    : 1500;
}

export function getFreshJobCountLabel(): string {
  const count = getTotalActiveJobsCount();
  const { monthYear } = getFreshnessDate();
  return `${count.toLocaleString('en-US')} Open in ${monthYear}`;
}
