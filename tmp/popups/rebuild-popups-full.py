#!/usr/bin/env python3
"""Rebuild src/lib/popups.ts from base editorial copy + xyz.city structured fields + ns.com posts."""
from __future__ import annotations

import json
import re
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[2]

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

SKIP_WEB = re.compile(
    r"schema\.org|ahrefs|googletagmanager|reddit\.com|vitalik\.eth|gitbook|maps\.app|analytics",
    re.I,
)

POSTS_OVERRIDES: dict[str, str | None] = {
    "prospera": "prosperaglobal",
    "edge": "JoinEdgeCity",
    "forma": "formacity",
    "creci": "crecimientoar",
    "ft": "frontiertower",
    "4seas": None,
    "zucity": "zucity_japan",
    "akiya": "AkiyaCollective",
    "amagi": "AmagiLife",
    "arc": "James_of_Arc",
    "arkpad": "real_Arkpad",
    "cc": "cursor_ai",
    "morazan": "ciudadmorazan1",
    "commons": "commonshubat",
    "culdesac": "culdesac",
    "zuberlin": "JoinFutura",
    "gelephu": "gmcbhutan",
    "hrg": "HackerResidency",
    "infinita": "infinitacity",
    "ipe": "ipecity",
    "mtndao": "mtndao",
    "noma": "noma_collective",
    "nomad": "NOMADcoliving",
    "proto": "Proto_Town",
    "rns": "RNS_global",
    "shw": "shanhaiwoo",
    "starbase": "StarbaseTX",
    "mu": "themu_xyz",
    "tdf": "tdfinyourdreams",
    "vibe": "vibecamp_",
    "zanzalu": "_zanzalu",
    "zugrama": "zugramadotorg",
    "zuafrique": "zuAfrique",
    "zui": "zuitzerland",
    "zukas": "zuzalukas",
    "zuzalu": "Zuzalu_city",
    "ns": "ns",
    "afro": "afropolitan",
    "idao": "islanddao",
    "logos": None,
    "praxis": None,
    "blc": None,
}

FABRICATED_PATTERNS = [
    re.compile(r"Hashtag\s*Web3", re.I),
    re.compile(r"often introduced", re.I),
    re.compile(r"rewritten for clarity", re.I),
    re.compile(r"this directory entry", re.I),
]


def fix_mojibake(text: str) -> str:
    return text.replace("Ârc", "Arc").replace("Â", "").replace("♔", " ").replace("→", " ")


def merge_socials(existing: dict | None, incoming: dict | None) -> dict:
    out = dict(existing or {})
    for key, value in (incoming or {}).items():
        if value:
            out.setdefault(key, value)
    return out


def handle_from_x_url(xurl: str | None) -> str | None:
    if not xurl:
        return None
    match = re.search(r"x\.com/([^/?#]+)", xurl)
    return match.group(1) if match else None


def clean_post_text(text: str | None) -> str | None:
    if text is None:
        return None
    return text.encode("utf-8", "surrogatepass").decode("utf-8", "ignore")


def resolve_posts(
    slug: str,
    socials: dict,
    posts_by_key: dict[str, list],
    posts_lower: dict[str, str],
) -> list[dict]:
    xurl = socials.get("x")
    override = POSTS_OVERRIDES.get(slug, "__missing__")
    key: str | None
    if override != "__missing__":
        key = override
    else:
        handle = handle_from_x_url(xurl)
        key = posts_lower.get(handle.lower()) if handle else None

    if not key:
        return []

    real_key = posts_lower.get(key.lower())
    if not real_key:
        return []

    items: list[dict] = []
    for post in posts_by_key[real_key][:4]:
        url = post.get("url")
        text = clean_post_text(post.get("text"))
        if not url or not text:
            continue
        items.append(
            {
                "url": url,
                "author": post.get("author") or post.get("username") or "Post",
                "username": post.get("username"),
                "text": text,
                "date": post.get("date"),
            }
        )
    return items


SCRAPE_NOISE = re.compile(
    r"Read more|Get a job|All results go into|Burn Calories|Then set up an office|"
    r"make it easy to be healthy|\d{2}\s*-\s*What .+ do ",
    re.I,
)


def sanitize_body(body: list[str]) -> list[str]:
    out: list[str] = []
    for p in body or []:
        t = fix_mojibake(p.strip())
        if len(t) < 12 or SCRAPE_NOISE.search(t):
            continue
        out.append(t)
    return out


