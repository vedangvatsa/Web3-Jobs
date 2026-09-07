/**
 * Syndicate Job Feeds across search engines, general aggregators, and WebSub hubs.
 * 
 * STRICT POLICY:
 * ONLY submit to general search engines and global aggregators (Bing, Yandex, Google, Jooble, Adzuna, Jobrapido).
 * DO NOT send to Web3 competitors (web3.career, cryptojobslist, cryptocurrencyjobs, etc.).
 * 
 * 1. Submits all individual job URLs to IndexNow (Bing, Yandex, Seznam, Naver)
 * 2. Pings Google & Superfeedr PubSubHubbub (WebSub) hubs for instant RSS feed update
 * 3. Pings Ping-o-Matic, Blo.gs, and Twingly XML-RPC for blog & job search engine indexing
 * 4. Submits XML Feed applications to general global search engine aggregators only:
 *    - Jooble (xml_support@jooble.com, ats@jooble.jobs)
 *    - Adzuna (support@adzuna.com, supportuk@adzuna.com)
 *    - Jobrapido (support@jobrapido.com)
 *    - Feedspot RSS Directory (anuj@feedspot.com)
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

  // STRICTLY NON-COMPETITOR general aggregators and neutral directories
  const partners: PartnerSubmission[] = [
    {
      name: "Jooble Partner Integration",
      recipients: ["xml_support@jooble.com", "ats@jooble.jobs"],
      subject: "Job XML Feed Submission for Indexing — Hashtag Web3 (2,900+ Verified Web3 Vacancies)",
      messageHtml: `
<p>Hello Jooble Partnership and XML Integration Team,</p>
<p>We would like to submit our verified Web3 job board XML feed for indexing and syndication on Jooble.</p>
<ul>
  <li><strong>Website:</strong> <a href="https://hashtagweb3.com">https://hashtagweb3.com</a></li>
  <li><strong>XML Feed URL:</strong> <strong><a href="https://hashtagweb3.com/jobs/feed-aggregator.xml">https://hashtagweb3.com/jobs/feed-aggregator.xml</a></strong></li>
  <li><strong>RSS Feed:</strong> <a href="https://hashtagweb3.com/jobs/feed.xml">https://hashtagweb3.com/jobs/feed.xml</a></li>
  <li><strong>Active Openings:</strong> 2,900+ active positions across engineering, smart contracts, marketing, product, and operations.</li>
  <li><strong>Conforming Tags:</strong> Includes &lt;id&gt;, &lt;name&gt;, &lt;link&gt;, &lt;apply_url&gt;, &lt;region&gt;, &lt;company&gt;, &lt;pubdate&gt;, and CDATA descriptions.</li>
</ul>
<p>Please review and add our feed to your indexing schedule. Feel free to contact us with any questions.</p>
`,
    },
    {
      name: "Adzuna Partnerships",
      recipients: ["support@adzuna.com", "supportuk@adzuna.com"],
      subject: "Job XML Feed Submission for Adzuna Indexing — Hashtag Web3 (2,900+ Web3 Positions)",
      messageHtml: `
<p>Hello Adzuna Partnerships and Content Integration Team,</p>
<p>We would like to submit our specialized Web3 job board feed for indexing on Adzuna to broaden the reach of verified crypto, blockchain, and tech openings.</p>
<ul>
  <li><strong>Platform:</strong> Hashtag Web3 (<a href="https://hashtagweb3.com">https://hashtagweb3.com</a>)</li>
  <li><strong>Aggregator XML Feed:</strong> <strong><a href="https://hashtagweb3.com/jobs/feed-aggregator.xml">https://hashtagweb3.com/jobs/feed-aggregator.xml</a></strong></li>
  <li><strong>Standard RSS 2.0:</strong> <a href="https://hashtagweb3.com/jobs/feed.xml">https://hashtagweb3.com/jobs/feed.xml</a></li>
  <li><strong>Volume:</strong> Over 2,900 verified openings updated every 8 hours.</li>
  <li><strong>Feed Schema:</strong> Includes standard &lt;title&gt;, &lt;company&gt;, &lt;location&gt;, &lt;url&gt;, &lt;apply_url&gt;, and full vacancy descriptions.</li>
</ul>
<p>Please let us know once the feed has been validated or if you require any adjustments to the XML structure.</p>
`,
    },
    {
      name: "Jobrapido Partner Ingestion",
      recipients: ["support@jobrapido.com"],
      subject: "Job XML Feed Submission — Hashtag Web3 (2,900+ Vacancies)",
      messageHtml: `
<p>Hello Jobrapido Partnerships and Content Team,</p>
<p>We would like to submit our specialized tech and Web3 vacancy feed for inclusion in Jobrapido search results:</p>
<ul>
  <li><strong>Platform:</strong> Hashtag Web3 (<a href="https://hashtagweb3.com">https://hashtagweb3.com</a>)</li>
  <li><strong>XML Feed:</strong> <strong><a href="https://hashtagweb3.com/jobs/feed-aggregator.xml">https://hashtagweb3.com/jobs/feed-aggregator.xml</a></strong></li>
  <li><strong>Job Count:</strong> 2,900+ active positions updated regularly.</li>
  <li><strong>Fields:</strong> Title, company, region, apply_url, and full descriptions.</li>
</ul>
<p>Please let us know if you require any adjustments for feed crawling.</p>
`,
    },
    {
      name: "Feedspot RSS Directory",
      recipients: ["anuj@feedspot.com"],
      subject: "Feed Submission: Hashtag Web3 Jobs RSS Feed for Web3 Career Directory",
      messageHtml: `
<p>Hello Anuj and the Feedspot Editorial Team,</p>
<p>We would like to submit our RSS feed for inclusion in Feedspot's Web3 / Crypto career directories and top job feeds:</p>
<ul>
  <li><strong>Feed Name:</strong> Hashtag Web3 Jobs Feed</li>
  <li><strong>Website:</strong> <a href="https://hashtagweb3.com/jobs">https://hashtagweb3.com/jobs</a></li>
  <li><strong>RSS URL:</strong> <strong><a href="https://hashtagweb3.com/jobs/feed.xml">https://hashtagweb3.com/jobs/feed.xml</a></strong></li>
  <li><strong>Category:</strong> Web3 Careers, Blockchain Jobs, Tech Recruitment</li>
  <li><strong>Description:</strong> Daily verified job openings across smart contract security, decentralized finance, and crypto protocols.</li>
</ul>
<p>Thank you for curating top industry feeds!</p>
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
  console.log(" Hashtag Web3 - General Aggregator & Search Engine Syndication");
  console.log("==========================================================");

  const cachePath = path.join(rootDir, "content/jobs-cache.json");
  const rawJobs = JSON.parse(fs.readFileSync(cachePath, "utf-8"));
  console.log(`Loaded ${rawJobs.length} jobs from cache.`);

  const jobUrls: string[] = [];
  for (const job of rawJobs) {
    const slug = job.slug || job.id;
    if (slug) {
      jobUrls.push(`${siteUrl}/${slug}`);
    }
  }

  const staticUrls = [
    siteUrl,
    `${siteUrl}/jobs`,
    `${siteUrl}/jobs/feed.xml`,
    `${siteUrl}/feed.xml`,
    `${siteUrl}/jobs/feed-aggregator.xml`,
    `${siteUrl}/jobs/feed.json`,
    `${siteUrl}/companies`,
    `${siteUrl}/events`,
    `${siteUrl}/news`,
    `${siteUrl}/blog`,
    `${siteUrl}/glossary`,
  ];

  const totalUrlsToSubmit = Array.from(new Set([...staticUrls, ...jobUrls]));

  // Step 1: Submit all jobs to IndexNow (Bing & Yandex)
  await submitToIndexNow(totalUrlsToSubmit);

  // Step 2: Ping WebSub / PubSubHubbub (Google & Feedly)
  await pingWebSubHubs();

  // Step 3: Ping XML-RPC Services (Ping-o-Matic, Blo.gs, Twingly)
  await pingXmlRpcServices();

  // Step 4: Submit to General Search Aggregators only (Jooble, Adzuna, Jobrapido, Feedspot)
  await submitPartnerFeeds();

  console.log("\n==========================================================");
  console.log(" Syndications & submissions completed!");
  console.log("==========================================================\n");
}

main().catch(console.error);
