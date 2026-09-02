#!/usr/bin/env python3
"""
Backfill empty descriptions by curling each job URL.
Uses subprocess curl for better redirect/header handling than urllib.

Usage: python3 scripts/backfill-descriptions.py
"""

import csv
import subprocess
import re
import os
import json
import sys
from html.parser import HTMLParser
from concurrent.futures import ThreadPoolExecutor, as_completed

INPUT = os.path.expanduser("~/Downloads/Jobs - CVinBio & HashtagWeb3 - Jobs - Hashtag Web3.csv")
OUTPUT = INPUT

# ── Skill taxonomy ────────────────────────────────────────────────────
SKILL_PATTERNS: dict[str, list[str]] = {
    "Python": [r"\bpython\b"], "JavaScript": [r"\bjavascript\b"],
    "TypeScript": [r"\btypescript\b"], "Rust": [r"\brust\b"],
    "Go": [r"\bgolang\b", r"\bgo\b(?:\s+(?:lang|programming))"],
    "Solidity": [r"\bsolidity\b"], "C++": [r"\bc\+\+\b"],
    "Java": [r"\bjava\b(?!script)"], "Ruby": [r"\bruby\b"],
    "PHP": [r"\bphp\b"], "Swift": [r"\bswift\b"], "Kotlin": [r"\bkotlin\b"],
    "Scala": [r"\bscala\b"], "Cairo": [r"\bcairo\b"], "Vyper": [r"\bvyper\b"],
    "Circom": [r"\bcircom\b"], "Motoko": [r"\bmotoko\b"],
    "React": [r"\breact\b(?!(?:\s+native))"],
    "React Native": [r"\breact\s+native\b"],
    "Next.js": [r"\bnext\.?js\b"], "Node.js": [r"\bnode\.?js\b"],
    "Vue.js": [r"\bvue\.?js\b", r"\bvue\b"], "Angular": [r"\bangular\b"],
    "Django": [r"\bdjango\b"], "Flask": [r"\bflask\b"],
    "FastAPI": [r"\bfastapi\b"], "Rails": [r"\brails\b"],
    "Spring": [r"\bspring\b(?:\s+boot)?"],
    "GraphQL": [r"\bgraphql\b"],
    "REST API": [r"\brest\s*(?:ful)?\s*api\b"],
    "TailwindCSS": [r"\btailwind\b"],
    "SQL": [r"\bsql\b(?!ite)"], "PostgreSQL": [r"\bpostgres(?:ql)?\b"],
    "MySQL": [r"\bmysql\b"], "MongoDB": [r"\bmongodb\b"],
    "Redis": [r"\bredis\b"], "DynamoDB": [r"\bdynamodb\b"],
    "Elasticsearch": [r"\belasticsearch\b"], "Cassandra": [r"\bcassandra\b"],
    "BigQuery": [r"\bbigquery\b"], "Snowflake": [r"\bsnowflake\b"],
    "Firebase": [r"\bfirebase\b"], "Supabase": [r"\bsupabase\b"],
    "AWS": [r"\baws\b", r"\bamazon\s+web\s+services\b"],
    "GCP": [r"\bgcp\b", r"\bgoogle\s+cloud\b"], "Azure": [r"\bazure\b"],
    "Docker": [r"\bdocker\b"], "Kubernetes": [r"\bkubernetes\b", r"\bk8s\b"],
    "Terraform": [r"\bterraform\b"],
    "CI/CD": [r"\bci/?cd\b", r"\bcontinuous\s+(?:integration|deployment|delivery)\b"],
    "Jenkins": [r"\bjenkins\b"], "GitHub Actions": [r"\bgithub\s+actions\b"],
    "Linux": [r"\blinux\b"], "Nginx": [r"\bnginx\b"],
    "Datadog": [r"\bdatadog\b"], "Grafana": [r"\bgrafana\b"],
    "Prometheus": [r"\bprometheus\b"], "Vercel": [r"\bvercel\b"],
    "Cloudflare": [r"\bcloudflare\b"],
    "Git": [r"\bgit\b(?!hub)"], "GitHub": [r"\bgithub\b"], "GitLab": [r"\bgitlab\b"],
    "Ethereum": [r"\bethereum\b"], "Solana": [r"\bsolana\b"],
    "Bitcoin": [r"\bbitcoin\b"], "Polygon": [r"\bpolygon\b"],
    "Avalanche": [r"\bavalanche\b"], "Cosmos": [r"\bcosmos\b"],
    "Polkadot": [r"\bpolkadot\b"], "Arbitrum": [r"\barbitrum\b"],
    "Optimism": [r"\boptimism\b"], "StarkNet": [r"\bstarknet\b"],
    "zkSync": [r"\bzk\s*sync\b"], "Aptos": [r"\baptos\b"], "Sui": [r"\bsui\b"],
    "Near": [r"\bnear\b(?:\s+protocol)?"], "Tezos": [r"\btezos\b"],
    "DeFi": [r"\bdefi\b"], "NFT": [r"\bnfts?\b"],
    "Smart Contracts": [r"\bsmart\s+contracts?\b"],
    "Web3": [r"\bweb3\b"], "EVM": [r"\bevm\b"],
    "Layer 2": [r"\blayer\s*2\b", r"\bl2\b"],
    "ZK Proofs": [r"\bzk\b(?:\s+(?:proof|snark|stark|rollup))", r"\bzero[\s-]+knowledge\b"],
    "MEV": [r"\bmev\b"], "AMM": [r"\bamm\b"], "DEX": [r"\bdex\b(?:es)?"],
    "Tokenomics": [r"\btokenomics\b"],
    "ERC-20": [r"\berc[\s-]*20\b"], "ERC-721": [r"\berc[\s-]*721\b"],
    "Hardhat": [r"\bhardhat\b"], "Foundry": [r"\bfoundry\b"],
    "Ethers.js": [r"\bethers\.?js\b"], "Web3.js": [r"\bweb3\.?js\b"],
    "Wagmi": [r"\bwagmi\b"], "IPFS": [r"\bipfs\b"],
    "Chainlink": [r"\bchainlink\b"], "The Graph": [r"\bthe\s+graph\b", r"\bsubgraph\b"],
    "OpenZeppelin": [r"\bopenzeppelin\b"],
    "Machine Learning": [r"\bmachine\s+learning\b"],
    "Deep Learning": [r"\bdeep\s+learning\b"],
    "NLP": [r"\bnlp\b", r"\bnatural\s+language\s+processing\b"],
    "TensorFlow": [r"\btensorflow\b"], "PyTorch": [r"\bpytorch\b"],
    "LLM": [r"\bllms?\b", r"\blarge\s+language\s+model\b"],
    "Generative AI": [r"\bgenerative\s+ai\b", r"\bgen\s*ai\b"],
    "OpenAI": [r"\bopenai\b"], "LangChain": [r"\blangchain\b"],
    "Tableau": [r"\btableau\b"], "Power BI": [r"\bpower\s*bi\b"],
    "Looker": [r"\blooker\b"], "dbt": [r"\bdbt\b"],
    "Airflow": [r"\bairflow\b"], "Spark": [r"\bspark\b"],
    "Kafka": [r"\bkafka\b"], "ETL": [r"\betl\b"],
    "Data Analysis": [r"\bdata\s+analy(?:sis|tics)\b"],
    "Databricks": [r"\bdatabricks\b"], "Pandas": [r"\bpandas\b"],
    "Dune Analytics": [r"\bdune\b(?:\s+analytics)?"],
    "Figma": [r"\bfigma\b"], "UI/UX": [r"\bui/?ux\b", r"\bux/?ui\b"],
    "Product Management": [r"\bproduct\s+management\b"],
    "SEO": [r"\bseo\b"], "Content Marketing": [r"\bcontent\s+marketing\b"],
    "Growth Marketing": [r"\bgrowth\s+(?:marketing|hacking)\b"],
    "Social Media": [r"\bsocial\s+media\b"],
    "Community Management": [r"\bcommunity\s+manage(?:ment|r)\b"],
    "CRM": [r"\bcrm\b"], "HubSpot": [r"\bhubspot\b"],
    "Salesforce": [r"\bsalesforce\b"],
    "Compliance": [r"\bcompliance\b"], "Risk Management": [r"\brisk\s+management\b"],
    "KYC": [r"\bkyc\b"], "AML": [r"\baml\b"], "GDPR": [r"\bgdpr\b"],
    "SOC 2": [r"\bsoc\s*2\b"],
    "Security Auditing": [r"\bsecurity\s+audit\b"],
    "Financial Modeling": [r"\bfinancial\s+model(?:ing|s)\b"],
    "Accounting": [r"\baccounting\b"],
    "Regulatory": [r"\bregulatory\b(?:\s+(?:compliance|framework|reporting))"],
    "Agile": [r"\bagile\b", r"\bscrum\b"], "Jira": [r"\bjira\b"],
    "Confluence": [r"\bconfluence\b"],
    "Technical Writing": [r"\btechnical\s+writ(?:ing|er)\b"],
    "Project Management": [r"\bproject\s+management\b"],
    "Leadership": [r"\bleadership\b"],
    "Cross-functional": [r"\bcross[\s-]*functional\b"],
    "Communication": [r"\bcommunication\s+skills\b"],
    "Discord": [r"\bdiscord\b"], "Slack": [r"\bslack\b"],
    "Notion": [r"\bnotion\b"],
}


