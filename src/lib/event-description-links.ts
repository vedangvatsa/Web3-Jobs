import { stripUrlsFromOrganizerCopy } from './event-url-plaintext';

const SPEAKER_HERE_INLINE =
  /(?:The\s+)?(?:full\s+)?list of speakers is here:\s*https?:\/\/[^\s<>"']+/gi;

const SPEAKER_COLON_LINE =
  /^(.{0,140}?\b(?:speakers?|speaker\s+(?:list|roster|directory|page))\b.{0,100}?)\s*:\s*https?:\/\/[^\s<>"']+\.?\s*$/i;

const SOCIAL_LINK_LABEL =
  /^(?:LinkedIn|Website|X|Twitter|Facebook|Instagram|YouTube|Telegram|Discord)\s*\(\s*https?:\/\/[^\s)]+\s*\)$/i;

const SPONSOR_ROW = /^(Co-hosts|Partners|Media partners):\s*(.+)$/i;

function labelFromParenLink(part: string): string | null {
  const match = /^(.+?)\s*\(\s*https?:\/\/[^\s)]+\s*\)\s*$/i.exec(part.trim());
  return match ? match[1].trim() : null;
}

function polishSponsorLabelRow(line: string): string {
  const trimmed = line.trim();
  const row = SPONSOR_ROW.exec(trimmed);
  if (!row) return line;
  const body = row[2].replace(/\s*·\s*/g, ', ').replace(/\s*-\s*/g, ', ');
  return `${row[1]}: ${stripUrlsFromOrganizerCopy(body)}`;
}

/** `LinkedIn (url) | Website (url)` → `LinkedIn · Website` (no URLs). */
function polishPipeSeparatedSocialLabels(line: string): string {
  const trimmed = line.trim();
  if (!trimmed.includes('|') || !/\(\s*https?:\/\//.test(trimmed)) return line;
  const parts = trimmed.split(/\s*\|\s*/);
  if (parts.length < 2 || !parts.every((part) => SOCIAL_LINK_LABEL.test(part.trim()))) return line;
  const labels = parts.map((part) => labelFromParenLink(part));
  if (labels.some((label) => !label)) return line;
  return labels.join(' · ');
}

/** Normalize pasted speaker-directory lines without embedding URLs. */
export function polishEventDescriptionLinks(text: string): string {
  const linePolished = text
    .split('\n')
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return line;

      const sponsorRow = polishSponsorLabelRow(line);
      if (sponsorRow !== line) return sponsorRow;

      const pipeLabels = polishPipeSeparatedSocialLabels(line);
      if (pipeLabels !== line) return pipeLabels;

      if (/(?:The\s+)?(?:full\s+)?list of speakers is here:\s*https?:\/\//i.test(trimmed)) {
        SPEAKER_HERE_INLINE.lastIndex = 0;
        return trimmed.replace(
          SPEAKER_HERE_INLINE,
          'See the official speaker directory for the full roster.',
        );
      }

      const colonMatch = SPEAKER_COLON_LINE.exec(trimmed);
      if (colonMatch) {
        const prefix = colonMatch[1].trim();
        if (/ is here$/i.test(prefix) || /full list/i.test(prefix) || /speakers page/i.test(prefix)) {
          return 'See the official speaker directory for the full roster.';
        }
      }

      return line;
    })
    .join('\n');

  return stripUrlsFromOrganizerCopy(linePolished);
}