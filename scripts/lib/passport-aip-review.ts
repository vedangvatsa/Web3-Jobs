import assert from 'node:assert/strict';
import { validDate } from '../../src/lib/nomads/entry-rules';
import { publicUrls, type Factchecks, type Withdrawal } from './passport-factchecks';
import { policyRoutes, sha256, type GapAssignments, type GapPatch } from './passport-gap-patches';

type Scope = { passportType: string; purpose: string; arrivalModes: string[]; excluded: string[]; thirdCountryVisaOrResidenceAssumed: boolean };
type ResearchSource = { title: string; urls: string[]; checkedAt: string; sha256: string; historicalOnly: boolean; evidence: { url: string; body: string; sha256: string; retrievedAt?: string; observedDate?: string; actualPageOrPublicationDate: string | null }[] };
export type AipResearch = {
  version: number; batch: string; autoImport: boolean;
  sources: Record<string, ResearchSource>;
  policies: { id: string; passports: string[]; destinations: string[]; t: 'vf' | 'ev'; d: number; n: string; sourceIds: string[]; scope: Scope; supportStatus: string; historical: boolean; stay?: { max: number; unit: string } }[];
  corrections: { passports: string[]; destinations: string[]; action: string; replacementVisaType: null; priorPass4Classification: string; supportStatus: string; scope: Scope; sourceIds: string[]; evidenceDetail: { scopeConfirmed: { entry: boolean; ordinaryPassportCovered: boolean; exitRule: boolean; feeWaiverOnly: boolean; diplomaticServiceOnly: boolean; airEntryOnlyForCandidate: boolean } } }[];
  holds: { destination: string; origins: string[]; reason: string }[];
  summary: { retainedCurrentSupportedAirScopedPairs: number; retainedByDestination: Record<string, number>; retainedRequirementPairs: number; retainedVisaFreePairs: number; pass4CorrectionsToUnresolved: number; historicalOnlyPolicyPairs: number };
};

const scopeNote = 'Incoming air entry only, valid ordinary passports and short tourism. Land and sea entry are not established by this evidence; crew, airside transit, employment and residence are excluded. No third-country visa or residence status is assumed.';
const sourceTitles: Record<string, string> = {
  'aip-bf': 'ASECNA Burkina Faso GEN 1.3: pages dated 2 October 2025, AMDT 10/25, retained in the 1 October 2026 register',
  'aip-ne': 'ASECNA Niger GEN 1.3: incoming ordinary-passport rules, pages dated 11 June 2026, AMDT 06/26, retained in the 1 October 2026 register',
  'aip-cf-aic': 'CAR incoming air passengers: AIC 17/A/22FC dated 25 March 2022, still listed PERM in the 1 October 2026 AIC index',
  'aip-register': 'ASECNA full page register AMDT 10/26 effective 1 October 2026 and current permanent-AIC index; individual rule dates retained',
  'review-ne-2024': 'Historical comparison only: superseded Niger GEN 1.3 in AMDT 08/24 dated 8 August 2024',
  'review-se-advice': 'Sweden Abroad: Niger entry guidance updated 13 August 2025; hash identifies the preserved 8 October 2026 webfetch receipt',
};

