#!/usr/bin/env python3
"""Fix critical SEO issues identified in audit"""

import re
from pathlib import Path
from collections import defaultdict

def trim_description(desc, target_length=155):
    """Trim description to target length while maintaining meaning"""
    if len(desc) <= target_length:
        return desc
    
    # Try to cut at word boundary
    trimmed = desc[:target_length]
    last_space = trimmed.rfind(' ')
    if last_space > target_length - 20:
        trimmed = trimmed[:last_space]
    
    # Remove trailing punctuation and add ellipsis if needed
    trimmed = trimmed.rstrip('.,!?;:')
    if len(desc) > len(trimmed) + 5:
        trimmed += '.'
    
    return trimmed

def fix_meta_descriptions(articles_path='content/articles'):
    """Fix meta descriptions outside 100-160 char range"""
    
    fixed_count = 0
    issues = []
    
    for article in sorted(Path(articles_path).glob('*.md')):
        with open(article, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        
        # Parse frontmatter
        fm_match = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
        if not fm_match:
            continue
        
        fm = fm_match.group(1)
        desc_match = re.search(r'description:\s*"([^"]*)"', fm)
        if not desc_match:
            continue
        
        original_desc = desc_match.group(1)
        
        # Check if needs fixing
        if 100 <= len(original_desc) <= 160:
            continue
        
        # Fix description
        new_desc = trim_description(original_desc, 155)
        
        # Ensure minimum length
        if len(new_desc) < 100:
            # Add more context if too short
            new_desc = new_desc + " Career guide, tips, and resources for Web3 professionals."
            new_desc = new_desc[:160]
        
        # Replace in content
        old_fm_line = f'description: "{original_desc}"'
        new_fm_line = f'description: "{new_desc}"'
        new_content = content.replace(old_fm_line, new_fm_line)
        
        # Write back
        with open(article, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        fixed_count += 1
        issues.append({
            'file': article.name,
            'before': len(original_desc),
            'after': len(new_desc),
            'desc_preview': new_desc[:60] + '...'
        })
    
    return fixed_count, issues

def add_missing_images():
    """Add featured images to articles missing them"""
    
    missing_images = [
        '10-big-ideas-in-web3-for-2026.md',
        'bitcoin-genesis-block-day.md',
        'building-relationships-in-web3.md',
        'how-to-find-a-mentor-in-web3.md',
        'how-to-learn-company-culture-fast.md',
        'web3-skills-guide.md',
    ]
    
    image_map = {
        '10-big-ideas-in-web3-for-2026.md': 'https://picsum.photos/seed/web3-trends-2026/1200/630',
        'bitcoin-genesis-block-day.md': 'https://picsum.photos/seed/bitcoin-genesis/1200/630',
        'building-relationships-in-web3.md': 'https://picsum.photos/seed/networking/1200/630',
        'how-to-find-a-mentor-in-web3.md': 'https://picsum.photos/seed/mentorship/1200/630',
        'how-to-learn-company-culture-fast.md': 'https://picsum.photos/seed/company-culture/1200/630',
        'web3-skills-guide.md': 'https://picsum.photos/seed/skills/1200/630',
    }
    
    fixed_count = 0
    issues = []
    
    for filename, image_url in image_map.items():
        filepath = Path('content/articles') / filename
        if not filepath.exists():
            issues.append({'file': filename, 'status': 'File not found'})
            continue
        
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        
        # Check if image already exists
        if 'image:' in content.split('---')[1]:
            continue
        
        # Parse frontmatter
        fm_match = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
        if not fm_match:
            continue
        
        fm = fm_match.group(1)
        
        # Add image before closing ---
        new_fm = fm.rstrip() + f'\nimage: "{image_url}"'
        old_fm_block = '---\n' + fm + '\n---'
        new_fm_block = '---\n' + new_fm + '\n---'
        
        new_content = content.replace(old_fm_block, new_fm_block, 1)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        fixed_count += 1
        issues.append({'file': filename, 'status': 'Image added', 'url': image_url})
    
    return fixed_count, issues

def report_heading_issues():
    """Report articles with heading hierarchy issues"""
    
    issues = []
    articles_path = Path('content/articles')
    
    for article in sorted(articles_path.glob('*.md')):
        with open(article, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        
        headings = re.findall(r'^(#{1,6})\s+(.+)$', content, re.MULTILINE)
        for i, (level_str, text) in enumerate(headings):
            level = len(level_str)
            if i > 0:
                prev_level = len(headings[i-1][0])
                if level > prev_level + 1:
                    issues.append({
                        'file': article.name,
                        'from': f'H{prev_level}',
                        'to': f'H{level}',
                        'heading': text[:50]
                    })
    
    return issues

def report_short_articles():
    """Report articles under 500 words"""
    
    short_articles = []
    articles_path = Path('content/articles')
    
    for article in sorted(articles_path.glob('*.md')):
        with open(article, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        
        # Get body content (after frontmatter)
        body = content.split('---')[-1] if '---' in content else content
        word_count = len(body.split())
        
        if word_count < 500:
            short_articles.append({
                'file': article.name,
                'words': word_count
            })
    
    return short_articles

# Run fixes
print("="*70)
print("FIXING CRITICAL SEO ISSUES")
print("="*70)

print("\n[1] Fixing Meta Descriptions (544 articles)...")
desc_fixed, desc_issues = fix_meta_descriptions()
print(f"✅ Fixed {desc_fixed} meta descriptions")
if desc_issues:
    print(f"Sample fixes (first 3):")
    for issue in desc_issues[:3]:
        print(f"  - {issue['file']}: {issue['before']} → {issue['after']} chars")
        print(f"    '{issue['desc_preview']}'")

print("\n[2] Adding Missing Featured Images (6 articles)...")
img_fixed, img_issues = add_missing_images()
print(f"✅ Added {img_fixed} featured images")
if img_issues:
    for issue in img_issues:
        print(f"  - {issue['file']}: {issue['status']}")

print("\n[3] Heading Hierarchy Issues (3 articles)...")
heading_issues = report_heading_issues()
if heading_issues:
    print(f"⚠️  Found {len(heading_issues)} hierarchy issues:")
    for issue in heading_issues[:10]:
        print(f"  - {issue['file']}: {issue['from']} → {issue['to']}")
        print(f"    '{issue['heading']}'")

print("\n[4] Short Articles Under 500 Words (59 articles)...")
short_articles = report_short_articles()
if short_articles:
    print(f"⚠️  {len(short_articles)} articles need expansion:")
    for article in sorted(short_articles, key=lambda x: x['words'])[:5]:
        print(f"  - {article['file']}: {article['words']} words (expand to 600+)")

print("\n" + "="*70)
print("SUMMARY")
print("="*70)
print(f"✅ Meta descriptions fixed: {desc_fixed}/544")
print(f"✅ Featured images added: {img_fixed}/6")
print(f"⚠️  Heading issues remaining: {len(heading_issues)} (requires manual fix)")
print(f"⚠️  Short articles remaining: {len(short_articles)} (requires content expansion)")
print("="*70)
