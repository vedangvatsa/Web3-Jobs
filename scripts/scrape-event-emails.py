#!/usr/bin/env python3
"""
Scrape contact emails from event websites.
Checks homepage + /contact, /sponsor, /partners, /about subpages.
Outputs JSON: {url, name, emails[]}
"""
import json, re, subprocess, time, sys
from urllib.parse import urlparse, urljoin

EMAIL_RE = re.compile(r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}', re.I)

# Domains to exclude entirely (noise/system emails)
EXCLUDE_DOMAINS = {
    'sentry.io', 'sentry.wixpress.com', 'sentry-next.wixpress.com',
    'wixpress.com', 'example.com', 'email.com', 'domain.com',
    'test.com', 'mailchimp.com', 'sendgrid.net', 'amazonses.com',
    'ingest.us.sentry.io', 'lu.ma', 'luma.com', 'meetup.com',
    'ethereum.org', 'schema.org', 'w3.org',
}

# Prefixes to exclude
EXCLUDE_PREFIXES = {
    'noreply', 'no-reply', 'donotreply', 'privacy', 'legal', 'security',
    'abuse', 'postmaster', 'mailer-daemon', 'bounce', 'unsubscribe',
}

# Placeholder emails to exclude exactly
EXCLUDE_EXACT = {'you@email.com', 'user@domain.com', 'name@example.com', 'email@example.com'}

CONTACT_PATHS = ['', '/contact', '/contact-us', '/sponsor', '/sponsors', '/partners',
                 '/about', '/team', '/media', '/press', '/advertise', '/promote']

def is_excluded(email):
    email_low = email.lower().strip('.')
    if email_low in EXCLUDE_EXACT:
        return True
    if '@' not in email_low:
        return True
    local, domain = email_low.split('@', 1)
    # Sentry/system hash-like local parts (long hex strings)
    if len(local) > 30 and all(c in '0123456789abcdef' for c in local):
        return True
    if domain in EXCLUDE_DOMAINS or any(domain.endswith('.' + d) for d in EXCLUDE_DOMAINS):
        return True
    if local in EXCLUDE_PREFIXES:
        return True
    if email_low.endswith(('.png', '.jpg', '.svg', '.gif', '.css', '.js')):
        return True
    return False

def fetch_page(url, timeout=10):
    """Fetch a URL and return text content."""
    try:
        r = subprocess.run(
            ['curl', '-s', '-L', '--max-time', str(timeout),
             '-H', 'User-Agent: Mozilla/5.0 (compatible; EventBot/1.0)',
             '-H', 'Accept: text/html',
             '--max-filesize', '500000',  # 500KB max
             url],
            capture_output=True, text=True, timeout=timeout+2
        )
        return r.stdout
    except:
        return ''

def get_emails_from_page(html):
    emails = set()
    for m in EMAIL_RE.finditer(html):
        e = m.group(0).lower().strip('.')
        if not is_excluded(e) and '.' in e.split('@')[1]:
            emails.add(e)
    return emails

def scrape_event(event_name, base_url):
    """Scrape an event site for all contact emails."""
    parsed = urlparse(base_url)
    base = f"{parsed.scheme}://{parsed.netloc}"
    
    all_emails = set()
    
    for path in CONTACT_PATHS:
        url = base + path
        html = fetch_page(url)
        if not html:
            continue
        emails = get_emails_from_page(html)
        all_emails.update(emails)
        
        # If we already found emails on homepage, also check contact page
        if path == '' and emails:
            time.sleep(0.3)
            continue
        
        if emails:
            print(f"    Found on {path}: {emails}", flush=True)
        
        time.sleep(0.3)
    
    return list(all_emails)


# Load events
with open('content/curated-events.json') as f:
    curated = json.load(f)
with open('content/events-cache.json') as f:
    cached = json.load(f)

all_events = curated + cached

# Deduplicate by website domain
processed_domains = set()
targets = []

for e in all_events:
    url = e.get('website') or e.get('url', '')
    if not url:
        continue
    parsed = urlparse(url)
    domain = parsed.netloc.lower().replace('www.', '')
    # Skip aggregators
    if any(x in domain for x in ['lu.ma', 'meetup.com', 'ethereum.org', 'luma.com']):
        continue
    if domain in processed_domains:
        continue
    processed_domains.add(domain)
    targets.append({'name': e['name'], 'url': url, 'domain': domain, 'event': e})

print(f"Scraping {len(targets)} unique event websites...", flush=True)
print()

results = []
for i, t in enumerate(targets):
    print(f"[{i+1}/{len(targets)}] {t['name']}", flush=True)
    emails = scrape_event(t['name'], t['url'])
    if emails:
        print(f"  ✅ Found: {emails}", flush=True)
        results.append({
            'name': t['name'],
            'url': t['url'],
            'emails': emails,
            'event': t['event']
        })
    else:
        print(f"  ❌ No emails found", flush=True)
    print()

# Save results
with open('scripts/event-emails.json', 'w') as f:
    json.dump(results, f, indent=2)

print(f"\n=== DONE ===")
print(f"Events with emails: {len(results)} / {len(targets)}")
total_emails = sum(len(r['emails']) for r in results)
print(f"Total emails found: {total_emails}")
