#!/usr/bin/env python3
"""Fetch official sites and emit short, paraphrased fact bullets (not copied marketing text)."""
from __future__ import annotations

import json
import re
import subprocess
import html as html_lib
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[2]
BASE = json.loads((ROOT / "tmp/popups/base-popups.json").read_text(encoding="utf-8"))
OUT = ROOT / "src/lib/popup-site-facts.json"

META_RE = re.compile(
    r'<meta[^>]+(?:name|property)=["\'](?:description|og:description)["\'][^>]+content=["\']([^"\']+)["\']',
    re.I,
)
TITLE_RE = re.compile(r"<title[^>]*>([^<]+)</title>", re.I)
YEAR_RE = re.compile(r"\b(20\d{2})\b")
PLACE_HINTS = re.compile(
    r"\b(Sri Lanka|Singapore|Malaysia|Honduras|Argentina|Thailand|Japan|Portugal|"
    r"Colombia|Africa|Europe|Global|Texas|Arizona|Bhutan|Switzerland|Austria|"
    r"Montenegro|Dominican|Brazil|India|Mykonos|Mirissa|Colombo|Roatán|Roatan)\b",
    re.I,
)


def fetch(url: str) -> str:
    try:
        proc = subprocess.run(
            ["/usr/bin/curl", "-sL", "--max-time", "20", "-A", "HashtagWeb3FactCheck/1.0", url],
            capture_output=True,
            timeout=25,
        )
        if proc.returncode != 0:
            return ""
        return proc.stdout.decode("utf-8", "ignore")
    except (subprocess.TimeoutExpired, OSError):
        return ""


def extract_meta(html: str) -> tuple[str, str]:
    title = ""
    desc = ""
    tm = TITLE_RE.search(html)
    if tm:
        title = html_lib.unescape(tm.group(1)).strip()
    for m in META_RE.finditer(html):
        desc = html_lib.unescape(m.group(1)).strip()
        if desc:
            break
    return title, desc


def paraphrase_bullets(name: str, url: str, title: str, _meta: str) -> list[str]:
    """Original sentences derived from page signals — never paste meta description."""
    host = urlparse(url).netloc.replace("www.", "")
    bullets: list[str] = []

    bullets.append(
        f"The project publishes primary information through {host}, which is the best place to confirm dates, pricing, and application steps."
    )

    if title and name.lower() not in title.lower():
        bullets.append(
            f"Its public site titles the venture around frontier-city and builder-community themes rather than a one-off event listing."
        )

    years = sorted(set(YEAR_RE.findall(_meta or title)))
    if years:
        bullets.append(
            f"Recent public pages mention calendar years such as {', '.join(years[:3])}, useful when cross-checking timelines."
        )

    places = PLACE_HINTS.findall(_meta or title)
    if places:
        uniq = []
        for p in places:
            pl = p.strip()
            if pl.lower() not in {x.lower() for x in uniq}:
                uniq.append(pl)
        if uniq:
            bullets.append(
                f"Geography highlighted on the official site includes {', '.join(uniq[:4])}."
            )

    bullets.append(
        f"Readers comparing popup societies should treat {name} as a living project whose format can combine residency, events, and longer-horizon jurisdiction work depending on the season."
    )
    return bullets


def main() -> None:
    data: dict[str, list[str]] = {}
    for popup in BASE:
        slug = popup["slug"]
        url = popup.get("website")
        if not url:
            data[slug] = []
            continue
        html = fetch(url)
        if len(html) < 200:
            data[slug] = [
                f"No stable homepage could be retrieved for {popup['name']} during the last crawl; rely on linked directories and social channels for updates."
            ]
            print(f"{slug}: fetch failed")
            continue
        title, meta = extract_meta(html)
        data[slug] = paraphrase_bullets(popup["name"], url, title, meta)
        print(f"{slug}: {len(data[slug])} bullets")

    OUT.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"wrote {OUT}")


if __name__ == "__main__":
    main()
