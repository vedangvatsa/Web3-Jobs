import * as fs from 'fs';
import * as path from 'path';
import {
  buildOgPreviewHtml,
  collectOgPreviewPaths,
  previewAssetPath,
  resolveOgPreviewMeta,
} from '../src/lib/og-preview';

const OUT_ROOT = path.join(process.cwd(), 'public', 'preview');

async function main() {
  if (fs.existsSync(OUT_ROOT)) {
    for (const entry of fs.readdirSync(OUT_ROOT)) {
      fs.rmSync(path.join(OUT_ROOT, entry), { recursive: true, force: true, maxRetries: 5, retryDelay: 150 });
    }
  } else {
    fs.mkdirSync(OUT_ROOT, { recursive: true });
  }

  const paths = await collectOgPreviewPaths();
  let written = 0;

  for (const contentPath of paths) {
    const meta = await resolveOgPreviewMeta(contentPath);
    const html = buildOgPreviewHtml(meta);
    const asset = previewAssetPath(contentPath);
    const outFile = path.join(process.cwd(), 'public', asset.replace(/^\//, ''));
    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    fs.writeFileSync(outFile, html, 'utf8');
    written += 1;
  }

  // Fallback shell for unknown paths (bots hit this until the next build).
  const fallback = buildOgPreviewHtml(await resolveOgPreviewMeta('/'));
  fs.writeFileSync(path.join(OUT_ROOT, 'default.html'), fallback, 'utf8');

  console.log(`[precompute-og-previews] Wrote ${written} preview shells + default.html → ${OUT_ROOT}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
