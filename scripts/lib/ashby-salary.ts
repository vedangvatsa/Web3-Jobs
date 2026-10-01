type Compensation = {
  scrapeableCompensationSalarySummary?: string | null;
  summaryComponents?: Array<{ compensationType?: string; currencyCode?: string | null; interval?: string; minValue?: number | null; maxValue?: number | null }>;
};

export function getAshbySalary(compensation?: Compensation): string | undefined {
  const annual = compensation?.summaryComponents?.find(component => component.compensationType === 'Salary' && component.interval === '1 YEAR' && component.currencyCode === 'USD');
  if (annual?.minValue != null && annual.maxValue != null) {
    return `$${annual.minValue.toLocaleString('en-US')}–$${annual.maxValue.toLocaleString('en-US')} per year (USD)`;
  }
  return compensation?.scrapeableCompensationSalarySummary?.trim() || undefined;
}
