/**
 * Resend audience audit + rank + segment + trim.
 *
 * audit (read-only): lists audiences and segments, counts contacts per audience
 *   (total, unsubscribed), reports oldest/newest created_at so a keep-set can be
 *   chosen before any destructive change. Tolerates stale audiences (404 → skip).
 *
 * probe (read-only): endpoint recon — /emails shape + pagination, /broadcasts,
 *   /segments list, segment-membership reads, contact object keys.
 *
 * rank (read-only): dumps the focus audience's contacts, walks GET /emails
 *   (per-recipient sent/opened/clicked aggregation from last_event), ranks
 *   contacts by engagement (clicks → opens → open rate → sends → recency),
 *   and writes masked-email artifacts: contacts.json, ranked.json, top.json.
 *   Full email addresses never leave the runner (public-repo artifacts).
 *
 * segment (write, reversible): re-derives the ranking and adds the top
 *   --keep-count contacts to --segment-id (e.g. Daily1000), reporting per-add
 *   status and the resulting membership count.
 *
 * trim (destructive): shrinks the focus audience to the members of
 *   --segment-id (the keep-set, e.g. Daily1000). Exports deleted.json (full
 *   emails, local file) as the suppression record before deleting, then
 *   deletes at --rps with retries; 404s count as already-gone. --dry true
 *   plans and exports without deleting. Re-running resumes automatically.
 *
 * Env: RESEND_API_KEY (required), RESEND_AUDIENCE_ID (optional focus).
 * Usage:
 *   node scripts/resend-audience-trim.mjs --mode audit
 *   node scripts/resend-audience-trim.mjs --mode probe
 *   node scripts/resend-audience-trim.mjs --mode rank --keep-count 1000 \
 *     --out-dir resend-rank-out
 *   node scripts/resend-audience-trim.mjs --mode segment --keep-count 1000 \
 *     --segment-id <uuid> --out-dir resend-rank-out
 */

import fs from 'node:fs';

const BASE = 'https://api.resend.com';

const maskEmail = email => {
  const [local = '', domain = ''] = String(email || '').split('@');
  return `${local.slice(0, 2)}***@${domain}`;
};

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) out[argv[i].slice(2)] = argv[i + 1] ?? '';
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));
const mode = args['mode'] || 'audit';
const key = process.env.RESEND_API_KEY;
const focusId = process.env.RESEND_AUDIENCE_ID?.trim();
if (!key) throw new Error('RESEND_API_KEY missing');
if (mode === 'trim') {
  if (args['confirm'] !== 'DELETE') throw new Error('trim requires --confirm DELETE');
  if (!/^\d+$/.test(args['keep-count'] || '')) throw new Error('trim requires a numeric --keep-count');
}

async function api(path, init = {}, attempt = 0) {
  let response;
  try {
    response = await fetch(`${BASE}${path}`, {
      ...init,
      headers: { Authorization: `Bearer ${key}`, 'content-type': 'application/json', ...(init.headers || {}) },
    });
  } catch (error) {
    // Transport-level failure (reset/timeout) — this machine's link drops
    // during long walks; retry with backoff before giving up.
    if (attempt < 12) {
      await new Promise(resolve => setTimeout(resolve, Math.min(60, 2 ** attempt) * 1000));
      return api(path, init, attempt + 1);
    }
    throw new Error(`network error after retries: ${path}: ${error.message}`);
  }
  if (response.status === 429 || response.status >= 500) {
    const retryAfter = Number(response.headers.get('retry-after')) || Math.min(60, 2 ** attempt);
    if (attempt < 8) {
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      return api(path, init, attempt + 1);
    }
    throw new Error(`Resend API ${response.status} after retries: ${path}`);
  }
  if (!response.ok) throw new Error(`Resend API ${response.status} ${path}: ${await response.text()}`);
  const text = await response.text();
  return text ? JSON.parse(text) : {};
}

