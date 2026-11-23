/** Body copy before the structured "## Event details" block (listing prose gate). */
export function descriptionProseBody(description: string): string {
  return (description.split(/\n## Event details\b/i)[0] || description).trim();
}

/** Word count that treats CJK characters as words (Latin tokens + Han/kana). */
export function countProseWords(description: string): number {
  const body = descriptionProseBody(description);
  const cjk = (body.match(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/gu) || []).length;
  const latin = body
    .replace(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/gu, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return latin + cjk;
}