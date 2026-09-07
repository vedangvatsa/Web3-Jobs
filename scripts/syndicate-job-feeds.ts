/**
 * Syndicate Job Feeds across search engines, general aggregators, and WebSub hubs.
 * 
 * STRICT POLICY:
 * ONLY submit to general search engines and global aggregators (Bing, Yandex, Google, Jooble, Adzuna, Jobrapido, ZipRecruiter, PostJobFree, MyJobHelper, WhatJobs, JobisJob).
 * DO NOT send to Web3 competitors (web3.career, cryptojobslist, cryptocurrencyjobs, etc.).
 * 
 * Usage: npx tsx scripts/syndicate-job-feeds.ts
 */

import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";

const rootDir = path.resolve(__dirname, "../");
dotenv.config({ path: path.join(rootDir, ".env") });
dotenv.config({ path: path.join(rootDir, ".env.local"), override: true });

const siteUrl = "https://hashtagweb3.com";
const keys = [
  "1f8e4a6a875745e79ae76969de11a9c7",
  "5f98e9e755144404909369d2575e4ed7",
];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function submitToIndexNow(allUrls: string[]) {
  console.log(`\n1. [IndexNow] Submitting ${allUrls.length} URLs to Bing & Yandex...`);
  const endpoints = [
    "https://api.indexnow.org/indexnow",
    "https://yandex.com/indexnow",
  ];

  const chunkSize = 5000;
  for (let i = 0; i < allUrls.length; i += chunkSize) {
    const chunk = allUrls.slice(i, i + chunkSize);
    console.log(`  Sending chunk ${i / chunkSize + 1} (${chunk.length} URLs)...`);

    for (const endpoint of endpoints) {
      for (const key of keys) {
        try {
          const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json; charset=utf-8" },
            body: JSON.stringify({
              host: "hashtagweb3.com",
              key,
              keyLocation: `https://hashtagweb3.com/${key}.txt`,
              urlList: chunk,
            }),
          });
          console.log(`  ✓ ${endpoint} (key: ${key.slice(0, 8)}...) → ${res.status} ${res.statusText}`);
        } catch (err: any) {
          console.error(`  ✗ ${endpoint} error: ${err.message}`);
        }
      }
    }
  }
}

async function pingWebSubHubs() {
  console.log("\n2. [WebSub / PubSubHubbub] Pinging RSS feed updates...");
  const feeds = [
    `${siteUrl}/jobs/feed.xml`,
    `${siteUrl}/feed.xml`,
  ];
  const hubs = [
    "https://pubsubhubbub.appspot.com/",
    "https://pubsubhubbub.superfeedr.com/",
  ];

  for (const feed of feeds) {
    for (const hub of hubs) {
      try {
        const body = new URLSearchParams({
          "hub.mode": "publish",
          "hub.url": feed,
        });
        const res = await fetch(hub, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body,
        });
        console.log(`  ✓ Hub: ${hub} | Feed: ${feed} → ${res.status} ${res.statusText}`);
      } catch (err: any) {
        console.error(`  ✗ Hub error for ${hub}: ${err.message}`);
      }
    }
  }
}

async function pingXmlRpcServices() {
  console.log("\n3. [XML-RPC Pings] Broadcasting feeds to Ping-o-Matic, Blo.gs & Twingly...");
  const pingServices = [
    { name: "Ping-o-Matic", url: "http://rpc.pingomatic.com/" },
    { name: "Blo.gs", url: "http://ping.blo.gs/" },
    { name: "Twingly", url: "http://rpc.twingly.com/" },
  ];

  const xmlPayload = `<?xml version="1.0"?>
<methodCall>
  <methodName>weblogUpdates.ping</methodName>
  <params>
    <param><value>Hashtag Web3 Jobs</value></param>
    <param><value>https://hashtagweb3.com/jobs</value></param>
    <param><value>https://hashtagweb3.com/jobs/feed.xml</value></param>
  </params>
</methodCall>`;

  for (const s of pingServices) {
    try {
      const res = await fetch(s.url, {
        method: "POST",
        headers: {
          "Content-Type": "text/xml",
          "User-Agent": "HashtagWeb3-FeedSyndicator/1.0",
        },
        body: xmlPayload,
      });
      const text = await res.text();
      const isSuccess = res.ok && (text.includes("<boolean>0</boolean>") || text.includes("Thanks") || text.includes("flerror"));
      console.log(`  ✓ ${s.name} response: ${isSuccess ? "Success" : "HTTP " + res.status}`);
    } catch (err: any) {
      console.warn(`  ✗ ${s.name} ping note: ${err.message}`);
    }
  }
}

