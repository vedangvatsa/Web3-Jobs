# Instagram publishing

## Schedule and ownership

Instagram job publishing uses `post-job-videos-social.yml` only. The parent
`refresh-jobs-cache.yml` calls it in the morning, afternoon and evening:

| Slot | UTC | India | Reels |
| --- | --- | --- | --- |
| Morning | 03:30 | 09:00 | 2 |
| Afternoon | 11:30 | 17:00 | 2 |
| Evening | 19:30 | 01:00 next day | 2 |

The UTC-day limit is six. Late automatic backups cannot add catch-up posts.
The durable video ledger reserves both selections before publishing, and retries
reuse receipts instead of adding another pair. A run fails rather than filling
the quota with an expired job or a video whose facts no longer match the source.

The job-opening workflow publishes link cards to its other six networks. Instagram
is removed from its targets, completion requirements, backlog and image publisher.
An explicit `--platform instagram`, including `--force`, fails before selection.
Historical image receipts stay intact. Old one-off Buffer content scripts are not
part of the scheduled job flow; do not use them to bypass the video ledger.

## Captions and API settings

- Role and employer on the first line, followed by the video's verified location
  and pay where available. Plain text templates, no LLM generation or sales copy.
- Keep the approved `Find the role on hashtagweb3.com` line. Do not claim a clickable
  caption link or say "link in bio": the audited bio currently links to Telegram.
- Two or three relevant tags. Design, sales and engineering roles get appropriate
  tags; remote is included only when stated. No `#viral` or engagement bait.
- Prefer different employers within a pair, while retaining freshness checks and
  fallback candidates. Do not replace selections already saved in the ledger.
- Publish with `media_type=REELS` and `share_to_feed=true` (already enabled).
  Verify ownership and `media_product_type=REELS` on the published receipt.
- Meta's `share_to_feed` allows feed distribution; it does not guarantee recommendations.
  There is no supported "boost organic reach" upload flag. Music tagging supports
  original audio; attaching licensed trending music is not a routine API setting.
- `cover_url` or `thumb_offset` can select a useful role-specific cover. Review the
  actual frame before using it; a cover change does not fix the opening of playback.

Example for a verified remote frontend role:

```text
Frontend Software Engineer at Tether

100% Remote

Find the role on hashtagweb3.com

#Web3Jobs #TechJobs #RemoteJobs
```

## Read-only audit, 2026-10-03 UTC

- Account `@hashtagweb3`: 686 followers. Latest 100 media objects: 18 Reels, 82 feed posts.
- All six October 3 Reels were present, two per scheduled slot. The latest video
  job in parent run `37148109467` succeeded; that parent's failure was event refresh.
- The sampled DriveWealth file (`catalog-mgr90-v2-9x16.mp4`) is 480x854, H.264,
  24fps, 23 seconds, about 288kbps video; AAC stereo 48kHz/about65kbps audio.
  This is a low-resolution source, not a missing Instagram upload-quality switch.
- At one second it displays only "DriveWealth is hiring." At five seconds it shows
  the actual role and location. Both frames are mostly text. This is a concrete
  creative limitation; caption changes alone will not resolve it.
- Post reads work, but every attempted Insights metric returned Meta error `#10`,
  "Application does not have permission for this action." Views, reach, retention,
  saves and shares were **not measured**. Zero visible likes is not evidence of zero views.

Next production pass: render from source at 1080x1920, with the role and useful
location/pay fact visible immediately. Use readable captions with real visual
changes, original audio, no other platform's watermark, and no long logo intro.
Do not upscale the existing 480px file and call it a high-resolution source.
Keep the requested six-per-day schedule; use account evidence before changing times.

The Facebook Login token needs `instagram_manage_insights` to assess the bottleneck.
After granting that permission, run this read-only command with `META_PAGE_TOKEN`
already in the environment:

```sh
node scripts/social/instagram-reels-insights.ts --limit=12
```

The report omits token-bearing paging URLs, labels missing metrics, and stops
repeated Insights requests after a permission error. Compare similar-age Reels at
24h and 7d using reach, average watch time, shares/reach and saves/reach. Check
recommendation eligibility in Instagram's Account Status; this audit did not read it.

## Research

Reviewed October 3, 2026. Technical settings use Meta's documentation; general
ranking advice is not a claim about this account's measured performance.

- [Meta: IG User Media](https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-user/media) (updated September 28, 2026): Reels encoding, covers, `share_to_feed`, original audio and media reads.
- [Meta: Content Publishing](https://developers.facebook.com/docs/instagram-platform/instagram-api-with-facebook-login/content-publishing/): asynchronous containers and `media_product_type` verification.
- [Instagram: Ranking Explained](https://about.instagram.com/blog/announcements/instagram-ranking-explained) (May 31, 2023): reshares/completion and reduced visibility of low-resolution, mostly-text or watermarked Reels.
- [Buffer: Instagram algorithms](https://buffer.com/resources/instagram-algorithms/) (March 24, 2026): current practitioner summary on caption keywords, clear opening frames and measuring watch time/shares. Hashtags are not a substitute for useful content.
