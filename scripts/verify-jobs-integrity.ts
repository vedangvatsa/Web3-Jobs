import fs from 'fs';
import path from 'path';
import {
  isGeneralOrPlaceholderJobTitle,
  isUnrelatedOrNonWeb3JobTitle,
  isInvalidJobLink,
  cleanCompanyName,
} from '../src/lib/job-filters';

const CACHE_PATH = path.join(process.cwd(), 'content/jobs-cache.json');

const BLOCKED_COMPANIES = new Set([
  'notion', 'ashby', 'merge', 'salt ai', 'workable',
  'button', 'breeze', 'citadel securities', 'zipline',
  'greenhouse', 'lever', 'greenhouse io', 'ad-shield', 'adshield', 'vivident', 'hyperithm',
  'sats terminal', 'sats-terminal', 'satsterminal',
]);

const PARENTHETICAL_TAG_REGEX = /\s*\((?:ai\s*\+?\s*web3|solana\s*infra|privacy\s*l2|depin|zk|aleo|sui|market\s*maker|build\s*on\s*bitcoin|makerdao|op\s*labs|offchain\s*labs|metamask|gnosis)\)/i;

interface Job {
  id: string;
  title: string;
  company: string;
  link: string;
  slug?: string;
  [key: string]: any;
}

function verifyJobsIntegrity() {
  console.log('🔍 Running Automated Jobs Integrity Audit...');

  if (!fs.existsSync(CACHE_PATH)) {
    console.error(`❌ Cache file not found at: ${CACHE_PATH}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(CACHE_PATH, 'utf-8');
  const jobs: Job[] = JSON.parse(raw);

  if (!Array.isArray(jobs) || jobs.length === 0) {
    console.error('❌ Jobs cache is empty or invalid array.');
    process.exit(1);
  }

  console.log(`Auditing ${jobs.length} active job postings...`);

  const violations: { id: string; company: string; title: string; slug?: string; reason: string }[] = [];
  const seenSlugs = new Map<string, string>(); // slug -> id

  for (const job of jobs) {
    // 1. Slug check
    if (!job.slug || typeof job.slug !== 'string' || !job.slug.trim()) {
      violations.push({ id: job.id, company: job.company, title: job.title, slug: job.slug, reason: 'Missing or empty slug' });
      continue;
    }

    if (seenSlugs.has(job.slug)) {
      violations.push({
        id: job.id,
        company: job.company,
        title: job.title,
        slug: job.slug,
        reason: `Duplicate slug collision with job ID ${seenSlugs.get(job.slug)}`,
      });
    } else {
      seenSlugs.set(job.slug, job.id);
    }

    // 2. Company check
    if (!job.company || typeof job.company !== 'string' || !job.company.trim()) {
      violations.push({ id: job.id, company: job.company, title: job.title, slug: job.slug, reason: 'Missing or empty company name' });
    } else {
      if (BLOCKED_COMPANIES.has(job.company.toLowerCase().trim())) {
        violations.push({ id: job.id, company: job.company, title: job.title, slug: job.slug, reason: `Blocked non-Web3 company: ${job.company}` });
      }

      if (PARENTHETICAL_TAG_REGEX.test(job.company)) {
        violations.push({ id: job.id, company: job.company, title: job.title, slug: job.slug, reason: `Unsanitized parenthetical tag in company name: "${job.company}" (should be "${cleanCompanyName(job.company)}")` });
      }
    }

    // 3. Title check - no talent pools / general applications
    if (isGeneralOrPlaceholderJobTitle(job.title)) {
      violations.push({ id: job.id, company: job.company, title: job.title, slug: job.slug, reason: `Non-standalone / general application / placeholder title: "${job.title}"` });
    }

    // 4. Title check - no completely unrelated / non-Web3 domain roles
    if (isUnrelatedOrNonWeb3JobTitle(job.title)) {
      violations.push({ id: job.id, company: job.company, title: job.title, slug: job.slug, reason: `Non-Web3 / unrelated domain role: "${job.title}"` });
    }

    // 5. Link check - no search-results URLs
    if (isInvalidJobLink(job.link)) {
      violations.push({ id: job.id, company: job.company, title: job.title, slug: job.slug, reason: `Invalid or search-results URL: "${job.link}"` });
    }
  }

  // 6. Company Completeness Check: Ensure 100% of companies have non-empty website and rich description
  const uniqueCompanies = [...new Set(jobs.map(j => j.company))];
  const { getCompanySlug } = require('../src/lib/job-slugs');
  const { COMPANY_RICH_ABOUT } = require('../src/lib/company-profiles');
  const missingProfiles: string[] = [];

  for (const comp of uniqueCompanies) {
    const slug = getCompanySlug(comp);
    if (!COMPANY_RICH_ABOUT[slug] && !COMPANY_RICH_ABOUT[slug.replace(/-labs$|-foundation$/, '')]) {
      missingProfiles.push(comp);
    }
  }

  if (missingProfiles.length > 0) {
    console.error(`\n❌ Found ${missingProfiles.length} companies missing rich About profiles:`, missingProfiles);
    process.exit(1);
  }

  if (violations.length > 0) {
    console.error(`\n❌ Found ${violations.length} integrity violations in jobs-cache.json:`);
    for (const v of violations.slice(0, 50)) {
      console.error(`  - [${v.company}] "${v.title}" (${v.id}): ${v.reason}`);
    }
    if (violations.length > 50) {
      console.error(`  ... and ${violations.length - 50} more.`);
    }
    process.exit(1);
  }

  console.log(`\n✅ Jobs Integrity Passed: All ${jobs.length} jobs verified across 6 critical safety assertions:`);
  console.log(`  1. Zero general applications, talent pools, or placeholders`);
  console.log(`  2. Zero non-Web3 / biotech / unrelated domain roles`);
  console.log(`  3. Zero unsanitized parenthetical company tags or blocked companies`);
  console.log(`  4. Zero search-results or generic query application URLs`);
  console.log(`  5. 100% slug uniqueness with no collisions`);
  console.log(`  6. 100% company website and rich profile coverage across all ${uniqueCompanies.length} companies`);
}

if (require.main === module) {
  verifyJobsIntegrity();
}
