#!/bin/bash
# fix-ig-ratio.sh — Fix images with bad aspect ratios for Instagram
#
# Instagram feed posts: 4:5 (portrait) to 1.91:1 (landscape)
# This script adds padding to make non-compliant images fit 4:5 (1080×1350)
#
# Usage: 
#   ./fix-ig-ratio.sh image.png              # creates image_ig.png
#   ./fix-ig-ratio.sh /path/to/folder/       # fixes all images in folder

set -e

TARGET_W=1080
TARGET_H=1350  # 4:5 ratio — best engagement on IG

fix_image() {
  local input="$1"
  local ext="${input##*.}"
  local base="${input%.*}"
  local output="${base}_ig.${ext}"

  # Get current dimensions
  local w=$(sips -g pixelWidth "$input" 2>/dev/null | awk '/pixelWidth/{print $2}')
  local h=$(sips -g pixelHeight "$input" 2>/dev/null | awk '/pixelHeight/{print $2}')
  local ratio=$(echo "scale=3; $w / $h" | bc)

  # Instagram limits: 0.8 (4:5) to 1.91 (1.91:1)
  local min_ratio="0.800"
  local max_ratio="1.910"

  if (( $(echo "$ratio >= $min_ratio && $ratio <= $max_ratio" | bc -l) )); then
    echo "✅ $(basename $input) — ${w}×${h} (ratio: ${ratio}) — already IG-safe"
    return
  fi

  echo "🔧 $(basename $input) — ${w}×${h} (ratio: ${ratio}) — fixing..."

  # Use sips to resize and pad to 1080×1350 with black background
  cp "$input" "$output"
  
  # First, resize to fit within 1080×1350 while maintaining aspect ratio
  sips --resampleHeightWidthMax ${TARGET_H} "$output" > /dev/null 2>&1
  
  # Then pad to exact 1080×1350 with black
  sips --padToHeightWidth ${TARGET_H} ${TARGET_W} --padColor 000000 "$output" > /dev/null 2>&1
  
  local new_w=$(sips -g pixelWidth "$output" 2>/dev/null | awk '/pixelWidth/{print $2}')
  local new_h=$(sips -g pixelHeight "$output" 2>/dev/null | awk '/pixelHeight/{print $2}')
  echo "  → ${new_w}×${new_h} saved to $(basename $output)"
}

if [ -z "$1" ]; then
  echo "Usage: $0 <image.png|directory/>"
  echo ""
  echo "Fixes images with aspect ratios outside Instagram's 4:5–1.91:1 range"
  echo "by padding them to 1080×1350 (4:5) with a black background."
  exit 1
fi

if [ -d "$1" ]; then
  for f in "$1"/*.{png,jpg,jpeg,webp} 2>/dev/null; do
    [ -f "$f" ] && fix_image "$f"
  done
else
  fix_image "$1"
fi
