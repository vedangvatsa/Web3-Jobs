# Telegram publishing

## Schedule

| Slot | UTC | India time |
| --- | --- | --- |
| Morning | 03:30 | 09:00 |
| Afternoon | 11:30 | 17:00 |
| Evening | 19:30 | 01:00 the next day |

The Mac launch agents dispatch these slots; GitHub cron is the backup. Each slot has a 60-minute delivery window to allow for ingestion, deployment and queue delays. Early or late runs cannot send Telegram digests. A saved receipt prevents a second digest to the same destination in that slot, even if a different publisher fails.

## Independent publishers

The workflow runs jobs, events, Web3 news, group news and AI news as separate matrix jobs with fail-fast disabled. They do not depend on the event-fetching job. Jobs and events use validated catalogs downloaded from the live site after the deployment stage.

TOKEN2049 discovery runs before the broad event crawl. If discovery fails, the previously verified source is retained, the catalog job reports the failure, and Telegram can continue using published events.

## Delivery records

- Jobs: `.telegram-jobs-deliveries-*.json`, `.telegram-posted-*.json`, `.telegram-job-urls-*.json`.
- Events: `.telegram-events-*.json`.
- News: `.telegram-news-*.json`, `.telegram-ai-news-*.json`.

Each sender saves a reservation on `main` before calling Telegram and saves the message ID immediately after acceptance. Successful channel legs are not repeated when another destination rejects a digest. Explicit rejections can retry; an ambiguous response stays reserved until its delivery is checked. Do not clear a reservation merely to make a run green.

Receipts are committed independently of catalog changes and backed up as workflow artifacts. A catalog rebase cannot discard posting history.

## Diagnostics

Dispatch `refresh-jobs-cache.yml` with `diagnose_telegram=true` to check bot membership and posting permissions without sending messages. Add `diagnose_content=true` to preview jobs, events, Web3 news and AI news using live credentials. These preview commands use `--dry-run --force`: the force flag bypasses the preview cooldown, but the dry-run flag prevents Telegram sends and delivery-history writes.

News generation validates complete JSON before accepting a model response. Truncated responses retry through the model fallback chain; they are not repaired by inventing missing text.
