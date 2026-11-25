import { parseJobPostingDate } from '../../src/lib/job-age-policy.mjs';

/** Normalize ATS posting timestamps into ISO strings that pass job-age parsing. */
export function normalizeIngestIsoDate(raw: string | undefined | null): { date: string; verified: boolean } {
  const trimmed = String(raw ?? '').trim();
  if (!trimmed) return { date: '', verified: false };

  const candidates = [
    trimmed,
    trimmed.replace(/\.(\d{1,9})\+0000$/, '.$1+00:00'),
    trimmed.replace(/\+0000$/, 'Z'),
  ];

  for (const candidate of candidates) {
    const viaPolicy = parseJobPostingDate(candidate);
    if (Number.isFinite(viaPolicy)) {
      return { date: new Date(viaPolicy).toISOString(), verified: true };
    }
    const ms = Date.parse(candidate);
    if (Number.isFinite(ms)) {
      const iso = new Date(ms).toISOString();
      if (Number.isFinite(parseJobPostingDate(iso))) {
        return { date: iso, verified: true };
      }
    }
  }

  return { date: '', verified: false };
}

/** Workday list rows often expose relative ages: "Posted 7 Days Ago". */
export function normalizeWorkdayPostedOn(raw: string | undefined | null, now = Date.now()): {
  date: string;
  verified: boolean;
} {
  const text = String(raw ?? '').trim();
  const match = /posted\s+(\d+)\s+days?\s+ago/i.exec(text);
  if (match) {
    const days = Number(match[1]);
    if (Number.isFinite(days) && days >= 0 && days <= 30) {
      const posted = new Date(now - days * 24 * 60 * 60 * 1000);
      return { date: posted.toISOString(), verified: true };
    }
  }
  return normalizeIngestIsoDate(text);
}