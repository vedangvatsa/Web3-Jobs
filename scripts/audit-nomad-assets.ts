import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { load } from 'cheerio';
import { getNomadCities } from '../src/lib/nomads/server';
import { nomadRoutes, nomadOgImage } from '../src/lib/nomads/metadata';
import { cityImagePlan } from '../src/lib/nomads/images';

async function main() {
  const groups: Record<string, Array<{ path: string; bytes: number; width: number; height: number }>> = { originalHero: [], originalCard: [], hero: [], card: [], table: [], og: [] };
  const problems: string[] = [];
  for (const city of getNomadCities()) {
    const plan = cityImagePlan(city.image);
    if (!plan?.srcSet) problems.push(`${city.slug}: missing display variants`);
    const hero = plan?.srcSet?.split(', ').at(-1)?.split(' ')[0];
    for (const [group, image] of [['originalHero', city.image], ['originalCard', city.thumbnail], ['hero', hero], ['card', plan?.src], ['table', city.thumbnail?.replace('-480.webp', '-128.webp')]] as const) {
      if (!image || !fs.existsSync(`public${image}`)) { problems.push(`${city.slug}: missing ${group} image`); continue; }
      const info = await sharp(`public${image}`).metadata();
      if (info.format !== 'webp' || !info.width || !info.height) problems.push(`${image}: unexpected format/dimensions`);
      if (['hero', 'card'].includes(group) && info.width! / info.height! !== 1.6) problems.push(`${image}: wrong display aspect ratio`);
      if (group === 'card' && fs.statSync(`public${image}`).size > 50000) problems.push(`${image}: card exceeds 50 KB`);
      if (group === 'hero' && fs.statSync(`public${image}`).size > 180000) problems.push(`${image}: hero exceeds 180 KB`);
      groups[group].push({ path: image, bytes: fs.statSync(`public${image}`).size, width: info.width || 0, height: info.height || 0 });
    }
    for (const candidate of plan?.srcSet?.split(', ') || []) {
      const [image, width] = candidate.split(' ');
      if ((await sharp(`public${image}`).metadata()).width !== Number(width.slice(0, -1))) problems.push(`${image}: untruthful srcset descriptor`);
    }
  }
  const ogImages = new Map<string, string[]>();
  for (const route of nomadRoutes()) {
    const preview = `public/preview${route.path}.html`;
    if (!fs.existsSync(preview)) { problems.push(`Missing preview for ${route.path}`); continue; }
    const $ = load(fs.readFileSync(preview, 'utf8'));
    const image = $('meta[property="og:image"]').attr('content');
    if (!image) { problems.push(`Missing OG image for ${route.path}`); continue; }
    if (image !== nomadOgImage(route.path)) problems.push(`${route.path}: incorrect OG image`);
    if ($('meta[name="twitter:image"]').attr('content') !== image) problems.push(`${route.path}: Twitter/OG mismatch`);
    if ($('link[rel="canonical"]').attr('href') !== `https://hashtagweb3.com${route.path}`) problems.push(`${route.path}: incorrect canonical`);
    const url = new URL(image), file = path.join('public', url.pathname);
    if (!fs.existsSync(file)) { problems.push(`Missing OG file: ${url.pathname}`); continue; }
    const info = await sharp(file).metadata(), bytes = fs.statSync(file).size;
    if (info.format !== 'png' || info.width !== 1200 || info.height !== 630 || bytes > 50000) problems.push(`${route.path}: OG format/dimensions/size budget`);
    groups.og.push({ path: url.pathname, bytes, width: info.width || 0, height: info.height || 0 });
    const routes = ogImages.get(url.pathname) || [];
    routes.push(route.path); ogImages.set(url.pathname, routes);
  }
  if (ogImages.size !== nomadRoutes().length) problems.push('Each canonical page needs its own OG image');
  const bytes = (group: string) => groups[group].reduce((sum, image) => sum + image.bytes, 0);
  const report = {
    cities: getNomadCities().length,
    imageGroups: Object.fromEntries(Object.entries(groups).map(([key, entries]) => [key, {
      count: entries.length, bytes: entries.reduce((sum, entry) => sum + entry.bytes, 0),
      averageBytes: Math.round(entries.reduce((sum, entry) => sum + entry.bytes, 0) / entries.length),
      maxBytes: Math.max(...entries.map(entry => entry.bytes)),
      widths: [...new Set(entries.map(entry => entry.width))].sort((a, b) => a - b),
      largest: [...entries].sort((a, b) => b.bytes - a.bytes).slice(0, 5),
    }])),
    newPageCount: nomadRoutes().length,
    displaySavingsPercent: { hero: Math.round((1 - bytes('hero') / bytes('originalHero')) * 100), card: Math.round((1 - bytes('card') / bytes('originalCard')) * 100) },
    uniqueOgImages: ogImages.size,
    sharedOgImages: [...ogImages.entries()].filter(([, routes]) => routes.length > 1).map(([image, routes]) => ({ image, pages: routes.length })),
    problems,
  };
  console.log(JSON.stringify(report, null, 2));
  if (problems.length) process.exitCode = 1;
}
main().catch(error => { console.error(error); process.exitCode = 1; });
