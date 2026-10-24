#!/bin/zsh
# Fire one publish slot on GitHub. Used by launchd at 9:00 / 17:00 / 01:00 IST
# because GitHub's public-repo cron delivers the same workflow hours late.
set -euo pipefail
SLOT="${1:-morning}"
FORCE="${2:-}"
case "$SLOT" in
  morning|afternoon|evening) ;;
  *)
    echo "Usage: $0 morning|afternoon|evening [--force]" >&2
    exit 1
    ;;
esac
export PATH="/opt/homebrew/bin:/usr/local/bin:${PATH:-}"
REPO="/Users/vedang/.gemini/antigravity/scratch/Web3-Jobs"
cd "$REPO"

EXTRA_FLAGS=()
if [ "$FORCE" = "--force" ] || [ "${FORCE_SOCIAL:-}" = "true" ]; then
  EXTRA_FLAGS+=(-f "force_social=true")
fi

echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) dispatching slot=$SLOT ${EXTRA_FLAGS[*]:-}"

MAX_RETRIES=12
RETRY_DELAY=5
SUCCESS=0
for i in $(seq 1 $MAX_RETRIES); do
  if gh workflow run refresh-jobs-cache.yml --ref main -f "slot=$SLOT" "${EXTRA_FLAGS[@]}"; then
    echo "dispatched slot=$SLOT"
    SUCCESS=1
    break
  fi
  echo "Attempt $i failed. Retrying in ${RETRY_DELAY}s (waiting for network)..."
  sleep "$RETRY_DELAY"
done

if [ "$SUCCESS" -ne 1 ]; then
  echo "Failed to dispatch slot=$SLOT after $MAX_RETRIES attempts" >&2
  exit 1
fi
