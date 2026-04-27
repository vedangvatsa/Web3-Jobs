#!/usr/bin/env python3
"""
Multi-tool email verification — FAST version with 100 parallel workers.

Tools:
1. email-validator (Python) — syntax only (no network, instant)
2. Disify API — domain-level (26 domains, parallel)
3. Mailcheck.ai API — domain-level (26 domains, parallel)
4. verify-email (Python) — SMTP sample check per domain (parallel)
5. deep-email-validator (Node.js) — sample check per domain
6. email-verify (Node.js) — SMTP sample check per domain
"""

import json
import subprocess
import time
import sys
import os
import re
from collections import Counter, defaultdict
from concurrent.futures import ThreadPoolExecutor, as_completed
import urllib.request

INPUT_FILE = "LOCAL_PATH/scripts/iimjobs-verified-final.json"
OUTPUT_FILE = "LOCAL_PATH/scripts/iimjobs-all-tools-verified.json"
REPORT_FILE = "LOCAL_PATH/scripts/iimjobs-all-tools-report.json"
WORKERS = 100

# ─── Tool 1: email-validator (syntax, no network) ────────────────────────────
def bulk_email_validator(emails: list) -> tuple:
    """Fast syntax-only check with email-validator. Returns (passed, rejected)."""
    from email_validator import validate_email, EmailNotValidError
    
    passed = []
    rejected = []
    
    def check_one(email):
        try:
            validate_email(email, check_deliverability=False)
            return (email, True, None)
        except EmailNotValidError as e:
            return (email, False, str(e))
    
    with ThreadPoolExecutor(max_workers=WORKERS) as executor:
        futures = {executor.submit(check_one, e): e for e in emails}
        done = 0
        for future in as_completed(futures):
            email, valid, error = future.result()
            if valid:
                passed.append(email)
            else:
                rejected.append({"email": email, "reason": error})
            done += 1
            if done % 100000 == 0:
                print(f"    ... {done:,}/{len(emails):,}")
    
    return passed, rejected

# ─── Tool 2/3: API checks (parallel) ─────────────────────────────────────────
def check_disify(email: str) -> dict:
    try:
        url = f"https://disify.com/api/email/{email}"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            return json.loads(resp.read().decode())
    except Exception as e:
        return {"error": str(e)}

def check_mailcheck_ai(email: str) -> dict:
    try:
        url = f"https://api.mailcheck.ai/email/{email}"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            return json.loads(resp.read().decode())
    except Exception as e:
        return {"error": str(e)}

def check_domain_apis(domains_with_sample: list) -> dict:
    """Check all domains via Disify + Mailcheck.ai in parallel."""
    results = {}
    
    def check_one(domain, sample_email):
        d = check_disify(sample_email)
        m = check_mailcheck_ai(sample_email)
        return domain, d, m
    
    with ThreadPoolExecutor(max_workers=min(WORKERS, len(domains_with_sample))) as executor:
        futures = {executor.submit(check_one, d, e): d for d, e in domains_with_sample}
        for future in as_completed(futures):
            domain, disify, mailcheck = future.result()
            results[domain] = {"disify": disify, "mailcheck": mailcheck}
    
    return results

# ─── Tool 4: verify-email Python SMTP (parallel samples) ─────────────────────
def smtp_verify_samples(domain_samples: list) -> dict:
    """Run verify-email SMTP check on sample emails, parallelized."""
    results = {}
    
    def check_one(email):
        try:
            from verify_email import verify_email as ve
            valid = ve(email)
            return email, {"valid": valid, "error": None}
        except Exception as e:
            return email, {"valid": None, "error": str(e)}
    
    all_samples = [(d, e) for d, emails in domain_samples for e in emails]
    
    with ThreadPoolExecutor(max_workers=min(WORKERS, len(all_samples))) as executor:
        futures = {executor.submit(check_one, e): (d, e) for d, e in all_samples}
        for future in as_completed(futures):
            email, result = future.result()
            domain = email.split("@")[1]
            results.setdefault(domain, []).append({email: result})
    
    return results

