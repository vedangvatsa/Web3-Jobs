import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
import { activeEventTombstones, isEventRetentionDue, isRootSlug, tombstoneExpiry } from './lib/event-retention.mjs';

const ASSET_BOOKKEEPING = new Set(['content/event-cover-optimization.json', 'content/static-image-optimization.json', 'content/responsive-images.json', 'content/social-image-info.json', 'content/social-preview-image-cache.json', 'content/image-redirects.json', 'content/legacy-image-paths.json', 'public/preview/.preview-manifest.json', 'content/events/INDEX.md', 'content/events/descriptions.md']);

function repositoryFiles(root) {
  try {
    const prefix = execFileSync('git', ['rev-parse', '--show-prefix'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    if (prefix) throw new Error('Source archive is nested inside another checkout');
    return execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] }).split('\0').filter(file => file && !file.startsWith('.cache/'));
  } catch (error) {
    if (fs.existsSync(path.join(root, '.git'))) throw error;
    // App Hosting source archives need not contain Git metadata.
    const walk = directory => fs.existsSync(path.join(root, directory)) ? fs.readdirSync(path.join(root, directory), { withFileTypes: true }).flatMap(entry => {
      const file = `${directory}/${entry.name}`;
      return entry.isDirectory() ? walk(file) : entry.isFile() ? [file] : [];
    }) : [];
    return ['content', 'src', 'public', 'scripts'].flatMap(walk);
  }
}

