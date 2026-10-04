# News Publishing Run — Hashtag Web3

You are publishing every qualifying News article for hashtagweb3.com. Today is $TODAY (UTC).
Work in the repository root (current working directory on the runner).

Do not launch the site. Do not signal or stop other processes.
This is a fresh checkout. Do not assume an earlier run left uncommitted drafts.
Read tips and run discovery on every run, including when the working tree is clean.
Then research, write and validate qualifying new articles and their images.
CI owns commits and pushes. Do not run git commit, git push or git rebase.
There is one daily news batch and one scheduled website deployment slot.

## 0. Tips first (mandatory)

Read `content/news-tips.md` FIRST, then `.cache/news-research/queue.json`.
The queue includes those tips, fresh feed candidates, and deferred leads from
earlier daily runs. Verify dates and facts for tips just as for feed stories.
Record their outcomes by candidate ID; CI removes resolved tip lines.

## 1. Review the entire daily queue

Run `node scripts/news-research.mjs queue`. Review EVERY assigned candidate,
including deferred leads. There is no two- or three-article target and no article
count cap. Do not stop when the first few articles are done. Prefer candidates
with several source URLs, then pursue alternate outlets and primary records when
a source is blocked. A five-minute discovery pass is not a research deadline.

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

Every candidate must end with a recorded outcome: ready, rejected or deferred.
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

Run `node scripts/news-research.mjs report` before stopping. Zero articles is a
valid outcome only when every candidate has an explained disposition. An
unreviewed candidate makes the run incomplete even when other drafts are ready.

## 2. Research (mandatory)

Open and READ every source you will cite (use WebFetch; follow redirects).
Never infer a fact from a URL, headline, snippet, or another article's wording.
Record for each fact: value, source URL, source date. If a fact cannot be
verified in an opened source, omit it. Never invent dates, numbers, quotes,
names, or plans.

## 3. Write (follow content/articles/AGENTS.md exactly)

- File: content/articles/<one-or-two-word-slug>.md, `category: News`, complete
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
  (upload.wikimedia.org is). If the best image needs a new official host,
  add it to remotePatterns in the same run.
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

- `npx tsx scripts/audit-article-quality.ts --report` → your files clean
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
- Slug is 1-2 lowercase hyphenated words, no collision with existing files.
- Never touch unrelated files.

## 6. Finish the daily review

DRY-RUN VALUE FOR THIS RUN: $DRY_RUN
- Do not commit or push in either mode. Do not edit generated catalogs, prebuild
  hashes, workflow files or the ledger JSON directly. Use the review CLI.
- Mark qualifying articles ready only after their audits pass. CI independently
  validates quality, images, formatting, duplicates, typecheck and source links.
- Move your own rejected/incomplete draft files out of `content/articles/` into
  `.cache/news-research/recovery/`; keep their deferred review records. Every draft
  left in `content/articles/` must have a ready outcome. Never move existing articles.
- CI publishes approved article files, their images and the review ledger together
  after the full daily review is complete. Unreviewed candidates or failed gates
  keep the batch incomplete. Recovery artifacts retain the draft files.
- In dry-run mode, CI creates no commits or posts.
- End with the candidate report, files drafted, word counts, sources read and
  explicit blockers. A source that remains blocked must have a deferred record.