# ─── Tool 5: deep-email-validator Node.js (batch) ────────────────────────────
def deep_validate_batch(emails: list) -> dict:
    script = """
    const { validate } = require('deep-email-validator');
    const emails = JSON.parse(process.argv[1]);
    async function run() {
        const results = {};
        const tasks = emails.map(async (email) => {
            try {
                const res = await validate({
                    email, validateRegex: true, validateMx: true,
                    validateTypo: true, validateDisposable: true, validateSMTP: true,
                });
                const validators = {};
                for (const [k, v] of Object.entries(res.validators)) {
                    validators[k] = {valid: v.valid, reason: v.reason || null};
                }
                results[email] = {valid: res.valid, validators, reason: res.reason || null};
            } catch(e) { results[email] = {valid: null, error: e.message}; }
        });
        await Promise.all(tasks);
        console.log(JSON.stringify(results));
    }
    run();
    """
    try:
        result = subprocess.run(
            ["node", "-e", script, json.dumps(emails)],
            capture_output=True, text=True, timeout=180,
            cwd="/Users/vedang/web3jobs/Web3-Jobs"
        )
        if result.returncode == 0 and result.stdout.strip():
            return json.loads(result.stdout.strip())
        return {"_error": result.stderr[:500]}
    except Exception as e:
        return {"_error": str(e)}

# ─── Tool 6: email-verify Node.js SMTP (batch) ───────────────────────────────
def email_verify_batch(emails: list) -> dict:
    script = """
    const verifier = require('email-verify');
    const emails = JSON.parse(process.argv[1]);
    async function checkOne(email) {
        return new Promise((resolve) => {
            const timeout = setTimeout(() => {
                resolve({email, success: null, error: 'timeout'});
            }, 15000);
            verifier.verify(email, {port: 25, timeout: 10000}, (err, info) => {
                clearTimeout(timeout);
                if (err) resolve({email, success: null, error: err.message || String(err)});
                else resolve({email, success: info.success, info: info.info || null});
            });
        });
    }
    async function run() {
        const results = {};
        const tasks = emails.map(async (email) => {
            const r = await checkOne(email);
            results[r.email] = r;
        });
        await Promise.all(tasks);
        console.log(JSON.stringify(results));
    }
    run();
    """
    try:
        result = subprocess.run(
            ["node", "-e", script, json.dumps(emails)],
            capture_output=True, text=True, timeout=180,
            cwd="/Users/vedang/web3jobs/Web3-Jobs"
        )
        if result.returncode == 0 and result.stdout.strip():
            return json.loads(result.stdout.strip())
        return {"_error": result.stderr[:500]}
    except Exception as e:
        return {"_error": str(e)}

