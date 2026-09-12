# News Article Editorial Guide

Apply this guide only to a new or materially revised native article with `category: News`. It is the standing brief for news work; do not ask the user to repeat these rules. It does not apply to jobs, events, glossary pages, resources, or non-news articles.

## Scope And Routing

- Native news lives in `content/articles/<short-root-slug>.md` and is published at `https://hashtagweb3.com/<short-root-slug>`.
- Do not use `/news/<slug>` for a native article. The `/news` page is the listing page.
- Set `category: News`. Native news is included on `/news` automatically and receives `NewsArticle` JSON-LD from `src/app/[slug]/page.tsx`.
- Use a short, descriptive, lowercase hyphenated slug of one or two words only. Do not change a published slug without adding an intentional redirect.
- Do not duplicate or restate an external RSS item as native content unless the article adds original, source-bound reporting or analysis.

## Required Front Matter

Every news article must include:

```yaml
---
title: Clear factual headline
description: One-sentence factual summary of the news and its immediate context.
image: https://official-source.example/image.png
category: News
data-ai-hint: concise visual subject
publishedDate: 'YYYY-MM-DD'
lastUpdated: 'YYYY-MM-DD'
---
```

- Use real ISO dates. `publishedDate` is the date Hashtag Web3 publishes the report; it must not be a future date.
- Update `lastUpdated` only when the article itself receives a substantive revision.
- The headline, description, body, image, and dates must agree. Do not use a headline that promises a claim the body cannot support.
- Use a concise factual headline, not a clickbait question, a prediction, or a keyword list.

## Reporting And Attribution

- Treat every article as reported journalism. Follow the ordinary standards of accuracy, verification, attribution, fairness, context, correction, and clear separation of fact from analysis.
- Fact-check every factual statement before publishing. Verify names, titles, dates, figures, product names, availability, quotations, legal claims, and technical descriptions against the linked source.
- Never hallucinate, fabricate, embellish, or fill gaps with plausible-sounding details. If a fact cannot be verified, omit it. Do not create fake sources, citations, quotations, images, statistics, dates, companies, people, products, or claims.
- Report only facts supported by reliable primary sources or reputable, directly relevant reporting.
- Prefer the official announcement, filing, product documentation, release notes, court record, or named primary source. Use independent reporting when it supplies necessary context that the primary material does not.
- Open and read each source before relying on it. Never infer a fact from a URL, a search snippet, an image, or another article's wording.
- Do not invent dates, numbers, product availability, leadership roles, customer relationships, legal status, market claims, quotes, or future plans.
- Cite sources as natural inline hyperlinks at the point where each claim appears. For example: `the company said in its [release](https://example.com/release)`. A reader must be able to open the link and check the claim without consulting a source list.
- Make it clear whether a statement comes from the company, an executive, a filing, or independent reporting. Do not write a company's marketing claim as an established fact.
- Use calibrated language for every claim whose outcome, scope, timing, or meaning is uncertain. Attribute and hedge with words such as `said`, `according to`, `reported`, `plans`, `expects`, `aims`, `may`, `could`, `appears`, or `has not disclosed`, as the source and evidence require.
- Preserve uncertainty. If the source says "plans," "expects," "may," or "subject to," retain that qualification. Do not turn an announcement, projection, opinion, or marketing claim into a certainty.
- Add analysis only when it follows plainly from cited facts. Label inference through precise wording such as "this leaves" or "the release does not specify"; do not present inference as reported fact.
- Write independently. Do not closely paraphrase a source or reproduce its promotional language.

## Style And Structure

- Write like a careful human reporter or analyst: direct, specific, calm, and readable.
- Start with the event, the parties involved, what changed, and the confirmed timing. Do not begin with abstract industry framing.
- Use headings only when they name a real subject in the article, such as `## The separation terms`, `## Money Account`, or `## User access during the transition`.
- Organize by facts and unresolved details, not by an article template. A short report does not need headings merely to look complete.
- Vary sentence and paragraph length. Use paragraphs with a single clear point.
- Explain technical terms only when readers need the explanation to understand the news. Define them plainly and briefly.
- Do not add a generic conclusion, a recap that repeats the introduction, a moral, or speculative career advice.
- Do not add a `Sources`, `References`, `Further reading`, or bibliography section when the article already cites sources inline.
- Do not use FAQ, key-takeaway, checklist, table, or "what to watch" sections unless the reporting genuinely requires that format.

### Editing Existing Reporting

- Make the minimum effective edit. Preserve a reporter's real voice, vocabulary, cadence, uncertainty, and useful edge when revising a draft. Do not make every paragraph equally polished or flatten a distinctive sentence merely for consistency.
- Lead with the reported point when setup adds nothing. Keep context, a reported aside, or a qualification when it explains the facts.
- Use active voice when it makes the actor and action clearer. Do not let products, announcements, or markets perform human actions when the responsible company or person can be named.
- Prefer names, dates, figures, mechanisms, and examples to abstract description. Protect a useful specific fact instead of smoothing it into a broad claim.
- Apply the portability test: if a sentence could be moved unchanged to another company, product, or event, it is probably filler. Replace it with a source-backed fact, mechanism, consequence, or remove it.
- Let facts and attributed evidence establish significance. Do not tell the reader that a point is important, surprising, obvious, subtle, or historic without showing why.
- Make verbs carry the sentence. Prefer `decided`, `launched`, `delayed`, or `changed` over weak phrases such as `made a decision`, `has the ability to`, or `serves as`.
- Keep the structure unless it prevents the reader from understanding the reporting. Reorganize only to make the facts, chronology, or uncertainty clearer.
- Make every sentence earn its place. Remove a qualifier, transition, or paragraph when it adds no fact, attribution, context, or necessary uncertainty.
- Cut empty adverbs such as `just`, `literally`, `honestly`, `simply`, `actually`, `truly`, `fundamentally`, `importantly`, `crucially`, `inherently`, and `inevitably` unless they carry a precise meaning in context.
- Cut empty lead-ins such as `at the end of the day`, `when it comes to`, `at its core`, `in today's world`, `in the world of`, `the reality is`, `the truth is`, `in terms of`, `with regard to`, `in order to`, and `going forward`.
- Use the same clear noun when it is the accurate noun. Do not cycle among `company`, `firm`, `business`, `organization`, `platform`, or `tool` merely for variety.
- Avoid repeated sentence shapes, stacked fragments, and paragraphs that all follow the same template. Vary the rhythm only when it improves clarity; do not manufacture punchiness.
- End on the last concrete reported fact, limitation, or next verified development. Do not append a summary, a mic-drop line, a metaphor, or an instruction about what the reader should conclude.

