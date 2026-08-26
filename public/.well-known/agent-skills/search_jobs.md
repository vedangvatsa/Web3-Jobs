---
name: search_jobs
description: Search verified Web3, crypto, DeFi, and blockchain jobs with title, company, tag, and salary filters.
---

# Search Web3 Jobs

Search verified Web3, crypto, DeFi, and blockchain jobs with title, company, tag, and salary filters.

## Endpoint

```
GET https://hashtagweb3.com/api/v1/jobs?search={keyword}&tag={tag}&limit={limit}
```

## Authentication

None required. All Hashtag Web3 public API endpoints are unauthenticated and CORS-enabled.

## Example

```bash
curl -s "https://hashtagweb3.com/api/v1/jobs?search=solidity&tag=&limit={limit}&limit=5"
```
