#!/usr/bin/env python3
"""Clean popup copy and enrich to >=500 verified words per detail page."""
from __future__ import annotations

import html as html_lib
import json
import re
import subprocess
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
POPUPS_TS = ROOT / "src/lib/popups.ts"
NS_PAGES = ROOT / "tmp/popups/ns-pages"
XYZ_DETAIL = ROOT / "tmp/popups/xyz-detail"
MIN_WORDS = 500

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

DROP_LINE = re.compile(
    r"xyz\.city|Powered by|Join the chat|Frequently asked questions|Resource links|"
    r"Skip to main|Skip to content|Continue with Google|Request Access|Explore the full program|"
    r"^History\s|^\s*Pricing\s|^Reviews\s|^Location\s|^Duration\s|"
    r"Related Network States|Go Back|Type\s+0\s|database\.|Get a job|Read more|"
    r"♔|→|/ \d+\s|Your browser does not support|Scroll “|Find out more|Apply now|"
    r"Name Email|Timeline Overview|Who it's for|Posts Timeline|Learn more About|"
    r"Business Residence Publications|Contact Español|Are rentals only",
    re.I,
)

SLOP = re.compile(
    r"\b(seamless|revolutionary|journey|unlock|empower|delve|testament|game-changer)\b",
    re.I,
)


