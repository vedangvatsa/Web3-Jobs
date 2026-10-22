# News Publishing Run — Hashtag Web3

Research and draft every qualifying News story for hashtagweb3.com as the run's time budget permits. Today is $TODAY (UTC).
Work in the repository root (current working directory on the runner).

Keep shell working directories at that root. Temporary files, downloads and helper
scripts belong in `.cache/news-research/scratch/`, also supplied as `TMPDIR`, `TMP`
and `TEMP`. Run `node scripts/...` from the repository root. A command that changes
into a temporary directory cannot resolve those relative script paths. The runner
does not grant access to arbitrary `/tmp` paths.

Do not launch the site, background or detach commands, or signal or stop processes.
This is a fresh checkout, possibly with explicitly restored unpublished drafts.
Read tips on every run, including when the working tree is clean. CI discovers
the daily feed batch once; same-day retries resume that queue. The next UTC day
gets fresh discovery. Explicit manual tips and newly researched leads still enter
the queue, but do not refresh every RSS feed yourself during recovery.
Then research, write and validate qualifying new articles and their images.
CI owns commits and pushes. Do not run git commit, git push or git rebase.
There is one daily news batch and one scheduled website deployment slot.

## 0. Tips first (mandatory)

Read `content/news-tips.md` FIRST, then `.cache/news-research/assignment.json` when
the coordinator provides an assignment; otherwise read `.cache/news-research/queue.json`.
The queue includes those tips, fresh feed candidates, and deferred leads from
earlier daily runs. Verify dates and facts for tips just as for feed stories.
Record their outcomes by candidate ID. The ledger prevents an unchanged resolved
tip from reopening automatically; a newly submitted note supplies new review context.

## 1. Review the daily queue within the research budget

Run `node scripts/news-research.mjs queue --assigned` for a coordinator assignment,
or `node scripts/news-research.mjs queue` for an unpartitioned review. Work through assigned candidates,
including deferred leads, for as long as the coordinator's budget allows. There is no two- or three-article target and no article
count cap. Do not stop when the first few articles are done. Prefer candidates
with several source URLs, then pursue alternate outlets and primary records when
a source is blocked. The coordinator supplies the invocation's time limit.

An assignment is a small part of the same daily queue. Record each candidate's
outcome as soon as its review finishes, then move to the next. When all assigned
candidates have outcomes, return to the coordinator. It continues the remaining
assignments until the queue is covered or the research budget expires (normally
75 minutes, configurable up to 90). Each writer invocation is also time-limited.
Checkpoint each finished review and draft immediately so interruptions preserve
useful work. Unfinished candidates remain genuinely pending for a later batch;
never record a deferral just because time ran out. Do not repeatedly dump the
full ledger or redo candidates whose outcomes are already recorded.

The availability pass records temporary source-blocked deferrals only after actual
GET denials for every known URL. Its report is `.cache/news-research/source-readiness.json`.
Those checks are not source reads or factual verification. Accessible alternatives
and every preserved draft remain assigned for research. Keep the recorded retry
queries for unavailable sources; never turn them into permanent rejections.

Use the access results: if WebFetch fails for a URL that the readiness pass
reported as HTTP 200, download that exact public URL to the scratch directory
with the same identifying User-Agent,
`HashtagWeb3NewsSourceReadiness/1.0 (+https://hashtagweb3.com)`, and read its actual
article text. Use bounded requests and inspect redirects. A login, challenge page
or headline alone is not readable reporting. Record a source as read only after
reading its contents. This avoids repeatedly searching for replacements for an
already-accessible source.

Recovery assignments include `restoredDraft` provenance and review reasons. Reuse
the existing unpublished text and image, recheck its facts and sources, and repair
only what fails the editorial rules. An older `originalDate` is the date written
in an unpublished draft. After verifying that the story is still timely, set its
publication metadata to the actual publication day; preserve every source-event
date and do not present an old event as newly occurring. A restored draft is never
automatically approved.

Write every story that qualifies. A story qualifies ONLY if ALL hold:
- Published within the lookback window (fresh news, not analysis of old events).
- Has a verifiable primary source when one exists, and at least two independent
  sources you can open and read on separate sites. Two is the minimum; more is fine.
