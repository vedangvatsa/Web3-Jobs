import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { EVENT_SOURCES } from '../src/lib/event-sources';
import { getEventSlug, type Web3Event } from '../src/lib/events';
import { canonicalLumaUrl, lumaSourcePatch, object, type LumaSnapshot } from './luma-source-record';

const ROOT = process.cwd();
const CACHE = path.join(ROOT, '.cache/event-verification');
const args = process.argv.slice(2);
const option = (name: string) => args.find((arg) => arg.startsWith(`--${name}=`))?.split('=').slice(1).join('=');
const hash = (value: string) => createHash('sha256').update(value).digest('hex');
const snapshotPath = (url: string) => path.join(CACHE, 'pages', `${hash(url)}.json`);
const sourceUrl = (event: Web3Event) => [event.registrationUrl, event.url, event.website].map(canonicalLumaUrl).find(Boolean);

async function fetchSnapshot(url: string): Promise<LumaSnapshot> {
  const response = await fetch(url, {
    headers: { 'user-agent': 'Mozilla/5.0 (compatible; HashtagWeb3/1.0; +https://hashtagweb3.com)', accept: 'text/html' },
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  if (!canonicalLumaUrl(response.url)) throw new Error('Redirected outside a Luma event page');
  const html = await response.text();
  const match = html.match(/<script[^>]+id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!match) throw new Error('No Luma page data');
  const root = object(JSON.parse(match[1]));
  const props = object(object(root.props).pageProps);
  const data = object(object(props.initialData).data);
  const snapshot: LumaSnapshot = { url, fetchedAt: new Date().toISOString(), method: 'luma-page', data };
  lumaSourcePatch(snapshot);
  return snapshot;
}

function describe(value: unknown): unknown {
  if (typeof value === 'string' && value.length > 600) return { characters: value.length, sha256: hash(value), preview: value.slice(0, 200) };
  return value ?? null;
}

async function main() {
  fs.mkdirSync(path.join(CACHE, 'pages'), { recursive: true });
  const urls = [...new Set(EVENT_SOURCES.flatMap(({ events }) => events.map(sourceUrl).filter((url): url is string => !!url)))];
  const apifyRun = option('apify-run');
  if (apifyRun) {
    if (!/^[\w-]+$/.test(apifyRun)) throw new Error('Invalid Apify run ID');
    const rows = JSON.parse(fs.readFileSync(path.join(CACHE, `${apifyRun}-items.json`), 'utf8')) as unknown[];
    let matched = 0;
    const targets = new Set(urls);
    const unmatched: Array<Record<string, unknown>> = [];
    for (const row of rows) {
      const data = object(row);
      const rawUrl = typeof data.eventUrl === 'string' ? data.eventUrl : typeof data.url === 'string' ? data.url : `https://luma.com/${object(data.event).url}`;
      let url = canonicalLumaUrl(rawUrl);
      const requestedUrl = typeof data.sourceUrl === 'string' ? canonicalLumaUrl(data.sourceUrl) : null;
      const apiId = typeof data.eventId === 'string' ? data.eventId : String(object(data.event).api_id || '');
      if (url && !targets.has(url) && requestedUrl && targets.has(requestedUrl)) {
        const matchingId = EVENT_SOURCES.some(({ events }) => events.some((event) => sourceUrl(event) === requestedUrl && event.id.endsWith(apiId.replace(/^evt-/, ''))));
        const previous = fs.existsSync(snapshotPath(requestedUrl)) ? JSON.parse(fs.readFileSync(snapshotPath(requestedUrl), 'utf8')) as LumaSnapshot : undefined;
        if (url.toLowerCase() === requestedUrl.toLowerCase() || matchingId || object(previous?.data.event).api_id === apiId) url = requestedUrl;
      }
      if (!url || !targets.has(url) || (!object(data.event).api_id && (!data.eventId || data.detailsFetched !== true))) {
        unmatched.push({ url, sourceUrl: data.sourceUrl, eventId: data.eventId, name: data.name, detailsFetched: data.detailsFetched });
        continue;
      }
      const snapshot: LumaSnapshot = { url, fetchedAt: typeof data.fetchedAt === 'string' ? data.fetchedAt : typeof data.scrapedAt === 'string' ? data.scrapedAt : new Date().toISOString(), method: 'apify', apifyRunId: apifyRun, data };
      lumaSourcePatch(snapshot);
      const previous = fs.existsSync(snapshotPath(url)) ? JSON.parse(fs.readFileSync(snapshotPath(url), 'utf8')) as LumaSnapshot : undefined;
      // Raw ProseMirror snapshots retain source links and list structure that normalized actors discard.
      const result = previous?.data.description_mirror ? { ...previous, apifyRunId: apifyRun } : snapshot;
      fs.writeFileSync(snapshotPath(url), JSON.stringify(result, null, 2));
      matched++;
    }
    fs.writeFileSync(path.join(CACHE, `${apifyRun}-unmatched.json`), JSON.stringify(unmatched, null, 2));
    console.log(`Matched ${matched} of ${rows.length} Apify results to stored event URLs.`);
  }

  const failures: Array<{ url: string; error: string }> = [];
  if (args.includes('--fetch-rich')) {
    const queue = urls.filter((url) => fs.existsSync(snapshotPath(url))).filter((url) => {
      const snapshot = JSON.parse(fs.readFileSync(snapshotPath(url), 'utf8')) as LumaSnapshot;
      return !snapshot.data.description_mirror;
    });
    const total = queue.length;
    let finished = 0;
    let rateLimited = false;
    console.log(`Fetching ${total} rich-text payloads from Luma's public event API.`);
    await Promise.all(Array.from({ length: 2 }, async () => {
      while (queue.length && !rateLimited) {
        const url = queue.shift()!;
        const snapshot = JSON.parse(fs.readFileSync(snapshotPath(url), 'utf8')) as LumaSnapshot;
        try {
          const id = lumaSourcePatch(snapshot).sourceVerification!.eventId;
          const response = await fetch(`https://api.lu.ma/event/get?event_api_id=${encodeURIComponent(id)}`, { signal: AbortSignal.timeout(30_000) });
          if (response.status === 429) rateLimited = true;
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const data = object(await response.json());
          if (object(data.event).api_id !== id) throw new Error('Source event ID mismatch');
          const rich: LumaSnapshot = { ...snapshot, data, fetchedAt: new Date().toISOString(), method: 'luma-api' };
          lumaSourcePatch(rich);
          fs.writeFileSync(snapshotPath(url), JSON.stringify(rich, null, 2));
        } catch (error) {
          failures.push({ url, error: error instanceof Error ? error.message : 'Unknown failure' });
        }
        finished++;
        if (finished % 25 === 0 || finished === total) console.log(`Rich payloads: ${finished}/${total}; ${failures.length} failures.`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }));
    if (rateLimited) console.log('Stopped on rate limit; rerun --fetch-rich later to resume.');
    fs.writeFileSync(path.join(CACHE, 'rich-fetch-failures.json'), JSON.stringify(failures, null, 2));
  }
  if (args.includes('--fetch')) {
    const pending = urls.filter((url) => !fs.existsSync(snapshotPath(url))).slice(0, Number(option('limit') || urls.length));
    console.log(`Fetching ${pending.length} missing Luma page snapshots; existing snapshots are reused.`);
    let finished = 0;
    let rateLimited = false;
    const queue = [...pending];
    await Promise.all(Array.from({ length: 4 }, async () => {
      while (queue.length && !rateLimited) {
        const url = queue.shift()!;
        try {
          const snapshot = await fetchSnapshot(url);
          fs.writeFileSync(snapshotPath(url), JSON.stringify(snapshot, null, 2));
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown failure';
          if (message === 'HTTP 429') rateLimited = true;
          failures.push({ url, error: message });
        }
        finished++;
        if (finished % 25 === 0 || finished === pending.length) console.log(`Fetched ${finished}/${pending.length}; ${failures.length} failures.`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }));
    if (rateLimited) console.log('Stopped on rate limit; cached pages are retained for the next run.');
    fs.writeFileSync(path.join(CACHE, 'fetch-failures.json'), JSON.stringify(failures, null, 2));
  }

  const records: Array<Record<string, unknown>> = [];
  let changed = 0;
  let verified = 0;
  const changedFields: Record<string, number> = {};
  const apply = args.includes('--apply');
  const failuresPath = path.join(CACHE, 'fetch-failures.json');
  const priorFailures = fs.existsSync(failuresPath) ? JSON.parse(fs.readFileSync(failuresPath, 'utf8')) as Array<{ url: string; error: string }> : [];
  const published = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/events-runtime.json'), 'utf8')) as Web3Event[];
  const publishedSlugs = new Map(published.map((event) => [event.id, getEventSlug(event)]));
  for (const source of EVENT_SOURCES) {
    const filePath = path.join(ROOT, 'content/events/sources', source.file);
    const events = JSON.parse(fs.readFileSync(filePath, 'utf8')) as Web3Event[];
    const backup = path.join(CACHE, `before-${source.file}`);
    const baseline = fs.existsSync(backup) ? JSON.parse(fs.readFileSync(backup, 'utf8')) as Web3Event[] : events;
    const baselineById = new Map(baseline.map((event) => [event.id, event]));
    let fileChanged = false;
    for (const event of events) {
      const url = sourceUrl(event);
      if (!url) continue;
      if (!fs.existsSync(snapshotPath(url))) {
        records.push({ id: event.id, file: source.file, url, status: 'unverified', reason: priorFailures.find((failure) => failure.url === url)?.error || 'No matching source result' });
        continue;
      }
      const snapshot = JSON.parse(fs.readFileSync(snapshotPath(url), 'utf8')) as LumaSnapshot;
      if (snapshot.url !== url) throw new Error(`Snapshot URL mismatch: ${url}`);
      const patch = lumaSourcePatch(snapshot);
      verified++;
      const before = baselineById.get(event.id) || event;
      const differences = Object.entries(patch).filter(([key, value]) => key !== 'sourceVerification' && JSON.stringify(before[key as keyof Web3Event]) !== JSON.stringify(value));
      for (const [field] of differences) changedFields[field] = (changedFields[field] || 0) + 1;
      records.push({
        id: event.id, file: source.file, url, method: snapshot.method, apifyRunId: snapshot.apifyRunId,
        fetchedAt: snapshot.fetchedAt, sourceEventId: patch.sourceVerification!.eventId,
        status: differences.length ? 'corrected' : 'verified',
        descriptionAvailable: Boolean(patch.description),
        changes: differences.map(([field, value]) => ({ field, before: describe(before[field as keyof Web3Event]), after: describe(value) })),
      });
      if (differences.length) changed++;
      if (apply) {
        // Titles can change at the source; preserve already published URL slugs.
        event.slug = publishedSlugs.get(event.id) || event.slug || getEventSlug(event);
        Object.assign(event, patch);
        fileChanged = true;
      }
    }
    if (fileChanged) {
      if (!fs.existsSync(backup)) fs.copyFileSync(filePath, backup);
      const output = `${JSON.stringify(events, null, 2)}\n`;
      if (fs.readFileSync(filePath, 'utf8') !== output) fs.writeFileSync(filePath, output);
    }
  }
  const report = { generatedAt: new Date().toISOString(), applied: apply, uniqueUrls: urls.length, verifiedRecords: verified, changedRecords: changed, changedFields, records };
  const reportPath = apply ? path.join(ROOT, 'content/events/verification-report.json') : path.join(CACHE, 'comparison-report.json');
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`${verified} verified records; ${changed} ${apply ? 'corrected' : 'would change'}; ${records.length - verified} unverified. Report: ${path.relative(ROOT, reportPath)}`);
  console.log(`Changed fields: ${JSON.stringify(changedFields)}`);
  const unresolved = records.filter((record) => record.status === 'unverified');
  if (unresolved.length <= 20) console.log(`Unverified records: ${JSON.stringify(unresolved)}`);
}

main().catch((error: Error) => { console.error(error.message); process.exitCode = 1; });
