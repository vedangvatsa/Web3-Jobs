# AGENTS.md — Hashtagweb3.com Agent Guide

> This file follows the [AGENTS.md](https://agents-md.com) convention for describing a project to AI coding agents.

## Project Overview

**Hashtagweb3.com** is a Web3 professional platform built with Next.js 14 (App Router). It aggregates Web3 jobs, industry news, events, and an educational glossary. The project is open-source and agent-friendly.

- **Framework**: Next.js 14 App Router (TypeScript)
- **Styling**: Tailwind CSS
- **Data**: Supabase (PostgreSQL)
- **Deployment**: Vercel

## Repository Structure

```
/
├── src/
│   ├── app/                  # Next.js App Router pages and API routes
│   │   ├── api/              # Public REST API (jobs, news, events, glossary, auth)
│   │   ├── jobs/             # Jobs listing page
│   │   ├── news/             # News listing page
│   │   ├── events/           # Events listing page
│   │   ├── community/        # Community hub page
│   │   ├── developers/       # Developer portal and API docs
│   │   └── layout.tsx        # Root layout with JSON-LD schemas
│   ├── components/           # Shared React components
│   └── middleware.ts         # Content negotiation, Vary headers
├── public/
│   ├── robots.txt            # Crawler policy (AI crawlers allowed)
│   ├── llms.txt              # Navigation index for LLMs
│   ├── openapi.json          # OpenAPI 3.1.0 specification
│   ├── auth.md               # Agent authentication guide (WorkOS auth.md)
│   ├── plugin.json           # Agent plugin manifest
│   ├── sitemap.xml           # XML sitemap
│   └── .well-known/          # Discovery endpoints
│       ├── agents.json
│       ├── agent-card.json
│       ├── ai-catalog.json
│       ├── api-catalog       # RFC 9727 linkset
│       ├── mcp/server-card.json
│       ├── oauth-protected-resource   # RFC 9728
│       └── oauth-authorization-server # RFC 8414
└── bin/
    └── hashtagweb3.js        # CLI tool
```

## Public API Endpoints

All public API endpoints are unauthenticated (CORS enabled):

| Endpoint | Description |
|----------|-------------|
| `GET /api/jobs` | List Web3 jobs. Params: `limit`, `offset`, `search`, `location`, `type` |
| `GET /api/news` | List Web3 news. Params: `limit`, `offset`, `search`, `category` |
| `GET /api/events` | List Web3 events. Params: `limit`, `offset`, `search`, `type` |
| `GET /api/glossary` | List glossary terms. Params: `limit`, `offset`, `search`, `letter` |

Full OpenAPI spec: `https://hashtagweb3.com/openapi.json`

## Agent-Specific Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /llms.txt` | Navigation index for LLMs |
| `GET /openapi.json` | OpenAPI 3.1.0 spec |
| `GET /auth.md` | WorkOS-spec agent auth guide |
| `POST /ask` | NLWeb natural language query endpoint |
| `GET /?mode=agent` | Machine-readable JSON platform overview |
| `GET /index.md` | Markdown version of homepage |
| `GET /.well-known/agents.json` | Agent discovery manifest |
| `GET /.well-known/api-catalog` | RFC 9727 API catalog |

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm run lint         # ESLint check
npm run hashtagweb3  # Run the CLI tool
```

## Coding Conventions

- **TypeScript**: All source files use TypeScript. Avoid `any` types.
- **Components**: Server Components by default; add `'use client'` only when necessary.
- **API Routes**: All API routes must return structured JSON errors: `{ error: { code, message, hint, docUrl } }`.
- **CORS**: All `/api/*` routes include `Access-Control-Allow-Origin: *`.
- **Content-Type**: Serve `.md` files as `text/markdown; charset=utf-8`.
- **Styles**: Use Tailwind CSS utility classes; no CSS-in-JS.

## Agent Auth Flow

1. `POST /api/auth/register` → receive `registration_token`
2. `POST /api/auth/claim` → exchange for `access_token`
3. Use `Authorization: Bearer <access_token>` on subsequent requests
4. `POST /api/auth/revoke` → invalidate token when done

See `/auth.md` for full details.

<!-- antislop:start -->
## antislop
For UI, copy, people, mobile layout, or code comments work, load the antislop skill for the task:
- Core filter, always on: `antislop`
- UI / visual: `antislop-ui`
- Copy & text: `antislop-copywriting`
- People: `antislop-human`
- Mobile / responsive: `antislop-layoutmobile`
- Code comments: `antislop-code`
Before starting, ask the user when antislop applies: during the work, or after it is done.
<!-- antislop:end -->