# ─── MAIN ────────────────────────────────────────────────────────────────────
def main():
    print(f"📂 Loading emails...")
    with open(INPUT_FILE) as f:
        all_emails = json.load(f)
    print(f"  {len(all_emails):,} emails loaded")
    print(f"  Workers: {WORKERS}\n")

    domain_emails = defaultdict(list)
    for e in all_emails:
        domain_emails[e.split("@")[1]].append(e)
    domains_sorted = sorted(domain_emails.items(), key=lambda x: -len(x[1]))

    # ─── TOOL 1: email-validator (syntax, parallel, no network) ──────────────
    print("=" * 70)
    print("TOOL 1: email-validator — RFC syntax check (100 workers, no network)")
    print("=" * 70)
    t0 = time.time()
    ev_passed, ev_rejected = bulk_email_validator(all_emails)
    t1 = time.time()
    print(f"  ✅ Passed: {len(ev_passed):,}")
    print(f"  ❌ Rejected: {len(ev_rejected):,}")
    print(f"  ⏱️  {t1-t0:.1f}s")
    if ev_rejected:
        reasons = Counter(r["reason"].split(".")[0] for r in ev_rejected)
        for reason, count in reasons.most_common(10):
            print(f"    - {reason}: {count}")

    # ─── TOOL 2+3: Disify + Mailcheck.ai APIs (parallel, domain-level) ──────
    print(f"\n{'=' * 70}")
    print("TOOL 2+3: Disify + Mailcheck.ai APIs (domain-level, parallel)")
    print("=" * 70)
    t0 = time.time()
    domain_samples = [(d, es[0]) for d, es in domains_sorted]
    api_results = check_domain_apis(domain_samples)
    t1 = time.time()
    
    flagged_domains = set()
    for domain, info in api_results.items():
        d = info.get("disify", {})
        m = info.get("mailcheck", {})
        count = len(domain_emails[domain])
        
        flags = []
        if d.get("disposable"): flags.append("disposable(disify)")
        if m.get("disposable"): flags.append("disposable(mailcheck)")
        if m.get("spam"): flags.append("spam")
        if not d.get("dns"): flags.append("no-dns")
        
        typo = m.get("did_you_mean")
        
        if flags:
            flagged_domains.add(domain)
            print(f"  🚩 {domain} ({count:,}): {', '.join(flags)}")
        else:
            status_parts = []
            if d.get("format") is not None: status_parts.append(f"fmt={'✓' if d.get('format') else '✗'}")
            if d.get("dns") is not None: status_parts.append(f"dns={'✓' if d.get('dns') else '✗'}")
            if d.get("free") is not None: status_parts.append(f"free={'✓' if d.get('free') else '✗'}")
            if m.get("domain_age_in_days"): status_parts.append(f"age={m.get('domain_age_in_days')}d")
            print(f"  ✅ {domain} ({count:,}): {' '.join(status_parts)}" + (f" typo→{typo}" if typo else ""))
    
    print(f"  ⏱️  {t1-t0:.1f}s")

    # ─── TOOL 4: verify-email Python SMTP (parallel samples) ─────────────────
    print(f"\n{'=' * 70}")
    print("TOOL 4: verify-email (Python async SMTP) — 3 samples/domain, parallel")
    print("=" * 70)
    t0 = time.time()
    domain_sample_list = [(d, es[:3]) for d, es in domains_sorted[:15]]
    smtp_py_results = smtp_verify_samples(domain_sample_list)
    t1 = time.time()
    
    for domain, results_list in sorted(smtp_py_results.items(), key=lambda x: -len(domain_emails.get(x[0], []))):
        count = len(domain_emails[domain])
        statuses = []
        for r in results_list:
            for email, info in r.items():
                v = info.get("valid")
                e = info.get("error", "")
                statuses.append("✅" if v else ("❌" if v == False else f"❓({e[:30]})"))
        print(f"  {domain} ({count:,}): {' '.join(statuses)}")
    print(f"  ⏱️  {t1-t0:.1f}s")

    # ─── TOOL 5: deep-email-validator Node.js (batch, parallel) ──────────────
    print(f"\n{'=' * 70}")
    print("TOOL 5: deep-email-validator (Node.js) — 2 samples/domain, concurrent")
    print("=" * 70)
    t0 = time.time()
    all_node_samples = []
    for d, es in domains_sorted[:15]:
        all_node_samples.extend(es[:2])
    deep_results = deep_validate_batch(all_node_samples)
    t1 = time.time()
    
    if "_error" in deep_results:
        print(f"  ⚠️ Error: {deep_results['_error'][:300]}")
    else:
        for domain, _ in domains_sorted[:15]:
            sample_emails = domain_emails[domain][:2]
            count = len(domain_emails[domain])
            statuses = []
            for email in sample_emails:
                info = deep_results.get(email, {})
                if isinstance(info, dict):
                    valid = info.get("valid")
                    reason = info.get("reason", "")
                    validators = info.get("validators", {})
                    failed = [k for k, v in validators.items() if isinstance(v, dict) and not v.get("valid")]
                    status = f"✅" if valid else f"❌({reason or ','.join(failed)})"
                    statuses.append(status)
            print(f"  {domain} ({count:,}): {' '.join(statuses)}")
    print(f"  ⏱️  {t1-t0:.1f}s")

    # ─── TOOL 6: email-verify Node.js SMTP (batch, parallel) ─────────────────
    print(f"\n{'=' * 70}")
    print("TOOL 6: email-verify (Node.js SMTP) — 2 samples/domain, concurrent")
    print("=" * 70)
    t0 = time.time()
    ev_node_results = email_verify_batch(all_node_samples)
    t1 = time.time()
    
    if "_error" in ev_node_results:
        print(f"  ⚠️ Error: {ev_node_results['_error'][:300]}")
    else:
        for domain, _ in domains_sorted[:15]:
            sample_emails = domain_emails[domain][:2]
            count = len(domain_emails[domain])
            statuses = []
            for email in sample_emails:
                info = ev_node_results.get(email, {})
                if isinstance(info, dict):
                    success = info.get("success")
                    err = info.get("error", info.get("info", ""))
                    status = f"✅" if success else (f"❌" if success == False else f"❓({str(err)[:25]})")
                    statuses.append(status)
            print(f"  {domain} ({count:,}): {' '.join(statuses)}")
    print(f"  ⏱️  {t1-t0:.1f}s")

    # ─── FINAL AGGREGATION ───────────────────────────────────────────────────
    print(f"\n{'=' * 70}")
    print("FINAL AGGREGATION — All 6 tools combined")
    print("=" * 70)
    
    # Remove emails that failed email-validator syntax
    rejected_set = {r["email"] for r in ev_rejected}
    
    # Remove emails from flagged domains
    flagged_email_count = sum(len(domain_emails[d]) for d in flagged_domains)
    
    final = [e for e in all_emails if e not in rejected_set and e.split("@")[1] not in flagged_domains]
    
    print(f"\n  Input:                    {len(all_emails):,}")
    print(f"  ❌ email-validator fail:   {len(ev_rejected):,}")
    print(f"  ❌ Flagged domains:        {flagged_email_count:,} ({len(flagged_domains)} domains)")
    print(f"  ─────────────────────────────────")
    print(f"  ✅ FINAL VERIFIED:         {len(final):,}")
    
    final_domains = Counter(e.split("@")[1] for e in final)
    print(f"\n  📈 Top domains:")
    for domain, count in final_domains.most_common(15):
        print(f"    {domain:25s}: {count:>8,}")
    
    # Save
    with open(OUTPUT_FILE, "w") as f:
        json.dump(final, f, indent=2)
    print(f"\n  💾 {len(final):,} emails → {OUTPUT_FILE}")
    
    # Report
    report = {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S"),
        "tools": ["email-validator", "disify.com", "mailcheck.ai", "verify-email", "deep-email-validator", "email-verify"],
        "input": len(all_emails),
        "final": len(final),
        "email_validator_rejected": len(ev_rejected),
        "email_validator_samples": ev_rejected[:20],
        "flagged_domains": {d: len(domain_emails[d]) for d in flagged_domains},
        "domain_api": {d: {
            "disify_disposable": info["disify"].get("disposable"),
            "disify_dns": info["disify"].get("dns"),
            "mailcheck_disposable": info["mailcheck"].get("disposable"),
            "mailcheck_spam": info["mailcheck"].get("spam"),
            "mailcheck_age": info["mailcheck"].get("domain_age_in_days"),
            "mailcheck_typo": info["mailcheck"].get("did_you_mean"),
        } for d, info in api_results.items()},
        "smtp_python_samples": {d: [{e: r} for item in results for e, r in item.items()] for d, results in smtp_py_results.items()},
        "domains": dict(final_domains.most_common()),
    }
    with open(REPORT_FILE, "w") as f:
        json.dump(report, f, indent=2)
    print(f"  💾 Report → {REPORT_FILE}")

if __name__ == "__main__":
    main()
