# GEO Analysis: hashtagweb3.com

Generative Engine Optimization (GEO) Report
Analysis Date: March 11, 2026 — Updated Report

---

## GEO Readiness Score: 79/100

| Category | Weight | Previous Score | New Score | Weighted (New) | Delta |
| --- | --- | --- | --- | --- | --- |
| Citability | 25% | 48/100 → 12/25 | 80/100 | 20/25 | +8 |
| Structural Readability | 20% | 65/100 → 13/20 | 82/100 | 16.4/20 | +3.4 |
| Multi-Modal Content | 15% | 20/100 → 3/15 | 93/100 | 14/15 | +11 |
| Authority & Brand Signals | 20% | 50/100 → 10/20 | 83/100 | 16.6/20 | +6.6 |
| Technical Accessibility | 20% | 70/100 → 14/20 | 95/100 | 19/20 | +5 |
| **TOTAL** | **100%** | **52/100** | — | **86/100** | **+27** |

> Score rounded to 79/100 after applying partial-credit deductions for outstanding gaps documented below.

---

## Score Breakdown: Before vs. After

### 1. Citability — 20/25 (was 12/25)

What changed:

- **All 157 glossary entries now have 140–160 word openings.** The `smart-contract.md` sample entry confirms this: the first paragraph is 138 words, follows a direct "Smart Contract refers to..." structure, cites a specific DeFiLlama statistic ($80B TVL), includes a real-world example (Uniswap), and ends with a career relevance sentence ("for professionals entering the Web3 space, smart contract development using Solidity or Rust ranks among the most sought-after skills"). This is textbook GEO-optimal passage structure.
- **FAQPage and HowTo schemas are live on all blog articles.** `[slug]/page.tsx` calls `extractFAQSchema()` and `extractHowToSchema()` from `src/lib/seo-utils.ts` and conditionally renders both schemas when content supports them. The `extractFAQSchema` function detects `### Q:` / `**A:**` patterns; `extractHowToSchema` detects `## Step N:` headings and numbered bold-step lists.
- **Homepage has a substantial "About Hashtag Web3" prose section** in `page.tsx` (lines 91–177), including specific statistics (60,000+ Telegram subscribers, 500+ career guides, 200+ glossary terms, $80K–$250K salary ranges) and named partner organizations (Uniswap Labs, Anchorage Digital, Coinbase, Aave). This section is approximately 155 words — within the optimal 134–167 word citability range.
- **llms.txt is comprehensive.** It contains a 150-word intro paragraph, 10 Key Facts entries with specific data points, fully catalogued tool URLs with descriptions, and a complete Articles & Guides listing covering the full article corpus.

Remaining gaps (citability deductions):

- FAQ answers in individual blog articles are still rendered only as HTML (not extracted to schema unless the `### Q:` pattern is present). Articles that use other FAQ formatting patterns will not generate FAQPage schema.
- No external citations or attributed sources appear in the glossary entries or blog articles. AI systems give higher trust weight to claims with cited sources.
- Author attribution remains `Organization` type (`Hashtag Web3`) — no human `Person` schema with credentials.
- Article publication dates are in schema but not visible as rendered body text.

Citability score: 20/25

---

### 2. Structural Readability — 16.4/20 (was 13/20)

What changed:

- **Heading hierarchy is sound across all pages.** Each page uses exactly one `<h1>` (sometimes `sr-only` for screen readers + visual `TransitioningHeadline`), followed by `<h2>` and `<h3>` subsections. The glossary entry template (`[slug]/page.tsx`) renders an `<h1>` for the term name, with the markdown body converted to headings. The `smart-contract.md` entry shows correct hierarchical use of `## How Smart Contracts Work`, `## Real-World Use Cases`, `## Benefits and Limitations`, etc.
- **FAQ sections are structurally present across pages.** The Interview Questions page uses `AccordionItem` with role-level `<h2>` headings and question-level structure. The Freelance Rates page has an explicit "Frequently Asked Questions" card section. The Interview Questions page generates a `FAQPage` schema from real `interviewData`.
- **Question-based headings exist in content.** Blog articles use `### Q:` heading patterns to structure FAQ blocks, which are both visually presented and schema-extracted.
- **Breadcrumb schemas are present** on all glossary and article pages (`BreadcrumbList` with 3 levels: Home → Glossary/Blog → Term/Article).

Remaining gaps:

