#!/usr/bin/env python3
"""
fix-ig-ratio.py — Place images onto a standard IG canvas WITHOUT resizing.

Instagram feed posts require aspect ratios between 4:5 and 1.91:1.
This script centers the original image (untouched) onto a 1080×1350
black canvas so nothing gets distorted or cropped.

If the image is larger than the canvas, it scales DOWN to fit (preserving
aspect ratio). It never scales UP — small images stay sharp.

Usage:
    python3 fix-ig-ratio.py image.png                # → image_ig.png
    python3 fix-ig-ratio.py /path/to/folder/         # fixes all in folder
    python3 fix-ig-ratio.py image.png --bg "#1a1a2e"  # custom bg color
"""

import sys
import os
from pathlib import Path

try:
    from PIL import Image, ImageColor
except ImportError:
    print("Installing Pillow...")
    os.system(f"{sys.executable} -m pip install Pillow -q")
    from PIL import Image, ImageColor

CANVAS_W = 1080
CANVAS_H = 1350  # 4:5 ratio — best IG engagement
BG_COLOR = "#000000"


def fix_image(input_path: str, bg_color: str = BG_COLOR):
    img = Image.open(input_path).convert("RGBA")
    w, h = img.size
    ratio = w / h

    # IG limits: 4:5 (0.8) to 1.91:1
    if 0.8 <= ratio <= 1.91:
        print(f"  ✅ {os.path.basename(input_path)} — {w}×{h} (ratio {ratio:.2f}) — already IG-safe")
        return

    print(f"  🔧 {os.path.basename(input_path)} — {w}×{h} (ratio {ratio:.2f})")

    # Create the canvas
    canvas = Image.new("RGBA", (CANVAS_W, CANVAS_H), ImageColor.getrgb(bg_color) + (255,))

    # Scale down ONLY if the image is larger than the canvas (never scale up)
    scale = min(CANVAS_W / w, CANVAS_H / h, 1.0)
    if scale < 1.0:
        new_w = int(w * scale)
        new_h = int(h * scale)
        img = img.resize((new_w, new_h), Image.LANCZOS)
    else:
        new_w, new_h = w, h

    # Center on canvas
    x = (CANVAS_W - new_w) // 2
    y = (CANVAS_H - new_h) // 2
    canvas.paste(img, (x, y), img)

    # Save as RGB (IG doesn't support alpha)
    output = canvas.convert("RGB")
    ext = Path(input_path).suffix
    out_path = str(input_path).replace(ext, f"_ig{ext}")
    output.save(out_path, quality=95)
    print(f"  → {CANVAS_W}×{CANVAS_H} saved to {os.path.basename(out_path)}")
    return out_path


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 fix-ig-ratio.py <image|directory> [--bg '#hex']")
        sys.exit(1)

    target = sys.argv[1]
    bg = BG_COLOR
    if "--bg" in sys.argv:
        bg = sys.argv[sys.argv.index("--bg") + 1]

    if os.path.isdir(target):
        exts = {".png", ".jpg", ".jpeg", ".webp"}
        files = [f for f in Path(target).iterdir() if f.suffix.lower() in exts and "_ig" not in f.stem]
        print(f"Scanning {len(files)} images in {target}...\n")
        fixed = 0
        for f in sorted(files):
            result = fix_image(str(f), bg)
            if result:
                fixed += 1
        print(f"\n{'─' * 40}")
        print(f"Fixed: {fixed} images")
    else:
        fix_image(target, bg)


if __name__ == "__main__":
    main()
