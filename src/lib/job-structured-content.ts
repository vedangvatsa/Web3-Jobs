import sanitize from 'sanitize-html';
import * as cheerio from 'cheerio';

export function formatJobStructuredContent(html: string): string {
  const $ = cheerio.load(html, null, false);
  $('p').each((_, el) => {
    const p = $(el);
    const text = p.text().trim();
    const heading = /^(?:\d+[.)]\s+)?(?:about (?:you|the opportunity)|what you will do)|^[-*•]\s+what we.re looking for:$/i.test(text);
    const numberedHeading = /^\d+[.)]\s+/.test(text) && p.find('strong,b').length && !p.clone().find('strong,b,br').remove().end().text().trim();
    if ((heading || numberedHeading) && text.length < 160) p.replaceWith($('<h4>').text(text.replace(/^[-*•]\s+/, '')));
    else if (/^[-*•]\s+/.test(text) && !p.find('a').length) {
      const list = $('<ul>');
      list.append($('<li>').text(text.replace(/^[-*•]\s+/, '')));
      p.replaceWith(list);
    }
  });
  $('h3,h4').filter((_, el) => !$(el).text().trim()).remove();
  let wrappers = $('ul > div, ol > div');
  while (wrappers.length) {
    wrappers.each((_, el) => { $(el).replaceWith($(el).contents()); });
    wrappers = $('ul > div, ol > div');
  }
  $('ul > ul, ul > ol, ol > ol, ol > ul').get().reverse().forEach(el => {
    const previous = $(el).prev('li');
    if (previous.length) previous.append($(el));
    else if ($(el).parent().prop('tagName')?.toLowerCase() === el.tagName) $(el).replaceWith($(el).contents());
  });
  $('ul,ol').get().reverse().forEach(el => {
    const list = $(el);
    const fragments: string[] = [];
    const group = list.clone().empty();
    let count = 0;
    const start = Number(list.attr('start') || 1);
    const flush = () => {
      if (!group.children('li').length) return;
      if (el.tagName === 'ol') group.attr('start', String(start + count));
      count += group.children('li').length;
      fragments.push($.html(group));
      group.empty();
    };
    for (const child of list.contents().toArray()) {
      if (child.type === 'tag' && child.tagName === 'li') group.append($(child));
      else if (child.type === 'text' && /^\s*[-*•]\s+/.test(child.data)) {
        group.append($('<li>').text(child.data.trim().replace(/^[-*•]\s+/, '')));
      } else if ($(child).text().trim()) {
        flush();
        fragments.push(child.type === 'text' ? $.html($('<p>').text(child.data)) : $.html(child));
      }
    }
    flush();
    list.replaceWith(fragments.join(''));
  });
  const cleaned = sanitize($.html(), {
    allowedTags: ['div', 'p', 'br', 'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'pre', 'code', 'blockquote', 'strong', 'b', 'em', 'i', 'a', 'h3', 'h4', 'sub', 'sup'],
    allowedAttributes: {
      '*': ['class'], a: ['href', 'target', 'rel'], ol: ['start', 'reversed'], li: ['value'],
      th: ['scope', 'colspan', 'rowspan'], td: ['colspan', 'rowspan'],
    },
    allowedSchemes: ['https', 'http', 'mailto', 'tel'],
    transformTags: {
      '*': (tagName, attributes) => {
        const { style: _style, class: _class, ...rest } = attributes;
        const classes: Record<string, string> = {
          p: 'leading-relaxed my-3', ul: 'list-disc pl-5 space-y-2 my-4',
          ol: 'list-decimal pl-5 space-y-2 my-4', li: 'leading-relaxed',
          table: 'w-full border-collapse text-left text-sm',
          th: 'border border-border px-3 py-2 font-semibold', td: 'border border-border px-3 py-2 align-top',
          pre: 'max-w-full overflow-x-auto whitespace-pre rounded-md bg-muted p-4 text-sm',
          blockquote: 'border-l-2 border-border pl-4 my-4', a: 'text-primary underline break-words',
        };
        return { tagName, attribs: {
          ...rest, ...(classes[tagName] ? { class: classes[tagName] } : {}),
          ...(tagName === 'a' ? { target: '_blank', rel: 'noopener noreferrer nofollow' } : {}),
        } };
      },
    },
  });
  return cleaned.includes('<table') ? `<div class="max-w-full overflow-x-auto">${cleaned}</div>` : cleaned;
}