export function curateAipReview(research: AipResearch, baselineRaw: string) {
  assert.equal(research.version, 2); assert.equal(research.batch, 'aip-reviewed-final'); assert.equal(research.autoImport, false);
  const baseline = JSON.parse(baselineRaw) as Factchecks;
  const routes = policyRoutes(baseline.policies);
  const batch = 'aip-reviewed', sourceId = (id: string) => `${batch}-${id}`;
  const assertScope = (scope: Scope) => {
    assert.equal(scope.passportType, 'ordinary'); assert.equal(scope.purpose, 'short tourist visit');
    assert.deepEqual(scope.arrivalModes, ['air']); assert.equal(scope.thirdCountryVisaOrResidenceAssumed, false);
    for (const exclusion of ['crew', 'airside transit', 'employment', 'residence', 'land entry', 'sea entry']) assert.ok(scope.excluded.includes(exclusion), `Missing scope exclusion ${exclusion}`);
  };
  const used = new Set([...research.policies, ...research.corrections].flatMap(item => item.sourceIds));
  const sources: Factchecks['sources'] = {};
  for (const id of used) {
    const source = research.sources[id]; assert.ok(source, `Missing AIP source ${id}`);
    assert.ok(validDate(source.checkedAt)); assert.match(source.sha256, /^[a-f0-9]{64}$/);
    const register = id === 'aip-register' ? source.evidence.find(item => item.url === 'https://aim.asecna.aero/amdt/amdt2610aaa.pdf') : undefined;
    if (id === 'aip-register') assert.ok(register, 'Full operative page register required, not standalone checklist or cover');
    sources[sourceId(id)] = {
      title: sourceTitles[id] || source.title,
      urls: publicUrls(register ? [register.url, 'https://aim.asecna.aero/html/eAIP/FR-eAICs-fr-FR.html'] : source.urls),
      checkedAt: source.checkedAt, sha256: register?.sha256 || source.sha256,
      ...(source.historicalOnly ? { historical: true } : {}),
    };
  }
  const dateNotes: Record<string, string> = {
    BF: 'The governing pages are dated 2 October 2025 (AMDT 10/25) and individually retained in the full AMDT 10/26 register effective 1 October 2026; the January 2026 HTML title is not a visa enactment date.',
    NE: 'The incoming-passenger pages are dated 11 June 2026 (AMDT 06/26) and individually retained in the full October 2026 register; neither the July HTML title nor the October package date establishes a new waiver commencement.',
    CF: 'AIC 17/A/22FC is dated 25 March 2022 and remains listed PERM in the current October 2026 AIC index. Its continuing specific entry provisions, not the old generic GEN page or package date alone, support this scoped record.',
  };
  const patch: GapPatch = { version: 1, batch, baselineSha256: sha256(baselineRaw), sources, policies: [], reviews: [], corrections: [] };
  const seen = new Set<string>(), counts: Record<string, number> = {}, categories = { vf: 0, ev: 0 };
  for (const policy of research.policies) {
    assertScope(policy.scope); assert.equal(policy.supportStatus, 'current-supported'); assert.equal(policy.historical, false); assert.equal(policy.d, 0);
    assert.ok(['vf', 'ev'].includes(policy.t)); assert.equal(policy.destinations.length, 1);
    const destination = policy.destinations[0]; assert.ok(Object.hasOwn(dateNotes, destination));
    for (const passport of policy.passports) {
      const key = `${passport}/${destination}`;
      assert.ok(!seen.has(key) && !routes.has(key), `AIP addition must be a unique baseline gap: ${key}`);
      assert.ok(baseline.reviews.find(review => review.destination === destination)!.unresolvedPassports.includes(passport), `Not a baseline gap ${key}`);
      seen.add(key); counts[destination] = (counts[destination] || 0) + 1; categories[policy.t]++;
    }
    assert.ok(policy.sourceIds.length && policy.sourceIds.every(id => used.has(id)));
    assert.ok(!sources[sourceId(policy.sourceIds[0])].historical, 'Historical context cannot be current policy evidence');
    if (policy.stay) assert.deepEqual(policy.stay, { max: 3, unit: 'months' });
    patch.policies.push({ passports: [...policy.passports], destinations: [...policy.destinations], t: policy.t, d: 0,
      s: sourceId(policy.sourceIds[0]), evidence: policy.sourceIds.slice(1).map(sourceId),
      label: policy.t === 'ev' ? 'Air entry only: prior eVisa' : 'Air entry only: visa-free',
      n: `${scopeNote} ${policy.n} ${dateNotes[destination]}`,
      ...(policy.stay ? { stay: 'Up to 3 months (air entry only)' } : {}),
    });
  }
  assert.deepEqual(counts, research.summary.retainedByDestination);
  assert.equal(seen.size, research.summary.retainedCurrentSupportedAirScopedPairs);
  assert.equal(categories.ev, research.summary.retainedRequirementPairs); assert.equal(categories.vf, research.summary.retainedVisaFreePairs);
  assert.equal(research.summary.historicalOnlyPolicyPairs, 0);
  assert.ok(!seen.has('RW/BF') && research.holds.some(hold => hold.destination === 'BF' && hold.origins.includes('RW')), 'Rwanda/Burkina conflict must remain withheld');
  const assignments: GapAssignments = { baselineSha256: patch.baselineSha256, scope: 'targeted', batches: [{ id: batch, routes: 0, destinations: Object.keys(dateNotes).map(iso => ({ iso, origins: [...baseline.reviews.find(review => review.destination === iso)!.unresolvedPassports] })) }] };
  assignments.batches[0].routes = assignments.batches[0].destinations.reduce((sum, destination) => sum + destination.origins.length, 0);
  for (const destination of assignments.batches[0].destinations) {
    const resolvedOrigins = destination.origins.filter(from => seen.has(`${from}/${destination.iso}`));
    const remainingOrigins = destination.origins.filter(from => !seen.has(`${from}/${destination.iso}`));
    const hold = research.holds.find(item => item.destination === destination.iso)!;
    assert.deepEqual([...remainingOrigins].sort(), [...hold.origins].sort(), `AIP residual partition ${destination.iso}`);
    const sourceIds = new Set([...research.policies.filter(policy => policy.destinations.includes(destination.iso)).flatMap(policy => policy.sourceIds), ...research.corrections.filter(record => record.destinations.includes(destination.iso)).flatMap(record => record.sourceIds)]);
    patch.reviews.push({ destination: destination.iso, resolvedOrigins, remainingOrigins,
      findings: [scopeNote, dateNotes[destination.iso], `${resolvedOrigins.length} new air-entry-scoped rules; ${remainingOrigins.length} original gaps remain. ${hold.reason}`,
        ...(destination.iso === 'CF' ? ['No residual CAR default or unrestricted Bangui visa-on-arrival entitlement is added. The exceptional less-than-one-month procedure requires prior MFA validation; that period is not the stay of a visa-exempt visitor.'] : []),
        ...(destination.iso === 'NE' ? ['Only ML and BF are new air-entry exemptions. Mali retains three months, not 90 days; Burkina duration is unresolved between three months and 60 days. Existing Niger fee, duration and other method records are not changed.'] : []),
      ], attemptedUrls: [...new Set([...sourceIds].flatMap(id => sources[sourceId(id)].urls))] });
  }
  const originFindings: Record<string, string> = {
    SE: 'Swedish government entry guidance and the Paris mission still require a visa. The Swedish exemption was already printed in 2024; retention in the 2026 AIP does not establish supersession.',
    MR: 'Mauritania MFA supplies a visa-suppression agreement lead, but no controlling ordinary-passport treaty text or commencement resolves the Paris mission visa-required default. The AIP exemption was already printed in 2024.',
    MU: 'The currently linked Mauritius MFA outbound table still requires a Niger visa, alongside the Paris mission default. The added 2026 AIP exemption has no established priority or supersession over this counterevidence.',
    RW: 'Rwanda Immigration corroborates an ordinary-passport exemption, but the Paris mission still publishes a conflicting requirement. Source agreement and first appearance in the compared 2026 AIP do not establish legal priority or commencement.',
  };
  const withdrawals: Withdrawal[] = research.corrections.map(record => {
    assertScope(record.scope); assert.equal(record.action, 'mark-unresolved'); assert.equal(record.replacementVisaType, null); assert.equal(record.supportStatus, 'unresolved-conflict');
    assert.equal(record.passports.length, 1); assert.deepEqual(record.destinations, ['NE']);
    assert.deepEqual(record.evidenceDetail.scopeConfirmed, { entry: true, ordinaryPassportCovered: true, exitRule: false, feeWaiverOnly: false, diplomaticServiceOnly: false, airEntryOnlyForCandidate: true });
    const passport = record.passports[0], previous = routes.get(`${passport}/NE`);
    assert.ok(previous && Object.hasOwn(originFindings, passport)); assert.equal(previous.t, record.priorPass4Classification);
    return { passport, destination: 'NE', sources: [...new Set([...record.sourceIds.map(sourceId), sourceId('aip-register'), previous.s!, ...(previous.evidence || [])])],
      reason: `Air-entry evidence conflict for ${passport} ordinary passports entering Niger: the actual incoming-passenger AIP expressly exempts this passport, not just fees, exit visas or diplomatic/service travel. ${originFindings[passport]} Withdraw the categorical supported visa-required record pending reconciliation; neither visa-free status, a stay allowance nor a practical issuance method is established as the replacement. Do not fall back to an older government or Passport Index claim.` };
  });
  assert.deepEqual(withdrawals.map(record => record.passport).sort(), ['MR', 'MU', 'RW', 'SE']);
  assert.equal(withdrawals.length, research.summary.pass4CorrectionsToUnresolved);
  return { assignments, patch, withdrawals, counts };
}
