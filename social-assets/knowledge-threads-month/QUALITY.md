# Replacement-image quality record

**October 21 update:** the user-requested white-background, spacious revision supersedes the visual treatment described below. See `WHITE-REVISION.md` and the current validation JSON. All 162 revised masters pass the white-background, 64 px gutter, readable-type and collision checks; the Tallinn image is corrected.

October 20, 2026 revision. Current machine-readable results are in `assets/revision/validation.json`; `assets/render-checks.json` covers the complete 180-entry manifest.

## Delivery checks

| Check | Evidence |
| --- | --- |
| Replacement batch | 27 threads, six posts each, 162 replacement JPEG masters |
| Complete campaign | 180 masters retained, including 18 frozen published images |
| Image format | All 180 fully decoded; 1200 × 1500, sRGB JPEG, 4:4:4 sampling |
| File size | Largest master below 357,000 bytes; all below 5,000,000 bytes |
| Integrity | 180 unique image SHA-256 hashes; current per-post hashes checked against the final manuscript |
| Reproducibility | All 162 replacement masters were rendered again and matched their existing JPEG hashes byte-for-byte; see `assets/revision/reproducibility.json` |
| Layout | Zero overflow, out-of-container text, text/text or text/image collisions across the replacements |
| Authored contrast | Zero failures at the computed 4.5:1 threshold |
| Mobile body text | Minimum authored body size 44 px on the master, equivalent to 14.3 px at 390 px |
| Source-image proof | 146 used source assets rehashed; 54 screenshot crops checked against their exact parent pixels |
| Pixel-text checks | 15 original interview questions and five captured lesson paragraphs matched with OCR |
| Source coverage | 156 masters use actual captures, photos or native flags; N02 is six labeled historical aggregate graphics |
| Captions | Local app captures, live public captures, authored summaries, fictional examples and dated metrics are identified |
| Alt descriptions | All 180 descriptions are 100-1000 characters; the published 18 retain their original descriptions |
| Contact sheets | 27 replacement sheets generated; three published sheets and five original mobile sheets retain their hashes |
| Preview | Exact post text and calendar dates for all 180 entries; 27 future threads first, three published threads labeled as history |

Source-image metadata and footer credits can be smaller than the teaching text. The substantive results, quantities, units and essential conditions were reviewed at 390 px. Complete tall source previews are linked in the gallery rather than squeezed into illegible full-document thumbnails.

## Frozen prefix

`assets/revision/protected-prefix.json` remains the authority for C01/E01/N01. Validation checks:

- Exact thread objects and original calendar entries.
- All 18 image byte hashes.
- All 18 original manifest entries, including alt text, source URLs and asset paths.
- The three original contact sheets and five existing mobile sheets against the pre-render baseline.

The current manuscript is checked dynamically against `image-manifest.json`, including each post's own hash. The obsolete whole-manuscript hardcoded hash was removed from `validate.mjs`.

## Actual visual review

All 27 replacement contact sheets were opened with the image read tool during production, together with individual 390 px samples and actual desktop/mobile gallery screenshots. Review covered every replacement thread and the source-specific conditions.

Corrections found by visual inspection:

1. The runtime Consensus Hong Kong 2027 cover visibly showed 2026 dates. The campaign now uses a genuine current organizer date-panel capture. The runtime original is unchanged.
2. A Slither question capture shifted while the accordion animation settled. It was recaptured after waiting for animations; its actual question pixels now pass OCR.
3. The original Taipei image visibly depicts Tokyo. A real Travel Taipei skyline photograph replaces its campaign copy.
4. The original Cartagena image is an uninformative close-up of wooden boats. A credited ProColombia historic-center photograph replaces its campaign copy.
5. Invoice notes and the Foundry code excerpt received tighter or narrower real captures so their substantive text remains readable at mobile width.

Photo exceptions, original file hashes, download hashes and source URLs are recorded in `assets/revision/photo-references.json`. Capture origins and source revisions are recorded in the revision capture manifests.

## Gallery checks

`validate.mjs` checks the real browser page at 360, 390, 768 and 1440 px:

