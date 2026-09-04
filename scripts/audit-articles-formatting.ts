import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const ARTICLES_DIR = path.join(process.cwd(), 'content', 'articles');

export type FormattingIssue = {
  file: string;
  category: string;
  issueType: string;
  details: string;
};

export function auditFormatting(filePath: string): FormattingIssue[] {
  const file = path.basename(filePath);
  const raw = fs.readFileSync(filePath, 'utf-8');
  const issues: FormattingIssue[] = [];

  // 1. Check Frontmatter
  let parsed;
  try {
    parsed = matter(raw);
  } catch (err) {
    issues.push({
      file,
      category: 'Unknown',
      issueType: 'Frontmatter Syntax Error',
      details: String(err),
    });
    return issues;
  }

  const category = parsed.data.category || 'Uncategorized';
  const body = parsed.content;

  // 2. Check for invalid space in bolding: ** text** or **text **
  const invalidBoldSpaces = body.match(/\*\*\s+[^*]+?\*\*|\*\*[^*]+?\s+\*\*/g);
  if (invalidBoldSpaces) {
    issues.push({
      file,
      category,
      issueType: 'Invalid Bold Spacing',
      details: `Found ${invalidBoldSpaces.length} instances of invalid space inside bold tags (e.g. "${invalidBoldSpaces[0]}")`,
    });
  }

  // 3. Check for malformed markdown links [text] (url) with space
  const malformedLinks = body.match(/\[[^\]]+\]\s+\(https?:\/\/[^\)]+\)/g);
  if (malformedLinks) {
    issues.push({
      file,
      category,
      issueType: 'Malformed Link Syntax',
      details: `Found space between link text and URL brackets: "${malformedLinks[0]}"`,
    });
  }

  // 4. Check for unescaped/raw HTML entities (&amp;, &nbsp;, &gt;, &lt;, &quot;, &apos;, &mdash;)
  const rawEntities = body.match(/&(?:amp|nbsp|gt|lt|quot|apos|mdash|ndash|hellip);|&#\d+;/g);
  if (rawEntities) {
    issues.push({
      file,
      category,
      issueType: 'Raw HTML Entities',
      details: `Found ${rawEntities.length} raw HTML entities (e.g. "${rawEntities[0]}")`,
    });
  }

  // 5. Check for non-standard typography (Em dash —, En dash –, Curly Quotes “ ” ‘ ’, Ellipsis …)
  const typographyJunk = body.match(/[—–“”‘’…\u200B\uFEFF]/g);
  if (typographyJunk) {
    issues.push({
      file,
      category,
      issueType: 'Non-ASCII Typographic Junk',
      details: `Found ${typographyJunk.length} non-standard typographic characters (e.g. em-dash, curly quotes)`,
    });
  }

  // 6. Check for pseudo-headings (**Pros**, **Cons**, **FAQ**) that should be markdown headings
  const pseudoHeadings = body.match(/^(?:\*\*(?:Pros|Cons|FAQ|Overview|Key Takeaways|Summary|Conclusion|Steps|Requirements)\*\*)$/gm);
  if (pseudoHeadings) {
    issues.push({
      file,
      category,
      issueType: 'Pseudo Heading',
      details: `Found pseudo heading "${pseudoHeadings[0]}" that should be an H2/H3 header`,
    });
  }

  // 7. Check for FAQ H3 questions missing question mark ?
  const lines = body.split('\n');
  let inFaq = false;
  for (const line of lines) {
    if (/^## (?:FAQ|Frequently Asked Questions)/i.test(line)) {
      inFaq = true;
    } else if (inFaq && /^## /.test(line)) {
      inFaq = false;
    }

    if (inFaq && /^### /.test(line)) {
      const h3Text = line.replace(/^### /, '').trim();
      if (h3Text.length > 5 && !h3Text.endsWith('?')) {
        issues.push({
          file,
          category,
          issueType: 'FAQ Question Missing ?',
          details: `FAQ subheader "${line}" is missing a question mark`,
        });
      }
    }
  }

  return issues;
}

export function runFormattingAudit() {
  const files = fs.readdirSync(ARTICLES_DIR).filter((f) => f.endsWith('.md'));
  const allIssues: FormattingIssue[] = [];

  for (const file of files) {
    const issues = auditFormatting(path.join(ARTICLES_DIR, file));
    allIssues.push(...issues);
  }

  const issuesByCategory: Record<string, number> = {};
  const issuesByType: Record<string, number> = {};

  for (const issue of allIssues) {
    issuesByCategory[issue.category] = (issuesByCategory[issue.category] || 0) + 1;
    issuesByType[issue.issueType] = (issuesByType[issue.issueType] || 0) + 1;
  }

  console.log(`\n=== ARTICLE FORMATTING AUDIT REPORT ===`);
  console.log(`Total Articles Audited: ${files.length}`);
  console.log(`Total Formatting Issues Detected: ${allIssues.length}`);
  console.log(`Articles Clean of Formatting Issues: ${files.length - new Set(allIssues.map((i) => i.file)).size} / ${files.length}`);
  console.log(`\n--- Issues Breakdown by Category ---`);
  console.table(issuesByCategory);
  console.log(`\n--- Issues Breakdown by Issue Type ---`);
  console.table(issuesByType);
  console.log(`======================================\n`);

  return allIssues;
}

if (require.main === module || process.argv[1]?.endsWith('audit-articles-formatting.ts')) {
  runFormattingAudit();
}
