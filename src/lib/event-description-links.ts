function stripTrailingUrlPunctuation(url: string): string {
  return url.replace(/[.,;!?]+$/, '');
}

const SPEAKER_HERE_INLINE =
  /(?:The\s+)?(?:full\s+)?list of speakers is here:\s*(https?:\/\/[^\s<>"']+)/gi;

const SPEAKER_COLON_LINE =
  /^(.{0,140}?\b(?:speakers?|speaker\s+(?:list|roster|directory|page))\b.{0,100}?)\s*:\s*(https?:\/\/[^\s<>"']+)\.?\s*$/i;

function speakerDirectoryMarkdown(url: string): string {
  const href = stripTrailingUrlPunctuation(url);
  return `See the [official speaker directory](${href}) for the full roster.`;
}

const SOCIAL_LINK_LABEL =
  /^(?:LinkedIn|Website|X|Twitter|Facebook|Instagram|YouTube|Telegram|Discord)\s*\(\s*https?:\/\/[^\s)]+\s*\)$/i;

/** Luma exports "LinkedIn (url) | Website (url)" rows as plain text. */
function polishPipeSeparatedSocialLinks(line: string): string {
  const trimmed = line.trim();
  if (!trimmed.includes('|') || !/\(\s*https?:\/\//.test(trimmed)) return line;
  const parts = trimmed.split(/\s*\|\s*/);
  if (parts.length < 2 || !parts.every((part) => SOCIAL_LINK_LABEL.test(part.trim()))) return line;
  const links = parts.map((part) => {
    const match = /^(.+?)\s*\(\s*(https?:\/\/[^\s)]+)\s*\)\s*$/i.exec(part.trim());
    if (!match) return null;
    return `[${match[1].trim()}](${match[2]})`;
  });
  if (links.some((link) => !link)) return line;
  return links.join(' · ');
}

/** Normalize pasted speaker-directory lines so detail pages never show raw roster URLs. */
export function polishEventDescriptionLinks(text: string): string {
  return text
    .split('\n')
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed || /\[[^\]]+\]\(https?:\/\//.test(trimmed)) return line;

      const pipeLinks = polishPipeSeparatedSocialLinks(line);
      if (pipeLinks !== line) return pipeLinks;

      if (/(?:The\s+)?(?:full\s+)?list of speakers is here:\s*https?:\/\//i.test(trimmed)) {
        SPEAKER_HERE_INLINE.lastIndex = 0;
        return trimmed.replace(SPEAKER_HERE_INLINE, (_match, url: string) =>
          speakerDirectoryMarkdown(url),
        );
      }

      const colonMatch = SPEAKER_COLON_LINE.exec(trimmed);
      if (colonMatch) {
        const prefix = colonMatch[1].trim();
        if (/ is here$/i.test(prefix) || /full list/i.test(prefix) || /speakers page/i.test(prefix)) {
          return speakerDirectoryMarkdown(colonMatch[2]);
        }
      }

      return line;
    })
    .join('\n');
}
