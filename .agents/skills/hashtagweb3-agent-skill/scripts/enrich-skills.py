#!/usr/bin/env python3
"""
Enrich the Skills column of the jobs CSV by extracting all mentioned
skills/technologies from the Description field.

Usage: python3 scripts/enrich-skills.py
"""

import csv
import re
import sys
import os

INPUT = os.path.expanduser("~/Downloads/Jobs - CVinBio & HashtagWeb3 - Jobs - Hashtag Web3.csv")
OUTPUT = INPUT  # overwrite in-place

# ── Master skill taxonomy ─────────────────────────────────────────────
# Each entry: canonical name → list of patterns (case-insensitive)
# Grouped by category for clarity

SKILL_PATTERNS: dict[str, list[str]] = {
    # ── Languages ──
    "Python": [r"\bpython\b"],
    "JavaScript": [r"\bjavascript\b", r"\bjs\b(?!\.)"],
    "TypeScript": [r"\btypescript\b", r"\bts\b(?!\.)"],
    "Rust": [r"\brust\b"],
    "Go": [r"\bgolang\b", r"\bgo\b(?:\s+(?:lang|programming))"],
    "Solidity": [r"\bsolidity\b"],
    "C++": [r"\bc\+\+\b", r"\bcpp\b"],
    "C#": [r"\bc#\b", r"\bcsharp\b"],
    "Java": [r"\bjava\b(?!script)"],
    "Ruby": [r"\bruby\b"],
    "PHP": [r"\bphp\b"],
    "Swift": [r"\bswift\b"],
    "Kotlin": [r"\bkotlin\b"],
    "Scala": [r"\bscala\b"],
    "R": [r"\bR\b(?:\s+(?:programming|language|studio))"],
    "Haskell": [r"\bhaskell\b"],
    "Cairo": [r"\bcairo\b"],
    "Move": [r"\bmove\b(?:\s+(?:language|programming))"],
    "Vyper": [r"\bvyper\b"],
    "Motoko": [r"\bmotoko\b"],
    "Circom": [r"\bcircom\b"],

    # ── Frameworks & Libraries ──
    "React": [r"\breact\b(?!(?:\s+native))"],
    "React Native": [r"\breact\s+native\b"],
    "Next.js": [r"\bnext\.?js\b", r"\bnext\s+js\b"],
    "Node.js": [r"\bnode\.?js\b", r"\bnode\s+js\b"],
    "Vue.js": [r"\bvue\.?js\b", r"\bvue\b"],
    "Angular": [r"\bangular\b"],
    "Express": [r"\bexpress\.?js\b", r"\bexpress\b(?:\s+(?:framework|server))"],
    "Django": [r"\bdjango\b"],
    "Flask": [r"\bflask\b"],
    "FastAPI": [r"\bfastapi\b"],
    "Spring": [r"\bspring\b(?:\s+boot)?"],
    "Rails": [r"\brails\b", r"\bruby\s+on\s+rails\b"],
    "TailwindCSS": [r"\btailwind\b"],
    "GraphQL": [r"\bgraphql\b"],
    "REST API": [r"\brest\s*(?:ful)?\s*api\b", r"\brest\b(?:\s+(?:api|endpoint))"],

    # ── Databases ──
    "SQL": [r"\bsql\b(?!ite)"],
    "PostgreSQL": [r"\bpostgres(?:ql)?\b"],
    "MySQL": [r"\bmysql\b"],
    "MongoDB": [r"\bmongodb\b", r"\bmongo\b"],
    "Redis": [r"\bredis\b"],
    "DynamoDB": [r"\bdynamodb\b"],
    "Elasticsearch": [r"\belasticsearch\b"],
    "SQLite": [r"\bsqlite\b"],
    "Cassandra": [r"\bcassandra\b"],
    "BigQuery": [r"\bbigquery\b"],
    "Snowflake": [r"\bsnowflake\b"],
    "Supabase": [r"\bsupabase\b"],
    "Firebase": [r"\bfirebase\b"],

    # ── Cloud & DevOps ──
    "AWS": [r"\baws\b", r"\bamazon\s+web\s+services\b"],
    "GCP": [r"\bgcp\b", r"\bgoogle\s+cloud\b"],
    "Azure": [r"\bazure\b"],
    "Docker": [r"\bdocker\b"],
    "Kubernetes": [r"\bkubernetes\b", r"\bk8s\b"],
    "Terraform": [r"\bterraform\b"],
    "CI/CD": [r"\bci/?cd\b", r"\bcontinuous\s+(?:integration|deployment|delivery)\b"],
    "Jenkins": [r"\bjenkins\b"],
    "GitHub Actions": [r"\bgithub\s+actions\b"],
    "Ansible": [r"\bansible\b"],
    "Helm": [r"\bhelm\b(?:\s+chart)?"],
    "Linux": [r"\blinux\b"],
    "Nginx": [r"\bnginx\b"],
    "Vercel": [r"\bvercel\b"],
    "Cloudflare": [r"\bcloudflare\b"],
    "Datadog": [r"\bdatadog\b"],
    "Grafana": [r"\bgrafana\b"],
    "Prometheus": [r"\bprometheus\b"],

    # ── Blockchain & Web3 ──
    "Ethereum": [r"\bethereum\b"],
    "Solana": [r"\bsolana\b"],
    "Bitcoin": [r"\bbitcoin\b"],
    "Polygon": [r"\bpolygon\b"],
    "Avalanche": [r"\bavalanche\b"],
    "Cosmos": [r"\bcosmos\b"],
    "Polkadot": [r"\bpolkadot\b"],
    "Arbitrum": [r"\barbitrum\b"],
    "Optimism": [r"\boptimism\b"],
    "Base": [r"\bbase\b(?:\s+(?:chain|network|l2))"],
    "StarkNet": [r"\bstarknet\b", r"\bstark\s*net\b"],
    "zkSync": [r"\bzk\s*sync\b"],
    "Near": [r"\bnear\b(?:\s+protocol)?"],
    "Aptos": [r"\baptos\b"],
    "Sui": [r"\bsui\b"],
    "TON": [r"\bton\b(?:\s+(?:blockchain|network))"],
    "Tezos": [r"\btezos\b"],
    "DeFi": [r"\bdefi\b", r"\bdecentralized\s+finance\b"],
    "NFT": [r"\bnfts?\b", r"\bnon-fungible\b"],
    "DAO": [r"\bdaos?\b(?!stack)"],
    "Smart Contracts": [r"\bsmart\s+contracts?\b"],
    "Web3": [r"\bweb3\b", r"\bweb\s*3\b"],
    "EVM": [r"\bevm\b"],
    "Layer 2": [r"\blayer\s*2\b", r"\bl2\b"],
    "ZK Proofs": [r"\bzk\b(?:\s+(?:proof|snark|stark|rollup))", r"\bzero[\s-]+knowledge\b"],
    "MEV": [r"\bmev\b"],
    "AMM": [r"\bamm\b", r"\bautomated\s+market\s+maker\b"],
    "DEX": [r"\bdex\b(?:es)?", r"\bdecentralized\s+exchange\b"],
    "Tokenomics": [r"\btokenomics\b"],
    "ERC-20": [r"\berc[\s-]*20\b"],
    "ERC-721": [r"\berc[\s-]*721\b"],
    "ERC-1155": [r"\berc[\s-]*1155\b"],
    "Hardhat": [r"\bhardhat\b"],
    "Foundry": [r"\bfoundry\b"],
    "Truffle": [r"\btruffle\b"],
    "Ethers.js": [r"\bethers\.?js\b", r"\bethers\b"],
    "Web3.js": [r"\bweb3\.?js\b"],
    "Wagmi": [r"\bwagmi\b"],
    "IPFS": [r"\bipfs\b"],
    "Chainlink": [r"\bchainlink\b"],
    "The Graph": [r"\bthe\s+graph\b", r"\bsubgraph\b"],
    "OpenZeppelin": [r"\bopenzeppelin\b"],
    "Anchor": [r"\banchor\b(?:\s+(?:framework|protocol))"],

    # ── AI & ML ──
    "Machine Learning": [r"\bmachine\s+learning\b", r"\bml\b(?:\s+(?:model|pipeline|engineer))"],
    "Deep Learning": [r"\bdeep\s+learning\b"],
    "NLP": [r"\bnlp\b", r"\bnatural\s+language\s+processing\b"],
    "Computer Vision": [r"\bcomputer\s+vision\b"],
    "TensorFlow": [r"\btensorflow\b"],
    "PyTorch": [r"\bpytorch\b"],
    "LLM": [r"\bllms?\b", r"\blarge\s+language\s+model\b"],
    "GPT": [r"\bgpt[\s-]?\d?\b"],
    "Generative AI": [r"\bgenerative\s+ai\b", r"\bgen\s*ai\b"],
    "RAG": [r"\brag\b(?:\s+(?:pipeline|system|architecture))"],
    "Hugging Face": [r"\bhugging\s*face\b"],
    "OpenAI": [r"\bopenai\b"],
    "LangChain": [r"\blangchain\b"],
    "Scikit-learn": [r"\bscikit[\s-]*learn\b", r"\bsklearn\b"],

    # ── Data & Analytics ──
    "Tableau": [r"\btableau\b"],
    "Power BI": [r"\bpower\s*bi\b"],
    "Looker": [r"\blooker\b"],
    "dbt": [r"\bdbt\b"],
    "Airflow": [r"\bairflow\b"],
    "Spark": [r"\bspark\b", r"\bpyspark\b"],
    "Kafka": [r"\bkafka\b"],
    "ETL": [r"\betl\b"],
    "Data Engineering": [r"\bdata\s+engineering\b"],
    "Data Analysis": [r"\bdata\s+analy(?:sis|tics)\b"],
    "Databricks": [r"\bdatabricks\b"],
    "Pandas": [r"\bpandas\b"],
    "NumPy": [r"\bnumpy\b"],
    "Dune Analytics": [r"\bdune\b(?:\s+analytics)?"],

    # ── Security & Compliance ──
    "Security Auditing": [r"\bsecurity\s+audit\b", r"\baudit(?:ing|s)?\b(?:\s+(?:smart|security))"],
    "Penetration Testing": [r"\bpen(?:etration)?\s*test\b"],
    "SOC 2": [r"\bsoc\s*2\b"],
    "GDPR": [r"\bgdpr\b"],
    "KYC": [r"\bkyc\b"],
    "AML": [r"\baml\b"],
    "Compliance": [r"\bcompliance\b"],
    "Risk Management": [r"\brisk\s+management\b"],

    # ── Design & Product ──
    "Figma": [r"\bfigma\b"],
    "Sketch": [r"\bsketch\b"],
    "Adobe XD": [r"\badobe\s*xd\b"],
    "UI/UX": [r"\bui/?ux\b", r"\bux/?ui\b", r"\bux\s+design\b", r"\bui\s+design\b"],
    "Product Management": [r"\bproduct\s+management\b"],
    "User Research": [r"\buser\s+research\b"],
    "A/B Testing": [r"\ba/?b\s+test\b"],
    "Design Systems": [r"\bdesign\s+system\b"],
    "Prototyping": [r"\bprototyp\b"],

    # ── Marketing & Growth ──
    "SEO": [r"\bseo\b"],
    "SEM": [r"\bsem\b"],
    "Google Analytics": [r"\bgoogle\s+analytics\b", r"\bga4\b"],
    "Content Marketing": [r"\bcontent\s+marketing\b"],
    "Social Media": [r"\bsocial\s+media\b"],
    "Community Management": [r"\bcommunity\s+manage(?:ment|r)\b"],
    "Growth Marketing": [r"\bgrowth\s+(?:marketing|hacking)\b"],
    "Email Marketing": [r"\bemail\s+marketing\b"],
    "CRM": [r"\bcrm\b"],
    "HubSpot": [r"\bhubspot\b"],
    "Salesforce": [r"\bsalesforce\b"],

    # ── Soft Skills & Domains ──
    "Project Management": [r"\bproject\s+management\b"],
    "Agile": [r"\bagile\b", r"\bscrum\b"],
    "Jira": [r"\bjira\b"],
    "Confluence": [r"\bconfluence\b"],
    "Technical Writing": [r"\btechnical\s+writ(?:ing|er)\b"],
    "Leadership": [r"\bleadership\b"],
    "Cross-functional": [r"\bcross[\s-]*functional\b"],
    "Stakeholder Management": [r"\bstakeholder\s+management\b"],
    "Communication": [r"\bcommunication\s+skills\b"],
    "Team Management": [r"\bteam\s+manage(?:ment|r)\b"],

    # ── Finance & Legal ──
    "Financial Modeling": [r"\bfinancial\s+model(?:ing|s)\b"],
    "Accounting": [r"\baccounting\b"],
    "Financial Analysis": [r"\bfinancial\s+analysis\b"],
    "Tax": [r"\btax\b(?:\s+(?:compliance|reporting|preparation))"],
    "Regulatory": [r"\bregulatory\b(?:\s+(?:compliance|framework|reporting))"],

    # ── Tools ──
    "Git": [r"\bgit\b(?!hub)"],
    "GitHub": [r"\bgithub\b"],
    "GitLab": [r"\bgitlab\b"],
    "Slack": [r"\bslack\b"],
    "Discord": [r"\bdiscord\b"],
    "Notion": [r"\bnotion\b"],
    "Linear": [r"\blinear\b(?:\s+(?:app|tool|project))"],
}


