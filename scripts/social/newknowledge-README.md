# Daily knowledge image threads

One six-post image thread per day on X and Threads, from **18 October through 16 November 2026**, inclusive. The slot starts at **11:30 UTC / 17:00 IST**. Provider mutations are allowed until, but not including, 12:30 UTC on that date.

`social-assets/knowledge-threads-month/calendar.json` binds dates to the manuscript's sequence 1 through 30. A missed date stays missed. A manual publish dispatch uses the same date and clock checks.

## Workflow

`refresh-jobs-cache.yml` has a separate knowledge-window output and a `knowledge-threads` job that needs only `gate`. The existing external dispatch and backup cron trigger it in the afternoon. The knowledge planner excludes website recovery, news-only, dry-run and diagnostic modes. A planner failure does not change existing publisher decisions.

The reusable `.github/workflows/newknowledge-threads.yml` serializes knowledge runs. Each platform has a separate receipt under:

```text
scripts/social/newknowledge-receipts/knowledge-threads-month-2026-10-17/<date>-<platform>.json
```

The date/platform key admits one thread. A failed platform does not prevent the other platform's attempt. Existing slot completion stamps do not control knowledge delivery.

## Local checks

```bash
node --test scripts/social/platform-links.test.mjs scripts/social/newknowledge-*.test.mjs
node scripts/social/newknowledge.mjs --mode=validate --content-only
node scripts/social/newknowledge.mjs --mode=validate
```

The first validation checks all text, canonical links and calendar entries. The last command also requires all 180 JPEGs. Files are inferred from `images/<thread-ID>-01.jpg` through `-06.jpg`; the publisher does not depend on an image-manifest schema. Alt text uses a post's `alt` when available, otherwise its visual headline and labels.

Actual vacancy records and specific vacancy URLs are rejected. The allowed `/jobs` destination is a general discovery page. Educational links come from an explicit evergreen page allowlist.

## Read-only preflight after review and push

```bash
gh workflow run newknowledge-threads.yml --repo vedangvatsa/Web3-Jobs --ref main \
  -f mode=preflight -f date=2026-10-18 -f platform=both
```

Preflight can inspect a future calendar date. It checks the account, recent history, rendered text and images pinned to the checked-out commit. It sends no provider mutations and writes no GitHub receipt. It creates a local artifact journal. Buffer's read-only GraphQL queries use HTTP POST.

Secrets are `BUFFER_ACCESS_TOKEN`, `THREADS_USER_ID` and `THREADS_ACCESS_TOKEN`. The workflow supplies `GITHUB_TOKEN` for Contents API receipts. X uses Buffer channel `6ab62682ea19ca0bdee284bd`, `@hashtag_web3`. Threads uses Graph v1.0 and verifies `@hashtagweb3` against the configured user ID.

The first claim pins the asset commit, six source hashes and complete platform-specific post bodies. Future retries must match that claim. Raw GitHub image bytes must match the local SHA-256 hashes exactly. Provider receipt images are checked against their source, allowing only small JPEG recompression differences. X verification checks the whole six-post native thread, including its root; Threads verifies each image reply before creating the next.

## Receipt recovery

Claims are saved before provider mutations. Returned IDs are journaled and checkpointed immediately. GitHub writes use Contents SHA compare-and-swap, up to eight conflict retries, and monotonic merges that preserve existing IDs. A conflicting owner or ID stops the run. Known stale reads after successful acknowledgements are retried without overwriting newer state.

Every workflow run uploads `.cache/newknowledge/` with 90-day retention. `journal.jsonl` includes request checkpoints and provider readbacks. `receipt.json` contains the last checkpoint, even if a later read or remote write fails. Review the artifact before recovery.

- A known Buffer post ID is read and verified on retry; another thread is never created.
- A saved Threads container with no publish claim can resume once its status is `FINISHED`, during its original date window.
- A saved Threads post ID is verified before the next reply is created.
- A create claim with no ID, or a publish claim with no post ID, stops automatic sending. There is no force/retry switch for uncertain requests.

Read back known IDs without sending any new posts:

```bash
gh workflow run newknowledge-threads.yml --repo vedangvatsa/Web3-Jobs --ref main \
  -f mode=reconcile -f date=2026-10-18 -f platform=both
```

If a provider succeeded but its response was lost, first identify the actual post in Buffer or Threads and compare it with the journal. Supply that known ID to reconcile one platform:

```bash
gh workflow run newknowledge-threads.yml --repo vedangvatsa/Web3-Jobs --ref main \
  -f mode=reconcile -f date=2026-10-18 -f platform=threads \
  -f post_id=KNOWN_PROVIDER_POST_ID -f post_number=1
```

For X, use `platform=x` and its Buffer post ID. For Threads, post numbers are 1 through 6. Reconcile verifies the account, text, image and preceding reply before recording the ID. It may write verified receipt evidence to GitHub, but its provider client forbids mutations. It never creates missing replies or publishes saved containers. If a container-only ID exists only in the artifact, restore that exact reviewed checkpoint with Contents CAS; do not delete the original claim to retry it.

After reconciliation, a publish run may continue only inside the original date window. Later dates use their own calendar entries.

## Platform links

`platform-links.mjs` renders own-site links as `/page/x`, `/page/th`, `/page/li`, `/page/tg`, `/page/fb`, `/page/ig`, `/page/bsky` or `/page/fc`, with additional supported aliases. It preserves query strings and fragments and leaves external URLs alone. The generic publisher uses it when rendering future posts. The original scheduled JSON and completed nomad thread are not rewritten.
