import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { buildUniqueJobMetaDescription, getJobBySlug } from '@/lib/job-guides';
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
  '/api-docs',
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

function ensureFrontmatter(content: string, meta: { title: string; description: string; canonical: string; lastUpdated?: string }): string {
  const trimmed = content.replace(/^\uFEFF/, '').trim();
  const dateStr = meta.lastUpdated || '2026-08-28';
  
  if (trimmed.startsWith('---')) {
    const end = trimmed.indexOf('\n---', 3);
    if (end !== -1) {
      // It already has frontmatter; ensure last-updated and canonical exist
      const existingFm = trimmed.slice(3, end);
      let updatedFm = existingFm;
      if (!updatedFm.includes('canonical:')) {
        updatedFm += `\ncanonical: ${JSON.stringify(meta.canonical)}`;
      }
      if (!updatedFm.includes('last-updated:') && !updatedFm.includes('lastUpdated:')) {
        updatedFm += `\nlast-updated: ${JSON.stringify(dateStr)}`;
      }
      return `---\n${updatedFm.trim()}\n---` + trimmed.slice(end + 4);
    }
  }

  // Prepend complete frontmatter block
  return `---
title: ${JSON.stringify(meta.title)}
description: ${JSON.stringify(meta.description)}
canonical: ${JSON.stringify(meta.canonical)}
last-updated: ${JSON.stringify(dateStr)}
---

${trimmed}
`;
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
    const todayStr = '2026-08-28';

    // 0. Check direct public markdown file matches (e.g. /AGENTS.md, /auth.md, etc.)
    const directPublicFiles = [
      path.join(process.cwd(), 'public', `${slug}.md`),
      path.join(process.cwd(), 'public', `${cleanPath}.md`),
      path.join(process.cwd(), `${slug}.md`),
    ];
    for (const p of directPublicFiles) {
      if (fs.existsSync(p) && fs.statSync(p).isFile()) {
        const rawContent = fs.readFileSync(p, 'utf8');
        const mdWithFm = ensureFrontmatter(rawContent, {
          title: `Hashtag Web3 - ${slug}`,
          description: `Hashtag Web3 developer resource and guide for ${slug}.`,
          canonical,
          lastUpdated: todayStr,
        });
        return new NextResponse(mdWithFm, {
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
    }

    // 1. Homepage / index.md
    if (cleanPath === '/' || cleanPath === '/index') {
      const filePath = path.join(process.cwd(), 'public', 'llms.txt');
      const rawContent = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '# Hashtag Web3\n';
      const mdWithFm = ensureFrontmatter(rawContent, {
        title: 'Hashtag Web3 - Web3 Jobs, Blockchain Careers & Intelligence Network',
        description: 'Premier Web3 job board, crypto career resource platform, developer APIs, and intelligence network.',
        canonical: 'https://hashtagweb3.com/',
        lastUpdated: todayStr,
      });
      return new NextResponse(mdWithFm, {
        status: 200,
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Vary': 'Accept, Accept-Encoding, User-Agent',
          'X-Robots-Tag': 'index, follow',
          'X-AI-Usage': 'indexing=yes, search=yes, inference=yes, citation=yes',
          'Link': `<https://hashtagweb3.com/>; rel="canonical"`,
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // 2. Core Section Hubs
    if (cleanPath === '/jobs') {
      const filePath = path.join(process.cwd(), 'public', 'jobs', 'llms.txt');
      const rawContent = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '# Web3 Jobs Directory\n';
      const mdWithFm = ensureFrontmatter(rawContent, {
        title: 'Hashtag Web3 - Web3 Jobs & Crypto Careers Directory',
        description: 'Browse thousands of verified smart contract, blockchain engineering, DeFi, and crypto jobs.',
        canonical: 'https://hashtagweb3.com/jobs',
        lastUpdated: todayStr,
      });
      return new NextResponse(mdWithFm, {
        status: 200,
        headers: { 'Content-Type': 'text/markdown; charset=utf-8', 'Access-Control-Allow-Origin': '*' },
      });
    }

    if (cleanPath === '/developers' || cleanPath === '/docs' || cleanPath === '/api-docs') {
      const filePath = path.join(process.cwd(), 'public', 'developers', 'llms.txt');
      const rawContent = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '# Developer Portal\n';
      const mdWithFm = ensureFrontmatter(rawContent, {
        title: 'Hashtag Web3 API Docs & Developer Portal',
        description: 'Official Hashtag Web3 API documentation, OpenAPI 3.1 specifications, REST endpoint reference, and MCP servers.',
        canonical: `https://hashtagweb3.com${cleanPath}`,
        lastUpdated: todayStr,
      });
      return new NextResponse(mdWithFm, {
        status: 200,
        headers: { 'Content-Type': 'text/markdown; charset=utf-8', 'Access-Control-Allow-Origin': '*' },
      });
    }

    if (cleanPath === '/glossary') {
      const filePath = path.join(process.cwd(), 'public', 'glossary-scoped.txt');
      const rawContent = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '# Web3 Glossary\n';
      const mdWithFm = ensureFrontmatter(rawContent, {
        title: 'Hashtag Web3 - 200+ Blockchain & Crypto Glossary Definitions',
        description: 'Comprehensive dictionary and reference for Web3, DeFi, Zero Knowledge, and blockchain concepts.',
        canonical: 'https://hashtagweb3.com/glossary',
        lastUpdated: todayStr,
      });
      return new NextResponse(mdWithFm, {
        status: 200,
        headers: { 'Content-Type': 'text/markdown; charset=utf-8', 'Access-Control-Allow-Origin': '*' },
      });
    }

    if (cleanPath === '/learn') {
      const filePath = path.join(process.cwd(), 'public', 'learn', 'llms.txt');
      const rawContent = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '# Web3 Learn\n';
      const mdWithFm = ensureFrontmatter(rawContent, {
        title: 'Hashtag Web3 - Interactive Web3 Learning Courses & Lessons',
        description: 'Structured Web3 development curricula covering Solidity, Rust, DeFi protocols, and security audits.',
        canonical: 'https://hashtagweb3.com/learn',
        lastUpdated: todayStr,
      });
      return new NextResponse(mdWithFm, {
        status: 200,
        headers: { 'Content-Type': 'text/markdown; charset=utf-8', 'Access-Control-Allow-Origin': '*' },
      });
    }

    if (cleanPath === '/auth') {
      const filePath = path.join(process.cwd(), 'public', 'auth.md');
      const rawContent = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '# Agent Authentication Guide\n';
      const mdWithFm = ensureFrontmatter(rawContent, {
        title: 'Hashtag Web3 - Agent Authentication Guide & Token Reference',
        description: 'WorkOS auth.md compliant agent registration, OAuth metadata, and bearer token workflow for Hashtag Web3.',
        canonical: 'https://hashtagweb3.com/auth.md',
        lastUpdated: todayStr,
      });
      return new NextResponse(mdWithFm, {
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
      const verifiedDate = job.dateVerified === false
        ? null
        : new Date(job.date).toISOString().split('T')[0];
      const locationLine = job.location ? `- **Location**: ${job.location}\n` : '';
      const dateLine = verifiedDate ? `- **Date Posted**: ${verifiedDate}\n` : '';
      const md = `---
title: ${JSON.stringify(`${job.title} at ${job.company}`)}
description: ${JSON.stringify(buildUniqueJobMetaDescription(job))}
canonical: ${JSON.stringify(canonical)}
last-updated: ${JSON.stringify(verifiedDate || todayStr)}
---

# ${job.title} at ${job.company}

- **Company**: [${job.company}](https://hashtagweb3.com/${(job.company || 'web3').toLowerCase().replace(/[^a-z0-9]+/g, '-')})
${locationLine}${dateLine}- **Application Link**: ${job.link}

## Independent role brief

${buildUniqueJobMetaDescription(job)}

This page is an original index entry. The employer link above is the authoritative source for the full responsibilities, requirements, compensation, and application status.
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

    // 4. Dynamic Company Check
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
title: ${JSON.stringify(`${company.name} Web3 Jobs & Company Profile`)}
description: ${JSON.stringify(`View active Web3 job openings and company profile for ${company.name}.`)}
canonical: ${JSON.stringify(companyCanonical)}
last-updated: ${JSON.stringify(todayStr)}
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
      const md = ensureFrontmatter(article.content, {
        title: article.title,
        description: article.description || `Hashtag Web3 career guide: ${article.title}`,
        canonical,
        lastUpdated: article.lastUpdated || article.publishedDate || todayStr,
      });
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
title: ${JSON.stringify(`${term.term} - Web3 Glossary`)}
description: ${JSON.stringify(term.description)}
canonical: ${JSON.stringify(canonical)}
last-updated: ${JSON.stringify(todayStr)}
category: ${JSON.stringify(term.category)}
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
title: ${JSON.stringify(event.name)}
description: ${JSON.stringify(`Web3 Event in ${event.location}`)}
canonical: ${JSON.stringify(canonical)}
last-updated: ${JSON.stringify(todayStr)}
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
title: ${JSON.stringify(resource.seo.title)}
description: ${JSON.stringify(resource.seo.description)}
canonical: ${JSON.stringify(canonical)}
last-updated: ${JSON.stringify(todayStr)}
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
title: ${JSON.stringify(`Hashtag Web3 - ${cleanPath.replace(/^\//, '')}`)}
description: "Web3 Career Platform, Developer APIs & Talent Intelligence Network"
canonical: ${JSON.stringify(canonical)}
last-updated: ${JSON.stringify(todayStr)}
---

# Hashtag Web3 - ${cleanPath.replace(/^\//, '')}

Explore verified resources, developer tools, and job listings on Hashtag Web3 (${canonical}).
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
title: "404 Not Found - Hashtag Web3"
description: "The requested resource does not exist on Hashtag Web3."
status: 404
canonical: ${JSON.stringify(canonical)}
last-updated: ${JSON.stringify(todayStr)}
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
      `---\ntitle: "Error - Hashtag Web3"\ndescription: "Resource unavailable"\ncanonical: "https://hashtagweb3.com/"\nlast-updated: "2026-08-28"\n---\n\n# 404 - Not Found\n\nThe requested resource was not found. Please query https://hashtagweb3.com/llms.txt or https://hashtagweb3.com/sitemap.xml.\n`,
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
