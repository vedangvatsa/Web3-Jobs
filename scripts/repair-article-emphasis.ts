import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import matter from 'gray-matter';
import { remark } from 'remark';
import gfm from 'remark-gfm';

type Node = { type: string; value?: string; children?: Node[]; position?: { start: { offset: number }; end: { offset: number } } };
const parser = remark().use(gfm);
const visibleCharacters = (text: string) => text.replace(/[^\p{L}\p{N}]/gu, '');

/** Repair presentation only. The ordered letters and numbers must remain identical. */
export function repairEmphasis(source: string): string {
  const original = source;
  const orphanLabels = [...source.matchAll(/^([^#*\n]{2,95})\n\n(?=\*\*[^*\n]{120,})/gm)]
    .map((m) => m[1].trim()).filter((label) => label.split(/\s+/).length <= 10 && !/[,:;]$/.test(label) && !/[.!?]/.test(label.replace(/\.$/, '')) && !/^\d+\./.test(label));
  const protectedSpans: string[] = [];
  const protect = (value: string) => `\uE000${protectedSpans.push(value) - 1}\uE001`;
  // Do not interpret multiplication, example Markdown, or URL bytes as prose markers.
  source = source.replace(/^ {0,3}```[^\n]*\n[\s\S]*?^ {0,3}```[^\n]*$/gm, protect);
  source = source.replace(/`[^`\n]+`/g, protect);
  source = source.replace(/\]\(([^)\n]+)\)/g, (_match, url: string) => `](${protect(url)})`);
  source = source.replace(/^\*\*(\d+\.[^*\n]{1,110})\*\*[ \t]*$/gm, '#### $1');

  // A heading was moved after the closing marker of the preceding description.
  source = source.replace(/^\*\*([^*\n]{120,})\*\*\s*([^*\n]{2,110})(?:\*\*)?\s*$/gm,
    (_match, prose: string, heading: string) => `${prose.trim()}\n\n#### ${heading.trim()}`);
  // The same corruption can occur inside a paragraph or after a question.
  source = source.replace(/([.!?])\*\*\s*((?:\d+\.\s+)?[A-Z][^*\n]{1,100})(?:\*\*)?(?=\n|$)/g,
    '$1\n\n#### $2');
  source = source.replace(/\*\*\s*((?:\d+\.\s+)[^*\n]{1,100}?)\*\*\s*/g, '\n\n#### $1\n\n');
  source = source.replace(/\*\* (Code\.)\*\* /g, '\n\n#### $1\n\n');
  source = source.replace(/([.!?])\*\*((?:How|What|Why|Who|When|Where|Can|Does|Is|Are|Should|Do)\b[^*\n]*\?)\*\*/g,
    '$1\n\n#### $2\n\n');

  // An opening emphasis marker without a closing marker is a broken list label.
  source = source.replace(/^\s*(?:[-*]\s+|(?<number>\d+)\.\s+)\*\*([^*\n]{1,130})\s*$/gm,
    (...args: unknown[]) => {
      const heading = String(args[2]).trim();
      const groups = args.at(-1) as { number?: string };
      return `\n#### ${groups?.number ? `${groups.number}. ` : ''}${heading}\n`;
    });
  // Convert short standalone labels paired with the next over-bolded paragraph.
  source = source.replace(/^([^#*\n]{2,95})\n\n(?=\*\*[^*\n]{120,})/gm,
    (match, label: string) => {
      if (label.split(/\s+/).length > 10 || /[,:;]$/.test(label) || /[.!?]/.test(label.replace(/\.$/, '')) || /^\uE000/.test(label)) return match;
      return `#### ${label.trim()}\n\n`;
    });
  // Remove paragraph-wide emphasis, retaining the text and all contained links.
  source = source.replace(/\*\*([^*\n]{160,})\*\*/g, '$1');
  source = source.replace(/^\*\*(?=\S[^\n]{120,})/gm, '');

  // Correct spacing within emphasis pairs and around inline links.
  source = source.replace(/\*\*([^*\n]+)\*\*/g, (_match, inner: string) => `**${inner.trim()}**`);
  source = source.replace(/([.!?])\*\*([A-Z][^*\n]{1,100})\*\*(?=\S)/g, '$1\n\n#### $2\n\n');
  source = source.replace(/^(\*\*[^*\n]+\*\*)\s*[-*]\s+/gm, '$1\n\n- ');
  source = source.replace(/^(\s*(?:[-*]|\d+\.)\s+\*\*[^*\n]+\*\*)(?=\S)/gm, '$1 ');
  source = source.replace(/((?<!\d)[.!?:])(?=[1-9]\d?\. [A-Z])/g, '$1\n\n');
  source = source.replace(/([.!?])\s+(\d+\. [A-Z][^\n]{1,95})\s*$/gm, '$1\n\n#### $2');
  source = source.replace(/^(\d+\. [^\n]{1,110})\s*$/gm, '\n#### $1\n');
  source = source.replace(/\n(?=\d+\. )/g, '\n\n');
  source = source.replace(/([.!?:])(?=(?:Transparency|Computational Cost|Technical Foundation)\s*$)/gm, '$1\n\n#### ');
  source = source.replace(/\uE000(\d+)\uE001/g, (_match, index: string) => protectedSpans[Number(index)]);
  for (const label of orphanLabels) {
    source = source.split('\n').map((line) => line.trim() === label ? `#### ${label}` : line).join('\n');
  }

  const visibleText = (node: Node): string => node.value || (node.children || []).map(visibleText).join('');
  const boldTree = parser.parse(source) as unknown as Node;
  const boldEdits: { start: number; end: number }[] = [];
  const unbold = (node: Node) => {
    if (node.type === 'strong' && node.position && visibleText(node).length > 160) {
      boldEdits.push({ start: node.position.start.offset, end: node.position.start.offset + 2 });
      boldEdits.push({ start: node.position.end.offset - 2, end: node.position.end.offset });
    }
    for (const child of node.children || []) unbold(child);
  };
  unbold(boldTree);
  for (const edit of boldEdits.sort((a, b) => b.start - a.start)) source = source.slice(0, edit.start) + source.slice(edit.end);

  // Remove only unparsed emphasis tokens; fenced/inline code nodes are excluded.
  for (let pass = 0; pass < 3; pass++) {
    const tree = parser.parse(source) as unknown as Node;
    const changes: { start: number; end: number; text: string }[] = [];
    const visit = (node: Node) => {
      if (node.type === 'text' && node.value?.includes('**') && node.position) {
        const { start, end } = node.position;
        const raw = source.slice(start.offset, end.offset);
        const text = raw.replace(/(?<![\w])\*\*|\*\*(?![\w])/g, '');
        if (text !== raw) changes.push({ start: start.offset, end: end.offset, text });
      }
      for (const child of node.children || []) visit(child);
    };
    visit(tree);
    for (const edit of changes.sort((a, b) => b.start - a.start)) source = source.slice(0, edit.start) + edit.text + source.slice(edit.end);
    if (!changes.length) break;
  }
  // Insert missing spaces at semantic inline-node boundaries, never inside code/URLs.
  const tree = parser.parse(source) as unknown as Node;
  const spaces = new Set<number>();
  const spacing = (node: Node) => {
    if (['strong', 'link', 'emphasis'].includes(node.type) && node.position) {
      const { start, end } = node.position;
      if (/[\p{L}\p{N},;:]/u.test(source[start.offset - 1] || '') && !/\s/.test(source[start.offset - 1] || '')) spaces.add(start.offset);
      if (/[\p{L}\p{N}]/u.test(source[end.offset] || '')) spaces.add(end.offset);
    }
    for (const child of node.children || []) spacing(child);
  };
  spacing(tree);
  for (const offset of [...spaces].sort((a, b) => b - a)) source = source.slice(0, offset) + ' ' + source.slice(offset);
  const fences: string[] = [];
  source = source.replace(/^ {0,3}```[^\n]*\n[\s\S]*?^ {0,3}```[^\n]*$/gm, (value) => `\uE100${fences.push(value) - 1}\uE101`);
  source = source.replace(/\n{3,}/g, '\n\n');
  source = source.replace(/^(#{1,6} .+?)[ \t]+$/gm, '$1');
  source = source.replace(/\uE100(\d+)\uE101/g, (_match, index: string) => fences[Number(index)]);
  assert.equal(visibleCharacters(source), visibleCharacters(original), 'Repair changed content beyond formatting');
  return source;
}

if (process.argv[1]?.endsWith('repair-article-emphasis.ts')) {
  const manifestPath = process.argv[2];
  if (!manifestPath) throw new Error('Usage: tsx scripts/repair-article-emphasis.ts manifest.json [--write]');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as { sourceFiles: string[]; outputDirectory: string };
  fs.mkdirSync(manifest.outputDirectory, { recursive: true });
  for (const relative of manifest.sourceFiles) {
    if (!/^content\/articles\/[a-z0-9-]+\.md$/.test(relative)) throw new Error('Invalid article path');
    const file = path.join(process.cwd(), relative);
    const original = fs.readFileSync(file, 'utf8');
    const { content } = matter(original);
    const header = original.slice(0, original.length - content.length);
    const fixed = header + repairEmphasis(content);
    const backup = path.join(manifest.outputDirectory, path.basename(file) + '.before');
    if (!fs.existsSync(backup)) fs.writeFileSync(backup, original);
    fs.writeFileSync(path.join(manifest.outputDirectory, path.basename(file)), fixed);
    if (process.argv.includes('--write')) fs.writeFileSync(file, fixed);
    console.log(`${original === fixed ? 'UNCHANGED' : 'REPAIRED'} ${relative}`);
  }
}
