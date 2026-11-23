import type { GrantProgram } from '@/types';

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

/** Maps stored source sections to the detail layout. No synthetic grant copy. */
export function generateGrantEditorial(grant: GrantProgram): GrantEditorial {
  const eco = grant.ecosystem && grant.ecosystem !== 'Other' && grant.ecosystem !== 'Global' ? grant.ecosystem : null;

  const sections: GrantEditorialSection[] =
    grant.sections?.map((s) => ({
      heading: s.heading,
      paragraphs: s.paragraphs,
      bullets: s.bullets?.length ? s.bullets : undefined,
    })) ?? [];

  const keyHighlights = [
    { label: 'Provider', value: grant.provider },
    { label: 'Amount', value: grant.amount || 'See official program' },
    { label: 'Category', value: grant.category },
    { label: 'Type', value: grant.type },
    { label: 'Deadline', value: grant.deadline || 'See official program' },
    ...(eco ? [{ label: 'Ecosystem', value: eco }] : []),
  ];

  return {
    summaryLead: grant.description.trim(),
    sections,
    keyHighlights,
    hasSourceBody: sections.length > 0,
  };
}