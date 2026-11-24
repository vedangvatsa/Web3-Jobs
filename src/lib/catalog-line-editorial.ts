/**
 * Conservative line-level copy edits shared by grants, events, and jobs.
 */
import { isGrammarJunkParagraph, normalizeGrantGrammarLine } from './grant-grammar';

const FILLER =
  /^(?:In fact,|We warmly welcome|It is worth noting that|We are thrilled to announce|Don't forget that|Please note that|As mentioned above,)\s+/i;

/** Light grammar / phrasing pass on a single line or paragraph fragment. */
export function catalogLineEdit(text: string): string {
  let line = normalizeGrantGrammarLine(text.trim());
  if (!line || isGrammarJunkParagraph(line)) return '';
  line = line.replace(FILLER, '');
  line = line.replace(/\s+([\u2014\u2013])\s+/g, '. ');
  line = line.replace(/\b(?:click here to)\b/gi, 'visit the official page to');
  return line.trim();
}

export function countWords(text: string): number {
  const stripped = text.replace(/[#*_`~\[\]()]/g, ' ').replace(/<[^>]+>/g, ' ');
  return stripped.split(/\s+/).filter(Boolean).length;
}

/** Preserve URLs and numeric tokens from the original copy. */
export function catalogIntegrityOk(before: string, after: string): boolean {
  const numbers = (s: string) => s.match(/\d+(?:[.,:/]\d+)*/g) || [];
  const urls = (s: string) => s.match(/https?:\/\/[^\s)\]]+/g) || [];
  if (JSON.stringify(numbers(after)) !== JSON.stringify(numbers(before))) return false;
  if (JSON.stringify(urls(after)) !== JSON.stringify(urls(before))) return false;
  const beforeWords = countWords(before);
  const afterWords = countWords(after);
  if (afterWords < beforeWords - 8) return false;
  return true;
}