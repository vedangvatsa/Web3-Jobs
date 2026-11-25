import { buildEventsListing } from '../src/lib/events-listing-build';
import { publishedOrganizerDescriptionText } from '../src/lib/luma-event-content';
import { buildEditorialFromOrganizerDescription } from '../src/lib/luma-event-content';
import { textJunkRunIssues } from './lib/description-format-checks';

const BROKEN_PATTERNS: Array<{ id: string; re: RegExp; why: string }> = [
  { id: 'empty-parens', re: /\(\s*\)/, why: 'empty parentheses left after strip' },
  { id: 'double-comma', re: /,\s*,/, why: 'double comma' },
  { id: 'comma-and-gap', re: /,\s+and\s*,/i, why: 'comma before empty and' },
  { id: 'label-colon-only', re: /^(?:Co-hosts|Partners|Media partners|Hosted by):\s*$/im, why: 'sponsor label with no names' },
  { id: 'hosted-by-empty', re: /\bHosted by\s*[,.]/i, why: 'hosted by with no names' },
  { id: 'orphan-colon-line', re: /^\s*:\s*$/m, why: 'line that is only a colon' },
  { id: 'bare-www', re: /(?:^|[\s(])www\.[a-z0-9]/i, why: 'residual www host fragment' },
  { id: 'learn-more-url', re: /\b(?:Learn more|Read more|Click here):\s*$/im, why: 'CTA with URL removed' },
];

async function main() {
  const events = await buildEventsListing();
  const findings: Array<{ slug: string; id: string; why: string; sample: string }> = [];
  let thinAfterStrip = 0;

  for (const event of events) {
    const slug = event.slug || event.id;
    const text = publishedOrganizerDescriptionText(event);
    if (!text.trim()) continue;

  const words = text.trim().split(/\s+/).length;
    if (words < 8) thinAfterStrip++;

    for (const rule of BROKEN_PATTERNS) {
      if (!rule.re.test(text)) continue;
      rule.re.lastIndex = 0;
      const line = text.split('\n').find((l) => rule.re.test(l)) || text.slice(0, 120);
      findings.push({ slug, id: rule.id, why: rule.why, sample: line.trim().slice(0, 160) });
    }

    for (const issue of textJunkRunIssues(text)) {
      if (issue.kind === 'chopped-sentence' || issue.kind === 'stat-line') {
        findings.push({
          slug,
          id: issue.kind,
          why: 'hard junk signature',
          sample: issue.sample.slice(0, 160),
        });
      }
    }

    const editorial = buildEditorialFromOrganizerDescription(event);
    for (const section of editorial.sections) {
      if (!section.heading.trim()) {
        findings.push({ slug, id: 'empty-heading', why: 'section with empty heading', sample: section.content[0]?.slice(0, 80) || '' });
      }
      const body = section.content.join('\n');
      if (/^[,:;.\s]+$/.test(body)) {
        findings.push({ slug, id: 'empty-section', why: 'section body only punctuation', sample: section.heading });
      }
    }
  }

  const byKind: Record<string, number> = {};
  for (const f of findings) byKind[f.id] = (byKind[f.id] || 0) + 1;

  const samples = findings.slice(0, 15);

  console.log(
    JSON.stringify(
      {
        events: events.length,
        withDescription: events.filter((e) => publishedOrganizerDescriptionText(e).trim()).length,
        veryThinUnder8Words: thinAfterStrip,
        brokenPatternHits: findings.length,
        byKind,
        samples,
      },
      null,
      2,
    ),
  );

  if (findings.length) process.exitCode = 1;
}

void main();