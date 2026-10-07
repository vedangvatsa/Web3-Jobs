import { safeExternalUrl, type EntryRule, type EntrySource, type PassportRules } from './types';

export const ENTRY_RULES: Record<EntryRule['t'], { label: string; color: string }> = {
  fm: { label: 'Freedom of movement', color: '#8b5cf6' },
  vf: { label: 'Visa-free', color: '#059669' },
  voa: { label: 'Visa on arrival', color: '#2563eb' },
  ev: { label: 'eVisa', color: '#d97706' },
  eta: { label: 'Electronic authorization / registration', color: '#b45309' },
  vr: { label: 'Visa required', color: '#dc2626' },
  na: { label: 'Entry not permitted', color: '#71717a' },
  unknown: { label: 'Not yet verified', color: '#a1a1aa' },
};

const validDate = (value: unknown): value is string => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;

export const entryRuleLabel = (rule: EntryRule) => rule.label || ENTRY_RULES[rule.t].label;
export const matchesEntryCategory = (rule: EntryRule, category: string) => rule.t === category || Boolean(rule.a?.includes(category as EntryRule['t']));

export function effectiveEntryRule(rule: EntryRule, sources: Record<string, EntrySource>, today = new Date().toISOString().slice(0, 10)): EntryRule {
  const source = rule.s && Object.hasOwn(sources, rule.s) ? sources[rule.s] : undefined;
  if (!source || !validDate(source.checkedAt) || source.checkedAt > today || (rule.until && rule.until < today)) return { t: 'unknown', d: 0 };
  return rule;
}

export function validPassportRules(value: unknown): value is PassportRules {
  if (!value || typeof value !== 'object') return false;
  const data = value as Partial<PassportRules>;
  if (data.version !== 3 || typeof data.passport !== 'string' || typeof data.scope !== 'string' || !data.sources || typeof data.sources !== 'object' || Array.isArray(data.sources)) return false;
  if (!Object.values(data.sources).every(source => source && ['government', 'reference'].includes(source.kind) && typeof source.title === 'string' && validDate(source.checkedAt) && Array.isArray(source.urls) && source.urls.length > 0 && source.urls.every(url => safeExternalUrl(url)?.startsWith('https://')))) return false;
  return Array.isArray(data.destinations) && data.destinations.every(item =>
    item && typeof item.name === 'string' && (item.iso === null || typeof item.iso === 'string') &&
    item.rule && Object.hasOwn(ENTRY_RULES, item.rule.t) && Number.isInteger(item.rule.d) && item.rule.d >= 0 &&
    (item.rule.n === undefined || typeof item.rule.n === 'string') && (item.rule.until === undefined || validDate(item.rule.until)) &&
    (item.rule.stay === undefined || (typeof item.rule.stay === 'string' && item.rule.d === 0)) &&
    (item.rule.label === undefined || (typeof item.rule.label === 'string' && item.rule.label.length > 0 && item.rule.label.length <= 140)) &&
    (item.rule.a === undefined || (Array.isArray(item.rule.a) && item.rule.a.includes(item.rule.t) && item.rule.a.every(type => Object.hasOwn(ENTRY_RULES, type) && type !== 'unknown'))) &&
    (item.rule.t === 'unknown' ? item.rule.d === 0 && item.rule.stay === undefined : typeof item.rule.s === 'string' && Object.hasOwn(data.sources!, item.rule.s)),
  );
}
