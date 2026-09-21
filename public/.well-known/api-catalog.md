# Hashtag Web3 — API catalog (static integrator surface)

Production serves **static JSON** on the CDN. Filter client-side after download.

- [OpenAPI 3.1 spec](https://hashtagweb3.com/openapi.json) — documents `/data/*` catalog URLs
- [RFC 9727 linkset](https://hashtagweb3.com/.well-known/api-catalog.linkset.json) — machine-readable catalog index
- [Jobs snapshot](https://hashtagweb3.com/data/jobs-runtime.json) — `application/json`
- [Events snapshot](https://hashtagweb3.com/data/events-runtime.json) — `application/json`
- [News cache](https://hashtagweb3.com/data/news-cache.json) — `application/json`
- [Glossary snapshot](https://hashtagweb3.com/data/glossary-runtime.json) — `application/json`
- [Agent overview](https://hashtagweb3.com/agent-view.json) — `application/json`

Legacy REST (`/api/v1/*`), MCP, and NLWeb `/ask` are **not** hosted on hashtagweb3.com.
