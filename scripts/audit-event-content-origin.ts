import fs from 'node:fs';
import { resolveEventGuide } from '../src/lib/event-guide-store';
import { getEventSlug, type Web3Event } from '../src/lib/events';
import { getVerifiedEventDescription } from '../src/lib/event-description-source';
import { buildEditorialFromOrganizerDescription } from '../src/lib/luma-event-content';

async function main() {
  const events = JSON.parse(fs.readFileSync('content/events-runtime.json', 'utf8')) as Web3Event[];
  const rows = [];
  let sourced = 0;
  for (const event of events) {
    const guide = await resolveEventGuide(event);
    const hasSource = Boolean(getVerifiedEventDescription(event));
    if (hasSource) sourced++;
    if (hasSource && JSON.stringify(guide.sections) !== JSON.stringify(buildEditorialFromOrganizerDescription(event).sections)) throw new Error(`${event.id} replaced source copy with editorial text`);
    if (!hasSource && guide.sections.length) throw new Error(`${event.id} rendered unsupported description sections`);
    rows.push({ id: event.id, slug: getEventSlug(event), name: event.name, status: hasSource ? 'source-backed' : 'unavailable', source: guide.descriptionSource, sections: guide.sections.map((section) => section.heading) });
  }
  const report = { total: events.length, sourceBacked: sourced, unavailable: events.length - sourced, generated: 0, templates: 0, events: rows };
  fs.writeFileSync('content/events/content-origin-report.json', `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({ ...report, events: undefined }));
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
