# White-background revision, October 21

The user requested a white background and more breathing room. All 162 upcoming images now use pure white, 64 px outer gutters, 28-32 px separation between blocks, and 44 px body text with increased line spacing. Source excerpts, headings and qualifications are separated instead of packed into dense black panels.

The full post text and calendar are retained. Image captions are shorter where they duplicated a title or screenshot, and publication alt text now describes the revised images.

## Image corrections

- Tallinn now uses **Toompea and Tallinn Old Town at sunset**, credited to **Kaupo Kalda / Visit Tallinn**. The official source is recorded in `assets/revision/photo-references.json`.
- Seven landmark photos, including Tallinn, retain their full source framing through `contain`.
- Country flags are compact identifiers. Visa and citizenship comparisons use separated labeled rows.
- The Solidity storage example uses equal-sized boxes representing 32 bytes each.
- The budget shortlist remains a cross-region selection; it is not labeled as Latin America.

## Checks

- All 162 revised images rendered with zero overflow, collisions, missing images or authored contrast failures.
- All 180 campaign images decoded successfully; the 18 published-history images retain their original hashes.
- All 27 revised contact sheets were visually reviewed at phone size after the white-background change.
- Gallery checks passed at 360, 390, 768 and 1440 px.
- The corrected Tallinn source and the seven contained landmark images were checked against their source artwork.

Current detailed results are in `assets/revision/validation.json` and `assets/render-checks.json`. The earlier October 20 reproducibility record documents the previous ivory version; current image hashes are in `image-manifest.json`.

Preview: `node social-assets/knowledge-threads-month/render-revision.mjs --serve --port=3103`, then open `http://127.0.0.1:3103/preview.html`.
