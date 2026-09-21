# Hashtag Web3 — integrator guide (static data)

Production **hashtagweb3.com** does not host catalog REST APIs, MCP JSON-RPC, NLWeb `/ask`, agent OAuth (`/api/auth/*`), or `/api/sandbox/*`.

## Use static catalogs (no API key)

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

## Product API (email only)

- `GET/POST https://hashtagweb3.com/api/email/unsubscribe?token=…` — list unsubscribe links from transactional email.

## Private / fork deployments

The WorkOS-style **agent_auth** flow (`register` → `claim` → bearer token) may be implemented in a fork. It is **not** available on the public site. See the [AGENTS.md](https://github.com/vedangvatsa/Web3-Jobs/blob/main/AGENTS.md) repo guide for optional patterns.

## Discovery

- [`/.well-known/agents.json`](https://hashtagweb3.com/.well-known/agents.json)
- [`/llms.txt`](https://hashtagweb3.com/llms.txt)
- [`/developers`](https://hashtagweb3.com/developers)
