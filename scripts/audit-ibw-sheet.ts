import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { load } from 'cheerio';
import { EVENT_SOURCES } from '../src/lib/event-sources';
import type { Web3Event } from '../src/lib/events';

const source = 'https://docs.google.com/spreadsheets/d/1NZ09OVlqElsM64oUm-8i1yh_A-U0p39BJECthwHCsLA/htmlview/sheet?headers=true&gid=0';
const key = (value?: string | null) => {
  try {
    const url = new URL(value || '');
    return `${url.hostname.replace(/^www\./, '').replace('lu.ma', 'luma.com')}${url.pathname.replace(/\/$/, '')}`.toLowerCase();
  } catch { return ''; }
};
const norm = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const urls = (event: Web3Event) => [event.url, event.registrationUrl, event.website, event.descriptionSource?.url, event.sourceVerification?.url].filter(Boolean).map(key);

async function main() {
  const response = await fetch(source, { signal: AbortSignal.timeout(60_000) });
  if (!response.ok) throw new Error(`Sheet HTTP ${response.status}`);
  const html = await response.text();
  const $ = load(html);
  const runtime = JSON.parse(fs.readFileSync('content/events-runtime.json', 'utf8')) as Web3Event[];
  const stored = EVENT_SOURCES.flatMap(source => (JSON.parse(fs.readFileSync(`content/events/sources/${source.file}`, 'utf8')) as Web3Event[]).map(event => ({ ...event, sourceFile: source.file })));
  const historical = JSON.parse(fs.readFileSync('content/events/mumbai-audit-report.json', 'utf8')) as { records: Array<{ url: string; ids: string[] }> };
  const checksFile = 'content/events/ibw-sheet-source-checks-2026-10-23.json';
  const checks = fs.existsSync(checksFile) ? JSON.parse(fs.readFileSync(checksFile, 'utf8')) as Array<{ row: number; eventId: string | null }> : [];
  const reviewsFile = 'content/events/ibw-sheet-review-2026-10-23.json';
  const reviews = fs.existsSync(reviewsFile) ? JSON.parse(fs.readFileSync(reviewsFile, 'utf8')) as Record<string, { decision: string; note: string }> : {};
  const rows: Array<Record<string, unknown>> = [];
  $('table.waffle tbody tr').each((_, row) => {
    const cells = $(row).children('td');
    const date = cells.eq(0).text().trim();
    if (!/^(Oct|Nov)-\d+/.test(date)) return;
    const nameCell = cells.eq(3).clone();
    const organizerSpans = nameCell.find('span').filter((_, span) => /font-size:\s*8pt/.test($(span).attr('style') || ''));
    const organizer = organizerSpans.text().trim();
    organizerSpans.remove();
    const name = nameCell.text().trim();
    if (!name) return;
    let url = cells.eq(5).find('a').attr('href') || '';
    if (url) { const wrapped = new URL(url); if (wrapped.hostname === 'www.google.com' && wrapped.pathname === '/url') url = wrapped.searchParams.get('q') || ''; }
    if (url && /^(?:www\.)?(?:luma\.com|lu\.ma)$/.test(new URL(url).hostname)) url = `https://luma.com${new URL(url).pathname}`;
    const identity = key(url);
    const rowNumber = Number($(row).find('th').text());
    const checkedEventId = checks.find(check => check.row === rowNumber)?.eventId;
    const review = reviews[String(rowNumber)];
    const priorIds = new Set(historical.records.filter(record => identity && key(record.url) === identity).flatMap(record => record.ids));
    const sourceMatches = stored.filter(event => identity && urls(event).includes(identity));
    for (const event of sourceMatches) priorIds.add(event.id);
    let matches = runtime.filter(event => priorIds.has(event.id) || (identity && urls(event).includes(identity)) || (checkedEventId && event.sourceVerification?.eventId === checkedEventId));
    let reason = 'registration URL / previously verified identity';
    if (!matches.length && !url) { matches = runtime.filter(event => norm(event.name) === norm(name)); reason = 'exact title, registration still TBD in sheet'; }
    if (/^.*IBW2026 Conference - Day/i.test(name)) { matches = runtime.filter(event => event.id === 'premier-indiabw-2026'); reason = 'main conference, one record for both days'; }
    if (!matches.length && /^.*Devcon - Day/i.test(name)) { matches = runtime.filter(event => event.id === 'premier-devcon-2026'); reason = 'main conference, one record for all days'; }
    if (!matches.length && /^ETHGlobal Mumbai - Day/i.test(name)) { matches = runtime.filter(event => event.id === 'premier-ethmumbai-2026'); reason = 'hackathon, one record for all days'; }
    const nameTokens = new Set(norm(name).split(' ').filter(token => token.length > 3));
    const candidates = !matches.length ? runtime.filter(event => {
      const tokens = new Set(norm(event.name).split(' '));
      return [...nameTokens].filter(token => tokens.has(token)).length >= Math.min(3, nameTokens.size) && nameTokens.size >= 2;
    }).map(event => ({ id: event.id, slug: event.slug, name: event.name, url: event.url })) : [];
    rows.push({ row: rowNumber, date, startTime: cells.eq(1).text().trim(), endTime: cells.eq(2).text().trim(), name, organizer, category: cells.eq(4).text().trim(), url: url || null, status: matches.length ? review?.decision === 'add' ? 'added' : 'already-published' : review?.decision === 'hold' ? 'held' : url ? 'needs-review' : 'registration-tbd', ...(review && { reviewNote: review.note }), ...(matches.length && { matchReason: reason }), published: matches.map(event => ({ id: event.id, slug: event.slug, name: event.name, startDate: event.startDate, endDate: event.endDate })), sourceMatches: sourceMatches.map(event => ({ id: event.id, file: event.sourceFile })), candidates });
  });
  if (!rows.length) throw new Error('No spreadsheet rows parsed.');
  const report = { checkedAt: new Date().toISOString(), source, sourceSha256: createHash('sha256').update(html).digest('hex'), rows: rows.length, alreadyPublished: rows.filter(row => row.status === 'already-published').length, added: rows.filter(row => row.status === 'added').length, held: rows.filter(row => row.status === 'held').length, needsReview: rows.filter(row => row.status === 'needs-review').length, registrationTbd: rows.filter(row => !row.url).length, entries: rows };
  fs.writeFileSync('content/events/ibw-sheet-audit-2026-10-23.json', JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ ...report, entries: rows.filter(row => row.status !== 'already-published') }, null, 2));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
