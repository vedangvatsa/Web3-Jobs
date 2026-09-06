/**
 * Universal HTML Sanitizer & Formatter for Web3-Jobs
 * Ensures job descriptions, company summaries, and articles render clean HTML
 * without corrupted attributes, Slack/Greenhouse/Ashby junk data, or bad linebreaks.
 */

export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== "string") return "";

  let cleaned = html;

  // 1. Convert plain text without HTML tags to basic HTML paragraphs
  if (!/<[a-z][\s\S]*>/i.test(cleaned)) {
    const paragraphs = cleaned.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
    cleaned = paragraphs.map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('\n');
  }

  // 2. Remove Slack/Greenhouse/Ashby data-stringify and highlighted span junk
  cleaned = cleaned.replace(/<span[^>]*class="[^"]*x_c-mrkdwnhighlight[^"]*"[^>]*>(.*?)<\/span>/gi, "$1");
  cleaned = cleaned.replace(/<span[^>]*data-highlighted="[^"]*"[^>]*>(.*?)<\/span>/gi, "$1");
  cleaned = cleaned.replace(/<span[^>]*class="_kqswh2mm"[^>]*>(.*?)<\/span>/gi, "$1");
  cleaned = cleaned.replace(/<span[^>]*class="[^"]*_5pioz8co[^"]*"[^>]*>(.*?)<\/span>/gi, "$1");
  cleaned = cleaned.replace(/<div class="content-intro">(.*?)<\/div>/gi, "$1");

  // 3. Strip all data-* attributes (Slack, Greenhouse, Ashby, Notion)
  cleaned = cleaned.replace(/\s+data-[a-z0-9_-]+=(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  cleaned = cleaned.replace(/\s+[a-z0-9_-]+""="?"/gi, "");
  cleaned = cleaned.replace(/\s+[a-z0-9_-]+""/gi, "");

  // 4. Strip inline font/style corruptions
  cleaned = cleaned.replace(/\s*style=""\s*[^"'>]*/gi, "");
  cleaned = cleaned.replace(/\s*font-size:"=""\s*[^"'>]*/gi, "");
  cleaned = cleaned.replace(/\s*font-weight:"=""\s*[^"'>]*/gi, "");
  cleaned = cleaned.replace(/\s*font-family:"=""\s*[^"'>]*/gi, "");
  cleaned = cleaned.replace(/\s*style="min-height:\s*1\.[57]em;?"/gi, "");

  // Fix corrupted href attributes
  cleaned = cleaned.replace(/href=""\s*(https?:[^\s"'>]+)""\s*target=""\s*_blank""[^>]*>/gi, 'href="$1" target="_blank" rel="noopener noreferrer">');
  cleaned = cleaned.replace(/href=""\s*([^"'>]+)""[^>]*>/gi, 'href="$1" target="_blank" rel="noopener noreferrer">');

  // Strip empty class="", id="", style="" attributes
  cleaned = cleaned.replace(/\s+(class|id|style)=""/gi, "");

  // 5. Strip unneeded span tags wrapping plain text
  cleaned = cleaned.replace(/<span>(.*?)<\/span>/gi, "$1");
  cleaned = cleaned.replace(/<span style="">(.*?)<\/span>/gi, "$1");
  cleaned = cleaned.replace(/<span style="font-weight:\s*400;?">(.*?)<\/span>/gi, "$1");
  cleaned = cleaned.replace(/<span style="color:\s*rgb\(0,\s*0,\s*0\);?">(.*?)<\/span>/gi, "$1");

  // 6. Remove tracking code tags
  cleaned = cleaned.replace(/<p[^>]*>\s*#LI-[A-Z0-9]+\s*<\/p>/gi, "");
  cleaned = cleaned.replace(/#LI-[A-Z0-9]+/gi, "");

  // 7. Convert trapped section headers inside <p><strong>...</strong></p> to <h3>
  const headerRegex = /<p[^>]*>\s*<(strong|b)>\s*(About Us|About|Overview|Responsibilities|Key Responsibilities|Qualifications|Requirements|What You'll Do|What You Need|Who You Are|Why Join Us|Why Work With Us|Benefits|Perks|Perks & Benefits|Benefits & Perks|How to Apply|Hiring Process|Where We Work|Culture|Equal Opportunity)\s*:?\s*<\/\1>\s*:?\s*<\/p>/gi;
  cleaned = cleaned.replace(headerRegex, (match, tag, headerText) => `<h3>${headerText.trim()}</h3>`);

  // Convert <h2> to <h3> for clean consistent hierarchy
  cleaned = cleaned.replace(/<h2([^>]*)>(.*?)<\/h2>/gi, "<h3$1>$2</h3>");

  // 8. Fix mid-sentence line breaks (<br> followed by lowercase letter)
  cleaned = cleaned.replace(/<br\s*\/?>\s*([a-z0-9,;\.])/g, " $1");
  cleaned = cleaned.replace(/([a-z0-9,;])\s*<br\s*\/?>\s*/gi, "$1 ");

  // 9. Convert pseudo-bullets (* item, - item, • item) inside <p> or separated by <br> into <ul><li>
  cleaned = cleaned.replace(/(?:<p[^>]*>\s*[*•\-]\s+(.*?)<\/p>\s*)+/gi, (match) => {
    const items = match.split(/<\/p>\s*<p[^>]*>/).map(line => {
      const text = line.replace(/<\/?p[^>]*>/g, '').replace(/^\s*[*•\-]\s*/, '').trim();
      return text ? `<li>${text}</li>` : '';
    }).filter(Boolean);
    return `<ul>${items.join('')}</ul>`;
  });

  // 10. Remove empty paragraphs and empty list items
  cleaned = cleaned.replace(/<p[^>]*>\s*(?:&nbsp;|<br\s*\/?>)*\s*<\/p>/gi, "");
  cleaned = cleaned.replace(/<li>\s*(?:&nbsp;|<br\s*\/?>)*\s*<\/li>/gi, "");
  cleaned = cleaned.replace(/<ul>\s*<\/ul>/gi, "");
  cleaned = cleaned.replace(/<ol>\s*<\/ol>/gi, "");

  // 11. Fix double spaces and clean up whitespace
  cleaned = cleaned.replace(/ {2,}/g, " ");
  cleaned = cleaned.trim();

  return cleaned;
}
