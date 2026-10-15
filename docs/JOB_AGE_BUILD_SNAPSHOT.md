# Job-age validation during builds

The October 15 deployment failed because Stripe's `mgr11` crossed its exact
30-day boundary at `2026-10-15T11:05:28.001Z`, after job generation but before
the artifact test. Its original posting date was
`2026-09-15T07:05:28-04:00`. The hosted current-clock loader/feed regression
correctly excluded it; the raw build snapshot assertion caused the failure.

Prebuild now validates the source and runtime artifacts at the jobs-stage
cutoff and records their exact SHA-256 hashes and counts. A single-use receipt
binds that cutoff to the build directory, attempt identity and ordered
preparation timestamps. Preparation must finish successfully before the
deployment gate can claim the receipt. The gate deletes it after use.

Unchanged FAST-build hashes cannot preserve artifacts that expired before the
jobs stage: those artifacts trigger regeneration. Missing, invalid, future,
inactive and unverified dates still fail. Runtime timestamps must match their
source records. Changed bytes, copied receipts, stale attempts and arbitrary
timestamp authorizations are rejected.

This receipt is used only by the build's artifact test. Ordinary
`npm run test:job-age` checks use the current clock. Website loaders, feeds,
expiry-window ISR, application verification and publishers continue using the
current clock and the inclusive 30-day policy. A job that expires while a build
is running cannot become eligible for live display or publication through this
receipt.

`scripts/test-job-age-build-snapshot.ts` reproduces the Stripe failure and tests
the generation boundary, FAST invalidation, original-date integrity, receipt
tampering, single use and current-clock rejection after expiry. The normal
Node 24 production build and the existing clock-controlled HTTP/browser expiry
fixture passed with the fix.
