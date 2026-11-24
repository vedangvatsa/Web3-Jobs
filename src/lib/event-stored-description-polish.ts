/**
 * Persists render-time cleanup and conservative copy edits on stored event descriptions.
 */
import { stripThirdPartyCommunityPromo } from './community-link-sanitizer';
import { cleanupEventDescriptionFormat } from './event-description-cleanup';
import { polishEventDescriptionLinks } from './event-description-links';
import { cleanPublishText } from './noslop';
import { catalogIntegrityOk, catalogLineEdit } from './catalog-line-editorial';

export function persistEventDescriptionPipeline(text: string): string {
  if (!text?.trim()) return '';
  return cleanupEventDescriptionFormat(stripThirdPartyCommunityPromo(text.trim()));
}

function dedupeMarkdownParagraphs(text: string): string {
  const blocks = text.split(/\n{2,}/);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(trimmed);
  }
  return out.join('\n\n');
}

function copyeditEventBlocks(text: string): string {
  const blocks = text.split(/\n{2,}/);
  const edited = blocks
    .map((block) => {
      const lines = block.split('\n');
      const isStructural = lines.some((line) => /^#{1,6}\s/.test(line.trim()) || /^[•·▪*-]\s/.test(line.trim()));
      if (isStructural) {
        return lines
          .map((line) => {
            if (/^#{1,6}\s/.test(line.trim())) {
              const m = line.match(/^(\s*#{1,6}\s+)(.*)$/);
              if (!m) return line;
              const body = catalogLineEdit(m[2]);
              return body ? `${m[1]}${body}` : '';
            }
            if (/^[•·▪*-]\s/.test(line.trim())) {
              const m = line.match(/^(\s*[•·▪*-]\s+)(.*)$/);
              if (!m) return catalogLineEdit(line);
              const body = catalogLineEdit(m[2]);
              return body ? `${m[1]}${body}` : '';
            }
            return catalogLineEdit(line);
          })
          .filter(Boolean)
          .join('\n');
      }
      const joined = catalogLineEdit(lines.join(' '));
      return joined;
    })
    .filter(Boolean);
  return edited.join('\n\n');
}

export type PolishEventDescriptionOptions = {
  /** Only persist scrape cleanup; skip dedupe / line edits (grammar-audited records). */
  conservative?: boolean;
};

export function polishStoredEventDescription(
  text: string,
  options?: PolishEventDescriptionOptions,
): string {
  const before = text?.trim() || '';
  if (!before) return '';

  let out = persistEventDescriptionPipeline(before);
  if (options?.conservative) {
    if (!catalogIntegrityOk(before, out)) return before;
    return out;
  }

  out = copyeditEventBlocks(out);
  out = dedupeMarkdownParagraphs(out);
  out = polishEventDescriptionLinks(cleanPublishText(out));

  if (!catalogIntegrityOk(before, out)) return before;
  return out.trim();
}