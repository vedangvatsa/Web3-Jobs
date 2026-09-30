# Job video publishing

The existing Publish Jobs, Events & Social workflow calls the video publisher at 03:30, 11:30 and 19:30 UTC. Each slot selects two jobs and publishes the same two videos to Instagram, YouTube and TikTok. The daily cap is six distinct jobs, or six posts per platform.

Instagram uses the existing Meta Page connection. YouTube and TikTok use the separate `BUFFER_VIDEO_ACCESS_TOKEN` secret. The older Buffer secret remains in place for the other social publishers.

Media lives outside the application at `https://storage.googleapis.com/hashtagweb3-job-videos/catalog/`. The library is publishing metadata only; it is not imported by the website. The production source and renderer remain in the local `hashtag-web3-job-drops` project.

## Selection and captions

- A job must still exist in the published catalog with matching identity, employer, application link, location and pay.
- The job page must expose matching JobPosting data. Stored descriptions are checked against their production hashes where available.
- Employer pages returning errors or explicit closure messages are excluded. Generic HTTP success alone is not proof of current employer availability.
- The public MP4 must match the manifest size and MIME type.
- Editorial-recovery entries are held out of automatic selection.
- Captions use concise role and location/pay details, `hashtagweb3.com`, and three relevant hashtags. No colons, full URLs, or invented urgency.

## Receipts and retries

`job-video-state.json` is read from main at startup and saved through the GitHub Contents API before and after each remote publication stage. Intent is saved before sending a mutation. Buffer post IDs and Instagram container/media IDs are retained before polling. Unknown mutation outcomes stop or reconcile with recent account posts; they are never blindly resent.

All video runs share the `social-job-videos` concurrency group. Slot allocations are immutable on retry, with at most two jobs per slot and six per UTC day. Automatic runs outside the slot's first hour cannot publish. Manual dispatch explicitly permits an out-of-window run for today's slot, while retaining caps and duplicate protection.

To preview or retry today's slot, dispatch `post-job-videos-social.yml`. `dry_run` defaults to true. Set it to false to publish. Optional `slugs` accepts two comma-separated job slugs for an initial batch. An existing slot always resumes its saved jobs regardless of new slug inputs.

For pending or error receipts, inspect the retained post/container before changing state. A Buffer queue entry is not considered published until Buffer reports `sent` and provides a platform URL. Instagram verifies the resulting media ID, owner and permalink.

## Checks

```sh
node --test scripts/social/job-video-core.test.ts scripts/social/job-video-clients.test.ts
VIDEO_MANUAL=true node scripts/social/post-job-videos.ts --dry-run
```

GitHub uses Node 24. Local Node 22 requires `--experimental-strip-types`.