- Does not duplicate an existing article in content/articles/ (check slugs AND titles;
  a new development on a covered topic is OK only as a NEW event with fresh reporting,
  never a rewrite).
- Is a concrete event (launch, vote, ruling, filing, hack, raise, upgrade), not
  price chatter, predictions, explainers, or opinion.
- Exclusions: job boards, token/price-calendar items, rumors from a single weak source.

Every completed review must have a recorded outcome: ready, rejected or deferred.
Do not manufacture outcomes for candidates you have not finished reviewing.
Source access failures and missing corroboration are deferrals, not permanent
rejections. Deferred leads return in the next daily batch for up to 72 hours from
their original publication (or discovery for undated manual tips). Recheck that
the development is still timely; never present an old event as having happened today.

Use the CLI to record each result. For example:

```sh
node scripts/news-research.mjs record --id=<candidate-id> --status=ready --article=<short-slug> --note="Verified the filing and matched the reported figures across these sources." --read=https://source-one.example/report --read=https://source-two.example/report
node scripts/news-research.mjs record --id=<candidate-id> --status=deferred --reason=source-blocked --note="Read the company filing; the independent report returned HTTP 403." --read=https://company.example/filing --blocked=https://outlet.example/report --search="Find independent reporting on this filing and its confirmed figures"
node scripts/news-research.mjs record --id=<candidate-id> --status=rejected --reason=duplicate --duplicate=<existing-news-slug> --note="This covers the same filing and announcement as the existing report."
```

Use only real URLs actually attempted, and mark `--read` only after opening and
reading the source. Repeat `--read`, `--blocked` or `--unavailable` for each URL.
Deferrals require a specific `--search` instruction for the next attempt.
Other rejection reasons are out-of-scope, opinion, price-chatter, stale,
not-a-concrete-event or promotional. Record a specific explanation for each.
Do not reject a story merely because verification takes longer than the first attempt.
If research uncovers another fresh event outside the queue, register it before
drafting with `node scripts/news-research.mjs add --link=<source-url> --title="<headline>" --published=<source-ISO-date> --source="<source-name>"`.
For two candidates covering the same event, draft it once and record the second
as a duplicate of that ready article slug.

Run `node scripts/news-research.mjs report` before stopping. Zero ready articles
cannot count as publication success. Unreviewed candidates keep research coverage
incomplete, but do not prevent the coordinator from publishing a ready batch
after all actual article audits pass. Report remaining work accurately. Research
coverage and the once-per-day publication marker are separate; a same-day retry
stops if publication is already complete.

## 2. Research (mandatory)

Open and READ every source you will cite (use WebFetch; follow redirects).
Never infer a fact from a URL, headline, snippet, or another article's wording.
Record for each fact: value, source URL, source date. If a fact cannot be
verified in an opened source, omit it. Never invent dates, numbers, quotes,
names, or plans.

## 3. Write (follow content/articles/AGENTS.md exactly)

For multiple review outcomes, write a JSON array to `.cache/news-research/reviews.json` and run `node scripts/news-research.mjs record-batch --reviews=.cache/news-research/reviews.json`. Each object uses `id`, `status`, `note`, `articleSlug` (ready), `reason`, `duplicateOf` (duplicate), `sourceChecks: [{url, outcome}]`, and `retrySearches` (deferred). All existing validation still applies. Record a ready article before its duplicate leads. Do not construct shell command strings or use `eval`; quotes and dollar amounts in notes must remain exact. A batch fails atomically and reports the offending candidate ID. Fix that outcome before retrying.

The queue is an object with a `candidates` array; the research report has an `outcomes` array. Do not guess their JSON shapes. Keep checkpoints small enough that useful progress survives interruption.

- File: content/articles/<single-lowercase-word>.md (no hyphens), `category: News`, complete
  front matter (title, ogTitle UPPER, description, image, data-ai-hint,
  publishedDate/lastUpdated = today, never future).