async function* paginateContacts(audienceId) {
  let after;
  for (;;) {
    const query = new URLSearchParams({ limit: '100' });
    if (after) query.set('after', after);
    const page = await api(`/audiences/${audienceId}/contacts?${query}`);
    const items = Array.isArray(page?.data) ? page.data : [];
    if (!items.length) return;
    for (const item of items) yield item;
    const hasMore = page?.has_more ?? page?.hasMore ?? items.length === 100;
    if (!hasMore) return;
    after = items[items.length - 1]?.id;
    if (!after) return;
    await new Promise(resolve => setTimeout(resolve, 120));
  }
}

async function listAudiences() {
  const page = await api('/audiences');
  return Array.isArray(page?.data) ? page.data : [];
}

async function listSegments() {
  try {
    const page = await api('/segments');
    return Array.isArray(page?.data) ? page.data : [];
  } catch {
    return null;
  }
}

async function auditAudience(audience) {
  const stats = { id: audience.id, name: audience.name, total: 0, unsubscribed: 0, oldestCreatedAt: null, newestCreatedAt: null, newestSample: [] };
  for await (const contact of paginateContacts(audience.id)) {
    stats.total++;
    if (contact?.unsubscribed) stats.unsubscribed++;
    const createdAt = contact?.created_at || null;
    if (createdAt && (!stats.newestCreatedAt || createdAt > stats.newestCreatedAt)) stats.newestCreatedAt = createdAt;
    if (createdAt && (!stats.oldestCreatedAt || createdAt < stats.oldestCreatedAt)) stats.oldestCreatedAt = createdAt;
    if (stats.newestSample.length < 3) stats.newestSample.push({ id: contact.id, email: `${String(contact.email || '').slice(0, 2)}***@${String(contact.email || '').split('@')[1] || ''}`, created_at: contact.created_at, unsubscribed: Boolean(contact.unsubscribed) });
    if (stats.total % 5000 === 0) console.error(`[audit] ${audience.name}: ${stats.total} counted...`);
  }
  return stats;
}

const EMAILS_PAGE_SLEEP_MS = 150;
const CONTACTS_PAGE_SLEEP_MS = 120;

async function* paginate(path, pageSleepMs = EMAILS_PAGE_SLEEP_MS) {
  let after;
  for (;;) {
    const query = new URLSearchParams({ limit: '100' });
    if (after) query.set('after', after);
    const page = await api(`${path}?${query}`);
    const items = Array.isArray(page?.data) ? page.data : [];
    if (!items.length) return;
    yield { items, page };
    const hasMore = page?.has_more ?? page?.hasMore ?? items.length === 100;
    if (!hasMore) return;
    after = items[items.length - 1]?.id;
    if (!after) return;
    await new Promise(resolve => setTimeout(resolve, pageSleepMs));
  }
}

function recipientOf(value) {
  const raw = Array.isArray(value) ? value[0] : value;
  const first = String(raw || '').split(',')[0].trim().toLowerCase();
  return first.includes('@') ? first : null;
}

// Aggregates per-recipient engagement from GET /emails (last_event is the
// terminal state of each individual email, so summing across all of a
// recipient's emails gives opens/clicks/total-sent). Returns stats + agg map.
async function buildEmailAgg({ maxPages }) {
  const agg = new Map();
  const fromCounts = {};
  const lastEventCounts = {};
  const stats = { pages: 0, scanned: 0, unmatched: 0, oldestCreatedAt: null, newestCreatedAt: null, truncated: false };
  for await (const { items, page } of paginate('/emails')) {
    stats.pages++;
    stats.scanned += items.length;
    for (const item of items) {
      const ev = item.last_event ?? 'none';
      lastEventCounts[ev] = (lastEventCounts[ev] || 0) + 1;
      const from = item.from ?? 'unknown';
      fromCounts[from] = (fromCounts[from] || 0) + 1;
      const createdAt = item.created_at || null;
      if (createdAt && (!stats.newestCreatedAt || createdAt > stats.newestCreatedAt)) stats.newestCreatedAt = createdAt;
      if (createdAt && (!stats.oldestCreatedAt || createdAt < stats.oldestCreatedAt)) stats.oldestCreatedAt = createdAt;
      const recipient = recipientOf(item.to);
      if (recipient) {
        const rec = agg.get(recipient) || { sent: 0, opened: 0, clicked: 0, lastSeen: null };
        rec.sent++;
        if (ev === 'opened' || ev === 'clicked') rec.opened++;
        if (ev === 'clicked') rec.clicked++;
        if (createdAt && (!rec.lastSeen || createdAt > rec.lastSeen)) rec.lastSeen = createdAt;
        agg.set(recipient, rec);
      } else {
        stats.unmatched++;
      }
    }
    const hasMore = page?.has_more ?? page?.hasMore ?? items.length === 100;
    if (!hasMore) return { agg, stats, fromCounts, lastEventCounts };
    if (stats.pages >= maxPages) { stats.truncated = true; return { agg, stats, fromCounts, lastEventCounts }; }
  }
  return { agg, stats, fromCounts, lastEventCounts };
}