### Prohibited Formulaic Language

Avoid generic AI-shaped framing and stock transitions, including:

- `Why this matters`, `What users and builders should watch next`, `The bigger picture`, `Key takeaways`, and similar catch-all headings.
- `The announcement is not proof that...`, `This is more than...`, `It is a clearer commitment...`, `The distinction is simple on paper`, and `For people working in Web3...`.
- Empty contrast constructions such as `not X, but Y` when a direct statement is clearer.
- Vague assessments such as `worth watching`, `a useful division of roles`, `a meaningful shift`, `an exciting development`, `game changer`, `landmark`, `seamless`, or `the future of` unless a source is being quoted and the attribution makes that clear.
- Throat-clearing and faux-insight setups such as `Here's the thing`, `Let me be clear`, `The uncomfortable truth`, `What most people get wrong`, `What nobody tells you`, and `The part everyone misses`.
- Interpretive asides such as `This distinction matters`, `The key point is`, `As you can see`, `In other words`, `It is worth noting`, and `It is important to note` when the surrounding reporting already makes the point.
- Importance puffery such as `marks a pivotal moment`, `stands as a testament`, `plays a vital role`, `underscores its significance`, or `solidifies its position`.
- Colon reveals such as `The detail that makes it work: ...` or `The best part: ...`. Use a complete sentence unless the colon introduces a real list, label, or quotation.
- Superficial analysis such as trailing `highlighting`, `underscoring`, `reflecting`, or `showcasing` clauses that merely announce importance. State the mechanism or consequence, or remove the clause.
- Weasel attribution such as `experts agree`, `many argue`, `widely regarded as`, `studies show`, or `industry reports suggest`. Name and link the source or remove the claim.
- Rhetorical setups, self-answered questions, dramatic fragments, and fake-profound closing lines. State the fact plainly and end on the last concrete reported point.
- Banned AI vocabulary unless it is inside an attributed quotation: `delve`, `foster`, `leverage`, `utilize`, `facilitate`, `empower`, `streamline`, `robust`, `cutting-edge`, `paradigm shift`, `tapestry`, `realm`, `beacon`, `multifaceted`, `meticulous`, `intricate`, `paramount`, `transformative`, `elevate`, `embark`, `supercharge`, `harness`, and `ever-evolving`.
- Decorative formatting: emoji headings, bold emphasis within ordinary prose, unnecessary bullet lists, headings above two-sentence sections, and habitual em dashes. Use formatting only when it serves the reporting.
- Conclusions that tell readers how to evaluate the companies without adding new reported information.

Replace stock language with a concrete fact, a stated limitation, or remove it. For example, write `The release does not specify the commercial terms` rather than `The quality of the handoff will become clearer over time.`

## Images

- Use a relevant image with a stable URL from the official source whenever possible.
- Confirm the image belongs to the stated source and supports the surrounding text.
- Add an adjacent italic caption with a source link when an image appears in the body.
- Do not use an AI-generated illustration, an unrelated stock image, a screenshot with no source, or a decorative chart as evidence.
- Ensure a remote image host is allowed in `next.config.mjs` before using it.
- Do not repeat the front-matter hero image in the body; the renderer displays it above the article.
- Use `imageFit: contain` in front matter when cropping would hide material in an official hero image. Do not use it to make a weak or logo-like image appear more substantial.

## NewsArticle Schema And Metadata

- `category: News` causes the root article route to emit `NewsArticle` JSON-LD.
- Keep front matter complete so the schema contains a factual `headline`, `description`, `image`, `datePublished`, and `dateModified`.
- The route supplies the canonical URL, `mainEntityOfPage`, publisher, author, language, free-access flag, keywords, article section, and News breadcrumb. Do not add duplicate JSON-LD manually in Markdown.
- Use an image that is appropriate for a news card and social preview. The image must be accessible to the deployed site.
- Do not claim a person authored an article in front matter unless the route and editorial process are updated to represent that person accurately. The current publisher and author are Hashtag Web3.

## Pre-Publish Checks

Run these checks after editing:

```bash
npm run audit:articles
npx tsx scripts/audit-articles-formatting.ts
npx tsc --noEmit
```

- The full article audit includes legacy content. If it reports unrelated existing failures, confirm the new or revised file is not among them and report the unrelated baseline separately.
- Verify the final page locally at `http://localhost:<port>/<slug>`. Confirm it returns `200`, displays the headline, dates, image, inline links, and `NewsArticle` JSON-LD.
- Re-read the rendered article before publishing. Remove unsupported claims, repeated ideas, formulaic headings, source dumps, and any sentence that sounds like generic AI commentary.
