#!/usr/bin/env python3
import os
import re
import sys

ADIR = 'content/articles'
EXCLUDE = {'cbdc.md'}  # never modify this file

# Helper to extract frontmatter title and description
def parse_frontmatter(text):
    # Split frontmatter using first two '---' delimiters
    parts = re.split(r'^(---\s*$)', text, flags=re.MULTILINE)
    if len(parts) < 5:
        return None, None, None, text
    _, delim1, front, delim2, body = parts[:5]
    title_match = re.search(r'^title:\s*"?([^"\n]+)"?', front, flags=re.MULTILINE)
    desc_match = re.search(r'^description:\s*"?([^"\n]*)"?', front, flags=re.MULTILINE)
    title = title_match.group(1).strip() if title_match else None
    description = desc_match.group(1).strip() if desc_match else None
    return title, description, (delim1, front, delim2), body

# Gather all markdown files
all_files = [f for f in os.listdir(ADIR) if f.endswith('.md') and f not in EXCLUDE]

# Compute word count for each file (excluding frontmatter) to rank high-value articles
word_counts = {}
for fn in all_files:
    path = os.path.join(ADIR, fn)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    title, _, _, body = parse_frontmatter(content)
    # Count words in body (strip markdown symbols for rough estimate)
    words = re.findall(r"\b\w+\b", body)
    word_counts[fn] = len(words)

# Select top 50 high-value articles by word count
high_value = sorted(word_counts, key=word_counts.get, reverse=True)[:50]
high_value_set = set(high_value)

# Build slug->title map for linking
slug_to_title = {}
for fn in all_files:
    slug = os.path.splitext(fn)[0]
    path = os.path.join(ADIR, fn)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    title, _, _, _ = parse_frontmatter(content)
    if not title:
        title = slug.replace('-', ' ').title()
    slug_to_title[slug] = title

# Prepare related links for each high-value article (up to 5 other high-value links)
related_links = {}
for fn in high_value:
    slug = os.path.splitext(fn)[0]
    links = []
    for other in high_value:
        if other == fn:
            continue
        other_slug = os.path.splitext(other)[0]
        other_title = slug_to_title.get(other_slug, other_slug.replace('-', ' ').title())
        links.append(f"- [{other_title}]({other_slug})")
        if len(links) >= 5:
            break
    related_links[slug] = "\n".join(links)

meta_updated = 0
links_added = 0
files_modified = 0

for fn in all_files:
    path = os.path.join(ADIR, fn)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    title, description, fm_parts, body = parse_frontmatter(content)
    if not fm_parts:
        continue  # skip malformed files
    delim1, front, delim2 = fm_parts
    changed = False
    # ---- Update meta description if missing or generic ----
    generic = False
    if description:
        if not description or any(word in description.lower() for word in ['todo', 'placeholder', 'generic', 'description']):
            generic = True
    else:
        generic = True
    if generic:
        # Build a new description using title (fallback to slug)
        if not title:
            title = os.path.splitext(fn)[0].replace('-', ' ').title()
        new_desc = f"{title} – A comprehensive guide for Web3 professionals covering key concepts, best practices, and career insights."
        if re.search(r'^description:', front, flags=re.MULTILINE):
            front = re.sub(r'^description:.*$', f'description: "{new_desc}"', front, flags=re.MULTILINE)
        else:
            front = front.rstrip('\n') + f"\ndescription: \"{new_desc}\""
        meta_updated += 1
        changed = True
    # ---- Add Related Articles section for high-value articles ----
    slug = os.path.splitext(fn)[0]
    has_related = re.search(r'^##\s+Related Articles', body, flags=re.MULTILINE) is not None
    if fn in high_value_set:
        if not has_related:
            links_md = related_links.get(slug, '')
            if links_md:
                body = body.rstrip('\n') + "\n\n## Related Articles\n\n" + links_md + "\n"
                links_added += 1
                changed = True
    else:
        # For non‑high‑value articles we do NOT add a related section (keep as is)
        pass
    if changed:
        new_content = f"{delim1}\n{front}\n{delim2}\n{body}"
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        files_modified += 1

print(f"\n✅ Processed {len(all_files)} files (excluding {len(EXCLUDE)}).")
print(f"Meta descriptions updated: {meta_updated}")
print(f"Related sections added to high‑value articles: {links_added}")
print(f"Total files modified: {files_modified}")
