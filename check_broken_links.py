#!/usr/bin/env python3
import os
import re

# Get all article filenames
articles = set()
for root, dirs, files in os.walk('content/articles'):
    for fn in files:
        if fn.endswith('.md'):
            articles.add(fn[:-3])

# Check for broken links
adir = 'content/articles'
broken_links = []

for root, dirs, files in os.walk(adir):
    for fn in sorted(files):
        if not fn.endswith('.md'):
            continue
        
        path = os.path.join(root, fn)
        try:
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
        except:
            continue
        
        # Find all [text](link) patterns
        links = re.findall(r'\]\(([^\)]+)\)', content)
        
        for link in links:
            # Only check internal links (not http/https/file://)
            if link.startswith(('http', 'file:', '#')):
                continue
            
            # Extract the article name
            article = link.split('#')[0].replace('.md', '').strip()
            
            if article and article not in articles:
                broken_links.append((fn, link, article))

print(f"🔍 Found {len(broken_links)} broken internal links")
if broken_links:
    print("\nBroken links (first 20):")
    for fname, link, article in broken_links[:20]:
        print(f"  {fname} → {link} (missing: {article})")
    if len(broken_links) > 20:
        print(f"\n  ... and {len(broken_links) - 20} more")
else:
    print("✅ No broken links found!")
