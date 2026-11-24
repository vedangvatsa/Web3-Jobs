import json
import urllib.parse
import urllib.request
from typing import Any, Dict, List, Optional


class HashtagWeb3Client:
    def __init__(self, base_url: str = "https://hashtagweb3.com"):
        self.origin = base_url.rstrip("/")

    def _fetch_catalog(self, path: str) -> Any:
        url = f"{self.origin}{path}"
        req = urllib.request.Request(url, headers={"User-Agent": "HashtagWeb3-Python-SDK/2.0", "Accept": "application/json"})
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode())

    def _paginate(self, items: List[Any], limit: int = 20, offset: int = 0) -> List[Any]:
        take = min(200, max(1, limit))
        skip = max(0, offset)
        return items[skip : skip + take]

    def get_jobs(
        self,
        search: Optional[str] = None,
        tag: Optional[str] = None,
        company: Optional[str] = None,
        limit: int = 20,
        offset: int = 0,
    ) -> List[Dict[str, Any]]:
        raw = self._fetch_catalog("/data/jobs-runtime.json")
        all_jobs = raw if isinstance(raw, list) else raw.get("jobs", [])
        filtered = [j for j in all_jobs if j.get("active", True) is not False]

        if search:
            q = search.lower()
            filtered = [
                j
                for j in filtered
                if q in (j.get("title") or "").lower()
                or q in (j.get("company") or "").lower()
            ]
        if company:
            c = company.lower()
            filtered = [j for j in filtered if c in (j.get("company") or "").lower()]
        if tag:
            t = tag.lower()
            filtered = [
                j
                for j in filtered
                if t in " ".join(j.get("tags") or []).lower()
            ]

        return self._paginate(filtered, limit, offset)

    def get_news(self, limit: int = 10) -> List[Dict[str, Any]]:
        raw = self._fetch_catalog("/data/news-cache.json")
        items = raw if isinstance(raw, list) else raw.get("news", raw.get("items", []))
        return self._paginate(items, limit, 0)

    def get_events(self, limit: int = 10) -> List[Dict[str, Any]]:
        raw = self._fetch_catalog("/data/events-runtime.json")
        items = raw if isinstance(raw, list) else raw.get("events", [])
        return self._paginate(items, limit, 0)