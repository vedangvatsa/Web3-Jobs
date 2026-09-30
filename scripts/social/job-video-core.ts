import {createHash} from 'node:crypto';

export type Platform = 'instagram' | 'youtube' | 'tiktok';
export type LiveJob = {slug: string; id: string; company: string; title: string; link: string; location?: string; salary?: string; active?: boolean; date?: string};
export type Video = {slug: string; company: string; title: string; facts: string[]; videoUrl: string; bytes: number; mode: string; snapshot: LiveJob; descriptionHash: string | null};
export type Receipt = {status: 'creating' | 'pending' | 'publishing' | 'sent' | 'rejected'; text: string; startedAt: string; postId?: string; containerId?: string; url?: string; error?: string};
export type Delivery = {slot: string; selectedAt: string; verifiedAt: string; captions: ReturnType<typeof captions>; receipts: Partial<Record<Platform, Receipt>>};
export type Ledger = {version: 1; slots: Record<string, string[]>; jobs: Record<string, Delivery>};
export const platforms: Platform[] = ['instagram', 'youtube', 'tiktok'];
export const channels = {youtube: '6abd83ccea19ca0bde39975e', tiktok: '6abd86feea19ca0bde39c49a'};
export const instagramAccount = '17841473830256790';
export const organizationId = '6883fea6f19c3d68229081fa';

export function clean(value: string): string {
  return value.replace(/https?:\/\/\S+/g, '').replace(/:/g, ' · ').replace(/\s+/g, ' ').trim();
}

export function captions(video: Video) {
  const company = clean(video.company);
  const title = clean(video.title).replace(/\s*\(100% Remote\)\s*/i, '');
  const facts = video.facts.map(clean).filter(Boolean).join(' · ');
  const tags = /market|growth|brand/i.test(title) ? '#Hiring #Marketing #Jobs'
    : /remote/i.test(facts + title) ? '#Hiring #RemoteJobs #TechJobs'
    : /engineer|develop|software|security/i.test(title) ? '#Hiring #TechJobs #Jobs'
    : '#Hiring #Jobs #Careers';
  const detail = video.slug === 'fe12' ? 'Build cross-platform interfaces with React and TypeScript.'
    : video.slug === 'mkt51' ? 'Lead brand, communications and customer growth.' : '';
  const cta = 'Find the role on hashtagweb3.com';
  const instagram = [`${company} is hiring\n${title}`, [facts, detail].filter(Boolean).join('\n'), cta, tags].filter(Boolean).join('\n\n');
  const tiktok = [`${title} at ${company}. ${facts}${facts ? '.' : ''}`, cta, tags].join('\n\n');
  let youtubeTitle = `${title} at ${company}`;
  const titleFact = video.facts.find(f => /remote/i.test(f)) || video.facts.find(f => /\$/.test(f));
  if (titleFact && `${youtubeTitle} · ${clean(titleFact)}`.length <= 100) youtubeTitle += ` · ${clean(titleFact)}`;
  if (youtubeTitle.length > 100) youtubeTitle = youtubeTitle.slice(0, 99).replace(/\s+\S*$/, '') + '…';
  const youtube = [[facts, detail].filter(Boolean).join('\n'), cta, tags].filter(Boolean).join('\n\n');
  return {instagram, tiktok, youtube, youtubeTitle};
}

export function matchesSnapshot(video: Video, current: LiveJob): boolean {
  return current.active !== false && video.mode === 'catalog-source'
    && ['id', 'company', 'title', 'link', 'location', 'salary'].every(key =>
      String(current[key as keyof LiveJob] || '') === String(video.snapshot[key as keyof LiveJob] || ''));
}

export function assertCapacity(ledger: Ledger, slot: string, newCount: number): void {
  if (!/^\d{4}-\d{2}-\d{2}:(morning|afternoon|evening)$/.test(slot)) throw new Error('Invalid video slot');
  if ((ledger.slots[slot]?.length || 0) + newCount > 2) throw new Error('Two-video slot limit reached');
  const dailyCount = Object.entries(ledger.slots).filter(([key]) => key.startsWith(slot.slice(0, 10) + ':')).reduce((sum, [, jobs]) => sum + jobs.length, 0);
  if (dailyCount + newCount > 6) throw new Error('Six-video daily limit reached');
}

export function assertPostingTime(date: string, slot: string, manual: boolean, now = new Date()): void {
  if (date !== now.toISOString().slice(0, 10)) throw new Error('Video publishing date is not today');
  const minute = {morning: 210, afternoon: 690, evening: 1170}[slot];
  if (minute === undefined) throw new Error('Unknown video slot');
  const start = Date.parse(`${date}T00:00:00Z`) + minute * 60000;
  if (!manual && (now.getTime() < start || now.getTime() >= start + 3600000)) throw new Error('Outside the video posting window');
}

export function jobPostings(html: string): Record<string, unknown>[] {
  const found: Record<string, unknown>[] = [];
  const visit = (value: unknown) => {
    if (Array.isArray(value)) return value.forEach(visit);
    if (!value || typeof value !== 'object') return;
    const record = value as Record<string, unknown>;
    if ([record['@type']].flat().includes('JobPosting')) found.push(record);
    if (record['@graph']) visit(record['@graph']);
  };
  for (const match of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {visit(JSON.parse(match[1]));} catch {}
  }
  return found;
}

export async function verifyFresh(video: Video, current: LiveJob, request: typeof fetch = fetch): Promise<void> {
  if (!matchesSnapshot(video, current)) throw new Error('Listing changed, closed or requires editorial recovery');
  const page = await request(`https://hashtagweb3.com/${video.slug}`, {signal: AbortSignal.timeout(30000)});
  if (!page.ok || new URL(page.url).pathname.replace(/\/$/, '') !== `/${video.slug}`) throw new Error('Job page is unavailable or redirected');
  const posting = jobPostings(await page.text()).find(p => p.title === current.title && (p.hiringOrganization as {name?: string})?.name === current.company);
  if (!posting) throw new Error('No matching JobPosting on the live page');
  if (posting.validThrough && Date.parse(String(posting.validThrough)) < Date.now()) throw new Error('Job has expired');
  if (video.descriptionHash) {
    const hash = createHash('sha256').update(String(posting.description || '').replace(/\s+/g, ' ').trim()).digest('hex');
    if (hash !== video.descriptionHash) throw new Error('Job description changed since video production');
  }
  const employer = await request(current.link, {signal: AbortSignal.timeout(30000)});
  if (!employer.ok) throw new Error(`Employer page HTTP ${employer.status}`);
  const employerText = await employer.text();
  if (/this (?:job|position) (?:is no longer|has been filled)|job (?:not found|has expired)|position is closed/i.test(employerText)) throw new Error('Employer lists the role as closed');
  const media = await request(video.videoUrl, {method: 'HEAD', signal: AbortSignal.timeout(30000)});
  if (!media.ok || !media.headers.get('content-type')?.includes('video/mp4') || Number(media.headers.get('content-length')) !== video.bytes) throw new Error('Public video is missing or does not match the manifest');
}