- 600+ words of body prose (target 650-900).
- Inline hyperlinks at each claim. Attribute everything (`said`, `according to`,
  `reported`, `plans`). Preserve uncertainty from sources.
- Vary attribution placement: never end more than two consecutive sentences
  with `according to X` / `reported Y`. Lead some sentences with the source
  ("Cointelegraph reported ..."), bury some mid-sentence, and let plain
  established facts stand with just the link.
- Attribution economy (hard caps per article): the same "<Outlet> <verb>"
  construction max 2x; the same outlet named max 3x. Beyond that use
  link-only attribution (link on the claim itself), "the report" / "the
  thread" / "the filing" / "the notice", or a primary-source subject
  ("the company said", "the filing shows"). Never use the same verb twice
  in a row. Prefer primary sources (announcement, filing, official post)
  over outlet names when both support a fact.
- Cite at least two independent external sources as inline links on separate
  sites. Include a primary source when one exists. Two is the minimum; more is
  fine. The quality check rejects a news article with fewer than two distinct
  external sites.
- No Sources/References section, no FAQ, no key-takeaway boxes, no tables,
  no bold inside prose, no em dashes, no curly quotes, straight ASCII only.
- End on the last concrete reported fact. No summary, no moral, no mic-drop.

### Voice (strict — reporter, not blogger)

Write short varied paragraphs, facts first, quotes early, plain words.
BANNED constructions (real examples that failed review — never write like this):
"The draw is yield." / "Behind the platforms, the rules bite too." /
"For users, the practical effects are blunt." / "The rulebook has teeth." /
"Wall Street's biggest names will secure a blockchain starting tomorrow." /
"Tomorrow morning, VeChainThor rewrites its execution layer." /
"Thailand wants a daily speed limit on stablecoins." /
"Scale still belongs to the older sibling." / "Perspective matters." /
"The hinge is a same-customer rule." / "Interstellar is the third act of a trilogy."
Instead state the fact plainly: who did what, when, how much, according to whom.
Also banned: throat-clearing ("Here's the thing", "The uncomfortable truth"),
faux-insight asides ("This distinction matters", "It is worth noting"),
importance puffery ("pivotal moment", "testament", "vital role"),
colon reveals ("The detail that makes it work: ..."),
trailing importance clauses ("..., highlighting its significance"),
weasel attribution ("experts agree", "widely regarded"),
and the full banned-vocabulary list enforced by scripts/audit-article-quality.ts
(delver/foster/leverage/utilize/facilitate/empower/streamline/robust/
cutting-edge/paradigm/tapestry/realm/beacon/landscape/seamless/ ...).
When in doubt, shorter and plainer wins.

## 4. Images (mandatory, real photos only)

- Prefer the official source's press image (pressroom/announcement page).
  Else run: `node scripts/news-image.mjs "<entity or place>" "<fallback>"`
  and use its verified URL. NEVER logos, graphics, AI images, or stock.
- The host must already be in next.config.mjs `images.remotePatterns`
  (upload.wikimedia.org is). Choose an allowed source; do not edit application config.
- SELF-HOST the image: Wikimedia rate-limits hotlinked originals (HTTP 429),
  which breaks on-site rendering. Download it with a descriptive User-Agent
  (`HashtagWeb3NewsBot/1.0 (+https://hashtagweb3.com; editorial image use
  with attribution)`), pause 2-3s between downloads, resize to max 1920px
  wide, and reference the LOCAL path in front matter. Never hotlink
  upload.wikimedia.org originals in `image:`. Resize with Pillow
  (`python3 -c "from PIL import Image; im=Image.open('<tmp>'); im.thumbnail((1920,1920)); im.convert('RGB').save('public/images/news/<slug>.jpg', quality=88)"`;
  Pillow is pre-installed on the runner — do NOT use `sips`, it exists only
  on macOS and will fail on Linux).
- COMPRESS the hero before publishing (repo rule, max 350KB):
  `node scripts/compress-news-image.mjs <downloaded-tmp-file> <slug>`
  (resizes to 1920px, JPEG q78 mozjpeg; falls back to q75/1600px automatically).
  Keep PNG only when the image needs transparency.
