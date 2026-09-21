import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { load } from 'cheerio';
import { EVENT_SOURCES } from '../src/lib/event-sources';
import { getEventSlug, type Web3Event } from '../src/lib/events';
import { lumaSourcePatch, object } from './luma-source-record';

type Evidence = { url: string; variant?: 'rendered' | 'reader'; contains: string[] };
type Repair = {
  id: string;
  kind: 'luma' | 'reviewed' | 'quarantine';
  sourceUrl: string;
  variant?: Evidence['variant'];
  contains: string[];
  eventId?: string;
  keepSession?: boolean;
  description?: string;
  patch?: Partial<Web3Event>;
  clearFields?: Array<keyof Web3Event>;
  evidence?: Evidence[];
  reason: string;
};
type Snapshot = { url: string; resolvedUrl?: string; fetchedAt: string; status?: number; title?: string; html?: string; text?: string; retrievedVia?: string };
const root = process.cwd();
const directory = path.join(root, '.cache/event-verification/gap-pages');
const hash = (value: string) => createHash('sha256').update(value).digest('hex');
const normalize = (value: string) => value.normalize('NFKC').replace(/[\u200b-\u200d\ufeff]/g, '').replace(/[‘’´]/g, "'").replace(/[–—]/g, '-').replace(/[\s*`#]+/g, '').toLowerCase();

async function snapshotFor(source: { url: string; variant?: Evidence['variant'] }): Promise<Snapshot> {
  const suffix = source.variant ? `-${source.variant}` : '';
  const file = path.join(directory, `${hash(source.url)}${suffix}.json`);
  if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8')) as Snapshot;
  if (source.variant === 'rendered') throw new Error(`A browser snapshot is required for ${source.url}`);
  const fetchUrl = source.variant === 'reader' ? `https://r.jina.ai/${source.url}` : source.url;
  const response = await fetch(fetchUrl, { signal: AbortSignal.timeout(90_000), headers: { 'user-agent': 'Mozilla/5.0' } });
  const body = await response.text();
  const snapshot: Snapshot = { url: source.url, resolvedUrl: source.url, fetchedAt: new Date().toISOString(), status: response.status };
  if (source.variant === 'reader') {
    if (!body.includes(`URL Source: ${source.url}`)) throw new Error(`Reader source mismatch: ${source.url}`);
    snapshot.text = body;
    snapshot.retrievedVia = fetchUrl;
    snapshot.title = body.match(/^Title: (.+)$/m)?.[1] || '';
  } else {
    snapshot.html = body;
    snapshot.resolvedUrl = response.url;
    const $ = load(body);
    snapshot.title = $('title').first().text();
    $('script,style,svg,noscript').remove();
    $('p,div,section,li,tr,h1,h2,h3,h4').append('\n');
    snapshot.text = $('body').text();
  }
  fs.writeFileSync(file, JSON.stringify(snapshot));
  return snapshot;
}

function validateEvidence(snapshot: Snapshot, expected: string[]): void {
  const plain = normalize(`${snapshot.title || ''}\n${snapshot.text || ''}`);
  for (const phrase of expected) {
    if (!plain.includes(normalize(phrase))) throw new Error(`Evidence not found at ${snapshot.url}: ${phrase}`);
  }
}

async function main() {
  fs.mkdirSync(directory, { recursive: true });
  const plan = JSON.parse(fs.readFileSync('content/events/source-recovery.json', 'utf8')) as { repairs: Repair[]; relatedRepairs?: Repair[] };
  const repairs = [...plan.repairs, ...(plan.relatedRepairs || [])];
  const baselineFile = path.join(directory, 'runtime-before-recovery.json');
  if (!fs.existsSync(baselineFile)) fs.copyFileSync('content/events-runtime.json', baselineFile);
  const baseline = JSON.parse(fs.readFileSync(baselineFile, 'utf8')) as Web3Event[];
  const knownSlugs = new Map(baseline.map((event) => [event.id, getEventSlug(event)]));
  const patches = new Map<string, { patch: Partial<Web3Event>; clearFields: Array<keyof Web3Event> }>();
  const records: Array<Record<string, unknown>> = [];
  const failures: Array<{ id: string; error: string }> = [];
  for (const repair of repairs) {
    const existing = EVENT_SOURCES.flatMap((source) => source.events).find((event) => event.id === repair.id);
    if (!existing) throw new Error(`Unknown event: ${repair.id}`);
    try {
      const primary = await snapshotFor({ url: repair.sourceUrl, variant: repair.variant });
      validateEvidence(primary, repair.contains);
      const evidence = [primary];
      for (const item of repair.evidence || []) {
        const snapshot = await snapshotFor(item);
        validateEvidence(snapshot, item.contains);
        evidence.push(snapshot);
      }
      let patch: Partial<Web3Event>;
      if (repair.kind === 'quarantine') {
        if (primary.status !== 404) throw new Error('A quarantine for a removed source requires a confirmed 404');
        patch = { publicationStatus: 'needs-review', sourceReview: { checkedAt: primary.fetchedAt, url: repair.sourceUrl, reason: repair.reason } };
      } else if (repair.kind === 'luma') {
        const $ = load(primary.html || '');
        const data = object(object(object(JSON.parse($('#__NEXT_DATA__').text())).props).pageProps);
        const payload = object(object(data.initialData).data);
        if (object(payload.event).api_id !== repair.eventId) throw new Error('Luma event ID does not match the reviewed event');
        const canonical = `https://luma.com/${object(payload.event).url}`;
        patch = lumaSourcePatch({ url: canonical, data: payload, fetchedAt: primary.fetchedAt, method: 'luma-page' });
        if (repair.keepSession) Object.assign(patch, { name: existing.name, startDate: existing.startDate, endDate: existing.endDate });
        patch.url = canonical;
        patch.website = canonical;
      } else {
        if (!repair.description?.trim()) throw new Error('Reviewed source content is empty');
        patch = {
          description: repair.description,
          descriptionSource: {
            url: repair.sourceUrl, fetchedAt: primary.fetchedAt, method: 'reviewed-primary-sources',
            pageTitle: primary.title || existing.name, sha256: hash(repair.description),
            evidence: evidence.map((snapshot) => ({ url: snapshot.url, fetchedAt: snapshot.fetchedAt, sha256: hash(snapshot.html || snapshot.text || ''), ...(snapshot.retrievedVia ? { retrievedVia: snapshot.retrievedVia } : {}) })),
          },
          website: repair.sourceUrl,
          registrationUrl: repair.sourceUrl,
        };
      }
      Object.assign(patch, repair.patch, { slug: knownSlugs.get(repair.id) || existing.slug || getEventSlug(existing) });
      patches.set(repair.id, { patch, clearFields: repair.clearFields || [] });
      records.push({ id: repair.id, outcome: repair.kind === 'quarantine' ? 'needs-review' : 'recovered', sourceUrl: repair.sourceUrl, reason: repair.reason, fetchedAt: primary.fetchedAt, characters: patch.description?.length || 0, changes: Object.keys(patch).filter((field) => JSON.stringify(existing[field as keyof Web3Event]) !== JSON.stringify(patch[field as keyof Web3Event])) });
      console.log(`${repair.id}: ${repair.kind === 'quarantine' ? 'quarantined' : `recovered ${patch.description?.length || 0} characters`}`);
    } catch (error) {
      failures.push({ id: repair.id, error: error instanceof Error ? error.message : String(error) });
      console.error(`${repair.id}: ${failures[failures.length - 1].error}`);
    }
  }
  const apply = process.argv.includes('--apply');
  if (apply && failures.length) throw new Error(`No source files changed: ${failures.length} repairs failed evidence validation.`);
  if (apply) {
    for (const source of EVENT_SOURCES) {
      const file = path.join(root, 'content/events/sources', source.file);
      const events = JSON.parse(fs.readFileSync(file, 'utf8')) as Web3Event[];
      let changed = false;
      for (const event of events) {
        const repair = patches.get(event.id);
        if (!repair) continue;
        Object.assign(event, repair.patch);
        for (const field of repair.clearFields) delete event[field];
        changed = true;
      }
      if (changed) fs.writeFileSync(file, `${JSON.stringify(events, null, 2)}\n`);
    }
  }
  const report = { applied: apply, originalGaps: plan.repairs.length, total: repairs.length, recovered: records.filter((record) => record.outcome === 'recovered').length, quarantined: records.filter((record) => record.outcome === 'needs-review').length, failures, records };
  fs.writeFileSync(apply ? 'content/events/source-recovery-report.json' : path.join(directory, 'recovery-preview.json'), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({ ...report, records: undefined }));
}
main().catch((error: Error) => { console.error(error.message); process.exitCode = 1; });
