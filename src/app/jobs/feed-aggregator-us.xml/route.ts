import { getJobs } from '@/lib/jobs';
import { getJobSlug } from '@/lib/job-slugs';
import { buildSynthesizedJobContent } from '@/lib/job-guides';
import { getFeedLocation, getRecentFeedJobs, isUsOrRemoteJob } from '@/lib/job-feed-helpers';
import { NextResponse } from 'next/server';

export const revalidate = 3600;

function cdata(value: unknown): string {
  return String(value || '').replace(/]]>/g, ']]]]><![CDATA[>');
}

export async function GET() {
  const siteUrl = 'https://hashtagweb3.com';
  const feedJobs = getRecentFeedJobs(await getJobs()).filter(isUsOrRemoteJob);
  const jobsXml = feedJobs.map((job) => {
    const slug = getJobSlug(job);
    const url = `${siteUrl}/${slug}`;
    const location = getFeedLocation(job);
    const description = buildSynthesizedJobContent(job).replace(/https?:\/\/[^\s<>'"]+/gi, '');
    const date = job.date || new Date().toISOString().split('T')[0];

    return `  <job id="${job.id || slug}">
    <id><![CDATA[${cdata(job.id || slug)}]]></id>
    <title><![CDATA[${cdata(job.title)}]]></title>
    <name><![CDATA[${cdata(job.title)}]]></name>
    <company><![CDATA[${cdata(job.company)}]]></company>
    <url><![CDATA[${url}]]></url>
    <link><![CDATA[${url}]]></link>
    <apply_url><![CDATA[${cdata(url)}]]></apply_url>
    <location><![CDATA[${cdata(location)}]]></location>
    <region><![CDATA[United States]]></region>
    <category><![CDATA[${cdata(job.department || 'Web3 / Blockchain')}]]></category>
    <date>${date}</date>
    <pubdate>${date}</pubdate>
    <job_type>Full-time</job_type>
    <description><![CDATA[${cdata(description)}]]></description>
  </job>`;
  }).join('\n');

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
