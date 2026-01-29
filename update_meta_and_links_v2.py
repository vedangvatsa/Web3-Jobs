#!/usr/bin/env python3
import os
import re
import sys

ADIR = 'content/articles'
EXCLUDE = {'cbdc.md'}  # never modify

# Gather all markdown files sorted alphabetically
all_files = sorted([f for f in os.listdir(ADIR) if f.endswith('.md') and f not in EXCLUDE])

# Define high-value set: first 50 files alphabetically
HIGH_VALUE = set(all_files[:50])

# Helper to extract title from frontmatter
def get_title(front):
    m = re.search(r'^title:\s*"?([^"\n]+)"?', front, flags=re.MULTILINE)
    if m:
        return m.group(1).strip()
    return None

# Build slug->title map for linking
slug_to_title = {}
for fn in all_files:
    path = os.path.join(ADIR, fn)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    parts = re.split(r'^(---\s*$)', content, flags=re.MULTILINE)
    if len(parts) < 5:
        continue
    _, delim1, front, delim2, _ = parts[:5]
    title = get_title(front) or os.path.splitext(fn)[0].replace('-', ' ').title()
    slug = os.path.splitext(fn)[0]
    slug_to_title[slug] = title

# Prepare related links for high-value articles (exclude self)
high_links = {}
for fn in HIGH_VALUE:
    slug = os.path.splitext(fn)[0]
    links = []
    for other_slug, title in slug_to_title.items():
        if other_slug == slug:
            continue
        # limit to 5 links per article for brevity
        if len(links) >= 5:
            break
        if other_slug in [os.path.splitext(f)[0] for f in HIGH_VALUE]:
            links.append(f"- [{title}]({other_slug})")
    high_links[slug] = "\n".join(links)

meta_updated = 0
links_added = 0
links_removed = 0
files_modified = 0

for fn in all_files:
    path = os.path.join(ADIR, fn)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    parts = re.split(r'^(---\s*$)', content, flags=re.MULTILINE)
    if len(parts) < 5:
        continue
    _, delim1, front, delim2, body = parts[:5]
    original_front = front
    original_body = body
    changed = False

    # ---- Meta description update ----
    desc_match = re.search(r'^description:\s*"?([^"\n]*)"?', front, flags=re.MULTILINE)
    generic = False
    if desc_match:
        desc = desc_match.group(1).strip()
        if not desc or any(word in desc.lower() for word in ['todo', 'placeholder', 'generic', 'description']):
            generic = True
    else:
        generic = True
    if generic:
        title = get_title(front) or os.path.splitext(fn)[0].replace('-', ' ').title()
        new_desc = f"{title} – A comprehensive guide for Web3 professionals covering key concepts, best practices, and career insights."
        if desc_match:
            front = re.sub(r'^description:.*$', f'description: "{new_desc}"', front, flags=re.MULTILINE)
        else:
            front = front.rstrip('\n') + f"\ndescription: \"{new_desc}\""
        meta_updated += 1
        changed = True

    # ---- Related Articles section ----
    slug = os.path.splitext(fn)[0]
    has_related = re.search(r'^##\s+Related Articles', body, flags=re.MULTILINE) is not None
    if fn in HIGH_VALUE:
        # Ensure section exists
        if not has_related:
            # Append section with links (if any)
            links_md = high_links.get(slug, '')
            if links_md:
                body = body.rstrip('\n') + "\n\n## Related Articles\n\n" + links_md + "\n"
                links_added += 1
                changed = True
    else:
        # Remove any existing related section
        if has_related:
            # Remove from the heading to the next heading of same level or end of file
            body = re.sub(r'(?s)^##\s+Related Articles.*?(?=^##\s|\Z)', '', body, flags=re.MULTILINE)
            links_removed += 1
            changed = True

    if changed:
        new_content = f"{delim1}\n{front}\n{delim2}\n{body}"
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        files_modified += 1

print(f"\n✅ Processed {len(all_files)} files (excluding {len(EXCLUDE)}).")
print(f"Meta descriptions updated: {meta_updated}")
print(f"Related sections added: {links_added}")
print(f"Related sections removed: {links_removed}")
print(f"Total files modified: {files_modified}")
