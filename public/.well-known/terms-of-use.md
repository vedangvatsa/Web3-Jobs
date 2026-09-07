---
title: "Hashtag Web3 AI Terms of Use & Machine Service Agreement"
description: "Machine-readable terms of use, commercial usage policies, rate limits, machine payment terms, and liability boundaries for autonomous agents and programmatic systems."
canonical: "https://hashtagweb3.com/terms-of-use.md"
version: "1.0.0"
last-updated: "2026-09-07"
standard: "https://veda.ng/aistandards"
contact: "contact@hashtagweb3.com"
---

# Hashtag Web3 AI Terms of Use & Machine Service Agreement

> Official machine-readable terms of service governing programmatic access, autonomous AI agent interactions, commercial data usage, rate limits, and machine-to-machine transactions on **Hashtag Web3** (`hashtagweb3.com`).

---

## 1. Acceptance of Terms & Scope

1. **Applicability**: These Terms of Use ("Terms") constitute a legally binding agreement between **Hashtag Web3** ("we", "us", "our") and any entity, developer, autonomous AI agent, LLM crawler, or automated system ("Agent", "You", or "Operator") accessing or interacting with `hashtagweb3.com`, its subdomains, REST API endpoints (`/api/*`), Model Context Protocol (MCP) servers (`/api/mcp`, `/api/mcp-docs`), and associated discovery assets.
2. **Operator Responsibility**: The individual, company, or legal entity operating, deploying, or directing the Agent is fully responsible for all actions, API calls, transactions, and state changes initiated by the Agent.
3. **Machine Acceptance**: By transmitting an HTTP request, establishing a WebSocket/SSE connection, initiating an MCP session, or executing an automated query against any Hashtag Web3 resource, the Agent and its Operator accept these Terms in full. If the Operator does not agree, the Agent must immediately cease all access.

---

## 2. Permitted Agent Actions & Operational Boundaries

