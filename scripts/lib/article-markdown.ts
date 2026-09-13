import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

export const requiredFrontmatterFields = ['title', 'description', 'category', 'publishedDate', 'lastUpdated'] as const;

type RequiredFrontmatterField = typeof requiredFrontmatterFields[number];

export type ArticleDiagnostic = {
  kind: string;
  line: number;
  detail?: string;
};

export type ArticleAuditFile = {
  file: string;
  diagnostics: ArticleDiagnostic[];
};

export type ArticleAuditReport = {
  articles: number;
  totals: Record<string, number>;
  errors: Record<string, number>;
  warnings: Record<string, number>;
  errorCount: number;
  warningCount: number;
  files: ArticleAuditFile[];
};

export type ArticleRepairChange = {
  file: string;
  changes: Record<string, number>;
};

export const typographyReplacements: Record<string, string> = {
  '\u2013': '-',
  '\u2014': '-',
  '\u2018': "'",
  '\u2019': "'",
  '\u201c': '"',
  '\u201d': '"',
  '\u2026': '...',
  '\u200b': '',
  '\ufeff': '',
};

const pseudoHeadings = new Set(['Pros', 'Cons', 'FAQ', 'Overview', 'Key Takeaways', 'Summary', 'Conclusion', 'Steps', 'Requirements']);
const rawSvgTags = /^(\s*)(\/?(?:svg|defs|pattern|g|rect|path|circle|line|text|polygon|marker|div))(?=[\s>])/;

function walkMarkdownFiles(directory: string, root = directory): string[] {
  return fs.readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const filePath = path.join(directory, entry.name);
      if (entry.isDirectory()) return walkMarkdownFiles(filePath, root);
      if (!entry.isFile() || entry.name === 'AGENTS.md' || !entry.name.endsWith('.md')) return [];
      return [path.relative(root, filePath).split(path.sep).join('/')];
    })
    .sort();
}

function isFenceOpening(line: string): RegExpMatchArray | null {
  return line.match(/^ {0,3}(`{3,}|~{3,})[^`~]*$/);
}

function isFenceClosing(line: string, fence: string): boolean {
  const marker = fence[0] === '`' ? '`' : '~';
  const trimmed = line.trim();
  return trimmed.length >= fence.length && [...trimmed].every((character) => character === marker);
}

function inlineFenceOpening(line: string): { before: string; fence: string } | null {
  const match = line.match(/^(.*\S)(`{3,}|~{3,})[A-Za-z0-9_+-]*\s*$/);
  if (!match || /^ {0,3}$/.test(match[1])) return null;
  return { before: match[1], fence: match[2] };
}

type FenceScan = {
  codeLines: Set<number>;
  inlineOpenings: Array<{ line: number; fence: string }>;
  unterminated: Array<{ line: number; fence: string }>;
};

function scanFences(lines: string[]): FenceScan {
  const codeLines = new Set<number>();
  const inlineOpenings: Array<{ line: number; fence: string }> = [];
  const unterminated: Array<{ line: number; fence: string }> = [];
  let open: { line: number; fence: string } | undefined;

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    if (open) {
      codeLines.add(index);
      if (isFenceClosing(line, open.fence)) open = undefined;
      continue;
    }

    const opening = isFenceOpening(line);
    if (opening) {
      codeLines.add(index);
      open = { line: index + 1, fence: opening[1] };
      continue;
    }

    const inline = inlineFenceOpening(line);
    if (inline) {
      inlineOpenings.push({ line: index + 1, fence: inline.fence });
      codeLines.add(index);
      open = { line: index + 1, fence: inline.fence };
    }
  }

  if (open) unterminated.push(open);
  return { codeLines, inlineOpenings, unterminated };
}

function unescapedBoldMarkers(value: string): number[] {
  const positions: number[] = [];
  for (let index = 0; index < value.length - 1; index++) {
    if (value[index] !== '*' || value[index + 1] !== '*') continue;
    let backslashes = 0;
    for (let previous = index - 1; previous >= 0 && value[previous] === '\\'; previous--) backslashes++;
    if (backslashes % 2 === 0) positions.push(index);
    index++;
  }
  return positions;
}

function splitTableCells(line: string): string[] {
  const trimmed = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  const cells: string[] = [];
  let cell = '';
  let escaped = false;
  let inlineCodeFence = 0;
  for (let index = 0; index < trimmed.length; index++) {
    const character = trimmed[index];
    if (escaped) {
      cell += character;
      escaped = false;
    } else if (character === '`') {
      let length = 1;
      while (trimmed[index + length] === '`') length++;
      cell += '`'.repeat(length);
      if (inlineCodeFence && length >= inlineCodeFence) inlineCodeFence = 0;
      else if (!inlineCodeFence) inlineCodeFence = length;
      index += length - 1;
    } else if (character === '\\') {
      cell += character;
      escaped = true;
    } else if (character === '|' && !inlineCodeFence) {
      cells.push(cell.trim());
      cell = '';
    } else {
      cell += character;
    }
  }
  cells.push(cell.trim());
  return cells;
}

