#!/usr/bin/env sh
# Copy committed runtime catalogs and shards into public/ (CDN paths).
# Fail hard if the jobs catalog is missing — job pages depend on it.
set -eu
mkdir -p public/data public/job-description-shards public/job-shards

test -f content/jobs-runtime.json
cp content/jobs-runtime.json public/data/jobs-runtime.json

cp content/events-runtime.json content/glossary-runtime.json \
  content/companies-runtime.json content/company-profiles-runtime.json \
  content/articles-index.json content/news-cache.json public/data/ 2>/dev/null || true

if [ -d content/job-description-shards ]; then
  cp -r content/job-description-shards/. public/job-description-shards/
fi

if [ -d content/job-shards ]; then
  shard_count=$(find content/job-shards -name 'job-shard-*.json' | wc -l | tr -d ' ')
  if [ "$shard_count" -lt 64 ]; then
    echo "error: expected 64 job shards, found $shard_count" >&2
    exit 1
  fi
  cp -r content/job-shards/. public/job-shards/
fi
