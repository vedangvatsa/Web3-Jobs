#!/usr/bin/env python3
import os
import re
import sys

ADIR = 'content/articles'
EXCLUDE = {'cbdc.md'}  # never modify this file

# Helper functions

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

def split_frontmatter(text):
    # Returns (frontmatter_text, body_text) or (None, text) if not proper
    parts = re.split(r'^(---\s*$)', text, flags=re.MULTILINE)
    if len(parts) < 5:
        return None, text
    _, delim1, front, delim2, body = parts[:5]
    return f"{delim1}\n{front}\n{delim2}", body

def parse_frontmatter(front):
    title_match = re.search(r'^title:\s*"?([^"\n]+)"?', front, flags=re.MULTILINE)
    desc_match = re.search(r'^description:\s*"?([^"\n]*)"?', front, flags=re.MULTILINE)
    title = title_match.group(1).strip() if title_match else None
    description = desc_match.group(1).strip() if desc_match else None
    return title, description

def update_description(front, title):
    new_desc = f"{title} – A comprehensive guide for Web3 professionals covering key concepts, best practices, and career insights."
    if re.search(r'^description:', front, flags=re.MULTILINE):
        front = re.sub(r'^description:.*$', f'description: "{new_desc}"', front, flags=re.MULTILINE)
    else:
        front = front.rstrip('\n') + f"\ndescription: \"{new_desc}\""
    return front

def add_related_section(body, links_md):
    # Append a Related Articles section at the end of the article
    body = body.rstrip('\n') + "\n\n## Related Articles\n\n" + links_md + "\n"
    return body

# Gather all markdown files
all_files = [f for f in os.listdir(ADIR) if f.endswith('.md') and f not in EXCLUDE]

# Compute word counts (excluding frontmatter) for ranking
word_counts = {}
slug_to_title = {}
for fn in all_files:
    path = os.path.join(ADIR, fn)
    content = read_file(path)
    fm, body = split_frontmatter(content)
    if fm is None:
        continue
    title, _ = parse_frontmatter(fm)
    slug = os.path.splitext(fn)[0]
    slug_to_title[slug] = title if title else slug.replace('-', ' ').title()
    # Rough word count in body (strip markdown symbols)
    words = re.findall(r"\b\w+\b", body)
    word_counts[fn] = len(words)

# Sort by word count descending
sorted_by_wc = sorted(all_files, key=lambda x: word_counts.get(x, 0), reverse=True)
top_100 = sorted_by_wc[:100]
top_50 = set(top_100[:50])
next_50 = set(top_100[50:100])

# Build link map for top 100 (excluding self) – up to 5 links each
links_map = {}
for fn in top_100:
    slug = os.path.splitext(fn)[0]
    other_links = []
    for other in top_100:
        if other == fn:
            continue
        other_slug = os.path.splitext(other)[0]
        other_title = slug_to_title.get(other_slug, other_slug.replace('-', ' ').title())
        other_links.append(f"- [{other_title}]({other_slug})")
        if len(other_links) >= 5:
            break
    links_map[slug] = "\n".join(other_links)

meta_updated = 0
links_added = 0
files_modified = 0

for fn in all_files:
    path = os.path.join(ADIR, fn)
    content = read_file(path)
    fm, body = split_frontmatter(content)
    if fm is None:
        continue
    title, description = parse_frontmatter(fm)
    changed = False
    # ---- Meta description ----
    generic = False
    if description:
        if not description or any(word in description.lower() for word in ['todo', 'placeholder', 'generic', 'description']):
            generic = True
    else:
        generic = True
    if generic:
        # Ensure we have a title
        if not title:
            title = os.path.splitext(fn)[0].replace('-', ' ').title()
        fm = update_description(fm, title)
        meta_updated += 1
        changed = True
    # ---- Related Articles for next 50 high‑value ----
    slug = os.path.splitext(fn)[0]
    has_related = re.search(r'^##\s+Related Articles', body, flags=re.MULTILINE) is not None
    if fn in next_50:
        if not has_related:
            links_md = links_map.get(slug, '')
            if links_md:
                body = add_related_section(body, links_md)
                links_added += 1
                changed = True
    # If file is in top 50 but missing related (unlikely), we could also add – optional
    # else: do nothing for other files
    if changed:
        new_content = f"{fm}\n{body}"
        write_file(path, new_content)
        files_modified += 1

print(f"\n✅ Processed {len(all_files)} files (excluding {len(EXCLUDE)}).")
print(f"Meta descriptions updated: {meta_updated}")
print(f"Related sections added to next 50 high‑value articles: {links_added}")
print(f"Total files modified: {files_modified}")
