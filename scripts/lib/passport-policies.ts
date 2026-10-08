import type { EntryRule, EntrySource, EntryReview, PassportCountry, PassportRules } from '../../src/lib/nomads/types';
import { effectiveEntryRule, validPassportRules } from '../../src/lib/nomads/entry-rules';
import type { PassportIndexSnapshot } from './passport-index';
import type { Factchecks } from './passport-factchecks';

type Policy = EntryRule & { passports: string[]; destinations: string[] };
type PolicyFile = { version: number; scope: string; sources: Record<string, Omit<EntrySource, 'kind'>>; policies: Array<Omit<Policy, 't'> & { t: string }> };

export function compilePassportRules(passport: PassportCountry, countries: PassportCountry[], file: PolicyFile, today = new Date().toISOString().slice(0, 10), reference?: PassportIndexSnapshot, audit?: Factchecks): PassportRules {
  if (file.version !== 1) throw new Error('Unsupported entry policy version');
  if (reference && reference.version !== 1) throw new Error('Unsupported Passport Index snapshot version');
  const codes = new Set(countries.map(country => country.iso));
  const rules = new Map<string, EntryRule>();
  for (const { passports, destinations, ...rule } of file.policies) {
    if ([...passports, ...destinations].some(iso => !codes.has(iso))) throw new Error('Entry policy has an unknown country code');
    if (!passport.iso || !passports.includes(passport.iso)) continue;
    for (const destination of destinations) {
      if (destination === passport.iso) continue;
      if (rules.has(destination)) throw new Error(`Conflicting entry policies for ${passport.iso}/${destination}`);
      rules.set(destination, rule as EntryRule);
    }
  }
  const sources: Record<string, EntrySource> = Object.fromEntries(Object.entries(file.sources).filter(([id]) => [...rules.values()].some(rule => rule.s === id)).map(([id, source]) => [id, { ...source, kind: 'government' }]));
  const reviews = new Map<string, EntryReview>();
  if (audit) {
    const addSource = (id: string) => {
      if (!Object.hasOwn(audit.sources, id)) throw new Error(`Missing audit evidence ${id}`);
      sources[id] = { ...audit.sources[id], kind: 'government' };
    };
    for (const withdrawal of audit.withdrawals.filter(item => item.passport === passport.iso)) {
      withdrawal.sources.forEach(addSource);
      rules.set(withdrawal.destination, { t: 'unknown', d: 0, s: withdrawal.sources[0], evidence: withdrawal.sources, n: withdrawal.reason });
    }
    for (const { passports, destinations, ...rule } of audit.policies) {
      if (!passports.includes(passport.iso!)) continue;
      addSource(rule.s!);
      for (const destination of destinations) {
        if (reviews.has(destination)) throw new Error(`Conflicting reviewed policies ${passport.iso}/${destination}`);
        rules.set(destination, rule);
        reviews.set(destination, sources[rule.s!].historical ? 'historical' : 'checked');
      }
    }
  }
  const page = passport.iso ? reference?.passports[passport.iso] : undefined;
  if (page) {
    const expected = countries.filter(country => country.id !== passport.id).map(country => country.iso!);
    if (!Number.isFinite(Date.parse(page.fetchedAt)) || Object.keys(page.rules).length !== expected.length || expected.some(iso => !Object.hasOwn(page.rules, iso))) throw new Error(`Incomplete reference data for ${passport.name}`);
    sources['passport-index'] = { kind: 'reference', title: `Passport Index: ${passport.name}`, urls: [page.url], checkedAt: page.fetchedAt.slice(0, 10), sha256: page.sha256 };
  }
  const result: PassportRules = {
    version: 4, passport: passport.name, scope: file.scope, sources,
    destinations: countries.filter(country => country.id !== passport.id).map(country => ({
      name: country.name, iso: country.iso, review: reviews.get(country.iso!) || 'unresolved',
      rule: country.iso && rules.has(country.iso) ? rules.get(country.iso)! : country.iso && page?.rules[country.iso] ? { ...page.rules[country.iso], s: 'passport-index' } : { t: 'unknown', d: 0 },
    })),
  };
  if (!validPassportRules(result)) throw new Error(`Invalid reviewed entry policy for ${passport.name}`);
  result.destinations = result.destinations.map(destination => {
    const rule = effectiveEntryRule(destination.rule, sources, today);
    return { ...destination, rule, review: rule.t === 'unknown' ? 'unresolved' : destination.review };
  });
  const used = new Set(result.destinations.flatMap(({ rule }) => [rule.s, ...(rule.evidence || [])]));
  result.sources = Object.fromEntries(Object.entries(sources).filter(([id]) => used.has(id)));
  return result;
}
