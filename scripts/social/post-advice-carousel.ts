/**
 * Post multi-slide Advice / Career Guide Carousels to Instagram (@hashtagweb3)
 *
 * Renders 1080x1080 square minimal editorial slides with big bold fonts (Inter-Bold)
 * using satori + resvg-js + sharp locally (zero AI slop, zero gradients, zero drop shadows).
 *
 * Uploads JPEGs to secure host and creates a native Meta Carousel via Meta Graph API v21.0.
 *
 * Usage:
 *   npx tsx scripts/social/post-advice-carousel.ts
 *   npx tsx scripts/social/post-advice-carousel.ts --dry-run
 */

import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';
import satoriModule from 'satori';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';

const satori = (satoriModule as any).default || satoriModule;

// Load environment variables
const rootDir = path.resolve(__dirname, '../../');
dotenv.config({ path: path.join(rootDir, '.env') });
dotenv.config({ path: path.join(rootDir, '.env.local'), override: true });

const STATE_FILE = path.join(__dirname, 'carousels-posted.json');
const FONT_PATH = path.join(__dirname, 'fonts/Inter-Bold.ttf');

interface CarouselSlide {
  title: string;
  body: string;
}

interface CarouselItem {
  id: string;
  category: string;
  coverTitle: string;
  coverSubtitle: string;
  slides: CarouselSlide[];
  ctaTitle?: string;
  ctaSubtitle?: string;
  caption: string;
}

// Curated high-signal advice carousels with minimal, punchy text and big fonts
const CAROUSEL_LIBRARY: CarouselItem[] = [
  {
    id: 'web3-skills-2026',
    category: 'CAREER GUIDE',
    coverTitle: '4 Web3 Skills Teams Actually Test For',
    coverSubtitle: 'General crypto interest does not pass interviews. Proof of on-chain execution does.',
    slides: [
      {
        title: '1. Reentrancy & Invariants',
        body: 'Solidity syntax is table stakes. Top teams test checks-effects-interactions, custom errors, and Foundry fuzz testing.',
      },
      {
        title: '2. Typed Frontend',
        body: 'window.ethereum is obsolete. Modern dApps demand Viem with typed ABIs, Wagmi connectors, and optimistic UI.',
      },
      {
        title: '3. Subgraphs & SQL',
        body: 'Direct RPC queries do not scale. Proving you can build custom The Graph subgraphs and Dune SQL models sets you apart.',
      },
    ],
    ctaTitle: 'hashtagweb3.com',
    ctaSubtitle: 'Verified Web3 career guides, compensation data, and active developer openings.',
    caption: `4 Web3 Skills Teams Actually Test For

1. Reentrancy & Invariants: Solidity syntax is table stakes. Top teams test checks-effects-interactions, custom errors, and Foundry fuzz testing.

2. Typed Frontend: window.ethereum is obsolete. Modern dApps demand Viem with typed ABIs, Wagmi connectors, and optimistic UI.

3. Subgraphs & SQL: Direct RPC queries do not scale. Proving you can build custom The Graph subgraphs and Dune SQL models sets you apart.

Read verified Web3 career guides and explore openings:
hashtagweb3.com

Subscribed by 60k+ Web3 builders and professionals.

#web3 #solidity #ethereum #web3jobs #crypto #hashtagweb3`,
  },
  {
    id: 'smart-contract-security-rules',
    category: 'SECURITY',
    coverTitle: '3 Smart Contract Security Rules',
    coverSubtitle: 'Vulnerabilities that cause 80% of protocol exploits, and how top teams prevent them.',
    slides: [
      {
        title: '1. Storage Before Calls',
        body: 'Update contract balances before transferring tokens. This eliminates recursive reentrancy attacks.',
      },
      {
        title: '2. Explicit Access Controls',
        body: 'Default visibility leads to takeovers. Audit OpenZeppelin AccessControl inheritance on every entrypoint.',
      },
      {
        title: '3. Never Trust Spot AMMs',
        body: 'Flash loans easily manipulate spot reserves. Always require Chainlink decentralized feeds or TWAP oracles.',
      },
    ],
    ctaTitle: 'hashtagweb3.com',
    ctaSubtitle: 'Verified Web3 security guides, audit checklists, and active developer openings.',
    caption: `3 Smart Contract Security Rules

1. Storage Before Calls: Update contract balances before transferring tokens. This eliminates recursive reentrancy attacks.

2. Explicit Access Controls: Default visibility leads to takeovers. Audit OpenZeppelin AccessControl inheritance on every entrypoint.

3. Never Trust Spot AMMs: Flash loans easily manipulate spot reserves. Always require Chainlink decentralized feeds or TWAP oracles.

Read verified Web3 guides and security playbooks:
hashtagweb3.com

Subscribed by 60k+ Web3 builders and professionals.

#web3 #solidity #smartcontracts #web3security #ethereum #crypto #hashtagweb3`,
  },
];

