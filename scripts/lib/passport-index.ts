import { createHash } from 'node:crypto';
import { load } from 'cheerio';
import type { EntryRule } from '../../src/lib/nomads/types';
import { validPassportRules } from '../../src/lib/nomads/entry-rules';

export type PassportIndexPage = {
  url: string;
  fetchedAt: string;
  sha256: string;
  rules: Record<string, Omit<EntryRule, 's'>>;
};
export type PassportIndexSnapshot = { version: number; passports: Record<string, PassportIndexPage> };

export function validatePassportIndexSnapshot(snapshot: PassportIndexSnapshot, countries: readonly string[]): void {
  if (snapshot?.version !== 1 || !snapshot.passports || typeof snapshot.passports !== 'object' || Array.isArray(snapshot.passports)) throw new Error('Invalid Passport Index snapshot');
  if (Object.keys(snapshot.passports).length !== countries.length || countries.some(code => !Object.hasOwn(snapshot.passports, code))) throw new Error('Incomplete Passport Index passport coverage');
  for (const [passport, page] of Object.entries(snapshot.passports)) {
    if (!countries.includes(passport) || !page || !Number.isFinite(Date.parse(page.fetchedAt)) || !/^[a-f0-9]{64}$/.test(page.sha256)) throw new Error('Invalid Passport Index provenance');
    sourceUrl(page.url);
    const expected = countries.filter(code => code !== passport);
    if (!page.rules || Object.keys(page.rules).length !== expected.length || expected.some(code => !Object.hasOwn(page.rules, code))) throw new Error(`Incomplete Passport Index snapshot for ${passport}`);
    const valid = validPassportRules({
      version: 3, passport, scope: 'Passport Index reference',
      sources: { reference: { kind: 'reference', title: 'Passport Index', urls: [page.url], checkedAt: page.fetchedAt.slice(0, 10) } },
      destinations: expected.map(iso => ({ name: iso, iso, rule: { ...page.rules[iso], s: 'reference' } })),
    });
    if (!valid) throw new Error(`Invalid Passport Index rules for ${passport}`);
  }
}

function sourceUrl(value: string | undefined): string {
  const url = new URL(value || '');
  if (url.origin !== 'https://www.passportindex.org' || url.username || url.password || !/^\/passport\/[^/]+\/$/.test(url.pathname) || url.search || url.hash) throw new Error('Invalid Passport Index source URL');
  return url.href;
}

export function parsePassportIndexHtml(html: string, countries: readonly string[], fetchedAt: string, expectedPassport?: string) {
  if (!Number.isFinite(Date.parse(fetchedAt))) throw new Error('A valid retrieval timestamp is required');
  const $ = load(html), allowed = new Set(countries);
  const iso = (classes: string | undefined) => classes?.match(/(?:^|\s)flag-icon-([a-z]{2})(?:\s|$)/)?.[1].toUpperCase();
  const passport = iso($('#psprt-dashboard h1 .flag-icon').first().attr('class'));
  if (!passport || !allowed.has(passport) || (expectedPassport && passport !== expectedPassport)) throw new Error('Missing or mismatched passport dashboard; access challenge or wrong page');
  const url = sourceUrl($('link[rel="canonical"]').attr('href'));
  const rules: PassportIndexPage['rules'] = {};
  for (const element of $('#psprt-dashboard-table tbody tr').toArray()) {
    const row = $(element), destination = iso(row.find('td').first().find('.flag-icon').attr('class'));
    if (!destination || !allowed.has(destination) || destination === passport || Object.hasOwn(rules, destination)) throw new Error('Unknown, duplicate or self destination in Passport Index table');
    if (row.find('.vrules').length !== 1 || row.find('.vdays').length > 1) throw new Error(`Ambiguous source fields for ${passport}/${destination}`);
    const label = row.find('.vrules').text().replace(/\s+/g, ' ').trim();
    const status = label.toLowerCase().replace(/-/g, ' ').replace(/\s+\((?:ease|fast track)\)$/, '');
    let t: EntryRule['t'], a: EntryRule['t'][] | undefined, n: string | undefined;
    if (status === 'visa free') t = 'vf';
    else if (status === 'visa required' || status === 'exit entry permit') t = 'vr';
    else if (status === 'visa on arrival' || status === 'free visa on arrival') t = 'voa';
    else if (status === 'evisa on arrival') {
      t = 'voa'; n = 'Passport Index lists eVisa on arrival; check the linked source for advance application requirements.';
    }
    else if (status === 'evisa' || status === 'evisitors') t = 'ev';
    else if (['eta', 'pre enrollment', 'tourist registration', 'tourist card', 'visa waiver registration'].includes(status)) t = 'eta';
    else if (/^evisa\s*[·/]\s*(?:free\s+)?visa on arrival$/.test(status)) { t = 'voa'; a = ['ev', 'voa']; }
    else if (['digital arrival card', 'arrival card', 'e ticket'].includes(status) && row.hasClass('vf')) {
      t = 'vf'; n = 'Passport Index groups this route as visa-free with an arrival declaration. The declaration is not a visa; check the source for its requirements.';
    } else if (['no admission', 'admission refused', 'not admitted', 'trump ban'].includes(status)) {
      t = 'na'; n = 'Passport Index reports entry restrictions. Visa status and exemptions can affect individual eligibility; consult the linked source.';
    }
    else throw new Error(`Unrecognised Passport Index status for ${passport}/${destination}: ${label}`);
    const duration = row.find('.vdays').text().trim();
    let d = 0, stay: string | undefined;
    if (duration) {
      if (/^[1-9]\d{0,3}$/.test(duration)) d = Number(duration);
      else if (/^\d+\s+(?:months?|years?)$/i.test(duration)) stay = duration;
      else throw new Error(`Unrecognised stay period for ${passport}/${destination}: ${duration}`);
    }
    rules[destination] = { t, d, label, ...(a && { a }), ...(n && { n }), ...(stay && { stay }) };
  }
  const missing = countries.filter(country => country !== passport && !Object.hasOwn(rules, country));
  if (missing.length || Object.keys(rules).length !== countries.length - 1) throw new Error(`Incomplete Passport Index page ${passport}; missing ${missing.join(', ')}`);
  const directory: Record<string, string> = {};
  for (const element of $('#qvc-pass option[value]').toArray()) {
    const code = ($(element).attr('value') || '').toUpperCase(), slug = $(element).attr('data-slug');
    if (!code) continue;
    if (!allowed.has(code) || !slug || slug.includes('/') || Object.hasOwn(directory, code)) throw new Error('Invalid passport directory');
    directory[code] = sourceUrl(`https://www.passportindex.org/passport/${slug}/`);
  }
  if (directory[passport] && directory[passport] !== url) throw new Error('Canonical source URL does not match the passport directory');
  return { passport, directory, page: { url, fetchedAt: new Date(fetchedAt).toISOString(), sha256: createHash('sha256').update(html).digest('hex'), rules } satisfies PassportIndexPage };
}
