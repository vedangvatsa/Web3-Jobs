#!/bin/zsh
# Manual helper only. Production posting uses GitHub Actions cron on
# refresh-jobs-cache.yml. Do not wire this to launchd or any always-on Mac.
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
REPO="$(cd "$(dirname "$0")/.." && pwd)"
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
