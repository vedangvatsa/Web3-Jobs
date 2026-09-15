# News Publishing Run — Hashtag Web3

You are publishing 0-2 new News articles for hashtagweb3.com. Today is $TODAY (UTC).
Work in /Users/vedang/ZCodeProject/Web3-Jobs (repo root is the working directory).

## 1. Discover (5 min)

Run: `node scripts/news-discover.mjs --hours 10 --max 12`
Pick AT MOST $MAX_ARTICLES stories. A story qualifies ONLY if ALL hold:
- Published within the lookback window (fresh news, not analysis of old events).
- Has a verifiable primary source (official announcement, filing, regulator page,
  company pressroom) OR two independent reputable reports you can open and read.
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
- 800+ words of body prose (target 850-1000).
- Inline hyperlinks at each claim. Attribute everything (`said`, `according to`,
  `reported`, `plans`). Preserve uncertainty from sources.
- Vary attribution placement: never end more than two consecutive sentences
  with `according to X` / `reported Y`. Lead some sentences with the source
  ("Cointelegraph reported ..."), bury some mid-sentence, and let plain
  established facts stand with just the link.
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
- Front matter MUST include:
  imageCaption: "<what the photo shows>. Photo: <author> via <source> (<license>)."
  imageCreditUrl: <source page URL>
  (Quote the caption value since it contains colons.)
- Confirm the image URL returns HTTP 200 before using it.

## 5. Gates (all must pass — repair once, else drop the story)

- `npx tsx scripts/audit-article-quality.ts --report` → your files clean
  (pre-existing failures elsewhere are baseline; yours must be absent).
- `npx tsx scripts/audit-articles-formatting.ts` → zero issues in your files.
- `npx tsc --noEmit` → zero errors (if unrelated files fail, report and stop
  without pushing anything — never push on a red tree).
- Every outbound link in your articles returns HTTP 200 (curl check).
- Slug is 1-2 lowercase hyphenated words, no collision with existing files.
- Max $MAX_ARTICLES articles per run. Never touch unrelated files.

## 6. Publish

DRY-RUN VALUE FOR THIS RUN: $DRY_RUN
- If that value is true, git commit and git push are FORBIDDEN. Draft files
  may exist in the working tree for gating, but create NO commits and push
  nothing — print the summary and stop.
  (The git remote is also disabled in dry-run mode, so any push attempt
  will fail — treat that failure as confirmation, not as something to fix.)
- In a live run, `git add` ONLY your new article files (+ next.config.mjs
  only if you added an image host). Nothing else.
- Commit message: `news: add <slug>[, <slug>] for <YYYY-MM-DD>`.
- Push with rebase retry (max 3): pull --rebase, push; never force-push.
- Print a final summary: files added, word counts, sources used, audits green.
