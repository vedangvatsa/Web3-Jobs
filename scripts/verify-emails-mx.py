#!/usr/bin/env python3
"""
Free email verification via MX record + domain health checks.
No paid services needed — just DNS lookups.

Steps:
1. Group emails by domain
2. MX-check each unique domain (only ~50 domains to check for 724K emails)
3. Remove emails with dead/no-MX domains
4. Remove obviously bad patterns (test@, noreply@, etc.)
5. Output verified list
"""

import json
import dns.resolver
import re
from collections import Counter
import time

INPUT_FILE = "LOCAL_PATH/scripts/iimjobs-safe-emails.json"
OUTPUT_FILE = "LOCAL_PATH/scripts/iimjobs-verified-emails.json"

# Patterns in the local part that indicate non-personal/junk addresses
BAD_LOCAL_PATTERNS = [
    r"^test", r"^noreply", r"^no\.reply", r"^no-reply",
    r"^admin@", r"^info@", r"^support@", r"^sales@",
    r"^contact@", r"^webmaster@", r"^postmaster@",
    r"^abuse@", r"^help@", r"^feedback@",
    r"^donotreply", r"^do\.not\.reply", r"^do-not-reply",
    r"^mailer-daemon", r"^bounce",
    r"^xxx", r"^yyy", r"^zzz", r"^aaa",
    r"^asdf", r"^qwerty",
    r"^example", r"^sample", r"^demo",
    r"^null@", r"^void@", r"^none@",
    r"^root@", r"^nobody@",
]

def check_mx(domain: str, timeout: float = 5.0) -> dict:
    """Check if domain has valid MX records."""
    result = {"domain": domain, "has_mx": False, "mx_records": [], "error": None}
    try:
        resolver = dns.resolver.Resolver()
        resolver.timeout = timeout
        resolver.lifetime = timeout
        answers = resolver.resolve(domain, "MX")
        result["mx_records"] = [str(r.exchange).rstrip('.') for r in answers]
        result["has_mx"] = len(result["mx_records"]) > 0
    except dns.resolver.NoAnswer:
        result["error"] = "NoAnswer"
    except dns.resolver.NXDOMAIN:
        result["error"] = "NXDOMAIN"  # Domain doesn't exist at all
    except dns.resolver.NoNameservers:
        result["error"] = "NoNameservers"
    except dns.exception.Timeout:
        result["error"] = "Timeout"
    except Exception as e:
        result["error"] = str(e)
    return result

def is_bad_local_part(email: str) -> bool:
    """Check if the local part (before @) matches junk patterns."""
    local = email.split("@")[0]
    for pattern in BAD_LOCAL_PATTERNS:
        if re.search(pattern, local, re.IGNORECASE):
            return True
    return False

def main():
    print(f"📂 Loading emails from {INPUT_FILE}...")
    with open(INPUT_FILE) as f:
        emails = json.load(f)
    print(f"  Loaded {len(emails):,} emails")

    # Group by domain
    domain_emails = {}
    for email in emails:
        domain = email.split("@")[1]
        domain_emails.setdefault(domain, []).append(email)

    print(f"\n🌐 Unique domains to check: {len(domain_emails)}")

    # Sort domains by email count (most popular first)
    sorted_domains = sorted(domain_emails.items(), key=lambda x: -len(x[1]))

    # MX check each domain
    valid_domains = set()
    dead_domains = {}
    print(f"\n🔍 Checking MX records...")

    for i, (domain, domain_email_list) in enumerate(sorted_domains):
        result = check_mx(domain)
        status = "✅" if result["has_mx"] else "❌"
        count = len(domain_email_list)

        if result["has_mx"]:
            valid_domains.add(domain)
            if count >= 100:
                print(f"  {status} {domain}: {count:,} emails — MX: {', '.join(result['mx_records'][:2])}")
        else:
            dead_domains[domain] = {"count": count, "error": result["error"]}
            print(f"  {status} {domain}: {count:,} emails — {result['error']}")

        # Brief pause to not hammer DNS
        if i % 50 == 0 and i > 0:
            time.sleep(0.5)

    # Filter emails
    print(f"\n🧹 Filtering emails...")
    verified = []
    removed_dead_domain = 0
    removed_bad_pattern = 0

    for email in emails:
        domain = email.split("@")[1]

        if domain not in valid_domains:
            removed_dead_domain += 1
            continue

        if is_bad_local_part(email):
            removed_bad_pattern += 1
            continue

        verified.append(email)

    # Stats
    dead_email_count = sum(d["count"] for d in dead_domains.values())
    print(f"\n{'=' * 60}")
    print(f"📊 VERIFICATION RESULTS")
    print(f"{'=' * 60}")
    print(f"Input emails:          {len(emails):,}")
    print(f"Valid domains:         {len(valid_domains)}")
    print(f"Dead domains:          {len(dead_domains)} ({dead_email_count:,} emails removed)")
    print(f"Bad patterns removed:  {removed_bad_pattern:,}")
    print(f"")
    print(f"✅ Verified emails:    {len(verified):,}")

    if dead_domains:
        print(f"\n💀 Dead domains:")
        for domain, info in sorted(dead_domains.items(), key=lambda x: -x[1]["count"]):
            if info["count"] >= 10:
                print(f"  ❌ {domain}: {info['count']:,} emails — {info['error']}")

    # Save
    with open(OUTPUT_FILE, "w") as f:
        json.dump(verified, f, indent=2)
    print(f"\n💾 Saved {len(verified):,} verified emails to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
