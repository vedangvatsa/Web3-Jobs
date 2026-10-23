# Telegram jobs outage, October 21–23

## Summary

`@web3hiring` and `@jobsweb3` stopped receiving job digests after the October 21
afternoon slot. Every subsequent scheduled run failed its job leg with
`Unconfirmed Telegram job delivery requires review` before calling Telegram.
The hashtagweb3 group job leg continued to attempt sends independently.

## Root cause

1. On October 21 11:32 UTC the afternoon job digest **was delivered** to
   `@web3hiring` (message ID 155870), but the post-send confirmation push to
   `main` failed after all eight retries (git ref contention: `fetch first` /
   `cannot lock ref`).
2. The runner was ephemeral, so the local `sent` receipt was lost. The remote
   ledger kept the pre-send `reserved` receipt `ef9d989f-5941-4296-82e4-87526ad1a631`
   (`chatId @web3hiring`, `slotKey 2026-10-21:afternoon`).
3. `scripts/telegram-post.mjs:282` fails closed when **any** receipt is still
   `reserved`. From the October 21 evening slot onward this blocked the whole
   `@web3hiring` / `@jobsweb3` leg, even though the message had already been sent.

## Fixes

- `scripts/social/telegram-jobs-delivery.mjs` records an explicit `rejected`
  receipt when a **pre-send** guard fails after the reservation is durable but
  before Telegram is called (commit `9573504a8`). Those failures are known
  not-sent, so they no longer leave a blocking `reserved` receipt.
- `scripts/reconcile-telegram-job-reservation.mjs` reconciles a stuck
  post-send `reserved` receipt to `rejected` after review.
- The stuck October 21 receipt was reconciled on `main` in `d4af449d7`
  (October 23 12:26 UTC). Current `main` has `reserved = 0` across every
  `.telegram-*` ledger.

## Timeline note

The failed 11:30 UTC run on October 23 checked out `0898ee6fec` (10:51 UTC),
which still contained the `reserved` receipt; the reconciliation `d4af449d7`
landed later at 12:26 UTC, so that run could not benefit. The guard now passes
for the `2026-10-23:afternoon` slot on current `main` (verified locally).

## Still true / caveats

- The October 21 message **was** sent, so marking its receipt `rejected` means
  those four jobs are eligible for selection again. Jobs age out after 30 days
  and selection favours fresh postings, so a repeat is unlikely but possible.
- Missed slots (October 21 evening through October 23 afternoon) are not
  recoverable: each slot has a 60-minute window and cannot be backfilled.
- A post-send confirmation push failure still leaves `reserved` by design
  (delivery is ambiguous). Recovery is manual via the reconcile script.

## Verification

The next scheduled run at 19:30 UTC on October 23 is the first run that can
exercise the fix end to end. `scripts/telegram-post.mjs:282` now evaluates to
false for the web3hiring ledger, so the job leg proceeds to selection and send.
