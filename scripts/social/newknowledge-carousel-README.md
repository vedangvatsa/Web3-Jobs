# Daily LinkedIn and Instagram carousels

One six-page LinkedIn document and one six-image Instagram feed carousel per calendar day, alongside the X and Threads image threads. Automatic delivery starts with **E02 on October 22, 2026**, and ends **November 16, 2026**.

The daily window opens at **11:30 UTC / 17:00 IST** and closes at **12:30 UTC / 18:00 IST**. Every provider mutation checks that date and window. A missed date stays missed. The October 21 C02 export remains available to download; the scheduler does not backfill it.

## Accounts and transport

| Platform | Brand destination | Transport |
| --- | --- | --- |
| LinkedIn | Hashtag Web3 company, organization `89714573` | Buffer channel `69c5b139af47dacb695b5feb`, one PDF document asset |
| Instagram | `@hashtagweb3`, account `17841473830256790` | Meta Graph v21.0, six child image containers and one carousel parent |

LinkedIn checks the channel ID, organization service ID, Page type, public profile, connection state and posting actions. Buffer returns the numeric profile URL `https://www.linkedin.com/company/89714573`; the configured named URL identifies the same organization.

The workflow explicitly sets `KNOWLEDGE_INSTAGRAM_TRANSPORT=meta`. The legacy Instagram Buffer channel is no longer connected. A transport change requires review of existing claims; the publisher does not switch transport after a failed request.

Secrets: `BUFFER_ACCESS_TOKEN` for LinkedIn and `META_PAGE_TOKEN` for Instagram. The workflow supplies `GITHUB_TOKEN` for receipt writes. Keep credentials in GitHub secrets. Local commands default to read-only preflight and to the Buffer transport unless Meta is explicitly selected.

## Schedule

`refresh-jobs-cache.yml` calls `newknowledge-carousels.yml` from its `knowledge-carousels` job. This job needs only `gate` and uses the existing `knowledge_due`, date and afternoon-slot outputs. The external dispatch and backup cron provide the clock. News, deployment and other social completion stamps do not control this job.

The shared planner excludes website-recovery, news-only, dry-run and diagnostic modes. The carousel workflow has its own concurrency group, `knowledge-carousels-month`, with cancellation disabled. A LinkedIn failure still allows the Instagram attempt. X and Threads have their own workflow and receipts.

The reusable workflow accepts `publish`; manual dispatch offers account inspection, plan, validation, preflight and reconciliation. Do not use a full parent-workflow dispatch to run a read-only check.

## Exports and checks

`social-assets/knowledge-threads-month/exports/manifest.json` describes 27 topic packages dated October 21 through November 16. It binds captions, source posts, image order, dimensions and file hashes to the reviewed manuscript.

- Each LinkedIn PDF embeds the six original 1200 x 1500 JPEGs at 600 x 750 points, with a separate cover and caption.
- Each Instagram ZIP contains six 1080 x 1350 sRGB JPEGs, `caption.txt` and `alt-text.json`.
- `/li` and `/ig` links lead to the matching website resource. Captions retain the source qualifications.
- Facebook, Telegram and Bluesky payloads are prepared exports. Automatic delivery targets LinkedIn and Instagram only in this workflow.

Open `social-assets/knowledge-threads-month/exports/index.html` for downloads. With the campaign preview server running on port 3103, use `http://127.0.0.1:3103/exports/index.html`.

```bash
node --test scripts/social/platform-links.test.mjs scripts/social/newknowledge-*.test.mjs
node scripts/social/newknowledge-carousels.mjs --mode=validate
node social-assets/knowledge-threads-month/validate-platforms.mjs
```

The last command requires Poppler's `pdfinfo` and `pdfimages`. It checks all 162 embedded PDF images against their original bytes, all 162 Instagram JPEGs and every ZIP's order/content. `export-platforms.mjs` regenerates the packages from the reviewed masters. Never regenerate a claimed package with different content.

Before any publication, the publisher fetches the assets from a full Git-commit-pinned raw GitHub URL and checks their hashes. It also checks the resource links, target identity, posting history and Instagram quota. Selected event topics receive a fresh event-catalog check. The first claim pins the content and asset commit for later attempts.

## Read-only checks

```bash
gh workflow run newknowledge-carousels.yml --repo vedangvatsa/Web3-Jobs --ref main \
  -f mode=accounts -f platform=both

gh workflow run newknowledge-carousels.yml --repo vedangvatsa/Web3-Jobs --ref main \
  -f mode=preflight -f date=2026-10-22 -f platform=both
```

Preflight may inspect a future calendar date. It creates local artifact journals, but sends no provider mutations and writes no GitHub claims. Buffer read-only GraphQL queries use HTTP POST.

Live account inspection passed in [run 39644371730](https://github.com/vedangvatsa/Web3-Jobs/actions/runs/39644371730). Both platforms returned `ready` for E02 in [preflight 39644377259](https://github.com/vedangvatsa/Web3-Jobs/actions/runs/39644377259), using asset commit `1c8f9ce12`. At that check, Instagram reported 0 of 100 publications used in its rolling 24-hour quota. Quota is checked again before mutations. These runs verified readiness, not a new carousel publication.

## Receipts and recovery

Receipts use a separate path:

```text
scripts/social/newknowledge-carousel-receipts/knowledge-threads-month-2026-10-17/<date>-<linkedin|instagram>.json
```

Each claim is saved with Contents API compare-and-swap before its mutation. The publisher checkpoints returned provider IDs immediately, including IDs returned alongside errors. The workflow uploads each platform's `.cache/newknowledge-carousels/<date>/<platform>/` journal with 90-day retention.

LinkedIn verifies the document title, page count, bytes, cover, caption, account and native permalink. Instagram verifies the caption, owner, six ordered image children, alt text and native permalink. Provider image verification permits small recompression differences. A known post is read back instead of created again.

An Instagram child or parent with a known container ID can resume processing within the original date window. A claim with an unknown create result, or a publish claim without a published ID, stops automatic mutations. Review the journal and provider history before recovery; never delete a claim to retry it.

Read back an existing claim without publishing:

```bash
gh workflow run newknowledge-carousels.yml --repo vedangvatsa/Web3-Jobs --ref main \
  -f mode=reconcile -f date=2026-10-22 -f platform=both
```

If a response was lost but the actual post is known, reconcile one platform with `-f post_id=KNOWN_PROVIDER_POST_ID`. Use the Buffer post ID for LinkedIn or the **published media ID**, not a container ID, for Instagram. Reconciliation verifies the post against the existing claim before persisting it. It can write receipt evidence but cannot create or publish provider content.
