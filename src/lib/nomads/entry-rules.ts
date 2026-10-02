import type { EntryRule, PassportRules } from './types';

export const ENTRY_RULES: Record<EntryRule['t'], { label: string; color: string }> = {
  fm: { label: 'Freedom of movement', color: '#8b5cf6' },
  vf: { label: 'Visa-free', color: '#059669' },
  voa: { label: 'Visa on arrival', color: '#2563eb' },
  ev: { label: 'eVisa / electronic authorization', color: '#d97706' },
  vr: { label: 'Visa required', color: '#dc2626' },
  na: { label: 'Not available', color: '#71717a' },
};

export function validPassportRules(value: unknown): value is PassportRules {
  if (!value || typeof value !== 'object') return false;
  const data = value as Partial<PassportRules>;
  return typeof data.passport === 'string' && Array.isArray(data.destinations) && data.destinations.every(item =>
    item && typeof item.name === 'string' && (item.iso === null || typeof item.iso === 'string') &&
    item.rule && Object.hasOwn(ENTRY_RULES, item.rule.t) && Number.isFinite(item.rule.d),
  );
}
