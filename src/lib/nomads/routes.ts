import toolPaths from '../../../content/nomads/tool-paths.json';

export const NOMAD_TOOL_PATHS = toolPaths;
const tools = [
  { key: 'cities', label: 'Cities', title: 'Nomad Toolkit', description: 'Explore cities by budget, region and connectivity.', group: 'Explore' },
  { key: 'places', label: 'Places', title: 'Places to stay & work', description: 'Coworking, coliving, apartments, hostels and guesthouses.', group: 'Explore' },
  { key: 'compare', label: 'Compare', title: 'Compare cities', description: 'See living costs, connectivity and climate side by side.', group: 'Explore' },
  { key: 'cost-of-living', label: 'Living costs', title: 'Cost of living', description: 'Compare rent, food, transport and workspace estimates.', group: 'Plan your stay' },
  { key: 'rankings', label: 'Rankings', title: 'City rankings', description: 'Explore internet benchmarks and reference mobility scores.', group: 'Explore' },
  { key: 'climate', label: 'Climate', title: 'Climate finder', description: 'Compare temperature, rain and humidity by month.', group: 'Plan your stay' },
  { key: 'visas', label: 'Visas & entry', title: 'Visas for Digital Nomads', description: 'Browse remote-stay references and passport entry requirements.', group: 'Plan your stay' },
  { key: 'timezones', label: 'Timezones', title: 'Timezone planner', description: 'Compare working hours using real timezones and travel dates.', group: 'Plan your stay' },
  { key: 'schengen', label: 'Schengen days', title: 'Schengen day tracker', description: 'Plan trips against the rolling 90-day-in-180-day limit.', group: 'Plan your stay' },
  { key: 'runway', label: 'Savings runway', title: 'Savings runway', description: 'Model savings, income, a reserve and monthly living costs.', group: 'Money & resources' },
  { key: 'taxes', label: 'Tax planning', title: 'Tax planning', description: 'Review country notes and model your own effective-rate assumption.', group: 'Money & resources' },
  { key: 'resources', label: 'Services', title: 'Nomad services', description: 'Insurance, banking, connectivity, transport and practical tools.', group: 'Money & resources' },
  { key: 'report', label: 'City report', title: 'City report', description: 'A printable comparison of destinations from the same dataset.', group: 'Money & resources' },
] as const;
export const NOMAD_TOOLS = tools.map(tool => ({ ...tool, href: toolPaths[tool.key] }));

export type NomadToolKey = typeof NOMAD_TOOLS[number]['key'];
export const getNomadTool = (key: string) => NOMAD_TOOLS.find(tool => tool.key === key);
export const NOMAD_STATIC_PATHS = NOMAD_TOOLS.map(tool => tool.href);
