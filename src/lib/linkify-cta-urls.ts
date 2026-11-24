/** ATS scrapes often leave "Learn more: https://..." as plain text instead of anchors. */

const PLAIN_CTA =
  /\b(Learn more|Read more|See more|View more|Click here):\s*(https?:\/\/[^\s<"')]+)/gi;

/** Markdown: fold into [label](url) before inline rendering. */
export function linkifyPlainCtaUrlsInMarkdown(text: string): string {
  if (!text || !PLAIN_CTA.test(text)) return text;
  PLAIN_CTA.lastIndex = 0;
  return text.replace(PLAIN_CTA, (_m, label: string, url: string) => `[${label}](${url})`);
}

const CTA_LABEL = '(?:Learn more|Read more|See more|View more|Click here)';

/** HTML: wrap CTA label only; hide the bare URL. Skips text already inside tag attributes. */
export function linkifyPlainCtaUrlsInHtml(html: string): string {
  if (!html || !/Learn more:\s*https?:\/\//i.test(html)) return html;
  return html.replace(
    new RegExp(`(^|[^"'>=])(\\b${CTA_LABEL}):\\s*(https?:\\/\\/[^\\s<"']+)`, 'gi'),
    (_m, lead: string, label: string, url: string) =>
      `${lead}<a href="${url}" target="_blank" rel="noopener noreferrer nofollow">${label}</a>`,
  );
}

/** Same CTA pattern for HTML-escaped job body text (after escapeHtml, before emit). */
export function linkifyPlainCtaUrlsInEscapedText(escaped: string): string {
  if (!escaped || !new RegExp(`${CTA_LABEL}:\\s*https?://`, 'i').test(escaped)) return escaped;
  return escaped.replace(
    new RegExp(`\\b(${CTA_LABEL}):\\s*(https?:\\/\\/[^\\s<>&]+)`, 'gi'),
    (_m, label: string, url: string) =>
      `<a href="${url}" target="_blank" rel="noopener noreferrer nofollow" class="text-primary hover:underline">${label}</a>`,
  );
}