#!/usr/bin/env python3
"""Remove generic filler and nav-scrape sentences from base popup bodies."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BASE_PATH = ROOT / "tmp/popups/base-popups.json"

DROP = [
    re.compile(r"describes its work on .+ in short", re.I),
    re.compile(r"Fees, visas, and cohort dates change", re.I),
    re.compile(r"read that page for wording straight from the team", re.I),
    re.compile(r"^The public site titles the project", re.I),
    re.compile(r"^Recent pages reference 20\d{2}", re.I),
    re.compile(r"^Perspectives:", re.I),
    re.compile(r"Get tickets \$", re.I),
    re.compile(r"Sign up \$", re.I),
    re.compile(r"Read more", re.I),
    re.compile(r"♔"),
    re.compile(r"Get a job", re.I),
    re.compile(r"All results go into", re.I),
    re.compile(r"Burn Calories", re.I),
    re.compile(r"Then set up an office on", re.I),
    re.compile(r"make it easy to be healthy", re.I),
    re.compile(r"^\d{2}\s*-\s*What .+ do ", re.I),
]


def normalize_text(text: str) -> str:
    t = text.replace("\u00a0", " ")
    t = t.replace("Â", "")
    t = t.replace("♔", " ")
    t = t.replace("→", " ")
    t = re.sub(r"\s+", " ", t).strip()
    return t


def main() -> None:
    base = json.loads(BASE_PATH.read_text(encoding="utf-8"))
    for popup in base:
        kept = []
        for p in popup.get("body") or []:
            p = normalize_text(p)
            if len(p) < 12:
                continue
            if any(d.search(p) for d in DROP):
                continue
            kept.append(p)
        popup["body"] = kept
        popup["tagline"] = normalize_text(popup.get("tagline") or "")
        popup["summary"] = normalize_text(popup.get("summary") or "")
    BASE_PATH.write_text(json.dumps(base, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print("scrubbed base-popups.json")


if __name__ == "__main__":
    main()