// Full keep-set derivation shared by rank and segment modes: contact dump,
// engagement join, deterministic ranking (clicks → opens → open rate →
// sends → newest contact). Returns everything in memory; callers write artifacts.
async function buildRanking({ maxEmailPages, progressLabel }) {
  if (!focusId) throw new Error(`${progressLabel} requires RESEND_AUDIENCE_ID (focus audience)`);
  const contacts = [];
  for await (const contact of paginateContacts(focusId)) {
    contacts.push({ id: contact.id, email: String(contact.email || '').toLowerCase(), created_at: contact.created_at ?? null, unsubscribed: Boolean(contact.unsubscribed) });
    if (contacts.length % 10000 === 0) console.error(`[${progressLabel}] contacts: ${contacts.length}...`);
  }
  console.error(`[${progressLabel}] contacts total: ${contacts.length}`);

  const { agg, stats: emailStats, fromCounts, lastEventCounts } = await buildEmailAgg({ maxPages: maxEmailPages });
  console.error(`[${progressLabel}] emails: pages=${emailStats.pages} scanned=${emailStats.scanned} recipients=${agg.size} truncated=${emailStats.truncated}`);

  const ranked = contacts.map(contact => {
    const eng = agg.get(contact.email) || { sent: 0, opened: 0, clicked: 0, lastSeen: null };
    return { ...contact, sent: eng.sent, opened: eng.opened, clicked: eng.clicked, lastSeen: eng.lastSeen, openedRate: eng.sent ? eng.opened / eng.sent : 0 };
  });
  ranked.sort((a, b) => b.clicked - a.clicked
    || b.opened - a.opened
    || b.openedRate - a.openedRate
    || b.sent - a.sent
    || String(b.created_at || '').localeCompare(String(a.created_at || '')));
  return { contacts, ranked, emailStats, fromCounts, lastEventCounts, aggRecipients: agg.size };
}