function isTableDivider(line: string): boolean {
  const cells = splitTableCells(line);
  return cells.length > 1 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function hasTablePipe(line: string): boolean {
  let escaped = false;
  let inlineCodeFence = 0;
  for (let index = 0; index < line.length; index++) {
    const character = line[index];
    if (escaped) {
      escaped = false;
    } else if (character === '`') {
      let length = 1;
      while (line[index + length] === '`') length++;
      if (inlineCodeFence && length >= inlineCodeFence) inlineCodeFence = 0;
      else if (!inlineCodeFence) inlineCodeFence = length;
      index += length - 1;
    } else if (character === '\\') {
      escaped = true;
    } else if (character === '|' && !inlineCodeFence) {
      return true;
    }
  }
  return false;
}

function isAsciiBorder(line: string): boolean {
  return /\+[-=+]{8,}\+/.test(line);
}

function validFrontmatterValue(value: unknown): boolean {
  return (typeof value === 'string' && value.trim().length > 0) || value instanceof Date;
}

function addDiagnostic(diagnostics: ArticleDiagnostic[], kind: string, line: number, detail?: string): void {
  diagnostics.push(detail ? { kind, line, detail } : { kind, line });
}

function isProseLine(line: string): boolean {
  if (!line.trim() || hasTablePipe(line) || line.includes('`')) return false;
  if (/^ {0,3}(?:#{1,6}\s|[-+*]\s+|\d+[.)]\s+|>|(?:[-*_]){3,}\s*$)/.test(line)) return false;
  if (/<\/?[A-Za-z][^>]*>/.test(line)) return false;
  return !/!?\[[^\]]*\]\s*(?:\([^)]*\)|\[[^\]]*\])/.test(line);
}

function auditStrongLine(line: string, lineNumber: number, diagnostics: ArticleDiagnostic[]): void {
  const markers = unescapedBoldMarkers(line);
  if (markers.length % 2) addDiagnostic(diagnostics, 'unmatched-bold-delimiter', lineNumber);
  for (let index = 0; index + 1 < markers.length; index += 2) {
    const inner = line.slice(markers[index] + 2, markers[index + 1]);
    if (!inner.trim() || /^\s|\s$/.test(inner)) addDiagnostic(diagnostics, 'malformed-bold-pair', lineNumber);
  }
}

function asciiDiagramEnd(lines: string[], start: number, codeLines: Set<number>): number | undefined {
  let end = start;
  let borders = 0;
  while (end < lines.length && !codeLines.has(end) && lines[end].trim() && /^\s*[+|]/.test(lines[end])) {
    if (isAsciiBorder(lines[end])) borders++;
    end++;
  }
  return borders >= 2 ? end : undefined;
}

