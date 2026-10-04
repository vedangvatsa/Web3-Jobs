import { createHash } from 'node:crypto';
import { canonicalNewsUrl, coveredByArticle, sameNewsStory } from '../news-discover.mjs';

export const LEDGER_PATH = 'content/news-research.json';
export const RESEARCH_DIR = '.cache/news-research';
export const RETRY_HOURS = 72;
const REJECT_REASONS = new Set(['duplicate', 'out-of-scope', 'opinion', 'price-chatter', 'stale', 'not-a-concrete-event', 'promotional']);
const DEFER_REASONS = new Set(['source-blocked', 'needs-corroboration', 'missing-primary-source', 'quality-gate']);
const sourceHost = url => new URL(url).hostname.toLowerCase().replace(/^(www|m|amp)\./, '');
const iso = now => new Date(now).toISOString();

export function validateLedger(ledger) {
  if (ledger?.version !== 1 || !ledger.candidates || Array.isArray(ledger.candidates) || !ledger.runs || Array.isArray(ledger.runs)) throw new Error('Invalid news research ledger');
  for (const [id, item] of Object.entries(ledger.candidates)) {
    if (!/^[a-f0-9]{20}$/.test(id) || item.id !== id || !canonicalNewsUrl(item.link) || !['pending', 'deferred', 'ready', 'published', 'rejected'].includes(item.status)) throw new Error(`Invalid news candidate ${id}`);
  }
  for (const [day, run] of Object.entries(ledger.runs)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || run.day !== day || !['prepared', 'incomplete', 'completed'].includes(run.status)
      || !Array.isArray(run.candidateIds) || new Set(run.candidateIds).size !== run.candidateIds.length || run.candidateIds.some(id => !ledger.candidates[id])
      || !Array.isArray(run.baselineSlugs) || !run.outcomes || Array.isArray(run.outcomes)) throw new Error(`Invalid daily research run ${day}`);
    for (const [id, outcome] of Object.entries(run.outcomes)) {
      if (!run.candidateIds.includes(id) || !['ready', 'published', 'rejected', 'deferred'].includes(outcome.status) || typeof outcome.note !== 'string' || outcome.note.trim().length < 25) throw new Error(`Invalid research outcome ${day}/${id}`);
    }
  }
  return ledger;
}

export function readTips(text) {
  return String(text).split(/\r?\n/).flatMap(line => {
    const match = line.match(/^\s*-\s+(https?:\/\/\S+)\s*(.*)$/);
    if (!match || !canonicalNewsUrl(match[1])) return [];
    return [{ link: match[1], title: match[2].replace(/^[-–—\s]+/, '') || match[1], source: 'Manual tip', manual: true, score: 10, sources: [{ name: 'Manual tip', url: match[1] }] }];
  });
}

export function prepareResearch({ ledger, discovery, articles, tips = [], day, now = Date.now() }) {
  validateLedger(ledger);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || new Date(`${day}T00:00:00Z`).toISOString().slice(0, 10) !== day || day > iso(now).slice(0, 10)) throw new Error('Invalid research day');
  if (ledger.runs[day]?.status === 'completed') return researchReport(ledger, day);
  const run = ledger.runs[day] ||= { day, startedAt: iso(now), status: 'prepared', candidateIds: [], outcomes: {}, baselineSlugs: articles.map(article => article.slug) };
  run.baselineSlugs = [...new Set([...run.baselineSlugs, ...articles.map(article => article.slug)])];
  run.discovery = { feeds: discovery.feeds, total: discovery.total, checkedAt: iso(now) };
  const assign = item => { if (!run.candidateIds.includes(item.id)) run.candidateIds.push(item.id); };
  for (const incoming of [...tips, ...discovery.candidates]) {
    const key = canonicalNewsUrl(incoming.link);
    if (!key) throw new Error('Candidate has an invalid URL');
    let item = Object.values(ledger.candidates).find(existing => canonicalNewsUrl(existing.link) === key || existing.sources?.some(source => canonicalNewsUrl(source.url) === key)
      || (Math.abs(Date.parse(existing.published) - Date.parse(incoming.published)) < 3 * 86400000 && sameNewsStory(existing.title, incoming.title)));
    if (!item) {
      const id = createHash('sha256').update(key).digest('hex').slice(0, 20);
      item = ledger.candidates[id] = { ...incoming, id, status: 'pending', firstSeenAt: iso(now), attempts: 0, sources: incoming.sources || [{ name: incoming.source, url: incoming.link }], expiresAt: iso((Date.parse(incoming.published) || now) + RETRY_HOURS * 3600000) };
    }
    if (incoming.manual) {
      item.manual = true; item.manualNote = incoming.title; item.score = Math.max(item.score || 0, 10);
      if (['published', 'rejected'].includes(item.status) && item.lastReviewedDay !== day) {
        item.status = 'pending'; item.expiresAt = iso(now + RETRY_HOURS * 3600000); delete item.nextReviewDate;
      }
    }
    item.lastSeenAt = iso(now);
    for (const source of incoming.sources || []) if (!item.sources.some(existing => canonicalNewsUrl(existing.url) === canonicalNewsUrl(source.url))) item.sources.push(source);
  }
  for (const item of Object.values(ledger.candidates)) {
    if (item.mergedInto && ledger.candidates[item.mergedInto]?.status !== 'published' && !articles.some(article => article.slug === item.duplicateOf)) {
      item.status = 'pending'; delete item.mergedInto; delete run.outcomes[item.id];
    }
    if (run.outcomes[item.id] || ['published', 'rejected'].includes(item.status)) continue;
    if (item.nextReviewDate && item.nextReviewDate > day) continue;
    assign(item);
    const covered = !item.manual && coveredByArticle(item, articles);
    if (covered) {
      const outcome = { status: 'rejected', reason: 'duplicate', duplicateOf: covered.slug, note: `Already covered by /${covered.slug}; matched this story's URL or headline.`, sourceChecks: [], reviewedAt: iso(now), automatic: true };
      run.outcomes[item.id] = outcome; Object.assign(item, outcome, { lastReviewedDay: day });
    } else if (Date.parse(item.expiresAt) <= now) {
      const outcome = { status: 'rejected', reason: 'stale', note: `Verification window ended after ${RETRY_HOURS} hours. Previous blocker: ${item.note || 'No completed review'}`, sourceChecks: [], reviewedAt: iso(now), automatic: true };
      run.outcomes[item.id] = outcome; Object.assign(item, outcome, { lastReviewedDay: day });
    }
  }
  return researchReport(ledger, day);
}

