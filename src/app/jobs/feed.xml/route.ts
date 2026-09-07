import { getJobs } from "@/lib/jobs";
import { getJobSlug } from "@/lib/job-slugs";
import { NextResponse } from "next/server";

export const revalidate = 3600; // Cache for 1 hour on CDN

function escapeXml(unsafe: string): string {
  return (unsafe || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const siteUrl = "https://hashtagweb3.com";
  const allJobs = await getJobs();
  // Include up to 100 most recent verified jobs
  const feedJobs = allJobs.slice(0, 100);
  const nowRfc822 = new Date().toUTCString();

  const itemsXml = feedJobs
    .map((job) => {
      const slug = getJobSlug(job);
      const url = `${siteUrl}/${slug}`;
      const pubDate = job.date ? new Date(job.date).toUTCString() : nowRfc822;
      const title = `${job.title} at ${job.company}`;
      const location = job.location || "Remote";
      const department = job.department || "Web3 / Crypto";

      const descriptionHtml = `
<p><strong>Company:</strong> ${escapeXml(job.company)}</p>
<p><strong>Position:</strong> ${escapeXml(job.title)}</p>
<p><strong>Location:</strong> ${escapeXml(location)}</p>
<p><strong>Category:</strong> ${escapeXml(department)}</p>
<p><a href="${url}">View full job details and apply on Hashtag Web3</a></p>
      `.trim();

      return `    <item>
      <title><![CDATA[${title}]]></title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${descriptionHtml}]]></description>
      <category><![CDATA[${department}]]></category>
    </item>`;
    })
    .join("\n");

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Hashtag Web3 Jobs - Verified Crypto &amp; Web3 Careers</title>
    <link>${siteUrl}/jobs</link>
    <description>Find verified Web3, smart contract, DeFi, and crypto job openings. Updated daily for builders, engineers, and operators.</description>
    <language>en-us</language>
    <lastBuildDate>${nowRfc822}</lastBuildDate>
    <atom:link href="${siteUrl}/jobs/feed.xml" rel="self" type="application/rss+xml"/>
${itemsXml}
  </channel>
</rss>`;

  return new NextResponse(rssXml, {
    status: 200,
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=7200, stale-while-revalidate=86400",
    },
  });
}
