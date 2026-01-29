#!/usr/bin/env python3
import os, re, sys
adir='content/articles'
missing=0
generic=0
total=0
for fn in os.listdir(adir):
    if not fn.endswith('.md'): continue
    total+=1
    path=os.path.join(adir,fn)
    with open(path,'r',encoding='utf-8') as f:
        txt=f.read()
    parts=re.split(r'^(---\s*$)',txt,flags=re.MULTILINE)
    if len(parts)<5:
        continue
    _,d1,front,d2,body=parts[:5]
    m=re.search(r'^description:\s*"?([^"\n]*)"?',front,flags=re.MULTILINE)
    if not m:
        missing+=1
    else:
        desc=m.group(1).strip()
        if not desc or any(w in desc.lower() for w in ['todo','placeholder','generic','description']):
            generic+=1
print(f"Total articles: {total}\nMissing description: {missing}\nGeneric description: {generic}")
