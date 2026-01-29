#!/usr/bin/env python3
"""
Comprehensive SEO fix script:
1. Fix broken internal links (redirect, create stubs, or remove)
2. Add missing/improve alt text on images
3. Verify code quality
"""

import os
import re
import sys
from collections import defaultdict

ADIR = 'content/articles'
EXCLUDE = {'cbdc.md'}

# ============================================================================
# SECTION 1: Identify and fix broken links
# ============================================================================

def get_all_articles():
    """Return set of all article slugs (filename without .md)."""
    return {os.path.splitext(f)[0] for f in os.listdir(ADIR) 
            if f.endswith('.md') and f not in EXCLUDE}

def find_broken_links():
    """Scan all articles and return dict of {broken_target: count}."""
    articles = get_all_articles()
    broken = defaultdict(int)
    
    for fn in os.listdir(ADIR):
        if not fn.endswith('.md') or fn in EXCLUDE:
            continue
        path = os.path.join(ADIR, fn)
        try:
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
        except:
            continue
        
        # Find all markdown links
        links = re.findall(r'\]\(([^\)]+)\)', content)
        for link in links:
            if link.startswith('http') or link.startswith('#'):
                continue  # Skip external and anchor-only links
            
            # Extract target (remove fragment, .md extension)
            target = link.split('#')[0].replace('.md', '').lstrip('/')
            if target and target not in articles:
                broken[target] += 1
    
    return broken

def fix_broken_links_in_file(path, broken_map):
    """
    Fix broken links in a single file by:
    1. Removing links to non-existent articles
    2. Keeping links to known app routes (redirect to them)
    """
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    articles = get_all_articles()
    
    # Pattern: [text](link)
    def replace_link(match):
        text = match.group(1)
        link = match.group(2)
        
        # Skip external/anchor-only
        if link.startswith('http') or link.startswith('#'):
            return match.group(0)
        
        # Extract target
        target = link.split('#')[0].replace('.md', '').lstrip('/')
        
        # If target exists, keep link
        if target in articles:
            return match.group(0)
        
        # If it's a known app route (start of target in common list), keep it
        app_routes = {
            'jobs', 'salary-calculator', 'interview-questions', 'web3-career-quiz',
            'blog', 'resources', 'contact', 'about'
        }
        if any(target.startswith(route) for route in app_routes):
            return match.group(0)
        
        # Otherwise, remove the link (keep text only)
        return text
    
    content = re.sub(r'\[([^\]]+)\]\(([^\)]+)\)', replace_link, content)
    
    if content != original:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

# ============================================================================
# SECTION 2: Add/improve image alt text
# ============================================================================

def add_image_alt_text(path, article_title):
    """
    Find images without alt text and add descriptive alt text.
    Pattern: ![](url)  →  ![{article_title} illustration](url)
    """
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # Find images without alt text: ![](url)
    # Replace with: ![Article Title illustration](url)
    def add_alt(match):
        url = match.group(1)
        # Create a friendly alt text
        alt = f"{article_title} illustration"
        return f"![{alt}]({url})"
    
    # Match pattern: ![](...) where the alt text is empty
    content = re.sub(r'!\[\]\(([^\)]+)\)', add_alt, content)
    
    if content != original:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def extract_title_from_frontmatter(content):
    """Extract title from YAML frontmatter."""
    match = re.search(r'^title:\s*"?([^"\n]+)"?', content, flags=re.MULTILINE)
    return match.group(1).strip() if match else None

# ============================================================================
# SECTION 3: Code quality checks
# ============================================================================

def check_frontmatter_quality(content):
    """Check for common frontmatter issues."""
    issues = []
    
    # Check for proper YAML delimiters
    delims = len([l for l in content.splitlines() if l.strip() == '---'])
    if delims < 2:
        issues.append("Missing or incomplete frontmatter delimiters")
    elif delims > 2:
        issues.append(f"Extra frontmatter delimiters (found {delims})")
    
    # Check for required fields
    if not re.search(r'^title:', content, flags=re.MULTILINE):
        issues.append("Missing title")
    if not re.search(r'^description:', content, flags=re.MULTILINE):
        issues.append("Missing description")
    
    # Check for duplicate YAML keys
    lines = content.split('\n')
    yaml_keys = defaultdict(int)
    in_frontmatter = False
    for line in lines:
        if line.strip() == '---':
            in_frontmatter = not in_frontmatter
            continue
        if in_frontmatter and ':' in line:
            key = line.split(':')[0].strip()
            yaml_keys[key] += 1
    
    for key, count in yaml_keys.items():
        if count > 1:
            issues.append(f"Duplicate YAML key: {key} (appears {count} times)")
    
    return issues

