---
name: search_jobs
description: Search verified Web3, crypto, DeFi, and blockchain jobs with title, company, tag, and salary filters.
---

# Search Web3 Jobs

## Data source

```
GET https://hashtagweb3.com/data/jobs-runtime.json
```

Download the jobs snapshot, then filter client-side (`active !== false`, match `search` on title/company/location, match `tag` on `tags[]`). No authentication.

## Example

```bash
npx hashtagweb3 jobs --search solidity --limit 5
```

```bash
curl -sS https://hashtagweb3.com/data/jobs-runtime.json | head -c 2000
```

OpenAPI: https://hashtagweb3.com/openapi.json