def normalize_popup_strings(obj: dict) -> None:
    obj["name"] = fix_mojibake(obj.get("name") or "")
    obj["tagline"] = fix_mojibake(obj.get("tagline") or "")
    obj["summary"] = fix_mojibake(obj.get("summary") or "")
    obj["body"] = sanitize_body(obj.get("body") or [])
    for key in ("history", "overview", "locationDetails", "durationNotes", "pricing", "amenities"):
        obj[key] = [fix_mojibake(x) for x in obj.get(key) or [] if fix_mojibake(x)]
    if obj.get("pricingSummary"):
        obj["pricingSummary"] = fix_mojibake(obj["pricingSummary"])
    if obj.get("website") and "â" in obj["website"].lower():
        obj["website"] = obj["website"].replace("ârc", "arc").replace("Â", "")


def assert_no_fabrication(popup: dict) -> None:
    blob = json.dumps(popup, ensure_ascii=False)
    for pattern in FABRICATED_PATTERNS:
        if pattern.search(blob):
            raise ValueError(f"Fabricated copy detected in {popup['slug']}: {pattern.pattern}")


def merge_xyz_fields(obj: dict, detail: dict) -> None:
    if detail.get("logo") and (ROOT / "public" / detail["logo"].lstrip("/")).exists():
        obj["image"] = detail["logo"]
    covers = [
        c for c in detail.get("coverImages") or [] if (ROOT / "public" / c.lstrip("/")).exists()
    ]
    obj["coverImages"] = covers
    obj["socials"] = merge_socials(obj.get("socials"), detail.get("socials"))
    if detail.get("website"):
        obj["website"] = detail["website"]
    if detail.get("foundedYear") and not obj.get("foundedYear"):
        obj["foundedYear"] = detail["foundedYear"]
    obj["pricing"] = detail.get("pricing") or []
    obj["pricingSummary"] = detail.get("pricingSummary")
    obj["amenities"] = [
        a.lstrip("- ").strip() for a in detail.get("amenities") or [] if a.strip("- ")
    ]
    obj["history"] = detail.get("history") or []
    obj["durationNotes"] = detail.get("durationNotes") or []
    obj["locationDetails"] = detail.get("locationDetails") or []
    obj["overview"] = detail.get("overview") or []
    obj["xyzUrl"] = detail.get("sourceUrl")


def expand_body_from_facts(obj: dict) -> None:
    """Append plain, factual sentences to body for long-form reading (no marketing filler)."""
    body: list[str] = list(obj.get("body") or [])
    seen = {p.strip() for p in body}

    def add(text: str) -> None:
        t = fix_mojibake(text.strip())
        if len(t) < 24 or t in seen:
            return
        seen.add(t)
        body.append(t)

    for line in obj.get("history") or []:
        raw = fix_mojibake(line)
        match = re.match(r"^(\d{4})\s*[-–—]\s*(.+)$", raw)
        if match:
            rest = match.group(2).strip()
            add(f"In {match.group(1)}, {rest[0].lower()}{rest[1:]}.")
        elif raw.strip():
            add(raw if raw.endswith(".") else f"{raw}.")

    loc = [fix_mojibake(x) for x in obj.get("locationDetails") or [] if fix_mojibake(x)]
    if loc:
        add(" ".join(loc))

    dur = [fix_mojibake(x) for x in obj.get("durationNotes") or [] if fix_mojibake(x)]
    if dur:
        add(" ".join(dur))

    pricing = [fix_mojibake(x) for x in obj.get("pricing") or [] if fix_mojibake(x)]
    for line in pricing:
        add(line if line.endswith(".") else f"{line}.")

    amenities = [fix_mojibake(x) for x in obj.get("amenities") or [] if len(fix_mojibake(x)) > 2]
    for line in amenities:
        add(line if line.endswith(".") else f"{line}.")

    if obj.get("tagline"):
        add(obj["tagline"])

    site = obj.get("website")
    if site:
        host = urlparse(site).netloc.replace("www.", "")
        add(f"Official updates: {host}.")

    obj["body"] = body


