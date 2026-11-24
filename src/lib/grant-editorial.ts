import type { GrantProgram } from '@/types';
import type { EventEditorialArticle } from '@/lib/events';
import { normalizeGrantSections } from '@/lib/grant-content-cleanup';
import { stripThirdPartyCommunityPromo } from '@/lib/community-link-sanitizer';

export interface GrantEditorialSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface GrantEditorial {
  summaryLead: string;
  sections: GrantEditorialSection[];
  keyHighlights: Array<{ label: string; value: string }>;
  hasSourceBody: boolean;
}

/** Minimum stored words (listing lead + fetched sections) required to publish a grant detail page. */
export const GRANT_DETAIL_MIN_WORDS = 120;

function normalizeText(text: string): string {
  return text.replace(/\s+/g, ' ').trim().toLowerCase();
}

export function countGrantEditorialWords(summaryLead: string, sections: GrantEditorialSection[]): number {
  const text = [
    summaryLead,
    ...sections.flatMap((section) => [...(section.paragraphs || []), ...(section.bullets || [])]),
  ].join(' ');
  return text.split(/\s+/).filter(Boolean).length;
}

function dropDescriptionDuplicateSections(
  sections: GrantEditorialSection[],
  description: string,
): GrantEditorialSection[] {
  const desc = normalizeText(description);
  return sections.filter((section) => {
    if (section.bullets?.length) return true;
    if (section.paragraphs?.length !== 1) return true;
    return normalizeText(section.paragraphs[0]) !== desc;
  });
}

/** Words in grants.json only (no generated catalog padding). */
export function countStoredGrantWords(grant: GrantProgram): number {
  const summaryLead = grant.description.trim();
  const sections: GrantEditorialSection[] =
    grant.sections?.map((s) => ({
      heading: s.heading,
      paragraphs: s.paragraphs,
      bullets: s.bullets?.length ? s.bullets : undefined,
    })) ?? [];
  return countGrantEditorialWords(summaryLead, sections);
}

/** Maps stored source sections to the detail layout; no synthetic padding. */
export function generateGrantEditorial(grant: GrantProgram): GrantEditorial {
  const eco = grant.ecosystem && grant.ecosystem !== 'Other' && grant.ecosystem !== 'Global' ? grant.ecosystem : null;
  const summaryLead = stripThirdPartyCommunityPromo(grant.description.trim());

  let sections: GrantEditorialSection[] =
    grant.sections?.map((s) => ({
      heading: s.heading,
      paragraphs: s.paragraphs,
      bullets: s.bullets?.length ? s.bullets : undefined,
    })) ?? [];

  sections = dropDescriptionDuplicateSections(sections, summaryLead);
  sections = normalizeGrantSections(sections);

  const storedWords = countGrantEditorialWords(summaryLead, sections);
  const hasFetchedSections = sections.length > 0;

  const keyHighlights = [
    { label: 'Provider', value: grant.provider },
    { label: 'Amount', value: grant.amount || 'See official program' },
    { label: 'Category', value: grant.category },
    { label: 'Type', value: grant.type },
    { label: 'Deadline', value: grant.deadline || 'See official program' },
    ...(eco ? [{ label: 'Ecosystem', value: eco }] : []),
  ];

  return {
    summaryLead,
    sections,
    keyHighlights,
    hasSourceBody: hasFetchedSections && storedWords >= GRANT_DETAIL_MIN_WORDS,
  };
}

/** Shape grant editorial for {@link EventGuideContent} (shared event detail typography). */
export function grantEditorialToEventArticle(editorial: GrantEditorial): EventEditorialArticle {
  return {
    summaryLead: editorial.summaryLead,
    sections: editorial.sections.map((section) => ({
      heading: section.heading,
      content: [
        ...section.paragraphs,
        ...(section.bullets?.length
          ? [section.bullets.map((item) => `• ${item}`).join('\n')]
          : []),
      ],
    })),
    descriptionStatus: editorial.hasSourceBody ? 'source-backed' : 'unavailable',
  };
}