interface CarouselState {
  postedIds: string[];
  history: Array<{
    id: string;
    postId: string;
    postedAt: string;
    slideCount: number;
  }>;
}

function loadState(): CarouselState {
  if (fs.existsSync(STATE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
    } catch {
      // Fallback
    }
  }
  return { postedIds: [], history: [] };
}

function saveState(state: CarouselState): void {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
}

async function renderSlideJpeg(
  type: 'cover' | 'content' | 'cta',
  category: string,
  slideNum: string,
  title: string,
  body: string,
  fontData: Buffer
): Promise<Buffer> {
  const isCta = type === 'cta';
  const element = {
    type: 'div',
    props: {
      style: {
        width: '1080px',
        height: '1080px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: '#ffffff',
        padding: '96px 88px',
      },
      children: [
        // Middle body: Ultra Clean Big Bold High-Contrast Typography
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: isCta ? 'center' : 'flex-start',
              textAlign: isCta ? 'center' : 'left',
              width: '100%',
              margin: '32px 0',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    fontSize: isCta ? '96px' : title.length > 40 ? '80px' : title.length > 25 ? '88px' : '96px',
                    fontWeight: 'bold',
                    color: '#090d16',
                    lineHeight: '1.12',
                    letterSpacing: '-3px',
                  },
                  children: title,
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    fontSize: '48px',
                    fontWeight: '500',
                    color: '#334155',
                    lineHeight: '1.4',
                    marginTop: '44px',
                    maxWidth: '920px',
                  },
                  children: body,
                },
              },
            ],
          },
        },
        // Bottom row: Minimalist Branded Footer
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              fontSize: '32px',
              fontWeight: 'bold',
            },
            children: [
              {
                type: 'span',
                props: {
                  style: { color: '#090d16', letterSpacing: '-0.5px' },
                  children: isCta ? 'Subscribed by 60k+ Web3 builders' : 'hashtagweb3.com',
                },
              },
            ],
          },
        },
      ],
    },
  };

  const svg = await satori(element, {
    width: 1080,
    height: 1080,
    fonts: [{ name: 'Inter', data: fontData, weight: 700, style: 'normal' }],
  });

  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1080 } });
  const pngBuf = resvg.render().asPng();
  return await sharp(pngBuf).jpeg({ quality: 95 }).toBuffer();
}

async function uploadJpegToHost(jpegBuffer: Buffer, filename: string): Promise<string> {
  // Primary: uguu.se
  try {
    const formData = new FormData();
    formData.append('files[]', new Blob([jpegBuffer], { type: 'image/jpeg' }), filename);

    const res = await fetch('https://uguu.se/upload', {
      method: 'POST',
      body: formData,
    });
    const data = (await res.json()) as any;
    if (data.success && data.files?.[0]?.url) {
      return data.files[0].url;
    }
  } catch (err) {
    console.warn('[Host] uguu.se upload failed, trying tmpfiles fallback:', (err as Error).message);
  }

  // Fallback: tmpfiles.org
  const formData = new FormData();
  formData.append('file', new Blob([jpegBuffer], { type: 'image/jpeg' }), filename);
  const res = await fetch('https://tmpfiles.org/api/v1/upload', {
    method: 'POST',
    body: formData,
  });
  const data = (await res.json()) as any;
  if (data.status === 'success' && data.data?.url) {
    return data.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
  }

  throw new Error('Failed to upload slide JPEG to public hosts.');
}

