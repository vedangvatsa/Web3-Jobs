import fs from "fs";
import path from "path";

const REMAINING_SLUGS = [
  "baton-corporation",
  "biti",
  "bitway",
  "fintax",
  "hertzflow",
  "manifolds-ai",
  "openeden",
  "termix"
];

function generateSvgLogo(name: string): string {
  const initial = name.slice(0, 1).toUpperCase();
  return `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
  <rect width="128" height="128" rx="28" fill="#1e293b"/>
  <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="64" font-weight="700" fill="#38bdf8">${initial}</text>
</svg>`;
}

for (const slug of REMAINING_SLUGS) {
  const targetPath = path.join(process.cwd(), `public/logo/companies/${slug}.png`);
  // Generate high quality PNG or SVG placeholder
  const svg = generateSvgLogo(slug);
  fs.writeFileSync(path.join(process.cwd(), `public/logo/companies/${slug}.svg`), svg);
  console.log(`Generated logo SVG for ${slug}`);
}

