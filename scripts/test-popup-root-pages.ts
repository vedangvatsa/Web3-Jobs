#!/usr/bin/env tsx
import assert from 'node:assert/strict';
import { classifySlug } from '../src/lib/slug-classifier';
import { resolvePopupForPathSegment } from '../src/lib/popup-seo';
import { getPopupSlugs } from '../src/lib/popups';

const samples = ['amagi', '4seas', 'arc', 'ns'];

for (const slug of samples) {
  assert.equal(classifySlug(slug), 'popup', `classifySlug(${slug})`);
  const popup = resolvePopupForPathSegment(slug);
  assert.ok(popup, `resolvePopupForPathSegment(${slug})`);
  assert.equal(popup!.slug, slug, `canonical slug for ${slug}`);
}

assert.ok(getPopupSlugs().length >= 50, 'popup catalog size');

console.log(`[test-popup-root-pages] OK — ${samples.length} sample popups resolve at site root.`);
