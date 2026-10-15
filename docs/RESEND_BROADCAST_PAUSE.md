# Resend broadcast pause

The user requested "pause resend broadcasts untill i say further." on
2026-10-15 UTC. The pause has no expiry. Only an explicit user instruction to
resume authorizes changing it; a successful build, quota reset, retry, new day,
or scheduled run does not.

## Controls

- `scripts/lib/resend-broadcast-policy.json` records `paused: true`.
  The CLI reads this file on each invocation, relative to its helper rather than
  the shell's working directory. A missing, unreadable, or invalid policy also
  blocks sending.
- The GitHub repository variable `RESEND_BROADCASTS_PAUSED=true` gates both the
  `job-alerts` caller in `refresh-jobs-cache.yml` and the `send-job-alerts` job
  in `daily-job-alerts.yml`. The latter passes the variable to the CLI and checks
  out current `main` so reruns use its current policy.
- `daily-job-alerts.yml` is also manually disabled in GitHub. Keep it disabled
  until the user explicitly resumes. Disabling it alone does not protect the
  reusable caller; publish the workflow gates and tracked policy to `main`.

Either the tracked pause or the environment pause blocks the CLI. Setting the
environment variable to `false` cannot override `paused: true`. `--force`,
`FORCE`, `force_send`, `--dry-run`, and `--preview` cannot bypass the pause.
The CLI prints `Resend broadcasts PAUSED: skipped.` and exits 0 before importing
the sender, validating credentials, fetching jobs or contacts, creating or
sending broadcasts, or reading/writing `.resend-broadcast-*.json` receipts.

This applies to GitHub Actions, `npm run send-alerts`, and local cron using the
same checked-out script. Existing clones must receive the pause commit. Catalog
publication uses explicit output-path allowlists that exclude `scripts/lib/`;
it retains other files from current `origin/main`, including this policy.
No automation resets the policy.

Website publishing, news, Telegram, social schedules, unsubscribe handling,
suppression cleanup, and subscription deletion remain available.

## Resume only after the user explicitly asks

1. Record the user's resume instruction and its actual UTC timestamp in this
   policy/documentation, then change the tracked policy to `paused: false`.
2. Publish that change to `main` and update any local cron checkout.
3. Set the GitHub repository variable `RESEND_BROADCASTS_PAUSED=false` and clear
   any local `RESEND_BROADCASTS_PAUSED=true` override.
4. Re-enable `daily-job-alerts.yml` in GitHub.

The pause checks do not change provider quotas or bypass the existing delivery,
job-validation, contact-count, and duplicate-send checks.

## Provider scheduling and verification

Code inspection on 2026-10-15 found one production broadcast entry point:
`scripts/send-resend-broadcast.ts`, called by the alerts workflow and npm script.
`src/lib/resend-daily.ts` creates broadcasts with `send: true` and no future
schedule field. The application does not schedule future provider broadcasts,
so no application-scheduled future cancellation was needed. This does not
inspect broadcasts someone may have scheduled directly in the Resend dashboard.
The duplicate-cleanup script protects a canonical receipt and is not a general
pause/cancel-all tool.

Separate GitHub `in_progress` and `queued` queries returned no runs during the
pause check. No workflow cancellation or Resend API call was required.

Offline checks:

```bash
node --test scripts/lib/resend-broadcast-policy.test.mjs scripts/news-workflow.test.mjs
```

The pause tests block network access and receipt changes while exercising the
real CLI. Do not dispatch or rerun a live workflow to test this pause.
