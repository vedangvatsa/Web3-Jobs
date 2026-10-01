import fs from 'node:fs';
import { load } from 'cheerio';
import { getCompanySlug } from '../src/lib/job-slugs';
import { COMPANY_WEBSITE_OVERRIDES } from '../src/lib/companies';
import { atsBoardKey } from '../src/lib/ats-board-identity';
import { atsSourceInventory, type AtsInventoryEntry } from './lib/ats-source-inventory';
import { getAuditPage } from './lib/ats-audit-http';

const profiles = JSON.parse(fs.readFileSync('content/company-profiles-runtime.json', 'utf8')) as Record<string, { website?: string }>;
const output = '.cache/ats-employer-audit.json';
const selection = process.argv.find(arg => arg.startsWith('--only='))?.slice(7).split(',');
const resume = process.argv.includes('--resume');
const quiet = process.argv.includes('--quiet');
type Result = AtsInventoryEntry & { status?: number; owner?: string; website?: string; organizationId?: string; postingCount?: number; review?: boolean; expectedWebsites: string[]; evidenceUrl?: string; excerpt?: string; externalLinks?: string[]; error?: string; detailError?: string; checkedAt: string };

function expectedWebsite(company: string): string | undefined {
  const slug = getCompanySlug(company);
  const value = COMPANY_WEBSITE_OVERRIDES[slug] || profiles[slug]?.website;
  if (!value || /ashbyhq|greenhouse|lever\.co|notion\.site|workable|myworkdayjobs/.test(value)) return;
  return value;
}
function host(value: string): string { try { return new URL(value.trim().startsWith('http') ? value.trim() : `https://${value.trim()}`).hostname.toLowerCase().replace(/^www\./, ''); } catch { return ''; } }
function nameKey(value: string): string { return value.toLowerCase().replace(/\b(?:inc|llc|ltd|labs|foundation|technologies|technology|network|protocol|jobs|careers|limited|the|team)\b/g, '').replace(/[^a-z0-9]/g, ''); }
function text(html: string): string { return load(html).text().replace(/\s+/g, ' ').trim(); }
function htmlEvidence(html: string) {
  const $ = load(html);
  $('script,style,noscript,svg').remove();
  const externalLinks = [...new Set($('a[href]').map((_, element) => $(element).attr('href') || '').get().filter(href => /^https?:/.test(href) && !/lever\.co|greenhouse\.io|bamboohr\.com|workable\.com|recruitee\.com|facebook\.com|twitter\.com|linkedin\.com|x\.com\//.test(href)))].slice(0, 25);
  return { excerpt: ($('meta[name="description"]').attr('content') || $('main').text() || $('body').text() || $.text()).replace(/\s+/g, ' ').trim().slice(0, 1000), externalLinks };
}
function boardUrl(entry: AtsInventoryEntry): string | undefined {
  const board = encodeURIComponent(entry.board);
  switch (entry.provider) {
    case 'ashby': return `https://jobs.ashbyhq.com/${board}`;
    case 'greenhouse': return `https://boards-api.greenhouse.io/v1/boards/${board}`;
    case 'lever': return `https://jobs.${entry.region === 'eu' ? 'eu.' : ''}lever.co/${board}`;
    case 'workable': return `https://apply.workable.com/${board}/`;
    case 'bamboohr': return `https://${board}.bamboohr.com/careers`;
    case 'recruitee': return `https://${board}.recruitee.com/`;
    case 'breezy': return `https://${board}.breezy.hr/`;
    case 'teamtailor': return entry.url?.replace(/jobs\.rss$/, '') || `https://${entry.board}.teamtailor.com/`;
    case 'smartrecruiters': return `https://careers.smartrecruiters.com/${board}`;
    case 'rippling': return `https://ats.rippling.com/${board}/jobs`;
    default: return undefined;
  }
}

async function inspect(entry: AtsInventoryEntry): Promise<Result> {
  const expectedWebsites = entry.companies.map(expectedWebsite).filter((value): value is string => !!value);
  const result: Result = { ...entry, expectedWebsites: [...new Set(expectedWebsites)], checkedAt: new Date().toISOString() };
  try {
    const url = boardUrl(entry);
    if (!url) return { ...result, error: 'No public identity endpoint; manual verification required' };
    const response = await getAuditPage(url);
    Object.assign(result, { status: response.status, evidenceUrl: response.url });
    if (response.status !== 200) return result;
    if (entry.provider === 'ashby') {
      const match = response.body.match(/window\.__appData\s*=\s*(\{[^\n\r]*\});/);
      if (match) {
        const data = JSON.parse(match[1]);
        result.owner = data.organization?.name || '';
        result.website = data.organization?.publicWebsite || '';
        result.organizationId = data.organization?.organizationId || '';
        result.postingCount = data.jobBoard?.jobPostings?.length;
        result.excerpt = data.organization?.customJobsPageUrl || '';
      }
    } else if (entry.provider === 'greenhouse') {
      const data = JSON.parse(response.body);
      result.owner = data.name || '';
      try {
        const list = JSON.parse((await getAuditPage(`${url}/jobs`)).body);
        result.postingCount = list.jobs?.length;
        if (list.jobs?.[0]?.id) {
          const detail = JSON.parse((await getAuditPage(`${url}/jobs/${list.jobs[0].id}`)).body);
          Object.assign(result, htmlEvidence(load(detail.content || '').text()));
        }
      } catch (error) { result.detailError = (error as Error).message; }
    } else {
      const $ = load(response.body);
      Object.assign(result, htmlEvidence(response.body));
      result.owner = ($('meta[property="og:site_name"]').attr('content') || $('title').text()).replace(/^Jobs (?:at|–|-)\s*/i, '').replace(/(?:\s*[-|]\s*)?(?:careers|current openings|jobs at|job openings|bamboohr).*$/i, '').trim();
      result.website = $('a').filter((_, element) => /Home Page|Company website/i.test($(element).text())).first().attr('href') || $('.main-header-logo a, a.main-header-logo').attr('href') || '';
      if (result.website && host(result.website) === host(response.url)) result.website = '';
      if (entry.provider === 'bamboohr') {
        result.owner = response.body.match(/"companyName"\s*:\s*"([^"\n]+)"/)?.[1] || result.owner;
        if (host(response.url) === 'bamboohr.com') result.owner = '';
      }
    }
    const nameMatches = result.owner && entry.companies.some(company => nameKey(company) === nameKey(result.owner!));
    const domainMatches = result.website && result.expectedWebsites.some(expected => host(expected) === host(result.website!));
    result.review = !!result.owner && (!nameMatches || (!!result.website && result.expectedWebsites.length > 0 && !domainMatches));
  } catch (error) { result.error = (error as Error).message; }
  return result;
}

async function main() {
  const all = atsSourceInventory();
  const previous = fs.existsSync(output) ? JSON.parse(fs.readFileSync(output, 'utf8')).results as Result[] : [];
  const results = new Map(previous.map(row => [atsBoardKey(row.provider, row.board), row]));
  const selected = all.filter(entry => !selection || selection.includes(entry.board.toLowerCase()) || selection.includes(entry.provider));
  let cursor = 0, checked = 0;
  await Promise.all(Array.from({ length: 5 }, async () => {
    while (cursor < selected.length) {
      const entry = selected[cursor++], key = atsBoardKey(entry.provider, entry.board);
      const previousResult = results.get(key);
      if (resume && previousResult?.checkedAt) continue;
      results.set(key, await inspect(entry));
      if (++checked % 50 === 0) console.error(`Checked ${checked}/${selected.length} source boards`);
    }
  }));
  fs.mkdirSync('.cache', { recursive: true });
  const rows = all.flatMap(entry => {
    const result = results.get(atsBoardKey(entry.provider, entry.board));
    if (!result) return [];
    const expectedWebsites = [...new Set(entry.companies.map(expectedWebsite).filter((value): value is string => !!value))];
    if (!boardUrl(entry)) return [{ ...entry, expectedWebsites, checkedAt: result.checkedAt, error: 'Custom source: manual identity verification required' } as Result];
    const nameMatches = result.owner && entry.companies.some(company => nameKey(company) === nameKey(result.owner!));
    const domainMatches = result.website && expectedWebsites.some(expected => host(expected) === host(result.website!));
    return [{ ...result, ...entry, expectedWebsites, review: !!result.owner && (!nameMatches || (!!result.website && expectedWebsites.length > 0 && !domainMatches)) }];
  });
  fs.writeFileSync(output, JSON.stringify({ checkedAt: new Date().toISOString(), results: rows }, null, 2));
  console.log(JSON.stringify({ inventory: all.length, checked, identityMetadataFound: rows.filter(row => row.owner).length, review: quiet ? rows.filter(row => row.review).length : rows.filter(row => row.review).map(({ provider, board, companies, jobs, owner, website }) => ({ provider, board, companies, jobs, owner, website })), unavailable: quiet ? rows.filter(row => !row.owner).length : rows.filter(row => !row.owner).map(({ provider, board, companies, jobs, status, error }) => ({ provider, board, companies, jobs, status, error })) }, null, 2));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
