#!/usr/bin/env sh
# Copy committed runtime catalogs and shards into public/ (CDN paths).
# Jobs and article listings require their public catalogues.
set -eu
mkdir -p public/data public/job-description-shards public/job-shards

test -f content/jobs-runtime.json
test -f content/articles-index.json
cp content/jobs-runtime.json public/data/jobs-runtime.json
cp content/articles-index.json public/data/articles-index.json
cp content/citizenship.json public/data/citizenship.json
cp content/hiring-report-stats.json content/hiring-report-salary-sample.json content/hiring-report-analysis-evidence.json public/data/

cp content/events-runtime.json content/glossary-runtime.json \
  content/companies-runtime.json content/company-profiles-runtime.json \
  content/company-socials.json content/news-cache.json public/data/ 2>/dev/null || true

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
