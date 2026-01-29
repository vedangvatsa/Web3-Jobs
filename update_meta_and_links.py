#!/usr/bin/env python3
import os
import re
import sys

# Settings
ADIR = 'content/articles'
EXCLUDE = {'cbdc.md'}  # files to never modify

# Determine high-value articles (simple heuristic: first 50 alphabetically)
all_files = sorted([f for f in os.listdir(ADIR) if f.endswith('.md') and f not in EXCLUDE])
high_value = all_files[:50]
high_value_links = [f"[{os.path.splitext(f)[0].replace('-', ' ').title()}]({os.path.splitext(f)[0]})" for f in high_value]
related_section = "\n## Related Articles\n\n" + "\n".join([f"- {link}" for link in high_value_links]) + "\n"

updated = 0
meta_updated = 0
links_added = 0

for fn in all_files:
    if fn in EXCLUDE:
        continue
    path = os.path.join(ADIR, fn)
    try:
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading {fn}: {e}", file=sys.stderr)
        continue
    
    # Split frontmatter
    parts = re.split(r'^(---\s*$)', content, flags=re.MULTILINE)
    # parts will be ['', '---', frontmatter, '---', rest...] if frontmatter exists
    if len(parts) < 5:
        # No proper frontmatter, skip
        continue
    _, delim1, front, delim2, rest = parts[:5]
    # Ensure frontmatter ends with newline
    front = front.rstrip('\n')
    
    # Parse title
    title_match = re.search(r'^title:\s*"?([^"\n]+)"?', front, flags=re.MULTILINE)
    title = title_match.group(1).strip() if title_match else os.path.splitext(fn)[0].replace('-', ' ')
    
    # Check description
    desc_match = re.search(r'^description:\s*"?([^"\n]*)"?', front, flags=re.MULTILINE)
    if desc_match:
        desc = desc_match.group(1).strip()
    else:
        desc = ''
    # Determine if description is missing or generic (empty or contains placeholder words)
    generic = not desc or any(word in desc.lower() for word in ['todo', 'placeholder', 'generic', 'description'])
    if generic:
        new_desc = f"{title} – A comprehensive guide for Web3 professionals covering key concepts, best practices, and career insights."
        # Replace or add description line
        if desc_match:
            front = re.sub(r'^description:.*$', f'description: "{new_desc}"', front, flags=re.MULTILINE)
        else:
            front += f"\ndescription: \"{new_desc}\""
        meta_updated += 1
    
    # Add related links if not already present
    if 'Related Articles' not in rest:
        # Insert before final closing if any, else at end
        new_rest = rest.rstrip() + related_section
        links_added += 1
    else:
        new_rest = rest
    
    new_content = f"{delim1}\n{front}\n{delim2}\n{new_rest}"
    if new_content != content:
        try:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            updated += 1
        except Exception as e:
            print(f"Error writing {fn}: {e}", file=sys.stderr)

print(f"\n✅ Processed {len(all_files)} files (excluding {len(EXCLUDE)}).")
print(f"Meta descriptions updated: {meta_updated}")
print(f"Related links sections added: {links_added}")
print(f"Total files modified: {updated}")
