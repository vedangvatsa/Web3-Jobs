import { getJobs } from '@/lib/jobs';
import { getJobSlug, getPublicJobUrl } from '@/lib/job-slugs';
import { buildFeedDescription } from '@/lib/job-guides';
import { getFeedLocation, getFeedRegion, getRecentFeedJobs } from '@/lib/job-feed-helpers';
import { NextResponse } from 'next/server';

/** Shared Jooble-style XML job feed (served at /jooble.xml). */
export async function buildJoobleFeedResponse(): Promise<NextResponse> {
  const siteUrl = 'https://hashtagweb3.com';
  const allJobs = await getJobs();
  const feedJobs = getRecentFeedJobs(allJobs).slice(0, 250);

  const jobsXml = feedJobs
    .map((job) => {
      const slug = getJobSlug(job);
      const url = getPublicJobUrl(job, siteUrl);
      const applyUrl = url;
      const title = job.title;
      const company = job.company;
      const location = getFeedLocation(job);
      const department = job.department || 'Web3 / Blockchain';
      const date = job.date || new Date().toISOString().split('T')[0];
      const rawDescription = buildFeedDescription(job)
        .replace(/https?:\/\/[^\s<>'"]+/gi, '')
        .replace(/&amp;/g, '&');

      return `  <job id="${job.id || slug}">
    <id><![CDATA[${job.id || slug}]]></id>
    <title><![CDATA[${title}]]></title>
    <name><![CDATA[${title}]]></name>
    <company><![CDATA[${company}]]></company>
    <url><![CDATA[${url}]]></url>
    <link><![CDATA[${url}]]></link>
    <apply_url><![CDATA[${applyUrl}]]></apply_url>
    <location><![CDATA[${location}]]></location>
    <region><![CDATA[${getFeedRegion(location)}]]></region>
    <category><![CDATA[${department}]]></category>
    <date>${date}</date>
    <pubdate>${date}</pubdate>
    <job_type>Full-time</job_type>
    <description><![CDATA[${rawDescription}]]></description>
  </job>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<jobs>
${jobsXml}
</jobs>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=7200, stale-while-revalidate=86400',
    },
  });
}