export function collectRetainedAssetReferences(root = process.cwd(), changes = new Map()) {
  const tracked = repositoryFiles(root);
  const references = new Set();
  for (const file of tracked) {
    if (!fs.existsSync(path.join(root, file)) || ASSET_BOOKKEEPING.has(file) || !/\.(?:json|md|tsx?|mjs|html|css)$/.test(file) || /(?:^|\/)(?:test[^/]*|[^/]*\.test)\./.test(file)) continue;
    const text = changes.has(file) ? changes.get(file) : fs.readFileSync(path.join(root, file), 'utf8');
    if (!text) continue;
    for (const match of text.matchAll(/\/(?:events|images|responsive|og)\/[^\s"'<>()[\]\\?#]+/g)) references.add(match[0]);
    for (const match of text.matchAll(/https?:\/\/[^\s"'<>\\]+/g)) references.add(match[0]);
  }
  for (const file of ['content/image-redirects.json', 'content/social-preview-image-cache.json']) {
    if (!fs.existsSync(path.join(root, file))) continue;
    const links = JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
    for (const [source, destination] of Object.entries(links)) if (references.has(source) && typeof destination === 'string') references.add(destination);
  }
  const variantsPath = path.join(root, 'content/responsive-images.json');
  if (fs.existsSync(variantsPath)) {
    const variants = JSON.parse(fs.readFileSync(variantsPath, 'utf8'));
    for (const [source, entry] of Object.entries(variants)) if ((entry.files || []).some(file => references.has(file))) references.add(source);
    for (const [source, entry] of Object.entries(variants)) if (references.has(source)) for (const file of entry.files || []) references.add(file);
  }
  return references;
}

export function retainEvents({ root = process.cwd(), now = Date.now(), dryRun = false, recoverHistory = false } = {}) {
  if (!Number.isFinite(now)) throw new Error('Invalid retention clock');
  const absolute = file => path.join(root, file);
  const read = (file, fallback) => fs.existsSync(absolute(file)) ? JSON.parse(fs.readFileSync(absolute(file), 'utf8')) : fallback;
  const tracked = repositoryFiles(root);
  const changes = new Map();
  const json = (file, value) => {
    const before = fs.existsSync(absolute(file)) ? fs.readFileSync(absolute(file), 'utf8') : '';
    if (before && JSON.stringify(JSON.parse(before)) === JSON.stringify(value)) return;
    const compact = before && !before.includes('\n  ');
    changes.set(file, `${JSON.stringify(value, null, compact ? undefined : 2)}\n`);
  };
  const remove = file => { if (fs.existsSync(absolute(file))) changes.set(file, null); };
  const sources = fs.readdirSync(absolute('content/events/sources')).filter(file => file.endsWith('.json')).map(file => `content/events/sources/${file}`);
  const feeds = new Map(sources.map(file => [file, read(file, [])]));
  const reviewedFacts = read('content/events/catalog-reviewed-facts.json', {});
  const history = read('content/event-slug-history.json', {});
  const previousTombstones = read('content/event-tombstones.json', {});
  const guideIdentities = read('content/events/editorial/guide-identities.json', {});
  const tombstones = activeEventTombstones(previousTombstones, now);
  const groups = new Map();
  for (const events of feeds.values()) for (const event of events) {
    if (!event.id) throw new Error('Source event has no identity');
    if (!groups.has(event.id)) groups.set(event.id, []);
    groups.get(event.id).push({ ...event, ...reviewedFacts[event.id] });
  }
  const retainedDates = read('content/events/retention-dates.json', []);
  for (const event of retainedDates) if (!groups.has(event.id)) groups.set(event.id, [event]);
  let recoveredHistoricalRecords = 0;
  if (recoverHistory) {
    const guides = read('content/events/editorial/generated-event-guides.json', {});
    const missing = new Set([...Object.keys(guides), ...Object.keys(history), ...Object.keys(previousTombstones)].filter(id => !groups.has(id)));
    const guideSource = fs.existsSync(absolute('src/lib/event-guides.ts')) ? fs.readFileSync(absolute('src/lib/event-guides.ts'), 'utf8') : '';
    const currentSlugs = new Set([...groups.values()].flat().map(event => event.slug));
    const missingSlugs = new Set([...guideSource.matchAll(/^  ["']?([a-z0-9_-]+)["']?: \{/gm)].map(match => match[1]).filter(slug => !currentSlugs.has(slug) && !guideIdentities[slug]));
    const legacySources = sources.map(file => file.replace('content/events/sources/', 'content/'));
    const git = args => execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });
    const revisions = git(['log', '--format=%H', '--', ...sources, ...legacySources]).trim().split('\n');
    for (const revision of revisions) {
      if (!missing.size && !missingSlugs.size) break;
      const found = new Map();
      for (const file of [...sources, ...legacySources]) {
        let events;
        try { events = JSON.parse(git(['show', `${revision}:${file}`])); } catch { continue; }
        if (!Array.isArray(events)) continue;
        for (const event of events) if (missing.has(event.id) || (!groups.has(event.id) && missingSlugs.has(event.slug))) {
          if (!found.has(event.id)) found.set(event.id, []);
          found.get(event.id).push(event);
        }
      }
      for (const [id, events] of found) {
        groups.set(id, events);
        missing.delete(id);
        for (const event of events) missingSlugs.delete(event.slug);
        recoveredHistoricalRecords++;
      }
    }
    console.log(`Historical source audit: recovered dates for ${recoveredHistoricalRecords} absent identities; unresolved IDs: ${[...missing].join(', ') || 'none'}; unresolved guide slugs: ${[...missingSlugs].join(', ') || 'none'}.`);
  }
  const removedIds = new Set([...groups].filter(([, events]) => events.every(event => isEventRetentionDue(event, now))).map(([id]) => id));
  // Merged identities share the surviving event's lifetime, not an obsolete duplicate's date.
  for (const [id, record] of Object.entries(history)) {
    if (record.canonicalId && groups.has(id) && !removedIds.has(id)) removedIds.delete(record.canonicalId);
  }
  for (const [id, record] of Object.entries(history)) {
    if (!record.canonicalId) continue;
    if (removedIds.has(record.canonicalId)) removedIds.add(id);
    else removedIds.delete(id);
  }
  const kept = [...groups].filter(([id]) => !removedIds.has(id)).flatMap(([, events]) => events);
  const removed = [...groups].filter(([id]) => removedIds.has(id)).flatMap(([, events]) => events);
  const identitySlugs = id => [id.toLowerCase(), id.toLowerCase().replace(/^(premier|side)-/, '')];
  const protectedSlugs = new Set(kept.flatMap(event => [history[event.id]?.slug, ...(history[event.id]?.aliases || []), event.slug, ...(event.aliases || []), ...identitySlugs(event.id)]).filter(isRootSlug).map(value => value.toLowerCase()));
  const slugTypes = read('content/slug-types.json', {});
  for (const [type, slugs] of Object.entries(slugTypes)) if (type !== 'events' && Array.isArray(slugs)) for (const slug of slugs) protectedSlugs.add(slug);
  for (const city of read('content/nomads/cities.json', [])) protectedSlugs.add(city.slug);
  for (const url of Object.values(read('content/nomads/tool-paths.json', {}))) protectedSlugs.add(url.replace(/^\//, ''));
  if (fs.existsSync(absolute('src/app'))) for (const entry of fs.readdirSync(absolute('src/app'), { withFileTypes: true })) {
    if (entry.isDirectory() && isRootSlug(entry.name)) protectedSlugs.add(entry.name);
  }
  for (const [id, entry] of Object.entries(tombstones)) entry.slugs = [...new Set([...entry.slugs, ...identitySlugs(id)])].filter(slug => !protectedSlugs.has(slug));
  const removedSlugs = new Set(Object.values(previousTombstones).flatMap(entry => entry.slugs).filter(slug => !protectedSlugs.has(slug)));
  for (const id of removedIds) {
    const events = groups.get(id) || [];
    const record = history[id];
    const slugs = [...new Set([record?.slug, ...(record?.aliases || []), ...identitySlugs(id), ...events.flatMap(event => [event.slug, ...(event.aliases || [])])]
      .filter(isRootSlug).map(value => value.toLowerCase()).filter(slug => !protectedSlugs.has(slug)))];
    for (const slug of slugs) removedSlugs.add(slug);
    // Only published URLs need a tombstone. Rejected raw listings have no public URL to preserve.
    const published = slugs.filter(slug => record || events.some(event => event.slug) || fs.existsSync(absolute(`public/preview/${slug}.html`)));
    if (!previousTombstones[id] && published.length) tombstones[id] = { until: tombstoneExpiry(now), slugs: published };
    delete history[id];
  }
  const redirects = read('content/events/redirects.json', {});
  let expanded;
  do {
    expanded = false;
    for (const [alias, destination] of Object.entries(redirects)) {
      if (!removedSlugs.has(destination) || removedSlugs.has(alias) || protectedSlugs.has(alias)) continue;
      removedSlugs.add(alias);
      const owner = Object.values(tombstones).find(entry => entry.slugs.includes(destination));
      if (owner) owner.slugs.push(alias);
      expanded = true;
    }
  } while (expanded);
  json('content/events/redirects.json', Object.fromEntries(Object.entries(redirects).filter(([alias, destination]) => !removedSlugs.has(alias) && !removedSlugs.has(destination))));
  const urls = events => events.flatMap(event => [event.url, event.registrationUrl, event.website, event.sourceVerification?.url, event.descriptionSource?.url]).filter(value => typeof value === 'string');
  const keptUrls = new Set(urls(kept));
  const removedUrls = new Set(urls(removed).filter(url => !keptUrls.has(url)));
  const keptSourceIds = new Set(kept.map(event => event.sourceVerification?.eventId).filter(Boolean));
  const ids = new Set([...removedIds, ...Object.keys(previousTombstones), ...removed.map(event => event.sourceVerification?.eventId).filter(id => id && !keptSourceIds.has(id))]);
  const removedGuideSlugs = new Set([
    ...Object.entries(guideIdentities).filter(([, id]) => ids.has(id)).map(([slug]) => slug),
    ...removed.flatMap(event => [event.slug, ...(event.aliases || [])]).filter(isRootSlug),
  ]);
  const matches = value => typeof value === 'string' && (ids.has(value) || removedSlugs.has(value) || removedUrls.has(value));
  function scrub(value) {
    if (Array.isArray(value)) return value.map(scrub).filter(item => item !== undefined);
    if (!value || typeof value !== 'object') return value;
    if (['id', 'eventId', 'sourceEventId', 'slug', 'url', 'sourceUrl'].some(key => matches(value[key]))
      || (value.event && ids.has(value.event.id))
      || (Array.isArray(value.ids) && value.ids.length && value.ids.every(id => ids.has(id)))
      || (value.startDate && isEventRetentionDue(value, now))
      || (value.facts?.startDate && isEventRetentionDue(value.facts, now))) return undefined;
    return Object.fromEntries(Object.entries(value).filter(([key]) => !matches(key)).map(([key, item]) => [key, scrub(item)]).filter(([, item]) => item !== undefined));
  }
  for (const [file, events] of feeds) json(file, events.filter(event => !removedIds.has(event.id)));
  for (const file of tracked.filter(file => file.startsWith('content/events/') && file.endsWith('.json') && !sources.includes(file) && !['content/events/redirects.json', 'content/events/editorial/guide-identities.json'].includes(file))) {
    json(file, scrub(read(file, {})) ?? {});
  }
  for (const file of ['scripts/event-emails-full.json', 'scripts/event-emails.json', 'content/event-image-overrides.json']) {
    if (fs.existsSync(absolute(file))) json(file, scrub(read(file, {})) ?? {});
  }
  const retiredNames = removed.map(event => event.name).filter(name => typeof name === 'string' && name.length >= 12);
  const retiredReferences = [...ids, ...removedUrls].filter(value => value.length >= 6);
  const mentionsRetiredEvent = text => retiredNames.some(name => text.includes(name)) || retiredReferences.some(value => text.includes(value))
    || [...text.matchAll(/\/([a-z0-9][a-z0-9_-]*)(?=[\s`|)"?#]|$)/gi)].some(match => removedSlugs.has(match[1].toLowerCase()));
  for (const file of tracked.filter(file => /^content\/events\/[^/]*AUDIT\.md$/.test(file))) {
    const before = fs.readFileSync(absolute(file), 'utf8');
    const after = before.split('\n\n').map(block => {
      if (!mentionsRetiredEvent(block)) return block;
      if (block.startsWith('|') || block.startsWith('- ')) return block.split('\n').filter(line => !mentionsRetiredEvent(line)).join('\n');
      return '';
    }).filter(Boolean).join('\n\n');
    if (after.trimEnd() !== before.trimEnd()) changes.set(file, `${after.trimEnd()}\n`);
  }
  for (const file of ['content/events-runtime.json', 'public/data/events-runtime.json']) {
    if (fs.existsSync(absolute(file))) json(file, read(file, []).filter(event => !removedIds.has(event.id)));
  }
  json('content/event-slug-history.json', history);
  json('content/event-tombstones.json', tombstones);
  json('content/events/editorial/guide-identities.json', Object.fromEntries(Object.entries(guideIdentities).filter(([slug]) => !removedGuideSlugs.has(slug))));
  const sourceIds = new Set([...feeds.values()].flat().map(event => event.id));
  const fallbackDates = kept.filter(event => !sourceIds.has(event.id));
  json('content/events/retention-dates.json', [...new Map(fallbackDates.map(event => [event.id, Object.fromEntries(['id', 'slug', 'aliases', 'startDate', 'endDate', 'timezone', 'eventStatus'].filter(key => event[key] !== undefined).map(key => [key, event[key]]))])).values()]);

  const guidePath = 'src/lib/event-guides.ts';
  if (fs.existsSync(absolute(guidePath))) {
    const before = fs.readFileSync(absolute(guidePath), 'utf8');
    const ast = ts.createSourceFile(guidePath, before, ts.ScriptTarget.Latest, true);
    const cuts = [];
    function visit(node) {
      if (ts.isVariableDeclaration(node) && node.name.getText(ast) === 'EVENT_GUIDES' && node.initializer && ts.isObjectLiteralExpression(node.initializer)) {
        for (const property of node.initializer.properties) {
          const slug = property.name?.getText(ast).replace(/^['"]|['"]$/g, '');
          if (slug && (removedSlugs.has(slug) || removedGuideSlugs.has(slug))) {
            const comma = before[property.end] === ',' ? 1 : 0;
            cuts.push([property.pos, property.end + comma]);
          }
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(ast);
    let after = before;
    for (const [start, end] of cuts.reverse()) after = after.slice(0, start) + after.slice(end);
    if (after !== before) changes.set(guidePath, after);
  }
  const manifest = read('public/preview/.preview-manifest.json', {});
  const assetCandidates = new Set();
  const imageCache = read('content/social-preview-image-cache.json', {});
  const candidate = value => {
    if (typeof value !== 'string') return;
    const local = imageCache[value] || value;
    try {
      const url = new URL(local, 'https://hashtagweb3.com');
      if (url.hostname === 'hashtagweb3.com' && /^\/(?:events|images|og\/external)\//.test(url.pathname) && !url.pathname.includes('..')) assetCandidates.add(url.pathname);
    } catch { /* Invalid image references cannot identify a local deletion target. */ }
  };
  for (const event of removed) candidate(event.coverImage);
  for (const file of tracked.filter(file => file.startsWith('public/preview/') && file.endsWith('.html'))) {
    if (!fs.existsSync(absolute(file))) continue;
    const slug = file.slice('public/preview/'.length, -5);
    const html = fs.readFileSync(absolute(file), 'utf8');
    const canonical = html.match(/<link rel="canonical" href="https:\/\/hashtagweb3\.com\/([^"/]+)"/)?.[1];
    if (removedSlugs.has(slug) || (canonical && removedSlugs.has(canonical))) {
      candidate(html.match(/<meta property="og:image" content="([^"]+)"/)?.[1]);
      remove(file);
      delete manifest[`/${slug}`];
    }
  }
  json('public/preview/.preview-manifest.json', manifest);

  // Derived description views are regenerated in a fresh process, after source deletion.
  // For reference scanning, exclude those views and image bookkeeping that cannot own an asset.
  const references = collectRetainedAssetReferences(root, changes);
  const variants = read('content/responsive-images.json', {});
  const deletedAssets = new Set();
  for (const url of assetCandidates) {
    if (!references.has(url)) { remove(`public${url}`); deletedAssets.add(url); }
  }
  for (const file of tracked.filter(file => file.startsWith('public/events/') && /\.(?:webp|png|jpe?g|gif|avif|svg)$/i.test(file))) {
    const url = file.slice(6);
    if (!references.has(url)) { remove(file); deletedAssets.add(url); }
  }
  for (const [source, entry] of Object.entries(variants)) {
    if (!deletedAssets.has(source)) continue;
    delete variants[source];
    for (const url of entry.files || []) {
      if (!references.has(url) && /^\/(?:images|responsive)\//.test(url) && !url.includes('..')) { remove(`public${url}`); deletedAssets.add(url); }
    }
  }
  if (fs.existsSync(absolute('content/responsive-images.json'))) json('content/responsive-images.json', variants);
  for (const file of ['content/social-image-info.json', 'content/social-preview-image-cache.json', 'content/image-redirects.json', 'content/legacy-image-paths.json']) {
    if (!fs.existsSync(absolute(file))) continue;
    const data = read(file, {});
    const deleted = value => typeof value === 'string' && [...deletedAssets].some(url => value === url || value === `https://hashtagweb3.com${url}`);
    json(file, Array.isArray(data) ? data.filter(value => !deleted(value)) : Object.fromEntries(Object.entries(data).filter(([key, value]) => !deleted(key) && !deleted(value))));
  }
  for (const file of ['content/event-cover-optimization.json', 'content/static-image-optimization.json']) {
    if (!fs.existsSync(absolute(file))) continue;
    const data = read(file, {});
    if (data.files) for (const key of Object.keys(data.files)) if (deletedAssets.has(key) || deletedAssets.has(key.replace(/^public/, ''))) delete data.files[key];
    json(file, data);
  }
  let bytesRemoved = 0, deletedFiles = 0;
  for (const [file, after] of changes) {
    const beforeSize = fs.existsSync(absolute(file)) ? fs.statSync(absolute(file)).size : 0;
    bytesRemoved += beforeSize - (after === null ? 0 : Buffer.byteLength(after));
    if (after === null) deletedFiles++;
    if (!dryRun) {
      if (after === null) fs.unlinkSync(absolute(file));
      else fs.writeFileSync(absolute(file), after);
    }
  }
  return { dryRun, recoveredHistoricalRecords, removedIdentities: removedIds.size, removedSourceRecords: [...feeds.values()].flat().filter(event => removedIds.has(event.id)).length, tombstones: Object.keys(tombstones).length, tombstoneUrls: new Set(Object.values(tombstones).flatMap(entry => entry.slugs)).size, expiredTombstones: Object.keys(previousTombstones).length - Object.keys(activeEventTombstones(previousTombstones, now)).length, changedFiles: changes.size, deletedFiles, bytesRemoved };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  console.log(JSON.stringify(retainEvents({ dryRun: process.argv.includes('--dry-run'), recoverHistory: process.argv.includes('--recover-history') }), null, 2));
}