def check_heading_hierarchy(content):
    """Check for proper H1/H2 hierarchy."""
    # Extract just the body (after frontmatter)
    parts = content.split('---')
    if len(parts) < 3:
        return []
    
    body = parts[2]
    headings = re.findall(r'^(#{1,6}) ', body, flags=re.MULTILINE)
    
    issues = []
    if not headings:
        return issues
    
    # Check if we jump from H1 to H3 (skip H2)
    for i in range(len(headings) - 1):
        curr_level = len(headings[i])
        next_level = len(headings[i + 1])
        if next_level > curr_level + 1:
            issues.append(f"Heading hierarchy skip: #{curr_level} → #{next_level}")
    
    return issues

# ============================================================================
# MAIN EXECUTION
# ============================================================================

def main():
    print("=" * 70)
    print("SEO COMPREHENSIVE FIX & AUDIT")
    print("=" * 70)
    
    # Step 1: Identify broken links
    print("\n[1] Identifying broken links...")
    broken_map = find_broken_links()
    if broken_map:
        print(f"   Found {len(broken_map)} distinct missing targets ({sum(broken_map.values())} total links)")
        print(f"   Top 10 most referenced:")
        for target, count in sorted(broken_map.items(), key=lambda x: -x[1])[:10]:
            print(f"     - {target}: {count} links")
    else:
        print("   ✅ No broken links found!")
    
    # Step 2: Fix broken links and add alt text
    print("\n[2] Processing articles for fixes...")
    fixed_links = 0
    added_alt = 0
    quality_issues = defaultdict(list)
    
    for fn in sorted(os.listdir(ADIR)):
        if not fn.endswith('.md') or fn in EXCLUDE:
            continue
        
        path = os.path.join(ADIR, fn)
        try:
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
        except:
            continue
        
        # Fix broken links
        if fix_broken_links_in_file(path, broken_map):
            fixed_links += 1
        
        # Extract title for alt text
        title = extract_title_from_frontmatter(content)
        if title and add_image_alt_text(path, title):
            added_alt += 1
        
        # Quality checks
        fm_issues = check_frontmatter_quality(content)
        if fm_issues:
            quality_issues[fn].extend(fm_issues)
        
        hh_issues = check_heading_hierarchy(content)
        if hh_issues:
            quality_issues[fn].extend(hh_issues)
    
    print(f"   Fixed broken links in: {fixed_links} files")
    print(f"   Added/improved alt text in: {added_alt} files")
    
    if quality_issues:
        print(f"\n[3] Code quality issues found ({len(quality_issues)} files):")
        for fn, issues in sorted(quality_issues.items())[:10]:
            print(f"   {fn}:")
            for issue in issues:
                print(f"     - {issue}")
        if len(quality_issues) > 10:
            print(f"   ... and {len(quality_issues) - 10} more files with issues")
    else:
        print(f"\n[3] Code quality checks: ✅ All files pass")
    
    # Step 4: Final verification
    print("\n[4] Final verification...")
    broken_after = find_broken_links()
    print(f"   Broken links remaining: {sum(broken_after.values()) if broken_after else 0}")
    if sum(broken_after.values()) < sum(broken_map.values()):
        reduction = sum(broken_map.values()) - sum(broken_after.values())
        print(f"   ✅ Fixed {reduction} broken links")
    
    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print(f"Files with fixed links:    {fixed_links}")
    print(f"Files with improved alt text: {added_alt}")
    print(f"Total article files:       {len([f for f in os.listdir(ADIR) if f.endswith('.md') and f not in EXCLUDE])}")
    print("=" * 70)

if __name__ == '__main__':
    main()