export function auditMarkdown(raw: string): ArticleDiagnostic[] {
  const diagnostics: ArticleDiagnostic[] = [];
  let content = raw;
  let data: Record<string, unknown> = {};
  try {
    const parsed = matter(raw);
    content = parsed.content;
    data = parsed.data;
  } catch (error) {
    addDiagnostic(diagnostics, 'frontmatter-parse-error', 1, error instanceof Error ? error.message : String(error));
  }

  for (const field of requiredFrontmatterFields) {
    if (!validFrontmatterValue(data[field])) addDiagnostic(diagnostics, `missing-${field}`, 1);
  }

  const lines = content.split(/\r?\n/);
  const fences = scanFences(lines);
  for (const opening of fences.inlineOpenings) addDiagnostic(diagnostics, 'inline-code-fence', opening.line);
  for (const opening of fences.unterminated) addDiagnostic(diagnostics, 'unterminated-code-fence', opening.line, opening.fence);

  for (let index = 0; index < lines.length; index++) {
    if (!fences.codeLines.has(index) && isProseLine(lines[index])) auditStrongLine(lines[index], index + 1, diagnostics);
  }

  for (let index = 0; index < lines.length - 1; index++) {
    if (fences.codeLines.has(index) || fences.codeLines.has(index + 1)) continue;
    if (!hasTablePipe(lines[index]) || !isTableDivider(lines[index + 1])) continue;
    const expectedCells = splitTableCells(lines[index]).length;
    let row = index + 2;
    let malformedRows = 0;
    while (row < lines.length && !fences.codeLines.has(row) && hasTablePipe(lines[row]) && lines[row].trim()) {
      const actualCells = splitTableCells(lines[row]).length;
      if (actualCells !== expectedCells) {
        addDiagnostic(diagnostics, 'malformed-table-row', row + 1, `expected ${expectedCells} cells, found ${actualCells}`);
        malformedRows++;
      }
      row++;
    }
    if (malformedRows) addDiagnostic(diagnostics, 'malformed-table', index + 1);
    index = row - 1;
  }

  let asciiBlockStart: number | undefined;
  let asciiFence: string | undefined;
  let borders = 0;
  for (let index = 0; index < lines.length; index++) {
    if (!asciiFence) {
      const opening = isFenceOpening(lines[index]);
      if (!opening) continue;
      asciiBlockStart = index + 1;
      asciiFence = opening[1];
      borders = 0;
      continue;
    }
    if (asciiBlockStart && isAsciiBorder(lines[index])) borders++;
    if (asciiBlockStart && isFenceClosing(lines[index], asciiFence)) {
      if (borders >= 2) addDiagnostic(diagnostics, 'ascii-box-diagram', asciiBlockStart);
      asciiBlockStart = undefined;
      asciiFence = undefined;
    }
  }

  for (let index = 0; index < lines.length; index++) {
    if (fences.codeLines.has(index) || !isAsciiBorder(lines[index])) continue;
    const end = asciiDiagramEnd(lines, index, fences.codeLines);
    if (end) {
      addDiagnostic(diagnostics, 'unfenced-ascii-box-diagram', index + 1);
      index = end - 1;
    }
  }

  let rawSvgLine: number | undefined;
  for (let index = 0; index < lines.length; index++) {
    if (/^\s*svg\b[^>]*>\s*$/.test(lines[index])) rawSvgLine = index + 1;
    if (rawSvgLine && /^\s*\/svg>\s*$/.test(lines[index])) {
      addDiagnostic(diagnostics, 'broken-raw-svg', rawSvgLine);
      rawSvgLine = undefined;
    }
  }

  for (let index = 0; index < lines.length; index++) {
    if (fences.codeLines.has(index)) continue;
    const heading = lines[index].match(/^\s*\*\*(.+?)\*\*\s*$/);
    if (heading && pseudoHeadings.has(heading[1])) addDiagnostic(diagnostics, 'pseudo-heading', index + 1);
    for (const character of lines[index]) {
      if (character in typographyReplacements) addDiagnostic(diagnostics, 'non-ascii-typography', index + 1, character);
    }
  }

  return diagnostics.sort((left, right) => left.line - right.line || left.kind.localeCompare(right.kind) || (left.detail || '').localeCompare(right.detail || ''));
}

export function auditArticles(articlesDirectory: string): ArticleAuditReport {
  const files = walkMarkdownFiles(articlesDirectory);
  const reportFiles = files.map((file) => ({
    file,
    diagnostics: auditMarkdown(fs.readFileSync(path.join(articlesDirectory, file), 'utf8')),
  })).filter((file) => file.diagnostics.length > 0);
  const totals: Record<string, number> = {};
  for (const file of reportFiles) {
    for (const diagnostic of file.diagnostics) totals[diagnostic.kind] = (totals[diagnostic.kind] || 0) + 1;
  }
  const errors: Record<string, number> = {};
  const warnings: Record<string, number> = {};
  for (const [kind, count] of Object.entries(totals)) {
    if (kind === 'ascii-box-diagram') warnings[kind] = count;
    else errors[kind] = count;
  }
  return {
    articles: files.length,
    totals: Object.fromEntries(Object.entries(totals).sort(([left], [right]) => left.localeCompare(right))),
    errors: Object.fromEntries(Object.entries(errors).sort(([left], [right]) => left.localeCompare(right))),
    warnings: Object.fromEntries(Object.entries(warnings).sort(([left], [right]) => left.localeCompare(right))),
    errorCount: Object.values(errors).reduce((total, count) => total + count, 0),
    warningCount: Object.values(warnings).reduce((total, count) => total + count, 0),
    files: reportFiles,
  };
}

