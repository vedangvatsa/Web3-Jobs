# AGENTS.md — Hashtagweb3.com (public site)

**Hashtagweb3.com** is a Web3 jobs, news, events, and glossary platform. Integrators use **static JSON** on the CDN.

## Static catalogs (production)

| URL | Content |
|-----|---------|
| `/data/jobs-runtime.json` | Jobs snapshot |
| `/data/news-cache.json` | News headlines |
| `/data/events-runtime.json` | Events |
| `/data/glossary-runtime.json` | Glossary |
| `/agent-view.json` | Agent capability index |
| `/openapi.json` | OpenAPI 3.1 catalog spec |

Filter client-side after download. See [`/developers`](https://hashtagweb3.com/developers) and [`/auth.md`](https://hashtagweb3.com/auth.md).

## Not hosted on production

- Catalog REST (`/api/jobs`, `/api/v1/*`)
- MCP (`/api/mcp`, `/mcp`)
- NLWeb (`/ask`)
- Sandbox (`/api/sandbox/*`)
- Agent OAuth (`/api/auth/*`)

## Product route

- `GET /api/email/unsubscribe` — email list unsubscribe

## Discovery

- [`/.well-known/agents.json`](https://hashtagweb3.com/.well-known/agents.json)
- [`/llms.txt`](https://hashtagweb3.com/llms.txt)

Source repo guide: [github.com/vedangvatsa/Web3-Jobs/blob/main/AGENTS.md](https://github.com/vedangvatsa/Web3-Jobs/blob/main/AGENTS.md)
