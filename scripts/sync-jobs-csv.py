#!/usr/bin/env python3
"""
Sync the jobs CSV with the latest jobs-cache.json:
1. Remove stale jobs that are no longer in the cache
2. Add new jobs from the cache (fetch their descriptions from the web)
3. Extract skills from descriptions for all new jobs

Usage: python3 scripts/sync-jobs-csv.py
"""

import csv
import json
import re
import os
import sys
import time
import urllib.request
import urllib.error
from html.parser import HTMLParser
from concurrent.futures import ThreadPoolExecutor, as_completed

INPUT = os.path.expanduser("~/Downloads/Jobs - CVinBio & HashtagWeb3 - Jobs - Hashtag Web3.csv")
CACHE = "LOCAL_PATH/content/jobs-cache.json"
OUTPUT = INPUT

# ── Skill extraction (same taxonomy) ──────────────────────────────────
SKILL_PATTERNS: dict[str, list[str]] = {
    "Python": [r"\bpython\b"],
    "JavaScript": [r"\bjavascript\b"],
    "TypeScript": [r"\btypescript\b"],
    "Rust": [r"\brust\b"],
    "Go": [r"\bgolang\b", r"\bgo\b(?:\s+(?:lang|programming))"],
    "Solidity": [r"\bsolidity\b"],
    "C++": [r"\bc\+\+\b"],
    "Java": [r"\bjava\b(?!script)"],
    "Ruby": [r"\bruby\b"],
    "React": [r"\breact\b(?!(?:\s+native))"],
    "React Native": [r"\breact\s+native\b"],
    "Next.js": [r"\bnext\.?js\b"],
    "Node.js": [r"\bnode\.?js\b"],
    "Vue.js": [r"\bvue\.?js\b", r"\bvue\b"],
    "Angular": [r"\bangular\b"],
    "Django": [r"\bdjango\b"],
    "GraphQL": [r"\bgraphql\b"],
    "REST API": [r"\brest\s*(?:ful)?\s*api\b"],
    "SQL": [r"\bsql\b(?!ite)"],
    "PostgreSQL": [r"\bpostgres(?:ql)?\b"],
    "MySQL": [r"\bmysql\b"],
    "MongoDB": [r"\bmongodb\b"],
    "Redis": [r"\bredis\b"],
    "AWS": [r"\baws\b", r"\bamazon\s+web\s+services\b"],
    "GCP": [r"\bgcp\b", r"\bgoogle\s+cloud\b"],
    "Azure": [r"\bazure\b"],
    "Docker": [r"\bdocker\b"],
    "Kubernetes": [r"\bkubernetes\b", r"\bk8s\b"],
    "Terraform": [r"\bterraform\b"],
    "CI/CD": [r"\bci/?cd\b"],
    "Git": [r"\bgit\b(?!hub)"],
    "GitHub": [r"\bgithub\b"],
    "Linux": [r"\blinux\b"],
    "Ethereum": [r"\bethereum\b"],
    "Solana": [r"\bsolana\b"],
    "Bitcoin": [r"\bbitcoin\b"],
    "DeFi": [r"\bdefi\b"],
    "NFT": [r"\bnfts?\b"],
    "Smart Contracts": [r"\bsmart\s+contracts?\b"],
    "Web3": [r"\bweb3\b"],
    "EVM": [r"\bevm\b"],
    "Layer 2": [r"\blayer\s*2\b", r"\bl2\b"],
    "ZK Proofs": [r"\bzk\b(?:\s+(?:proof|snark|stark|rollup))", r"\bzero[\s-]+knowledge\b"],
    "Hardhat": [r"\bhardhat\b"],
    "Foundry": [r"\bfoundry\b"],
    "IPFS": [r"\bipfs\b"],
    "Machine Learning": [r"\bmachine\s+learning\b"],
    "LLM": [r"\bllms?\b", r"\blarge\s+language\s+model\b"],
    "Figma": [r"\bfigma\b"],
    "UI/UX": [r"\bui/?ux\b", r"\bux/?ui\b"],
    "SEO": [r"\bseo\b"],
    "Compliance": [r"\bcompliance\b"],
    "Risk Management": [r"\brisk\s+management\b"],
    "KYC": [r"\bkyc\b"],
    "AML": [r"\baml\b"],
    "GDPR": [r"\bgdpr\b"],
    "Tableau": [r"\btableau\b"],
    "Databricks": [r"\bdatabricks\b"],
    "Kafka": [r"\bkafka\b"],
    "Spark": [r"\bspark\b"],
    "Airflow": [r"\bairflow\b"],
    "Data Analysis": [r"\bdata\s+analy(?:sis|tics)\b"],
    "Product Management": [r"\bproduct\s+management\b"],
    "Agile": [r"\bagile\b", r"\bscrum\b"],
    "Jira": [r"\bjira\b"],
    "Leadership": [r"\bleadership\b"],
    "Communication": [r"\bcommunication\s+skills\b"],
    "Cross-functional": [r"\bcross[\s-]*functional\b"],
    "Salesforce": [r"\bsalesforce\b"],
    "HubSpot": [r"\bhubspot\b"],
    "Financial Modeling": [r"\bfinancial\s+model(?:ing|s)\b"],
    "Community Management": [r"\bcommunity\s+manage(?:ment|r)\b"],
    "Content Marketing": [r"\bcontent\s+marketing\b"],
    "Growth Marketing": [r"\bgrowth\s+(?:marketing|hacking)\b"],
    "Social Media": [r"\bsocial\s+media\b"],
    "Technical Writing": [r"\btechnical\s+writ(?:ing|er)\b"],
    "Security Auditing": [r"\bsecurity\s+audit\b"],
    "Polygon": [r"\bpolygon\b"],
    "Arbitrum": [r"\barbitrum\b"],
    "Optimism": [r"\boptimism\b"],
    "Cosmos": [r"\bcosmos\b"],
    "Chainlink": [r"\bchainlink\b"],
    "The Graph": [r"\bthe\s+graph\b", r"\bsubgraph\b"],
    "Firebase": [r"\bfirebase\b"],
    "Supabase": [r"\bsupabase\b"],
    "Vercel": [r"\bvercel\b"],
    "TailwindCSS": [r"\btailwind\b"],
    "Datadog": [r"\bdatadog\b"],
    "Grafana": [r"\bgrafana\b"],
    "Cairo": [r"\bcairo\b"],
    "Anchor": [r"\banchor\b(?:\s+(?:framework|protocol))"],
    "Tokenomics": [r"\btokenomics\b"],
    "DEX": [r"\bdex\b(?:es)?"],
    "AMM": [r"\bamm\b"],
    "MEV": [r"\bmev\b"],
    "Dune Analytics": [r"\bdune\b(?:\s+analytics)?"],
    "OpenZeppelin": [r"\bopenzeppelin\b"],
    "Flask": [r"\bflask\b"],
    "FastAPI": [r"\bfastapi\b"],
    "Rails": [r"\brails\b", r"\bruby\s+on\s+rails\b"],
    "Spring": [r"\bspring\b(?:\s+boot)?"],
    "Elasticsearch": [r"\belasticsearch\b"],
    "BigQuery": [r"\bbigquery\b"],
    "Snowflake": [r"\bsnowflake\b"],
    "Discord": [r"\bdiscord\b"],
    "Notion": [r"\bnotion\b"],
    "Slack": [r"\bslack\b"],
    "Project Management": [r"\bproject\s+management\b"],
    "Regulatory": [r"\bregulatory\b(?:\s+(?:compliance|framework|reporting))"],
}