function deriveCategory(file: string, title: unknown): string | undefined {
  const slug = file.replace(/\.md$/, '').replaceAll('-', ' ').toLowerCase();
  const articleTitle = typeof title === 'string' ? title.toLowerCase() : '';
  const subject = `${slug} ${articleTitle}`;
  if (/\b(job|jobs|career|resume|interview|workplace|employee|hiring|freelanc|salary|professional|manager|leadership|networking)\b/.test(subject)) return 'Career Guides';
  if (/^(what is|how to|understanding|explained|guide to)\b/.test(slug) || /^(what is|how to|understanding|explained|guide to)\b/.test(articleTitle) || /\b(beginner|basics)\b/.test(subject)) return 'Educational';
  if (/\b(solidity|ethereum|bitcoin|blockchain|crypto|defi|web3|protocol|smart contract|developer)\b/.test(subject)) return 'Technology Deep Dives';
  return undefined;
}

function addCategory(raw: string, category: string): string {
  const match = raw.match(/^(---\r?\n[\s\S]*?)(\r?\n---(?:\r?\n|$))/);
  if (!match) return raw;
  return `${match[1]}\ncategory: ${category}${match[2]}${raw.slice(match[0].length)}`;
}

function repairInlineFences(content: string, changes: Record<string, number>): string {
  const lines = content.split(/\r?\n/);
  const repaired = lines.flatMap((line) => {
    const inline = inlineFenceOpening(line);
    if (!inline) return line;
    changes.inlineCodeFences = (changes.inlineCodeFences || 0) + 1;
    return [inline.before, '', line.slice(inline.before.length)];
  });
  const fences = scanFences(repaired);
  for (const opening of fences.unterminated) {
    repaired.push('', opening.fence);
    changes.unterminatedCodeFences = (changes.unterminatedCodeFences || 0) + 1;
  }
  return repaired.join('\n');
}

function repairRawSvg(content: string, changes: Record<string, number>): string {
  const lines = content.split(/\r?\n/);
  let inRawSvg = false;
  let repairedFigures = 0;
  const repaired = lines.map((line, index) => {
    const beginsSvg = /^\s*svg\b[^>]*>\s*$/.test(line);
    const isFigureCaption = /^\s*div\b[^>]*>\s*$/.test(line) && /^\s*svg\b/.test(lines[index + 1] || '');
    const needsTag = inRawSvg || beginsSvg || isFigureCaption;
    let next = line;
    if (needsTag && rawSvgTags.test(next)) next = next.replace(rawSvgTags, '$1<$2');
    if (beginsSvg) {
      inRawSvg = true;
      repairedFigures++;
    }
    if (inRawSvg && /^\s*\/svg>\s*$/.test(line)) inRawSvg = false;
    return next;
  });
  if (repairedFigures) changes.rawSvg = repairedFigures;
  return repaired.join('\n');
}

function repairStrongLine(line: string, changes: Record<string, number>): string {
  const markers = unescapedBoldMarkers(line);
  if (!markers.length) return line;
  let repaired = '';
  let cursor = 0;
  for (let index = 0; index + 1 < markers.length; index += 2) {
    const opening = markers[index];
    const closing = markers[index + 1];
    const inner = line.slice(opening + 2, closing);
    const trimmed = inner.trim();
    repaired += line.slice(cursor, opening);
    if (trimmed) repaired += `**${trimmed}**`;
    else repaired += inner;
    if (trimmed !== inner || !trimmed) changes.malformedBoldPair = (changes.malformedBoldPair || 0) + 1;
    cursor = closing + 2;
  }
  if (markers.length % 2) {
    const unmatched = markers[markers.length - 1];
    repaired += line.slice(cursor, unmatched);
    repaired += line.slice(unmatched + 2);
    changes.unmatchedBoldDelimiter = (changes.unmatchedBoldDelimiter || 0) + 1;
  } else {
    repaired += line.slice(cursor);
  }
  return repaired;
}

function repairStrong(content: string, changes: Record<string, number>): string {
  const lines = content.split(/\r?\n/);
  const fences = scanFences(lines);
  return lines.map((line, index) => (
    !fences.codeLines.has(index) && isProseLine(line) ? repairStrongLine(line, changes) : line
  )).join('\n');
}

function fusedTablePrefix(line: string): { prefix: string; table: string } | undefined {
  const firstPipe = line.indexOf('|');
  if (firstPipe < 1) return undefined;
  const prefix = line.slice(0, firstPipe);
  if (!/^\s*\*\*[^*]+:\*\*\s*$/.test(prefix)) return undefined;
  return { prefix: prefix.trimEnd(), table: line.slice(firstPipe) };
}

function formatTableRow(cells: string[]): string {
  return `| ${cells.join(' | ')} |`;
}

