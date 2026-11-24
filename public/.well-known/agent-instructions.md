# Hashtag Web3 — AI Agent Instructions & Guidance

> Official instructions for autonomous agents interfacing with Hashtag Web3 (https://hashtagweb3.com).

## When to use this

Use Hashtag Web3 for Web3 job listings, glossary definitions, events, and industry news.

## When NOT to use this

Do not use for non-Web3 jobs, token trading, or wallet transactions.

## How to integrate

Fetch static catalogs and filter client-side, or poll syndication feeds:

| Catalog | URL |
|---------|-----|
| Jobs | `GET https://hashtagweb3.com/data/jobs-runtime.json` |
| News | `GET https://hashtagweb3.com/data/news-cache.json` |
| Events | `GET https://hashtagweb3.com/data/events-runtime.json` |
| Glossary | `GET https://hashtagweb3.com/data/glossary-runtime.json` |

| Feed | URL |
|------|-----|
| Jobs RSS | `GET https://hashtagweb3.com/jobs/feed.xml` |
| Jobs JSON Feed | `GET https://hashtagweb3.com/jobs/feed.json` |

No API key is required. See [`/auth.md`](https://hashtagweb3.com/auth.md) and [`/developers`](https://hashtagweb3.com/developers).

## Machine-readable specs

- OpenAPI: `https://hashtagweb3.com/openapi.json`
- Agent manifest: `https://hashtagweb3.com/.well-known/agents.json`
- LLM index: `https://hashtagweb3.com/llms.txt`
- Developer portal: `https://hashtagweb3.com/developers`