/**
 * Authoritative guard rules for identifying general applications, talent pools,
 * and ATS placeholder / test job postings that must never be published as standalone roles.
 */

const GENERAL_APP_REGEX = /(general application|general interest|general opening|general opportunity|expression of interest|talent community|talent pool|talent network|future opportunities|future consideration|future builders|future roles|join our talent|dream job|spontaneous application|open position|open application|speculative application|unsolicited application|general pool|general submission|register your interest|submit your (?:cv|resume)|create your own role)/i;

const PLACEHOLDER_TITLE_PATTERNS = [
  'default template',
  'new job template',
  'test job',
  '(sample)',
  'test',
  'testextrenal',
  '[template] default template',
];

export function isGeneralOrPlaceholderJobTitle(title: string | null | undefined): boolean {
  if (!title) return true;
  const t = title.toLowerCase().trim();

  if (PLACEHOLDER_TITLE_PATTERNS.some((p) => t.includes(p) || t === p)) {
    return true;
  }

  return GENERAL_APP_REGEX.test(t);
}
