/**
 * Assigns public-domain or CC0 Wikimedia Commons images to articles without a
 * real hero. Run without --apply to review candidates before writing changes.
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const articlesDirectory = path.join(process.cwd(), 'content/articles');
const applyChanges = process.argv.includes('--apply');
const limitIndex = process.argv.indexOf('--limit');
const limit = limitIndex >= 0 ? Number(process.argv[limitIndex + 1]) : 25;

type CommonsImageInfo = {
  thumburl?: string;
  thumbwidth?: number;
  thumbheight?: number;
  mime?: string;
  descriptionurl?: string;
  extmetadata?: {
    License?: { value?: string };
    LicenseShortName?: { value?: string };
    Restrictions?: { value?: string };
  };
};

type CommonsPage = {
  pageid: number;
  title: string;
  imageinfo?: CommonsImageInfo[];
};

function needsHeroImage(image: unknown): boolean {
  return typeof image !== 'string' || !image || image.includes('picsum.photos');
}

function topicQuery(title: string): string {
  const value = title.toLowerCase();
  const query = value.includes('bitcoin') ? 'bitcoin'
    : value.includes('ethereum') ? 'ethereum'
    : /\b(?:web3|blockchain|crypto|defi|stablecoin|token|dao|nft)\b/.test(value) ? 'blockchain'
    : /\b(?:ai|artificial intelligence|machine learning)\b/.test(value) ? 'artificial intelligence'
    : /\b(?:developer|engineer|programming|solidity|code)\b/.test(value) ? 'programmer'
    : /\b(?:resume|career|job|interview|manager|employee|freelance|workplace)\b/.test(value) ? 'office'
    : /\b(?:writing|writer)\b/.test(value) ? 'writer'
    : 'technology';

  return `intitle:${query} -logo -icon -flag -map -diagram -chart -screenshot -poster -book -cover -scan -pdf -svg`;
}

function isUsableImage(page: CommonsPage): page is CommonsPage & { imageinfo: [CommonsImageInfo] } {
  const info = page.imageinfo?.[0];
  const license = info?.extmetadata?.License?.value?.toLowerCase();
  const restrictions = info?.extmetadata?.Restrictions?.value?.trim();
  const aspectRatio = info?.thumbwidth && info.thumbheight ? info.thumbwidth / info.thumbheight : 0;

  return Boolean(
    info?.thumburl
    && info.descriptionurl
    && (info.mime === 'image/jpeg' || info.mime === 'image/png' || info.mime === 'image/webp')
    && (license === 'cc0' || license === 'pd')
    && !restrictions
    && aspectRatio >= 1.15
    && aspectRatio <= 2.5,
  );
}

async function findImage(query: string, usedPageIds: Set<number>): Promise<CommonsPage | null> {
  const params = new URLSearchParams({
    action: 'query',
    generator: 'search',
    gsrsearch: query,
    gsrnamespace: '6',
    gsrlimit: '25',
    prop: 'imageinfo',
    iiprop: 'url|mime|extmetadata',
    iiurlwidth: '1200',
    format: 'json',
    origin: '*',
  });
  const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`);
  if (!response.ok) throw new Error(`Wikimedia Commons search failed (${response.status})`);

  const data = await response.json() as { query?: { pages?: Record<string, CommonsPage> } };
  return Object.values(data.query?.pages ?? {})
    .filter(isUsableImage)
    .find((page) => !usedPageIds.has(page.pageid)) ?? null;
}

async function main() {
  const candidates = fs.readdirSync(articlesDirectory)
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      const filePath = path.join(articlesDirectory, fileName);
      const parsed = matter(fs.readFileSync(filePath, 'utf8'));
      return { fileName, filePath, parsed };
    })
    .filter(({ parsed }) => typeof parsed.data.title === 'string' && needsHeroImage(parsed.data.image))
    .sort((a, b) => a.fileName.localeCompare(b.fileName))
    .slice(0, limit);
  const usedPageIds = new Set<number>();

  for (const candidate of candidates) {
    const title = candidate.parsed.data.title as string;
    const image = await findImage(topicQuery(title), usedPageIds);
    const info = image?.imageinfo[0];

    if (!image || !info?.thumburl || !info.descriptionurl) {
      console.warn(`No Commons result: ${candidate.fileName}`);
      continue;
    }

    console.log(`${applyChanges ? 'Updated' : 'Preview'} ${candidate.fileName}: ${image.title}`);
    usedPageIds.add(image.pageid);

    if (applyChanges) {
      candidate.parsed.data.image = info.thumburl;
      candidate.parsed.data.imageSource = info.descriptionurl;
      candidate.parsed.data.imageLicense = info.extmetadata?.LicenseShortName?.value || 'Public domain';
      fs.writeFileSync(candidate.filePath, matter.stringify(candidate.parsed.content, candidate.parsed.data));
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
