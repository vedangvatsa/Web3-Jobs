# Reader-facing copy revision

The current manuscript is `content.json`; review it with `preview.html` and use `exports/manifest.json` for platform packages. Earlier prose reports describe prior campaign versions.

- Revised the 25 future threads dated October 23 through November 16: 150 posts and 150 image masters.
- Preserved the first five claimed/published threads, 30 image declarations, and historical C02/E02 export packages. The additional immutable snapshot is `assets/revision/published-prefix-2026-10-22.json`.
- Removed production notes from future copy, image text, captions and alt text. Salary estimates, illustrative examples, source dates and eligibility conditions remain explicit.
- Retained 44 px body text, 1.4 line height and paragraph spacing. Adjusted photo/poster heights to fit without reducing type size.
- Recaptured genuine resume/invoice examples; no replacement of website text in the DOM.
- `scripts/social/public-copy-guard.mjs` rejects internal wording, unreadable paragraphs and stale future image bytes at validation and provider mutation boundaries. Historical receipts preserve their original bytes and asset pins.

## Verification

- Render: 150 masters; zero layout issues, zero contrast failures.
- Master validation: all 180 images decode; 30 protected declarations preserved; 133 source hashes and 48 exact-pixel crops verified.
- Platform validation: 27 six-page documents, 162 embedded original images, 162 Instagram images and 27 ZIPs checked. The two historical export packages were preserved.
- Gallery checks: 360, 390, 768 and 1440 px; no horizontal overflow or broken loaded images.
- 125 focused social tests and three direct-publisher tests passed; TypeScript and workflow lint passed after correcting reusable-workflow input typing.

Publication remains governed by the existing date window and immutable per-platform receipts. This revision does not send or backfill posts.
