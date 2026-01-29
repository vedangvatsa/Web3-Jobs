#!/usr/bin/env python3
import os, re
adir='content/articles'
# Count images without alt text
no_alt=0
total_images=0
for fn in os.listdir(adir):
    if not fn.endswith('.md'): continue
    path=os.path.join(adir,fn)
    with open(path,'r',encoding='utf-8') as f:
        txt=f.read()
    images=re.findall(r'!\[\]\(',txt)
    alted=re.findall(r'!\[[^\]]+\]\(',txt)
    no_alt+=len(images)
    total_images+=len(images)+len(alted)
pct = 100*no_alt/total_images if total_images else 0
print(f'Images without alt text: {no_alt} / {total_images} ({pct:.1f}%)')
