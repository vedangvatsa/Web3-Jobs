import os
import glob
import re

banned_words = ['delve', 'tapestry', 'leverage', 'seamless', 'game-changer', 'foster', 'harness', 'crucial', 'vibrant']

def check_quality(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    parts = content.split('---', 2)
    if len(parts) < 3:
        return False, "Missing frontmatter"
    
    frontmatter = parts[1]
    body = parts[2]
    
    # Check title colon
    title_match = re.search(r'title:\s*"(.*?)"|title:\s*(.*)', frontmatter)
    if title_match:
        title = title_match.group(1) or title_match.group(2)
        if ':' in title:
            return False, f"Title contains colon: {title}"
    
    # Check banned words
    found_banned = [w for w in banned_words if re.search(r'\b' + w + r'\b', body, re.I)]
    if found_banned:
        return False, f"Contains banned words: {found_banned}"
    
    # Check em dashes
    if '—' in body or '–' in body:
        return False, "Contains em-dash or en-dash"
    
    # Check word count
    words = len(body.split())
    if words < 2500:
        return False, f"Word count too low: {words} words (expected >= 2500)"
    
    # Check SVG reference
    if '![' not in body or '.svg' not in body:
        return False, "Missing SVG diagram reference"
    
    # Check references section
    if '## References' in body or '## Verifiable Primary Sources' in body:
        return False, "Contains standalone reference section"
        
    return True, f"PASSED ({words} words)"

if __name__ == '__main__':
    import sys
    if len(sys.argv) > 1:
        for path in sys.argv[1:]:
            ok, msg = check_quality(path)
            print(f"{path}: {'OK' if ok else 'FAIL'} - {msg}")
