import { getJobs } from "@/lib/jobs";
import { getPublicJobUrl } from "@/lib/job-slugs";
import { NextResponse } from "next/server";

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  const siteUrl = "https://hashtagweb3.com";
  const allJobs = await getJobs();
  const feedJobs = allJobs.slice(0, 100);

  const items = feedJobs.map((job) => {
    // Canonical page only: never expose the internal ATS source URL.
    const url = getPublicJobUrl(job, siteUrl);

    return {
      id: url,
      url,
      title: `${job.title} at ${job.company}`,
      content_text: `${job.title} at ${job.company} (${job.location || "Remote"}). Apply at: ${url}`,
      date_published: job.date ? new Date(job.date).toISOString() : new Date().toISOString(),
      authors: [{ name: job.company }],
      tags: [job.department || "Web3", "Crypto", "Blockchain"].filter(Boolean),
    };
  });

  const feed = {
    version: "https://jsonfeed.org/version/1.1",
    title: "Hashtag Web3 Jobs Feed",
    home_page_url: `${siteUrl}/jobs`,
    feed_url: `${siteUrl}/jobs/feed.json`,
    description: "Verified Web3, smart contract, DeFi, and crypto job openings.",
    items,
  };

  return NextResponse.json(feed, {
    status: 200,
    headers: {
      "Content-Type": "application/feed+json; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=7200, stale-while-revalidate=86400",
    },
  });
}
