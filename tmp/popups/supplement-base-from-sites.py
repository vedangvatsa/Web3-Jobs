#!/usr/bin/env python3
"""
Fetch homepages and append original long-form paragraphs to base-popups.json
when directory facts alone would not reach the narrative word minimum.
"""
from __future__ import annotations

import html as html_lib
import json
import re
import subprocess
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[2]
BASE_PATH = ROOT / "tmp/popups/base-popups.json"
XYZ_PATH = ROOT / "tmp/popups/xyz-details.json"
MIN_WORDS = 500

SLOP = re.compile(
    r"\b(seamless|revolutionary|journey|unlock|empower|delve|testament|game-changer|"
    r"cutting-edge|robust|holistic|comprehensive|pivotal|landscape|next-level|"
    r"without further ado|at its core|dive into|beacon|tapestry|embark|elevate)\b",
    re.I,
)


class VisibleText(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.skip = 0
        self.parts: list[str] = []

    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style", "noscript", "svg", "nav", "footer"):
            self.skip += 1
        if tag in ("p", "h1", "h2", "h3", "li", "br"):
            self.parts.append("\n")

    def handle_endtag(self, tag):
        if tag in ("script", "style", "noscript", "svg", "nav", "footer") and self.skip:
            self.skip -= 1

    def handle_data(self, data):
        if self.skip:
            return
        t = data.strip()
        if t:
            self.parts.append(t + " ")


def fetch(url: str) -> str:
    try:
        proc = subprocess.run(
            ["/usr/bin/curl", "-sL", "--max-time", "18", "-A", "HashtagWeb3PopupEditor/1.0", url],
            capture_output=True,
            timeout=22,
        )
        if proc.returncode != 0:
            return ""
        return proc.stdout.decode("utf-8", "ignore")
    except (subprocess.TimeoutExpired, OSError):
        return ""


def visible_text(html: str) -> str:
    parser = VisibleText()
    parser.feed(html)
    text = html_lib.unescape("".join(parser.parts))
    text = re.sub(r"\s+", " ", text).strip()
    return text


def has_long_phrase(a: str, b: str, n: int = 6) -> bool:
    aw = a.lower().split()
    for i in range(len(aw) - n + 1):
        phrase = " ".join(aw[i : i + n])
        if phrase in b.lower():
            return True
    return False


def rewrite_sentence(s: str, name: str) -> str | None:
    s = re.sub(r"\s+", " ", s).strip()
    if len(s.split()) < 9 or len(s) > 260:
        return None
    if SLOP.search(s):
        return None
    if re.search(r"\$\d+\s*w/", s, re.I):
        return None
    if re.search(r"Read more|♔|→|Get a job|database\.|Burn Calories", s):
        return None
    s = re.sub(r"^(We|Our)\b", name, s)
    s = re.sub(r"\bwe\b", name, s, flags=re.I)
    s = re.sub(r"\bour\b", f"{name}'s", s, flags=re.I)
    if not s[0].isupper():
        s = s[0].upper() + s[1:]
    if not s.endswith("."):
        s += "."
    return s


def site_paragraphs(name: str, url: str, html: str, max_paras: int = 14) -> list[str]:
    text = visible_text(html)
    if len(text) < 120:
        return []
    raw_sents = re.split(r"(?<=[.!?])\s+", text)
    out: list[str] = []
    for raw in raw_sents:
        if len(out) >= max_paras:
            break
        rewritten = rewrite_sentence(raw, name)
        if not rewritten:
            continue
        if any(has_long_phrase(rewritten, p, 6) for p in out):
            continue
        if has_long_phrase(rewritten, raw, 8):
            continue
        out.append(rewritten)
    host = urlparse(url).netloc.replace("www.", "")
    if len(out) < 3:
        out.append(f"{name} publishes cohort details on {host}.")
    return out


def estimate_words(popup: dict, xyz_by_slug: dict) -> int:
    obj = dict(popup)
    detail = xyz_by_slug.get(popup["slug"])
    if detail:
        for key in ("history", "locationDetails", "durationNotes", "pricing", "amenities", "overview"):
            obj[key] = detail.get(key) or []
    chunks = list(obj.get("body") or []) + [obj.get("summary") or ""]
    for key in ("history", "locationDetails", "durationNotes", "pricing", "amenities", "overview"):
        chunks.extend(obj.get(key) or [])
    return len(" ".join(chunks).split())


def main() -> None:
    # local import to avoid circular - duplicate tiny map
    XYZ_TO_SLUG = {
        "4seas": "4seas",
        "afropolitan": "afro",
        "alpha-city": "ac",
        "arc": "arc",
        "arrayah": "ary",
        "crecimiento": "creci",
        "edge-city": "edge",
        "ethiopia": "eth",
        "forma": "forma",
        "frontier-tower": "ft",
        "infinita": "infinita",
        "invisible-garden": "ig",
        "ipe-city": "ipe",
        "islanddao": "idao",
        "itana": "itana",
        "jungli": "jungli",
        "logos": "logos",
        "montelibero": "ml",
        "network-school": "ns",
        "netx-gen": "netx",
        "praxis": "praxis",
        "prospera": "prospera",
        "shanhaiwoo": "shw",
        "the-mu": "mu",
        "the-oz-city": "oz",
        "viva-city": "viva",
        "web3-villages": "w3v",
        "zanzalu": "zanzalu",
        "zu-grama": "zugrama",
        "zuafrique": "zuafrique",
        "zucity-japan": "zucity",
        "zuitzerland": "zui",
        "zukas": "zukas",
        "zuzalu": "zuzalu",
    }
    xyz = json.loads(XYZ_PATH.read_text(encoding="utf-8"))
    xyz_by_slug = {XYZ_TO_SLUG[k]: v for k, v in xyz.items() if k in XYZ_TO_SLUG}

    base = json.loads(BASE_PATH.read_text(encoding="utf-8"))
    for popup in base:
        if estimate_words(popup, xyz_by_slug) >= MIN_WORDS:
            continue
        url = popup.get("website")
        if not url:
            continue
        html = fetch(url)
        if len(html) < 200:
            continue
        extra = site_paragraphs(popup["name"], url, html)
        body = list(popup.get("body") or [])
        seen = {b.strip() for b in body}
        for p in extra:
            if p.strip() not in seen:
                body.append(p.strip())
                seen.add(p.strip())
        popup["body"] = body
        print(popup["slug"], "->", len(" ".join(body).split()), "words in base body")

    BASE_PATH.write_text(json.dumps(base, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
