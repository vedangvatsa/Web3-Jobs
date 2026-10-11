# Catalogue publication and freshness

Jobs, events and RSS snapshots publish through `scripts/publish-catalog.mjs`.
Each writer owns explicit paths, uses a temporary Git index, and builds its commit
on the latest remote main. Unrelated research checkpoints and delivery receipts
are retained. Shared metadata maps merge independent keys; competing changes to
the same catalogue or map value fail with a recovery snapshot.

Push races retry up to eight times with bounded backoff. The publisher does not
reset or rebase the writer's checkout. Recovery files under
`.cache/catalog-publication/` are uploaded when a publication job fails. Image
metadata and event slug history are included with the assets they describe.

Successful ingestion and native-news completion have separate daily stamps.
Failed news therefore does not repeat a successful jobs scrape. Event refresh is
independent of deployment and Telegram delivery; the next website rollout uses
the catalogues committed when its build starts.

The manual `website_recovery` input refreshes jobs, events, RSS and native news
without sending emails, videos or social posts. After those jobs finish, invoke
the website-only deployment workflow to include their completed snapshots.

## Deployment verification

Builds generate `/data/catalog-freshness.json`. It records catalogue hashes,
counts, available source dates and ingestion receipts. The deployment job requires
a manifest generated after its start time and matching live catalogue bytes before
reporting success. A successful rollout API response alone is insufficient.
The manifest's build time is not presented as a source posting date.

The jobs browser cache expires after five minutes. Returning to the tab refreshes
an expired snapshot and retains the number of loaded rows. Ordinary pagination
and searching share the same request and respect the HTTP cache during that period.

## Verified Axiom correction

On 11 October 2026 the original Superteam `fullstack-engineerv` URL returned308
to the canonical `fullstack-engineer` URL, with the same source UUID. Five distinct
Superteam openings described the Austin onchain trading business, not the unrelated
axiom.xyz coprocessor company. Those five verified UUIDs are labelled
`Axiom (onchain trading)` with an unknown website and no guessed favicon.

`fullstack26` keeps its existing URL-based identity and description key. `fs4` is
reserved as an archive-backed redirect. The unrelated historical GoMining record
at `archive.fullstack26` is retained. No global Superteam identity migration is used.

## Checks

```sh
npm run test:catalog-publication
npx tsx --test scripts/test-verified-job-corrections.ts
npm run test:jobs-catalog
node --test scripts/social/publish-slot-plan.test.mjs scripts/social/posting-slot.test.mjs scripts/news-workflow.test.mjs
```

Publication tests use local bare repositories and simulate repeated concurrent
research pushes, dirty worktrees, metadata merges and real conflicts. Freshness
tests reject stale manifests and mismatched live catalogue bodies.
