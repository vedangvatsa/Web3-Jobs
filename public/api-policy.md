---
title: "Hashtag Web3 data catalog policy"
description: "How static /data/* catalogs are versioned and updated on hashtagweb3.com."
canonical: "https://hashtagweb3.com/api-policy"
last-updated: "2026-09-21"
---

# Hashtag Web3 data catalog policy

Production integrators use **static JSON** under `/data/*`, not hosted REST catalog APIs.

## Catalog URLs

- `/data/jobs-runtime.json`
- `/data/news-cache.json`
- `/data/events-runtime.json`
- `/data/glossary-runtime.json`
- `/agent-view.json` (capability index)

OpenAPI: [`/openapi.json`](https://hashtagweb3.com/openapi.json)

## Updates

Snapshots refresh on site ingest/deploy cycles. Use HTTP caching headers and re-fetch periodically. Filter and paginate client-side.

## Contact

- Email: contact@hashtagweb3.com
- Documentation: https://hashtagweb3.com/developers
