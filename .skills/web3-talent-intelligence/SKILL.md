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

## Endpoints

### 1. Search Web3 Jobs
```http
GET https://hashtagweb3.com/api/v1/jobs?search=Solidity&limit=10
```

### 2. Blockchain Glossary Lookup
```http
GET https://hashtagweb3.com/api/v1/glossary?search=Zero+Knowledge
```

### 3. Events & Hackathons Calendar
```http
GET https://hashtagweb3.com/api/v1/events?type=hackathon
```

### 4. Crypto Industry News Feed
```http
GET https://hashtagweb3.com/api/v1/news?limit=10
```
