#!/usr/bin/env python3
"""
Deep Luma Event Scraper:
Extracts host profile URLs, external website links, social media handles (Twitter/X, LinkedIn, Instagram),
and visits host websites / external links to extract contact email addresses.
"""

import json, re, subprocess, time, sys
from urllib.parse import urlparse

EMAIL_RE = re.compile(r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}', re.I)

EXCLUDE_DOMAINS = {
    'sentry.io', 'sentry.wixpress.com', 'sentry-next.wixpress.com',
    'wixpress.com', 'example.com', 'email.com', 'domain.com',
    'test.com', 'mailchimp.com', 'sendgrid.net', 'amazonses.com',
    'ingest.us.sentry.io', 'lu.ma', 'luma.com', 'meetup.com',
    'ethereum.org', 'schema.org', 'w3.org', 'google.com', 'googleapis.com',
    'gstatic.com', 'lumacdn.com', 'meetupstatic.com', 'tiktok.com', 'venmo.com',
    'cursor.com', 'staatslabor.ch'
}

EXCLUDE_PREFIXES = {
    'noreply', 'no-reply', 'donotreply', 'privacy', 'legal', 'security',
    'abuse', 'postmaster', 'mailer-daemon', 'bounce', 'unsubscribe',
    'webmaster', 'admin', 'press'
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
    if any(e.endswith(ext) for ext in ['.webp', '.png', '.jpg', '.jpeg', '.svg', '.gif']):
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
    return False

def fetch(url, timeout=10):
    try:
        r = subprocess.run(
            ['curl', '-s', '-L', '--max-time', str(timeout),
             '-H', 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
             '-H', 'Accept: text/html',
             url],
            capture_output=True, text=True, timeout=timeout+2
        )
        return r.stdout
    except:
        return ''

def get_emails_from_text(html):
    emails = set()
    for m in EMAIL_RE.finditer(html):
        e = m.group(0).lower().strip('.')
        if not is_excluded(e) and '.' in e.split('@')[1]:
            emails.add(e)
    return emails

def scrape_website(base_url):
    parsed = urlparse(base_url)
    base = f"{parsed.scheme}://{parsed.netloc}"
    found = set()
    for path in CONTACT_PATHS:
        html = fetch(base + path)
        if html:
            found.update(get_emails_from_text(html))
        if found and path == '':
            # check contact page too if found on homepage
            continue
        time.sleep(0.2)
    return list(found)

def parse_luma_event(e):
    url = e.get('url') or e.get('website')
    if not url or 'lu.ma' not in url:
        return None
    
    html = fetch(url)
    if not html:
        return None

    emails = set(get_emails_from_text(html))

    # Extract all external website links inside Luma page
    external_links = set()
    for m in re.finditer(r'href=["\'](https?://[^"\']+)["\']', html):
        link = m.group(1)
        # Strip utm parameters
        clean_link = link.split('?')[0]
        parsed = urlparse(clean_link)
        domain = parsed.netloc.lower().replace('www.', '')
        
        if domain and domain not in EXCLUDE_DOMAINS and not any(d in domain for d in ['lu.ma', 'lumacdn.com', 'twitter.com', 'x.com', 'linkedin.com', 'instagram.com', 'youtube.com', 'facebook.com', 't.me', 'discord.gg', 'discord.com']):
            external_links.add(f"{parsed.scheme}://{parsed.netloc}")

    # Crawl external organizer links for emails
    for site in external_links:
        print(f"    [Luma Organizer Site] Scraping {site}...", flush=True)
        site_emails = scrape_website(site)
        if site_emails:
            print(f"      ✅ Found on organizer site: {site_emails}", flush=True)
            emails.update(site_emails)

    return {
        'name': e['name'],
        'url': url,
        'emails': list(emails),
        'external_sites': list(external_links)
    }

def main():
    with open('content/curated-events.json') as f:
        curated = json.load(f)
    with open('content/events-cache.json') as f:
        cached = json.load(f)

    all_events = curated + cached
    luma_events = [e for e in all_events if 'lu.ma' in (e.get('url','') + e.get('website',''))]

    print(f"Processing {len(luma_events)} Luma events...", flush=True)

    results = []
    for i, e in enumerate(luma_events):
        print(f"\n[{i+1}/{len(luma_events)}] {e['name']} ({e.get('url')})", flush=True)
        res = parse_luma_event(e)
        if res and res['emails']:
            print(f"  ✅ TOTAL EMAILS FOR EVENT: {res['emails']}", flush=True)
            results.append(res)
        else:
            print(f"  ❌ No emails found for this Luma event", flush=True)

    with open('scripts/luma-emails.json', 'w') as f:
        json.dump(results, f, indent=2)

    print(f"\n\n=== LUMA SCRAPING DONE ===")
    print(f"Luma Events with emails: {len(results)} / {len(luma_events)}")
    print(f"Total emails: {sum(len(r['emails']) for r in results)}")

if __name__ == '__main__':
    main()
PYEOF