interface PartnerSubmission {
  name: string;
  recipients: string[];
  subject: string;
  messageHtml: string;
}

async function submitPartnerFeeds() {
  console.log("\n4. [General Aggregator & Directory Syndication] Submitting XML & RSS feeds...");
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.log("  Skipping partner submissions: RESEND_API_KEY not found.");
    return;
  }

  // STRICTLY NON-COMPETITOR general aggregators and neutral global directories
  const partners: PartnerSubmission[] = [
    {
      name: "ZipRecruiter Integration",
      recipients: ["atsintegrations@ziprecruiter.com"],
      subject: "Job XML Feed Submission for Indexing — Hashtag Web3 (2,900+ Verified Tech Vacancies)",
      messageHtml: `
<p>Hello ZipRecruiter ATS and Partner Integration Team,</p>
<p>We would like to submit our verified Web3 and tech job feed for indexing and syndication on ZipRecruiter.</p>
<ul>
  <li><strong>Platform:</strong> Hashtag Web3 (<a href="https://hashtagweb3.com">https://hashtagweb3.com</a>)</li>
  <li><strong>Aggregator XML Feed:</strong> <strong><a href="https://hashtagweb3.com/jobs/feed-aggregator.xml">https://hashtagweb3.com/jobs/feed-aggregator.xml</a></strong></li>
  <li><strong>Standard RSS 2.0 Feed:</strong> <a href="https://hashtagweb3.com/jobs/feed.xml">https://hashtagweb3.com/jobs/feed.xml</a></li>
  <li><strong>Active Openings:</strong> 2,900+ verified active openings across engineering, smart contracts, product, and operations.</li>
  <li><strong>Feed Schema:</strong> Includes standard &lt;id&gt;, &lt;title&gt;, &lt;name&gt;, &lt;company&gt;, &lt;location&gt;, &lt;region&gt;, &lt;apply_url&gt;, &lt;url&gt;, &lt;date&gt;, and CDATA descriptions.</li>
</ul>
<p>Please review and let us know if you require any specific technical adjustments to ingest our feed into the ZipRecruiter partner network.</p>
`,
    },
    {
      name: "PostJobFree Ingestion",
      recipients: ["support@postjobfree.com"],
      subject: "Job Feed Submission for Indexing — Hashtag Web3 (XML/RSS)",
      messageHtml: `
<p>Hello PostJobFree Support Team,</p>
<p>We would like to submit our job board feed for indexing on PostJobFree:</p>
<ul>
  <li><strong>Website:</strong> <a href="https://hashtagweb3.com">https://hashtagweb3.com</a></li>
  <li><strong>Job Board:</strong> <a href="https://hashtagweb3.com/jobs">https://hashtagweb3.com/jobs</a></li>
  <li><strong>XML Feed:</strong> <strong><a href="https://hashtagweb3.com/jobs/feed-aggregator.xml">https://hashtagweb3.com/jobs/feed-aggregator.xml</a></strong></li>
  <li><strong>RSS Feed:</strong> <a href="https://hashtagweb3.com/jobs/feed.xml">https://hashtagweb3.com/jobs/feed.xml</a></li>
  <li><strong>Volume:</strong> 2,900+ active tech, software, and blockchain positions updated daily.</li>
</ul>
<p>Thank you for indexing our feed!</p>
`,
    },
    {
      name: "MyJobHelper Partnerships",
      recipients: ["advertise@myjobhelper.com", "info@myjobhelper.com"],
      subject: "Job XML Feed Submission & Syndication — Hashtag Web3 (2,900+ Vacancies)",
      messageHtml: `
<p>Hello MyJobHelper Partnerships Team,</p>
<p>We would like to submit our specialized tech and Web3 vacancy feed for syndication on MyJobHelper:</p>
<ul>
  <li><strong>Platform:</strong> Hashtag Web3 (<a href="https://hashtagweb3.com">https://hashtagweb3.com</a>)</li>
  <li><strong>XML Feed URL:</strong> <strong><a href="https://hashtagweb3.com/jobs/feed-aggregator.xml">https://hashtagweb3.com/jobs/feed-aggregator.xml</a></strong></li>
  <li><strong>Total Vacancies:</strong> 2,900+ verified active openings.</li>
  <li><strong>Format:</strong> Structured XML feed with direct employer application URLs.</li>
</ul>
<p>Please let us know once the feed is integrated into your network.</p>
`,
    },
    {
      name: "WhatJobs Integration",
      recipients: ["contact@whatjobs.com"],
      subject: "Job XML Feed Submission for Publisher Indexing — Hashtag Web3",
      messageHtml: `
<p>Hello WhatJobs Publisher Team,</p>
<p>We would like to submit our verified job board feed for indexing on WhatJobs:</p>
<ul>
  <li><strong>Website:</strong> <a href="https://hashtagweb3.com">https://hashtagweb3.com</a></li>
  <li><strong>XML Feed:</strong> <strong><a href="https://hashtagweb3.com/jobs/feed-aggregator.xml">https://hashtagweb3.com/jobs/feed-aggregator.xml</a></strong></li>
  <li><strong>Openings:</strong> 2,900+ active tech, engineering, and remote positions.</li>
</ul>
<p>Looking forward to partner syndication.</p>
`,
    },
    {
      name: "JobisJob Publisher Integration",
      recipients: ["info@jobisjob.com"],
      subject: "Job XML Feed Submission — Hashtag Web3 (2,900+ Positions)",
      messageHtml: `
<p>Hello JobisJob Publisher Team,</p>
<p>We would like to submit our verified job board XML feed for inclusion in JobisJob global search results:</p>
<ul>
  <li><strong>Website:</strong> <a href="https://hashtagweb3.com">https://hashtagweb3.com</a></li>
  <li><strong>XML Feed:</strong> <strong><a href="https://hashtagweb3.com/jobs/feed-aggregator.xml">https://hashtagweb3.com/jobs/feed-aggregator.xml</a></strong></li>
  <li><strong>Volume:</strong> 2,900+ verified tech and Web3 openings with direct apply URLs.</li>
</ul>
<p>Please let us know if our feed can be added to your crawl schedule.</p>
`,
    },
  ];

  for (const partner of partners) {
    try {
      const emailPayload = {
        from: "Hashtag Web3 <alerts@hashtagweb3.com>",
        to: partner.recipients,
        reply_to: "support@hashtagweb3.com",
        subject: partner.subject,
        html: `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; line-height: 1.6; color: #1e293b;">
  ${partner.messageHtml}
  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
  <p style="font-size: 13px; color: #64748b;">
    <strong>Hashtag Web3</strong> &bull; <a href="https://hashtagweb3.com" style="color: #0284c7;">hashtagweb3.com</a><br />
    Verified Web3 Careers, Salary Data, and Hiring Infrastructure.
  </p>
</div>
`,
      };

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify(emailPayload),
      });
      const data = (await res.json()) as any;
      if (res.ok) {
        console.log(`  ✓ ${partner.name} submitted successfully! (ID: ${data.id})`);
      } else {
        console.warn(`  ✗ ${partner.name} notice: ${JSON.stringify(data)}`);
      }
    } catch (err: any) {
      console.error(`  ✗ Error submitting to ${partner.name}: ${err.message}`);
    }
    await sleep(600);
  }
}

async function main() {
  console.log("==========================================================");
  console.log(" Hashtag Web3 - Expanded Global Aggregator Syndication");
  console.log("==========================================================");

  // Submit to newly added global aggregators
  await submitPartnerFeeds();

  console.log("\n==========================================================");
  console.log(" All new aggregator submissions completed!");
  console.log("==========================================================\n");
}

main().catch(console.error);