export function addResearchCandidate(ledger, day, { title, link, published, source }, now = Date.now()) {
  const run = ledger.runs[day], key = canonicalNewsUrl(link), time = Date.parse(published);
  if (!run || run.status === 'completed' || !key || typeof title !== 'string' || title.trim().length < 10 || !Number.isFinite(time) || time > now || time < now - 24 * 3600000) throw new Error('Add a dated, fresh source to an open research run');
  let item = Object.values(ledger.candidates).find(item => canonicalNewsUrl(item.link) === key || item.sources.some(entry => canonicalNewsUrl(entry.url) === key));
  if (item) {
    if (!run.candidateIds.includes(item.id) && !['published', 'rejected'].includes(item.status)) run.candidateIds.push(item.id);
    return item.id;
  }
  const id = createHash('sha256').update(key).digest('hex').slice(0, 20);
  item = ledger.candidates[id] = { id, title: title.trim(), link, published: iso(time), source: source || 'Research lead', sources: [{ name: source || 'Research lead', url: link }], status: 'pending', firstSeenAt: iso(now), lastSeenAt: iso(now), expiresAt: iso(time + RETRY_HOURS * 3600000), attempts: 0 };
  run.candidateIds.push(id);
  return id;
}

export function reviewCandidate(ledger, day, review, { articles, now = Date.now() } = {}) {
  const run = ledger.runs[day], item = ledger.candidates[review.id];
  if (!run || run.status === 'completed' || !item || !run.candidateIds.includes(review.id)) throw new Error('Candidate is not in the open daily research queue');
  if (!['ready', 'rejected', 'deferred'].includes(review.status)) throw new Error('Use ready, rejected or deferred');
  if (typeof review.note !== 'string' || review.note.trim().length < 25) throw new Error('Record a specific research outcome, not a generic status');
  const checks = review.sourceChecks || [];
  if (!Array.isArray(checks) || checks.some(check => !canonicalNewsUrl(check.url) || !['read', 'blocked', 'unavailable'].includes(check.outcome))) throw new Error('Invalid source checks');
  const read = checks.filter(check => check.outcome === 'read');
  let mergedInto;
  if (review.status === 'ready') {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)?$/.test(review.articleSlug || '') || run.baselineSlugs.includes(review.articleSlug)) throw new Error('Ready candidates need a new one- or two-word article slug');
    if (!articles?.some(article => article.slug === review.articleSlug)) throw new Error('The drafted News article is missing');
    const hosts = new Set(read.map(check => sourceHost(check.url)).filter(host => host !== 'hashtagweb3.com'));
    if (hosts.size < 2) throw new Error('Read at least two independent external sites before marking ready');
    if (Object.entries(run.outcomes).some(([id, outcome]) => id !== review.id && outcome.articleSlug === review.articleSlug)) throw new Error('Another candidate already owns this draft; merge duplicate leads explicitly');
  }
  if (review.status === 'rejected') {
    if (!REJECT_REASONS.has(review.reason)) throw new Error('Sourcing problems must be deferred, not permanently rejected');
    if (review.reason === 'duplicate' && !articles?.some(article => article.slug === review.duplicateOf)) throw new Error('A duplicate rejection must identify the existing News article');
    if (review.reason === 'duplicate' && !run.baselineSlugs.includes(review.duplicateOf)) {
      mergedInto = Object.entries(run.outcomes).find(([, outcome]) => outcome.status === 'ready' && outcome.articleSlug === review.duplicateOf)?.[0];
      if (!mergedInto || mergedInto === review.id) throw new Error('An unpublished duplicate must point to another ready candidate');
    }
  }
  if (review.status === 'deferred') {
    if (!DEFER_REASONS.has(review.reason) || !checks.length) throw new Error('A deferral needs a sourcing/quality blocker and the URLs actually attempted');
    if (!Array.isArray(review.retrySearches) || !review.retrySearches.some(query => typeof query === 'string' && query.trim().length >= 10)) throw new Error('Record what to research next time');
  }
  const outcome = { status: review.status, reason: review.status === 'ready' ? 'verified-event' : review.reason, note: review.note.trim(), sourceChecks: checks, reviewedAt: iso(now),
    ...(review.articleSlug ? { articleSlug: review.articleSlug } : {}), ...(review.duplicateOf ? { duplicateOf: review.duplicateOf } : {}), ...(mergedInto ? { mergedInto } : {}), ...(review.retrySearches ? { retrySearches: review.retrySearches } : {}) };
  if (!run.outcomes[item.id]) item.attempts++;
  run.outcomes[item.id] = outcome;
  Object.assign(item, outcome, { lastReviewedDay: day });
  if (review.status === 'deferred') item.nextReviewDate = new Date(Date.parse(`${day}T00:00:00Z`) + 86400000).toISOString().slice(0, 10);
  else delete item.nextReviewDate;
  return outcome;
}

