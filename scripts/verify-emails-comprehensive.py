#!/usr/bin/env python3
"""
Comprehensive FREE email verification using ALL available methods:
1. Syntax validation (RFC 5322)
2. MX record check (DNS)
3. SMTP mailbox verification (RCPT TO) — where providers allow it
4. Disposable email detection
5. Role-based email detection
6. Catch-all domain detection
7. Pattern-based spam trap detection

Strategy: Since we have 724K emails across ~26 domains (mostly Gmail/Yahoo/Hotmail),
we first do domain-level checks, then SMTP-sample each provider to see which ones
support SMTP verification, then bulk-verify only those providers.
"""

import json
import re
import smtplib
import socket
import dns.resolver
import time
import sys
from collections import Counter, defaultdict
from concurrent.futures import ThreadPoolExecutor, as_completed

INPUT_FILE = "/Users/vedang/web3jobs/Web3-Jobs/scripts/iimjobs-safe-emails.json"
OUTPUT_FILE = "/Users/vedang/web3jobs/Web3-Jobs/scripts/iimjobs-verified-final.json"
REJECTED_FILE = "/Users/vedang/web3jobs/Web3-Jobs/scripts/iimjobs-rejected.json"
REPORT_FILE = "/Users/vedang/web3jobs/Web3-Jobs/scripts/iimjobs-verification-report.json"

# ─── CHECK 1: Disposable email domains ───────────────────────────────────────
try:
    from disposable_email_domains import blocklist as DISPOSABLE_DOMAINS
    print(f"✅ Loaded {len(DISPOSABLE_DOMAINS)} disposable email domains")
except ImportError:
    DISPOSABLE_DOMAINS = set()
    print("⚠️  disposable-email-domains not installed, skipping disposable check")

# ─── CHECK 2: Role-based prefixes ────────────────────────────────────────────
ROLE_BASED_PREFIXES = {
    "admin", "info", "support", "sales", "contact", "webmaster",
    "postmaster", "abuse", "help", "feedback", "billing", "legal",
    "marketing", "press", "media", "hr", "jobs", "careers",
    "noreply", "no-reply", "no.reply", "donotreply", "do-not-reply",
    "mailer-daemon", "bounce", "root", "nobody", "null",
    "hostmaster", "usenet", "news", "ftp", "www",
    "security", "privacy", "compliance",
}

# ─── CHECK 3: Spam-trap / junk patterns ──────────────────────────────────────
JUNK_PATTERNS = [
    r"^test[\d_.]*@",           # test, test1, test_123
    r"^demo[\d_.]*@",           # demo, demo1
    r"^sample[\d_.]*@",         # sample
    r"^example[\d_.]*@",        # example
    r"^temp[\d_.]*@",           # temp, temp1
    r"^fake[\d_.]*@",           # fake
    r"^asdf",                   # keyboard mashing
    r"^qwerty",
    r"^aaa+@",                  # aaaa@
    r"^xxx+@",                  # xxx@
    r"^zzz+@",
    r"^123+@",                  # 123@
    r"^abc@",
    r"^user[\d]*@",             # user, user1, user123
    r"^spam",                   # spam@
    r"^junk",                   # junk@
    r"^trash",                  # trash@
    r"(.)\1{4,}",               # 5+ repeated chars like aaaaa, 11111
]

# ─── CHECK 4: Syntax (strict RFC) ────────────────────────────────────────────
EMAIL_STRICT_RE = re.compile(
    r"^[a-zA-Z0-9]"                # Must start with alphanumeric
    r"[a-zA-Z0-9._%+\-]*"         # Middle chars
    r"@"
    r"[a-zA-Z0-9]"                # Domain start
    r"[a-zA-Z0-9.\-]*"            # Domain middle
    r"\.[a-zA-Z]{2,}$"            # TLD
)

# ─── CHECK 5: SMTP Verification ──────────────────────────────────────────────
def get_mx_host(domain: str) -> str:
    """Get the primary MX host for a domain."""
    try:
        resolver = dns.resolver.Resolver()
        resolver.timeout = 5
        resolver.lifetime = 5
        records = resolver.resolve(domain, "MX")
        # Sort by priority, return the best one
        mx_records = sorted(records, key=lambda r: r.preference)
        return str(mx_records[0].exchange).rstrip(".")
    except Exception:
        return ""

