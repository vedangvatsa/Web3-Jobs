---
title: "Hashtag Web3 API Versioning & Deprecation Policy"
description: "Official API versioning strategy, RFC 8594 Sunset/Deprecation HTTP header specifications, minimum 12-month notice guarantee, and breaking change schedule."
canonical: "https://hashtagweb3.com/api-policy"
last-updated: "2026-08-28"
---

# Hashtag Web3 API Versioning & Deprecation Policy

## 1. Scope and Stability Guarantee
Hashtag Web3 guarantees a stable, predictable REST API and Model Context Protocol (MCP) surface for autonomous AI agents, enterprise partners, and developers.

## 2. Versioning Strategy
- **Major Versions**: Encoded directly into URI path structures (e.g. `/api/v1/jobs`, `/api/v1/glossary`).
- **Minor / Non-Breaking Additions**: New query parameters, optional fields, and expanded response properties are deployed seamlessly without breaking backwards compatibility.
- **Response Header**: All API endpoints return the `API-Version: 1.0.0` header.

## 3. Deprecation & Sunset Timeline (RFC 8594)
- **Minimum Notice**: We provide a guaranteed minimum of **12 months advance notice** before deprecating or sunsetting any major API version.
- **Machine-Readable Signaling**:
  - `Deprecation: @1767225600` (Unix timestamp of deprecation announcement)
  - `Sunset: Wed, 31 Dec 2026 23:59:59 GMT` (HTTP-date when endpoint will cease service)
  - `Link: <https://hashtagweb3.com/api-policy>; rel="deprecation"`

## 4. Sandbox Environment
- Base URL: `https://hashtagweb3.com/api/sandbox`
- Provides zero-auth test mocks and echo probes for safe automated testing without touching production databases.

## 5. Contact & Migration Assistance
- Email: contact@hashtagweb3.com
- Documentation: https://hashtagweb3.com/developers
- OpenAPI Spec: https://hashtagweb3.com/openapi.json
