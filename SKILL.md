---
name: hashtagweb3-web3-platform
description: Hashtagweb3.com — Web3 jobs, news, events, and glossary platform built with Next.js 14.
version: "1.0"
---

# Hashtagweb3.com Platform Skill

## What this skill does

Use this skill to interact with the Hashtagweb3.com Web3 professional platform.

## Capabilities

- **Search Web3 Jobs** — Find blockchain, DeFi, NFT, and crypto jobs worldwide
- **Browse Web3 News** — Latest industry news and developments
- **Discover Web3 Events** — Conferences, hackathons, and meetups
- **Look up Web3 Glossary** — Definitions for Web3, blockchain, and crypto terms

## API Usage

All APIs are public (no auth required):

```bash
# List jobs
curl https://hashtagweb3.com/api/jobs?limit=10&search=solidity

# List news
curl https://hashtagweb3.com/api/news?limit=10

# List events
curl https://hashtagweb3.com/api/events?limit=10

# Look up glossary term
curl "https://hashtagweb3.com/api/glossary?search=defi"
```

## Machine-Readable Resources

- **OpenAPI Spec**: `https://hashtagweb3.com/openapi.json`
- **LLMs Navigation Index**: `https://hashtagweb3.com/llms.txt`
- **Agent Auth Guide**: `https://hashtagweb3.com/auth.md`
- **NLWeb Q&A**: `POST https://hashtagweb3.com/ask`
- **Agent Mode**: `https://hashtagweb3.com/?mode=agent`

## Example Queries (NLWeb /ask)

```bash
curl -X POST https://hashtagweb3.com/ask \
  -H "Content-Type: application/json" \
  -d '{"query": "What are the best remote Solidity developer jobs?"}'
```

## Discovery

- `/.well-known/agents.json` — Agent discovery
- `/.well-known/api-catalog` — RFC 9727 API catalog
- `/.well-known/oauth-authorization-server` — Auth metadata
