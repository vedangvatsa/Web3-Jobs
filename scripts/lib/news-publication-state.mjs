const iso = value => new Date(value).toISOString();
const sameMembers = (actual, expected) => Array.isArray(actual) && actual.length === expected.length
  && new Set(actual).size === expected.length && actual.every(value => expected.includes(value));

export function validateResearchPublication(ledger, day) {
  const run = ledger.runs?.[day], publication = run?.publication;
  if (publication === undefined) return;
  const invalid = () => { throw new Error(`Invalid news publication ${day}`); };
  if (!publication || publication.status !== 'completed' || run.day !== day || typeof publication.completedAt !== 'string'
    || !Number.isFinite(Date.parse(publication.completedAt)) || iso(publication.completedAt).slice(0, 10) !== day
    || !['incomplete', 'completed'].includes(run.status) || !Array.isArray(run.candidateIds)
    || new Set(run.candidateIds).size !== run.candidateIds.length || !Array.isArray(run.baselineSlugs)
    || !run.outcomes || typeof run.outcomes !== 'object' || Array.isArray(run.outcomes) || !Array.isArray(run.validationErrors) || run.validationErrors.length
    || !run.discovery?.feeds?.some(feed => feed.ok === true)) invalid();
  const publishedIds = [], articleSlugs = [], pendingIds = [];
  let unreviewed = 0;
  for (const id of run.candidateIds) {
    if (!/^[a-f0-9]{20}$/.test(id) || ledger.candidates?.[id]?.id !== id) invalid();
    const outcome = run.outcomes[id];
    if (!outcome) { pendingIds.push(id); unreviewed++; continue; }
    if (!['published', 'deferred', 'rejected'].includes(outcome.status)) invalid();
    if (outcome.status === 'deferred') pendingIds.push(id);
    if (outcome.status !== 'published') continue;
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)?$/.test(outcome.articleSlug || '') || run.baselineSlugs.includes(outcome.articleSlug)
      || outcome.publishedAt !== publication.completedAt) invalid();
    publishedIds.push(id); articleSlugs.push(outcome.articleSlug);
  }
  if (Object.keys(run.outcomes).some(id => !run.candidateIds.includes(id)) || new Set(articleSlugs).size !== articleSlugs.length
    || !sameMembers(publication.publishedIds, publishedIds) || !sameMembers(publication.articleSlugs, articleSlugs)
    || !sameMembers(publication.pendingIds, pendingIds) || (unreviewed && !publishedIds.length)
    || run.status !== (unreviewed ? 'incomplete' : 'completed')
    || (!unreviewed && run.completedAt !== publication.completedAt)) invalid();
  return publication;
}
