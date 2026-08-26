import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { fetchJobOriginalContent, getJobBySlug } from '@/lib/job-guides';
import { getArticle } from '@/lib/articles';
import { getTerm } from '@/lib/glossary';
import { getCompanyBySlug } from '@/lib/companies';
import { getEventBySlug } from '@/lib/events-server';
import { getResourceByCanonicalSlug } from '@/lib/pseo/resources';

const KNOWN_STATIC_PATHS = new Set([
  '/',
  '/jobs',
  '/developers',
  '/docs',
  '/glossary',
  '/learn',
  '/auth',
  '/news',
  '/events',
  '/community',
  '/companies',
  '/about',
  '/contact',
  '/privacy',
  '/salary-calculator',
  '/resume-builder',
  '/invoice-generator',
  '/jd-builder',
  '/web3-career-quiz',
  '/web3-hiring-report',
  '/work-life-balance-survey',
  '/company-culture-guide',
  '/employee-engagement-survey',
  '/employee-exit-survey',
  '/employee-milestones-tracker',
  '/employee-onboarding-checklist',
  '/freelance-rates-by-industry',
  '/interview-feedback-template',
  '/interview-questions',
  '/offer-letter-customizer',
  '/remote-work-checklist',
  '/resources',
]);

function stripLeadingFrontmatter(content: string): string {
  const trimmed = content.replace(/^\uFEFF/, '').replace(/^\s+/, '');
  if (trimmed.startsWith('---')) {
    const end = trimmed.indexOf('\n---', 3);
    if (end !== -1) {
      return trimmed.slice(trimmed.indexOf('\n', end + 1)).replace(/^\s+/, '');
    }
  }
  return trimmed;
}

