# Hashtag Web3 Authentication Docs & Agent Auth Guide

> **agent_auth** specification for AI agents accessing the Hashtag Web3 platform.

This document describes how AI agents can authenticate with `hashtagweb3.com` to access its Web3 jobs, news, events, and glossary APIs.

---

## Sandbox & Test Environment

Zero-auth sandbox endpoints — no API key required:

```bash
# Test sandbox jobs endpoint
curl https://hashtagweb3.com/api/sandbox/jobs

# Get a free sandbox API key instantly
curl -X POST https://hashtagweb3.com/api/sandbox/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"agent_id": "my-test-agent"}'

# Test sandbox glossary
curl https://hashtagweb3.com/api/sandbox/glossary
```

Sandbox base URL: `https://hashtagweb3.com/api/sandbox`
All sandbox endpoints return mock data and do not touch production databases.

---

## Discover

Hashtagweb3.com supports both unauthenticated (public) and authenticated agent access.

**Public APIs** (no auth required):
- `GET /api/jobs` — List Web3 jobs
- `GET /api/news` — Web3 industry news
- `GET /api/events` — Upcoming Web3 events
- `GET /api/glossary` — Web3 glossary terms

**Sandbox & Test Mode** (zero-auth, mock data):
- `GET /api/sandbox` — Sandbox descriptor & capabilities
- `GET /api/sandbox/jobs` — Mock job listings for test verification
- `GET /api/sandbox/glossary` — Mock glossary terms
- `GET /api/sandbox/news` — Mock crypto news
- `GET /api/sandbox/events` — Mock crypto events
- `POST /api/sandbox/auth/register` — Instant self-serve test API key generation
- `POST /api/sandbox/echo` — Echo test probe

**Auth metadata endpoints:**
- `GET /.well-known/oauth-protected-resource` — RFC 9728 protected resource descriptor
- `GET /.well-known/oauth-authorization-server` — RFC 8414 authorization server metadata
- `GET /.well-known/api-catalog` — RFC 9727 API catalog (linkset+json)

The `WWW-Authenticate` header on any protected endpoint reads:
```
WWW-Authenticate: Bearer resource_metadata="https://hashtagweb3.com/.well-known/oauth-protected-resource"
```

---

## Pick a method

Hashtagweb3.com supports two identity types:

| Method | Description | When to use |
|--------|-------------|-------------|
| `anonymous` | No credential; receives a short-lived bearer token | Quick, stateless agent access |
| `identity_assertion` | Agent presents a verifiable claim (e.g., `id-jag` or `verified_email`) | Higher trust; useful for rate-limit exemptions |

---

## Register

To obtain an agent identity, POST to the `register_uri`:

```
POST https://hashtagweb3.com/api/auth/register
Content-Type: application/json

{
  "agent_id": "my-agent-v1",
  "identity_type": "anonymous"
}
```

**Response:**
```json
{
  "agent_id": "my-agent-v1",
  "register_uri": "https://hashtagweb3.com/api/auth/register",
  "claim_uri": "https://hashtagweb3.com/api/auth/claim",
  "revocation_uri": "https://hashtagweb3.com/api/auth/revoke",
  "registration_token": "<base64url-token>",
  "expires_in": 3600
}
```

---

## Claim

Exchange the `registration_token` for a bearer credential at the `claim_uri`:

```
POST https://hashtagweb3.com/api/auth/claim
Content-Type: application/json

{
  "registration_token": "<base64url-token>",
  "agent_id": "my-agent-v1"
}
```

**Response:**
```json
{
  "access_token": "<bearer-token>",
  "token_type": "bearer",
  "expires_in": 86400,
  "scope": "read:jobs read:news read:events read:glossary"
}
```

For `identity_assertion` claims (e.g., `id-jag` tokens from an identity provider), include:
```json
{
  "registration_token": "<base64url-token>",
  "assertion_type": "urn:ietf:params:oauth:token-type:id-jag",
  "assertion": "<your-id-jag-jwt>"
}
```

---

## Use the credential

Include the bearer token in the `Authorization` header of subsequent API calls:

```
GET /api/jobs?limit=20
Authorization: Bearer <access_token>
```

All API responses include CORS headers allowing cross-origin agent access.

---

## Errors

| HTTP Status | Code | Meaning |
|-------------|------|---------|
| `400` | `MISSING_CREDENTIAL` | Required fields missing from request |
| `401` | `UNAUTHORIZED` | No token or invalid token; check `WWW-Authenticate` header |
| `403` | `FORBIDDEN` | Token lacks required scope |
| `429` | `RATE_LIMITED` | Too many requests; retry after `Retry-After` seconds |

All errors follow the structured format:
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Human-readable description",
    "hint": "Actionable suggestion",
    "docUrl": "https://hashtagweb3.com/auth.md"
  }
}
```

---

## Revocation

Revoke a token when the agent session ends to follow least-privilege principles:

```
POST https://hashtagweb3.com/api/auth/revoke
Content-Type: application/json

{
  "token": "<access_token>"
}
```

**Response:**
```json
{
  "revoked": true,
  "message": "Token revoked successfully."
}
```

After revocation, the token is invalidated and further requests with it will return `401 UNAUTHORIZED`.

---

*This document follows the [WorkOS auth.md](https://workos.com/auth-md) specification.*