function repairTables(content: string, changes: Record<string, number>): string {
  const lines = content.split(/\r?\n/);
  const fences = scanFences(lines);
  const repaired: string[] = [];
  for (let index = 0; index < lines.length; index++) {
    if (fences.codeLines.has(index)) {
      repaired.push(lines[index]);
      continue;
    }
    const fused = fusedTablePrefix(lines[index]);
    const headerLine = fused ? fused.table : lines[index];
    if (!hasTablePipe(headerLine) || index + 1 >= lines.length || fences.codeLines.has(index + 1) || !isTableDivider(lines[index + 1])) {
      repaired.push(lines[index]);
      continue;
    }

    const header = splitTableCells(headerLine);
    const divider = splitTableCells(lines[index + 1]);
    const rows: string[][] = [];
    let row = index + 2;
    while (row < lines.length && !fences.codeLines.has(row) && lines[row].trim() && hasTablePipe(lines[row])) {
      rows.push(splitTableCells(lines[row]));
      row++;
    }
    const columnCount = Math.max(header.length, divider.length, ...rows.map((cells) => cells.length));
    const malformed = fused || header.length !== columnCount || divider.length !== columnCount || rows.some((cells) => cells.length !== columnCount);
    if (!malformed) {
      repaired.push(...lines.slice(index, row));
      index = row - 1;
      continue;
    }

    const normalize = (cells: string[]) => [...cells, ...Array<string>(columnCount - cells.length).fill('')];
    if (fused) repaired.push(fused.prefix, '');
    repaired.push(formatTableRow(normalize(header)));
    repaired.push(formatTableRow(normalize(divider).map((cell) => (/^:?-{3,}:?$/.test(cell) ? cell : '---'))));
    repaired.push(...rows.map((cells) => formatTableRow(normalize(cells))));
    changes.table = (changes.table || 0) + 1;
    index = row - 1;
  }
  return repaired.join('\n');
}

function repairAsciiDiagrams(content: string, changes: Record<string, number>): string {
  const lines = content.split(/\r?\n/);
  const fences = scanFences(lines);
  const repaired: string[] = [];
  for (let index = 0; index < lines.length; index++) {
    if (fences.codeLines.has(index) || !isAsciiBorder(lines[index])) {
      repaired.push(lines[index]);
      continue;
    }
    const end = asciiDiagramEnd(lines, index, fences.codeLines);
    if (!end) {
      repaired.push(lines[index]);
      continue;
    }
    repaired.push('```text', ...lines.slice(index, end), '```');
    changes.asciiDiagram = (changes.asciiDiagram || 0) + 1;
    index = end - 1;
  }
  return repaired.join('\n');
}

export function repairArticle(raw: string, file: string): { content: string; changes: Record<string, number> } {
  const changes: Record<string, number> = {};
  let content = raw;
  let data: Record<string, unknown> = {};
  try {
    data = matter(raw).data;
  } catch {
    return { content, changes };
  }

  if (!validFrontmatterValue(data.category)) {
    const category = deriveCategory(file, data.title);
    if (category) {
      content = addCategory(content, category);
      changes.category = 1;
    }
  }

  const parsed = matter(content);
  let body = repairInlineFences(parsed.content, changes);
  body = body.replace(/^\s*\*\*(Pros|Cons|FAQ|Overview|Key Takeaways|Summary|Conclusion|Steps|Requirements)\*\*\s*$/gm, (_match, heading: string) => {
    changes.pseudoHeading = (changes.pseudoHeading || 0) + 1;
    return `## ${heading}`;
  });
  body = repairRawSvg(body, changes);
  body = repairStrong(body, changes);
  body = repairTables(body, changes);
  body = repairAsciiDiagrams(body, changes);
  body = body.replace(/[\u2013\u2014\u2018\u2019\u201c\u201d\u2026\u200b\ufeff]/g, (character) => {
    changes.typography = (changes.typography || 0) + 1;
    return typographyReplacements[character];
  });

  const frontmatterLength = content.length - parsed.content.length;
  content = `${content.slice(0, frontmatterLength)}${body}`;
  return { content, changes };
}

export function repairArticles(articlesDirectory: string, dryRun: boolean): ArticleRepairChange[] {
  return walkMarkdownFiles(articlesDirectory).flatMap((file) => {
    const filePath = path.join(articlesDirectory, file);
    const raw = fs.readFileSync(filePath, 'utf8');
    const repaired = repairArticle(raw, file);
    if (repaired.content === raw) return [];
    if (!dryRun) fs.writeFileSync(filePath, repaired.content, 'utf8');
    return [{ file, changes: Object.fromEntries(Object.entries(repaired.changes).sort(([left], [right]) => left.localeCompare(right))) }];
  });
}
