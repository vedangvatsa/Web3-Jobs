#!/bin/bash

# Phase 3 Fluff Removal - Batch Processing Script
# This script applies the established replacement patterns to all Phase 3 articles
# Run from repo root: bash scripts/cleanup-fluff-phase3.sh

set -e

echo "Phase 3 Fluff Cleanup: Processing 261 articles..."
echo ""

# Articles already cleaned (Phase 1)
EXCLUDE="understanding-account-abstraction|facial-recognition|blockchain-features-that|naval-ravikant|ethereum-genesis|deep-dive-into-account"

# Get all articles that need cleaning (excluding Phase 1)
ARTICLES=$(grep -l "revolutionary\|game-changer\|unlock\|seamless\|cutting-edge\|unprecedented\|supercharge\|ultimate\|elevate\|transform your" content/articles/*.md | grep -v -E "$EXCLUDE")

TOTAL=$(echo "$ARTICLES" | wc -l)
COUNT=0

for file in $ARTICLES; do
  COUNT=$((COUNT + 1))
  FILENAME=$(basename "$file")
  
  # Apply standardized replacements (avoiding context-specific changes)
  
  # 1. "revolutionary" -> remove or contextualize (be cautious with titles)
  sed -i '' 's/[Ii]s revolutionary/changes/g' "$file"
  sed -i '' 's/[Aa]re revolutionary/enable/g' "$file"
  sed -i '' 's/revolutionary potential/potential/g' "$file"
  sed -i '' 's/genuinely revolutionary/significant/g' "$file"
  
  # 2. "game-changer" -> "enables/improves"
  sed -i '' 's/[Ii]s a game-changer/enables/g' "$file"
  sed -i '' 's/[Ii]s game-changing/enables/g' "$file"
  sed -i '' "s/\bthe game-changer\b/a key capability/g" "$file"
  
  # 3. "unlock" / "unlocks" -> "enable/enables"
  sed -i '' 's/\bunlock\b/enable/g' "$file"
  sed -i '' 's/\bunlocks\b/enables/g' "$file"
  
  # 4. "seamless" -> remove or be specific
  sed -i '' 's/seamless //g' "$file"
  sed -i '' 's/ seamless//g' "$file"
  
  # 5. "cutting-edge" -> remove
  sed -i '' 's/cutting-edge //g' "$file"
  sed -i '' 's/ cutting-edge//g' "$file"
  
  # 6. "unprecedented" -> remove or contextualize
  sed -i '' 's/unprecedented //g' "$file"
  sed -i '' 's/ unprecedented//g' "$file"
  
  # 7. "supercharge" -> "improve" / "increase"
  sed -i '' 's/supercharge/improve/g' "$file"
  sed -i '' 's/Supercharge/Improve/g' "$file"
  
  # 8. "ultimate" when used as superlative -> "core" or remove
  sed -i '' 's/the ultimate /the core /g' "$file"
  sed -i '' 's/The ultimate /The core /g' "$file"
  
  # 9. "elevate your" -> "improve your"
  sed -i '' 's/elevate your/improve your/g' "$file"
  sed -i '' 's/Elevate your/Improve your/g' "$file"
  
  # 10. "transform your" -> "change how you"
  sed -i '' 's/transform your/change how you/g' "$file"
  sed -i '' 's/Transform your/Change how you/g' "$file"
  
  # Progress indicator every 50 files
  if [ $((COUNT % 50)) -eq 0 ]; then
    echo "Progress: $COUNT / $TOTAL files processed..."
  fi
done

echo ""
echo "✅ Phase 3 Cleanup Complete!"
echo "Processed: $TOTAL articles"
echo ""
echo "Next steps:"
echo "1. Review changes: git diff content/articles/"
echo "2. Commit: git add content/articles/ && git commit -m 'fix: remove fluff phrases across 261 articles (phase 3)'"
echo "3. Push: git push origin main"
