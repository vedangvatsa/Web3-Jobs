import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

interface AshbyPosting {
  id: string;
  title: string;
  locationName?: string;
  employmentType?: string;
  workplaceType?: string;
  secondaryLocations?: Array<{ locationName: string }>;
}

async function fetchChainlinkJobs() {
  console.log('Fetching live Ashby board for chainlink-labs...');
  const res = await fetch('https://jobs.ashbyhq.com/chainlink-labs');
  const html = await res.text();

  const match = html.match(/window\.__appData\s*=\s*({.*?});/);
  if (!match) {
    throw new Error('Failed to find window.__appData on Ashby page');
  }

  const data = JSON.parse(match[1]);
  const postings: AshbyPosting[] = data?.jobBoard?.jobPostings || [];
  console.log(`Found ${postings.length} active job postings for Chainlink Labs.`);

  const cachePath = path.join(process.cwd(), 'content/jobs-cache.json');
  const jobs = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

  const nowIso = new Date().toISOString().split('T')[0];

  let added = 0;
  let updated = 0;

  for (const posting of postings) {
    const jobId = posting.id;
    const link = `https://jobs.ashbyhq.com/chainlink-labs/${jobId}`;
    
    // Fetch full HTML description
    let descriptionHtml = '';
    try {
      const gqlRes = await fetch('https://jobs.ashbyhq.com/api/non-user-graphql?op=ApiJobPosting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operationName: 'ApiJobPosting',
          query: 'query ApiJobPosting($organizationHostedJobsPageName: String!, $jobPostingId: String!) { jobPosting(organizationHostedJobsPageName: $organizationHostedJobsPageName, jobPostingId: $jobPostingId) { id title descriptionHtml employmentType } }',
          variables: { organizationHostedJobsPageName: 'chainlink-labs', jobPostingId: jobId }
        })
      });
      const gqlData: any = await gqlRes.json();
      descriptionHtml = gqlData?.data?.jobPosting?.descriptionHtml || '';
    } catch (err) {
      console.warn(`Failed to fetch GraphQL description for ${jobId}:`, err);
    }

    let loc = posting.locationName || 'Remote';
    if (posting.secondaryLocations && posting.secondaryLocations.length > 0) {
      loc = `${loc} (${posting.secondaryLocations.map(l => l.locationName).join(', ')})`;
    }

    const existingIndex = jobs.findIndex(
      (j: any) => j.id === jobId || j.link === link
    );

    const jobRecord = {
      id: jobId,
      title: posting.title.trim(),
      company: 'Chainlink Labs',
      link,
      date: nowIso,
      source: 'Ashby: Chainlink Labs [chainlink-labs]',
      location: loc,
      department: 'Engineering & Operations',
      active: true,
      description: descriptionHtml,
    };

    if (existingIndex >= 0) {
      jobs[existingIndex] = {
        ...jobs[existingIndex],
        ...jobRecord,
        date: jobs[existingIndex].date || nowIso,
      };
      updated++;
    } else {
      jobs.push(jobRecord);
      added++;
    }
  }

  fs.writeFileSync(cachePath, JSON.stringify(jobs, null, 2), 'utf8');
  console.log(`Successfully ingested Chainlink Labs jobs: ${added} added, ${updated} updated. Total jobs in cache: ${jobs.length}`);
}

fetchChainlinkJobs().catch(console.error);