- Front matter MUST include:
  image: /images/news/<slug>.jpg
  imageCaption: "<what the photo shows>. Photo: <author> via <source> (<license>)."
  imageCreditUrl: <source page URL>
  (Quote the caption value since it contains colons.)
- Confirm `content/articles/<slug>.md` exists and the hero file named in
  front matter is on disk under `public/images/news/`. Do not curl a page
  and do not start a server to check this.

## 5. Gates (all must pass; unresolved failures need a quality-gate deferral)

The coordinator stops all owned writer tools before running the validator when
research finishes or its time budget expires. It validates the ready batch even
when research coverage is incomplete. Pending drafts are preserved for recovery,
not approved. During research, check assigned articles' individual gates and
return their real outcomes. During repair, fix the reported unpublished drafts
and return; let the coordinator run the whole-batch validator after tools stop.
This uses the same article audits as the final publisher and writes exact
failures to `.cache/news-research/validation.json`.
Read the errors and fix the unpublished drafts before stopping. A successful
research report or a claimed word count does not replace this check. The actual
word counter excludes Markdown links, including their linked anchor text.
During an assignment, `complete: false` with no validation errors can mean other
assignments remain. Continue assigned reviews within the time budget; never
fabricate outcomes for candidates you have not reviewed. Only `draftsValid: true`
from actual audits, with at least one ready article, can qualify for publication.
Use source-backed detail to meet the minimum; do not add filler or invent facts.
CI can invoke up to three further repair rounds, each limited to ten minutes.

- `npx tsx scripts/audit-article-quality.ts --report --verbose` → your files clean
   (pre-existing failures elsewhere are baseline; yours must be absent).
- `npx tsx scripts/audit-article-images.ts` → zero failures repo-wide
  (this is a hard gate: missing/tiny/placeholder heroes and absent photo
  credits fail it).
- `npx tsx scripts/audit-article-duplicates.ts` → zero duplicate pairs.
  A same-story rewrite scores far above the threshold: if it trips, the
  story is already covered — drop it, do not reword and resubmit.
- `npx tsx scripts/audit-articles-formatting.ts` → zero issues in your files.
- `npx tsc --noEmit` → zero errors (if unrelated files fail, report and stop
  without pushing anything — never push on a red tree).
- Every outbound link in your articles returns HTTP 200 (curl check).
- Slug is one lowercase word without hyphens, with no collision with existing files. Never rename published URLs; this rule applies to new articles only.
- Check root ownership in `content/slug-types.json`, `content/legacy-slugs-archive.json`, `content/event-slug-history.json`, and `public/preview/<slug>.html`. Company and glossary names such as `circle`, `usdc`, `strategy`, and `gemini` may already own root URLs; choose a new, specific one-word slug instead.
- Never touch unrelated files.

## 6. Finish the assignment or repair

DRY-RUN VALUE FOR THIS RUN: $DRY_RUN
- Do not commit or push in either mode. Do not edit generated catalogs, prebuild
  hashes, workflow files or the ledger JSON directly. Use the review CLI.
- Mark qualifying articles ready only after their audits pass. CI independently
  validates quality, images, formatting, duplicates, typecheck and source links.
   The coordinator's ready-batch validator above must also pass. Unreviewed restored
   drafts belonging to other assignments remain intact for their own review;
   do not treat them as your rejected drafts.
- Move your own rejected/incomplete draft files out of `content/articles/` into
  `.cache/news-research/recovery/`; keep any actual deferred review records. If time
  runs out mid-review, preserve the draft and leave its outcome pending. The
  coordinator stages unreviewed drafts out of publication without approving them.
  Never move existing articles.
- CI publishes approved article files, their images and the review ledger together
  after the ready batch passes every gate. Unreviewed candidates remain pending;
  failed gates block publication. Recovery artifacts retain the unfinished drafts.
- In dry-run mode, CI creates no commits or posts.
- End with the candidate report, files drafted, word counts, sources read and
  explicit blockers, and the remaining unreviewed count. Only record a source-blocked
  deferral after actual access attempts and a specific retry search.
