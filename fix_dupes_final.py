#!/usr/bin/env python3
import os
import sys

def fix_frontmatter(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    lines = content.splitlines(keepends=True)
    delim_indices = [i for i, line in enumerate(lines) if line.strip() == '---']
    
    # No duplicates if 2 or fewer delimiters
    if len(delim_indices) <= 2:
        return False, None
    
    # Keep first frontmatter block
    kept = ''.join(lines[:delim_indices[1] + 1])
    
    # Process rest, skipping duplicate frontmatter blocks
    remaining = lines[delim_indices[1] + 1:]
    content_lines = []
    in_dup_block = False
    
    for line in remaining:
        if line.strip() == '---':
            in_dup_block = not in_dup_block
        elif not in_dup_block:
            content_lines.append(line)
    
    final = kept + ''.join(content_lines)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(final)
    
    return True, len(delim_indices) - 2

# Main processing
adir = 'content/articles'
fixed_count = 0
errors = []

for root, dirs, files in os.walk(adir):
    for fn in sorted(files):
        if not fn.endswith('.md'):
            continue
        
        path = os.path.join(root, fn)
        try:
            success, blocks_removed = fix_frontmatter(path)
            if success:
                fixed_count += 1
                if fixed_count <= 5 or fixed_count % 50 == 0:
                    print(f"✓ {fn} (removed {blocks_removed} blocks)")
        except Exception as e:
            errors.append((fn, str(e)))

print(f'\n✅ Successfully fixed {fixed_count} files')
if errors:
    print(f'⚠️  Errors: {len(errors)}')
    for fn, err in errors[:5]:
        print(f'  {fn}: {err}')
