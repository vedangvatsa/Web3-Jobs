#!/usr/bin/env python3
"""
Enrich popup records with sentences traceable to official sites / cached ns & xyz scrapes.
Targets >= 500 editorial words per popup detail page (all text sections, not posts).
"""
from __future__ import annotations

import html as html_lib
import json
import re
import subprocess
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
EXPORT = ROOT / "tmp/popups/popup-export.json"
POPUPS_TS = ROOT / "src/lib/popups.ts"
NS_PAGES = ROOT / "tmp/popups/ns-pages"
XYZ_DETAIL = ROOT / "tmp/popups/xyz-detail"
MIN_PAGE_WORDS = 500

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
SLUG_TO_XYZ = {v: k for k, v in XYZ_TO_SLUG.items()}

NS_PATH = {
    "ns": "network-school",
    "edge": "edge-city",
    "forma": "forma-city",
    "creci": "crecimiento",
    "ft": "frontier-tower",
    "zucity": "zujapan",
    "akiya": "akiya-collective",
    "amagi": "amagi-life",
    "arc": "arc-city",
    "blc": "bitcoin-learning-center",
    "cc": "cafe-cursor",
    "morazan": "ciudad-morazan",
    "commons": "commons-hub",
    "gelephu": "gmc",
    "ipe": "ipe-city",
    "noma": "noma-collective",
    "proto": "proto-town",
    "rns": "rns-id",
    "shw": "shanhaiwoo",
    "mu": "the-mu",
    "tdf": "traditional-dream-factory",
    "vibe": "vibecamp",
    "zugrama": "zu-grama",
    "zui": "zuitzerland",
}
NS_DIRECT = {
    "prospera",
    "4seas",
    "arkpad",
    "culdesac",
    "zuberlin",
    "hrg",
    "infinita",
    "mtndao",
    "nomad",
    "starbase",
    "zanzalu",
    "zuafrique",
    "zukas",
    "zuzalu",
}

SLOP = re.compile(
    r"\b(seamless|revolutionary|journey|unlock|empower|delve|testament|game-changer|"
    r"cutting-edge|robust|holistic|comprehensive|pivotal|landscape|next-level|"
    r"without further ado|at its core|dive into|beacon|tapestry|embark|elevate)\b",
    re.I,
)
NOISE = re.compile(
    r"Read more|Get a job|All results go into|Burn Calories|database\.|"
    r"appears (in|on) Network School|ns\.com dashboard|Network School directories|"
    r"^Amenities in |^Tickets include:?$|^What (is|kind of|are)\b",
    re.I,
)


