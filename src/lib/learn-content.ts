import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkHtml from 'remark-html';
import { canonicalLearnLink } from './learn-routes';

type ContentNode = {
  type: string;
  position?: { start: { offset?: number }; end: { offset?: number } };
  children?: ContentNode[];
};

export async function renderLessonContent(content: string, category: string, lesson: string): Promise<string> {
  const processor = remark().use(remarkGfm).use(remarkHtml, { sanitize: false });
  const codeRanges: [number, number][] = [];
  function collectCode(node: ContentNode) {
    if ((node.type === 'code' || node.type === 'inlineCode') && node.position) {
      codeRanges.push([node.position.start.offset ?? 0, node.position.end.offset ?? 0]);
    }
    for (const child of node.children || []) collectCode(child);
  }
  collectCode(processor.parse(content));
  const diagrams: string[] = [];
  const protectedContent = content.replace(/<svg\b[\s\S]*?<\/svg>/g, (svg, offset: number) => {
    if (codeRanges.some(([start, end]) => offset >= start && offset < end)) return svg;
    const index = diagrams.push(svg) - 1;
    return `<div data-preserved-lesson-svg="${index}"></div>`;
  });
  const result = await processor.process(protectedContent);
  const restored = String(result).replace(/<div data-preserved-lesson-svg="(\d+)"><\/div>/g, (_match, index) => diagrams[Number(index)]);
  const html = restored.replace(/<(h[23])>([\s\S]*?)<\/\1>/g, (_match, tag, body) => {
    const id = body.replace(/<[^>]+>/g, '').replace(/&[a-z#0-9]+;/gi, ' ').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return `<${tag} id="${id}">${body}</${tag}>`;
  });
  return html.replace(/(<a\b[^>]*\shref=")([^"]+)(")/g, (_match, start, href, end) => {
    const decoded = href.replace(/&amp;/g, '&');
    const canonical = canonicalLearnLink(decoded, category, lesson).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
    return `${start}${canonical}${end}`;
  });
}
