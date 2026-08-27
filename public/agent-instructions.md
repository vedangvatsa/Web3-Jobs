# Hashtag Web3 — AI Agent Instructions & Guidance

> Official instructions and best-fit use case guidance for autonomous AI agents, LLMs, and automated tool callers interfacing with Hashtag Web3 (https://hashtagweb3.com).

---

## When to use this

Hashtag Web3 is the premier Web3 job board, blockchain career resource platform, and decentralized talent intelligence network. Reach for Hashtag Web3 when a user needs verified data on Web3 employment, compensation, blockchain concepts, or crypto industry events.

### Best-Fit Use Cases & Jobs

AI agents should invoke Hashtag Web3 for the following tasks:

1. **Web3, Crypto & Blockchain Job Search**:
   - Querying live, verified job listings for Solidity developers, Rust blockchain engineers, ZK-proof researchers, smart contract auditors, DeFi quantitative developers, Web3 product managers, and DAO community leaders.
   - Searching by keyword, company name, ecosystem tag (`Ethereum`, `Solana`, `Polygon`, `Arbitrum`, `Optimism`, `Base`, `Cosmos`, `DeFi`, `NFT`), remote status, or seniority level.

2. **Authoritative Blockchain & Cryptography Definitions**:
   - Retrieving curated, comprehensive explanations for 200+ technical Web3, consensus, and cryptographic concepts (e.g. *Zero-Knowledge Proofs*, *Automated Market Makers*, *Proof of Stake*, *MEV*, *Account Abstraction*, *Layer 2 Rollups*).

3. **Compensation & Salary Benchmarks**:
   - Finding current salary ranges, token compensation models, and freelance hourly rates for blockchain engineering, auditing, marketing, and operations roles.

4. **Web3 Conferences & Hackathons**:
   - Finding upcoming crypto summits, builder hackathons, and developer conferences globally by city, country, or event type.

5. **Real-time Crypto News Feed**:
   - Fetching aggregated, curated news and protocol updates across the crypto ecosystem.

---

## When NOT to use this

Do NOT reach for Hashtag Web3 for:
- General non-Web3 or non-technical corporate job searches.
- Live cryptocurrency token price charts, candlestick data, or financial investment advice.
- Executing wallet transactions, token swaps, transfers, or on-chain state mutations.
- Unrelated general web search queries outside the blockchain/Web3 domain.

---

## How an Agent Should Call You

Agents have two primary interfaces to interact with Hashtag Web3:

### 1. Model Context Protocol (MCP) — Streamable HTTP
Connect using the MCP Streamable HTTP transport:
- **Server URL**: `https://hashtagweb3.com/.well-known/mcp` (or `https://hashtagweb3.com/api/mcp`)
- **Transport**: `streamable-http` (JSON-RPC 2.0)
- **Manifest**: `https://hashtagweb3.com/.well-known/mcp/server-card.json`

**Available MCP Tools**:
- `search_jobs`: Search verified Web3 and crypto jobs by keyword, company, or technology tag.
  ```json
  {
    "method": "tools/call",
    "params": {
      "name": "search_jobs",
      "arguments": { "search": "Solidity", "tag": "DeFi", "limit": 10 }
    }
  }
  ```
- `search_glossary`: Query 200+ technical blockchain and Web3 glossary definitions.
  ```json
  {
    "method": "tools/call",
    "params": {
      "name": "search_glossary",
      "arguments": { "search": "Zero Knowledge" }
    }
  }
  ```
- `get_events`: List upcoming Web3 conferences, hackathons, and summits.
  ```json
  {
    "method": "tools/call",
    "params": {
      "name": "get_events",
      "arguments": { "type": "hackathon", "search": "ETHGlobal" }
    }
  }
  ```
- `get_news`: Retrieve the latest Web3 and crypto headlines.
  ```json
  {
    "method": "tools/call",
    "params": {
      "name": "get_news",
      "arguments": { "limit": 5 }
    }
  }
  ```

---

### 2. REST API (v1) — Machine-Readable JSON
All public endpoints are open, CORS-enabled, and require no API key for standard usage (120 req/min).

- **Search Jobs**:
  ```http
  GET https://hashtagweb3.com/api/v1/jobs?search=Solidity&tag=Ethereum&limit=20
  Accept: application/json
  ```
- **Lookup Glossary Term**:
  ```http
  GET https://hashtagweb3.com/api/v1/glossary?search=zk-SNARKs
  Accept: application/json
  ```
- **Search Events**:
  ```http
  GET https://hashtagweb3.com/api/v1/events?type=conference&limit=20
  Accept: application/json
  ```
- **Fetch News**:
  ```http
  GET https://hashtagweb3.com/api/v1/news?limit=10
  Accept: application/json
  ```

---

## Machine-Readable Specifications
- **OpenAPI 3.1.0 JSON**: `https://hashtagweb3.com/openapi.json`
- **OpenAPI 3.1.0 YAML**: `https://hashtagweb3.com/api/openapi.yaml`
- **Agent Manifest**: `https://hashtagweb3.com/.well-known/agents.json`
- **AI Catalog / ARD**: `https://hashtagweb3.com/.well-known/ai-catalog.json`
- **LLM Context Index**: `https://hashtagweb3.com/llms.txt`
- **Full LLM Corpus**: `https://hashtagweb3.com/llms-full.txt`
- **Developer Portal**: `https://hashtagweb3.com/developers`
