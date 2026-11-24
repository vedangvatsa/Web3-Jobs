# Event & job detail copyedit

## Events

- **Library:** `src/lib/event-stored-description-polish.ts` (persisted scrape cleanup + conservative line edit)
- **Apply:** `npx tsx scripts/apply-event-full-editorial-polish.ts --apply`
- **Grammar-reviewed IDs:** `scripts/patch-event-grammar-reviewed-descriptions.ts --apply` (runs after polish; preserves `grammar-review-2026-10-20.json` corrections)
- **Status:** `content/events/copyedit-status.json`
- **Test:** `scripts/test-event-editorial-polish.ts` (included in `npm run test:detail-formatting`)

Events stay source-backed: no synthetic padding. Grammar-audited records use conservative cleanup only.

## Jobs

- **Library:** `src/lib/job-description-polish.ts` (sanitize + text-node line edit)
- **Apply:** `npx tsx scripts/apply-job-full-editorial-polish.ts --apply`
- **Status:** `content/jobs/copyedit-status.json`
- **Test:** `scripts/test-job-editorial-polish.ts` (included in `test:detail-formatting` and `test:job-page-content`)

Shared line edits live in `src/lib/catalog-line-editorial.ts` (also used by grant copyedit).