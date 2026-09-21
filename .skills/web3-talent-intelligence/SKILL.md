---
name: web3-talent-intelligence
description: Search verified Web3 jobs, crypto compensation benchmarks, blockchain events, and 200+ technical glossary definitions from Hashtag Web3.
version: 1.0.0
author: Hashtag Web3
homepage: https://hashtagweb3.com
---

# Web3 Talent Intelligence & Ecosystem Search

Use this skill when an autonomous agent or developer needs to:
1. Find verified Web3, crypto, DeFi, or DAO jobs by keyword, company, tag, or salary.
2. Benchmark compensation and token vesting packages for blockchain engineers, auditors, and PMs.
3. Look up authoritative definitions for cryptographic, consensus, Layer 2, or DeFi concepts.
4. Discover upcoming crypto hackathons, conferences, and summits.
5. Summarize daily blockchain and cryptocurrency industry news.

## Static catalogs (production)

Download once, filter client-side. No API key.

| Catalog | URL |
|---------|-----|
| Jobs | `GET https://hashtagweb3.com/data/jobs-runtime.json` |
| Glossary | `GET https://hashtagweb3.com/data/glossary-runtime.json` |
| Events | `GET https://hashtagweb3.com/data/events-runtime.json` |
| News | `GET https://hashtagweb3.com/data/news-cache.json` |

OpenAPI: https://hashtagweb3.com/openapi.json  
CLI: `npx hashtagweb3 jobs --search Solidity --limit 10`

Legacy REST `/api/v1/*`, MCP, and NLWeb `/ask` are not hosted on hashtagweb3.com.