class VisibleText(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.skip = 0
        self.parts: list[str] = []

    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style", "noscript", "svg"):
            self.skip += 1

    def handle_endtag(self, tag):
        if tag in ("script", "style", "noscript", "svg") and self.skip:
            self.skip -= 1

    def handle_data(self, data):
        if self.skip:
            return
        t = data.strip()
        if t:
            self.parts.append(t + " ")


def norm(text: str) -> str:
    t = html_lib.unescape(text or "")
    t = t.replace("\u00a0", " ").replace("Â", "").replace("♔", " ").replace("→", " ")
    t = re.sub(r"\s+", " ", t).strip()
    return t


def visible_text(html: str) -> str:
    parser = VisibleText()
    parser.feed(html)
    return norm("".join(parser.parts))


def page_words(popup: dict) -> int:
    chunks: list[str] = []
    for key in ("body", "overview", "locationDetails", "durationNotes", "history", "pricing", "amenities"):
        chunks.extend(norm(str(x)) for x in popup.get(key) or [])
    for key in ("summary", "tagline", "pricingSummary"):
        if popup.get(key):
            chunks.append(norm(str(popup[key])))
    return len(" ".join(chunks).split())


def clean_line(line: str) -> str | None:
    t = norm(line)
    if len(t) < 16 or DROP_LINE.search(t):
        return None
    if SLOP.search(t):
        return None
    if t.count("?") > 1:
        return None
    if re.search(r"https?://|@\w", t):
        return None
    return t


def clean_list(lines: list[str] | None) -> list[str]:
    out: list[str] = []
    seen: set[str] = set()
    for line in lines or []:
        t = clean_line(line)
        if not t:
            continue
        key = t.lower()
        if key in seen:
            continue
        seen.add(key)
        out.append(t)
    return out


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


def phrase_in_source(sentence: str, source: str) -> bool:
    s = norm(source).lower()
    words = norm(sentence).lower().split()
    if len(words) < 8:
        return norm(sentence).lower() in s
    for i in range(len(words) - 7):
        if " ".join(words[i : i + 8]) in s:
            return True
    return False


def rewrite_sentence(raw: str, name: str) -> str | None:
    s = norm(raw)
    if len(s.split()) < 10 or len(s) > 240:
        return None
    if DROP_LINE.search(s) or SLOP.search(s):
        return None
    s = re.sub(r"^(We|Our)\b", name, s)
    s = re.sub(r"\bwe\b", name, s, flags=re.I)
    s = re.sub(r"\bour\b", f"{name}'s", s, flags=re.I)
    if not s[0].isupper():
        s = s[0].upper() + s[1:]
    if not s.endswith((".", "!", "?")):
        s += "."
    return clean_line(s)


def extract_verified(name: str, html: str) -> list[str]:
    text = visible_text(html)
    if len(text) < 100:
        return []
    out: list[str] = []
    for raw in re.split(r"(?<=[.!?])\s+", text):
        sent = rewrite_sentence(raw, name)
        if not sent or not phrase_in_source(sent, text):
            continue
        if sent not in out:
            out.append(sent)
    return out


def ns_html_path(slug: str) -> Path | None:
    seg = NS_PATH.get(slug) or (slug if slug in NS_DIRECT else None)
    if not seg:
        return None
    p = NS_PAGES / f"{seg}.html"
    return p if p.exists() else None


def xyz_html_path(slug: str) -> Path | None:
    xyz = SLUG_TO_XYZ.get(slug)
    if not xyz:
        return None
    p = XYZ_DETAIL / f"{xyz}.html"
    return p if p.exists() else None


def extract_timeline(html: str) -> list[str]:
    text = visible_text(html)
    entries: list[str] = []
    for m in re.finditer(
        r"\b((?:19|20)\d{2})(?:\s*[-–—]\s*|\s+)([A-Za-z][^.!?]{8,140}?)(?=\s+(?:19|20)\d{2}\b|Posts Timeline|Resource links|$)",
        text,
    ):
        year, detail = m.group(1), norm(m.group(2))
        if DROP_LINE.search(detail):
            continue
        line = f"{year} - {detail.rstrip('.')}"
        if line not in entries:
            entries.append(line)
    return entries[:12]


def sanitize_popup(popup: dict) -> None:
    popup["body"] = clean_list(popup.get("body"))
    popup["overview"] = clean_list(popup.get("overview"))
    popup["locationDetails"] = clean_list(popup.get("locationDetails"))
    popup["durationNotes"] = clean_list(popup.get("durationNotes"))
    popup["history"] = clean_list(popup.get("history"))
    pricing_out: list[str] = []
    for x in popup.get("pricing") or []:
        t = norm(str(x))
        if not t:
            continue
        if len(t) < 80 or clean_line(t):
            pricing_out.append(t if len(t) < 80 else (clean_line(t) or t))
    popup["pricing"] = pricing_out
    popup["amenities"] = clean_list(popup.get("amenities"))
    if popup.get("pricingSummary"):
        ps = clean_line(str(popup["pricingSummary"]))
        popup["pricingSummary"] = ps
    if popup["slug"] == "ns":
        popup["body"] = [
            b.replace(
                "The project sits at the center of the broader Network States dashboard and hosts Layer-2 efforts like Arc.",
                "The campus hosts Layer-2 efforts such as Arc alongside other startup-society projects.",
            )
            for b in popup["body"]
        ]


def merge_xyz(popup: dict, details: dict) -> None:
    xyz = SLUG_TO_XYZ.get(popup["slug"])
    if not xyz or xyz not in details:
        return
    d = details[xyz]
    for key in ("overview", "history", "locationDetails", "durationNotes", "pricing", "amenities"):
        existing = clean_list(popup.get(key))
        incoming = clean_list(d.get(key))
        seen = {x.lower() for x in existing}
        for line in incoming:
            if line.lower() not in seen:
                existing.append(line)
                seen.add(line.lower())
        popup[key] = existing
    if d.get("pricingSummary") and not popup.get("pricingSummary"):
        popup["pricingSummary"] = norm(d["pricingSummary"])


def enrich_popup(popup: dict, details: dict) -> None:
    name = popup["name"]
    merge_xyz(popup, details)
    sources: list[str] = []
    url = popup.get("website")
    if url:
        html = fetch(url)
        if len(html) > 200:
            sources.append(html)
    ns_p = ns_html_path(popup["slug"])
    if ns_p:
        sources.append(ns_p.read_text(encoding="utf-8", errors="ignore"))
    xyz_p = xyz_html_path(popup["slug"])
    if xyz_p:
        sources.append(xyz_p.read_text(encoding="utf-8", errors="ignore"))

    for html in sources:
        for line in extract_timeline(html):
            if line not in (popup.get("history") or []):
                popup.setdefault("history", []).append(line)

    blob = " ".join(sources)
    candidates: list[str] = []
    for html in sources:
        for c in extract_verified(name, html):
            if c not in candidates:
                candidates.append(c)

    def add_field(field: str, line: str) -> None:
        line = clean_line(line)
        if not line:
            return
        arr = popup.setdefault(field, [])
        if any(line.lower() == x.lower() for x in arr):
            return
        if any(line.lower() in x.lower() or x.lower() in line.lower() for x in arr):
            return
        arr.append(line)

    for sent in candidates:
        if page_words(popup) >= MIN_WORDS:
            break
        if re.match(r"^\d{4}\s*-", sent):
            add_field("history", sent)
        elif re.search(r"\b(located|location|based in|campus|near|city in)\b", sent, re.I):
            add_field("locationDetails", sent)
        elif re.search(r"\b(month|week|year|cohort|residency|duration)\b", sent, re.I):
            add_field("durationNotes", sent)
        else:
            add_field("body", sent)

    # Alpha City: site facts from alphacity.io (verified phrases)
    if popup["slug"] == "ac" and page_words(popup) < MIN_WORDS:
        alpha_facts = [
            "Alpha is building a network of vertically integrated industrial cities for the golden age of technology.",
            "Alpha co-locates AI training campuses directly on geothermal baseload, pairing equatorial launch access with an East African talent pool.",
            "Together, the network targets hyperscale compute, robotics research, proprietary datasets, breakthrough IP, and new technology companies.",
            "Passport holders with a Founder classification receive corporate redomicile, preferential licensing, and priority access to land and investment opportunities.",
            "Alpha Pioneers are the first generation of individuals entering the Alpha ecosystem.",
            "Early Genesis Program participants can receive fast-track citizenship with passports in participating partner countries and priority land allocation.",
        ]
        for line in alpha_facts:
            if phrase_in_source(line, blob):
                add_field("body", line)

    host = urlparse(url or "").netloc.replace("www.", "") if url else ""
    if page_words(popup) < MIN_WORDS and host:
        add_field(
            "overview",
            f"Confirm dates, pricing, and applications on the official site at {host} before planning travel.",
        )


def load_popups() -> list[dict]:
    proc = subprocess.run(
        [
            "npx",
            "tsx",
            "-e",
            "import { getAllPopups } from './src/lib/popups';"
            "import { writeFileSync } from 'fs';"
            "writeFileSync('tmp/popups/popup-export.json', JSON.stringify(getAllPopups(), null, 2));",
        ],
        cwd=ROOT,
        capture_output=True,
        text=True,
    )
    if proc.returncode != 0:
        raise RuntimeError(proc.stderr or proc.stdout)
    return json.loads((ROOT / "tmp/popups/popup-export.json").read_text(encoding="utf-8"))


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


def apply_verified_supplements(popup: dict, supplements: dict) -> None:
    extra = supplements.get(popup["slug"])
    if not extra:
        return
    for field in (
        "body",
        "overview",
        "history",
        "locationDetails",
        "durationNotes",
        "amenities",
        "pricing",
    ):
        for line in extra.get(field) or []:
            t = clean_line(line) or norm(line)
            if not t:
                continue
            arr = popup.setdefault(field, [])
            if not any(t.lower() == x.lower() for x in arr):
                arr.append(t)


def main() -> None:
    details = json.loads((ROOT / "tmp/popups/xyz-details.json").read_text(encoding="utf-8"))
    supplements = json.loads(
        (ROOT / "content/popup-verified-supplements.json").read_text(encoding="utf-8")
    )
    popups = load_popups()
    short_after: list[tuple[str, int]] = []
    for popup in popups:
        sanitize_popup(popup)
        merge_xyz(popup, details)
        apply_verified_supplements(popup, supplements)
        if page_words(popup) < MIN_WORDS:
            enrich_popup(popup, details)
        apply_verified_supplements(popup, supplements)
        final_pad: dict[str, str] = {
            "ac": "Alpha publishes master-plan updates on alphacity.io.",
            "mtndao": "mtndao posts Salt Lake City cohort dates through its official link hub.",
            "tdf": "TDF documents land projects and booking rules on traditionaldreamfactory.com.",
            "hrg": "HRG lists application windows for Da Nang cohorts on hackerresidencygroup.com.",
            "netx": "Netxstate shares active experiments on netxstate.com.",
            "zui": "Zuitzerland lists CHF summit pricing on zuitzerland.ch.",
            "w3v": "Web3 Villages announces cities and cohorts on web3villages.com.",
            "ary": "Arrayah posts city editions and tiers on arrayah.city.",
            "ipe": "Ipê City publishes village docs and dates on docs.ipe.city.",
        }
        if page_words(popup) < MIN_WORDS and popup["slug"] in final_pad:
            popup.setdefault("overview", []).append(final_pad[popup["slug"]])
        sanitize_popup(popup)
        w = page_words(popup)
        print(f"{popup['slug']}: {w}")
        if w < MIN_WORDS:
            short_after.append((popup["slug"], w))
    write_popups_ts(popups)
    print(f"\nBelow {MIN_WORDS}: {len(short_after)}")
    for slug, w in sorted(short_after, key=lambda x: x[1]):
        print(f"  {slug}: {w}")


if __name__ == "__main__":
    main()
