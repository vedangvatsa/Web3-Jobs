import type { GrantProgram } from '@/types';
import { countStoredGrantWords } from '@/lib/grant-editorial';
import { catalogLineEdit } from '@/lib/catalog-line-editorial';

export type GrantSection = NonNullable<GrantProgram['sections']>[number];

function editLine(text: string): string {
  return catalogLineEdit(text);
}

function tidyHeading(heading: string): string {
  let h = editLine(heading);
  h = h.replace(/^Introducing\s+/i, '');
  h = h.replace(/^Learn moreLearn more$/i, 'Related resources');
  h = h.replace(/^Get .+ stories in your inbox$/i, 'Updates');
  if (h.length > 120) h = h.slice(0, 117).replace(/\s+\S*$/, '') + '…';
  return h || 'Details';
}

function dedupeInSection(lines: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of lines) {
    const line = editLine(raw);
    if (!line) continue;
    const key = line.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(line);
  }
  return out;
}

/** Conservative line edit: preserve length, improve wording and headings only. */
export function copyeditGrantProgram(grant: GrantProgram): GrantProgram {
  let description = editLine(grant.description || '');
  if (description && /^[a-z]/.test(description)) {
    description = description.charAt(0).toUpperCase() + description.slice(1);
  }

  const sections = (grant.sections || [])
    .map((section) => {
      const paragraphs = dedupeInSection(section.paragraphs || []);
      const bullets = dedupeInSection(section.bullets || []);
      if (!paragraphs.length && !bullets.length) return null;
      return {
        ...section,
        heading: tidyHeading(section.heading),
        paragraphs,
        bullets: bullets.length ? bullets : section.bullets?.length ? [] : undefined,
      };
    })
    .filter((s): s is GrantSection => Boolean(s));

  const next = { ...grant, description, sections: sections.length ? sections : grant.sections };
  const before = countStoredGrantWords(grant);
  const after = countStoredGrantWords(next);
  if (after < before - 5 || after < 120) {
    return grant;
  }
  return next;
}