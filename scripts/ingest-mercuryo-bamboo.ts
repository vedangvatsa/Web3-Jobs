import fs from 'fs';
import path from 'path';
import https from 'https';
import { isGeneralOrPlaceholderJobTitle } from '../src/lib/job-filters';

const TODAY = new Date().toISOString().slice(0, 10);
const BAMBOO_URL = 'https://mercuryo.bamboohr.com/careers/list';

function fetchMercuryoJobs(): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const req = https.get(
      BAMBOO_URL,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          'Accept': 'application/json',
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          try {
            const data = JSON.parse(raw);
            resolve(data.result || []);
          } catch (e) {
            reject(e);
          }
        });
      }
    );
    req.on('error', reject);
  });
}

function getOneWordRole(title: string): string {
  const t = title.toLowerCase();
  if (t.includes('solidity')) return 'solidity';
  if (t.includes('rust')) return 'rust';
  if (t.includes('frontend') || /\b(ui|ux)\b/i.test(t)) return 'frontend';
  if (t.includes('backend')) return 'backend';
  if (t.includes('product') || /\bpm\b/i.test(t)) return 'product';
  if (t.includes('analyst')) return 'analyst';
  if (t.includes('audit')) return 'auditor';
  if (t.includes('compliance') || t.includes('mlro') || t.includes('kyb') || t.includes('kyc')) return 'compliance';
  if (t.includes('recruiting') || t.includes('recruitment') || t.includes('talent') || /\bhr\b/i.test(t)) return 'recruiter';
  if (t.includes('manager') || t.includes('lead')) return 'manager';
  if (t.includes('operations') || /\bops\b/i.test(t)) return 'operations';
  if (t.includes('support') || t.includes('associate')) return 'associate';
  return 'job';
}

async function main() {
  console.log('Fetching active Mercuryo careers from BambooHR API...');
  const mercuryoRaw = await fetchMercuryoJobs();
  console.log(`Retrieved ${mercuryoRaw.length} active jobs from Mercuryo BambooHR.`);

  const cachePath = path.join(process.cwd(), 'content/jobs-cache.json');
  const cacheData: any[] = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

  let addedCount = 0;

  for (const j of mercuryoRaw) {
    const job_id = `mercuryo-${j.id}`;
    const title = j.jobOpeningName;
    const company = 'Mercuryo';
    const link = `https://mercuryo.bamboohr.com/careers/${j.id}`;
    const dept = j.departmentLabel || 'Fintech & Payments';

    const loc = j.atsLocation || {};
    const city = loc.city || '';
    const country = loc.country || 'Remote';
    const locationStr = [city, country].filter(Boolean).join(', ') || 'Remote';

    if (isGeneralOrPlaceholderJobTitle(title)) continue;
    const roleWord = getOneWordRole(title);
    const shortId = j.id.toString().padStart(5, '0');
    const slug = `${roleWord}${shortId}`;

    const jobObj = {
      id: job_id,
      title,
      company,
      location: locationStr,
      type: j.employmentStatusLabel || 'Full-time',
      date: TODAY,
      source: 'bamboohr:mercuryo',
      link,
      applyUrl: link,
      department: dept,
      skills: ['Payments', 'Web3', 'Crypto Infrastructure', 'Fintech', 'Fiat Onramp'],
      slug,
    };

    const exists = cacheData.some(
      (existing: any) =>
        existing.id === jobObj.id || existing.link === jobObj.link
    );

    if (!exists) {
      cacheData.unshift(jobObj);
      addedCount++;
    }
  }

  console.log(`Ingested ${addedCount} new Mercuryo job postings. Total jobs in cache: ${cacheData.length}`);
  fs.writeFileSync(cachePath, JSON.stringify(cacheData, null, 2));
}

main().catch(console.error);
