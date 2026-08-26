---
name: nlweb_query
description: Query Web3 job market intelligence using natural-language questions via the NLWeb protocol endpoint.
---

# Natural-Language Web3 Market Queries

Query Web3 job market intelligence using natural-language questions via the NLWeb protocol endpoint.

## Endpoint

```
POST https://hashtagweb3/ask with {"query": "..."}
```

## Authentication

None required. All Hashtag Web3 public API endpoints are unauthenticated and CORS-enabled.

## Example

```bash
curl -s "https://hashtagweb3/ask&limit=5"
```
