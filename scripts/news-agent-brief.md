# News Publishing Run — Hashtag Web3

You are publishing every qualifying News article for hashtagweb3.com. Today is $TODAY (UTC).
Work in the repository root (current working directory on the runner).

## 0. Tips first (mandatory)

Read `content/news-tips.md` FIRST. Every pending lead there was hand-picked
because RSS missed it — verify its date/facts like any other story and cover
it if it qualifies (fresh, verifiable, concrete, not a duplicate). In a live
run, delete the lines you covered or rejected-as-stale in the same commit.

## 1. Discover (5 min)

Run: `node scripts/news-discover.mjs --hours 24 --max 40`
(Candidates with `alsoCoveredBy` are multi-outlet stories — prefer those.)
Write every story that qualifies. There is no article-count cap. A story qualifies ONLY if ALL hold:
- Published within the lookback window (fresh news, not analysis of old events).
- Has a verifiable primary source when one exists, and at least two independent
  sources you can open and read on separate sites. Two is the minimum; more is fine.
- Does not duplicate an existing article in content/articles/ (check slugs AND titles;
  a new development on a covered topic is OK only as a NEW event with fresh reporting,
  never a rewrite).
- Is a concrete event (launch, vote, ruling, filing, hack, raise, upgrade), not
  price chatter, predictions, explainers, or opinion.
- Exclusions: job boards, token/price-calendar items, rumors from a single weak source.

If nothing qualifies, STOP. Commit nothing, push nothing, exit 0.
Slow-news days with zero output are correct behavior.

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
- Confirm the local file exists and renders (curl the page, check for the
  /images/news/ path in the HTML) before publishing.

## 5. Gates (all must pass — repair once, else drop the story)

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

## 6. Publish

DRY-RUN VALUE FOR THIS RUN: $DRY_RUN
- If that value is true, git commit and git push are FORBIDDEN. Draft files
  may exist in the working tree for gating, but create NO commits and push
  nothing — print the summary and stop.
  (The git remote is also disabled in dry-run mode, so any push attempt
  will fail — treat that failure as confirmation, not as something to fix.)
- In a live run, `git add` ONLY your new article files (+ next.config.mjs
  only if you added an image host). Nothing else. Git identity is already
  configured on the runner — do NOT pass `-c user.name`/`-c user.email`,
  and do NOT run `git rebase --continue` unless a rebase is actually
  stopped on a conflict.
- Commit message: `news: add <slug>[, <slug>] for <YYYY-MM-DD>`.
- Push with rebase retry (max 3): pull --rebase, push; never force-push.
  If a pull --rebase reports conflicts you cannot resolve cleanly, stop
  WITHOUT pushing: exit 0 with drafts uncommitted in the working tree and
  print PUSH_BLOCKED plus the conflicting files.
- Print a final summary: files added, word counts, sources used, audits green.
