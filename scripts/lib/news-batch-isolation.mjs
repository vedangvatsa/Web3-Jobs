import { researchReport, reviewCandidate } from './news-research.mjs';

export function isolateFailedNewsDrafts(ledger, day, feedback) {
  if (feedback.day !== day || feedback.audited !== true || feedback.discoveryHealthy !== true
    || !Array.isArray(feedback.fatalErrors) || feedback.fatalErrors.length
    || !Array.isArray(feedback.validationErrors) || !feedback.validationErrors.length
    || !feedback.articleErrors || Array.isArray(feedback.articleErrors) || typeof feedback.articleErrors !== 'object') return null;
  const report = researchReport(ledger, day);
  if (report.publicationComplete) return null;
  const ready = report.outcomes.filter(item => item.status === 'ready');
  const slugs = ready.map(item => item.articleSlug).sort();
  if (!Array.isArray(feedback.readySlugs) || JSON.stringify([...feedback.readySlugs].sort()) !== JSON.stringify(slugs)) return null;
  const failed = Object.entries(feedback.articleErrors).filter(([, issues]) => Array.isArray(issues) && issues.length);
  if (!failed.length || failed.length >= ready.length) return null;
  if (Object.entries(feedback.articleErrors).some(([slug, issues]) => !slugs.includes(slug) || !Array.isArray(issues)
    || issues.some(issue => typeof issue !== 'string' || !feedback.validationErrors.includes(issue)))) return null;
  const coveredErrors = new Set(failed.flatMap(([, issues]) => issues));
  if (feedback.validationErrors.some(error => !coveredErrors.has(error))) return null;

  const next = structuredClone(ledger);
  for (const [slug, issues] of failed) {
    const item = ready.find(item => item.articleSlug === slug);
    const previous = structuredClone(next.runs[day].outcomes[item.id]);
    reviewCandidate(next, day, {
      id: item.id, articleSlug: slug, status: 'deferred', reason: 'quality-gate',
      note: `Actual article audits still failed after bounded repair attempts: ${issues.join('; ')}. Draft and original source checks are retained for repair; this article was not published.`,
      sourceChecks: previous.sourceChecks,
      retrySearches: [`Repair and revalidate the preserved ${slug} draft against its original sources: ${issues.join('; ')}`],
    });
    const evidence = { previousReview: previous, validationErrors: [...issues], isolatedAt: new Date().toISOString() };
    next.candidates[item.id].qualityIsolation = evidence;
    next.runs[day].outcomes[item.id].qualityIsolation = evidence;
  }
  return { ledger: next, deferredSlugs: failed.map(([slug]) => slug) };
}
