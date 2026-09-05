import path from 'path';
import { getAllJobsWithSlugs, fetchJobOriginalContent } from '../src/lib/job-guides';

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
      const html = await fetchJobOriginalContent(job);
      const reasons: string[] = [];

      // 1. Check for malformed entity remnants. The formatter intentionally
      // emits valid escaped entities (for example &#39; and &amp;); those are
      // safe HTML and must not be reported as formatting defects.
      if (/&(?!amp;|lt;|gt;|quot;|nbsp;|#39;|#x27;|#x2F;)[a-z][a-z0-9]+;?/i.test(html)) {
        reasons.push('Malformed HTML entity present');
      }

      // 2. Check for clumped bullet points inside paragraphs
      if (/include:-\s+[A-Z]/i.test(html) || /\.\s*[-*•]\s+[A-Z]/.test(html)) {
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