async function waitForInstagramContainer(
  containerId: string,
  pageToken: string,
  maxAttempts = 20,
  intervalMs = 3000
): Promise<void> {
  console.log(`[Instagram] Waiting for container ${containerId} to finish processing...`);
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, intervalMs));

    const checkRes = await fetch(
      `https://graph.facebook.com/v21.0/${containerId}?fields=status_code,status&access_token=${pageToken}`
    );
    const checkData = (await checkRes.json()) as { status_code?: string; status?: string; error?: any };

    if (!checkRes.ok || checkData.error) {
      console.warn(`[Instagram] Container check attempt ${attempt}/${maxAttempts} warning: ${JSON.stringify(checkData.error || checkData)}`);
      continue;
    }

    const statusCode = checkData.status_code;
    if (statusCode === 'FINISHED') {
      console.log(`✓ [Instagram] Container ${containerId} ready (status: FINISHED)`);
      return;
    }

    if (statusCode === 'ERROR') {
      throw new Error(`Instagram container ${containerId} failed: ${JSON.stringify(checkData)}`);
    }

    if (statusCode === 'EXPIRED') {
      throw new Error(`Instagram container ${containerId} expired.`);
    }

    console.log(`[Instagram] Container ${containerId} status: ${statusCode || 'IN_PROGRESS'} (${attempt}/${maxAttempts})...`);
  }

  throw new Error(`Instagram container ${containerId} processing timed out.`);
}

async function publishInstagramCarousel(
  caption: string,
  jpegUrls: string[],
  igAccountId: string,
  pageToken: string
): Promise<string> {
  console.log(`\nCreating ${jpegUrls.length} Instagram carousel child items...`);
  const childIds: string[] = [];

  for (let i = 0; i < jpegUrls.length; i++) {
    const url = jpegUrls[i];
    console.log(`Creating carousel child container ${i + 1}/${jpegUrls.length}...`);
    const childRes = await fetch(`https://graph.facebook.com/v21.0/${igAccountId}/media`, {
      method: 'POST',
      body: new URLSearchParams({
        access_token: pageToken,
        image_url: url,
        is_carousel_item: 'true',
      }),
    });
    const childData = (await childRes.json()) as { id?: string; error?: any };
    if (!childRes.ok || childData.error || !childData.id) {
      throw new Error(`Instagram carousel child creation failed: ${JSON.stringify(childData.error || childData)}`);
    }
    childIds.push(childData.id);
  }

  // Wait for all child containers to finish downloading/processing
  console.log('\nWaiting for all carousel child items to process...');
  for (let i = 0; i < childIds.length; i++) {
    console.log(`Verifying slide ${i + 1}/${childIds.length} (ID: ${childIds[i]})...`);
    await waitForInstagramContainer(childIds[i], pageToken);
  }

  // Create parent Carousel container
  console.log('\nCreating parent Carousel container...');
  const carouselRes = await fetch(`https://graph.facebook.com/v21.0/${igAccountId}/media`, {
    method: 'POST',
    body: new URLSearchParams({
      access_token: pageToken,
      media_type: 'CAROUSEL',
      children: childIds.join(','),
      caption,
    }),
  });
  const carouselData = (await carouselRes.json()) as { id?: string; error?: any };
  if (!carouselRes.ok || carouselData.error || !carouselData.id) {
    throw new Error(`Instagram carousel parent creation failed: ${JSON.stringify(carouselData.error || carouselData)}`);
  }
  const carouselContainerId = carouselData.id;
  console.log(`Parent Carousel container created: ${carouselContainerId}`);

  // Wait for parent carousel container to process
  await waitForInstagramContainer(carouselContainerId, pageToken);

  // Publish carousel
  console.log('\nPublishing Carousel to Instagram feed...');
  for (let attempt = 1; attempt <= 3; attempt++) {
    const publishRes = await fetch(`https://graph.facebook.com/v21.0/${igAccountId}/media_publish`, {
      method: 'POST',
      body: new URLSearchParams({
        access_token: pageToken,
        creation_id: carouselContainerId,
      }),
    });
    const publishData = (await publishRes.json()) as { id?: string; error?: any };

    if (publishRes.ok && publishData.id && !publishData.error) {
      return publishData.id;
    }

    if (attempt < 3 && publishData.error?.error_subcode === 2207027) {
      console.warn(`Media not ready on attempt ${attempt}/3, waiting 5s before retrying...`);
      await new Promise((resolve) => setTimeout(resolve, 5000));
      continue;
    }

    throw new Error(`Instagram carousel publish failed: ${JSON.stringify(publishData.error || publishData)}`);
  }

  throw new Error('Failed to publish carousel container after 3 attempts.');
}

