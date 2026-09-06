import path from 'path';
import { getAllJobsWithSlugs, fetchJobOriginalContent, buildSynthesizedJobContent } from '../src/lib/job-guides';

async function auditAllJobs() {
  const all = await getAllJobsWithSlugs();
  console.log(`Starting deep audit across all ${all.length} jobs...\n`);

  let totalChecked = 0;
  let issuesFound = 0;
  const issues: Array<{ slug: string; company: string; title: string; reasons: string[] }> = [];

  for (const item of all) {
    const { job, slug } = item;
    totalChecked++;
    try {
      const rawHtml = await fetchJobOriginalContent(job);
      const html = buildSynthesizedJobContent(job, rawHtml);
      const reasons: string[] = [];

      // 1. Check for malformed entity remnants.
      if (/&(?!amp;|lt;|gt;|quot;|nbsp;|#39;|#x27;|#x2F;)[a-z][a-z0-9]+;?/i.test(html)) {
        reasons.push('Malformed HTML entity present');
      }

      // 2. Check for clumped bullet points inside paragraphs. NOTE: only
      // same-chunk ". - X" counts — testing tag-stripped text false-positives
      // on legitimate </li><li> boundaries ("English.</li><li>- Nice..."),
      // so the pattern allows only spaces between the period and the dash.
      const visibleText = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      if (/\.\s{0,3}-\s+[A-Z]/.test(html) || /:\s{0,3}-\s+[A-Z][a-z]{3,}/.test(html)) {
        reasons.push('Clumped bullets inside paragraph');
      }

      // 3. Check for empty block tags
      if (/<(?:p|h3|li)>\s*<\/(?:p|h3|li)>/i.test(html)) {
        reasons.push('Empty block tag');
      }

      // 4. Check for double "Key Key" or "Key Required"
      if (/\b(?:Key\s+Key|Required\s+Required|Key\s+Required)\b/i.test(html)) {
        reasons.push('Repetitive prefix artifact');
      }

      // 5. Check if content is suspiciously short (< 100 chars)
      if (html.replace(/<[^>]*>/g, '').trim().length < 100) {
        reasons.push('Content too short (< 100 chars)');
      }

      // 6. Check for leading bullet symbols inside <li>
      if (/<li>\s*[-*•·▪–—]\s+/i.test(html)) {
        reasons.push('Leading bullet symbol inside <li>');
      }

      // 7. Check for stray HTML tags visible inside text
      if (/<(?:p|h3|li)>[^<]*&lt;\/?(?:p|br|div|span|h[1-6]|ul|li|b|strong|i|em)/i.test(html)) {
        reasons.push('Escaped HTML tag artifact visible in text');
      }

      // 8. Check for paragraphs starting with lowercase letter (broken mid-sentence split)
      if (/<p[^>]*>\s*[a-z]/i.test(html)) {
        // Exclude legitimate technical lowercase terms like 'dApp', 'iOS', 'gRPC', 'e.g.', 'i.e.', 'eBay',
        // lowercase-styled brands (eToro, zerohash, a16z), and bare contact emails.
        // NOTE: the capture takes the FULL first token (mixed case + digits)
        // so brands aren't misread as single-letter fragments ('a16z' -> 'a').
        const lowerMatches = html.match(/<p[^>]*>\s*([A-Za-z][\w.]*@?[\w.]*)/g) || [];
        const badLower = lowerMatches.filter(m => {
          const word = m.replace(/<p[^>]*>\s*/, '');
          if (/@/.test(word)) return false;
          if (/^(etoro|zerohash|a16z)$/i.test(word)) return false;
          return !/^(dApp|dApps|iOS|gRPC|e\.g\.|i\.e\.|eBay|npm|pnpm|yarn|vite|solc)\b/i.test(word) && /^[a-z]/.test(word);
        });
        if (badLower.length > 0) {
          reasons.push(`Paragraph starts with lowercase fragment: ${badLower.slice(0, 3).join(', ')}`);
        }
      }

      // 9. Check for list items chopped mid-sentence followed by paragraph
      if (/<li>[^<]*(?:,|,\s*|(?:\band|\bor|\bwith|\bin|\bto|\bfor|\bof))\s*<\/li>\s*<p>/i.test(html)) {
        reasons.push('List item chopped mid-sentence followed by paragraph');
      }

      // 10. Check for clumped bullets separated by asterisks inside <li>
      if (/<li>[^<]*\s+\*\s+[A-Z]/.test(html)) {
        reasons.push('Clumped asterisk bullets inside <li>');
      }

      // 11. Check for unparsed major headings left as plain paragraphs
      if (/<p[^>]*>(?:what you.?ll do|what you will do|you.?ll excel in this role|you will excel in this role|perks that empower you|why this role matters|what success looks like|you.?ll know you.?re winning)[:]?<\/p>/i.test(html)) {
        reasons.push('Unparsed major heading rendered as paragraph');
      }

      // 12. Heading bleed: no <h3> may carry a paragraph (>140 chars).
      // Regression of the fragment-merge bug that swallowed whole paragraphs
      // into headings on 400+ pages.
      const longH3 = [...html.matchAll(/<h3[^>]*>(.*?)<\/h3>/gs)]
        .map((m) => m[1].replace(/<[^>]*>/g, '').trim())
        .filter((t) => t.length > 140);
      if (longH3.length > 0) {
        reasons.push(`Heading bleed: ${longH3.length} giant <h3> (e.g. ${longH3[0].slice(0, 70)}...)`);
      }

      // 13. Consecutive duplicate <h3> (employer repeats like Lever `lists`
      // do must merge into one heading, not render twice in a row).
      const h3Seq = [...html.matchAll(/<h3[^>]*>(.*?)<\/h3>/gs)]
        .map((m) => m[1].replace(/<[^>]*>/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ''));
      if (h3Seq.some((h, i) => i > 0 && h && h === h3Seq[i - 1])) {
        reasons.push('Consecutive duplicate <h3>');
      }

      // 14. Boilerplate remnants that the pipeline must strip.
      if (/by submitting your application to us, you consent|please consider your application as unsuccessful/i.test(visibleText)) {
        reasons.push('Privacy-consent boilerplate leaked');
      }
      if (/(equal opportunity employer|all qualified applicants|affirmative action)/i.test(visibleText)) {
        reasons.push('Equal-opportunity boilerplate leaked');
      }
      if (/popular topics|latest articles|featured articles/i.test(visibleText)) {
        reasons.push('Help-center nav-menu dump leaked');
      }
      if (/^By:\s*.+\|\s*\d/m.test(visibleText)) {
        reasons.push('Article byline leaked');
      }

      // 15. Raw inline-markdown remnants in headings.
      if (/<h[34][^>]*>[^<]*\*\*/.test(html)) {
        reasons.push('Leftover ** markers inside heading');
      }

      if (reasons.length > 0) {
        issuesFound++;
        issues.push({ slug, company: job.company, title: job.title, reasons });
        if (issues.length <= 10) {
          console.log(`Issue in ${slug} (${job.company} - ${job.title}):`, reasons.join(', '));
        }
      }
    } catch (err: any) {
      issuesFound++;
      issues.push({ slug, company: job.company, title: job.title, reasons: [err.message] });
    }

    if (totalChecked % 500 === 0) {
      console.log(`Audited ${totalChecked}/${all.length} jobs...`);
    }
  }

  console.log(`\n=== Deep Audit Complete ===`);
  console.log(`Total Jobs Checked: ${totalChecked}`);
  console.log(`Jobs with Formatting Issues: ${issuesFound}`);
  if (issuesFound > 0) {
    console.log(`\nSummary of first issues:`);
    console.log(JSON.stringify(issues.slice(0, 15), null, 2));
  }
}

auditAllJobs();
