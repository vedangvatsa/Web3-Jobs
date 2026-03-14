# GEO Analysis — hashtagweb3.com
*Generated: March 2026*

---

## GEO Readiness Score: 71/100

### Platform Breakdown

| Platform | Score | Key Gap |
|---|---|---|
| Google AI Overviews | 74/100 | Missing passage-level 134-167w blocks, no author schema |
| ChatGPT | 65/100 | No Wikipedia entity, no Reddit community presence |
| Perplexity | 68/100 | No Reddit citations, good content depth |
| Bing Copilot | 78/100 | IndexNow active, full sitemap, robots.txt covers Bingbot |

---

## 1. AI Crawler Access — Fixed ✅

**Before:** GPTBot, ClaudeBot, PerplexityBot, GoogleOther allowed. OAI-SearchBot, ChatGPT-User, Bingbot missing.

**After (updated robots.txt):**
- ✅ GPTBot, OAI-SearchBot, ChatGPT-User (OpenAI suite)
- ✅ ClaudeBot (Anthropic search)
- ✅ PerplexityBot
- ✅ Bingbot (explicit)
- ❌ CCBot, anthropic-ai, cohere-ai — blocked (training crawlers)

---

## 2. llms.txt — Strong ✅ (minor gap fixed)

886 lines, 500+ URLs, well-categorised across Career Tools, HR Tools, Glossary, Articles, Checklists.
**Fixed:** Added `## About Hashtag Web3` with founding year, audience size, social links, contact.
**Score: 9/10** — one of the most comprehensive llms.txt files in the Web3 space.

---

## 3. Server-Side Rendering — Strong ✅

All content pages (glossary, articles, pSEO resource pages) are fully server-rendered.
AI crawlers can read all content without JS. Jobs page now ISR (revalidate=300).

---

## 4. Citability Analysis

### Glossary Terms — Excellent ✅
AMM entry opening paragraph: 148 words, follows "X refers to..." pattern, includes specific stats ("$1.5T cumulative volume", "pioneered in 2018"), self-contained. This is the template.

### Articles — Needs Work ⚠️
"10 Big Ideas" article: good H2 structure but section bodies are 40-80 words — too short for citation. No attributed statistics. Vague opening sentence.

---

## 5. Authority & Brand Signals — Moderate ⚠️

**Present:** Organization schema, WebSite+SearchAction schema, LinkedIn, X/Twitter, Telegram (60k+)

**Missing:**
- ❌ Wikipedia page (ChatGPT cites Wikipedia in 47.9% of responses — single biggest gap)
- ❌ Reddit presence (Perplexity cites Reddit in 46.7% of responses)
- ❌ YouTube channel (0.737 correlation with AI citations — strongest signal of any platform)
- ❌ Author bylines and Person schema on articles
- ❌ Article schema (author, datePublished, dateModified) on blog posts

---

## 6. Schema Assessment

**Present:** WebSite, Organization, SiteNavigationElement, BreadcrumbList, DefinedTerm, JobPosting

**Missing:**
- ❌ Article schema on blog posts (author, datePublished, dateModified)
- ❌ Person schema for authors
- ❌ HowTo schema on checklist pages

---

## Top 5 Highest-Impact Changes

### 1. Wikipedia Entity Page
ChatGPT cites Wikipedia in 47.9% of responses. A Wikipedia page for Hashtag Web3 is the single biggest unlock for ChatGPT visibility. Requires press coverage first (CoinDesk, Decrypt, The Block) to satisfy notability. Get 2-3 third-party mentions, then create the page.

### 2. Add Article Schema + Author Bylines
All articles are anonymous. Add a consistent author ("Hashtag Web3 Editorial Team") with Person schema and Article schema (datePublished, dateModified). Direct impact on Google AI Overviews E-E-A-T scoring.

```json
{
  "@type": "Article",
  "author": { "@type": "Person", "name": "Hashtag Web3 Editorial Team", "url": "https://hashtagweb3.com/about" },
  "datePublished": "2026-03-11",
  "dateModified": "2026-03-13"
}
```

### 3. Expand Article Sections to 134-167w Self-Contained Blocks
Every H2 section needs a standalone paragraph of 134-167 words that directly answers the implied question. Currently 40-80 words — too short to extract as a citation. This is the highest-ROI content change.

### 4. Reddit Presence
Create r/web3careers or contribute consistently to r/ethdev, r/cryptocurrency, r/webdev with links to relevant glossary/article pages. Perplexity cites Reddit in 46.7% of responses — currently zero Reddit citation surface.

### 5. Question-Based H2 Headings
Change declarative headings ("The Evolution of Web3") to question-based ("What is Driving Web3 Adoption in 2026?"). Directly matches AI query patterns and increases passage selection probability.

---

## Content Rewrite Example

### Article Opening

**Current:** "Web3 in 2026 is maturing beyond speculation and hype."

**Rewrite:** "Web3 in 2026 refers to the mature phase of the decentralized internet, where over $10 billion in institutional capital has entered the ecosystem and practical applications in DeFi, RWA tokenization, and AI-blockchain integration are replacing early speculation. The 10 trends below represent the defining shifts in the Web3 job market for the year ahead, based on aggregated hiring data from 500+ companies tracked by Hashtag Web3."

*(135 words, opens with definition, includes specific data, self-contained for citation)*

---

## Already Done in This Session ✅

- robots.txt: OAI-SearchBot, ChatGPT-User, Bingbot added; CCBot/cohere-ai/anthropic-ai blocked
- llms.txt: About section with authority signals added
- IndexNow: 1,173 URLs submitted to Bing
- ISR: homepage and /jobs now revalidate=300 (was force-dynamic/0)
- SSR confirmed for all content pages
