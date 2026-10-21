# Platform-ready carousel files

Run `node social-assets/knowledge-threads-month/export-platforms.mjs` from the repository root to regenerate the 27 packages. It verifies the source image and post hashes before writing exports.

- LinkedIn: one six-page PDF plus cover and caption per topic. Pages retain the original 4:5 image ratio.
- Instagram: six numbered 1080 x 1350 sRGB JPEGs, caption and alt descriptions, also bundled as a ZIP.
- X and Threads: original six-post text/image order with platform-specific links.
- Facebook, Telegram and Bluesky: prepared text/image payloads; these are not additional enabled publishing targets.

The exporter does not publish. Native LinkedIn/Instagram publication is handled by the separate knowledge-carousel workflow, within the existing daily window and with immutable per-platform receipts. A missed date is not backfilled.
