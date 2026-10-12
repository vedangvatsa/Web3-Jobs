import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NomadShell } from '@/components/nomads/shell';
import { CountryIdentity } from '@/components/nomads/city-identity';
import { NomadPanel, ResourceLink, SourceNote } from '@/components/nomads/ui';
import { Button } from '@/components/ui/button';
import { citizenshipPrograms, citizenshipPath, investmentAmount } from '@/lib/citizenship';
import { getPassportCountries } from '@/lib/nomads/server';
import { STATIC_OG } from '@/lib/job-og';

export const dynamicParams = false;
export function generateStaticParams() { return citizenshipPrograms.map(program => ({ country: program.slug })); }
type Props = { params: Promise<{ country: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country } = await params;
  const program = citizenshipPrograms.find(item => item.slug === country);
  if (!program) return { title: 'Country not found', robots: { index: false } };
  const title = `${program.country}: citizenship by investment`;
  const url = `https://hashtagweb3.com${citizenshipPath(program.slug)}`;
  return { title, description: program.summary, alternates: { canonical: url }, openGraph: { title, description: program.summary, url, type: 'website', images: [STATIC_OG.tools] }, twitter: { card: 'summary_large_image', title, description: program.summary, images: [STATIC_OG.tools] } };
}

export default async function CitizenshipCountryPage({ params }: Props) {
  const { country } = await params;
  const program = citizenshipPrograms.find(item => item.slug === country);
  if (!program) notFound();
  const passport = getPassportCountries().find(item => item.iso?.toUpperCase() === program.code);
  return <NomadShell title={`${program.country}: citizenship by investment`} location={<CountryIdentity name={`${program.status} investment route · ${program.region}`} code={program.code} />} actions={<><Button asChild className="h-auto min-h-11 whitespace-normal"><a href={program.officialUrl}>Official program</a></Button><ResourceLink href={`/citizenship?compare=${program.slug}`}>Compare countries</ResourceLink></>}>
    <p className="mb-8 max-w-3xl text-base leading-relaxed">{program.summary}</p>
    <section aria-labelledby="investment-routes"><h2 id="investment-routes" className="mb-4 text-2xl font-semibold">Reviewed investment routes</h2><p className="mb-6 text-sm text-muted-foreground">Thresholds below assume one main applicant. Additional fees are separate; these are not total application prices.</p><div className="grid gap-6 md:grid-cols-2">{program.routes.map(route => <NomadPanel key={route.name}><h3 className="text-lg font-semibold">{route.name}</h3><p className="my-3 text-2xl font-semibold tabular-nums">{investmentAmount(route)} <span className="text-sm font-normal text-muted-foreground">plus fees</span></p><p className="text-sm leading-relaxed">{route.capital}</p><h4 className="mt-5 font-medium">Additional costs</h4><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{route.fees}</p><ResourceLink href={`#source-${route.source}`}>Source for this route</ResourceLink></NomadPanel>)}</div></section>
    <section className="mt-10" aria-labelledby="conditions"><h2 id="conditions" className="mb-4 text-2xl font-semibold">Presence, timing and family</h2><dl className="divide-y border-y">{[['Presence', program.presence], ['Processing time', program.processing], ['Family applications', program.family]].map(([label, value]) => <div className="grid gap-2 py-4 sm:grid-cols-[12rem_1fr]" key={label}><dt className="font-medium">{label}</dt><dd className="text-sm leading-relaxed text-muted-foreground">{value || 'Not verified in the reviewed official sources. Confirm with the issuing authority.'}</dd></div>)}</dl></section>
    <section className="mt-10" aria-labelledby="official-sources"><h2 id="official-sources" className="mb-4 text-2xl font-semibold">Official sources</h2><ul className="space-y-4">{program.sources.map(source => <li id={`source-${source.id}`} key={source.id} className="scroll-mt-24"><ResourceLink href={source.url}>{source.title}</ResourceLink><p className="text-sm leading-relaxed">{source.supports}</p><p className="mt-1 text-xs text-muted-foreground">Reviewed <time dateTime={source.checkedAt}>{source.checkedAt}</time>. This is our source-check date, not a publication or legal effective date.</p></li>)}</ul></section>
    <SourceNote><p>Coverage is limited to the routes and sources above. Approval and eligibility remain with the authority. A qualifying investment does not guarantee citizenship.</p><nav aria-label="Related mobility resources" className="mt-3 flex flex-wrap gap-x-6"><ResourceLink href="/citizenship">All citizenship programs</ResourceLink><ResourceLink href="/nomads">Nomad cities</ResourceLink><ResourceLink href="/visas">Visa programs</ResourceLink>{passport && <ResourceLink href={`/visas?tab=checker&passport=${passport.id}`}>{program.country} passport entry</ResourceLink>}</nav></SourceNote>
  </NomadShell>;
}
