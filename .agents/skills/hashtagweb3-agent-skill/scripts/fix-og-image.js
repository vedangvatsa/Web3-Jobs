const sharp = require('sharp');
const { Resvg } = require('@resvg/resvg-js');
const fs = require('fs');
const path = require('path');

const svg = `
<svg width="1200" height="120" viewBox="0 0 1200 120" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="120" fill="#fbfaff" />
  <g transform="translate(600, 60)" text-anchor="middle" dominant-baseline="central">
    <!-- RSS / Feed Icon -->
    <g transform="translate(-320, -14)">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 11a9 9 0 0 1 9 9" />
        <path d="M4 4a16 16 0 0 1 16 16" />
        <circle cx="5" cy="19" r="1.5" fill="#475569" />
      </svg>
    </g>
    <!-- Text -->
    <text font-family="system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif" font-size="28px" fill="#475569" font-weight="500">
      <tspan dx="40">Join our hiring feed with </tspan>
      <tspan fill="#0284c7" font-weight="700">60,000+</tspan>
      <tspan> subscribers.</tspan>
    </text>
  </g>
</svg>
`;

const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } });
const pngData = resvg.render().asPng();

const ogImagePath = path.join(__dirname, '../public/og-image.png');
const appOgPath = path.join(__dirname, '../src/app/opengraph-image.png');
const appTwitterPath = path.join(__dirname, '../src/app/twitter-image.png');

sharp(ogImagePath)
  .composite([
    {
      input: pngData,
      top: 510,
      left: 0,
    }
  ])
  .toBuffer()
  .then(buffer => {
    fs.writeFileSync(ogImagePath, buffer);
    fs.writeFileSync(appOgPath, buffer);
    fs.writeFileSync(appTwitterPath, buffer);
    console.log('Successfully updated og-image.png, src/app/opengraph-image.png, and src/app/twitter-image.png with clean 60,000+ subscribers text!');
  })
  .catch(err => {
    console.error('Error updating og-image:', err);
    process.exit(1);
  });
