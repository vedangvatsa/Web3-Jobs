#!/usr/bin/env python3
import os, re, collections, sys
adir='content/articles'
broken=collections.Counter()
with open('check_broken_links.py','r') as f:
    pass
# We'll reuse the logic from check_broken_links.py
articles=set()
for root, dirs, files in os.walk(adir):
    for fn in files:
        if fn.endswith('.md'):
            articles.add(fn[:-3])

for root, dirs, files in os.walk(adir):
    for fn in files:
        if not fn.endswith('.md'):
            continue
        path=os.path.join(root,fn)
        with open(path,'r',encoding='utf-8') as f:
            txt=f.read()
        links=re.findall(r'\]\(([^\)]+)\)',txt)
        for link in links:
            if link.startswith('http') or link.startswith('/'):
                # consider internal only if starts without slash? We'll treat slash as internal page
                if link.startswith('/'):
                    target=link.lstrip('/')
                    target=target.split('#')[0]
                    if target not in articles:
                        broken[target]+=1
                continue
            # relative link
            target=link.split('#')[0].replace('.md','')
            if target not in articles:
                broken[target]+=1

print('Top missing targets:')
for tgt,count in broken.most_common(20):
    print(f'{tgt}: {count}')
print('\nTotal distinct missing targets:',len(broken))
print('Total broken links count:',sum(broken.values()))