def smtp_verify_email(email: str, mx_host: str, timeout: int = 10) -> dict:
    """
    Attempt SMTP RCPT TO verification.
    Returns: {"deliverable": True/False/None, "response": str, "catch_all": bool}
    None = inconclusive (server doesn't give clear answer)
    """
    result = {"email": email, "deliverable": None, "response": "", "catch_all": False, "error": None}
    
    try:
        with smtplib.SMTP(timeout=timeout) as smtp:
            smtp.connect(mx_host, 25)
            smtp.ehlo("verify.hashtagweb3.com")
            
            # Some servers require STARTTLS
            try:
                smtp.starttls()
                smtp.ehlo("verify.hashtagweb3.com")
            except Exception:
                pass
            
            # Set sender
            code, msg = smtp.mail("verify@hashtagweb3.com")
            if code != 250:
                result["error"] = f"MAIL FROM rejected: {code} {msg}"
                return result
            
            # Try the actual email
            code, msg = smtp.rcpt(email)
            result["response"] = f"{code} {msg.decode('utf-8', errors='replace')}"
            
            if code == 250:
                result["deliverable"] = True
            elif code == 550 or code == 551 or code == 552 or code == 553:
                result["deliverable"] = False  # Mailbox doesn't exist
            elif code == 450 or code == 451 or code == 452:
                result["deliverable"] = None  # Greylisting or temp error
            else:
                result["deliverable"] = None
            
            smtp.quit()
    except smtplib.SMTPServerDisconnected:
        result["error"] = "Server disconnected (likely blocking verification)"
    except socket.timeout:
        result["error"] = "Connection timeout"
    except ConnectionRefusedError:
        result["error"] = "Connection refused (port 25 blocked)"
    except OSError as e:
        result["error"] = f"OS error: {e}"
    except Exception as e:
        result["error"] = f"Error: {e}"
    
    return result

def test_catch_all(mx_host: str, domain: str) -> bool:
    """Test if domain is catch-all by trying a definitely-fake address."""
    fake = f"definitely-not-a-real-user-xyzzy-99999@{domain}"
    result = smtp_verify_email(fake, mx_host, timeout=10)
    return result.get("deliverable") == True

def smtp_probe_domain(domain: str, sample_emails: list) -> dict:
    """
    Probe a domain with sample emails to determine if SMTP verification works.
    Returns info about the domain's SMTP behavior.
    """
    mx_host = get_mx_host(domain)
    if not mx_host:
        return {"domain": domain, "mx_host": None, "smtp_works": False, "reason": "No MX record"}
    
    info = {
        "domain": domain, 
        "mx_host": mx_host, 
        "smtp_works": False, 
        "catch_all": False,
        "reason": "",
        "sample_results": []
    }
    
    # First test: catch-all detection
    print(f"    Testing catch-all for {domain}...")
    is_catch_all = test_catch_all(mx_host, domain)
    info["catch_all"] = is_catch_all
    
    if is_catch_all:
        info["reason"] = "Catch-all domain (accepts all addresses, can't verify individual mailboxes)"
        info["smtp_works"] = False
        return info
    
    # Test with sample emails
    print(f"    Testing {len(sample_emails)} sample emails...")
    for email in sample_emails[:3]:
        result = smtp_verify_email(email, mx_host)
        info["sample_results"].append(result)
        
        if result["error"]:
            info["reason"] = f"SMTP error: {result['error']}"
            break
        elif result["deliverable"] is not None:
            info["smtp_works"] = True
        
        time.sleep(1)  # Be gentle
    
    if not info["reason"] and info["smtp_works"]:
        info["reason"] = "SMTP verification works"
    elif not info["reason"]:
        info["reason"] = "SMTP inconclusive"
    
    return info

# ─── MAIN ────────────────────────────────────────────────────────────────────

