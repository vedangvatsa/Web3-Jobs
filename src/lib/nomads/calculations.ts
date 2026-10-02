export type Trip = { id: string; start: string; end: string };
const DAY = 86400000;

export function calendarDay(value: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) return null;
  return Math.floor(date.getTime() / DAY);
}

export function tripError(trip: Trip): string | null {
  if (!trip.start || !trip.end) return 'Enter both arrival and departure dates.';
  const start = calendarDay(trip.start), end = calendarDay(trip.end);
  if (start === null || end === null) return 'Enter valid calendar dates.';
  return end < start ? 'Departure must be on or after arrival.' : null;
}

export function schengenDays(trips: Trip[], asOf: string): number {
  const reference = calendarDay(asOf);
  if (reference === null) return 0;
  const ranges = trips.filter(trip => !tripError(trip)).map(trip => [Math.max(calendarDay(trip.start)!, reference - 179), Math.min(calendarDay(trip.end)!, reference)]).filter(([start, end]) => start <= end).sort((a, b) => a[0] - b[0]);
  let total = 0, lastEnd = -Infinity;
  for (const [start, end] of ranges) { const first = Math.max(start, lastEnd + 1); if (end >= first) total += end - first + 1; lastEnd = Math.max(lastEnd, end); }
  return total;
}

export function nextSchengenCapacity(trips: Trip[], asOf: string): string | null {
  const day = calendarDay(asOf);
  if (day === null) return null;
  for (let offset = 0; offset <= 180; offset++) {
    const value = new Date((day + offset) * DAY).toISOString().slice(0, 10);
    if (schengenDays(trips, value) < 90) return value;
  }
  return null;
}

export function savingsRunway(savings: number, reserve: number, monthlyCost: number, monthlyIncome = 0, multiplier = 1): number | null {
  if (![savings, reserve, monthlyCost, monthlyIncome, multiplier].every(Number.isFinite) || savings < 0 || reserve < 0 || monthlyCost <= 0 || monthlyIncome < 0 || multiplier <= 0) return null;
  const burn = monthlyCost * multiplier - monthlyIncome;
  return burn <= 0 ? Infinity : Math.max(0, savings - reserve) / burn;
}

export function taxScenario(income: number, effectiveRate: number): { tax: number; remaining: number } | null {
  if (!Number.isFinite(income) || !Number.isFinite(effectiveRate) || income < 0 || effectiveRate < 0 || effectiveRate > 100) return null;
  const tax = income * effectiveRate / 100;
  return { tax, remaining: income - tax };
}
