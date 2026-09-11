import fs from 'fs';
import path from 'path';

const articlesDirectory = path.join(process.cwd(), 'content/articles');
const dryRun = process.argv.includes('--dry-run');

type ChangeCounts = {
  files: number;
  boldSpacing: number;
  danglingBold: number;
  typography: number;
  pseudoHeadings: number;
  asciiDiagrams: number;
  referenceDumps: number;
  trailingWhitespace: number;
  inlineCodeFences: number;
  faqQuestions: number;
};

const referenceHeading = /^(#{2,3})\s+(?:(?:authoritative (?:research|documentation)(?: and technical documentation)?)|(?:references|sources|further reading|technical documentation)\b.*)$/i;
const pseudoHeadings = new Set(['Pros', 'Cons', 'FAQ', 'Overview', 'Key Takeaways', 'Summary', 'Conclusion', 'Steps', 'Requirements']);
const questionStart = /^(?:what|why|how|who|where|when|which|do|does|did|can|could|should|would|is|are|will|have|has)\b/i;
const typographyReplacements: Record<string, string> = {
  '\u2014': '-',
  '\u2013': '-',
  '\u201c': '"',
  '\u201d': '"',
  '\u2018': "'",
  '\u2019': "'",
  '\u2026': '...',
  '\u200b': '',
  '\ufeff': '',
};

function removeAsciiDiagrams(content: string, counts: ChangeCounts): string {
  const lines = content.split('\n');
  const repaired: string[] = [];

  for (let index = 0; index < lines.length; index++) {
    const opening = lines[index].match(/^\s*(`{3,}|~{3,})/);
    if (!opening) {
      repaired.push(lines[index]);
      continue;
    }

    const fence = opening[1][0];
    const length = opening[1].length;
    const block = [lines[index]];
    let end = index + 1;
    while (end < lines.length) {
      block.push(lines[end]);
      if (new RegExp(`^\\s*${fence}{${length},}\\s*$`).test(lines[end])) break;
      end++;
    }

    const borders = block.filter((line) => /\+[-+]{8,}\+/.test(line));
    if (borders.length >= 2) {
      counts.asciiDiagrams++;
      index = end;
      continue;
    }

    repaired.push(...block);
    index = end;
  }

  return repaired.join('\n');
}

function trimReferenceDumps(content: string, counts: ChangeCounts): string {
  const lines = content.split('\n');
  const repaired: string[] = [];

  for (let index = 0; index < lines.length; index++) {
    const heading = lines[index].match(referenceHeading);
    if (!heading) {
      repaired.push(lines[index]);
      continue;
    }

    const level = heading[1].length;
    let end = index + 1;
    while (end < lines.length) {
      const nextHeading = lines[end].match(/^(#{1,6})\s+/);
      if (nextHeading && nextHeading[1].length <= level) break;
      end++;
    }

    const listItems = lines.slice(index + 1, end).filter((line) => /^\s*[-*+]\s+/.test(line));
    if (listItems.length <= 6) {
      repaired.push(...lines.slice(index, end));
      index = end - 1;
      continue;
    }

    repaired.push(`${heading[1]} Further reading`, '', ...listItems.slice(0, 6), '');
    counts.referenceDumps++;
    index = end - 1;
  }

  return repaired.join('\n');
}

function repairInlineCodeFences(content: string, counts: ChangeCounts): string {
  return content.replace(/([^\n])(```[A-Za-z0-9_-]*)(?=\n)/g, (_match, before: string, fence: string) => {
    counts.inlineCodeFences++;
    return `${before}\n\n${fence}`;
  });
}

function repairMultilineBold(content: string, counts: ChangeCounts): string {
  const lines = content.split('\n');
  const repaired: string[] = [];
  let prose: string[] = [];
  let inFence = false;

  const flushProse = () => {
    if (!prose.length) return;
    repaired.push(prose.join('\n').replace(/\*\*([^*]*?)\*\*/g, (_match, inner: string) => {
      if (!inner.includes('\n')) return _match;

      counts.danglingBold += 2;
      const nonEmptyLines = inner.split('\n').map((line) => line.trim()).filter(Boolean);
      const title = nonEmptyLines.length === 1 ? nonEmptyLines[0] : '';
      const words = title.match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) || [];
      const canBeHeading = title
        && !title.startsWith('-')
        && !title.startsWith('#')
        && title.length <= 120
        && words.length <= 16
        && (!/[.!?]$/.test(title) || words.length <= 6);

      if (canBeHeading) return `\n\n### ${title.replace(/\.$/, '')}\n\n`;
      return inner;
    }));
    prose = [];
  };

  for (const line of lines) {
    if (/^\s*(`{3,}|~{3,})/.test(line)) {
      if (!inFence) flushProse();
      repaired.push(line);
      inFence = !inFence;
      continue;
    }
    if (inFence) repaired.push(line);
    else prose.push(line);
  }
  flushProse();

  return repaired.join('\n');
}

function normalizeInlineFormatting(content: string, counts: ChangeCounts): string {
  const lines = content.split('\n');
  let inFence = false;
  const repaired = lines.map((line) => {
    if (/^\s*(`{3,}|~{3,})/.test(line)) inFence = !inFence;
    if (inFence || (line.match(/\*\*/g) || []).length % 2 === 0) return line;

    // Bold markers spanning prose lines are malformed Markdown. Removing only
    // the unmatched markers preserves the prose without styling whole sections.
    counts.danglingBold += (line.match(/\*\*/g) || []).length;
    return line.replace(/\*\*/g, '').replace(/^(\s*)-\s+-\s+/, '$1- ');
  });

  return repaired.join('\n')
    .replace(/\*\*([^*\n]*?)\*\*/g, (_match, inner: string) => {
      const trimmed = inner.trim();
      if (trimmed !== inner) counts.boldSpacing++;
      return `**${trimmed}**`;
    })
    .replace(/[\u2014\u2013\u201c\u201d\u2018\u2019\u2026\u200b\ufeff]/g, (character) => {
      counts.typography++;
      return typographyReplacements[character];
    })
    .replace(/^\*\*(Pros|Cons|FAQ|Overview|Key Takeaways|Summary|Conclusion|Steps|Requirements)\*\*\s*$/gm, (_match, heading: string) => {
      if (pseudoHeadings.has(heading)) counts.pseudoHeadings++;
      return `## ${heading}`;
    })
    .replace(/[ \t]+$/gm, (whitespace) => {
      counts.trailingWhitespace++;
      return '';
    });
}

