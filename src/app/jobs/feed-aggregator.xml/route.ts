import { getJobs } from "@/lib/jobs";
import { getJobSlug } from "@/lib/job-slugs";
import { buildSynthesizedJobContent } from "@/lib/job-guides";
import { NextResponse } from "next/server";

export const revalidate = 3600; // Cache for 1 hour

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
  // Include up to 500 verified jobs for aggregators
  const feedJobs = allJobs.slice(0, 500);

  const jobsXml = feedJobs
    .map((job) => {
      const slug = getJobSlug(job);
      const url = `${siteUrl}/${slug}`;
      const applyUrl = job.link || url;
      const title = job.title;
      const company = job.company;
      const location = job.location || "Remote";
      const department = job.department || "Web3 / Blockchain";
      const date = job.date || new Date().toISOString().split("T")[0];

      const rawDescription = buildSynthesizedJobContent(job);

      return `  <job id="${job.id || slug}">
    <id><![CDATA[${job.id || slug}]]></id>
    <title><![CDATA[${title}]]></title>
    <name><![CDATA[${title}]]></name>
    <company><![CDATA[${company}]]></company>
    <url><![CDATA[${url}]]></url>
    <link><![CDATA[${url}]]></link>
    <apply_url><![CDATA[${applyUrl}]]></apply_url>
    <location><![CDATA[${location}]]></location>
    <region><![CDATA[${location}]]></region>
    <category><![CDATA[${department}]]></category>
    <date>${date}</date>
    <pubdate>${date}</pubdate>
    <job_type>Full-time</job_type>
    <description><![CDATA[${rawDescription}]]></description>
  </job>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<jobs>
${jobsXml}
</jobs>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=7200, stale-while-revalidate=86400",
    },
  });
}
