import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const root = process.cwd();
const write = process.argv.includes('--write');
assert.ok(process.argv.slice(2).every(argument => argument === '--write'), 'Only --write is supported');
const require = createRequire(path.join(root, 'package.json'));
const { load } = require('cheerio');
const countries = JSON.parse(fs.readFileSync(path.join(root, 'content/nomads/countries.json'), 'utf8'));
const normal = name => name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z]/g, '');
const names = new Map(countries.map(country => [normal(country.name), country.iso]));
const aliases = {
  'United Kingdom of Great Britain and Northern Ireland': 'GB', 'United States of America': 'US', 'U.S.A.': 'US', 'BRITAIN': 'GB',
  'Korea (Republic of Korea, South Korea)': 'KR', "Korea (Democratic People's Republic, North Korea)": 'KP', "KOREA (DEMOCRATIC PEOPLE'S REPUBLIC OF)": 'KP', 'KOREA (REPUBLIC OF)': 'KR',
  'Congo (Democratic Republic of the Congo)': 'CD', 'Congo (Republic of the Congo)': 'CG', 'CONGO (DEMOCRATIC REPUBLIC OF)': 'CD', 'CONGO (REPUBLIC OF)': 'CG',
  'Côte d\'Ivoire': 'CI', 'COTE D\'IVOIRE (REPUBLIC OF)': 'CI', 'Russian Federation': 'RU', 'Slovak Republic': 'SK', 'Palestinian territories': 'PS',
  'Brunei Darussalam': 'BN', 'Czechia': 'CZ', 'Viet Nam': 'VN', 'TÜRKİYE': 'TR', 'ST. KITTS AND NEVIS': 'KN', 'ST. LUCIA': 'LC', 'ST. VINCENT AND THE GRENADINES': 'VC',
  'Eswatini': 'SZ', 'Vatican City': 'VA',
  'Republic of Korea': 'KR', 'Korea (North)': 'KP', "Democratic People's Republic of Korea": 'KP',
  'People’s Republic of China': 'CN', 'Democratic Republic of the Congo': 'CD', 'Bosnia Herzegovina': 'BA', 'Guinea Bissau': 'GW',
  'Hong Kong Special Administrative Region': 'HK', 'Macao Special Administrative Region': 'MO', 'Federated States of Micronesia': 'FM', 'The Bahamas': 'BS', 'Netherland': 'NL', 'UAE': 'AE',
};
for (const [name, iso] of Object.entries(aliases)) names.set(normal(name), iso);
const isoFor = label => names.get(normal(label)) || names.get(normal(label.replace(/\s*\((?:please see remarks|Formerly known as [^)]*)\)/gi, ''))) || names.get(normal(label.replace(/\s*\([^)]*\)/g, '')));
const cache = path.join(root, '.cache/nomads/passport-audit'); fs.mkdirSync(cache, { recursive: true });
const sources = {}, policies = [], unmatched = {};
const checkedAt = new Date().toISOString().slice(0, 10);
const manuallyCheckedAt = '2026-10-07';
async function source(id, title, url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(45000) });
  assert.equal(response.status, 200, url);
  const html = await response.text();
  fs.writeFileSync(path.join(cache, `${id}.html`), html);
  sources[id] = { title, urls: [url], checkedAt, sha256: createHash('sha256').update(html).digest('hex') };
  const $ = load(html);
  const rows = $('tr').toArray().map(row => $(row).find('td').toArray().map(cell => $(cell).text().replace(/\s+/g, ' ').trim())).filter(row => row.length);
  return { $, rows };
}
const schengen = 'AT BE BG HR CZ DK EE FI FR DE GR HU IS IT LV LI LT LU MT NL NO PL PT RO SK SI ES SE CH'.split(' ');
const eu = 'AT BE BG HR CY CZ DK EE FI FR DE GR HU IE IT LV LT LU MT NL PL PT RO SK SI ES SE'.split(' ');
const de = await source('schengen', 'Schengen short-stay visa policy and German Foreign Office country table', 'https://www.auswaertiges-amt.de/en/visa-service/231148-231148');
sources.schengen.urls.push('https://home-affairs.ec.europa.eu/policies/schengen/visa-policy_en');
const seenDe = new Set(); unmatched.schengen = [];
for (const [label, answer] of de.rows) {
  if (!label || !answer || !/^(?:yes|no|see China)/i.test(answer)) continue;
  const iso = isoFor(label);
  if (!iso) { unmatched.schengen.push({ label, answer }); continue; }
  assert.ok(!seenDe.has(iso), label); seenDe.add(iso);
  if (eu.includes(iso) || ['IS', 'LI', 'NO', 'CH'].includes(iso)) continue;
  let t = /^yes/i.test(answer) ? 'vr' : 'vf';
  let note = t === 'vf' ? 'Up to 90 days in any rolling 180-day period across the Schengen area, not per country. Short visits only.' : 'A short-stay visa is required. The authorised stay depends on the visa issued; existing residence permits or other exemptions can change the requirement.';
  if (/\b5\b/.test(answer)) note += ' The waiver requires a biometric passport.';
  if (['HK', 'MO'].includes(iso)) note += ' Applies to a Hong Kong or Macao SAR passport, not every travel document issued there.';
  if (iso === 'TW') note += ' The passport must contain an identity card number.';
  if (iso === 'GB') note += ' This entry covers British citizens.';
  if (iso === 'GE') note += ' Official passports have a separate visa requirement.';
  policies.push({ passports: [iso], destinations: schengen, t, d: t === 'vf' ? 90 : 0, s: 'schengen', n: note });
}
assert.ok(seenDe.size >= 190, `Only ${seenDe.size} mapped Schengen passport countries`);
sources['eu-movement'] = { title: 'Your Europe: travel documents for EU nationals', urls: ['https://europa.eu/youreurope/citizens/travel/entry-exit/eu-citizen/index_en.htm'], checkedAt: manuallyCheckedAt };
policies.push({ passports: eu, destinations: [...eu, 'IS', 'LI', 'NO', 'CH'], t: 'fm', d: 0, s: 'eu-movement', n: 'EU citizens may travel with a valid passport or national ID. Residence registration and other conditions can apply beyond a short visit.' });
const hk = await source('hong-kong', 'Hong Kong Immigration Department: visitor entry requirements', 'https://www.immd.gov.hk/eng/services/visas/visit-transit/visit-visa-entry-permit.html');
const seenHk = new Set(); unmatched.hongKong = [];
for (const row of hk.rows) {
  if (row.length !== 4 || !/^\d+\.$/.test(row[0])) continue;
  const [, label, stay, requirement] = row;
  if (/non-biometric|British Overseas|Tongan National|Tongan Protected|I-TUVALU|Diplomatic passports|Provisional passports|Documento|Special Peruvian|Decree 289|Vatican Service/.test(label)) continue;
  const iso = isoFor(label);
  if (!iso) { unmatched.hongKong.push({ label, stay, requirement }); continue; }
  if (seenHk.has(iso)) { unmatched.hongKong.push({ label, stay, requirement, reason: 'duplicate mapping' }); continue; }
  seenHk.add(iso);
  const days = /^(\d+) Days$/i.exec(stay);
  if (!days && !/Visa Required/i.test(requirement)) throw new Error(`Unrecognised Hong Kong row: ${row.join(' | ')}`);
  const t = iso === 'IN' ? 'eta' : days ? 'vf' : 'vr';
  let note = 'Ordinary-passport visitor entry; adequate funds and onward or return travel are required. Work and study need separate permission.';
  if (/biometric/.test(label)) note += ' Visa-free entry applies only to biometric passports; other passports require a visa.';
  if (iso === 'IN') note = 'Successful pre-arrival registration (PAR) is required before travel. Passport validity must be at least six months. The six-month PAR validity is not the stay limit: each visit is up to 14 days.';
  if (iso === 'TO') note += ' Tongan National and Protected Persons passports have a separate visa requirement.';
  if (iso === 'TV') note += " Passports stating national status as I-TUVALU require a visa.";
  policies.push({ passports: [iso], destinations: ['HK'], t, d: days ? Number(days[1]) : 0, s: 'hong-kong', n: note });
}
assert.ok(seenHk.size >= 185, `Only ${seenHk.size} mapped Hong Kong passport countries`);
sources['hong-kong'].urls.push('https://www.immd.gov.hk/eng/services/visas/pre-arrival_registration_for_indian_nationals.html');
const sg = await source('singapore', 'Singapore ICA: entry visa requirements', 'https://www.ica.gov.sg/enter-transit-depart/entering-singapore/visa_requirements');
const singaporeVisa = sg.$('a[href*="visa-detail-page"]').toArray().map(element => isoFor(sg.$(element).text().trim()));
assert.ok(singaporeVisa.length >= 30 && singaporeVisa.length <= 40 && singaporeVisa.every(Boolean), 'Review the Singapore visa-required list');
assert.match(sg.$('body').text(), /Palestinian Authority passport/);
singaporeVisa.push('PS');
for (const passport of countries) if (passport.iso !== 'SG') policies.push({ passports: [passport.iso], destinations: ['SG'], t: singaporeVisa.includes(passport.iso) ? 'vr' : 'vf', d: 0, s: 'singapore', n: 'The SG Arrival Card is not a visa. The permitted stay is determined by the electronic Visit Pass issued on entry, not the visa validity or a fixed 30-day allowance. Special travel documents and transit exemptions have separate rules.' });
const jp = await source('japan', 'Japan Ministry of Foreign Affairs: short-stay visa exemptions', 'https://www.mofa.go.jp/j_info/visit/visa/short/novisa.html');
const japanExempt = new Map();
for (const label of jp.rows.flat()) {
  const iso = isoFor(label);
  if (iso) japanExempt.set(iso, label);
}
assert.equal(japanExempt.size, 74, 'Review the current Japanese exemption table');
for (const passport of countries) {
  if (['JP', 'CO'].includes(passport.iso)) continue;
  const exempt = japanExempt.has(passport.iso);
  const registration = ['ID', 'QA'].includes(passport.iso);
  let note = exempt ? 'Short visits only. The initial stay is counted from landing permission.' : 'A visa is required before travel. Online application eligibility depends on residence and application channel; no generic 30-day allowance is asserted.';
  if (['ME', 'PE', 'PY', 'PA', 'BR', 'AE', 'TH', 'RS', 'MY'].includes(passport.iso)) note += ' The waiver requires an ICAO-compliant ePassport; other passports need advance review or a visa.';
  if (registration) note += ' Requires an ICAO-compliant ePassport registered with a Japanese diplomatic mission before travel. Three-year registration validity is not the permitted stay.';
  if (passport.iso === 'TW') note += ' Passport must contain a personal identity number.';
  if (passport.iso === 'HK') note += ' Applies to Hong Kong SAR passports or eligible BNO passports with the right of residence in Hong Kong.';
  if (passport.iso === 'MO') note += ' Applies to Macao SAR passports.';
  if (['BB', 'TR', 'LS'].includes(passport.iso)) note += ' Requires an ICAO-compliant machine-readable passport.';
  if (['AT', 'DE', 'IE', 'LI', 'MX', 'CH', 'GB'].includes(passport.iso)) note += ' Stays beyond the initial 90 days require an extension before the permitted stay expires; a six-month bilateral arrangement is not automatic six-month admission.';
  if (passport.iso === 'UY') note += ' Japan does not recognise the new Uruguayan passport version without place of birth. The waiver applies to the recognised old passport version.';
  policies.push({ passports: [passport.iso], destinations: ['JP'], t: registration ? 'eta' : exempt ? 'vf' : 'vr', d: exempt ? ['ID', 'TH'].includes(passport.iso) ? 15 : ['BN', 'QA'].includes(passport.iso) ? 30 : 90 : 0, s: 'japan', n: note });
}
const uk = await source('uk-visa', 'UK Home Office: visitor visa national list', 'https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-visitor-visa-national-list');
const eta = await source('uk-eta', 'UK Home Office: ETA national list', 'https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-eta-national-list');
sources['uk-eta'].urls.push('https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-electronic-travel-authorisation');
const listedCodes = page => new Set(page.$('main').text().split(/[\r\n]+/).map(label => isoFor(label.trim())).filter(Boolean));
const ukVisa = listedCodes(uk), ukEta = listedCodes(eta);
assert.ok(ukVisa.size > 100 && ukVisa.size < 130, `Review UK visa list (${ukVisa.size})`);
assert.ok(ukEta.size > 70 && ukEta.size < 90, `Review UK ETA list (${ukEta.size})`);
for (const passport of countries) {
  const iso = passport.iso;
  if (['GB', 'IE'].includes(iso)) continue;
  assert.ok(ukVisa.has(iso) || ukEta.has(iso), `Unmapped UK nationality: ${iso}`);
  assert.ok(!(ukVisa.has(iso) && ukEta.has(iso)) || iso === 'TW', `Conflicting UK lists: ${iso}`);
  let note = ukEta.has(iso) ? 'ETA approval is required before travel. A standard visitor may seek entry for up to six months per visit. Two-year ETA validity is not permission to stay for two years.' : 'An advance visitor visa is required. Existing UK permission, eligible school groups and other listed exceptions have separate rules.';
  if (iso === 'TW') note += ' The ETA route requires a Taiwan passport containing the national identity card number; other Taiwan passports need a visa.';
  if (['HK', 'MO'].includes(iso)) note += ' This rule covers the SAR passport. BNO and other travel documents have separate conditions.';
  policies.push({ passports: [iso], destinations: ['GB'], t: ukEta.has(iso) ? 'eta' : 'vr', d: 0, ...(ukEta.has(iso) && { stay: 'Up to 6 months per visit' }), s: ukEta.has(iso) ? 'uk-eta' : 'uk-visa', n: note });
}
sources.cta = { title: 'UK government: Common Travel Area guidance', urls: ['https://www.gov.uk/government/publications/common-travel-area-guidance/common-travel-area-guidance'], checkedAt: manuallyCheckedAt };
policies.push({ passports: ['IE'], destinations: ['GB'], t: 'fm', d: 0, s: 'cta', n: 'Irish citizens have Common Travel Area entry and residence rights and do not need a UK visa or ETA. This does not extend to other nationalities merely resident in Ireland.' });
policies.push({ passports: ['GB'], destinations: ['IE'], t: 'fm', d: 0, s: 'cta', n: 'British citizens have Common Travel Area entry and residence rights. Other nationalities remain subject to Irish immigration rules.' });
const lk = await source('sri-lanka', 'Sri Lanka Immigration: tourist ETA and reciprocal exemptions', 'https://www.eta.gov.lk/slvisa/visainfo/center.jsp?locale=en_US');
assert.match(lk.$('body').text(), /Maldivian nationals will receive 90 day tourist visa/);
sources['sri-lanka'].urls.push('https://www.eta.gov.lk/slvisa/visainfo/shortvisit.jsp?locale=en_US', 'https://www.eta.gov.lk/slvisa/visainfo/diplo.jsp?locale=en_US', 'https://www.eta.gov.lk/slvisa/visainfo/fees.jsp?locale=en_US');
for (const passport of countries) if (passport.iso !== 'LK') {
  const hongKong = passport.iso === 'HK', maldives = passport.iso === 'MV';
  policies.push({ passports: [passport.iso], destinations: ['LK'], t: hongKong ? 'voa' : 'eta', d: maldives ? 90 : 30, s: 'sri-lanka', n: hongKong ? 'The official exception table lists Hong Kong SAR citizens for a 30-day visit visa on arrival without prior ETA. This does not cover every Hong Kong travel document.' : 'Tourist ETA approval is required before arrival, even where the ETA fee is waived. ' + (maldives ? 'The portal states a reciprocal 90-day tourist visa for Maldivian nationals; check the issued approval and rules for children.' : 'The standard tourist ETA permits 30 days with double entry. The second entry receives only the remaining balance of the original 30-day period.') });
}
sources['india-malaysia'] = { title: 'High Commission of India advisory and Malaysian Immigration exemption', urls: ['https://www.hcikl.gov.in/pdf/img-20260922-wa0000.pdf', 'https://www.imi.gov.my/index.php/en/main-services/visa/visa-requirement-by-country/'], checkedAt: manuallyCheckedAt };
policies.push({ passports: ['IN'], destinations: ['MY'], t: 'vf', d: 30, s: 'india-malaysia', until: '2026-12-31', n: 'Tourism and social visits only. Requires a passport valid for at least six months, confirmed return travel, accommodation and the Malaysia Digital Arrival Card (MDAC). The current Indian-passport exemption runs through 31 December 2026.' });
sources['uk-malaysia'] = { title: 'UK government: Malaysia entry requirements for British citizens', urls: ['https://www.gov.uk/foreign-travel-advice/malaysia/entry-requirements'], checkedAt: manuallyCheckedAt };
policies.push({ passports: ['GB'], destinations: ['MY'], t: 'vf', d: 90, s: 'uk-malaysia', n: 'British citizen passports: tourism stays are normally up to 90 days. Passport must have six months validity; an arrival card is required unless exempt.' });
const pairs = new Map();
for (const policy of policies) for (const from of policy.passports) for (const to of policy.destinations) if (from !== to) {
  assert.ok(countries.some(country => country.iso === from), from);
  assert.ok(countries.some(country => country.iso === to), to);
  const key = `${from}:${to}`; assert.ok(!pairs.has(key), `Conflicting policies for ${key}`); pairs.set(key, policy);
}
const groups = new Map();
for (const { passports, ...policy } of policies) {
  const key = JSON.stringify(policy);
  const group = groups.get(key) || { ...policy, passports: [] };
  group.passports.push(...passports); groups.set(key, group);
}
const output = { version: 1, scope: 'Ordinary passports and short tourist visits. Third-country visas, residence permits, transit and work permissions require separate checks.', sources, policies: [...groups.values()] };
fs.writeFileSync(path.join(cache, 'reviewed-policies.json'), `${JSON.stringify(output, null, 2)}\n`);
if (write) fs.writeFileSync(path.join(root, 'content/nomads/entry-policies.json'), `${JSON.stringify(output, null, 2)}\n`);
fs.writeFileSync(path.join(cache, 'coverage.json'), `${JSON.stringify({ pairs: pairs.size, totalPairs: 199 * 198, remainingPairs: 199 * 198 - pairs.size, unmatched }, null, 2)}\n`);
console.log(JSON.stringify({ checkedAt, pairs: pairs.size, totalPairs: 199 * 198, remainingPairs: 199 * 198 - pairs.size, unmatched }, null, 2));
