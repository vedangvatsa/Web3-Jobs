# Practical whole-site image revision

The final `content.json` and `calendar.json` drive 27 future threads, six images each. The renderer produces 162 replacement 1200 × 1500 sRGB JPEGs and retains the 18 published C01/E01/N01 images. The manifest continues to contain all 180 entries.

## Preview and reproduce

Run from the repository root:

```bash
node social-assets/knowledge-threads-month/render-revision.mjs --serve --port=3103
```

Open <http://127.0.0.1:3103/preview.html>. The gallery shows actual post text, scheduled dates, full-size masters, contact sheets, alt descriptions, source URLs, unretouched source crops and complete source previews. The 390 px review button fixes the image width on larger screens.

Render from the saved captures and original repository photos/posters:

```bash
node social-assets/knowledge-threads-month/prepare-revision.mjs
node social-assets/knowledge-threads-month/render-revision.mjs --workers=3
node social-assets/knowledge-threads-month/validate.mjs
```

Render selected threads or posts with `--only=C02,E07-06`. The renderer rejects published-history IDs and verifies the frozen prefix before and after writing. `--audit-only` checks the layouts without replacing masters. `--verify-reproducible` compares newly rendered bytes to the existing manifest without overwriting masters or the manifest.

The scripts use the installed Playwright and Sharp packages and the supplied cached Chromium 1228 executable. Each master gets a fresh browser context and settled fonts/images. Software rasterization, sRGB and deterministic compositor settings avoid GPU-dependent pixel variations. Exact versions, launch arguments and JPEG settings are saved in the manifest. The pixel-text validation uses the installed Tesseract CLI. No package installation is required.

## Files

| Files | Purpose |
| --- | --- |
| `render-revision.mjs`, `revision-lib.mjs` | Bounded local server, frozen-prefix guards, parallel renderer, manifests, contact sheets and 390 px samples |
| `boards-revision.html`, `boards-revision.css`, `boards-revision.mjs` | Content-specific image layouts using real source assets |
| `prepare-revision.mjs` | Byte-identical photo/poster copies, native flags and lossless, documented screenshot crops |
| `capture-revision.mjs` | Additional readable citizenship, interview and lesson captures; browser-native font preference, no DOM text or style replacement |
| `capture-event-revision.mjs` | Real Consensus Hong Kong 2027 organizer date-panel capture |
| `capture-invoice-detail.mjs` | Same fictional invoice scenario with a narrow, readable original Notes crop |
| `fetch-photo-revision.mjs`, `assets/revision/photo-references.json` | Official-tourism replacement photos and original-download hashes for two unsuitable directory images |
| `preview.html`, `preview-revision.css`, `preview-revision.mjs` | Post-text review gallery, dates, sources, keyboard controls and published history |
| `images/*.jpg`, `image-manifest.json`, `ALT-TEXT.md` | 180 masters and descriptions; 162 replacements, 18 frozen |
| `contact-sheets/{C02..C10,E02..E10,N02..N10}.jpg` | 27 replacement sheets, each showing all six images at 390 px |
| `assets/revision/mobile/*.jpg` | All 162 individual 390 px review samples |
| `assets/render-checks.json` | Checks for all 180 images; original 18 records retained |
| `assets/revision/validation.json`, `assets/validation.json` | Decoding, size, hashes, exact source pixels, layout, source coverage and gallery evidence |
| `assets/revision/source-credits.json`, `assets/revision/capture-credits.json` | Per-source attribution, actual capture origin, hashes and extraction provenance |
| `assets/revision/capture-ocr.json` | Original-question and lesson-paragraph matches against actual screenshot pixels |
| `assets/revision/reproducibility.json` | A complete second render matched all 162 replacement JPEG hashes byte-for-byte |
| `assets/revision/frozen-visual-baseline.json` | Original 18 manifest entries and protected sheet hashes, recorded before rendering |
| `assets/revision/gallery-{desktop,mobile}.png` | Actual browser screenshots of image + post-text review |

## Source decisions

- The supplied `tool-captures.json` and `learning-captures.json`, their scripts and their image files are read-only inputs. Their exact scenario inputs, results and source revisions remain available.
- The 31 referenced city slugs use 29 mapped original display assets and two official-tourism replacements. Three additional directory photos illustrate legal destinations. Copies are hash-verified against their source files.
- The mapped Taipei image visibly depicts Tokyo's Hotel Gracery/Godzilla district. Its campaign copy uses a real Taipei skyline photograph from Travel Taipei's Xiangshan page. The Cartagena close-up of wooden boats is replaced with ProColombia's actual historic-center photograph. Repository originals remain untouched; original download hashes, source URLs, credits and replacement reasons are in `photo-references.json`.
- Nine runtime event cover assets are used unchanged. The tenth runtime cover, keyed to Consensus Hong Kong 2027, visibly said February 10-12, 2026. The original file remains untouched; the replacement master uses a real current organizer date panel showing February 1-3, 2027 and the February 2-3 exhibition. See `event-captures.json`.
- Screenshots and photos retain their actual pixels. Every derived screenshot records its rectangle and parent SHA-256. The validator compares decoded crop pixels against that exact parent rectangle.
- N02 is six explicitly authored historical aggregate charts. It contains no vacancy screenshots or employer logos.
- Visa/passport images use actual directory photos or native country flags plus clearly authored official-source rules. No outdated `/visas` card is used as evidence for updated rules.
- CBI figures distinguish contributions, property, bond/deposit capital, fees and financial-resource declarations. C02 includes Jordan in JOD. There is no cross-currency price-range graphic.
- E03.6 and C08.6 show the real Builder and Analyst role lists. C08.3 says distinct `tx.from` transaction senders. E07.6 compares junior/senior model gaps.
- Tall complete resume/invoice previews are linked as original references in the gallery. Their masters use explicitly labeled, enlarged excerpts rather than shrinking a whole document until its text is unreadable.

## Visual review

All 27 replacement contact sheets and individual 390 px examples were opened with the image read tool. Review included salary assumptions/results, two-country currency comparisons, city ranking rows and paired photos, all three interview-question threads, family/fee conditions, resume before/after examples, event artwork, corrected Consensus dates, actual Foundry code, invoice totals/notes, and the mobile/desktop gallery screenshots.

The review caught a shifted Slither screenshot after an accordion animation. It was recaptured after waiting for animations, then checked against the source question with OCR. OCR checks all 15 question crops and five captured lesson paragraphs. One isolated `UI`/`Ul` OCR glyph ambiguity is normalized; words and numbers otherwise match the full source text.

`SOURCES.md` now lists the current per-thread citations and explains the model, reference-data and practice-example labels. Current facts and citations also remain in the manuscript's per-post mappings and the protected revision source data. The visual pipeline does not rewrite editorial files.

## Publication integration

The publisher supports the salary calculator, career quiz, learning library and event-page links in addition to the existing resources. All 22 platform-specific link destinations were checked. Publication alt text uses the descriptions of the finished images.

The two event threads record local dates and material details for their ten events. The selected thread is checked against the current event catalog before preflight/publication; read-only reconciliation remains available. The local-date check respects explicit UTC offsets when a separate IANA timezone is absent.

The 39 offline publishing tests pass, including claimed-date preservation, provider receipt recovery, event changes, platform links and image verification. `assets/revision/publication-validation.json` records the final manuscript hash and confirms that metadata synchronization left all 162 reviewed masters byte-identical.
