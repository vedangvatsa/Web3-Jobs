import sharp from 'sharp';

/** Palette-first PNG squeeze for flat OG cards (1200×630). */
export async function compressOgPng(raw: Buffer): Promise<Buffer> {
  const attempts: sharp.PngOptions[] = [
    { palette: true, colors: 64, compressionLevel: 9, quality: 75, effort: 10, dither: 0 },
    { palette: true, colors: 96, compressionLevel: 9, quality: 78, effort: 10, dither: 0.5 },
    { palette: true, colors: 128, compressionLevel: 9, quality: 80, effort: 10 },
    { compressionLevel: 9, adaptiveFiltering: true },
  ];

  let best = raw;
  for (const opts of attempts) {
    try {
      const out = await sharp(raw).png(opts).toBuffer();
      if (out.length < best.length) best = out;
    } catch {
      // try next strategy
    }
  }
  return best;
}
