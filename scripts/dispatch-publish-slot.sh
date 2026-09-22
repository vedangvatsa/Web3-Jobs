#!/bin/zsh
# Fire one publish slot on GitHub. Used by launchd at 9:00 / 17:00 / 01:00 IST
# because GitHub's public-repo cron delivers the same workflow hours late.
set -euo pipefail
SLOT="${1:-morning}"
case "$SLOT" in
  morning|afternoon|evening) ;;
  *)
    echo "Usage: $0 morning|afternoon|evening" >&2
    exit 1
    ;;
esac
export PATH="/opt/homebrew/bin:/usr/local/bin:${PATH:-}"
REPO="/Users/vedang/.gemini/antigravity/scratch/Web3-Jobs"
cd "$REPO"
echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) dispatching slot=$SLOT"
gh workflow run refresh-jobs-cache.yml --ref main -f "slot=$SLOT"
echo "dispatched slot=$SLOT"
