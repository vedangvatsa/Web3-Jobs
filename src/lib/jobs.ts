
import Parser from 'rss-parser';
import type { Job } from '@/types';

const FEEDS = [
  'https://politepol.com/fd/JEeZwG4KK7uT.xml',
  'https://politepol.com/fd/HI6pMDlyEO7j.xml',
  'https://politepol.com/fd/sDzglCq7RCpG.xml',
  'https://politepol.com/fd/bs9i34afSjHS.xml',
  'https://politepol.com/fd/oiXKHETnrDap.xml',
  'https://politepol.com/fd/Ane01VX84MOk.xml',
  'https://politepol.com/fd/gG8gJ7wV2YjA.xml',
];

const staticJobs: Omit<Job, 'id' | 'date' | 'source'>[] = [
    {
        "company": "Ripple",
        "title": "Regulatory Compliance Director",
        "link": "https://ripple.com/careers/all-jobs/job/7139433?gh_jid=7139433"
    },
    {
        "company": "Coinbase",
        "title": "Software Engineer, Machine Learning Platform Engineer",
        "link": "https://www.coinbase.com/careers/positions/7137833?gh_jid=7137833"
    },
    {
        "company": "Subzero Labs",
        "title": "Technical Writer and Content Architect",
        "link": "https://jobs.ashbyhq.com/subzero/453bd199-77e8-42a5-9525-5fa07b474a7a"
    },
    {
        "company": "Anchorage",
        "title": "Communications Manager",
        "link": "https://jobs.lever.co/anchorage/56aedded-c959-4488-b265-5cc42a182dca"
    },
    {
        "company": "BitGo",
        "title": "DevOps Engineer - InfraOps",
        "link": "https://job-boards.greenhouse.io/bitgo/jobs/8114200002"
    },
    {
        "company": "Bitso",
        "title": "Engineering Manager",
        "link": "https://bitso.com/jobs?gh_jid=6676381003"
    },
    {
        "company": "CoinDCX",
        "title": "Assistant Manager – YouTube Channel Operations",
        "link": "https://careers.coindcx.com/careers?p=eyJwYWdlVHlwZSI6ICJqZCIsICJjdlNvdXJjZSI6ICJjYXJlZXJzIiwgInJlcUlkIjogMTI3MywgInJlcXVlc3RlciI6IHsiaWQiOiAiIiwgImNvZGUiOiAiIiwgIm5hbWUiOiAiIn0sICJwYWdlIjogImNhcmVlcnMiLCAiYnVmaWx0ZXIiOiAtMSwgImN1c3RvbUZpZWxkcyI6IHt9fQ=="
    },
    {
        "company": "VALR",
        "title": "Financial Crime Compliance Analyst",
        "link": "https://valr.careers.hibob.com/jobs/04b1c6b5-2226-4cc6-a05e-0d82bcde1aba"
    },
    {
        "company": "Injective Labs",
        "title": "Quant Researcher",
        "link": "https://jobs.ashbyhq.com/injective-labs/cb413537-43b1-4470-8361-8836ff0f7bf6"
    },
    {
        "company": "0x Labs",
        "title": "Senior Software Engineer, DEX Routing",
        "link": "https://jobs.ashbyhq.com/0x/90ceeaba-c441-4eb7-bce6-0039c6865a58"
    },
    {
        "company": "Stader Labs",
        "title": "Marketing Intern",
        "link": "https://www.linkedin.com/jobs/view/marketing-intern-at-stader-labs-4282932017"
    },
    {
        "company": "Livepeer",
        "title": "Head of Growth and Marketing",
        "link": "https://livepeer.teamtailor.com/jobs/6286661-head-of-growth-and-marketing"
    },
    {
        "company": "Amber Group",
        "title": "Compliance Officer",
        "link": "https://www.linkedin.com/jobs/view/compliance-officer-at-amber-group-4281584732"
    },
    {
        "company": "Xapo Bank",
        "title": "Finance Graduate",
        "link": "https://job-boards.greenhouse.io/xapo61/jobs/6667460003"
    },
    {
        "company": "Circle",
        "title": "Business Development Director, Ecosystem",
        "link": "https://circle.wd1.myworkdayjobs.com/Circle/job/San-Francisco---remote-first-in-US/Business-Development-Director--Ecosystem_JR100532"
    },
    {
        "company": "Ripple",
        "title": "Senior Technical Writer, Blockchain Solutions",
        "link": "https://ripple.com/careers/all-jobs/job/7134809?gh_jid=7134809"
    },
    {
        "company": "Coinbase",
        "title": "Compliance Manager",
        "link": "https://www.coinbase.com/careers/positions/7134959?gh_jid=7134959"
    },
    {
        "company": "Coinbase",
        "title": "Supervisor, Concierge",
        "link": "https://www.coinbase.com/careers/positions/7156049?gh_jid=7156049"
    },
    {
        "company": "Coinbase",
        "title": "Supervisor, Customer Success Team",
        "link": "https://www.coinbase.com/careers/positions/7021478?gh_jid=7021478"
    },
    {
        "company": "Coinbase",
        "title": "Supervisor, Customer Success Team (Seattle, WA)",
        "link": "https://www.coinbase.com/careers/positions/7021480?gh_jid=7021480"
    },
    {
        "company": "Coinbase",
        "title": "AI Growth Lead (AI Automation DRI)",
        "link": "https://www.coinbase.com/careers/positions/7155982?gh_jid=7155982"
    },
    {
        "company": "Coinbase",
        "title": "AI Growth Lead (AI Automation DRI)",
        "link": "https://www.coinbase.com/careers/positions/7008466?gh_jid=7008466"
    },
    {
        "company": "Coinbase",
        "title": "Compliance QA Analyst IV",
        "link": "https://www.coinbase.com/careers/positions/7140867?gh_jid=7140867"
    },
    {
        "company": "Ripple",
        "title": "Senior Finance Integration Manager",
        "link": "https://ripple.com/careers/all-jobs/job/7139384?gh_jid=7139384"
    },
    {
        "company": "BitGo",
        "title": "Mobile Software Engineer E3 - (React Native)",
        "link": "https://job-boards.greenhouse.io/bitgo/jobs/8113483002"
    },
    {
        "company": "BitGo",
        "title": "Senior Software Engineer - Mobile (React Native)",
        "link": "https://job-boards.greenhouse.io/bitgo/jobs/8113473002"
    },
    {
        "company": "BitGo",
        "title": "Software Engineer (Full-Stack) - Access & Notifications",
        "link": "https://job-boards.greenhouse.io/bitgo/jobs/8114204002"
    },
    {
        "company": "BitGo",
        "title": "Software Engineer (Full-Stack) - Access & Notifications",
        "link": "https://job-boards.greenhouse.io/bitgo/jobs/8108788002"
    },
    {
        "company": "Coinbase",
        "title": "TMS Compliance Analyst 4",
        "link": "https://www.coinbase.com/careers/positions/7078159?gh_jid=7078159"
    },
    {
        "company": "Coinbase",
        "title": "TMS Compliance Analyst 4",
        "link": "https://www.coinbase.com/careers/positions/7078204?gh_jid=7078204"
    },
    {
        "company": "Ripple",
        "title": "Senior Manager - Salesforce Developer",
        "link": "https://ripple.com/careers/all-jobs/job/7138108?gh_jid=7138108"
    },
    {
        "company": "CoinDCX",
        "title": "Specialist - Growth",
        "link": "https://careers.coindcx.com/careers?p=eyJwYWdlVHlwZSI6ICJqZCIsICJjdlNvdXJjZSI6ICJjYXJlZXJzIiwgInJlcUlkIjogMTI3MSwgInJlcXVlc3RlciI6IHsiaWQiOiAiIiwgImNvZGUiOiAiIiwgIm5hbWUiOiAiIn0sICJwYWdlIjogImNhcmVlcnMiLCAiYnVmaWx0ZXIiOiAtMSwgImN1c3RvbUZpZWxkcyI6IHt9fQ=="
    },
    {
        "company": "CoinDCX",
        "title": "Assistant Manager - Events & Partner Marketing",
        "link": "https://careers.coindcx.com/careers?p=eyJwYWdlVHlwZSI6ICJqZCIsICJjdlNvdXJjZSI6ICJjYXJlZXJzIiwgInJlcUlkIjogMTI3MCwgInJlcXVlc3RlciI6IHsiaWQiOiAiIiwgImNvZGUiOiAiIiwgIm5hbWUiOiAiIn0sICJwYWdlIjogImNhcmVlcnMiLCAiYnVmaWx0ZXIiOiAtMSwgImN1c3RvbUZpZWxkcyI6IHt9fQ=="
    },
    {
        "company": "Ripple",
        "title": "Senior Manager - Salesforce Developer",
        "link": "https://ripple.com/careers/all-jobs/job/7138120?gh_jid=7138120"
    },
    {
        "company": "Anchorage",
        "title": "Member of Global Markets, Weekend Sales & Trading",
        "link": "https://jobs.lever.co/anchorage/347b34d7-3ff0-4db7-9822-a1bfbfaa68b7"
    },
    {
        "company": "Coinbase",
        "title": "Senior Manager Compliance Operations",
        "link": "https://www.coinbase.com/careers/positions/7134963?gh_jid=7134963"
    },
    {
        "company": "Bitso",
        "title": "Machine Learning Engineer I",
        "link": "https://bitso.com/jobs?gh_jid=6676691003"
    },
    {
        "company": "VALR",
        "title": "Content Manager",
        "link": "https://valr.careers.hibob.com/jobs/6b280629-9c30-45ad-8efc-bb782a897d6d"
    },
    {
        "company": "VALR",
        "title": "Senior Product Designer",
        "link": "https://valr.careers.hibob.com/jobs/f92b3c58-6cae-4aa9-8422-c8635442ddda"
    },
    {
        "company": "VALR",
        "title": "Head of Payments",
        "link": "https://valr.careers.hibob.com/jobs/4d19106b-632e-4f81-a3d5-5171958f2844"
    },
    {
        "company": "Sahara AI",
        "title": "Business Development, AI",
        "link": "https://jobs.ashbyhq.com/Sahara/f58cff51-0b04-4ddf-8784-e59a13d424b3"
    },
    {
        "company": "Pintu",
        "title": "KYC Staff",
        "link": "https://careers.pintu.co.id/jobs/6278759-kyc-staff"
    },
    {
        "company": "Ripple",
        "title": "Software Engineer II",
        "link": "https://ripple.com/careers/all-jobs/job/7134182?gh_jid=7134182"
    },
    {
        "company": "Circle",
        "title": "Senior Finance Systems Analyst",
        "link": "https://circle.wd1.myworkdayjobs.com/Circle/job/New-York-City---remote-first-in-US/Senior-Finance-Systems-Analyst_JR100530"
    },
    {
        "company": "Bitstamp",
        "title": "Senior Python Engineer - Prime Team",
        "link": "https://apply.workable.com/j/AE99C3B107"
    },
    {
        "company": "Bitstamp",
        "title": "Senior Full Stack Engineer - Prime Team",
        "link": "https://apply.workable.com/j/216FA06B39"
    },
    {
        "company": "Bitstamp",
        "title": "Senior Golang Engineer - Exchange API Team",
        "link": "https://apply.workable.com/j/9FD1276ED1"
    },
    {
        "company": "Bitstamp",
        "title": "Golang Engineer - Exchange API Team",
        "link": "https://apply.workable.com/j/375701248F"
    },
    {
        "company": "Bitstamp",
        "title": "Accounting Controller",
        "link": "https://apply.workable.com/j/DD7BCF9CFB"
    },
    {
        "company": "Bitstamp",
        "title": "Senior AML Analyst",
        "link": "https://apply.workable.com/j/788EA4313B"
    },
    {
        "company": "Polkadot",
        "title": "Asset and Treasury Manager",
        "link": "https://web3.bamboohr.com/careers/139"
    },
    {
        "company": "0x Labs",
        "title": "Blockchain Support Engineer",
        "link": "https://jobs.ashbyhq.com/0x/08631de8-6f22-410d-824d-ccc5788e0747"
    },
    {
        "company": "Bitstamp",
        "title": "Senior Golang Engineer - Derivatives Team",
        "link": "https://apply.workable.com/j/44AB7E8B34"
    },
    {
        "company": "Bitstamp",
        "title": "Senior Golang Engineer - Core Exchange Team",
        "link": "https://apply.workable.com/j/09D5797D16"
    },
    {
        "company": "Bitstamp",
        "title": "Head of Regulatory Compliance Policy & Governance",
        "link": "https://apply.workable.com/j/C71ABF85BD"
    },
    {
        "company": "Bitstamp",
        "title": "Technical Account Manager - Singapore",
        "link": "https://apply.workable.com/j/BC8252EA48"
    },
    {
        "company": "Bitstamp",
        "title": "Sanctions Compliance Manager",
        "link": "https://apply.workable.com/j/96D76BC0AE"
    },
    {
        "company": "Ripple",
        "title": "Senior Software Engineer - Platform",
        "link": "https://ripple.com/careers/all-jobs/job/7138718?gh_jid=7138718"
    },
    {
        "company": "Pintu",
        "title": "Growth and CRM Specialist",
        "link": "https://careers.pintu.co.id/jobs/6274381-growth-and-crm-specialist"
    },
    {
        "company": "Pintu",
        "title": "Performance Marketing Specialist",
        "link": "https://careers.pintu.co.id/jobs/6274088-performance-marketing-specialist"
    },
    {
        "company": "Amber Group",
        "title": "AM - Desk Quants - Product Manager (AI)",
        "link": "https://www.linkedin.com/jobs/view/am-desk-quants-product-manager-ai-at-amber-group-4280838202"
    },
    {
        "company": "Alchemy",
        "title": "Sales Development Representative",
        "link": "https://job-boards.greenhouse.io/alchemy/jobs/4593927005"
    },
    {
        "company": "BCB Group",
        "title": "Senior Full Stack Engineer",
        "link": "https://job-boards.eu.greenhouse.io/bcbgroup/jobs/4650516101"
    },
    {
        "company": "BCB Group",
        "title": "Senior Full Stack Engineer",
        "link": "https://job-boards.eu.greenhouse.io/bcbgroup/jobs/4650502101"
    },
    {
        "company": "Circle",
        "title": "Senior Counsel, Transactions, EMEA",
        "link": "https://circle.wd1.myworkdayjobs.com/Circle/job/London---remote-first-in-UK/Senior-Counsel--Transactions--EMEA_JR100531"
    },
    {
        "company": "0x Labs",
        "title": "Senior Mobile Engineer | Matcha",
        "link": "https://jobs.ashbyhq.com/0x/e67bf7d9-6522-4bb5-85a9-84b01f4883ab"
    },
    {
        "company": "Bitstamp",
        "title": "Jr. People Experience Analyst - student",
        "link": "https://apply.workable.com/j/F0AE3A8712"
    }
];

