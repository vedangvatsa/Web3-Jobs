#!/usr/bin/env tsx
/**
 * Normalize stored grant copy: junk removal, markdown stripping, deduped headings, lead capitalization.
 *
 * Usage: npx tsx scripts/normalize-grants-catalog.ts [--apply]
 */
import fs from 'node:fs';
import path from 'node:path';
import type { GrantProgram } from '../src/types';
import { countStoredGrantWords } from '../src/lib/grant-editorial';

const GRANTS_PATH = path.join(process.cwd(), 'content/grants/grants.json');
const apply = process.argv.includes('--apply');

const JUNK_PARA =
  /^(?:published time:|url source:|markdown content:|title:|\!\[|<\/?(?:p|div|script)|\[learn more\]\(|blob:http|you signed in with another tab)/i;
const SIDEBAR_JUNK = /^(?:magazine:|related:|listen|watch|podcast|video:|source: youtube)/i;

const SPAM_SNIPPET =
  /camper van|nest pension|nissan nv200|heat exchanger|fine art insurance|carbon steel printing|recruitment is a vital component/i;

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/([^*\s])\*\*([^*]+)\*\*/g, '$1 $2')
    .replace(/(\w)\*\*(\w)/g, '$1 $2')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '$1 ($2)')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^\s*[-*•]\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanParagraph(text: string): string | null {
  let t = stripMarkdown(text);
  if (!t || t.length < 25) return null;
  if (JUNK_PARA.test(t)) return null;
  if (SIDEBAR_JUNK.test(t)) return null;
  if (/^\/\//.test(t) || /^image \d+$/i.test(t)) return null;
  if (SPAM_SNIPPET.test(t)) return null;
  const urlCount = (t.match(/https?:\/\//g) || []).length;
  if (urlCount >= 3 || (urlCount >= 2 && t.length < 400)) return null;
  if (/^\s*[A-Za-z0-9][^.]{0,40}\s[A-Za-z].*\(https?:\/\//.test(t) && urlCount >= 1 && t.length > 180) return null;
  return t;
}

function capitalizeLead(text: string): string {
  const t = text.trim();
  if (!t) return t;
  if (/^[a-z]/.test(t)) return t.charAt(0).toUpperCase() + t.slice(1);
  return t;
}

type Section = NonNullable<GrantProgram['sections']>[number];

function normalizeSections(sections: Section[] | undefined): Section[] | undefined {
  if (!sections?.length) return sections;
  const out: Section[] = [];

  for (const section of sections) {
    let heading = stripMarkdown(section.heading || 'Program overview')
      .replace(/\p{Extended_Pictographic}/gu, '')
      .trim();
    if (!heading) heading = 'Program overview';
    if (/^recent posts$/i.test(heading)) continue;

  let paragraphs = (section.paragraphs || [])
      .map(cleanParagraph)
      .filter((p): p is string => Boolean(p));
    let bullets = (section.bullets || [])
      .map(cleanParagraph)
      .filter((p): p is string => Boolean(p));
    const bulletSet = new Set(bullets.map((b) => b.toLowerCase()));
    paragraphs = paragraphs.filter((p) => !bulletSet.has(p.toLowerCase()));
    paragraphs = [...new Set(paragraphs.map((p) => p.toLowerCase()))].map(
      (key) => paragraphs.find((p) => p.toLowerCase() === key)!,
    );

    const prev = out.find((s) => s.heading === heading);
    if (prev) {
      prev.paragraphs.push(...paragraphs);
      prev.bullets = [...(prev.bullets || []), ...bullets];
      continue;
    }

    if (!paragraphs.length && !bullets.length) continue;
    out.push({
      heading,
      paragraphs,
      bullets: bullets.length ? bullets : undefined,
    });
  }
  return out.length ? out : sections;
}

function main() {
  const grants: GrantProgram[] = JSON.parse(fs.readFileSync(GRANTS_PATH, 'utf-8'));
  let touched = 0;

  for (const grant of grants) {
    const before = JSON.stringify(grant.sections) + grant.description;
    grant.description = capitalizeLead(stripMarkdown(grant.description || ''));
    if (grant.description.length > 500) {
      grant.description = `${grant.description.slice(0, 497)}...`;
    }
    grant.sections = normalizeSections(grant.sections);
    if (grant.descriptionSource) {
      grant.descriptionSource.wordCount = countStoredGrantWords(grant);
    }
    const after = JSON.stringify(grant.sections) + grant.description;
    if (before !== after) touched++;
  }

  console.log(`Normalized ${touched}/${grants.length} grants`);
  if (apply) {
    fs.writeFileSync(GRANTS_PATH, `${JSON.stringify(grants, null, 2)}\n`);
    console.log(`Wrote ${GRANTS_PATH}`);
  } else {
    console.log('Dry run — pass --apply to write');
  }
}

main();