#!/bin/bash

# Verify all image URLs in glossary terms are valid
# Extracts unique URLs and checks HTTP status

echo "Verifying glossary image URLs..."
echo "================================"

# Extract unique image URLs
URLs=$(grep "^image:" LOCAL_PATH/content/glossary/*.md | sed 's/.*image: "\(.*\)"/\1/' | sort -u)

total=0
valid=0
broken=0
broken_urls=()

echo "Checking $(echo "$URLs" | wc -l) unique image URLs..."
echo ""

while IFS= read -r url; do
  total=$((total + 1))
  
  # Check HTTP status with timeout
  status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$url" 2>/dev/null)
  
  if [ "$status" = "200" ]; then
    valid=$((valid + 1))
    echo "✓ [$total] $status - $(echo $url | cut -c1-80)..."
  else
    broken=$((broken + 1))
    broken_urls+=("$url (HTTP $status)")
    echo "✗ [$total] $status - $(echo $url | cut -c1-80)..."
  fi
done <<< "$URLs"

echo ""
echo "================================"
echo "Summary:"
echo "  Total URLs:   $total"
echo "  Valid (200):  $valid"
echo "  Broken:       $broken"
echo "================================"

if [ $broken -gt 0 ]; then
  echo ""
  echo "Broken URLs:"
  printf '%s\n' "${broken_urls[@]}"
  exit 1
else
  echo "✓ All image URLs are valid!"
  exit 0
fi
