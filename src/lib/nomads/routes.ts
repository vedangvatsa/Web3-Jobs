export const NOMAD_TOOLS = [
  { key: 'cities', href: '/nomads', label: 'Cities', title: 'Find your next base', description: 'Explore cities by budget, region and connectivity.', group: 'Explore' },
  { key: 'places', href: '/nomads/places', label: 'Places', title: 'Find a place to stay or work', description: 'Coworking, coliving, apartments, hostels and guesthouses.', group: 'Explore' },
  { key: 'compare', href: '/nomads/compare', label: 'Compare', title: 'Compare two cities', description: 'See living costs, connectivity and climate side by side.', group: 'Explore' },
  { key: 'cost-of-living', href: '/nomads/cost-of-living', label: 'Living costs', title: 'Plan your monthly budget', description: 'Compare rent, food, transport and workspace estimates.', group: 'Plan your stay' },
  { key: 'rankings', href: '/nomads/rankings', label: 'Rankings', title: 'City rankings', description: 'Explore internet benchmarks and reference mobility scores.', group: 'Explore' },
  { key: 'climate', href: '/nomads/climate', label: 'Climate', title: 'Find your preferred climate', description: 'Compare temperature, rain and humidity by month.', group: 'Plan your stay' },
  { key: 'visas', href: '/digital-nomad-visas', label: 'Visas & entry', title: 'Research visas and entry rules', description: 'Browse remote-stay references and passport entry requirements.', group: 'Plan your stay' },
  { key: 'timezones', href: '/nomads/timezones', label: 'Timezones', title: 'Find shared working hours', description: 'Compare working hours using real timezones and travel dates.', group: 'Plan your stay' },
  { key: 'schengen', href: '/nomads/schengen', label: 'Schengen days', title: 'Track your Schengen days', description: 'Plan trips against the rolling 90-day-in-180-day limit.', group: 'Plan your stay' },
  { key: 'runway', href: '/nomads/runway', label: 'Savings runway', title: 'Estimate your savings runway', description: 'Model savings, income, a reserve and monthly living costs.', group: 'Money & resources' },
  { key: 'taxes', href: '/nomads/taxes', label: 'Tax planning', title: 'Explore tax regimes', description: 'Review country notes and model your own effective-rate assumption.', group: 'Money & resources' },
  { key: 'resources', href: '/nomads/resources', label: 'Services', title: 'Find useful services', description: 'Insurance, banking, connectivity, transport and practical tools.', group: 'Money & resources' },
  { key: 'report', href: '/nomads/report', label: 'City report', title: 'Read the city report', description: 'A printable comparison of destinations from the same dataset.', group: 'Money & resources' },
] as const;

export type NomadToolKey = typeof NOMAD_TOOLS[number]['key'];
export const getNomadTool = (key: string) => NOMAD_TOOLS.find(tool => tool.key === key);
export const NOMAD_STATIC_PATHS = NOMAD_TOOLS.map(tool => tool.href);
