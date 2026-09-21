/**
 * On-demand OG share cards (1200×630 PNG) for jobs/companies.
 *
 * The static precompute pipeline (`scripts/precompute-og-images.ts`) cannot
 * reach hosts that build from git (public/og is gitignored), so these route
 * handlers render the same card design per request. Responses carry
 * immutable year-long cache headers: each card renders once, then serves
 * from the edge.
 */
import * as fs from 'fs';
import * as path from 'path';
import satori from 'satori';
import sharp from 'sharp';
import { Resvg } from '@resvg/resvg-js';

const WIDTH = 1200;
const HEIGHT = 630;

let fontCache: Buffer | null = null;

function loadFont(): Buffer {
  if (!fontCache) {
    fontCache = fs.readFileSync(path.join(process.cwd(), 'scripts', 'social', 'fonts', 'Inter-Bold.ttf'));
  }
  return fontCache;
}

function truncate(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 3)}...`;
}

function titleFontSize(title: string): number {
  if (title.length > 55) return 60;
  if (title.length > 35) return 72;
  if (title.length > 20) return 86;
  return 100;
}

function jobCardElement(opts: { title: string; company: string }) {
  const displayTitle = truncate(opts.title, 70);
  const displayCompany = truncate(opts.company || 'Web3 Company', 40);
  const fontSize = titleFontSize(displayTitle);

  return {
    type: 'div',
    props: {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        fontFamily: 'Inter',
        backgroundColor: '#f1f5f9',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              width: 1120,
              height: 550,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              gap: 32,
              padding: '48px 64px',
              borderRadius: 32,
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 16,
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          fontSize: 48,
                          fontWeight: 800,
                          color: '#0284c7',
                          letterSpacing: -0.5,
                        },
                        children: displayCompany,
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          fontSize: 48,
                          fontWeight: 500,
                          color: '#475569',
                          letterSpacing: -0.5,
                        },
                        children: 'is hiring for',
                      },
                    },
                  ],
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    fontSize,
                    fontWeight: 900,
                    color: '#0f172a',
                    lineHeight: 1.14,
                    letterSpacing: -2,
                    maxWidth: 1020,
                    padding: '0 20px',
                  },
                  children: displayTitle,
                },
              },
            ],
          },
        },
      ],
    },
  };
}

/** Render a compressed palette PNG (same bytes as the precompute pipeline). */
export async function renderJobCardPng(title: string, company: string): Promise<Buffer> {
  const svg = await satori(jobCardElement({ title, company }) as Parameters<typeof satori>[0], {
    width: WIDTH,
    height: HEIGHT,
    fonts: [{ name: 'Inter', data: loadFont(), weight: 700, style: 'normal' }],
  });
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: WIDTH } });
  const raw = Buffer.from(resvg.render().asPng());
  try {
    return await sharp(raw)
      .png({ compressionLevel: 9, palette: true, quality: 82 })
      .toBuffer();
  } catch {
    return raw;
  }
}