class VisibleText(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.skip = 0
        self.parts: list[str] = []

    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style", "noscript", "svg", "nav", "footer", "header"):
            self.skip += 1
        if tag in ("p", "h1", "h2", "h3", "h4", "li", "br", "div"):
            self.parts.append("\n")

    def handle_endtag(self, tag):
        if tag in ("script", "style", "noscript", "svg", "nav", "footer", "header") and self.skip:
            self.skip -= 1

    def handle_data(self, data):
        if self.skip:
            return
        t = data.strip()
        if t:
            self.parts.append(t + " ")


def norm(text: str) -> str:
    t = html_lib.unescape(text or "")
    t = t.replace("\u00a0", " ")
    t = t.replace("Â", "")
    t = t.replace("♔", " ")
    t = t.replace("→", " ")
    t = re.sub(r"\s+", " ", t).strip()
    return t


def visible_text(html: str) -> str:
    parser = VisibleText()
    parser.feed(html)
    return norm("".join(parser.parts))


def fetch(url: str) -> str:
    try:
        proc = subprocess.run(
            ["/usr/bin/curl", "-sL", "--max-time", "22", "-A", "HashtagWeb3PopupEditor/1.0", url],
            capture_output=True,
            timeout=26,
        )
        if proc.returncode != 0:
            return ""
        return proc.stdout.decode("utf-8", "ignore")
    except (subprocess.TimeoutExpired, OSError):
        return ""


def page_words(popup: dict) -> int:
    chunks: list[str] = []
    for key in ("body", "overview", "locationDetails", "durationNotes", "history", "pricing", "amenities"):
        for line in popup.get(key) or []:
            chunks.append(norm(str(line)))
    for key in ("summary", "tagline", "pricingSummary"):
        if popup.get(key):
            chunks.append(norm(str(popup[key])))
    return len(" ".join(chunks).split())


def existing_blob(popup: dict) -> str:
    parts: list[str] = []
    for key in ("body", "overview", "locationDetails", "durationNotes", "history", "pricing", "amenities", "summary"):
        for line in popup.get(key) or []:
            parts.append(norm(str(line)).lower())
    return " ".join(parts)


def phrase_in_source(phrase: str, source: str) -> bool:
    p = norm(phrase).lower()
    s = norm(source).lower()
    words = p.split()
    if len(words) < 6:
        return p in s
    for i in range(len(words) - 5):
        chunk = " ".join(words[i : i + 6])
        if chunk in s:
            return True
    return False


def rewrite_sentence(s: str, name: str) -> str | None:
    s = norm(s)
    if len(s.split()) < 8 or len(s) > 280:
        return None
    if SLOP.search(s) or NOISE.search(s):
        return None
    if re.search(r"\$\d+\s*w/", s, re.I):
        return None
    s = re.sub(r"^(We|Our)\b", name, s)
    s = re.sub(r"\bwe\b", name, s, flags=re.I)
    s = re.sub(r"\bour\b", f"{name}'s", s, flags=re.I)
    if not s[0].isupper():
        s = s[0].upper() + s[1:]
    if not s.endswith((".", "!", "?")):
        s += "."
    return s


def extract_candidates(name: str, source_html: str) -> list[str]:
    text = visible_text(source_html)
    if len(text) < 80:
        return []
    raw_sents = re.split(r"(?<=[.!?])\s+", text)
    out: list[str] = []
    for raw in raw_sents:
        rewritten = rewrite_sentence(raw, name)
        if not rewritten:
            continue
        if not phrase_in_source(rewritten, text):
            continue
        if rewritten not in out:
            out.append(rewritten)
    return out


def ns_page_path(slug: str) -> Path | None:
    segment = NS_PATH.get(slug)
    if segment:
        p = NS_PAGES / f"{segment}.html"
        return p if p.exists() else None
    if slug in NS_DIRECT:
        p = NS_PAGES / f"{slug}.html"
        return p if p.exists() else None
    return None


def xyz_page_path(slug: str) -> Path | None:
    xyz = SLUG_TO_XYZ.get(slug)
    if not xyz:
        return None
    p = XYZ_DETAIL / f"{xyz}.html"
    return p if p.exists() else None


def collect_sources(popup: dict) -> list[tuple[str, str]]:
    sources: list[tuple[str, str]] = []
    slug = popup["slug"]
    url = popup.get("website")
    if url:
        html = fetch(url)
        if len(html) > 200:
            sources.append((f"website:{urlparse(url).netloc}", html))
    ns_p = ns_page_path(slug)
    if ns_p:
        sources.append((f"ns:{ns_p.name}", ns_p.read_text(encoding="utf-8", errors="ignore")))
    xyz_p = xyz_page_path(slug)
    if xyz_p:
        sources.append((f"xyz:{xyz_p.name}", xyz_p.read_text(encoding="utf-8", errors="ignore")))
    return sources


def classify_field(sentence: str) -> str:
    if re.match(r"^\d{4}\s*[-–—]", sentence) or re.match(r"^In 20\d{2}\b", sentence):
        return "history"
    if re.search(r"\b(located|location|based in|campus|city|country|address)\b", sentence, re.I):
        return "locationDetails"
    if re.search(r"\b(month|week|year|cohort|duration|residency|season)\b", sentence, re.I):
        return "durationNotes"
    return "body"


def add_unique(popup: dict, field: str, line: str) -> bool:
    line = norm(line)
    if len(line) < 20 or NOISE.search(line):
        return False
    blob = existing_blob(popup)
    if line.lower() in blob or line.lower()[:48] in blob:
        return False
    arr = popup.setdefault(field, [])
    if line in arr:
        return False
    arr.append(line)
    return True


def enrich_popup(popup: dict) -> int:
    name = popup["name"]
    before = page_words(popup)
    if before >= MIN_PAGE_WORDS:
        return 0

    all_candidates: list[str] = []
    for _label, html in collect_sources(popup):
        for c in extract_candidates(name, html):
            if c not in all_candidates:
                all_candidates.append(c)

    added = 0
    for sentence in all_candidates:
        if page_words(popup) >= MIN_PAGE_WORDS:
            break
        field = classify_field(sentence)
        if add_unique(popup, field, sentence):
            added += 1

    # If still short, add overview lines from xyz-details.json when present
    if page_words(popup) < MIN_PAGE_WORDS:
        details = json.loads((ROOT / "tmp/popups/xyz-details.json").read_text(encoding="utf-8"))
        xyz_slug = SLUG_TO_XYZ.get(popup["slug"])
        if xyz_slug and xyz_slug in details:
            detail = details[xyz_slug]
            for key in ("overview", "history", "locationDetails", "durationNotes"):
                for line in detail.get(key) or []:
                    line = norm(line)
                    if len(line) < 12:
                        continue
                    if add_unique(popup, key if key != "overview" else "overview", line):
                        added += 1
                    if page_words(popup) >= MIN_PAGE_WORDS:
                        break
                if page_words(popup) >= MIN_PAGE_WORDS:
                    break

    return added


def export_popups() -> list[dict]:
    proc = subprocess.run(
        [
            "npx",
            "tsx",
            "-e",
            "import { getAllPopups } from './src/lib/popups'; "
            "import { writeFileSync } from 'fs'; "
            "writeFileSync('tmp/popups/popup-export.json', JSON.stringify(getAllPopups(), null, 2));",
        ],
        cwd=ROOT,
        capture_output=True,
        text=True,
    )
    if proc.returncode != 0:
        raise RuntimeError(proc.stderr or proc.stdout)
    return json.loads(EXPORT.read_text(encoding="utf-8"))


def write_popups_ts(popups: list[dict]) -> None:
    header = """import type { Popup } from '@/types/popup';

export const POPUP_TYPES = ['popup', 'permanent', 'sez'] as const;

export const POPUP_TYPE_LABELS: Record<(typeof POPUP_TYPES)[number], string> = {
  popup: 'Popup',
  permanent: 'Permanent',
  sez: 'City / SEZ',
};

export const popupData: Popup[] = """
    footer = """;

export function getAllPopups(): Popup[] {
  return [...popupData].sort((a, b) => a.name.localeCompare(b.name));
}

export function getPopupBySlug(slug: string): Popup | undefined {
  return popupData.find((popup) => popup.slug === slug);
}

export function getPopupSlugs(): string[] {
  return popupData.map((popup) => popup.slug);
}
"""
    POPUPS_TS.write_text(header + json.dumps(popups, indent=2, ensure_ascii=False) + footer, encoding="utf-8")


def scrub_ns_leaks(popup: dict) -> None:
    for key in ("body", "overview", "locationDetails", "durationNotes", "history"):
        lines = []
        for line in popup.get(key) or []:
            t = norm(str(line))
            if NOISE.search(t) or "Network States dashboard" in t:
                continue
            lines.append(t)
        popup[key] = lines


def main() -> None:
    popups = export_popups()
    for popup in popups:
        scrub_ns_leaks(popup)
        if popup["slug"] == "ns":
            body = popup.get("body") or []
            popup["body"] = [
                norm(b).replace("The project sits at the center of the broader Network States dashboard and hosts Layer-2 efforts like Arc.", "The campus hosts Layer-2 efforts such as Arc alongside other startup-society projects.")
                if "Network States dashboard" in b
                else norm(b)
                for b in body
            ]

    total_added = 0
    short_after: list[tuple[str, int]] = []
    for popup in popups:
        n = enrich_popup(popup)
        total_added += n
        w = page_words(popup)
        print(f"{popup['slug']}: {w} words (+{n} lines)")
        if w < MIN_PAGE_WORDS:
            short_after.append((popup["slug"], w))

    write_popups_ts(popups)
    print(f"\nAdded {total_added} lines. Still below {MIN_PAGE_WORDS}: {len(short_after)}")
    for slug, w in sorted(short_after, key=lambda x: x[1]):
        print(f"  {slug}: {w}")


if __name__ == "__main__":
    main()
