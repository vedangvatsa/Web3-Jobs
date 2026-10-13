import catalog from '../../content/citizenship.json';

export type CitizenshipProgram = typeof catalog.programs[number];
export type CitizenshipRoute = CitizenshipProgram['routes'][number];
export const citizenshipPrograms = catalog.programs;
export const investmentAmount = (route: CitizenshipRoute) => route.amount === null || route.currency === null
  ? route.kind === 'Announced investment' ? 'Terms announced' : 'Case by case'
  : `${route.currency} ${new Intl.NumberFormat('en-US').format(route.amount)}`;

export function programRoutes(program: CitizenshipProgram, kind: string | null = null) {
  return program.routes.filter(route => !kind || route.kind === kind);
}

function compareAmounts(a: CitizenshipRoute, b: CitizenshipRoute) {
  return (a.currency || '').localeCompare(b.currency || '') || (a.amount ?? Infinity) - (b.amount ?? Infinity);
}

export function startingInvestments(routes: CitizenshipRoute[]) {
  return [...routes].sort(compareAmounts).filter((route, index, sorted) => !index || route.currency !== sorted[index - 1].currency);
}

export function officialProgramUrl(program: CitizenshipProgram, kind: string | null = null) {
  if (!kind) return program.officialUrl;
  const route = startingInvestments(programRoutes(program, kind))[0];
  return program.sources.find(source => source.id === route?.source)?.url || program.officialUrl;
}

export function selectedPrograms(programs: CitizenshipProgram[], value: string | null) {
  return [...new Set((value || '').split(','))].map(slug => programs.find(program => program.slug === slug)).filter((program): program is CitizenshipProgram => Boolean(program)).slice(0, 3);
}

export function filterPrograms(programs: CitizenshipProgram[], params: URLSearchParams) {
  const query = (params.get('q') || '').trim().toLocaleLowerCase();
  const kind = params.get('kind') || '';
  return programs.filter(program => (!params.get('region') || program.region === params.get('region')) &&
    programRoutes(program, kind).length > 0 &&
    `${program.country} ${program.slug} ${program.code === 'TR' ? 'Turkey' : ''} ${program.summary} ${program.routes.map(route => `${route.name} ${route.kind}`).join(' ')}`.toLocaleLowerCase().includes(query))
    .sort((a, b) => a.country.localeCompare(b.country));
}
