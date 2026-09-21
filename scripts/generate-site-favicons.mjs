/**
 * Renders site favicons: upright “#” with round caps (Inter’s # glyph is italic-slanted).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

function hashSvg(size, { background = null, padding = 0.2 } = {}) {
  const pad = size * padding;
  const inner = size - pad * 2;
  const scale = inner / 100;
  const bg =
    background === null
      ? ''
      : `<rect width="${size}" height="${size}" fill="${background}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${bg}<g transform="translate(${pad} ${pad}) scale(${scale})" fill="none" stroke="#000000" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"><line x1="35" y1="18" x2="35" y2="82"/><line x1="65" y1="18" x2="65" y2="82"/><line x1="18" y1="36" x2="82" y2="36"/><line x1="18" y1="64" x2="82" y2="64"/></g></svg>`;
}

function renderPng(svg, size) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: size },
    font: { loadSystemFonts: false },
  });
  return resvg.render().asPng();
}

function assertHasInk(png, label) {
  let opaque = 0;
  for (let i = 3; i < png.length; i += 4) {
    if (png[i] > 20) opaque++;
  }
  if (opaque < 8) {
    throw new Error(`${label}: rendered favicon has no visible pixels`);
  }
}

function icoFromPngs(pngs) {
  const count = pngs.length;
  const header = 6;
  const dir = 16 * count;
  let offset = header + dir;
  const entries = [];
  const images = [];
  for (const { size, buf } of pngs) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(buf.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    images.push(buf);
    offset += buf.length;
  }
  const head = Buffer.alloc(6);
  head.writeUInt16LE(0, 0);
  head.writeUInt16LE(1, 2);
  head.writeUInt16LE(count, 4);
  return Buffer.concat([head, ...entries, ...images]);
}

const outputs = [
  {
    file: 'public/favicon.ico',
    build: () => {
      const sizes = [
        { size: 16, padding: 0.1 },
        { size: 32, padding: 0.1 },
        { size: 48, padding: 0.1 },
      ];
      const pngs = sizes.map(({ size, padding }) => {
        const buf = renderPng(hashSvg(size, { padding }), size);
        assertHasInk(buf, `favicon ${size}`);
        return { size, buf };
      });
      return icoFromPngs(pngs);
    },
  },
  {
    file: 'public/icon.png',
    build: () => {
      const buf = renderPng(hashSvg(192, { padding: 0.1 }), 192);
      assertHasInk(buf, 'icon 192');
      return buf;
    },
  },
  {
    file: 'public/apple-icon.png',
    build: () => {
      const buf = renderPng(hashSvg(180, { background: '#ffffff', padding: 0.1 }), 180);
      assertHasInk(buf, 'apple 180');
      return buf;
    },
  },
];

for (const { file, build } of outputs) {
  const abs = path.join(root, file);
  fs.writeFileSync(abs, build());
  console.log('wrote', file);
}
