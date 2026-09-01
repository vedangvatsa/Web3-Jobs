import urllib.parse
import urllib.request
import json
from typing import Dict, Any, List, Optional

class HashtagWeb3Client:
    def __init__(self, base_url: str = "https://hashtagweb3.com/api/v1"):
        self.base_url = base_url.rstrip("/")

    def get_jobs(self, search: Optional[str] = None, tag: Optional[str] = None, company: Optional[str] = None, limit: int = 20, offset: int = 0) -> List[Dict[str, Any]]:
        params = {"limit": limit, "offset": offset}
        if search: params["search"] = search
        if tag: params["tag"] = tag
        if company: params["company"] = company

        url = f"{self.base_url}/jobs?{urllib.parse.urlencode(params)}"
        req = urllib.request.Request(url, headers={"User-Agent": "HashtagWeb3-Python-SDK/1.0"})
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            return data.get("jobs", data)

    def get_news(self, limit: int = 10) -> List[Dict[str, Any]]:
        url = f"{self.base_url}/news?limit={limit}"
        req = urllib.request.Request(url, headers={"User-Agent": "HashtagWeb3-Python-SDK/1.0"})
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            return data.get("news", data)

    def get_events(self, limit: int = 10) -> List[Dict[str, Any]]:
        url = f"{self.base_url}/events?limit={limit}"
        req = urllib.request.Request(url, headers={"User-Agent": "HashtagWeb3-Python-SDK/1.0"})
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            return data.get("events", data)

    def get_glossary_term(self, term: str) -> Optional[Dict[str, Any]]:
        url = f"{self.base_url}/glossary?search={urllib.parse.quote(term)}"
        req = urllib.request.Request(url, headers={"User-Agent": "HashtagWeb3-Python-SDK/1.0"})
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            terms = data.get("terms", data)
            return terms[0] if isinstance(terms, list) and len(terms) > 0 else None
