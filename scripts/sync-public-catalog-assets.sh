#!/usr/bin/env sh
# Copy committed runtime catalogs and shards into public/ (CDN paths).
set -eu
mkdir -p public/data public/job-description-shards public/job-shards
cp content/jobs-runtime.json content/events-runtime.json content/glossary-runtime.json \
  content/companies-runtime.json content/company-profiles-runtime.json \
  content/articles-index.json content/news-cache.json public/data/ 2>/dev/null || true
cp -r content/job-description-shards/. public/job-description-shards/ 2>/dev/null || true
cp -r content/job-shards/. public/job-shards/ 2>/dev/null || true