In accordance with our published [`/agents.txt`](https://hashtagweb3.com/agents.txt) and [`/.well-known/agents.json`](https://hashtagweb3.com/.well-known/agents.json) declarations:

1. **Permitted Actions (`Allow-action`)**:
   - **`read`**: Programmatic retrieval of publicly available job listings, technical glossary definitions, event schedules, salary benchmarks, and educational content.
   - **`search`**: Execution of search queries, filtering parameters, and semantic lookups across public endpoints and MCP tool interfaces.
   - **`index`**: Ingestion, tokenization, embedding, and caching of public data for retrieval-augmented generation (RAG), search indexing, and LLM context synthesis.
   - **`cite`**: Quotation, summary, and excerpting of Hashtag Web3 content in AI assistant responses, research publications, or user interfaces, provided attribution is supplied.
2. **Restricted Actions (`Disallow-action`)**:
   - **`write`**: Agents may not create, update, or delete job postings, user records, or platform metadata without verified OAuth 2.0 authentication or explicit administrative authorization.
   - **`impersonate`**: Agents may not spoof user-agent headers, forge cryptographic signatures, or falsify referral sources.
   - **`credential-harvest`**: Agents are strictly prohibited from probing for private keys, session cookies, database credentials, or internal configuration files.
3. **Idempotency Requirement**:
   - For any write or mutating operation, the Agent must supply an `Idempotency-Key: <UUIDv4>` HTTP header to prevent duplicate execution during network retries.

---

## 3. Commercial Usage & Agent Transactions

1. **Non-Commercial & Public Research**:
   - Unauthenticated public endpoints (`/api/jobs`, `/api/glossary`, `/api/news`, `/api/events`, `/api/mcp`) are freely accessible for personal research, educational inquiry, and non-commercial open-source agents, subject to standard rate limits.
2. **Commercial Indexing & Tool Calling**:
   - Commercial AI platforms (including search engines, agentic browsers, and enterprise developer assistants) are permitted to query and cite Hashtag Web3 data commercially, provided:
     - Clear attribution is preserved (e.g., *"Source: Hashtag Web3 (https://hashtagweb3.com)"*).
     - The Agent provides direct, clickable deep links to the original job opening or resource.
     - The Agent does not resell raw bulk database dumps without a formal enterprise data license.
3. **Paid Features & Commercial Placements**:
   - Commercial transaction surfaces—such as sponsored job promotions, featured company spotlights, and premium talent intelligence feeds—require settled payment or active API credentials.
4. **Machine Payments & Micropayments (HTTP 402)**:
   - Hashtag Web3 supports machine-to-machine payment protocols for autonomous agent settlement:
     - **HTTP 402 Payment Required**: Standard machine payment challenge status code.
     - **Machine Payments Protocol (MPP)**: Advertised payment info challenges for autonomous agent budgeting.
     - **x402 / L402**: Lightning and token-metered settlement rails for per-call micropayments.
     - **Agentic Commerce Protocol (ACP) & AP2**: Compatible with emerging agentic mandate authorization layers.
   - All machine payments authorized by an Agent are final upon on-chain or payment gateway settlement.
   - For failed transactions or service errors, automated refunds may be claimed via `POST /api/support/refund` or by contacting `contact@hashtagweb3.com` within 72 hours with the transaction hash or idempotency key.

---

## 4. Rate Limits & Fair Usage Policy

1. **Standard Allowances**:
   - **Unauthenticated / Public Agents**: 120 requests per minute per IP address (`RateLimit-Limit: 120`, window = 60s).
   - **Authenticated API Keys**: Tier-specific limits as provisioned in developer credentials.
2. **Standard HTTP Rate Limit Headers**:
   - All responses include standard RFC rate limit headers:
     ```http
     RateLimit-Limit: 120
     RateLimit-Remaining: 119
     RateLimit-Reset: 60
     RateLimit-Policy: 120;w=60
     ```
3. **Throttling & Backoff**:
   - Upon encountering HTTP status code `429 Too Many Requests`, Agents must immediately throttle requests and respect the `Retry-After: <seconds>` header before retrying.
   - Exponential backoff with jitter is required for automated retry loops.
   - Circumventing rate limits via IP proxy rotation, distributed botnets, or socket flooding is a material violation of these Terms and triggers immediate IP-range bans.

---

## 5. Sandbox & Test Environment

1. **Zero-Auth Test Endpoints**:
   - Base URL: `https://hashtagweb3.com/api/sandbox`
   - Endpoints: `/api/sandbox/jobs`, `/api/sandbox/glossary`, `/api/sandbox/news`, `/api/sandbox/events`
2. **Instant Registration**:
   - `POST https://hashtagweb3.com/api/sandbox/auth/register` provides immediate mock credentials for automated CI/CD pipelines.
3. **No Financial Risk**:
   - Sandbox endpoints return synthetic mock data, never touch production hiring databases, and never incur real financial transactions or fees.

---

## 6. Content Integrity, Quality & No-Slop Standard

1. **Authenticity**:
   - In accordance with our [`/noslop.md`](https://hashtagweb3.com/noslop.md) standard, Hashtag Web3 publishes verified, human-researched crypto employment data and glossary definitions.
2. **No Hallucination or Deceptive Alteration**:
   - Agents processing or displaying Hashtag Web3 data to end users must not alter salary numbers, misrepresent company hiring statuses, or invent nonexistent job requirements.
3. **Attribution**:
   - When presenting job openings or technical definitions, Agents must cite the source with an active URL:
     `https://hashtagweb3.com/<slug>`

---

## 7. Liability Boundaries & Disclaimers

1. **"AS IS" Provision**:
   - All data, APIs, MCP servers, and career tools are provided on an **"AS IS"** and **"AS AVAILABLE"** basis without warranty of any kind, whether express, implied, statutory, or otherwise.
2. **No Guarantee of Employment or Hiring Accuracy**:
   - Job listings reflect third-party employer openings collected at the time of publication. Hashtag Web3 does not guarantee that any listed position remains open, that candidate applications will be reviewed, or that hiring terms will not change.
3. **Autonomous Agent Execution Risk**:
   - The Operator assumes full liability for all outcomes arising from the Agent's reasoning, tool calls, autonomous job applications, or financial transactions. Hashtag Web3 shall not be liable for any indirect, incidental, consequential, special, or punitive damages.
4. **Liability Cap**:
   - To the maximum extent permitted by applicable law, Hashtag Web3's aggregate liability to any Agent or Operator for any claim arising out of these Terms shall not exceed the greater of:
     - (a) The total amount paid by the Operator to Hashtag Web3 in the three (3) months preceding the claim, or
     - (b) One hundred United States Dollars ($100.00 USD).

---

## 8. API Stability, Deprecation & Sunset Guarantee (RFC 8594)

1. **12-Month Notice**:
   - As documented in our [`/api-policy`](https://hashtagweb3.com/api-policy), we guarantee a minimum of **12 months advance notice** prior to sunsetting or introducing breaking changes to major API versions.
2. **Signaling**:
   - Deprecated endpoints will signal end-of-life through standard `Sunset`, `Deprecation`, and `Link` HTTP headers.

---

## 9. Machine Discovery Endpoints & Resources

- **Terms of Use**: [https://hashtagweb3.com/terms-of-use.md](https://hashtagweb3.com/terms-of-use.md)
- **Agent Directives (`agents.txt`)**: [https://hashtagweb3.com/agents.txt](https://hashtagweb3.com/agents.txt)
- **Agent Discovery (`agents.json`)**: [https://hashtagweb3.com/.well-known/agents.json](https://hashtagweb3.com/.well-known/agents.json)
- **Model Context Protocol (MCP)**: [https://hashtagweb3.com/api/mcp](https://hashtagweb3.com/api/mcp)
- **LLMs Context (`llms.txt`)**: [https://hashtagweb3.com/llms.txt](https://hashtagweb3.com/llms.txt)
- **OpenAPI 3.1 Specification**: [https://hashtagweb3.com/openapi.json](https://hashtagweb3.com/openapi.json)
- **API Catalog (RFC 9727)**: [https://hashtagweb3.com/.well-known/api-catalog](https://hashtagweb3.com/.well-known/api-catalog)
- **Developer Documentation**: [https://hashtagweb3.com/developers](https://hashtagweb3.com/developers)
- **Sandbox Environment**: [https://hashtagweb3.com/api/sandbox](https://hashtagweb3.com/api/sandbox)

---

## 10. Contact & Governance

- **Entity**: Hashtag Web3
- **Support & Inquiries**: `contact@hashtagweb3.com`
- **Contact Form**: [https://hashtagweb3.com/contact](https://hashtagweb3.com/contact)
- **GitHub Repository**: [https://github.com/vedangvatsa/Web3-Jobs](https://github.com/vedangvatsa/Web3-Jobs)
- **Standards Reference**: [https://veda.ng/aistandards](https://veda.ng/aistandards)