def extract_skills(description: str) -> list[str]:
    if not description:
        return []
    found = []
    for skill, patterns in SKILL_PATTERNS.items():
        for pattern in patterns:
            if re.search(pattern, description, re.IGNORECASE):
                found.append(skill)
                break
    return found


class TextExtractor(HTMLParser):
    """Simple HTML to text converter."""
    def __init__(self):
        super().__init__()
        self.text_parts = []
        self._skip = False
    
    def handle_starttag(self, tag, attrs):
        if tag in ('script', 'style', 'noscript'):
            self._skip = True
    
    def handle_endtag(self, tag):
        if tag in ('script', 'style', 'noscript'):
            self._skip = False
        if tag in ('p', 'div', 'li', 'br', 'h1', 'h2', 'h3', 'h4'):
            self.text_parts.append('\n')
    
    def handle_data(self, data):
        if not self._skip:
            self.text_parts.append(data)
    
    def get_text(self):
        return ' '.join(self.text_parts)


def fetch_description(url: str) -> str:
    """Fetch job page and extract text description."""
    full_url = f"https://{url}" if not url.startswith("http") else url
    try:
        req = urllib.request.Request(full_url, headers={
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
            'Accept': 'text/html,application/xhtml+xml',
        })
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
        
        extractor = TextExtractor()
        extractor.feed(html)
        text = extractor.get_text()
        
        # Truncate to reasonable length
        return text[:5000]
    except Exception as e:
        return ""


