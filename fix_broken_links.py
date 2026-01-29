#!/usr/bin/env python3
import os
import re

# Get all article filenames (with and without slashes)
articles = {}
for root, dirs, files in os.walk('content/articles'):
    for fn in files:
        if fn.endswith('.md'):
            base = fn[:-3]
            articles[base] = True
            articles[f"/{base}"] = True

# Now fix broken links in articles
adir = 'content/articles'
fixed_files = 0
total_replacements = 0

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
        
        original = content
        
        # Find all [text](link) patterns with broken paths
        # Links starting with / that don't end in .md and aren't in articles set
        def fix_link(match):
            link = match.group(1)
            
            # Don't touch http/https links
            if link.startswith(('http', 'file:', '#')):
                return match.group(0)
            
            # If it starts with /, it might be a page route
            if link.startswith('/'):
                # Check if it's an article reference
                article_name = link[1:].split('#')[0]  # Remove leading / and anchor
                if article_name in articles or f"/{article_name}" in articles:
                    return match.group(0)  # Already correct
                # Otherwise leave it (it's an app page)
                return match.group(0)
            
            # For non-slash links, try to match article
            article_base = link.split('#')[0].replace('.md', '')
            if article_base in articles:
                # Already correct relative format
                return match.group(0)
            
            # Check if adding slash helps
            if f"/{article_base}" in articles:
                anchor = '#' + link.split('#')[1] if '#' in link else ''
                return f"]({article_base}{anchor})"
            
            return match.group(0)
        
        # Fix internal link format
        content = re.sub(r'\]\(([^\)]+)\)', fix_link, content)
        
        if content != original:
            try:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(content)
                fixed_files += 1
            except:
                pass

print(f"✅ Fixed broken links in {fixed_files} files")

# Now identify links to non-existent app pages (these may be 404s if pages don't exist)
app_links = set()
app_pages = {}

for root, dirs, files in os.walk(adir):
    for fn in files:
        if not fn.endswith('.md'):
            continue
        path = os.path.join(root, fn)
        try:
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
        except:
            continue
        
        links = re.findall(r'\]\(/([^\)]+)\)', content)
        for link in links:
            base = link.split('#')[0]
            if base not in articles:
                app_links.add(base)
                if base not in app_pages:
                    app_pages[base] = []
                app_pages[base].append(fn)

print(f"\n📋 Found {len(app_links)} references to non-article pages:")
for page in sorted(app_links)[:20]:
    count = len(app_pages[page])
    refs = app_pages[page][0]
    print(f"  /{page} (referenced in {count} articles)")
