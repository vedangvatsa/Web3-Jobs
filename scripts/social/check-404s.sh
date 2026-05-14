#!/bin/bash
# Check all job URLs for 404s with 20 parallel workers
DEAD_FILE="/tmp/dead_links.txt"
> "$DEAD_FILE"

TOTAL=$(wc -l < /tmp/all_job_urls.txt)
echo "Checking $TOTAL URLs for 404s..."
CHECKED=0

check_url() {
  local url="$1"
  CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 8 -L "$url" 2>/dev/null)
  if [ "$CODE" = "404" ] || [ "$CODE" = "410" ]; then
    echo "$CODE $url" >> "$DEAD_FILE"
    echo "❌ $CODE $url"
  fi
}

export -f check_url
export DEAD_FILE

# Use GNU parallel-style with while loop
COUNT=0
PIDS=()
while IFS= read -r url; do
  check_url "$url" &
  PIDS+=($!)
  COUNT=$((COUNT + 1))
  
  # Limit concurrency to 20
  if [ ${#PIDS[@]} -ge 20 ]; then
    wait "${PIDS[0]}"
    PIDS=("${PIDS[@]:1}")
  fi
  
  if [ $((COUNT % 100)) -eq 0 ]; then
    echo "  Progress: $COUNT / $TOTAL checked..."
  fi
done < /tmp/all_job_urls.txt

# Wait for remaining
wait

DEAD_COUNT=$(wc -l < "$DEAD_FILE")
echo ""
echo "=== DONE ==="
echo "Total checked: $TOTAL"
echo "Dead links (404/410): $DEAD_COUNT"
if [ "$DEAD_COUNT" -gt 0 ]; then
  echo ""
  echo "Dead links:"
  cat "$DEAD_FILE"
fi