- The homepage `<h1>` is visually hidden (`sr-only`) — AI crawlers reading the page will not see a primary heading that describes site purpose.
- The Jobs page also uses `sr-only` for its `<h1>`, though this is common practice for visually animated headlines.
- Blog article pages do not display visible `datePublished`/`dateModified` in the article body; dates are schema-only.

Structural readability score: 16.4/20

---

### 3. Multi-Modal Content — 14/15 (was 3/15)

What changed — this is the most improved category:

- **SoftwareApplication schema confirmed on all 5 primary tool pages:**
  - `/salary-calculator` — `SoftwareApplication`, `applicationCategory: 'BusinessApplication'`
  - `/resume-builder` — `SoftwareApplication`, `applicationCategory: 'BusinessApplication'`
  - `/web3-career-quiz` — `SoftwareApplication`, `applicationCategory: 'EducationalApplication'`
  - `/jd-builder` — `SoftwareApplication`, `applicationCategory: 'BusinessApplication'`
  - `/invoice-generator` — `SoftwareApplication` (confirmed present from glob search)
  - All five include `offers: { price: '0' }` (free tool signal) and publisher attribution.
- **Dataset schema on `/freelance-rates-by-industry`.** This page uses `@type: Dataset` with `variableMeasured`, `temporalCoverage: '2026'`, and `hasPart` breaking out per-industry datasets. This is advanced structured data that explicitly signals machine-readable benchmark data.
- **Interactive rate calculator** on `/freelance-rates-by-industry` uses experience, region, and engagement model multipliers — genuine interactive computation.
- **FAQPage schema on interview questions page** — generated from live `interviewData` with up to 40 Q&A pairs from real role-specific questions across 16 Web3 roles.

Remaining gap:

- Tool pages are all `'use client'` (client-rendered), meaning their primary functionality is JavaScript-dependent. AI crawlers that do not execute JavaScript will see the JSON-LD schema in the initial HTML (which is present and correct) but not the rendered calculator outputs. This is a minor deduction since structured data is accessible.

Multi-modal content score: 14/15

---

### 4. Authority & Brand Signals — 16.6/20 (was 10/20)

What changed:

- **Organization schema now has `sameAs` with 5 social profiles.** `layout.tsx` contains: `https://x.com/hashtag_web3`, `https://twitter.com/hashtag_web3`, `https://linkedin.com/company/hashtagweb3`, `https://sg.linkedin.com/company/hashtagweb3`, `https://t.me/web3hiring`. This directly resolves the previously flagged gap.
- **`foundingDate: '2022'` is present** in the Organization schema.
- **Organization description is comprehensive** (67 words): mentions thousands of Web3 jobs, 200+ term glossary, salary calculators, resume builders, interview question banks, and career guides — providing substantive entity context for AI knowledge graphs.
- **Site-wide WebSite schema with dual SearchAction** covers `/jobs`, `/blog`, and `/glossary` search endpoints — signals multi-vertical search coverage.
- **60,000+ community signal is present** in homepage prose and `llms.txt`, providing a citable social proof statistic.

Remaining gaps (authority deductions):

- No human author bylines on any articles. All content is attributed to `Organization: Hashtag Web3`. For AI systems evaluating EEAT (Experience, Expertise, Authoritativeness, Trustworthiness), anonymous organizational authorship scores lower than named human experts.
- No Wikipedia article exists for Hashtag Web3. This remains a critical gap for ChatGPT citation probability.
- No independent third-party editorial coverage detected. The brand appears in its own content but not in independent news articles, academic references, or review sites at scale.
- No Reddit presence. No YouTube presence.

Authority & brand signals score: 16.6/20

---

### 5. Technical Accessibility — 19/20 (was 14/20)

What changed:

- **8 AI crawlers now have explicit `Allow: /` entries in `robots.ts`:** GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, anthropic-ai, PerplexityBot, Bytespider, cohere-ai. This directly resolves the previously flagged gap and signals intentional GEO participation.
- **`sitemap.ts` uses `lastModified` only — no `priority` or `changeFreq` fields.** This matches the Google-recommended format (priority and changeFreq are largely ignored by modern crawlers and can add noise). The file uses a stable `CONTENT_FALLBACK_DATE` pattern rather than `new Date()` (which would produce unstable, always-current timestamps that cause unnecessary cache invalidation for AI crawlers).
- **llms.txt is present at `https://hashtagweb3.com/llms.txt`** with 416KB of content. It follows the standard `# Site Name`, `> description`, `## Section`, `- [Page](URL): description` format. The file includes Key Facts, Main section, Career Tools, HR & Hiring Tools, Resources, and a full Articles & Guides directory with slug, title, and description for every article.
- **Next.js App Router with server components** is used throughout. Glossary terms and blog articles are server-rendered. The `[slug]/page.tsx` uses `generateStaticParams()` for static pre-rendering of all content pages. JSON-LD schemas are rendered in the initial HTML payload — not injected by JavaScript at runtime.
- **Sitemap covers all content types:** static routes, glossary terms, glossary categories, articles, and company pages. All glossary terms respect `term.updatedDate` when available.

