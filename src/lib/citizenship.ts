import catalog from '../../content/citizenship.json';

export type CitizenshipProgram = typeof catalog.programs[number];
export type CitizenshipRoute = CitizenshipProgram['routes'][number];
export const citizenshipPrograms = catalog.programs;
export const citizenshipScope = catalog.scope;
export const citizenshipPath = (slug: string) => `/citizenship/${slug}`;
export const investmentAmount = (route: CitizenshipRoute) => `${route.currency} ${new Intl.NumberFormat('en-US').format(route.amount)}`;
export const sourceCheckedAt = (program: CitizenshipProgram) => program.sources.map(source => source.checkedAt).sort()[0];

export function selectedPrograms(programs: CitizenshipProgram[], value: string | null) {
  return [...new Set((value || '').split(','))].map(slug => programs.find(program => program.slug === slug)).filter((program): program is CitizenshipProgram => Boolean(program)).slice(0, 3);
}

export function filterPrograms(programs: CitizenshipProgram[], params: URLSearchParams) {
  const query = (params.get('q') || '').trim().toLocaleLowerCase();
  const kind = params.get('kind') || '';
  return programs.filter(program => (!params.get('region') || program.region === params.get('region')) &&
    (!kind || program.routes.some(route => route.kind === kind)) &&
    `${program.country} ${program.slug} ${program.code === 'TR' ? 'Turkey' : ''} ${program.summary} ${program.routes.map(route => route.name).join(' ')}`.toLocaleLowerCase().includes(query))
    .sort((a, b) => params.get('sort') === 'amount' ? Math.min(...a.routes.filter(route => !kind || route.kind === kind).map(route => route.amount)) - Math.min(...b.routes.filter(route => !kind || route.kind === kind).map(route => route.amount)) : a.country.localeCompare(b.country));
}
