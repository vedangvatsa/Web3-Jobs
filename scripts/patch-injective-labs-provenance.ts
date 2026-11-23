/**
 * Align Injective Labs override provenance with https://injective.com/ (company site).
 */
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { load } from 'cheerio';
import sharp from 'sharp';
import { countryGet } from './lib/country-source-http';

const ROOT = process.cwd();
const OVERRIDES_PATH = path.join(ROOT, 'content/company-profile-overrides.json');
const LOGO_PATH = path.join(ROOT, 'public/logo/companies/injective-labs.png');
const SITE = 'https://injective.com/';
const checkedAt = new Date().toISOString();

function excerpt(text: string, max = 220): string {
  const t = text.replace(/\s+/g, ' ').trim();
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
}

async function main(): Promise<void> {
  const home = await countryGet(SITE);
  const dev = await countryGet('https://injective.com/dev');
  const $ = load(home.body);
  const meta =
    $('meta[name="description"]').attr('content') ||
    $('meta[property="og:description"]').attr('content') ||
    '';

  const faviconRes = await fetch('https://injective.com/favicon.ico', {
    signal: AbortSignal.timeout(20000),
  });
  if (!faviconRes.ok) throw new Error('favicon fetch failed');
  const faviconBytes = Buffer.from(await faviconRes.arrayBuffer());
  const faviconSha = createHash('sha256').update(faviconBytes).digest('hex');
  let png: Buffer;
  try {
    png = await sharp(faviconBytes, { density: 144 })
      .resize(180, 180, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toBuffer();
  } catch {
    png = fs.readFileSync(LOGO_PATH);
    console.warn('[patch-injective-labs] keep existing PNG (favicon convert failed)');
  }
  const logoSha = createHash('sha256').update(png).digest('hex');
  const metaImg = await sharp(png).metadata();
  if (!fs.existsSync(LOGO_PATH) || createHash('sha256').update(fs.readFileSync(LOGO_PATH)).digest('hex') !== logoSha) {
    fs.writeFileSync(LOGO_PATH, png);
  }

  const overrides = JSON.parse(fs.readFileSync(OVERRIDES_PATH, 'utf8')) as Record<string, unknown>;
  const row = overrides['injective-labs'] as Record<string, unknown>;
  if (!row) throw new Error('Missing injective-labs override');

  const description =
    'Injective Labs is a research and development company building Web3 infrastructure and financial applications. It contributes to Injective, a layer 1 blockchain for tokenization, perpetuals, stablecoins, and institutional onchain markets.';
  row.website = SITE;
  row.description = description;
  row.checkedAt = checkedAt;
  const socialLinks = {
    twitter: 'https://twitter.com/Injective',
    linkedin: 'https://www.linkedin.com/company/injectivelabs',
  };
  row.socialLinks = socialLinks;

  const provenance = {
    website: {
      url: 'https://injective.com',
      checkedAt,
      bodySha256: home.bodySha256,
    },
    about: [
      {
        url: 'https://injective.com',
        checkedAt,
        bodySha256: home.bodySha256,
        title: $('title').text().trim(),
        excerpt: excerpt(meta || description),
      },
      {
        url: 'https://injective.com/dev',
        checkedAt,
        bodySha256: dev.bodySha256,
        title: load(dev.body)('title').text().trim(),
        excerpt: excerpt(
          load(dev.body)('meta[name="description"]').attr('content') ||
            'Build on Injective with docs, SDKs, and developer tooling.',
        ),
      },
    ],
    socials: [
      {
        key: 'twitter',
        url: socialLinks.twitter,
        sourceUrl: 'https://injective.com',
        checkedAt,
        bodySha256: home.bodySha256,
      },
      {
        key: 'linkedin',
        url: socialLinks.linkedin,
        sourceUrl: 'https://injective.com',
        checkedAt,
        bodySha256: home.bodySha256,
      },
    ],
    branding: {
      url: 'https://injective.com/favicon.ico',
      sourceUrl: 'https://injective.com',
      kind: 'favicon',
      finalUrl: 'https://injective.com/favicon.ico',
      checkedAt,
      bodySha256: faviconSha,
      localPath: '/logo/companies/injective-labs.png',
      localSha256: logoSha,
      width: metaImg.width,
      height: metaImg.height,
    },
  };
  row.provenance = provenance;

  fs.writeFileSync(OVERRIDES_PATH, `${JSON.stringify(overrides, null, 2)}\n`);
  console.log('[patch-injective-labs] updated provenance + logo', logoSha.slice(0, 12));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});