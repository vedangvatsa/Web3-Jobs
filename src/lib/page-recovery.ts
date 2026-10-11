export const RECOVERY_SECTIONS = {
  jobs: {
    label: 'Jobs', href: '/jobs', description: 'Current openings',
  },
  events: {
    label: 'Events', href: '/events', description: 'Meetups & summits',
  },
  articles: {
    label: 'Guides', href: '/blog', description: 'Careers & skills',
  },
  companies: {
    label: 'Companies', href: '/companies', description: 'Teams & openings',
  },
  news: {
    label: 'News', href: '/news', description: 'Latest reporting',
  },
  learn: {
    label: 'Learn Web3', href: '/learn', description: 'Courses & lessons',
  },
  glossary: {
    label: 'Glossary', href: '/glossary', description: 'Web3 definitions',
  },
  nomads: {
    label: 'Nomad cities', href: '/nomads', description: 'Cities & costs',
  },
  visas: {
    label: 'Visa programs', href: '/visas', description: 'Rules & eligibility',
  },
} as const;

export type RecoverySection = keyof typeof RECOVERY_SECTIONS;

const pathSections: Record<string, RecoverySection> = {
  job: 'jobs', jobs: 'jobs', company: 'companies', companies: 'companies',
  event: 'events', events: 'events',
  blog: 'articles', article: 'articles', articles: 'articles', learn: 'learn', news: 'news',
  glossary: 'glossary',
  nomads: 'nomads',
  visa: 'visas', visas: 'visas', 'digital-nomad-visas': 'visas',
};

function oneEditApart(left: string, right: string): boolean {
  if (Math.abs(left.length - right.length) > 1) return false;
  if (left.length !== right.length) {
    const [short, long] = left.length < right.length ? [left, right] : [right, left];
    return [...long].some((_, index) => long.slice(0, index) + long.slice(index + 1) === short);
  }
  const differences = [...left].flatMap((letter, index) => letter !== right[index] ? [index] : []);
  if (differences.length === 1) return true;
  const [first, second] = differences;
  return differences.length === 2 && second === first + 1 && left[first] === right[second] && left[second] === right[first];
}

export function recoveryContext(pathname: string) {
  const path = pathname.split(/[?#]/, 1)[0].slice(0, 512);
  let decoded = path;
  try { decoded = decodeURIComponent(path); } catch {}
  const segments = decoded.toLowerCase().split('/').filter(Boolean);
  const first = segments[0] || '';
  const exact = Object.hasOwn(pathSections, first) ? pathSections[first] : undefined;
  const similar = !exact && segments.length === 1 && /^[a-z]{4,16}$/.test(first)
    ? Object.entries(RECOVERY_SECTIONS).find(([, section]) => oneEditApart(first, section.href.slice(1)))?.[0] as RecoverySection | undefined
    : undefined;
  const section = exact || similar;
  return {
    section, suggestion: similar,
  };
}

export function recoveryDestinations(section?: RecoverySection): RecoverySection[] {
  if (section === 'nomads') return ['nomads', 'visas', 'jobs', 'events'];
  if (section === 'visas') return ['visas', 'nomads', 'jobs', 'articles'];
  if (section === 'companies') return ['companies', 'jobs', 'articles', 'learn'];
  if (section === 'news') return ['news', 'articles', 'events', 'glossary'];
  if (section === 'learn') return ['learn', 'glossary', 'articles', 'jobs'];
  const defaults: RecoverySection[] = ['jobs', 'events', 'articles', 'glossary'];
  return section ? [section, ...defaults.filter(item => item !== section)] : defaults;
}
