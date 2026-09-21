---
name: get_news
description: Retrieve aggregated news headlines from premier blockchain publications.
---

# Get Web3 News Headlines

## Data source

```
GET https://hashtagweb3.com/data/news-cache.json
```

Download the news cache, then slice or filter client-side. No authentication.

## Example

```bash
npx hashtagweb3 news --limit 5
```

```bash
curl -sS https://hashtagweb3.com/data/news-cache.json | head -c 2000
```

OpenAPI: https://hashtagweb3.com/openapi.json
