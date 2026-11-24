# AGENTS.md — Hashtagweb3.com (public site)

**Hashtagweb3.com** is a Web3 jobs, news, events, and glossary platform. Integrators use **static JSON** on the CDN and **syndication feeds**.

## Static catalogs

| URL | Content |
|-----|---------|
| `/data/jobs-runtime.json` | Jobs snapshot |
| `/data/news-cache.json` | News headlines |
| `/data/events-runtime.json` | Events |
| `/data/glossary-runtime.json` | Glossary |
| `/agent-view.json` | Agent capability index |
| `/openapi.json` | OpenAPI 3.1 catalog spec |

## Syndication feeds

| URL | Content |
|-----|---------|
| `/jobs/feed.xml` | Latest jobs (RSS) |
| `/jobs/feed.json` | Latest jobs (JSON Feed) |
| `/news/feed.xml` | Native news (RSS) |
| `/events/feed.xml` | Upcoming events (RSS) |

Filter client-side after download. See [`/developers`](https://hashtagweb3.com/developers) and [`/auth.md`](https://hashtagweb3.com/auth.md).

## Email unsubscribe

- `GET /api/email/unsubscribe` — list unsubscribe (token query param)

## Discovery

- [`/.well-known/agents.json`](https://hashtagweb3.com/.well-known/agents.json)
- [`/llms.txt`](https://hashtagweb3.com/llms.txt)