async function main() {
  const audiences = await listAudiences();
  console.log(JSON.stringify({ mode, audiencesKnown: audiences.length, focusId: focusId || null }));

  if (mode === 'audit') {
    const segments = await listSegments();
    const results = [];
    for (const audience of audiences.sort((a, b) => (a.id === focusId ? -1 : b.id === focusId ? 1 : 0))) {
      let stats;
      try {
        stats = await auditAudience(audience);
      } catch (error) {
        results.push({ id: audience.id, name: audience.name, error: String(error.message) });
        console.error(`[audit] ${audience.name}: SKIPPED — ${error.message}`);
        continue;
      }
      results.push(stats);
      console.error(`[audit] ${stats.name}: total=${stats.total} unsubscribed=${stats.unsubscribed} range=${stats.oldestCreatedAt}..${stats.newestCreatedAt}`);
    }
    console.log(JSON.stringify({ mode, audiences: results, segments: segments === null ? 'endpoint-unavailable' : segments.map(s => ({ id: s.id, name: s.name, created_at: s.created_at })) }));
    return;
  }

  if (mode === 'probe') {
    // Read-only endpoint reconnaissance for the engagement-ranking design.
    // 1) /emails: does it cover broadcast recipients, how deep does pagination
    //    go, and which last_event/status values exist in the reachable window?
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
    const emailsStats = { pages: 0, scanned: 0, lastEventCounts: {}, statusCounts: {}, oldestCreatedAt: null, newestCreatedAt: null, hasMoreSamples: [] };
    let emailAfter;
    for (;;) {
      const query = new URLSearchParams({ limit: '100' });
      if (emailAfter) query.set('after', emailAfter);
      const page = await api(`/emails?${query}`).catch(error => ({ __error: String(error.message) }));
      if (page.__error) { emailsStats.error = page.__error; break; }
      const items = Array.isArray(page?.data) ? page.data : [];
      if (!items.length) break;
      emailsStats.pages++;
      emailsStats.scanned += items.length;
      for (const item of items) {
        const ev = item.last_event ?? 'none';
        emailsStats.lastEventCounts[ev] = (emailsStats.lastEventCounts[ev] || 0) + 1;
        const st = item.status ?? 'unknown';
        emailsStats.statusCounts[st] = (emailsStats.statusCounts[st] || 0) + 1;
        const ca = item.created_at || null;
        if (ca && (!emailsStats.newestCreatedAt || ca > emailsStats.newestCreatedAt)) emailsStats.newestCreatedAt = ca;
        if (ca && (!emailsStats.oldestCreatedAt || ca < emailsStats.oldestCreatedAt)) emailsStats.oldestCreatedAt = ca;
      }
      if (emailsStats.hasMoreSamples.length < 3) emailsStats.hasMoreSamples.push(page?.has_more ?? page?.hasMore ?? 'absent');
      emailAfter = items[items.length - 1]?.id;
      if (!emailAfter) break;
      if (emailsStats.pages >= 12) break;
      await sleep(150);
    }

    // 2) /broadcasts availability, /segments list, and segment-membership reads.
    const broadcasts = await api('/broadcasts?limit=5').catch(error => ({ error: String(error.message) }));
    const segments = await listSegments();
    let segmentRecon = null;
    if (Array.isArray(segments) && segments.length) {
      segmentRecon = [];
      for (const segment of segments.slice(0, 5)) {
        const members = await api(`/segments/${segment.id}/contacts?limit=3`).catch(error => ({ error: String(error.message) }));
        segmentRecon.push({
          id: segment.id,
          name: segment.name,
          created_at: segment.created_at ?? null,
          membershipEndpoint: members?.error ? { error: members.error } : {
            returned: Array.isArray(members?.data) ? members.data.length : null,
            keys: members?.data?.[0] ? Object.keys(members.data[0]) : null,
            hasMore: members && 'has_more' in members ? members.has_more : 'absent',
          },
        });
      }
    }

    const contactShape = focusId ? await api(`/audiences/${focusId}/contacts?limit=2`).catch(error => ({ error: String(error.message) })) : null;
    console.log(JSON.stringify({
      mode,
      emailsShape: emailsStats,
      broadcastsShape: broadcasts?.error ? { error: broadcasts.error } : {
        returned: Array.isArray(broadcasts?.data) ? broadcasts.data.length : null,
        keys: broadcasts?.data?.[0] ? Object.keys(broadcasts.data[0]) : null,
        firstRecord: broadcasts?.data?.[0] ? { name: broadcasts.data[0].name, status: broadcasts.data[0].status, sent_at: broadcasts.data[0].sent_at ?? null } : null,
      },
      segments: segments === null ? 'endpoint-unavailable' : segmentRecon,
      contactKeys: Array.isArray(contactShape?.data) && contactShape.data[0] ? Object.keys(contactShape.data[0]) : contactShape,
    }));
    return;
  }

  if (mode === 'rank') {
    const outDir = args['out-dir'] || 'resend-rank-out';
    fs.mkdirSync(outDir, { recursive: true });
    const maxEmailPages = Math.max(1, Number(args['max-email-pages']) || 1500);
    const keepCount = Math.max(1, Number(args['keep-count']) || 1000);

    const { contacts, ranked, emailStats, fromCounts, lastEventCounts, aggRecipients } = await buildRanking({ maxEmailPages, progressLabel: 'rank' });
    const top = ranked.slice(0, keepCount);

    // Artifacts carry masked emails only — this repo's artifacts are public.
    fs.writeFileSync(`${outDir}/contacts.json`, JSON.stringify(contacts.map(c => ({ ...c, email: maskEmail(c.email) }))));
    fs.writeFileSync(`${outDir}/ranked.json`, JSON.stringify(ranked.map(c => ({ ...c, email: maskEmail(c.email) }))));
    fs.writeFileSync(`${outDir}/top.json`, JSON.stringify(top.map(c => ({ ...c, email: maskEmail(c.email) }))));

    const contacted = ranked.filter(c => c.sent > 0).length;
    const openedAny = ranked.filter(c => c.opened > 0).length;
    const clickedAny = ranked.filter(c => c.clicked > 0).length;
    console.log(JSON.stringify({
      mode,
      audience: focusId,
      contactsTotal: contacts.length,
      unsubscribed: contacts.filter(c => c.unsubscribed).length,
      emails: emailStats,
      senders: fromCounts,
      lastEventCounts,
      recipients: { uniqueEmailed: aggRecipients, contacted, openedAny, clickedAny },
      keep: {
        count: keepCount,
        minOpenedInTop: top.length ? Math.min(...top.map(c => c.opened)) : 0,
        fullyEngagedInTop: top.filter(c => c.clicked > 0).length,
        preview: top.slice(0, 10).map(c => ({ email: maskEmail(c.email), sent: c.sent, opened: c.opened, clicked: c.clicked, created_at: c.created_at })),
      },
      outDir,
    }));
    return;
  }

  if (mode === 'segment') {
    const segmentId = String(args['segment-id'] || '').trim();
    if (!/^[0-9a-f-]{20,}$/i.test(segmentId)) throw new Error('segment requires --segment-id <uuid>');
    const outDir = args['out-dir'] || 'resend-rank-out';
    fs.mkdirSync(outDir, { recursive: true });
    const keepCount = Math.max(1, Number(args['keep-count']) || 1000);
    const strategy = args['strategy'] || 'engagement';

    let top;
    if (strategy === 'newest') {
      // No engagement signal exists for this audience (broadcasts paused before
      // the /emails API window). Newest contact per unique email wins.
      let contacts;
      if (args['contacts-file']) {
        contacts = JSON.parse(fs.readFileSync(args['contacts-file'], 'utf8'));
        console.error(`[segment] contacts from file: ${contacts.length}`);
      } else {
        if (!focusId) throw new Error('segment requires RESEND_AUDIENCE_ID (focus audience)');
        const stateFile = args['state-file'] || null;
        const jsonlFile = stateFile ? `${stateFile}.jsonl` : null;
        contacts = [];
        let after;
        let walkDone = false;
        if (stateFile && fs.existsSync(stateFile)) {
          const saved = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
          after = saved.after || undefined;
          walkDone = saved.done === true;
          if (jsonlFile && fs.existsSync(jsonlFile)) {
            const seen = new Set();
            for (const line of fs.readFileSync(jsonlFile, 'utf8').split('\n')) {
              if (!line.trim()) continue;
              for (const contact of JSON.parse(line)) {
                if (!seen.has(contact.id)) { seen.add(contact.id); contacts.push(contact); }
              }
            }
          }
          console.error(`[segment] resuming walk: ${contacts.length} loaded, after=${after || 'start'}`);
        }
        let pages = 0;
        if (!walkDone) for (;;) {
          const query = new URLSearchParams({ limit: '100' });
          if (after) query.set('after', after);
          const page = await api(`/audiences/${focusId}/contacts?${query}`);
          const items = Array.isArray(page?.data) ? page.data : [];
          if (!items.length) break;
          pages++;
          const rows = items.map(c => ({ id: c.id, email: String(c.email || '').toLowerCase(), created_at: c.created_at ?? null, unsubscribed: Boolean(c.unsubscribed) }));
          contacts.push(...rows);
          if (jsonlFile) fs.appendFileSync(jsonlFile, JSON.stringify(rows) + '\n');
          if (contacts.length % 10000 < 100) console.error(`[segment] contacts: ${contacts.length}...`);
          const hasMore = page?.has_more ?? page?.hasMore ?? items.length === 100;
          if (!hasMore) { after = undefined; break; }
          after = items[items.length - 1]?.id;
          if (!after) break;
          if (stateFile) fs.writeFileSync(stateFile, JSON.stringify({ after, count: contacts.length }));
          await new Promise(resolve => setTimeout(resolve, CONTACTS_PAGE_SLEEP_MS));
        }
        if (stateFile && !walkDone) fs.writeFileSync(stateFile, JSON.stringify({ after: null, count: contacts.length, done: true }));
        const unique = new Map(contacts.map(c => [c.id, c]));
        contacts = [...unique.values()];
        console.error(`[segment] contacts total: ${contacts.length}`);
      }
      const byEmail = new Map();
      for (const contact of contacts) {
        if (!contact.id || !contact.email) continue;
        const prev = byEmail.get(contact.email);
        if (!prev || String(contact.created_at || '') > String(prev.created_at || '')) byEmail.set(contact.email, contact);
      }
      const newest = [...byEmail.values()].sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')));
      top = newest.slice(0, keepCount);
      fs.writeFileSync(`${outDir}/contacts.json`, JSON.stringify(contacts.map(c => ({ ...c, email: maskEmail(c.email), inTop: top.some(t => t.id === c.id) }))));
    } else {
      const maxEmailPages = Math.max(1, Number(args['max-email-pages']) || 1500);
      const built = await buildRanking({ maxEmailPages, progressLabel: 'segment' });
      top = built.ranked.slice(0, keepCount);
      fs.writeFileSync(`${outDir}/contacts.json`, JSON.stringify(built.contacts.map(c => ({ ...c, email: maskEmail(c.email), inTop: top.some(t => t.id === c.id) }))));
    }

    // Already-members (paged from the segment) are skipped without re-adding.
    const members = [];
    let membershipUnavailable = false;
    try {
      for await (const { items } of paginate(`/segments/${segmentId}/contacts`, CONTACTS_PAGE_SLEEP_MS)) members.push(...items.map(c => c.id));
    } catch (error) {
      membershipUnavailable = true;
      console.error(`[segment] membership list unavailable: ${error.message}`);
    }
    const alreadyMembers = new Set(members);
    const toAdd = top.filter(c => !alreadyMembers.has(c.id));

    const results = [];
    const queue = [...toAdd];
    const workers = Array.from({ length: 5 }, async () => {
      for (;;) {
        const contact = queue.shift();
        if (!contact) return;
        try {
          await api(`/segments/${segmentId}/contacts`, { method: 'POST', body: JSON.stringify({ email: contact.email }) });
          results.push({ id: contact.id, email: maskEmail(contact.email), status: 'added' });
        } catch (error) {
          results.push({ id: contact.id, email: maskEmail(contact.email), status: 'error', error: String(error.message) });
        }
      }
    });
    await Promise.all(workers);

    fs.writeFileSync(`${outDir}/top.json`, JSON.stringify(top.map(c => ({ ...c, email: maskEmail(c.email) }))));
    fs.writeFileSync(`${outDir}/adds.json`, JSON.stringify(results));

    // Post-write verification.
    const verify = [];
    try {
      for await (const { items } of paginate(`/segments/${segmentId}/contacts`, CONTACTS_PAGE_SLEEP_MS)) verify.push(...items.map(c => c.id));
    } catch { /* membership list unavailable — reported above */ }
    const addedCount = results.filter(r => r.status === 'added').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    console.log(JSON.stringify({
      mode,
      audience: focusId,
      segmentId,
      membershipWasReadable: !membershipUnavailable,
      topCount: top.length,
      alreadyMembers: alreadyMembers.size,
      addAttempts: toAdd.length,
      added: addedCount,
      errors: errorCount,
      errorSample: results.filter(r => r.status === 'error').slice(0, 5),
      memberCountAfter: verify.length || null,
      keep: { preview: top.slice(0, 10).map(c => ({ email: maskEmail(c.email), sent: c.sent, opened: c.opened, clicked: c.clicked })) },
      outDir,
    }));
    return;
  }

  if (mode !== 'trim') throw new Error(`Unknown mode: ${mode}`);

  // Destructive: shrink the focus audience to the members of --segment-id.
  // --dry plans and exports without deleting; a real run additionally
  // requires the literal --confirm DELETE. Re-running after a partial trim
  // resumes naturally: deleted contacts simply disappear from the audience.
  const segmentId = String(args['segment-id'] || '').trim();
  if (!/^[0-9a-f-]{20,}$/i.test(segmentId)) throw new Error('trim requires --segment-id <uuid> of the keep-set segment');
  if (!focusId) throw new Error('trim requires RESEND_AUDIENCE_ID (audience to shrink)');
  const dry = args['dry'] === 'true';
  if (!dry && args['confirm'] !== 'DELETE') throw new Error('destructive trim requires --confirm DELETE (or --dry true to plan only)');
  const outDir = args['out-dir'] || 'resend-trim-out';
  fs.mkdirSync(outDir, { recursive: true });
  const rps = Math.min(30, Math.max(1, Number(args['rps']) || 8));
  const throttleMs = Math.ceil(1000 / rps);

  const keepIds = new Set();
  const keepRows = [];
  for await (const { items } of paginate(`/segments/${segmentId}/contacts`, CONTACTS_PAGE_SLEEP_MS)) {
    for (const member of items) {
      if (member?.id) { keepIds.add(member.id); keepRows.push({ id: member.id, email: maskEmail(member.email) }); }
    }
  }
  if (!keepIds.size) throw new Error(`keep segment ${segmentId} has no members — refusing to trim`);

  const deletions = [];
  for await (const contact of paginateContacts(focusId)) {
    if (!contact?.id || keepIds.has(contact.id)) continue;
    deletions.push({ id: contact.id, email: String(contact.email || '').toLowerCase(), created_at: contact.created_at ?? null, unsubscribed: Boolean(contact.unsubscribed) });
    if (deletions.length % 10000 === 0) console.error(`[trim] deletion plan: ${deletions.length}...`);
  }
  console.error(`[trim] plan: keep=${keepIds.size} delete=${deletions.length}`);

  // Suppression record BEFORE deleting anything (full emails, local file only).
  fs.writeFileSync(`${outDir}/keep.json`, JSON.stringify(keepRows));
  fs.writeFileSync(`${outDir}/deleted.json`, JSON.stringify(deletions));

  if (dry) {
    console.log(JSON.stringify({ mode, dry: true, audience: focusId, segmentId, keep: keepIds.size, deletePlanned: deletions.length, unsubscribedInDelete: deletions.filter(c => c.unsubscribed).length, outDir }));
    return;
  }

  const started = Date.now();
  let deleted = 0, alreadyGone = 0, errors = 0;
  const errorSample = [];
  for (const contact of deletions) {
    try {
      await api(`/audiences/${focusId}/contacts/${contact.id}`, { method: 'DELETE' });
      deleted++;
    } catch (error) {
      const message = String(error.message || '');
      if (message.includes(' 404 ')) { alreadyGone++; }
      else { errors++; if (errorSample.length < 5) errorSample.push({ id: contact.id, error: message.slice(0, 200) }); }
    }
    if ((deleted + alreadyGone + errors) % 1000 === 0) {
      const rate = (deleted + alreadyGone) / ((Date.now() - started) / 1000);
      console.error(`[trim] ${(deleted + alreadyGone + errors)}/${deletions.length} processed (${rate.toFixed(1)}/s, errors=${errors})...`);
    }
    await new Promise(resolve => setTimeout(resolve, throttleMs));
  }

  const remaining = [];
  for await (const contact of paginateContacts(focusId)) remaining.push(contact.id);
  fs.writeFileSync(`${outDir}/remaining-ids.json`, JSON.stringify(remaining));
  console.log(JSON.stringify({ mode, dry: false, audience: focusId, segmentId, keep: keepIds.size, deletePlanned: deletions.length, deleted, alreadyGone, errors, errorSample, remaining: remaining.length, durationSec: Math.round((Date.now() - started) / 1000), outDir }));
}

main().catch(error => { console.error(error.message || error); process.exitCode = 1; });
