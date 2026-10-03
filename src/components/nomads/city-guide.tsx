import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight, GitCompare } from 'lucide-react';
import { NomadShell } from '@/components/nomads/shell';
import { CityImage } from '@/components/nomads/city-image';
import { CityCard } from '@/components/nomads/city-card';
import { ClimateVisuals } from '@/components/nomads/climate-visuals';
import { PlaceCard } from '@/components/nomads/place-card';
import { CityConnections, type CityConnectionTab } from '@/components/nomads/city-connections';
import { CountryFlag } from '@/components/country-flag';
import { JobCard } from '@/components/job-card';
import { EventCard } from '@/components/event-card';
import { CompanyCard } from '@/components/company-card';
import { PopupCard } from '@/components/popup-card';
import { Card } from '@/components/ui/card';
import { MetricCard, ResourceLink, buttonStyle } from '@/components/nomads/ui';
import { getNomadCity, getCityPlaces } from '@/lib/nomads/server';
import { nomadRelatedContent } from '@/lib/nomads/related';
import { getCompanySlug } from '@/lib/job-slugs';
import { money, metric, cityPath, citySummary } from '@/lib/nomads/types';
import { JsonLd } from '@/components/json-ld';

export default async function NomadCityPage({ slug }: { slug: string }) {
  const city = getNomadCity(slug);
  if (!city) notFound();
  const related = await nomadRelatedContent(city);
  const places = getCityPlaces(city.slug).sort((a, b) => b.quality - a.quality);
  const workspaces = places.filter(place => place.category === 'coworking').slice(0, 3);
  const stays = places.filter(place => place.category !== 'coworking').slice(0, 3);
  const costs = [{ label: 'Rent', value: city.cost.rent }, { label: 'Food', value: city.cost.food }, { label: 'Transport', value: city.cost.transport }, { label: 'Workspace', value: city.cost.coworking }, { label: 'Other', value: city.cost.other }];
  const nearby = city.nearby.map(slug => getNomadCity(slug)).filter((item): item is NonNullable<typeof item> => !!item).slice(0, 6);
  const connections: CityConnectionTab[] = [
    { id: 'jobs', label: 'Jobs', total: related.jobs.total, location: related.jobs.location, href: '/jobs', content: related.jobs.items.map(job => { const logo = related.logos[getCompanySlug(job.company)]; return <JobCard key={job.slug} job={job} logoUrl={logo?.logo} faviconUrl={logo?.favicon} showLocation />; }) },
    { id: 'events', label: 'Events', total: related.events.total, location: related.events.location, href: '/events', content: related.events.items.map(event => <EventCard key={event.slug || event.id} event={event} />) },
    { id: 'companies', label: 'Companies', total: related.companies.total, location: related.companies.location, href: '/companies', content: related.companies.items.map(company => { const logo = related.logos[company.slug]; return <CompanyCard key={company.slug} company={company} logoUrl={logo?.logo} faviconUrl={logo?.favicon} subtitle={`${company.localJobCount} ${company.localJobCount === 1 ? 'role' : 'roles'} in ${related.companies.location}`} />; }) },
    { id: 'societies', label: 'Societies', total: related.popups.total, location: related.popups.location, href: '/popups', content: related.popups.items.map(popup => <PopupCard key={popup.slug} popup={popup} />) },
  ];

  return <NomadShell title={city.name} location={<span className="inline-flex items-center gap-2"><CountryFlag code={city.countryCode} />{city.country} · {city.continent}</span>} align="left" actions={<div className="flex flex-wrap gap-2"><Link href="/nomads" prefetch={false} className={buttonStyle}>Explore destinations</Link><Link href={`/nomads?view=compare&a=${city.slug}`} prefetch={false} className={buttonStyle}><GitCompare className="h-4 w-4" aria-hidden />Compare this city</Link></div>}>
    <JsonLd data={{ '@context': 'https://schema.org', '@type': 'Place', name: `${city.name}, ${city.country}`, url: `https://hashtagweb3.com${cityPath(city.slug)}`, geo: { '@type': 'GeoCoordinates', latitude: city.lat, longitude: city.lon } }} />
    <div className="grid items-stretch gap-4 lg:grid-cols-[1.35fr_1fr]">
      <CityImage name={city.name} country={city.country} src={city.image} thumbnail={city.thumbnail} hero className="rounded-lg lg:aspect-auto lg:h-64" />
      <dl className="grid grid-cols-2 gap-3"><MetricCard label="Monthly living estimate" value={money(city.cost.monthly_total)} detail="USD · reference budget" /><MetricCard label="Fixed broadband" value={metric(city.internet?.download_mbps, ' Mbps')} detail={city.internet?.quarter || 'Source benchmark'} /><MetricCard label="Listed places" value={city.spaces.total} detail="Stays and workspaces" /><MetricCard label="Average temperature" value={metric(city.weather.avg_temp, '°C')} detail="Historical annual average" /></dl>
    </div>
    <nav aria-label="City guide sections" className="my-6 flex flex-wrap gap-x-5 gap-y-1 border-y border-border/70 py-1 text-sm font-medium">{[['budget', 'Living costs'], ['climate', 'Climate'], ['places', 'Stays & workspaces'], ['community', 'Work & community']].map(([id, label]) => <a key={id} href={`#${id}`} className="inline-flex min-h-11 items-center text-muted-foreground hover:text-foreground">{label}</a>)}<Link href="/digital-nomad-visas" prefetch={false} className="inline-flex min-h-11 items-center text-muted-foreground hover:text-foreground">Visas & entry ↗</Link></nav>
    <div className="space-y-8">
      <section id="budget" className="scroll-mt-32">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h2 className="text-xl font-semibold tracking-tight">A monthly budget in {city.name}</h2><ResourceLink href="/nomads?category=cost">Compare living costs</ResourceLink></div>
        <dl className="grid grid-cols-2 gap-3 lg:grid-cols-5">{costs.map(cost => <MetricCard key={cost.label} label={cost.label} value={money(cost.value)} />)}</dl>
      </section>
      <section id="climate" className="scroll-mt-32">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h2 className="text-xl font-semibold tracking-tight">Climate through the year</h2><ResourceLink href="/nomads?category=temperature">Compare climates</ResourceLink></div>
        <ClimateVisuals months={city.weather.monthly} name={city.name} />
      </section>
      <section id="places" className="scroll-mt-32">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h2 className="text-xl font-semibold tracking-tight">Places to stay and work</h2><ResourceLink href={`/nomads?city=${city.slug}#places-map`}>View {city.spaces.total} places on the map</ResourceLink></div>
        {places.length ? <div className="space-y-4">{[{ title: 'Workspaces', items: workspaces }, { title: 'Stays & coliving', items: stays }].filter(group => group.items.length).map(group => <div key={group.title}><h3 className="mb-2 text-sm font-medium text-muted-foreground">{group.title}</h3><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{group.items.map(place => <PlaceCard key={place.id} place={place} heading="h3" />)}</div></div>)}</div> : <p className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">No directory places are listed for this city yet. <Link href="/nomads" prefetch={false} className="font-medium text-primary hover:underline">Explore other cities ↗</Link></p>}
        <p className="mt-3 text-xs text-muted-foreground">Timezone: {city.timezone.replace(/_/g, ' ')}</p>
      </section>
      <section id="community" className="scroll-mt-32">
        <h2 className="mb-4 text-xl font-semibold tracking-tight">Work, events and community</h2>
        <CityConnections key={city.slug} tabs={connections} />
        {city.communities.length > 0 && <div className="mt-5"><h3 className="mb-2 text-sm font-semibold">Local communities</h3><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{city.communities.slice(0, 3).map(link => <Card key={link.url} className="border-border/70 shadow-none"><a href={link.url} target="_blank" rel="noopener noreferrer" className="flex min-h-16 items-center justify-between gap-3 p-3 text-sm"><span className="min-w-0"><span className="line-clamp-1 font-medium">{link.name}</span><span className="mt-1 block text-xs text-muted-foreground">{link.platform}</span></span><ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden /></a></Card>)}</div>{city.communities.length > 3 && <details className="mt-2"><summary className="min-h-11 cursor-pointer py-3 text-xs font-medium">More community links ({city.communities.length - 3})</summary><ul className="grid gap-x-6 sm:grid-cols-2">{city.communities.slice(3).map(link => <li key={link.url}><a href={link.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 text-sm hover:underline">{link.name}<ArrowUpRight className="h-3.5 w-3.5" aria-hidden /></a></li>)}</ul></details>}</div>}
      </section>
      {nearby.length > 0 && <section aria-labelledby="nearby-cities-title"><h2 id="nearby-cities-title" className="mb-4 text-xl font-semibold tracking-tight">Other cities to explore</h2><div className="flex flex-wrap gap-3">{nearby.map(nearbyCity => <CityCard key={nearbyCity.slug} city={citySummary(nearbyCity)} heading="h3" compact className="basis-[calc(50%-0.375rem)] grow md:basis-[calc(33.333%-0.5rem)] xl:basis-0" />)}</div></section>}
    </div>
  </NomadShell>;
}