async function main() {
  const isDryRun = process.argv.includes('--dry-run');
  const pageToken = process.env.META_PAGE_TOKEN;
  const igAccountId = process.env.INSTAGRAM_ACCOUNT_ID || '17841473830256790';

  if (!isDryRun && !pageToken) {
    throw new Error('Missing META_PAGE_TOKEN');
  }

  const fontData = fs.readFileSync(FONT_PATH);
  const state = loadState();
  const available = CAROUSEL_LIBRARY.filter((c) => !state.postedIds.includes(c.id));
  const selectedCarousel = available.length > 0 ? available[0] : CAROUSEL_LIBRARY[0];

  console.log(`====================================================`);
  console.log(` Instagram Minimal Editorial Carousel Poster [${isDryRun ? 'DRY RUN' : 'LIVE'}]`);
  console.log(`====================================================`);
  console.log(`Selected Carousel: "${selectedCarousel.coverTitle}" (${selectedCarousel.id})`);
  console.log(`Category: ${selectedCarousel.category}`);

  const totalSlides = selectedCarousel.slides.length + 2;
  const slideBuffers: Buffer[] = [];

  // 1. Render Cover Slide
  console.log(`Rendering Slide 1 (Cover)...`);
  const coverBuf = await renderSlideJpeg(
    'cover',
    selectedCarousel.category,
    `01 / 0${totalSlides}`,
    selectedCarousel.coverTitle,
    selectedCarousel.coverSubtitle,
    fontData
  );
  slideBuffers.push(coverBuf);

  // 2. Render Content Slides
  for (let i = 0; i < selectedCarousel.slides.length; i++) {
    const s = selectedCarousel.slides[i];
    const num = i + 2;
    console.log(`Rendering Slide ${num} (Content)...`);
    const sBuf = await renderSlideJpeg(
      'content',
      selectedCarousel.category,
      `0${num} / 0${totalSlides}`,
      s.title,
      s.body,
      fontData
    );
    slideBuffers.push(sBuf);
  }

  // 3. Render CTA Slide
  console.log(`Rendering Slide ${totalSlides} (CTA)...`);
  const ctaBuf = await renderSlideJpeg(
    'cta',
    selectedCarousel.category,
    `0${totalSlides} / 0${totalSlides}`,
    selectedCarousel.ctaTitle || 'hashtagweb3.com',
    selectedCarousel.ctaSubtitle || 'Verified Web3 career guides, compensation data, and active developer openings.',
    fontData
  );
  slideBuffers.push(ctaBuf);

  console.log(`\n--- Caption Preview ---`);
  console.log(selectedCarousel.caption);
  console.log(`-----------------------\n`);

  if (isDryRun) {
    console.log(`DRY RUN active: ${slideBuffers.length} slides rendered locally. No external Instagram calls made.`);
    return;
  }

  // Upload rendered JPEGs to public host
  console.log(`Uploading ${slideBuffers.length} rendered JPEGs to public host...`);
  const jpegUrls: string[] = [];
  for (let i = 0; i < slideBuffers.length; i++) {
    const filename = `slide_${i + 1}_${Date.now()}.jpg`;
    const url = await uploadJpegToHost(slideBuffers[i], filename);
    console.log(`✓ Slide ${i + 1} hosted: ${url}`);
    jpegUrls.push(url);
  }

  const postId = await publishInstagramCarousel(selectedCarousel.caption, jpegUrls, igAccountId, pageToken!);
  console.log(`\n✓ Successfully published Minimal Editorial Carousel to Instagram! Post ID: ${postId}`);

  state.postedIds.push(selectedCarousel.id);
  state.history.push({
    id: selectedCarousel.id,
    postId,
    postedAt: new Date().toISOString(),
    slideCount: jpegUrls.length,
  });
  saveState(state);
  console.log(`State saved to ${STATE_FILE}. Done.`);
}

main().catch((err) => {
  console.error('Fatal error posting advice carousel:', err);
  process.exit(1);
});
