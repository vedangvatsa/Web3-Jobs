/**
 * Finds landscape Unsplash images for articles without a real hero image.
 * Run with --apply only after reviewing the dry-run output.
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(process.cwd(), '.env.unsplash.local') });

const articlesDirectory = path.join(process.cwd(), 'content/articles');
const accessKey = process.env.UNSPLASH_ACCESS_KEY;
const applyChanges = process.argv.includes('--apply');
const limitIndex = process.argv.indexOf('--limit');
const limit = limitIndex >= 0 ? Number(process.argv[limitIndex + 1]) : 25;

type UnsplashPhoto = {
  id: string;
  alt_description: string | null;
  description: string | null;
  urls: { regular: string };
  user: { name: string };
};

function needsHeroImage(image: unknown): boolean {
  return typeof image !== 'string' || !image || image.includes('picsum.photos');
}

function searchQuery(title: string, category: string): string {
  return `${title} ${category.replace(/Guides|Deep Dives|Insights|Educational|Getting Started/gi, '')}`
    .replace(/\b(?:a|an|the|complete|comprehensive|guide|explained|understanding|exploring|how|to|in|for|of|and)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function findPhotos(query: string): Promise<UnsplashPhoto[]> {
  const response = await fetch(`https://api.unsplash.com/search/photos?${new URLSearchParams({
    query,
    orientation: 'landscape',
    content_filter: 'high',
    per_page: '10',
  })}`, {
    headers: { Authorization: `Client-ID ${accessKey}` },
  });

  if (!response.ok) {
    throw new Error(`Unsplash search failed (${response.status})`);
  }

  const data = await response.json() as { results: UnsplashPhoto[] };
  return data.results;
}

async function main() {
  if (!accessKey) {
    throw new Error('UNSPLASH_ACCESS_KEY is required in .env.unsplash.local');
  }

  const articles = fs.readdirSync(articlesDirectory)
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      const filePath = path.join(articlesDirectory, fileName);
      const source = fs.readFileSync(filePath, 'utf8');
      const parsed = matter(source);
      return { fileName, filePath, source, parsed };
    })
    .filter(({ parsed }) => typeof parsed.data.title === 'string');
  const usedPhotoIds = new Set(
    articles
      .map(({ parsed }) => parsed.data.image)
      .filter((image): image is string => typeof image === 'string')
      .map((image) => image.match(/images\.unsplash\.com\/photo-([^?]+)/)?.[1])
      .filter((id): id is string => Boolean(id)),
  );
  const candidates = articles
    .filter(({ parsed }) => needsHeroImage(parsed.data.image))
    .sort((a, b) => a.fileName.localeCompare(b.fileName))
    .slice(0, limit);

  for (const candidate of candidates) {
    const title = candidate.parsed.data.title as string;
    const category = typeof candidate.parsed.data.category === 'string' ? candidate.parsed.data.category : 'General';
    const photo = (await findPhotos(searchQuery(title, category))).find((result) => !usedPhotoIds.has(result.id));

    if (!photo) {
      console.warn(`No Unsplash result: ${candidate.fileName}`);
      continue;
    }

    console.log(`${applyChanges ? 'Updated' : 'Preview'} ${candidate.fileName}: ${photo.alt_description || photo.description || 'Untitled photo'} by ${photo.user.name}`);

    if (applyChanges) {
      candidate.parsed.data.image = photo.urls.regular;
      fs.writeFileSync(candidate.filePath, matter.stringify(candidate.parsed.content, candidate.parsed.data));
    }
    usedPhotoIds.add(photo.id);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
