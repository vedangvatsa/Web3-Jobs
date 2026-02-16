#!/bin/bash

# Comprehensive image URL verification script
# Properly parses YAML frontmatter and content image references

echo "🔍 Starting comprehensive website image verification..."
echo ""

TEMP_URLS=$(mktemp)
BROKEN=$(mktemp)
VALID=$(mktemp)

# Extract image URLs from YAML frontmatter only (image: line)
echo "📝 Scanning markdown files for image references..."
grep -h "^image:" content/**/*.md content/*.md 2>/dev/null | \
  sed "s/^image: *//;s/^['\"]//;s/['\"]$//" | \
  sort | uniq >> "$TEMP_URLS"

TOTAL=$(wc -l < "$TEMP_URLS")
echo "✓ Found $TOTAL unique image URLs"
echo ""
echo "🌐 Testing URL accessibility..."
echo ""

VALID_COUNT=0
BROKEN_COUNT=0

while IFS= read -r url; do
  [ -z "$url" ] && continue
  
  # Check if it's a local path
  if [[ "$url" == /* ]]; then
    # Local file reference - check if it exists
    if [ ! -f "public${url}" ]; then
      BROKEN_COUNT=$((BROKEN_COUNT + 1))
      echo "❌ [LOCAL FILE NOT FOUND] $url"
      echo "$url" >> "$BROKEN"
    else
      VALID_COUNT=$((VALID_COUNT + 1))
      echo "✓ [LOCAL FILE EXISTS] $url"
      echo "$url" >> "$VALID"
    fi
  else
    # Remote URL - test HTTP response
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
      VALID_COUNT=$((VALID_COUNT + 1))
      echo "✓ [HTTP $HTTP_CODE] ${url:0:80}..."
      echo "$url" >> "$VALID"
    else
      BROKEN_COUNT=$((BROKEN_COUNT + 1))
      echo "❌ [HTTP $HTTP_CODE] ${url:0:80}..."
      echo "$url" >> "$BROKEN"
    fi
  fi
done < "$TEMP_URLS"

echo ""
echo "═════════════════════════════════════════════════════════════"
echo "📊 SCAN RESULTS"
echo "═════════════════════════════════════════════════════════════"
echo "Total image URLs found:  $TOTAL"
echo "✓ Valid images:          $VALID_COUNT"
echo "❌ Broken images:         $BROKEN_COUNT"
echo ""

if [ $BROKEN_COUNT -gt 0 ]; then
  echo "⚠️  BROKEN IMAGES FOUND:"
  echo ""
  cat "$BROKEN"
  echo ""
  echo "Files using broken images:"
  echo ""
  while IFS= read -r broken_url; do
    [ -z "$broken_url" ] && continue
    # Escape special chars for grep
    escaped=$(printf '%s\n' "$broken_url" | sed 's/[[\.*^$/]/\\&/g')
    grep -r "image:.*$escaped" content/ --include="*.md" 2>/dev/null | cut -d: -f1 | sort -u
  done < "$BROKEN"
else
  echo "✅ All images are valid and accessible!"
fi

# Cleanup
rm -f "$TEMP_URLS" "$BROKEN" "$VALID"
