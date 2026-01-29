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
                txt = f.read()
        except Exception as e:
            print(f"Err reading {path}: {e}")
            continue
        lines = txt.splitlines()
        delim_idxs = [i for i,l in enumerate(lines) if l.strip() == '---']
        if len(delim_idxs) >= 4:
            new_lines = lines[:delim_idxs[1]+1] + lines[delim_idxs[3]+1:]
            try:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write('\n'.join(new_lines) + ('\n' if not txt.endswith('\n') else ''))
                fixed.append(fn)
            except Exception as e:
                print(f"Err writing {path}: {e}")

for f in fixed:
    print(f"Fixed: {f}")
print(f"Total fixed: {len(fixed)}")