def extract_skills(text: str) -> list[str]:
    if not text:
        return []
    found = []
    for skill, patterns in SKILL_PATTERNS.items():
        for pat in patterns:
            if re.search(pat, text, re.IGNORECASE):
                found.append(skill)
                break
    return found


class TextExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts = []
        self._skip = False

    def handle_starttag(self, tag, attrs):
        if tag in ('script', 'style', 'noscript', 'header', 'footer', 'nav'):
            self._skip = True

    def handle_endtag(self, tag):
        if tag in ('script', 'style', 'noscript', 'header', 'footer', 'nav'):
            self._skip = False
        if tag in ('p', 'div', 'li', 'br', 'h1', 'h2', 'h3', 'h4', 'td', 'th'):
            self.parts.append('\n')

    def handle_data(self, data):
        if not self._skip:
            self.parts.append(data.strip())

    def get_text(self):
        return ' '.join(p for p in self.parts if p)


def curl_fetch(url: str) -> str:
    """Fetch page content using subprocess curl for best compatibility."""
    full_url = f"https://{url}" if not url.startswith("http") else url

    # Some ATS platforms have JSON APIs
    # Ashby: use their API endpoint
    if 'jobs.ashbyhq.com' in url:
        # Extract job ID from URL
        parts = url.split('/')
        if len(parts) >= 3:
            company_slug = parts[1] if 'ashbyhq.com' in parts[0] else parts[0].split('.')[0]
            job_id = parts[-1]
            api_url = f"https://api.ashbyhq.com/posting-api/posting-page/{job_id}"
            try:
                result = subprocess.run(
                    ['curl', '-sL', '-m', '10',
                     '-H', 'Content-Type: application/json',
                     api_url],
                    capture_output=True, text=True, timeout=15
                )
                if result.returncode == 0 and result.stdout.strip():
                    try:
                        data = json.loads(result.stdout)
                        desc = data.get('descriptionHtml', '') or data.get('description', '')
                        if desc:
                            ext = TextExtractor()
                            ext.feed(desc)
                            return ext.get_text()[:8000]
                    except json.JSONDecodeError:
                        pass
            except Exception:
                pass

    # Greenhouse: JSON API
    if 'greenhouse.io' in url:
        # Extract job ID
        m = re.search(r'/(\d+)', url)
        if m:
            job_id = m.group(1)
            # Try boards API first
            for base in ['https://boards-api.greenhouse.io/v1/boards', 
                         'https://boards-api.eu.greenhouse.io/v1/boards']:
                # We need the board token - try extracting from URL
                board_match = re.search(r'greenhouse\.io/([^/]+)/jobs', url)
                if board_match:
                    board = board_match.group(1)
                    api_url = f"{base}/{board}/jobs/{job_id}"
                    try:
                        result = subprocess.run(
                            ['curl', '-sL', '-m', '10', api_url],
                            capture_output=True, text=True, timeout=15
                        )
                        if result.returncode == 0 and result.stdout.strip().startswith('{'):
                            data = json.loads(result.stdout)
                            content = data.get('content', '')
                            if content:
                                ext = TextExtractor()
                                ext.feed(content)
                                return ext.get_text()[:8000]
                    except Exception:
                        pass

    # Lever: they have a reasonably scrapeable page
    # Default: just curl the page with a browser UA
    try:
        result = subprocess.run(
            ['curl', '-sL', '-m', '12',
             '-H', 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
             '-H', 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
             '-H', 'Accept-Language: en-US,en;q=0.9',
             full_url],
            capture_output=True, text=True, timeout=15
        )
        if result.returncode == 0 and result.stdout.strip():
            html = result.stdout

            # Try to extract JSON-LD job posting data first
            jld_match = re.search(r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>', html, re.DOTALL)
            if jld_match:
                try:
                    ld = json.loads(jld_match.group(1))
                    if isinstance(ld, list):
                        ld = ld[0]
                    desc = ld.get('description', '')
                    if desc and len(desc) > 50:
                        ext = TextExtractor()
                        ext.feed(desc)
                        return ext.get_text()[:8000]
                except (json.JSONDecodeError, IndexError):
                    pass

            # Try __NEXT_DATA__ for Next.js sites
            next_match = re.search(r'<script[^>]*id="__NEXT_DATA__"[^>]*>(.*?)</script>', html, re.DOTALL)
            if next_match:
                try:
                    ndata = json.loads(next_match.group(1))
                    # Walk the data to find description-like fields
                    text = json.dumps(ndata)
                    if len(text) > 200:
                        # Extract meaningful text snippets
                        snippets = re.findall(r'"(?:description|content|body|text|summary)"\s*:\s*"([^"]{50,})"', text)
                        if snippets:
                            return ' '.join(snippets)[:8000]
                except json.JSONDecodeError:
                    pass

            # Fallback: extract all text from HTML
            ext = TextExtractor()
            ext.feed(html)
            text = ext.get_text()
            if len(text) > 100:
                return text[:8000]

    except (subprocess.TimeoutExpired, Exception) as e:
        pass

    return ""


def process_row(row: dict) -> dict:
    """Fetch description and extract skills for a single row."""
    url = row['URL']
    desc = curl_fetch(url)

    if desc:
        row['Description'] = desc
        skills = extract_skills(desc)
        if skills:
            old = row.get('Skills', '')
            old_list = [s.strip() for s in old.split(';') if s.strip() and s.strip() != '-']
            seen = set(s.lower() for s in old_list)
            merged = old_list[:]
            for s in skills:
                if s.lower() not in seen:
                    seen.add(s.lower())
                    merged.append(s)
            row['Skills'] = '; '.join(merged) if merged else '-'
    return row


def main():
    print(f"Reading: {INPUT}")
    with open(INPUT, 'r', newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        rows = list(reader)

    empty = [(i, r) for i, r in enumerate(rows) if not r.get('Description', '').strip()]
    print(f"Total rows: {len(rows)}, Empty descriptions: {len(empty)}")

    filled = 0
    skills_added = 0

    # Process with threading (10 concurrent curls)
    batch_size = 50
    for batch_start in range(0, len(empty), batch_size):
        batch = empty[batch_start:batch_start + batch_size]

        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = {}
            for idx, row in batch:
                futures[executor.submit(process_row, dict(row))] = idx

            for future in as_completed(futures):
                idx = futures[future]
                try:
                    updated = future.result()
                    if updated.get('Description', '').strip():
                        rows[idx] = updated
                        filled += 1
                        new_skills = len([s for s in updated.get('Skills', '').split(';') if s.strip() and s.strip() != '-'])
                        skills_added += new_skills
                except Exception:
                    pass

        done = min(batch_start + batch_size, len(empty))
        print(f"  Processed {done}/{len(empty)} — filled {filled} descriptions, {skills_added} skills")

    # Write back
    with open(OUTPUT, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"\n✅ Done — filled {filled}/{len(empty)} empty descriptions")
    print(f"   Total skills added: {skills_added}")
    print(f"   Written to: {OUTPUT}")


if __name__ == "__main__":
    main()