def infer_fields(job: dict, description: str) -> dict:
    """Infer job metadata from the cache entry and description."""
    title = job.get('title', '')
    company = job.get('company', '')
    link = job.get('link', '').replace('https://', '').replace('http://', '')
    
    # Infer remote status
    remote = "Yes" if any(kw in description.lower() for kw in ['remote', 'work from home', 'distributed team']) else ""
    
    # Infer location from description
    location = ""
    loc_patterns = [
        (r"\b(?:based in|located in|location:?)\s+([A-Z][a-z]+(?:\s*,\s*[A-Z]{2})?)", lambda m: m.group(1)),
    ]
    for pat, extract in loc_patterns:
        m = re.search(pat, description)
        if m:
            location = extract(m)
            break
    if "remote" in description.lower() and not location:
        location = "Remote"
    
    # Infer department
    dept = ""
    dept_keywords = {
        "Engineering": ["engineer", "developer", "software", "backend", "frontend", "devops", "sre", "infrastructure"],
        "Design": ["designer", "design", "ui", "ux"],
        "Marketing": ["marketing", "growth", "content", "social media", "seo", "brand"],
        "Sales": ["sales", "account executive", "business development", "bd "],
        "Legal / Compliance": ["legal", "compliance", "regulatory", "counsel", "kyc", "aml"],
        "Finance": ["finance", "accounting", "financial", "controller", "treasurer"],
        "Product": ["product manager", "product lead", "product owner"],
        "Operations": ["operations", "ops ", "people", "hr ", "recruiting", "talent"],
        "Research": ["research", "researcher", "analyst"],
        "Security": ["security", "auditor", "penetration"],
        "Data": ["data engineer", "data scien", "data analy", "analytics"],
        "Community": ["community", "developer relations", "devrel"],
    }
    title_lower = title.lower()
    for d, keywords in dept_keywords.items():
        if any(kw in title_lower for kw in keywords):
            dept = d
            break
    
    # Infer seniority
    seniority = ""
    if any(kw in title_lower for kw in ["senior", "sr.", "sr ", "staff", "principal", "lead"]):
        seniority = "Senior"
    elif any(kw in title_lower for kw in ["junior", "jr.", "jr ", "entry", "associate", "intern"]):
        seniority = "Junior"
    elif any(kw in title_lower for kw in ["director", "head of", "vp ", "chief", "cto", "cfo", "ceo"]):
        seniority = "Director"
    elif any(kw in title_lower for kw in ["manager"]):
        seniority = "Mid"
    
    # Extract skills
    skills = extract_skills(description)
    
    # Infer company URL
    company_url = ""
    source = job.get('source', '')
    if 'greenhouse' in link or 'lever' in link or 'ashby' in link:
        # Try to get from source
        if source:
            from urllib.parse import urlparse
            parsed = urlparse(source)
            company_url = parsed.netloc
    
    return {
        "URL": link,
        "Company": company,
        "Company URL": company_url,
        "Job Title": title,
        "Location": location,
        "Remote": remote,
        "Job Type": "Full-time",
        "Seniority": seniority,
        "Department": dept,
        "Skills": "; ".join(skills) if skills else "-",
        "Compensation": "-",
        "Description": description[:10000],
    }


def main():
    print(f"Reading CSV: {INPUT}")
    with open(INPUT, "r", newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        csv_rows = list(reader)
    
    print(f"Reading cache: {CACHE}")
    with open(CACHE, "r") as f:
        cache_jobs = json.load(f)
    
    # Build URL sets
    csv_urls = {}
    for row in csv_rows:
        csv_urls[row['URL']] = row
    
    cache_url_map = {}
    for job in cache_jobs:
        url = job['link'].replace('https://', '').replace('http://', '')
        cache_url_map[url] = job
    
    # Remove stale jobs (not in cache anymore)
    stale = set(csv_urls.keys()) - set(cache_url_map.keys())
    active_rows = [r for r in csv_rows if r['URL'] not in stale]
    print(f"Removed {len(stale)} stale jobs")
    
    # Find new jobs
    new_urls = set(cache_url_map.keys()) - set(csv_urls.keys())
    print(f"New jobs to add: {len(new_urls)}")
    
    if new_urls:
        print(f"\nFetching descriptions for {len(new_urls)} new jobs...")
        new_rows = []
        new_url_list = list(new_urls)
        
        # Process in batches with threading
        batch_size = 20
        total_fetched = 0
        
        for batch_start in range(0, len(new_url_list), batch_size):
            batch = new_url_list[batch_start:batch_start + batch_size]
            
            with ThreadPoolExecutor(max_workers=10) as executor:
                futures = {}
                for url in batch:
                    job = cache_url_map[url]
                    futures[executor.submit(fetch_description, url)] = (url, job)
                
                for future in as_completed(futures):
                    url, job = futures[future]
                    try:
                        desc = future.result()
                    except Exception:
                        desc = ""
                    
                    row = infer_fields(job, desc)
                    new_rows.append(row)
                    total_fetched += 1
            
            if total_fetched % 100 == 0 or total_fetched == len(new_url_list):
                print(f"  Fetched {total_fetched}/{len(new_url_list)}")
        
        active_rows.extend(new_rows)
        print(f"Added {len(new_rows)} new jobs")
    
    # Write output
    print(f"\nWriting {len(active_rows)} total jobs to {OUTPUT}")
    with open(OUTPUT, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(active_rows)
    
    print("Done!")


if __name__ == "__main__":
    main()
