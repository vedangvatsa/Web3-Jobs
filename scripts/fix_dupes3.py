#!/usr/bin/env python3
import os

article_dir = "/Users/vedang/web3jobs/Web3-Jobs/content/articles"
fixed = []
for root, dirs, files in os.walk(article_dir):
    for fn in files:
        if not fn.endswith('.md'):
            continue
        path = os.path.join(root, fn)
        try:
            with open(path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
        except Exception as e:
            print(f"Err reading {path}: {e}")
            continue
        # find indices of lines that are just '---\n' or '---' (strip)
        delim_idxs = [i for i,l in enumerate(lines) if l.strip()=="---"]
        if len(delim_idxs) < 2:
            continue
        # find subsequent delimiters that look like frontmatter (i.e., '---' followed by a 'title:' within next 8 lines)
        to_remove_ranges = []
        for idx in delim_idxs[1:]:
            # check next up to 8 lines for 'title:' and 'description:' or 'title:' alone
            snippet = ''.join(lines[idx+1: idx+12])
            if 'title:' in snippet and 'description:' in snippet:
                # find next delimiter after idx
                next_delim = None
                for j in range(idx+1, len(lines)):
                    if lines[j].strip() == '---':
                        next_delim = j
                        break
                if next_delim:
                    to_remove_ranges.append((idx, next_delim))
        if to_remove_ranges:
            # remove ranges, careful with indices shifting; process from last to first
            for start, end in reversed(to_remove_ranges):
                del lines[start:end+1]
            try:
                with open(path, 'w', encoding='utf-8') as f:
                    f.writelines(lines)
                fixed.append(fn)
            except Exception as e:
                print(f"Err writing {path}: {e}")

for f in fixed:
    print(f"Fixed: {f}")
print(f"Total fixed: {len(fixed)}")
