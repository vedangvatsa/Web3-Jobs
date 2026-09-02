#!/bin/bash

# Expands opening definition paragraphs in glossary entries to 140-160 words
# for optimal AI citability. Adds real-world example, cited statistic, and career relevance.
#
# Usage:
#   ./scripts/expand-glossary-openings.sh            # Process all short entries
#   ./scripts/expand-glossary-openings.sh --dry-run  # Preview without writing
#   ./scripts/expand-glossary-openings.sh smart-contract.md  # Single file

GLOSSARY_DIR="content/glossary"
DRY_RUN=false
SINGLE_FILE=""
MIN_WORDS=134
PROCESSED=0
SKIPPED=0
FAILED=0

# Parse args
for arg in "$@"; do
  if [ "$arg" = "--dry-run" ]; then
    DRY_RUN=true
  elif [[ "$arg" == *.md ]]; then
    SINGLE_FILE="$arg"
  fi
done

# Extract opening paragraph (text between end of frontmatter and first ## heading)
get_opening() {
  local file="$1"
  awk '
    /^---/ { n++; next }
    n < 2 { next }
    /^##/ { exit }
    /^$/ && !started { next }
    { started=1; print }
  ' "$file"
}

# Count words in opening
opening_word_count() {
  get_opening "$1" | wc -w | tr -d ' '
}

# Get term name and description from frontmatter
get_field() {
  local file="$1"
  local field="$2"
  awk -v f="$field" '
    /^---/ { n++ }
    n==1 && $0 ~ "^"f":" {
      sub("^"f":[ \t]*\"?", ""); sub("\"?$", ""); print; exit
    }
  ' "$file"
}

expand_opening() {
  local file="$1"
  local term
  local description
  local current_opening
  local word_count

  term=$(get_field "$file" "term")
  description=$(get_field "$file" "description")
  current_opening=$(get_opening "$file")
  word_count=$(echo "$current_opening" | wc -w | tr -d ' ')

  echo "→ $term ($word_count words)"

  if [ "$word_count" -ge "$MIN_WORDS" ]; then
    echo "  ✓ Already $word_count words, skipping"
    ((SKIPPED++))
    return 0
  fi

  local prompt="You are rewriting the opening definition paragraph for a Web3 glossary entry on \"$term\".

Current opening paragraph:
$current_opening

Official description: $description

Rewrite the opening into a single prose paragraph of exactly 140-160 words that:
1. Starts with \"$term is...\" or \"$term refers to...\" (definition pattern)
2. Includes one concrete real-world example (e.g. a specific protocol, company, or use case)
3. Includes one specific statistic with a source attribution in parentheses (e.g. \"according to DeFiLlama\", \"per Chainalysis\", \"as of 2025\")
4. Ends with one sentence about career relevance or job market demand
5. Uses plain prose only — no bullet points, no headings, no markdown formatting
6. Is self-contained and fully understandable without reading the rest of the article

Output ONLY the paragraph text, nothing else. No preamble, no explanation."

  local new_opening
  new_opening=$(echo "$prompt" | claude --print 2>/dev/null)

  if [ -z "$new_opening" ]; then
    echo "  ✗ Failed to get response"
    ((FAILED++))
    return 1
  fi

  local new_word_count
  new_word_count=$(echo "$new_opening" | wc -w | tr -d ' ')
  echo "  → New opening: $new_word_count words"

  if [ "$DRY_RUN" = true ]; then
    echo "  [DRY RUN] Would write:"
    echo "$new_opening" | head -3
    echo "  ..."
    ((PROCESSED++))
    return 0
  fi

  # Replace the opening paragraph in the file
  # Strategy: find end of frontmatter (2nd ---), skip blank lines,
  # replace up to first ## with new_opening
  python3 - "$file" "$new_opening" <<'PYEOF'
import sys
import re

filepath = sys.argv[1]
new_opening = sys.argv[2]

with open(filepath, 'r') as f:
    content = f.read()

# Split on frontmatter
parts = content.split('---', 2)
if len(parts) < 3:
    print(f"ERROR: Could not parse frontmatter in {filepath}", file=sys.stderr)
    sys.exit(1)

frontmatter = '---' + parts[1] + '---'
body = parts[2]

# Remove leading whitespace/newlines from body
body = body.lstrip('\n')

# Find where first ## heading is
heading_match = re.search(r'^##', body, re.MULTILINE)
if heading_match:
    rest = body[heading_match.start():]
else:
    rest = ''

# Reconstruct: frontmatter + newline + new_opening + newline + rest
new_content = frontmatter + '\n\n' + new_opening.strip() + '\n\n' + rest

with open(filepath, 'w') as f:
    f.write(new_content)

print(f"  ✓ Written")
PYEOF

  if [ $? -eq 0 ]; then
    ((PROCESSED++))
  else
    ((FAILED++))
  fi
}

# Main
echo "Glossary Opening Expander"
echo "Mode: $([ "$DRY_RUN" = true ] && echo 'DRY RUN' || echo 'LIVE')"
echo "Target: ≥$MIN_WORDS words per opening"
echo ""

if [ -n "$SINGLE_FILE" ]; then
  expand_opening "$GLOSSARY_DIR/$SINGLE_FILE"
else
  for f in "$GLOSSARY_DIR"/*.md; do
    expand_opening "$f"
    # Small delay to avoid rate limiting
    sleep 0.5
  done
fi

echo ""
echo "Done: $PROCESSED expanded, $SKIPPED skipped (already long enough), $FAILED failed"