- No horizontal overflow or broken loaded images.
- All 180 actual post texts and all publication dates match the source JSON.
- All 30 thread anchors resolve; all master and contact-sheet URLs return HTTP 200 locally.
- All 180 source/alt disclosures open and close.
- The 390 px review button and disclosures work by keyboard, with visible focus indicators.
- Expanded source URLs wrap on mobile.
- Loading, empty and failed-manifest states have explicit text.
- Normal use produces zero page or console errors.

Actual browser captures: `assets/revision/gallery-desktop.png` and `assets/revision/gallery-mobile.png`.

## Antislop delivery gate

The approved DURING mode and ENERGY 2 / RHYTHM 3 / MOTION 1 direction are documented in `DESIGN.md`.

| Gate | Result and evidence |
| --- | --- |
| R-02 | PASS: authored labels use plain punctuation; editorial text is read unchanged. |
| R-03 | PASS: per-master DOM bounds/collision checks and all four gallery widths pass. |
| R-17 | PASS: displayed metrics come from the final post visuals or protected source data; source and post hashes are recorded. |
| R-18 | PASS: no testimonials; resume and invoice identities are explicitly fictional practice examples. |
| R-23 | PASS: approved brand assets reused, source assets recorded, native flags identify countries. |
| R-24 | PASS: all 30 navigation destinations exercised. |
| R-25 | PASS: authored contrast computed at 4.5:1; substantive source pixels reviewed at mobile size. |
| R-26 | PASS: master links, contact sheets, review toggle and 180 disclosures exercised. |
| R-27 | PASS: loading, empty and failed-manifest states present; latter two tested through intercepted responses. |
| R-28 | PASS: no template FAQ. |
| R-32 | PASS: native keyboard controls and explicit high-contrast focus outlines. |
| R-33 | PASS: source edited with patches; scripts generate image/data outputs without rewriting app code or screenshot DOM text. |
| R-34 | PASS: fixed brand palette; no incomplete alternate theme. |
| R-35 | PASS: full batch rendered and validated, with contact sheets and browser screenshots actually opened. |
| R-36 | PASS: no fabricated outcomes, vacancies, credentials, interfaces or test logs. |
| R-37 | PASS: existing user-approved brand direction applied. |
| R-38 | PASS: source pixels are genuine; added summaries, examples and comparisons are identified. |
| R-01 / R-04 / R-06 | PASS: approved ink/ivory/green, existing Inter, real flag identifiers; purposes written in DESIGN.md. |
| R-07 / R-08 / R-09 | PASS: rules separate data rows; scope labels identify actual units and conditions. No ornamental grid or badges. |
| R-10 / R-12 / R-13 | PASS: no authored glass, decorative shadows or glows. Native source UI remains unaltered. |
| R-14 / R-19 / R-22 | PASS: source-specific layouts, static masters, relevant actual photos and result screenshots. |
| Liveliness | PASS: amounts, photos and source results lead; layout varies by source; restrained green marks scope or comparison. |
| C-1 / R-31 | PASS: major decisions and exceptions have written reasons. |
| C-2 / C-4 | PASS: interaction and responsive-state checks recorded in validation.json. |
| C-3 / C-5 | PASS: every master maps to its actual post, source images and fact sources. |
| R-05 / R-11 | PASS: comparisons, photo rows, contained posters and readable excerpts follow the content. |
| R-15 / R-16 | PASS: gallery actions name their destination; no generic marketing filler added. |
| R-20 / R-21 / R-29 / R-30 | PASS: existing Hashtag Web3 identity and palette; no unrelated product clone or theme. |

## Reproduce

```bash
node social-assets/knowledge-threads-month/prepare-revision.mjs
node social-assets/knowledge-threads-month/render-revision.mjs --workers=3
node social-assets/knowledge-threads-month/validate.mjs
node social-assets/knowledge-threads-month/render-revision.mjs --serve --port=3103
```

Preview: <http://127.0.0.1:3103/preview.html>. Full file descriptions and source boundaries are in `REVISION.md`.