export function researchReport(ledger, day) {
  const run = ledger.runs[day];
  if (!run) throw new Error('Missing daily research run');
  const items = run.candidateIds.map(id => ({ id, title: ledger.candidates[id].title, link: ledger.candidates[id].link, ...(run.outcomes[id] || { status: 'unreviewed' }) }));
  const counts = { published: 0, ready: 0, rejected: 0, deferred: 0, unreviewed: 0 };
  for (const item of items) counts[item.status]++;
  const discoveryHealthy = run.discovery?.feeds?.some(feed => feed.ok) === true;
  return { day, status: run.status, candidates: items.length, counts, discoveryHealthy, feeds: run.discovery?.feeds || [], validationErrors: run.validationErrors || [],
    complete: discoveryHealthy && counts.unreviewed === 0 && !(run.validationErrors?.length), outcomes: items };
}

export function finalizeResearch(ledger, day, { validationErrors = [], now = Date.now() } = {}) {
  const run = ledger.runs[day];
  if (run.status === 'completed') return researchReport(ledger, day);
  run.validationErrors = validationErrors;
  const before = researchReport(ledger, day);
  // Incomplete research keeps every draft queued for the daily retry.
  if (!before.complete) {
    run.status = 'incomplete';
    for (const id of run.candidateIds) if (run.outcomes[id]?.status === 'ready') ledger.candidates[id].lastValidationErrors = validationErrors;
    return researchReport(ledger, day);
  }
  for (const id of run.candidateIds) {
    const outcome = run.outcomes[id];
    if (outcome.status !== 'ready') continue;
    outcome.status = 'published'; outcome.publishedAt = iso(now);
    Object.assign(ledger.candidates[id], outcome);
  }
  run.status = 'completed'; run.completedAt = iso(now);
  return researchReport(ledger, day);
}

export function retryUnpublishedDrafts(ledger, day) {
  const run = ledger.runs[day];
  if (!run || run.status === 'completed') return;
  for (const id of run.candidateIds) if (run.outcomes[id]?.status === 'ready' || run.outcomes[id]?.mergedInto) {
    ledger.candidates[id].status = 'pending';
    delete ledger.candidates[id].mergedInto;
    delete run.outcomes[id];
  }
  delete run.validationErrors;
}

export function reportMarkdown(report) {
  const escape = value => String(value || '').replace(/[|\r\n]/g, ' ');
  return `## News research ${report.day}\n\n${report.candidates} candidates: ${report.counts.published} published, ${report.counts.ready} ready, ${report.counts.rejected} rejected, ${report.counts.deferred} deferred, ${report.counts.unreviewed} unreviewed.\n\n` +
    `Coverage complete: ${report.complete}. Feed responses: ${report.feeds.filter(feed => feed.ok).length}/${report.feeds.length}.\n\n| Candidate | Outcome | Reason | Article / next step |\n|---|---|---|---|\n` +
    report.outcomes.map(item => `| ${escape(item.title)} | ${item.status} | ${escape(item.note)} | ${escape(item.articleSlug ? `/${item.articleSlug}` : item.duplicateOf ? `Covered by /${item.duplicateOf}` : (item.retrySearches || []).join('; '))} |`).join('\n') + '\n' +
    report.validationErrors.map(error => `\n- ${escape(error)}`).join('');
}