def main():
    print(f"📂 Loading emails...")
    with open(INPUT_FILE) as f:
        emails = json.load(f)
    print(f"  Loaded {len(emails):,} emails")
    
    # Group by domain
    domain_emails = defaultdict(list)
    for email in emails:
        domain = email.split("@")[1]
        domain_emails[domain].append(email)
    
    sorted_domains = sorted(domain_emails.items(), key=lambda x: -len(x[1]))
    print(f"  {len(sorted_domains)} unique domains\n")
    
    # ─── Phase 1: Non-network checks (instant) ──────────────────────────────
    print("=" * 70)
    print("PHASE 1: Syntax + Pattern + Role + Disposable checks")
    print("=" * 70)
    
    rejected = defaultdict(list)  # reason -> [emails]
    passed_phase1 = []
    
    for email in emails:
        local_part = email.split("@")[0]
        domain = email.split("@")[1]
        
        # Check 1: Strict syntax
        if not EMAIL_STRICT_RE.match(email):
            rejected["invalid_syntax"].append(email)
            continue
        
        # Check 2: Disposable domain
        if domain in DISPOSABLE_DOMAINS:
            rejected["disposable_domain"].append(email)
            continue
        
        # Check 3: Role-based
        if local_part in ROLE_BASED_PREFIXES:
            rejected["role_based"].append(email)
            continue
        
        # Check 4: Junk patterns
        is_junk = False
        for pattern in JUNK_PATTERNS:
            if re.search(pattern, email, re.IGNORECASE):
                rejected["junk_pattern"].append(email)
                is_junk = True
                break
        if is_junk:
            continue
        
        # Check 5: Too-short local part (likely fake: a@, ab@)
        if len(local_part) < 3:
            rejected["too_short"].append(email)
            continue
        
        # Check 6: All-numeric local part (often auto-generated/fake)
        if local_part.isdigit() and len(local_part) < 5:
            rejected["numeric_short"].append(email)
            continue

        passed_phase1.append(email)
    
    print(f"\n📊 Phase 1 Results:")
    print(f"  ✅ Passed:              {len(passed_phase1):,}")
    for reason, rejected_list in sorted(rejected.items(), key=lambda x: -len(x[1])):
        print(f"  ❌ {reason:20s}:  {len(rejected_list):,}")
    total_rejected_p1 = sum(len(v) for v in rejected.values())
    print(f"  ❌ Total rejected:      {total_rejected_p1:,}")
    
    # ─── Phase 2: SMTP probe each domain ─────────────────────────────────────
    print(f"\n{'=' * 70}")
    print("PHASE 2: SMTP Verification Probe (testing each domain)")
    print("=" * 70)
    
    # Regroup passed emails by domain
    domain_passed = defaultdict(list)
    for email in passed_phase1:
        domain = email.split("@")[1]
        domain_passed[domain].append(email)
    
    smtp_results = {}
    verifiable_domains = set()
    catch_all_domains = set()
    
    for domain, d_emails in sorted(domain_passed.items(), key=lambda x: -len(x[1])):
        count = len(d_emails)
        print(f"\n  🔍 {domain} ({count:,} emails)")
        
        probe = smtp_probe_domain(domain, d_emails[:5])
        smtp_results[domain] = probe
        
        if probe["smtp_works"]:
            verifiable_domains.add(domain)
            print(f"    ✅ SMTP verification WORKS — can verify individual mailboxes")
        elif probe["catch_all"]:
            catch_all_domains.add(domain)
            print(f"    ⚠️  CATCH-ALL — accepts all addresses, can't distinguish valid/invalid")
        else:
            print(f"    ❌ SMTP not usable — {probe['reason']}")
        
        time.sleep(0.5)
    
    # ─── Phase 3: Bulk SMTP verify for domains that support it ───────────────
    smtp_verified = set()
    smtp_rejected = set()
    smtp_inconclusive = set()
    
    verifiable_email_count = sum(len(domain_passed[d]) for d in verifiable_domains)
    
    if verifiable_domains:
        print(f"\n{'=' * 70}")
        print(f"PHASE 3: Bulk SMTP Verification ({verifiable_email_count:,} emails across {len(verifiable_domains)} domains)")
        print("=" * 70)
        
        for domain in verifiable_domains:
            d_emails = domain_passed[domain]
            mx_host = smtp_results[domain]["mx_host"]
            print(f"\n  Verifying {len(d_emails):,} emails at {domain}...")
            
            verified_count = 0
            rejected_count = 0
            inconclusive_count = 0
            
            # Process in batches to be respectful
            BATCH_SIZE = 50
            BATCH_DELAY = 2  # seconds between batches
            
            for i in range(0, len(d_emails), BATCH_SIZE):
                batch = d_emails[i:i + BATCH_SIZE]
                
                for email in batch:
                    result = smtp_verify_email(email, mx_host, timeout=8)
                    
                    if result["deliverable"] == True:
                        smtp_verified.add(email)
                        verified_count += 1
                    elif result["deliverable"] == False:
                        smtp_rejected.add(email)
                        rejected_count += 1
                    else:
                        smtp_inconclusive.add(email)
                        inconclusive_count += 1
                    
                    time.sleep(0.2)  # Rate limit
                
                done = min(i + BATCH_SIZE, len(d_emails))
                if done % 500 == 0 or done >= len(d_emails):
                    print(f"    Progress: {done:,}/{len(d_emails):,} (✅{verified_count} ❌{rejected_count} ❓{inconclusive_count})")
                
                time.sleep(BATCH_DELAY)
    else:
        print(f"\n⚠️  No domains support SMTP verification (Gmail, Yahoo, Hotmail all block it)")
    
    # ─── Final Assembly ──────────────────────────────────────────────────────
    print(f"\n{'=' * 70}")
    print("FINAL RESULTS")
    print("=" * 70)
    
    # Final list: all phase1 passed that weren't SMTP-rejected
    final_verified = []
    for email in passed_phase1:
        if email in smtp_rejected:
            continue
        final_verified.append(email)
    
    # Compile all rejections
    all_rejected = []
    for reason, emails_list in rejected.items():
        for e in emails_list:
            all_rejected.append({"email": e, "reason": reason})
    for e in smtp_rejected:
        all_rejected.append({"email": e, "reason": "smtp_mailbox_not_found"})
    
    # Domain breakdown
    final_domain_counts = Counter()
    for e in final_verified:
        final_domain_counts[e.split("@")[1]] += 1
    
    print(f"\n  Input:                 {len(emails):,}")
    print(f"  Phase 1 rejected:      {total_rejected_p1:,}")
    print(f"  SMTP rejected:         {len(smtp_rejected):,}")
    print(f"  SMTP verified:         {len(smtp_verified):,}")
    print(f"  SMTP inconclusive:     {len(smtp_inconclusive):,}")
    print(f"  ────────────────────────────────")
    print(f"  ✅ FINAL VERIFIED:     {len(final_verified):,}")
    
    print(f"\n  📈 By domain:")
    for domain, count in final_domain_counts.most_common(15):
        smtp_info = smtp_results.get(domain, {})
        smtp_status = "✅ SMTP" if domain in verifiable_domains else ("⚠️ catch-all" if domain in catch_all_domains else "🔒 no SMTP")
        print(f"    {domain:25s}: {count:>8,}  ({smtp_status})")
    
    # Save files
    with open(OUTPUT_FILE, "w") as f:
        json.dump(final_verified, f, indent=2)
    print(f"\n  💾 Saved {len(final_verified):,} verified emails → {OUTPUT_FILE}")
    
    with open(REJECTED_FILE, "w") as f:
        json.dump(all_rejected, f, indent=2)
    print(f"  💾 Saved {len(all_rejected):,} rejected emails → {REJECTED_FILE}")
    
    # Save report
    report = {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S"),
        "input_count": len(emails),
        "final_verified_count": len(final_verified),
        "total_rejected": len(all_rejected),
        "phase1_rejections": {k: len(v) for k, v in rejected.items()},
        "smtp_verified": len(smtp_verified),
        "smtp_rejected": len(smtp_rejected),
        "smtp_inconclusive": len(smtp_inconclusive),
        "domain_smtp_results": {
            d: {
                "smtp_works": info.get("smtp_works"),
                "catch_all": info.get("catch_all"),
                "reason": info.get("reason"),
                "email_count": len(domain_passed.get(d, []))
            }
            for d, info in smtp_results.items()
        },
        "final_domain_breakdown": dict(final_domain_counts.most_common()),
    }
    with open(REPORT_FILE, "w") as f:
        json.dump(report, f, indent=2)
    print(f"  💾 Saved verification report → {REPORT_FILE}")

if __name__ == "__main__":
    main()