const parser = new Parser();

// Helper function to strip HTML and clean the company name
function cleanCompany(company: string | undefined): string | undefined {
    if (!company) return undefined;
    // Strip HTML tags and then take only the first line.
    return company.replace(/<[^>]*>?/gm, '').split('\n')[0].trim();
}

// Helper function to remove emojis from a string
function removeEmojis(text: string | undefined): string | undefined {
  if (!text) return undefined;
  // This regex removes most common emojis.
  return text.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '').trim();
}

export async function getJobs(): Promise<Job[]> {
  const allJobsPromises = FEEDS.map(async (feedUrl) => {
    try {
      const feed = await parser.parseURL(feedUrl);
      if (feed?.items) {
        return feed.items.map((item) => {
          const title = removeEmojis(item.title?.trim());
          const company = cleanCompany(item.content);
          const link = item.link;

          if (title && company && link) {
            return {
              id: item.guid || link,
              title,
              company,
              link,
              date: item.isoDate || new Date().toISOString(),
              source: feed.title || feedUrl,
            };
          }
          return null;
        }).filter((job): job is Job => job !== null);
      }
    } catch (error) {
      console.warn(`Could not fetch or parse feed: ${feedUrl}`, error);
    }
    return [];
  });

  const allJobsNested = await Promise.all(allJobsPromises);
  let allJobsFlat = allJobsNested.flat();

  // Add the static jobs
  const processedStaticJobs: Job[] = staticJobs.map((job) => ({
      ...job,
      id: job.link,
      date: new Date().toISOString(),
      source: 'Hashtag Web3 Direct'
  }));

  allJobsFlat = [...allJobsFlat, ...processedStaticJobs];


  // Deduplicate jobs, keeping the most recent one
  const jobMap = new Map<string, Job>();
  allJobsFlat.forEach(job => {
    const jobKey = job.link;
    const existingJob = jobMap.get(jobKey);
    if (!existingJob || new Date(job.date) > new Date(existingJob.date)) {
      jobMap.set(jobKey, job);
    }
  });

  const uniqueJobs = Array.from(jobMap.values());

  // Sort by date descending (newest first)
  uniqueJobs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return uniqueJobs;
}
