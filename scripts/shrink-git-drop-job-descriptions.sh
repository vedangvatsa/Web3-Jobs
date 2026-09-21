#!/usr/bin/env bash
# Drop removed monolithic job descriptions from all git history (~1 GiB pack bloat).
# Rewrites history — coordinate with the team, then force-push all branches that need it.
#
#   ./scripts/shrink-git-drop-job-descriptions.sh
#   git push --force-with-lease origin main
#
set -eu
cd "$(git rev-parse --show-toplevel)"

if ! command -v git-filter-repo >/dev/null 2>&1; then
  echo "Install git-filter-repo (brew install git-filter-repo)" >&2
  exit 1
fi

echo "Removing content/job-descriptions.json from entire history…"
git filter-repo --path content/job-descriptions.json --invert-paths --force

echo "Done. Run: git count-objects -vH"
echo "Re-add origin if filter-repo removed it: git remote add origin <url>"
