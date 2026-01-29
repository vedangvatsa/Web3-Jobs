#!/usr/bin/env python3
import os
import re

# Get all article names (without path)
articles = {}
for root, dirs, files in os.walk('content/articles'):
    for fn in files:
        if fn.endswith('.md'):
            base = fn[:-3]
            articles[base] = True

adir = 'content/articles'
fixed_count = 0
fix_patterns = [
    # /content/articles/ARTICLE.md → ARTICLE
    (r'\]\(/content/articles/([^/\)]+)\.md([^\)]*)\)', r'](\1\2)'),
    # /content/articles/ARTICLE → ARTICLE
    (r'\]\(/content/articles/([^/\)]+)([^\)]*)\)', r'](\1\2)'),
    # /ARTICLE → ARTICLE
    (r'\]\(/([a-z0-9\-]+)([^\)]*)\)', lambda m: f']({m.group(1)}{m.group(2)})' if m.group(1) in articles else m.group(0)),
]

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
        
        # Apply fixes
        content = re.sub(r'\]\(/content/articles/([^/\)]+)\.md([^\)]*)\)', r'](\1\2)', content)
        content = re.sub(r'\]\(/content/articles/([^/\)]+)([^\)]*)\)', r'](\1\2)', content)
        
        if content != original:
            try:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(content)
                fixed_count += 1
                print(f"✓ {fn}")
            except Exception as e:
                print(f"✗ {fn}: {e}")

print(f"\n✅ Fixed {fixed_count} files with /content/articles/ path references")
