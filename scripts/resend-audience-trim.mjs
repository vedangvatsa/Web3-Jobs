/**
 * Resend audience audit + trim.
 *
 * audit (read-only): lists audiences and segments, counts contacts per audience
 *   (total, unsubscribed), reports oldest/newest created_at so a keep-set can be
 *   chosen before any destructive change.
 *
 * trim (destructive): shrinks an audience to `--keep-count` contacts by deleting
 *   the rest. Which contacts survive depends on --keep-strategy:
 *     newest        keep the most recently created contacts
 *     segment-first keep segment members first, then newest
 *   Exports the full unsubscribed list + keep-set summary JSON before deleting
 *   (suppression record), then deletes sequentially with resume support
 *   (.resend-trim-state.json, relative to cwd) so a re-run continues safely.
 *
 * Env: RESEND_API_KEY (required), RESEND_AUDIENCE_ID (optional focus).
 * Usage:
 *   node scripts/resend-audience-trim.mjs --mode audit
 *   node scripts/resend-audience-trim.mjs --mode trim --keep-count 1000 \
 *     --keep-strategy newest --confirm DELETE
 */

const BASE = 'https://api.resend.com';

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
  const response = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${key}`, 'content-type': 'application/json', ...(init.headers || {}) },
  });
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

async function main() {
  const audiences = await listAudiences();
  console.log(JSON.stringify({ mode, audiencesKnown: audiences.length, focusId: focusId || null }));

  if (mode === 'audit') {
    const segments = await listSegments();
    const results = [];
    for (const audience of audiences.sort((a, b) => (a.id === focusId ? -1 : b.id === focusId ? 1 : 0))) {
      const stats = await auditAudience(audience);
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

  if (mode !== 'trim') throw new Error(`Unknown mode: ${mode}`);
  throw new Error('trim mode not wired yet — audit first, then enable with confirmed keep criteria');
}

main().catch(error => { console.error(error.message || error); process.exitCode = 1; });
