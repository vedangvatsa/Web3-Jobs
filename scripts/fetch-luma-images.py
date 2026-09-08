#!/usr/bin/env python3
"""
Scrape Luma cover images for all 135 events missing coverImage in curated-events.json and events-cache.json.
Extract og:image / event-social / lumacdn cover image from Luma page.
"""

import json, re, subprocess, time

def fetch_luma_cover_image(url, timeout=10):
    if not url or 'lu.ma' not in url:
        return None
    try:
        r = subprocess.run(
            ['curl', '-s', '-L', '--max-time', str(timeout),
             '-H', 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
             url],
            capture_output=True, text=True, timeout=timeout+2
        )
        html = r.stdout
        
        # 1. Try og:image meta tag first
        og_match = re.search(r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)["\']', html, re.I)
        if not og_match:
            og_match = re.search(r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:image["\']', html, re.I)
        
        if og_match and 'lumacdn.com' in og_match.group(1):
            return og_match.group(1)
        
        # 2. Try event-social lumacdn image
        social_match = re.search(r'https://images\.lumacdn\.com/[^"\'\s]+/event-social/[^"\'\s]+', html)
        if social_match:
            return social_match.group(0)
            
        # 3. Try uploads image
        upload_match = re.search(r'https://images\.lumacdn\.com/[^"\'\s]+/uploads/[^"\'\s]+', html)
        if upload_match:
            return upload_match.group(0)
            
        return None
    except Exception as e:
        return None

def main():
    print("Loading events files...")
    
    with open('content/curated-events.json') as f:
        curated = json.load(f)
    with open('content/events-cache.json') as f:
        cached = json.load(f)

    updated_curated = 0
    updated_cached = 0

    print("Checking curated-events.json...")
    for i, e in enumerate(curated):
        if not e.get('coverImage') and 'lu.ma' in (e.get('url','') + e.get('website','')):
            url = e.get('url') or e.get('website')
            print(f"[{i+1}/{len(curated)}] Fetching cover image for curated event: {e['name']} ({url})...")
            img = fetch_luma_cover_image(url)
            if img:
                e['coverImage'] = img
                updated_curated += 1
                print(f"  ✅ Found: {img}")
            else:
                print("  ❌ No image found")
            time.sleep(0.2)

    print("\nChecking events-cache.json...")
    for i, e in enumerate(cached):
        if not e.get('coverImage') and 'lu.ma' in (e.get('url','') + e.get('website','')):
            url = e.get('url') or e.get('website')
            print(f"[{i+1}/{len(cached)}] Fetching cover image for cached event: {e['name']} ({url})...")
            img = fetch_luma_cover_image(url)
            if img:
                e['coverImage'] = img
                updated_cached += 1
                print(f"  ✅ Found: {img}")
            else:
                print("  ❌ No image found")
            time.sleep(0.2)

    print(f"\nWriting updated files... (curated +{updated_curated}, cached +{updated_cached})")
    with open('content/curated-events.json', 'w') as f:
        json.dump(curated, f, indent=2)
    with open('content/events-cache.json', 'w') as f:
        json.dump(cached, f, indent=2)

    print("Done!")

if __name__ == '__main__':
    main()
PYEOF