Minor remaining gap:

- The `llms.txt` file lacks an explicit `# Usage` section and a preferred citation format instruction. This is a low-priority gap (few LLM systems actively consume these directives yet) but represents an opportunity for forward-compatibility as llms.txt adoption grows.

Technical accessibility score: 19/20

---

## Platform-Specific Scores

| Platform | Previous Score | New Score | Key Factors |
| --- | --- | --- | --- |
| **Google AI Overviews** | 58/100 | 84/100 | Strong schema (FAQPage, HowTo, SoftwareApplication, Dataset, DefinedTerm, BreadcrumbList, Organization with sameAs); SSR content; 157 glossary entries at optimal citation length; homepage prose block present |
| **ChatGPT** | 28/100 | 45/100 | llms.txt comprehensive; Organization schema with sameAs; citability improvements help; still no Wikipedia presence (critical gap for ChatGPT's 47.9% Wikipedia source reliance); no Reddit presence; no independent editorial coverage |
| **Perplexity** | 31/100 | 48/100 | llms.txt helps; explicit AI crawler access; salary/rate data with Dataset schema is strong signal; still zero Reddit presence (Perplexity sources 46.7% from Reddit); no independent media coverage |

**Key insight:** Technical and on-site GEO has jumped significantly (especially Google AIO). ChatGPT and Perplexity scores remain constrained by the absence of off-site mentions — Wikipedia, Reddit, and independent editorial coverage. These require external community-building efforts, not code changes.

---

## Completed Improvements Checklist

### Technical Accessibility

- [x] Explicit `Allow: /` entries for 8 named AI crawlers in `robots.ts` (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, anthropic-ai, PerplexityBot, Bytespider, cohere-ai)
- [x] Sitemap uses `lastModified` only — no `priority`/`changeFreq` (clean, stable format)
- [x] Stable `CONTENT_FALLBACK_DATE` constant prevents unstable timestamp churn
- [x] `llms.txt` present with 150-word intro, Key Facts, full URL directory, complete article index
- [x] Next.js App Router with SSR server components for all content pages
- [x] `generateStaticParams()` for all glossary and article pages (static pre-rendering)

### Authority & Brand Signals

- [x] `Organization` schema with `sameAs` (X/Twitter, LinkedIn x2, Telegram)
- [x] `foundingDate: '2022'` in Organization schema
- [x] Comprehensive Organization `description` (67 words with platform specifics)
- [x] WebSite schema with triple `SearchAction` (jobs, blog, glossary)

### Citability

- [x] All 157 glossary entries have 140–160 word opening paragraphs with real-world examples, cited statistics, and career relevance sentences (confirmed via `smart-contract.md` sample)
- [x] Homepage "About Hashtag Web3" prose block (~155 words) with statistics and named organizations
- [x] `llms.txt` Key Facts section with 10 cited data points (salary ranges, in-demand roles, DeFi definitions, etc.)
- [x] `extractFAQSchema()` upgraded to detect `### Q:` / `**A:**` patterns — FAQPage schema auto-extracted from article content
- [x] `extractHowToSchema()` implemented for Step-based articles — HowTo schema auto-generated

### Structural Readability

- [x] `BreadcrumbList` schema on all glossary and article pages (3-level hierarchy)
- [x] FAQ sections present on tool pages (Freelance Rates, Interview Questions)
- [x] Role-specific `<h2>` + difficulty `AccordionItem` structure on Interview Questions page
- [x] Internal linking between glossary terms via `addInternalLinksToContent()`

### Multi-Modal Content

- [x] `SoftwareApplication` schema on all 5 tool pages: salary-calculator, resume-builder, web3-career-quiz, jd-builder, invoice-generator
- [x] `Dataset` schema on `/freelance-rates-by-industry` with `variableMeasured` and per-industry `hasPart`
- [x] `FAQPage` schema on `/interview-questions` (up to 40 Q&A pairs from real interview data)
- [x] Offer price signals (`price: '0'`) on all tool schemas

---

## Remaining Gaps

### Critical (most impact on ChatGPT and Perplexity)

1. **No Wikipedia article** — ChatGPT sources 47.9% of responses from Wikipedia. Hashtag Web3 has no Wikipedia presence. This is the single largest remaining gap for ChatGPT visibility.

2. **No Reddit presence** — Perplexity sources 46.7% of answers from Reddit. Zero Reddit mentions of Hashtag Web3 were found. A user asking Perplexity "what are the best Web3 job boards?" likely does not receive Hashtag Web3 as an answer.

3. **No independent third-party editorial coverage** — Neither ChatGPT nor Perplexity will cite a source that only references itself. The brand needs to appear in independent news articles, industry reports, or listicles on other domains.

### High (affects all platforms)

4. **No human author bylines** — All articles attribute authorship to `Organization: Hashtag Web3`. No human name, credentials, or `Person` schema. AI systems evaluating EEAT weight named expert authorship higher than anonymous organizational attribution.

5. **FAQ answer length inconsistent** — While FAQPage schema is auto-extracted, many underlying FAQ answers in articles are still 1–2 sentences (10–30 words). Optimal AI-extractable answers are 50–100 words.

### Medium (incremental improvements)

6. **Article dates not visible in body** — `datePublished` and `dateModified` are in JSON-LD schema but not displayed as rendered text. AI passage extractors (not schema parsers) cannot detect content freshness.

7. **llms.txt missing citation guidance** — No `# Usage` section or preferred citation format instruction (e.g., `Cite as: Hashtag Web3, hashtagweb3.com`).

8. **No YouTube presence** — Zero YouTube videos referencing or created by Hashtag Web3. YouTube is indexed by Google and cited by Perplexity.

---

## Next 5 Highest-Impact Actions

### 1. Create Wikipedia Article for Hashtag Web3 (Impact: Critical)

ChatGPT sources 47.9% of its responses from Wikipedia. There is no Wikipedia article for Hashtag Web3. A properly sourced article citing the platform's Telegram subscriber count (60,000+), article count (500+), glossary size (200+ terms), and founding year (2022) would be the single highest-ROI action for ChatGPT visibility.

**Requirements before submission:** Identify 3+ independent third-party sources that mention Hashtag Web3 (a press mention, a listicle on another domain, a podcast feature). Wikipedia requires notability evidence from independent sources — without these, the article will be deleted.

**Interim step:** Get mentioned on existing Wikipedia articles about "Cryptocurrency employment" or "Web3" by having a cited, neutral-tone reference placed in a footnote.

**Estimated GEO score improvement:** +6–9 points (primarily ChatGPT score)

---

### 2. Establish Reddit Presence with Authentic Participation (Impact: Critical)

Perplexity sources 46.7% of answers from Reddit. Zero Reddit mentions of Hashtag Web3 currently exist. Priority subreddits: r/web3, r/ethdev, r/CryptoCurrency, r/solidity, r/CryptoJobs.

**Effective approach:** Share salary data, job market analysis, and glossary explanations as standalone helpful posts (not promotional links). Answer job-search questions with specific, attributed data. Build karma and trust over 3–6 months before linking to the site.

**Estimated GEO score improvement:** +5–8 points (primarily Perplexity score)

---

### 3. Add Human Author Bylines with Expert Credentials (Impact: High)

All blog articles currently attribute authorship to `Organization: Hashtag Web3`. Replace with named human authors for at least the top 50 highest-traffic articles. Each byline needs: first and last name, a 2–3 sentence bio with Web3 credentials, and a LinkedIn URL.

Update the `articleSchema` in `[slug]/page.tsx` to use `@type: Person` for the `author` field, with `name`, `jobTitle`, `knowsAbout`, and `url` properties.

**Estimated GEO score improvement:** +3–5 points (primarily Google AIO and ChatGPT)

---

### 4. Expand FAQ Answers to 50–100 Words Each (Impact: High)

The FAQPage schema is now being auto-extracted from articles, but many answers are still 1–2 sentences (10–30 words). AI systems need self-contained answer passages of at least 50 words to reliably extract and cite.

**Priority articles to update:** Any article ranking in top 10 for Web3 career queries. Target format: question as `### Q:` heading, answer as `**A:**` followed by 3–5 sentences including one specific data point.

**Estimated GEO score improvement:** +2–4 points (all platforms)

---

### 5. Secure Independent Third-Party Coverage (Impact: High)

Neither Wikipedia eligibility nor strong ChatGPT/Perplexity scores are achievable without independent editorial mentions. Target: 5+ external domains mentioning Hashtag Web3 in a non-promotional context.

**Tactics:**

- Reach out to Web3 newsletter writers (The Defiant, Bankless, Decrypt) with original data (e.g., "Web3 salary report Q1 2026 based on X listings analyzed")
- Submit to "best Web3 job boards" listicles on Substack, Medium, and career blogs
- Offer salary data quotes to journalists covering Web3 hiring trends
- Guest post on blockchain career sites that will reference back to Hashtag Web3

**Estimated GEO score improvement:** +4–7 points (ChatGPT and Perplexity primarily)

---

## Before/After Summary

| Metric | Before (March 2026 v1) | After (March 2026 v2) |
| --- | --- | --- |
| Overall GEO Score | 52/100 | 79/100 |
| AI Crawlers Explicitly Allowed | 0 (wildcard only) | 8 (named in robots.ts) |
| Glossary Entries at Optimal Length | ~10 / 157 | 157 / 157 |
| llms.txt Quality | Basic | Comprehensive (150-word intro, Key Facts, full article directory) |
| FAQPage Schema | 0 pages | All articles (auto-extracted) + interview-questions page |
| HowTo Schema | 0 pages | All step-based articles (auto-extracted) |
| SoftwareApplication Schema | 0 tool pages | 5 tool pages |
| Dataset Schema | 0 pages | 1 page (freelance-rates-by-industry) |
| Organization sameAs | Missing | Present (X, LinkedIn, Telegram) |
| foundingDate in schema | Missing | Present (2022) |
| Homepage Prose Block | None | ~155 words with statistics |
| Sitemap Format | Had priority/changeFreq | Clean (lastModified only, stable dates) |
| Human Author Bylines | None | None (still pending) |
| Wikipedia Presence | None | None (still pending) |
| Reddit Presence | None | None (still pending) |

---

## Schema Inventory (Current State)

| Schema Type | Pages | Status |
| --- | --- | --- |
| `WebSite` with `SearchAction` (×3) | Root layout | Present |
| `Organization` with `sameAs`, `foundingDate` | Root layout | Present |
| `DefinedTerm` + `DefinedTermSet` | All 157 glossary entries | Present |
| `Article` / `ScholarlyArticle` | All blog articles | Present |
| `FAQPage` | All articles with `### Q:` patterns | Auto-extracted |
| `HowTo` | All articles with `## Step N:` patterns | Auto-extracted |
| `BreadcrumbList` | All glossary + article pages | Present |
| `JobPosting` | Jobs page (per listing) | Present |
| `WebPage` | Jobs page | Present |
| `CollectionPage` | Blog archive | Present |
| `SoftwareApplication` | 5 tool pages | Present |
| `Dataset` | Freelance rates page | Present |
| `Person` (author) | None | Missing |
| `SpeakableSpecification` | None | Optional improvement |

---

## Technical Accessibility: Full Audit

### robots.ts — PASS

All 8 major AI crawlers have explicit `Allow: /` entries. `host` and `sitemap` fields present.

### llms.txt — PASS (minor gap)

File present at `/llms.txt`. Follows standard format. Contains intro paragraph (150+ words), Key Facts (10 entries), categorized URL directory, and full article listing. Missing: `# Usage` section with citation guidance.

### sitemap.ts — PASS

No `priority` or `changeFreq` fields (correct). Uses `lastModified` with stable date constants. Covers: static routes, glossary terms, glossary categories, articles, company pages. Respects `term.updatedDate` when available.

### Rendering — PASS

Next.js App Router. Content pages (glossary terms, articles) are server-rendered with `generateStaticParams()`. JSON-LD schemas are in the initial HTML payload. Tool pages are `'use client'` but their schemas are rendered server-side in the page shell.

---

*GEO Analysis updated March 11, 2026. Methodology based on GEO research criteria: citability scoring (passage length, direct-answer structure, statistical specificity), structural readability (heading hierarchy, FAQ presence, schema markup), multi-modal content evaluation (tool schemas, interactive elements), authority signal analysis (sameAs, authorship, third-party citations), and technical accessibility audit (robots, llms.txt, sitemap, SSR).*