def extract_skills(description: str) -> list[str]:
    """Extract all matching skills from a job description."""
    if not description:
        return []
    
    found = []
    desc_lower = description.lower()
    
    for skill, patterns in SKILL_PATTERNS.items():
        for pattern in patterns:
            if re.search(pattern, description, re.IGNORECASE):
                found.append(skill)
                break
    
    return found


def merge_skills(existing: str, extracted: list[str]) -> str:
    """Merge existing skills with newly extracted ones, deduplicating."""
    existing_list = [s.strip() for s in existing.split(";") if s.strip() and s.strip() != "-"]
    
    # Normalize for dedup
    seen = set()
    merged = []
    for s in existing_list + extracted:
        key = s.lower().strip()
        if key not in seen:
            seen.add(key)
            merged.append(s.strip())
    
    return "; ".join(merged)


def main():
    print(f"Reading: {INPUT}")
    
    with open(INPUT, "r", newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        rows = list(reader)
    
    print(f"Total rows: {len(rows)}")
    
    updated = 0
    total_new_skills = 0
    
    for row in rows:
        desc = row.get("Description", "")
        old_skills = row.get("Skills", "")
        
        extracted = extract_skills(desc)
        new_skills = merge_skills(old_skills, extracted)
        
        if new_skills != old_skills:
            old_count = len([s for s in old_skills.split(";") if s.strip() and s.strip() != "-"])
            new_count = len(new_skills.split(";"))
            added = new_count - old_count
            total_new_skills += added
            updated += 1
            row["Skills"] = new_skills
    
    print(f"Updated: {updated} rows")
    print(f"Added: {total_new_skills} new skills total")
    
    # Write back
    with open(OUTPUT, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    
    print(f"Written to: {OUTPUT}")
    
    # Show some examples
    print("\n── Sample enriched rows ──")
    for row in rows[:5]:
        print(f"\n{row['Job Title']} @ {row['Company']}")
        print(f"  Skills: {row['Skills']}")


if __name__ == "__main__":
    main()
