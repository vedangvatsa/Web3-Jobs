/** Grammar / typography fixes for grant stored copy and render pipeline. */

const TYPO_MAP: Array<[RegExp, string]> = [
  [/\bprogramable\b/gi, 'programmable'],
  [/\bperformance based\b/gi, 'performance-based'],
  [/\bmilestone based\b/gi, 'milestone-based'],
  [/\bnon dilutive\b/gi, 'non-dilutive'],
  [/\bnon crypto\b/gi, 'non-crypto'],
  [/\bMajor Payments Institu\b/g, 'Major Payments Institution'],
  [/\bLearn moreLearn more\b/g, 'Learn more'],
];

export function isGrammarJunkParagraph(text: string): boolean {
  const t = text.trim();
  return /^!Image\s*\d*:/i.test(t) || /^blob:https?:/i.test(t);
}

export function normalizeGrantGrammarLine(text: string): string {
  if (!text?.trim()) return text;

  let line = text.normalize('NFKC');
  line = line.replace(/\u00a0/g, ' ').replace(/ {2,}/g, ' ');

  for (const [re, rep] of TYPO_MAP) line = line.replace(re, rep);

  line = line.replace(/\s+([,.;:!?])/g, '$1');
  line = line.replace(/\b(\w+)\s+\1\b/gi, '$1');
  line = line.replace(/opens in a new tab(?=[a-z])/gi, 'opens in a new tab ');
  line = line.replace(/(tion|nce|ment|ear|ude|ate|ary)([A-Z][a-z])/g, '$1 $2');

  const parts = line.split(/(https?:\/\/[^\s]+)/g);
  line = parts
    .map((part) => {
      if (part.startsWith('http')) return part;
      return part
        .replace(/([?])([A-Z])/g, '$1 $2')
        .replace(/([?!.])([A-Z])/g, '$1\n\n$2');
    })
    .join('');

  return line.trim();
}

export function grammarIssuesInLine(text: string): string[] {
  const issues: string[] = [];
  const t = text.trim();
  if (!t) return issues;

  const parts = t.split(/(https?:\/\/[^\s]+)/g);
  for (const part of parts) {
    if (part.startsWith('http')) continue;
    if (/\?[A-Z]/.test(part)) issues.push('question-answer-fusion');
    if (/opens in a new tab(?=[a-z])/i.test(part)) issues.push('tab-fusion');
  }

  if (/\bprogramable\b/i.test(t)) issues.push('typo-programable');
  if (/\bperformance based\b/i.test(t)) issues.push('compound-performance-based');
  if (/Learn moreLearn/i.test(t)) issues.push('scraped-heading-fusion');
  if (isGrammarJunkParagraph(t)) issues.push('image-scrape-junk');
  if (/\bMajor Payments Institu\b/.test(t)) issues.push('truncated-word');
  if (/\b(the|a|an)\s+\1\b/i.test(t)) issues.push('duplicate-article');

  return [...new Set(issues)];
}