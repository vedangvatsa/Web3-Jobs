# Repository storage and integration cleanup

Audit baseline: commit `d3c9bd2f0c1509e307fc4c52553032324720d5fb`, October 5, 2026 UTC.
Sizes below distinguish the current checkout from Git history and local build tools.

## Current tracked files

The baseline has 28,183 tracked files totaling 516,235,992 bytes, approximately
492.3 MiB before filesystem allocation overhead.

| Area | Approximate size | Assessment |
|---|---:|---|
| `public/responsive/` | 130.2 MiB | Device-sized image variants; references and cache-grace periods must be respected |
| `public/images/` | 71.0 MiB | Article/city images and other site assets |
| `public/events/` | 69.8 MiB | Event covers, including published and compatibility references |
| `public/og/` | 64.0 MiB | Social-preview images |
| `content/job-description-shards/` | 39.1 MiB | Job descriptions needed by pages/feeds |
| `public/preview/` | 19.0 MiB | Crawler shells and historical URL compatibility |

These large directories are not automatically unused. The image-generation and
pruning scripts already protect referenced assets and cached-page compatibility.
Do not remove responsive variants merely because their source image also exists.

Exact duplicate Git blobs account for about **12.5 MiB of repeated checkout
content**, mostly covers or article images at different published URLs. Git
already stores a shared blob once, so deleting one pathname does not reclaim the
same amount from Git history. Asset consolidation requires preserving every
published URL and checking page, feed and social-preview references.

## Local Git storage

The inspected primary Git database contains **2.65 GiB of valid packs**. Its
history includes older large event images, generated videos and earlier versions
of the monolithic `content/job-descriptions.json`. The largest historical version
of that JSON is 95.4 MB uncompressed, but Git delta compression makes that number
different from its physical storage cost.

Five abandoned incoming `tmp_pack_*` files were reported as garbage by Git.
They were 10 to 326 hours old, had no open file handles and were not indexed pack
files. Removing them reclaimed **694,460,423 bytes, approximately 662.3 MiB**.
Git reference snapshots matched before/after and `git fsck --connectivity-only
--no-dangling` passed both times. Two small temporary object files, totaling about
3.67 MiB, were retained rather than assuming they held no unique recovery data.

Deleting a file in a normal commit does not delete its historical blobs. A major
reduction of retained history would require a separately coordinated history
rewrite, affecting commit identities and other clones. This cleanup performs no
history rewrite and removes no valid pack, commit, branch, recovery backup or
worktree reference.

## Additional local dependency candidate

The retired Cloudflare/OpenNext toolchain remains a development dependency.
Measured folders for `@opennextjs`, `@cloudflare`, `wrangler`, `workerd` and
`@aws-sdk` occupy about **190 MiB** in this installation. `npm explain` traces the
remaining S3 SDK to `@opennextjs/aws`, through `@opennextjs/cloudflare`.

Production currently uses Firebase App Hosting. Removing this optional legacy
toolchain would require removing its build/deploy commands and configuration,
then verifying the Firebase build. It is a separate dependency-cleanup candidate,
not a demonstrated 190 MiB reduction in Git or cloud billing.

## Retired integrations

- AWS SES: removed the SES client dependency, sender/template module and manual
  sender/test commands. The small job-alert type now belongs to the active Resend
  implementation. Other AWS packages can still appear under legacy development
  tooling; they do not restore the SES email path.
  The repository's `AWS_SES_ACCESS_KEY_ID`, `AWS_SES_SECRET_ACCESS_KEY` and
  `AWS_SES_REGION` GitHub Actions secrets were deleted and their absence verified.
- Apify: removed the paid actor runner, its npm command and actor-import CLI
  mode. Verification continues through direct Luma page/API fetches. Historical
  source-method/run-ID fields remain readable as provenance and make no API calls.
- Supabase: there was no active client, runtime endpoint or dependency to remove.
  The stale architecture references were removed. Mentions in job-skill taxonomy,
  published content and delivery history are content, not integrations.

No Apify or Supabase repository secrets were configured. This is a project and
repository cleanup; it does not cancel external vendor accounts or billing plans.

Verification:

```sh
npm run test:integration-retirement
node --test scripts/lib/luma-calendar.test.mjs scripts/lib/event-dates.test.mjs scripts/lib/event-image-utils.test.mjs
FAH_FAST_PREBUILD=1 OG_PRECOMPUTE=0 OG_FILL_MISSING=0 npm run build
```

The retirement regression renders Resend templates, checks unsubscribe signing,
reads direct and historical event snapshots offline, and ensures retired CLI
arguments fail before creating caches or applying event changes. It sends no
email and starts no paid actor.
