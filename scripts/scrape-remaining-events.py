#!/usr/bin/env python3
"""
Scrape remaining own-domain events + luma event pages for organizer emails.
"""
import json, re, subprocess, time
from urllib.parse import urlparse, urljoin

EMAIL_RE = re.compile(r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}', re.I)

EXCLUDE_DOMAINS = {
    'sentry.io', 'sentry.wixpress.com', 'sentry-next.wixpress.com',
    'wixpress.com', 'example.com', 'email.com', 'domain.com',
    'test.com', 'mailchimp.com', 'sendgrid.net', 'amazonses.com',
    'ingest.us.sentry.io', 'lu.ma', 'luma.com', 'meetup.com',
    'ethereum.org', 'schema.org', 'w3.org', 'gmail.com', 'yahoo.com',
    'hotmail.com', 'outlook.com',
}
EXCLUDE_PREFIXES = {
    'noreply', 'no-reply', 'donotreply', 'privacy', 'legal', 'security',
    'abuse', 'postmaster', 'mailer-daemon', 'bounce', 'unsubscribe',
    'webmaster', 'admin',
}
EXCLUDE_EXACT = {
    'you@email.com', 'user@domain.com', 'name@example.com', 'email@example.com',
    'you@company.com', 'joe@gmail.com', 'email@address.com',
    'your@email.com', 'example@email.com',
}

CONTACT_PATHS = ['', '/contact', '/contact-us', '/sponsor', '/sponsors', '/partners',
                 '/about', '/team', '/media', '/press', '/advertise', '/promote']

def is_excluded(email):
    e = email.lower().strip('.')
    if e in EXCLUDE_EXACT:
        return True
    if '@' not in e:
        return True
    local, domain = e.split('@', 1)
    if len(local) > 30 and all(c in '0123456789abcdef' for c in local):
        return True
    if domain in EXCLUDE_DOMAINS or any(domain.endswith('.' + d) for d in EXCLUDE_DOMAINS):
        return True
    if local in EXCLUDE_PREFIXES:
        return True
    if e.endswith(('.png', '.jpg', '.svg', '.gif', '.css', '.js')):
        return True
    return False

def fetch(url, timeout=12):
    try:
        r = subprocess.run(
            ['curl', '-s', '-L', '--max-time', str(timeout),
             '-H', 'User-Agent: Mozilla/5.0 (compatible; EventBot/1.0)',
             '-H', 'Accept: text/html',
             '--max-filesize', '500000',
             url],
            capture_output=True, text=True, timeout=timeout+3
        )
        return r.stdout
    except:
        return ''

def get_emails(html):
    emails = set()
    for m in EMAIL_RE.finditer(html):
        e = m.group(0).lower().strip('.')
        if not is_excluded(e) and '.' in e.split('@')[1]:
            emails.add(e)
    return emails

def scrape_own_domain(base_url):
    parsed = urlparse(base_url)
    base = f"{parsed.scheme}://{parsed.netloc}"
    all_emails = set()
    for path in CONTACT_PATHS:
        html = fetch(base + path)
        if html:
            all_emails.update(get_emails(html))
        time.sleep(0.2)
    return list(all_emails)

def scrape_luma_page(luma_url):
    """Scrape luma event page - find organizer website then scrape that."""
    html = fetch(luma_url)
    if not html:
        return [], None
    
    # Get direct emails from luma page
    direct_emails = get_emails(html)
    
    # Try to find organizer website link from luma page
    # Luma pages often have organizer profile links
    organizer_site = None
    # Look for links that aren't lu.ma or social media
    site_pattern = re.compile(r'href=["\']((https?://(?!lu\.ma|twitter\.com|x\.com|linkedin\.com|instagram\.com|facebook\.com|t\.me|discord\.gg|discord\.com|youtube\.com)[^"\']+))["\']', re.I)
    for m in site_pattern.finditer(html):
        url = m.group(1)
        parsed = urlparse(url)
        domain = parsed.netloc.lower().replace('www.', '')
        if domain and '.' in domain and domain not in EXCLUDE_DOMAINS:
            organizer_site = f"{parsed.scheme}://{parsed.netloc}"
            break
    
    return list(direct_emails), organizer_site

# Load data
with open('content/curated-events.json') as f:
    curated = json.load(f)
with open('content/events-cache.json') as f:
    cached = json.load(f)

all_events = curated + cached

# Load already scraped
with open('scripts/event-emails.json') as f:
    already_done = json.load(f)
already_domains = set(urlparse(r['url']).netloc.lower().replace('www.','') for r in already_done)

# Build targets
own_domain_targets = []
luma_targets = []
seen_domains = set()

for e in all_events:
    url = e.get('url') or e.get('website') or ''
    if not url:
        continue
    domain = urlparse(url).netloc.lower().replace('www.','')
    
    if 'lu.ma' in domain or 'meetup.com' in domain:
        luma_targets.append(e)
    elif domain not in already_domains and domain not in seen_domains:
        seen_domains.add(domain)
        own_domain_targets.append(e)

print(f"Own-domain targets: {len(own_domain_targets)}")
print(f"Luma/meetup targets: {len(luma_targets)}")

results = list(already_done)  # start with existing

# --- Scrape own-domain events ---
print(f"\n=== SCRAPING {len(own_domain_targets)} OWN-DOMAIN EVENTS ===\n")
for i, e in enumerate(own_domain_targets):
    print(f"[{i+1}/{len(own_domain_targets)}] {e['name']}", flush=True)
    url = e.get('url') or e.get('website','')
    emails = scrape_own_domain(url)
    if emails:
        print(f"  ✅ {emails}", flush=True)
        results.append({'name': e['name'], 'url': url, 'emails': emails, 'event': e})
    else:
        print(f"  ❌ No emails", flush=True)
    print()

# --- Scrape luma events ---
print(f"\n=== SCRAPING {len(luma_targets)} LUMA/MEETUP EVENTS ===\n")
for i, e in enumerate(luma_targets):
    print(f"[{i+1}/{len(luma_targets)}] {e['name']}", flush=True)
    url = e.get('url','')
    
    direct_emails, organizer_site = scrape_luma_page(url)
    all_emails = set(direct_emails)
    
    if organizer_site:
        print(f"  → Found organizer site: {organizer_site}", flush=True)
        site_emails = scrape_own_domain(organizer_site)
        all_emails.update(site_emails)
    
    all_emails = list(all_emails)
    if all_emails:
        print(f"  ✅ {all_emails}", flush=True)
        results.append({'name': e['name'], 'url': url, 'emails': all_emails, 'event': e})
    else:
        print(f"  ❌ No emails", flush=True)
    print()
    time.sleep(0.3)

# Save updated results
with open('scripts/event-emails-full.json', 'w') as f:
    json.dump(results, f, indent=2)

print(f"\n=== DONE ===")
print(f"Total events with emails: {len(results)}")
print(f"Total emails: {sum(len(r['emails']) for r in results)}")