def apply_arc_site_facts(obj: dict) -> None:
    """Structured fields from https://thearccity.com (Sri Lanka campus; overrides stale xyz.city)."""
    obj["website"] = "https://thearccity.com"
    if (ROOT / "public/popups/arc.webp").exists():
        obj["image"] = "/popups/arc.webp"
    obj["xyzUrl"] = "https://xyz.city/network-states/arc"
    obj["pricing"] = [
        "Campus access at Asaya is unbundled and pay-as-you-go rather than a single all-in bundle",
        "First Capital Startup Nation hosted packages are invitation-only (see thearccity.com/startup-nation)",
    ]
    obj["pricingSummary"] = (
        "Unbundled, pay-as-you-go access at Asaya, Mirissa; Startup Nation packages by invitation"
    )
    obj["amenities"] = [
        "Beachfront campus at Asaya, Mirissa Beach",
        "Founder community, events, and accelerator-style programming",
        "Ascend, Fulgur, Curious, and Arc Angel investor programming in Sri Lanka",
        "Member guide for relocators (password provided with membership)",
    ]
    obj["history"] = [
        "2024 - Arc Lisbon pop-up (September–October), with Lisbon Web3 and tech community partners",
        "2025 - Arc Austin pop-up during Austin tech week (March); Singapore pop-up (September–October)",
        "2025 to 2026 - Activation at Network School in Kazakhstan (Astana campus; prior site in Forest City, Malaysia)",
        "2026 - Live on Mirissa Beach, Sri Lanka; First Capital Startup Nation with Hatch in Colombo (28 September–1 October)",
    ]
    obj["durationNotes"] = [
        "Permanent founder community at Asaya, Mirissa, with ongoing programming",
        "Historical pop-up villages typically ran about one to two months",
        "First Capital Startup Nation 2026: 28 September–1 October in Colombo",
    ]
    obj["locationDetails"] = [
        "Primary campus: Asaya, a beachfront campus in Mirissa, Sri Lanka",
        "Arc Sri Lanka connects builders to Colombo and national institutions",
        "Prior activation: Network School in Astana, Kazakhstan (formerly Forest City, Malaysia until 2026)",
    ]
    obj["overview"] = [
        "Arc accelerates the trajectory of people and places and ships legal, capital, and company infrastructure together.",
        "The Sri Lanka campus at Asaya on Mirissa Beach is open to the early community.",
        "Programming includes Ascend, Fulgur, Curious, and Arc Angel alongside Colombo events such as Startup Nation.",
    ]


def main() -> None:
    base = json.loads((ROOT / "tmp/popups/base-popups.json").read_text(encoding="utf-8"))
    details = json.loads((ROOT / "tmp/popups/xyz-details.json").read_text(encoding="utf-8"))
    posts_by_key = json.loads((ROOT / "tmp/popups/ns-posts.json").read_text(encoding="utf-8"))
    posts_lower = {k.lower(): k for k in posts_by_key}

    for detail in details.values():
        webs = [w for w in detail.get("websites") or [] if not SKIP_WEB.search(w)]
        detail["websites"] = webs
        detail["website"] = webs[0] if webs else detail.get("website")

    xyz_by_slug = {}
    for xyz_slug, detail in details.items():
        our_slug = XYZ_TO_SLUG.get(xyz_slug)
        if our_slug:
            xyz_by_slug[our_slug] = detail

    objs: list[dict] = []
    for raw in base:
        obj = dict(raw)
        obj.pop("residents", None)

        obj["name"] = fix_mojibake(obj["name"])
        obj["tagline"] = fix_mojibake(obj["tagline"])
        obj["summary"] = fix_mojibake(obj["summary"])
        obj["body"] = [fix_mojibake(p) for p in obj.get("body") or []]

        if obj["type"] not in ("popup", "permanent", "sez"):
            obj["type"] = "popup"

        detail = xyz_by_slug.get(obj["slug"])
        if detail and obj["slug"] != "arc":
            merge_xyz_fields(obj, detail)
        elif detail and obj["slug"] == "arc":
            obj["socials"] = merge_socials(obj.get("socials"), detail.get("socials"))
            obj.setdefault("coverImages", [])
        else:
            obj.setdefault("coverImages", [])
            obj.setdefault("pricing", [])
            obj.setdefault("amenities", [])
            obj.setdefault("history", [])
            obj.setdefault("durationNotes", [])
            obj.setdefault("locationDetails", [])
            obj.setdefault("overview", [])
            obj.setdefault("xyzUrl", None)

        if obj["slug"] == "arc":
            apply_arc_site_facts(obj)

        if obj["slug"] == "ns":
            obj["location"] = "Astana, Kazakhstan"

        sources = obj.get("sources") or []
        if "ns" in sources:
            obj["posts"] = resolve_posts(obj["slug"], obj.get("socials") or {}, posts_by_key, posts_lower)
        elif obj["slug"] == "idao":
            obj["posts"] = resolve_posts("idao", obj.get("socials") or {}, posts_by_key, posts_lower)
        else:
            obj["posts"] = []

        assert_no_fabrication(obj)
        normalize_popup_strings(obj)
        objs.append(obj)

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

    out_path = ROOT / "src/lib/popups.ts"
    out_path.write_text(
        header + json.dumps(objs, indent=2, ensure_ascii=False) + footer,
        encoding="utf-8",
    )

    with_posts = sum(1 for o in objs if o.get("posts"))
    print(f"wrote {out_path} ({len(objs)} popups, {with_posts} with posts)")


if __name__ == "__main__":
    main()