export async function GET(request: NextRequest) {
  try {
    const originalUrl = request.headers.get('x-original-url') || request.url;
    const url = new URL(originalUrl);
    const pathname = url.pathname;

    // Strip .md suffix if present for route lookup
    const cleanPath = pathname.replace(/\.md$/, '') || '/';
    const slug = cleanPath.replace(/^\//, '');
    const canonical = `https://hashtagweb3.com${cleanPath === '/' ? '' : cleanPath}`;

    // 1. Homepage
    if (cleanPath === '/') {
      const filePath = path.join(process.cwd(), 'public', 'llms.txt');
      const rawContent = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '# Hashtag Web3\n';
      return new NextResponse(stripLeadingFrontmatter(rawContent), {
        status: 200,
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Vary': 'Accept, Accept-Encoding, User-Agent',
          'X-Robots-Tag': 'index, follow',
          'X-AI-Usage': 'indexing=yes, search=yes, inference=yes, citation=yes',
          'Link': `<${canonical}>; rel="canonical"`,
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // 2. Core Section Hubs
    if (cleanPath === '/jobs') {
      const filePath = path.join(process.cwd(), 'public', 'jobs', 'llms.txt');
      const rawContent = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '# Web3 Jobs Directory\n';
      return new NextResponse(stripLeadingFrontmatter(rawContent), {
        status: 200,
        headers: { 'Content-Type': 'text/markdown; charset=utf-8', 'Access-Control-Allow-Origin': '*' },
      });
    }

    if (cleanPath === '/developers' || cleanPath === '/docs') {
      const filePath = path.join(process.cwd(), 'public', 'developers', 'llms.txt');
      const rawContent = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '# Developer Portal\n';
      return new NextResponse(stripLeadingFrontmatter(rawContent), {
        status: 200,
        headers: { 'Content-Type': 'text/markdown; charset=utf-8', 'Access-Control-Allow-Origin': '*' },
      });
    }

    if (cleanPath === '/glossary') {
      const filePath = path.join(process.cwd(), 'public', 'glossary-scoped.txt');
      const rawContent = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '# Web3 Glossary\n';
      return new NextResponse(stripLeadingFrontmatter(rawContent), {
        status: 200,
        headers: { 'Content-Type': 'text/markdown; charset=utf-8', 'Access-Control-Allow-Origin': '*' },
      });
    }

    if (cleanPath === '/learn') {
      const filePath = path.join(process.cwd(), 'public', 'learn', 'llms.txt');
      const rawContent = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '# Web3 Learn\n';
      return new NextResponse(stripLeadingFrontmatter(rawContent), {
        status: 200,
        headers: { 'Content-Type': 'text/markdown; charset=utf-8', 'Access-Control-Allow-Origin': '*' },
      });
    }

    if (cleanPath === '/auth') {
      const filePath = path.join(process.cwd(), 'public', 'auth.md');
      const rawContent = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '# Agent Authentication Guide\n';
      return new NextResponse(stripLeadingFrontmatter(rawContent), {
        status: 200,
        headers: { 'Content-Type': 'text/markdown; charset=utf-8', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // 3. Dynamic Job Check
    const jobSlug = cleanPath.startsWith('/jobs/')
      ? cleanPath.slice('/jobs/'.length)
      : slug;
    const job = await getJobBySlug(jobSlug);
    if (job) {
      const employerContent = await fetchJobOriginalContent(job);
      const verifiedDate = job.dateVerified === false
        ? null
        : new Date(job.date).toISOString().split('T')[0];
      const locationLine = job.location ? `- **Location**: ${job.location}\n` : '';
      const dateLine = verifiedDate ? `- **Date Posted**: ${verifiedDate}\n` : '';
      const dateFrontmatter = verifiedDate ? `date-posted: ${verifiedDate}\n` : '';
      const md = `---
title: ${JSON.stringify(`${job.title} at ${job.company}`)}
description: ${JSON.stringify(`${job.company}'s employer-provided details for the ${job.title} role.`)}
canonical: ${JSON.stringify(canonical)}
${dateFrontmatter.trimEnd()}
---

# ${job.title} at ${job.company}

- **Company**: [${job.company}](https://hashtagweb3.com/${(job.company || 'web3').toLowerCase().replace(/[^a-z0-9]+/g, '-')})
${locationLine}${dateLine}- **Application Link**: ${job.link}

## Employer-provided role details

${employerContent}
`;
      return new NextResponse(md, {
        status: 200,
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Vary': 'Accept, Accept-Encoding, User-Agent',
          'Link': `<${canonical}>; rel="canonical"`,
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // 4. Dynamic Company Check (canonical /[slug] plus legacy /companies/[slug])
    const companySlug = cleanPath.startsWith('/companies/')
      ? cleanPath.replace('/companies/', '')
      : slug.includes('/')
        ? null
        : slug;

    if (companySlug) {
      const company = await getCompanyBySlug(companySlug);
      if (company) {
        const companyCanonical = `https://hashtagweb3.com/${companySlug}`;
        const md = `---
title: ${company.name} Web3 Jobs & Company Profile
description: View active Web3 job openings and company profile for ${company.name}.
canonical: ${companyCanonical}
---

# ${company.name}

- **Website**: ${company.website || 'https://hashtagweb3.com'}
- **Active Openings**: ${company.jobCount || company.jobs?.length || 0}

## Open Positions
${(company.jobs || []).map((companyJob) => `- [${companyJob.title}](${companyJob.link})`).join('\n')}
`;
        return new NextResponse(md, {
          status: 200,
          headers: {
            'Content-Type': 'text/markdown; charset=utf-8',
            'Vary': 'Accept, Accept-Encoding, User-Agent',
            'Link': `<${companyCanonical}>; rel="canonical"`,
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
    }

    // 5. Dynamic Article Check
    const article = await getArticle(slug);
    if (article) {
      const md = stripLeadingFrontmatter(article.content);
      return new NextResponse(md, {
        status: 200,
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Vary': 'Accept, Accept-Encoding, User-Agent',
          'Link': `<${canonical}>; rel="canonical"`,
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // 6. Dynamic Glossary Term Check
    const term = await getTerm(slug);
    if (term) {
      const md = `---
title: ${term.term} - Web3 Glossary
description: ${term.description}
canonical: ${canonical}
category: ${term.category}
---

# ${term.term}

> Category: ${term.category}

## Definition
${term.description}

${term.content || ''}
`;
      return new NextResponse(md, {
        status: 200,
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Vary': 'Accept, Accept-Encoding, User-Agent',
          'Link': `<${canonical}>; rel="canonical"`,
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // 7. Dynamic Event Check
    const event = await getEventBySlug(slug);
    if (event) {
      const md = `---
title: ${event.name}
description: Web3 Event in ${event.location}
canonical: ${canonical}
---

# ${event.name}

- **Location**: ${event.location || 'Online'}
- **Start Date**: ${event.startDate || 'TBD'}
- **End Date**: ${event.endDate || 'TBD'}
- **Official Website**: ${event.url}

${event.description || ''}
`;
      return new NextResponse(md, {
        status: 200,
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Vary': 'Accept, Accept-Encoding, User-Agent',
          'Link': `<${canonical}>; rel="canonical"`,
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // 8. Dynamic Resource Check
    const resource = getResourceByCanonicalSlug(slug);
    if (resource) {
      const md = `---
title: ${resource.seo.title}
description: ${resource.seo.description}
canonical: ${canonical}
---

# ${resource.seo.title}

${resource.seo.description}
`;
      return new NextResponse(md, {
        status: 200,
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Vary': 'Accept, Accept-Encoding, User-Agent',
          'Link': `<${canonical}>; rel="canonical"`,
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // 9. Static Known Paths Check
    if (KNOWN_STATIC_PATHS.has(cleanPath)) {
      const md = `---
title: Hashtag Web3 - ${cleanPath.replace(/^\//, '')}
description: Web3 Career Platform & Intelligence Network
canonical: ${canonical}
---

# Hashtag Web3

Explore resources, tools, and job listings on Hashtag Web3 (${canonical}).
`;
      return new NextResponse(md, {
        status: 200,
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Vary': 'Accept, Accept-Encoding, User-Agent',
          'Link': `<${canonical}>; rel="canonical"`,
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // 10. AUTHENTIC 404 NOT FOUND (Non-existent path)
    const notFoundMarkdown = `---
title: 404 Not Found - Hashtag Web3
description: The requested resource does not exist on Hashtag Web3.
status: 404
canonical: ${canonical}
---

# 404 - Resource Not Found

The requested path \`${cleanPath}\` was not found on Hashtag Web3.

## Machine-Readable Agent Recovery Resources
- **Sitemap**: https://hashtagweb3.com/sitemap.xml
- **LLMs Navigation Index**: https://hashtagweb3.com/llms.txt
- **OpenAPI 3.1.0 Specification**: https://hashtagweb3.com/openapi.json
- **Developer API Documentation**: https://hashtagweb3.com/developers
- **MCP Server Manifest**: https://hashtagweb3.com/.well-known/mcp
- **Agent Capabilities**: https://hashtagweb3.com/.well-known/agents.json
- **Public Jobs API**: https://hashtagweb3.com/api/v1/jobs
- **Public Glossary API**: https://hashtagweb3.com/api/v1/glossary
- **Public News API**: https://hashtagweb3.com/api/v1/news
- **Public Events API**: https://hashtagweb3.com/api/v1/events
`;

    return new NextResponse(notFoundMarkdown, {
      status: 404,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Vary': 'Accept, Accept-Encoding, User-Agent',
        'X-Robots-Tag': 'noindex, nofollow',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error rendering markdown:', error);
    return new NextResponse(
      `# 404 - Not Found\n\nThe requested resource was not found. Please query https://hashtagweb3.com/llms.txt or https://hashtagweb3.com/sitemap.xml.\n`,
      {
        status: 404,
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Vary': 'Accept, Accept-Encoding, User-Agent',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}

export async function HEAD(request: NextRequest) {
  const response = await GET(request);
  return new NextResponse(null, {
    status: response.status,
    headers: response.headers,
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization, User-Agent',
    },
  });
}
