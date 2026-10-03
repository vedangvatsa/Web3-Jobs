import toolPaths from '../../../content/nomads/tool-paths.json';
import legacyRoutesJson from '../../../content/nomads/legacy-routes.json';

export const NOMAD_TOOL_PATHS = toolPaths;
export const NOMAD_LEGACY_ROUTES: Readonly<Record<string, string>> = legacyRoutesJson;
const tools = [
  { key: 'cities', label: 'Cities', title: 'Digital Nomad Resources', description: 'Explore city guides and find coworking spaces, coliving and places to stay on the map.', group: 'Explore' },
  { key: 'visas', label: 'Visas', title: 'Visas for Digital Nomads', description: 'Browse remote-stay references and passport entry requirements.', group: 'Explore' },
] as const;
export const NOMAD_TOOLS = tools.map(tool => ({ ...tool, href: toolPaths[tool.key] }));

export type NomadToolKey = typeof NOMAD_TOOLS[number]['key'];
export const getNomadTool = (key: string) => NOMAD_TOOLS.find(tool => tool.key === key);
export const NOMAD_STATIC_PATHS = NOMAD_TOOLS.map(tool => tool.href);

export function legacyNomadToolDestination(pathname: string): string | null {
  if (NOMAD_LEGACY_ROUTES[pathname]) return NOMAD_LEGACY_ROUTES[pathname];
  const legacy = Object.entries(toolPaths).find(([key]) => !['cities', 'visas'].includes(key) && pathname === `/nomads/${key}`);
  return legacy ? NOMAD_LEGACY_ROUTES[legacy[1]] || legacy[1] : null;
}