function normalizeFaqQuestions(content: string, counts: ChangeCounts): string {
  let inFaq = false;

  return content.split('\n').map((line) => {
    if (/^## (?:FAQ|Frequently Asked Questions)/i.test(line)) {
      inFaq = true;
      return line;
    }
    if (inFaq && /^## /.test(line)) {
      inFaq = false;
      return line;
    }
    if (!inFaq || !/^### /.test(line)) return line;

    const heading = line.replace(/^### /, '').trim();
    if (!questionStart.test(heading) || heading.endsWith('?')) return line;
    counts.faqQuestions++;
    return `${line.trimEnd()}?`;
  }).join('\n');
}

function splitFrontmatter(raw: string): { prefix: string; content: string } {
  const match = raw.match(/^(---\r?\n[\s\S]*?\r?\n---)(?:\r?\n){0,2}([\s\S]*)$/);
  if (!match) return { prefix: '', content: raw };
  return { prefix: `${match[1]}\n\n`, content: match[2] };
}

const counts: ChangeCounts = {
  files: 0,
  boldSpacing: 0,
  danglingBold: 0,
  typography: 0,
  pseudoHeadings: 0,
  asciiDiagrams: 0,
  referenceDumps: 0,
  trailingWhitespace: 0,
  inlineCodeFences: 0,
  faqQuestions: 0,
};

for (const file of fs.readdirSync(articlesDirectory).filter((name) => name.endsWith('.md')).sort()) {
  const filePath = path.join(articlesDirectory, file);
  const raw = fs.readFileSync(filePath, 'utf8');
  const { prefix, content } = splitFrontmatter(raw);
  const normalized = normalizeFaqQuestions(
    normalizeInlineFormatting(
      repairMultilineBold(
        repairInlineCodeFences(trimReferenceDumps(removeAsciiDiagrams(content, counts), counts), counts),
        counts,
      ),
      counts,
    ),
    counts,
  );

  if (normalized === content) continue;
  counts.files++;
  if (!dryRun) fs.writeFileSync(filePath, `${prefix}${normalized.trimEnd()}\n`, 'utf8');
}

console.log(JSON.stringify({ dryRun, ...counts }, null, 2));
