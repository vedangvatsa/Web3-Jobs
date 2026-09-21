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

1. **Applicability**: These Terms govern access to **hashtagweb3.com**, its static catalogs under `/data/*`, HTML pages, syndication feeds, and the product route **`/api/email/unsubscribe`**. Hosted catalog REST (`/api/jobs`, `/api/v1/*`), MCP (`/api/mcp`), NLWeb (`/ask`), sandbox (`/api/sandbox/*`), and agent OAuth (`/api/auth/*`) are **not** operated on the public site.
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
   - Static catalogs (`/data/*.json`) and HTML pages are freely accessible for personal research, educational inquiry, and non-commercial agents, subject to reasonable automated access limits.
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

## 5. Static data & integrators

1. **Machine-readable catalogs** are published at `https://hashtagweb3.com/data/*.json` (see [`/openapi.json`](https://hashtagweb3.com/openapi.json)).
2. **No sandbox** — mock API environments are not hosted on production.
3. **Forks** — optional agent-auth flows documented in [`/auth.md`](https://hashtagweb3.com/auth.md) apply only to private deployments, not hashtagweb3.com.

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
   - All data and career tools are provided on an **"AS IS"** basis without warranty of any kind, whether express, implied, statutory, or otherwise.
2. **No Guarantee of Employment or Hiring Accuracy**:
   - Job listings reflect third-party employer openings collected at the time of publication. Hashtag Web3 does not guarantee that any listed position remains open, that candidate applications will be reviewed, or that hiring terms will not change.
3. **Autonomous Agent Execution Risk**:
   - The Operator assumes full liability for all outcomes arising from the Agent's reasoning, tool calls, autonomous job applications, or financial transactions. Hashtag Web3 shall not be liable for any indirect, incidental, consequential, special, or punitive damages.
4. **Liability Cap**:
   - To the maximum extent permitted by applicable law, Hashtag Web3's aggregate liability to any Agent or Operator for any claim arising out of these Terms shall not exceed the greater of:
     - (a) The total amount paid by the Operator to Hashtag Web3 in the three (3) months preceding the claim, or
     - (b) One hundred United States Dollars ($100.00 USD).

---

## 8. Catalog stability

1. **Static snapshots** under `/data/*` may change when the site ingests new jobs, news, or events; integrators should use `ETag` / `Cache-Control` or re-fetch on a schedule.
2. **Breaking URL changes** to catalog paths are announced on [`/developers`](https://hashtagweb3.com/developers) with reasonable notice.

---

## 9. Machine Discovery Endpoints & Resources

- **Terms of Use**: [https://hashtagweb3.com/terms-of-use.md](https://hashtagweb3.com/terms-of-use.md)
- **Agent Directives (`agents.txt`)**: [https://hashtagweb3.com/agents.txt](https://hashtagweb3.com/agents.txt)
- **Agent Discovery (`agents.json`)**: [https://hashtagweb3.com/.well-known/agents.json](https://hashtagweb3.com/.well-known/agents.json)
- **LLMs Context (`llms.txt`)**: [https://hashtagweb3.com/llms.txt](https://hashtagweb3.com/llms.txt)
- **OpenAPI 3.1 Specification**: [https://hashtagweb3.com/openapi.json](https://hashtagweb3.com/openapi.json)
- **API Catalog (RFC 9727)**: [https://hashtagweb3.com/.well-known/api-catalog.linkset.json](https://hashtagweb3.com/.well-known/api-catalog.linkset.json)
- **Developer Documentation**: [https://hashtagweb3.com/developers](https://hashtagweb3.com/developers)
- **Static jobs catalog**: [https://hashtagweb3.com/data/jobs-runtime.json](https://hashtagweb3.com/data/jobs-runtime.json)

---

## 10. Contact & Governance

- **Entity**: Hashtag Web3
- **Support & Inquiries**: `contact@hashtagweb3.com`
- **Contact Form**: [https://hashtagweb3.com/contact](https://hashtagweb3.com/contact)
- **Standards Reference**: [https://veda.ng/aistandards](https://veda.ng/aistandards)
