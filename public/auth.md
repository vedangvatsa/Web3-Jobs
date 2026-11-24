# Hashtag Web3 — integrator guide

Public integrations use **static JSON on the CDN** and **syndication feeds**. No API key or signup is required.

## Static catalogs

| Catalog | URL |
|---------|-----|
| Jobs | `GET https://hashtagweb3.com/data/jobs-runtime.json` |
| News | `GET https://hashtagweb3.com/data/news-cache.json` |
| Events | `GET https://hashtagweb3.com/data/events-runtime.json` |
| Glossary | `GET https://hashtagweb3.com/data/glossary-runtime.json` |
| Agent index | `GET https://hashtagweb3.com/agent-view.json` or `GET https://hashtagweb3.com/?mode=agent` |

Filter, search, and paginate **client-side** after download. OpenAPI: [`/openapi.json`](https://hashtagweb3.com/openapi.json).

```bash
curl -sS 'https://hashtagweb3.com/data/jobs-runtime.json' -H 'Accept: application/json' | head -c 500
```

## Syndication feeds

| Feed | URL |
|------|-----|
| Jobs (RSS) | `GET https://hashtagweb3.com/jobs/feed.xml` |
| Jobs (JSON Feed) | `GET https://hashtagweb3.com/jobs/feed.json` |
| News (RSS) | `GET https://hashtagweb3.com/news/feed.xml` |
| Events (RSS) | `GET https://hashtagweb3.com/events/feed.xml` |

## Email unsubscribe

- `GET/POST https://hashtagweb3.com/api/email/unsubscribe?token=…` — unsubscribe links from transactional email (token is per-message, not a catalog key).

## Discovery

- [`/.well-known/api-catalog`](https://hashtagweb3.com/.well-known/api-catalog) (RFC 9727 linkset)
- [`/.well-known/agents.json`](https://hashtagweb3.com/.well-known/agents.json)
- [`/llms.txt`](https://hashtagweb3.com/llms.txt)
- [`/developers`](https://hashtagweb3.com/developers)