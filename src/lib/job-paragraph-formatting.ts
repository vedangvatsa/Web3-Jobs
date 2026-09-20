export function repairFlattenedJobParagraphs(html: string): string {
  if (!/Zone [A-D]:|Application Guidelines|Use of AI in Our Hiring Process/.test(html)) return html;
  return html.replace(/<p(\s[^>]*)?>([\s\S]*?)<\/p>/gi, (original, attrs: string | undefined, body: string) => {
    if (/<[^>]+>/.test(body)) return original;
    const pattern = /Zone [A-D]:\s*\(?(?:[A-Z]{3}\s*)?\$[\d,.]+\s*[-–—]\s*(?:[A-Z]{3}\s*)?\$[\d,.]+\)?|(?:Application Guidelines|Use of AI in Our Hiring Process)(?=\s+[A-Z]|\s*$)/g;
    const parts: string[] = [];
    let cursor = 0;
    const paragraph = (text: string) => {
      if (text.trim()) parts.push(`<p${attrs || ''}>${text.trim()}</p>`);
    };
    for (const match of body.matchAll(pattern)) {
      const index = match.index!;
      const isZone = match[0].startsWith('Zone ');
      if (!isZone && index > 0 && !/[.!?]\s*$/.test(body.slice(0, index))) continue;
      paragraph(body.slice(cursor, index));
      if (isZone) paragraph(match[0]);
      else parts.push(`<h3 class="text-xl font-bold tracking-tight text-foreground mt-8 mb-3">${match[0]}</h3>`);
      cursor = index + match[0].length;
    }
    if (!parts.length) return original;
    paragraph(body.slice(cursor));
    return parts.join('');
  });
}
