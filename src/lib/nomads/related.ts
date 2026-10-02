import { getEvents } from '@/lib/events-server';
import { getEventListItem } from '@/lib/event-public';
import { isEventUpcoming } from '@/lib/events';
import { normalizeEventMapCity, getEventMapCountryCode } from '@/lib/event-map-locations';
import { getJobs } from '@/lib/jobs';
import { getAllPopups } from '@/lib/popups';
import { getCompanies } from '@/lib/companies';
import { getCompanySlug } from '@/lib/job-slugs';
import { buildCompanyLogoMapSync } from '@/lib/job-logo-map';
import { cityAliases, locationMatchesCity, locationMatchesCountry } from './location-match';
import type { Job, CompanySummary } from '@/types';
import type { NomadCity } from './types';

export type ScopedResults<T> = { items: T[]; total: number; location: string };

function choose<T>(cityItems: T[], countryItems: T[], city: NomadCity): ScopedResults<T> {
  const exact = cityItems.length > 0, items = exact ? cityItems : countryItems;
  return { items: items.slice(0, 3), total: items.length, location: exact ? city.name : city.country };
}

function jobSummary(job: Job): Job {
  return { id: job.id, slug: job.slug, title: job.title, company: job.company, location: job.location, date: job.date, source: job.source, link: job.link };
}

export async function nomadRelatedContent(city: NomadCity) {
  const [events, jobs, companies] = await Promise.all([getEvents(), getJobs(), getCompanies()]);
  const aliases = new Set(cityAliases(city));
  const countryEvents = events.filter(event => isEventUpcoming(event)).map(getEventListItem).filter(event => getEventMapCountryCode(event.country) === city.countryCode).sort((a, b) => Date.parse(a.startDate) - Date.parse(b.startDate));
  const cityEvents = countryEvents.filter(event => event.city && aliases.has(normalizeEventMapCity(event.city, city.countryCode)));
  const countryJobs = jobs.filter(job => locationMatchesCountry(job.location || '', city));
  const cityJobs = countryJobs.filter(job => locationMatchesCity(job.location || '', city));
  const chosenJobs = choose(cityJobs, countryJobs, city);
  const matchingJobs = cityJobs.length ? cityJobs : countryJobs;
  const companyCounts = new Map<string, number>();
  for (const job of matchingJobs) { const slug = getCompanySlug(job.company); companyCounts.set(slug, (companyCounts.get(slug) || 0) + 1); }
  const matchingCompanies = companies.filter(company => companyCounts.has(company.slug)).sort((a, b) => companyCounts.get(b.slug)! - companyCounts.get(a.slug)!);
  const countryPopups = getAllPopups().filter(popup => locationMatchesCountry(popup.location, city));
  const cityPopups = countryPopups.filter(popup => locationMatchesCity(popup.location, city));
  const chosenPopups = choose(cityPopups, countryPopups, city);
  return {
    events: choose(cityEvents, countryEvents, city),
    jobs: { ...chosenJobs, items: chosenJobs.items.map(jobSummary) },
    companies: { items: matchingCompanies.slice(0, 3).map((company): CompanySummary & { localJobCount: number } => ({ slug: company.slug, name: company.name, jobCount: company.jobCount, localJobCount: companyCounts.get(company.slug)! })), total: matchingCompanies.length, location: chosenJobs.location },
    popups: { ...chosenPopups, items: chosenPopups.items.map(popup => ({ slug: popup.slug, name: popup.name, location: popup.location, summary: popup.summary, image: popup.image })) },
    logos: buildCompanyLogoMapSync(matchingJobs),
  };
}
