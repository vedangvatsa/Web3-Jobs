# Grant page human copyedit

## Voice
- Third-person program description; neutral and direct (not marketing hype).
- Short paragraphs (2–4 sentences). Clear H2-style section headings.
- Preserve numbers, dates, and eligibility rules from the official program — do not invent funding amounts.

## Structure
- `description`: 2–3 sentences, standalone summary (capitalize first word).
- Sections: **Program overview** → **Eligibility or What gets funded** → **How to apply** (add **FAQ** only when official source has paired Q&A).

## Remove
- Nav scrape, image captions, duplicate lead repeated verbatim in sections, fused FAQ lines, social promo blocks (Discord/Telegram/WhatsApp CTAs).

## Keep
- Official URLs, form links, milestone wording when verified from program materials.

## Catalog polish (v2)
- `npx tsx scripts/apply-grant-full-editorial-polish.ts --apply` restructures every grant into guide-style sections, line-edits prose, then re-applies curated repairs.
- `content/grants/copyedit-status.json` records `human-editorial-polish-v2` when the pipeline has run.
- Regression: `npx tsx scripts/test-grant-editorial-polish.ts` (≥150 words, Program overview + How to apply, no scrape junk).