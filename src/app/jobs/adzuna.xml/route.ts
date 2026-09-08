import { getJobs } from '@/lib/jobs';
import { getJobSlug } from '@/lib/job-slugs';
import { buildSynthesizedJobContent, hasSubstantialJobContent } from '@/lib/job-guides';
import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const revalidate = 3600; // Revalidate every hour

/**
 * Maps Web3 / Tech job departments and titles to Adzuna's standard 29 category IDs & labels.
 * Reference: https://www.adzuna.co.uk/jobs/xml-specification.html#JobCategories
 */
function mapToAdzunaCategory(title: string, department?: string): { id: number; name: string } {
  const text = `${title} ${department || ''}`.toLowerCase();

  if (/\b(accountant|accounting|finance|audit|tax|treasury|controller|billing|payroll)\b/i.test(text)) {
    return { id: 1, name: 'Accounting & Finance Jobs' };
  }
  if (/\b(sales|account executive|business development|\bbd\b|partnerships|account manager)\b/i.test(text)) {
    return { id: 3, name: 'Sales Jobs' };
  }
  if (/\b(customer|support|client success|customer success|helpdesk)\b/i.test(text)) {
    return { id: 4, name: 'Customer Services Jobs' };
  }
  if (/\b(hr|recruiter|recruiting|talent|people|human resources)\b/i.test(text)) {
    return { id: 6, name: 'HR & Recruitment Jobs' };
  }
  if (/\b(marketing|content|brand|growth|seo|social media|copywriter|communications|pr)\b/i.test(text)) {
    return { id: 9, name: 'PR, Advertising & Marketing Jobs' };
  }
  if (/\b(legal|counsel|compliance|regulatory|paralegal)\b/i.test(text)) {
    return { id: 14, name: 'Legal Jobs' };
  }
  if (/\b(designer|design|ui|ux|creative|art director|animator|illustrator)\b/i.test(text)) {
    return { id: 15, name: 'Creative & Design Jobs' };
  }
  if (/\b(qa|quality|security auditor|test engineer)\b/i.test(text)) {
    return { id: 20, name: 'Scientific & QA Jobs' };
  }
  if (/\b(consultant|consulting|strategy)\b/i.test(text)) {
    return { id: 18, name: 'Consultancy Jobs' };
  }

  // Default for Web3, Software, Protocols, Infrastructure, DevOps, Smart Contracts, Engineering
  return { id: 2, name: 'IT Jobs' };
}

/**
 * Extracts normalized contract details for Adzuna's strict enumeration:
 * contract_type: 'permanent' | 'contract'
 * contract_time: 'full_time' | 'part_time'
 */
function getContractDetails(typeStr?: string, titleStr?: string): { contract_type: string; contract_time: string } {
  const combined = `${typeStr || ''} ${titleStr || ''}`.toLowerCase();

  const isContractor = combined.includes('contract') || combined.includes('freelance') || combined.includes('consultant') || combined.includes('temp');
  const isPartTime = combined.includes('part-time') || combined.includes('parttime') || combined.includes('intern');

  return {
    contract_type: isContractor ? 'contract' : 'permanent',
    contract_time: isPartTime ? 'part_time' : 'full_time',
  };
}

/**
 * Strips HTML to plain text to calculate clean description length
 */
function getPlainTextLength(html: string): number {
  if (!html) return 0;
  return cheerio.load(html).text().replace(/\s+/g, ' ').trim().length;
}

export async function GET() {
  const siteUrl = 'https://hashtagweb3.com';
  const allJobs = await getJobs();

  const jobNodes: string[] = [];

  for (const job of allJobs) {
    const slug = getJobSlug(job);
    const canonicalUrl = `${siteUrl}/${slug}`;

    // Adzuna Requirement: title must be clean job title without location, salary, or urgent keywords
    const cleanTitle = (job.title || 'Web3 Opportunity')
      .replace(/[\s,-]*(?:remote|hybrid|full-time|part-time|contract|urgent|apply now)[\s,-]*/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Adzuna Requirement: description MUST contain HTML formatting and MUST be minimum 100 characters
    let rawContent = job.description || '';
    let synthesizedHtml = buildSynthesizedJobContent(job, rawContent);

    // If description length is under 120 chars, expand with structured application instructions
    if (getPlainTextLength(synthesizedHtml) < 120) {
      synthesizedHtml += `
<p><strong>About ${job.company}:</strong> ${job.company} is actively hiring for the position of <strong>${cleanTitle}</strong>. This role involves developing protocols, smart contracts, and Web3 infrastructure.</p>
<p><strong>Location & Setup:</strong> ${job.location || 'Remote / Flexible'}</p>
<p><strong>How to Apply:</strong> Click the apply link below to view full requirements and submit your application on Hashtag Web3.</p>
      `.trim();
    }

    // Wrap description content safely inside CDATA section
    const descriptionCdata = `<![CDATA[${synthesizedHtml}]]>`;

    // Adzuna Requirement: location must be a valid location string
    const rawLoc = (job.location || '').trim();
    let locationStr = rawLoc;
    let isRemote = 0;

    if (!rawLoc || /\b(remote|worldwide|anywhere|flexible)\b/i.test(rawLoc)) {
      locationStr = 'United Kingdom';
      isRemote = 1;
    } else if (rawLoc.toLowerCase().includes('remote')) {
      isRemote = 1;
    }

    // Adzuna Requirement: country code ISO_3166-1 or consistent identifier ('UK', 'US', 'IN', etc.)
    // Defaults to UK for UK remote postings, or extracts code if specified
    let countryCode = 'UK';
    if (/\b(united states|\busa?\b)\b/i.test(locationStr)) {
      countryCode = 'US';
    } else if (/\b(india|\bin\b)\b/i.test(locationStr)) {
      countryCode = 'IN';
    } else if (/\b(germany|\bde\b)\b/i.test(locationStr)) {
      countryCode = 'DE';
    } else if (/\b(france|\bfr\b)\b/i.test(locationStr)) {
      countryCode = 'FR';
    } else if (/\b(canada|\bca\b)\b/i.test(locationStr)) {
      countryCode = 'CA';
    } else if (/\b(singapore|\bsg\b)\b/i.test(locationStr)) {
      countryCode = 'SG';
    } else if (/\b(australia|\bau\b)\b/i.test(locationStr)) {
      countryCode = 'AU';
    }

    const { id: categoryId, name: categoryName } = mapToAdzunaCategory(cleanTitle, job.department);
    const { contract_type, contract_time } = getContractDetails(job.type, cleanTitle);
    const formattedDate = job.date ? new Date(job.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

    const xmlNode = `  <job>
    <title><![CDATA[${cleanTitle}]]></title>
    <id><![CDATA[${job.id || slug}]]></id>
    <description>${descriptionCdata}</description>
    <url><![CDATA[${canonicalUrl}]]></url>
    <location><![CDATA[${locationStr}]]></location>
    <country>${countryCode}</country>
    <remote>${isRemote}</remote>
    <company><![CDATA[${job.company}]]></company>
    <category><![CDATA[${categoryName}]]></category>
    <category_id>${categoryId}</category_id>
    <contract_type>${contract_type}</contract_type>
    <contract_time>${contract_time}</contract_time>
    <date>${formattedDate}</date>
  </job>`;

    jobNodes.push(xmlNode);
  }

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<jobs>
${jobNodes.join('\n')}
</jobs>`;

  return new NextResponse(xmlContent, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=7200, stale-while-revalidate=86400',
    },
  });
}
