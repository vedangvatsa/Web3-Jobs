# AGENTS.md — Hashtagweb3.com Agent Guide

> This file follows the [AGENTS.md](https://agents-md.com) convention for describing a project to AI coding agents.

## Project Overview

**Hashtagweb3.com** is a Web3 professional platform built with Next.js 14 (App Router). It aggregates Web3 jobs, industry news, events, and an educational glossary. The project is open-source and agent-friendly.

- **Framework**: Next.js 14 App Router (TypeScript)
- **Styling**: Tailwind CSS
- **Data**: Static runtime JSON under `content/` and `public/data/` (jobs, events, glossary, news); Supabase where noted for product features
- **Deployment**: Firebase App Hosting (primary HTML) and Cloudflare Workers (OpenNext); not Vercel-only

## Repository Structure

```
/
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── api/              # Minimal routes (e.g. email unsubscribe)
│   │   ├── jobs/             # Jobs listing + legacy /jobs/[slug] redirects
│   │   ├── news/             # News listing page
│   │   ├── events/           # Events listing page
│   │   ├── community/        # Community hub page
│   │   ├── developers/       # Developer portal and catalog docs
│   │   └── layout.tsx        # Root layout with JSON-LD schemas
│   ├── components/           # Shared React components
│   └── middleware.ts         # Social UTM, link-preview shells, rate limits
├── public/
│   ├── data/                 # CDN copies of runtime catalogs
│   ├── preview/              # Precomputed OG HTML shells for crawlers
│   ├── robots.txt
│   ├── llms.txt
│   ├── openapi.json          # OpenAPI 3.1.0 — static /data/* catalogs
│   └── .well-known/          # Agent discovery manifests
└── bin/
    └── hashtagweb3.js        # CLI tool
```

## Public data (integrators)

Machine-readable catalogs are **static JSON** on the CDN (no API key, no per-request Serverless Function):

| URL | Description |
|-----|-------------|
| `GET /data/jobs-runtime.json` | Active jobs snapshot (filter client-side) |
| `GET /data/events-runtime.json` | Events snapshot |
| `GET /data/glossary-runtime.json` | Glossary snapshot |
| `GET /data/news-cache.json` | News headlines cache |
| `GET /data/companies-runtime.json` | Companies snapshot |
| `GET /data/articles-index.json` | Articles index |
| `GET /agent-view.json` | Agent capability overview |
| `GET /?mode=agent` | Rewrites to `agent-view.json` |
| `GET /api/jobs` | Paginated job list (filters; backed by jobs-runtime) |
| `GET /api/news` | Native news headlines |
| `GET /api/events` | Upcoming events |
| `GET /api/glossary` | Glossary terms |
| `GET /api/v1/*` | Aliases of the `/api/*` list routes |
| `POST /api/mcp` | MCP JSON-RPC |
| `GET /ask` | NLWeb-style guidance (query param `q`) |

OpenAPI spec: `https://hashtagweb3.com/openapi.json` (legacy mirror: `/api/openapi.json`).

**Not hosted on production:** `/api/sandbox/*`.

## Agent discovery

| Endpoint | Description |
|----------|-------------|
| `GET /llms.txt` | Navigation index for LLMs |
| `GET /openapi.json` | OpenAPI 3.1.0 static catalog spec |
| `GET /auth.md` | WorkOS-spec agent auth guide (optional integrations) |
| `GET /.well-known/agents.json` | Agent discovery manifest |
| `GET /.well-known/plugin.json` | Agent Plugins manifest |
| `GET /.well-known/mcp/server-card.json` | MCP server card metadata (discovery) |

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm run lint         # ESLint (next/core-web-vitals)
npm run typecheck    # tsc --noEmit
```

## Coding Conventions

- **TypeScript**: All source files use TypeScript. Avoid `any` types.
- **Components**: Server Components by default; add `'use client'` only when necessary.
- **Errors**: Prefer structured JSON for API-style routes: `{ error: { code, message, hint, docUrl } }`.
- **Content-Type**: Serve `.md` files as `text/markdown; charset=utf-8`.
- **Styles**: Use Tailwind CSS utility classes; no CSS-in-JS.
- **OpenAPI / llms.txt**: Update when changing public catalog URLs or agent discovery.

## Native News Content

News-specific editorial requirements live in [`content/articles/AGENTS.md`](content/articles/AGENTS.md). Read that guide before creating or materially revising a native article with `category: News`.

## Optional agent auth

WorkOS-style registration flows are documented in `/auth.md` for agents that need authenticated access in forked or private deployments. The public site does not require auth to read `/data/*` catalogs.

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
