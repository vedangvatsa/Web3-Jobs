#!/usr/bin/env python3
import os
import re

adir = 'content/articles'
updated_files = 0

# Patterns to update - only update contextually relevant 2025 to 2026
update_patterns = [
    # "by 2025" → "by 2026" for forward-looking statements
    (r'\bby 2025\b', 'by 2026'),
    # "in 2025" → "in 2026" for future year references  
    (r'\bin 2025\b(?!\s+fiscal|\s+report)', 'in 2026'),
    # "for 2025" → "for 2026"
    (r'\bfor 2025\b', 'for 2026'),
    # "2025-2026" → "2026-2027" (fiscal year ranges)
    (r'\b2025-2026\b', '2026-2027'),
    # Article titles with "2025" that are forward-looking
    (r'-for-2025\.md$', '-for-2026.md'),
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
        
        # Update 2025 references (but be careful with dates in past fiscal contexts)
        # Only update forward-looking references
        
        # Skip historical/past fiscal year references
        if 'fiscal year 2023-24' in content or '2023-24 fiscal' in content:
            # This is past data, don't change unrelated 2025 refs
            pass
        
        # Update forward-looking patterns
        content = re.sub(r'\bby 2025\b', 'by 2026', content)
        content = re.sub(r'\bin 2025\b', 'in 2026', content)
        content = re.sub(r'\bfor 2025\b', 'for 2026', content)
        
        if content != original:
            try:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(content)
                updated_files += 1
                print(f"✓ {fn}")
            except Exception as e:
                print(f"✗ {fn}: {e}")

print(f"\n✅ Updated {updated_files} files with 2025→2026 references")

# Also check for article titles that need year updates
rename_needed = []
for root, dirs, files in os.walk(adir):
    for fn in files:
        if '-for-2025.md' in fn or '-2025.md' in fn:
            # Check if it's forward-looking
            path = os.path.join(root, fn)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                # If it says "2025" in the title/description and is forward-looking
                if ('key-trends' in fn or 'predictions' in fn or 'outlook' in fn or 
                    'future' in fn or 'big-ideas' in fn):
                    rename_needed.append((fn, fn.replace('2025', '2026')))
            except:
                pass

if rename_needed:
    print(f"\n📋 Articles that might need filename updates:")
    for old, new in rename_needed[:10]:
        print(f"  {old} → {new}")
