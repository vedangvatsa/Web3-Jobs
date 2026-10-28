import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer';
import sharp from 'sharp';

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'public', 'images', 'social');
const ARTIFACT_DIR = '/Users/vedang/.gemini/antigravity/brain/d8e0523d-8c6b-4440-8112-6fd00000dadf';
fs.mkdirSync(OUT_DIR, { recursive: true });

async function generateSocialVisuals() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  // ==========================================
  // STEP 1: Screenshot Crops from Live Site
  // ==========================================
  
  // Crop A: 16:9 Landscape Wide Crop (1136 x 480)
  const pageLandscape = await browser.newPage();
  await pageLandscape.setViewport({ width: 1200, height: 1400, deviceScaleFactor: 2 });
  await pageLandscape.goto('https://hashtagweb3.com/devcon', { waitUntil: 'networkidle2', timeout: 30000 });
  await pageLandscape.evaluate(() => {
    document.querySelectorAll('[role="dialog"], .fixed.z-50').forEach(el => el.remove());
  });

  const cropLandscapePath = '/tmp/devcon-side-events-landscape-crop.png';
  await pageLandscape.screenshot({
    path: cropLandscapePath,
    clip: { x: 32, y: 1960, width: 1136, height: 480 }
  });
  await pageLandscape.close();
  const cropLandscapeBase64 = fs.readFileSync(cropLandscapePath).toString('base64');

  // Crop B: 1:1 Square 3-Row Crop (992 x 552)
  const pageSquare = await browser.newPage();
  await pageSquare.setViewport({ width: 1040, height: 4000, deviceScaleFactor: 2 });
  await pageSquare.goto('https://hashtagweb3.com/devcon', { waitUntil: 'networkidle2', timeout: 30000 });
  await pageSquare.evaluate(() => {
    document.querySelectorAll('[role="dialog"], .fixed.z-50').forEach(el => el.remove());
  });

  const cropSquarePath = '/tmp/devcon-side-events-square-crop.png';
  await pageSquare.screenshot({
    path: cropSquarePath,
    clip: { x: 24, y: 2085, width: 992, height: 552 }
  });
  await pageSquare.close();
  const cropSquareBase64 = fs.readFileSync(cropSquarePath).toString('base64');

  // ==========================================
  // CARD 1: Landscape (1200 x 675, 16:9)
  // For X / Twitter, LinkedIn & Web
  // ==========================================
  const card1Page = await browser.newPage();
  await card1Page.setViewport({ width: 1200, height: 675, deviceScaleFactor: 2 });

  const htmlLandscape = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }
    body {
      width: 1200px;
      height: 675px;
      overflow: hidden;
      background: #080c14;
      color: #ffffff;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 26px 42px 24px;
    }

    .glow-1 {
      position: absolute;
      width: 750px;
      height: 400px;
      top: -120px;
      left: 220px;
      background: radial-gradient(circle, rgba(59, 130, 246, 0.22) 0%, rgba(139, 92, 246, 0.14) 40%, transparent 70%);
      filter: blur(55px);
      pointer-events: none;
      z-index: 0;
    }
    .glow-2 {
      position: absolute;
      width: 550px;
      height: 380px;
      bottom: -100px;
      right: -60px;
      background: radial-gradient(circle, rgba(16, 185, 129, 0.16) 0%, transparent 70%);
      filter: blur(65px);
      pointer-events: none;
      z-index: 0;
    }
    .grid-pattern {
      position: absolute;
      inset: 0;
      background-image: 
        linear-gradient(to right, rgba(255, 255, 255, 0.035) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
      background-size: 32px 32px;
      mask-image: radial-gradient(ellipse 90% 70% at 50% 30%, black 40%, transparent 95%);
      pointer-events: none;
      z-index: 0;
    }

    .top-bar {
      position: relative;
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .brand-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-logo {
      font-size: 21px;
      font-weight: 900;
      letter-spacing: -0.04em;
      text-transform: uppercase;
      background: linear-gradient(135deg, #ffffff 40%, #94a3b8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .event-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      padding: 5px 14px;
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 600;
      color: #94a3b8;
    }
    .event-badge span.accent {
      color: #38bdf8;
      font-weight: 700;
    }

    .traction-pill {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.38);
      padding: 6px 18px;
      border-radius: 9999px;
      box-shadow: 0 0 24px rgba(16, 185, 129, 0.22);
    }
    .pulse-dot {
      width: 9px;
      height: 9px;
      background: #10b981;
      border-radius: 50%;
      box-shadow: 0 0 10px #10b981;
    }
    .traction-text {
      font-size: 14px;
      font-weight: 750;
      color: #34d399;
      letter-spacing: -0.01em;
    }
    .traction-sub {
      font-size: 13px;
      font-weight: 600;
      color: #cbd5e1;
      margin-left: 4px;
      border-left: 1px solid rgba(255, 255, 255, 0.2);
      padding-left: 10px;
    }

    .mockup-container {
      position: relative;
      z-index: 10;
      margin: 12px 0;
      background: #0f1422;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.14);
      box-shadow: 
        0 25px 60px -12px rgba(0, 0, 0, 0.85),
        0 0 40px rgba(59, 130, 246, 0.15);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .window-header {
      background: #131826;
      padding: 8px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .window-dots {
      display: flex;
      align-items: center;
      gap: 7px;
    }
    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
    .dot.red { background: #ff5f56; }
    .dot.yellow { background: #ffbd2e; }
    .dot.green { background: #27c93f; }

    .url-bar {
      display: flex;
      align-items: center;
      gap: 7px;
      background: #090d16;
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 4px 20px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
    }
    .url-lock { font-size: 11px; color: #10b981; }
    .url-domain { color: #ffffff; font-weight: 600; }
    .url-path { color: #38bdf8; font-weight: 600; }

    .window-tag {
      font-size: 11px;
      color: #38bdf8;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      background: rgba(56, 189, 248, 0.1);
      border: 1px solid rgba(56, 189, 248, 0.25);
      padding: 3px 10px;
      border-radius: 4px;
    }

    .window-content {
      position: relative;
      width: 100%;
      height: 465px;
      overflow: hidden;
      background: #ffffff;
    }
    .window-content img {
      width: 100%;
      height: 100%;
      display: block;
      object-fit: cover;
      object-position: top center;
    }

    .footer-bar {
      position: relative;
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .footer-highlights {
      display: flex;
      align-items: center;
      gap: 22px;
    }
    .highlight-pill {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 600;
      color: #cbd5e1;
    }
    .highlight-pill .check {
      color: #10b981;
      font-weight: 900;
      font-size: 15px;
    }
    .footer-cta {
      display: flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      border: 1px solid rgba(255, 255, 255, 0.25);
      color: #ffffff;
      padding: 10px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 700;
      letter-spacing: -0.01em;
      box-shadow: 0 4px 18px rgba(37, 99, 235, 0.45);
    }
    .footer-cta span.arrow {
      font-size: 16px;
    }
  </style>
</head>
<body>
  <div class="glow-1"></div>
  <div class="glow-2"></div>
  <div class="grid-pattern"></div>

  <!-- Top Bar -->
  <div class="top-bar">
    <div class="brand-left">
      <div class="brand-logo">Hashtag Web3</div>
      <div class="event-badge">
        <span class="accent">Devcon 8 & IBW 2026</span> · Mumbai Guide
      </div>
    </div>
    <div class="traction-pill">
      <div class="pulse-dot"></div>
      <div class="traction-text">1,500+ Attendees Visited</div>
      <div class="traction-sub">116+ Curated Side Events</div>
    </div>
  </div>

  <!-- Browser Window Mockup -->
  <div class="mockup-container">
    <div class="window-header">
      <div class="window-dots">
        <div class="dot red"></div>
        <div class="dot yellow"></div>
        <div class="dot green"></div>
      </div>
      <div class="url-bar">
        <span class="url-lock">🔒</span>
        <span class="url-domain">hashtagweb3.com</span><span class="url-path">/devcon</span>
      </div>
      <div class="window-tag">Live Tracker</div>
    </div>
    <div class="window-content">
      <img src="data:image/png;base64,${cropLandscapeBase64}" alt="Devcon Side Events Tracker" />
    </div>
  </div>

  <!-- Footer Action Bar -->
  <div class="footer-bar">
    <div class="footer-highlights">
      <div class="highlight-pill">
        <span class="check">✓</span> Free Community Side Event Listing
      </div>
      <div class="highlight-pill">
        <span class="check">✓</span> Top Featured Spots Available
      </div>
    </div>
    <div class="footer-cta">
      <span>DM to Get Added or Featured</span>
      <span class="arrow">→</span>
    </div>
  </div>
</body>
</html>`;

  await card1Page.setContent(htmlLandscape, { waitUntil: 'networkidle0' });

  const card1Png = path.join(OUT_DIR, 'devcon-ibw-side-events-1500.png');
  const artifactCard1Png = path.join(ARTIFACT_DIR, 'devcon-ibw-side-events-1500.png');

  await card1Page.screenshot({ path: card1Png });
  fs.copyFileSync(card1Png, artifactCard1Png);
  console.log('Saved Card 1 Landscape to:', card1Png);

  const card1Webp = await sharp(card1Png).webp({ quality: 92 }).toBuffer();
  fs.writeFileSync(path.join(OUT_DIR, 'devcon-ibw-side-events-1500.webp'), card1Webp);
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'devcon-ibw-side-events-1500.webp'), card1Webp);
  await card1Page.close();

  // ==========================================
  // CARD 2: Square (1080 x 1080, 1:1)
  // For Instagram, Telegram & Feed Posts
  // ==========================================
  const card2Page = await browser.newPage();
  await card2Page.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 2 });

  const htmlSquare = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }
    body {
      width: 1080px;
      height: 1080px;
      overflow: hidden;
      background: #080c14;
      color: #ffffff;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 34px 44px;
    }
    .glow-1 {
      position: absolute;
      width: 800px;
      height: 450px;
      top: -100px;
      left: 140px;
      background: radial-gradient(circle, rgba(59, 130, 246, 0.22) 0%, rgba(139, 92, 246, 0.12) 40%, transparent 70%);
      filter: blur(60px);
      pointer-events: none;
      z-index: 0;
    }
    .glow-2 {
      position: absolute;
      width: 650px;
      height: 450px;
      bottom: -100px;
      right: -80px;
      background: radial-gradient(circle, rgba(16, 185, 129, 0.18) 0%, transparent 70%);
      filter: blur(70px);
      pointer-events: none;
      z-index: 0;
    }
    .grid-pattern {
      position: absolute;
      inset: 0;
      background-image: 
        linear-gradient(to right, rgba(255, 255, 255, 0.035) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
      background-size: 32px 32px;
      mask-image: radial-gradient(ellipse 90% 75% at 50% 35%, black 45%, transparent 95%);
      pointer-events: none;
      z-index: 0;
    }

    .top-bar {
      position: relative;
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .brand-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-logo {
      font-size: 22px;
      font-weight: 900;
      letter-spacing: -0.04em;
      text-transform: uppercase;
      background: linear-gradient(135deg, #ffffff 40%, #94a3b8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .event-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      padding: 5px 14px;
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 600;
      color: #94a3b8;
    }
    .event-badge span.accent {
      color: #38bdf8;
      font-weight: 700;
    }

    .traction-pill {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.38);
      padding: 6px 18px;
      border-radius: 9999px;
      box-shadow: 0 0 24px rgba(16, 185, 129, 0.22);
    }
    .pulse-dot {
      width: 9px;
      height: 9px;
      background: #10b981;
      border-radius: 50%;
      box-shadow: 0 0 10px #10b981;
    }
    .traction-text {
      font-size: 14px;
      font-weight: 750;
      color: #34d399;
      letter-spacing: -0.01em;
    }
    .traction-sub {
      font-size: 13px;
      font-weight: 600;
      color: #cbd5e1;
      margin-left: 4px;
      border-left: 1px solid rgba(255, 255, 255, 0.2);
      padding-left: 10px;
    }

    .mockup-container {
      position: relative;
      z-index: 10;
      width: 992px;
      margin: 0 auto;
      background: #0f1422;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.14);
      box-shadow: 
        0 25px 60px -12px rgba(0, 0, 0, 0.85),
        0 0 40px rgba(59, 130, 246, 0.15);
      overflow: hidden;
    }
    .window-header {
      background: #131826;
      padding: 9px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .window-dots {
      display: flex;
      align-items: center;
      gap: 7px;
    }
    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
    .dot.red { background: #ff5f56; }
    .dot.yellow { background: #ffbd2e; }
    .dot.green { background: #27c93f; }

    .url-bar {
      display: flex;
      align-items: center;
      gap: 7px;
      background: #090d16;
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 4px 20px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
    }
    .url-lock { font-size: 11px; color: #10b981; }
    .url-domain { color: #ffffff; font-weight: 600; }
    .url-path { color: #38bdf8; font-weight: 600; }

    .window-tag {
      font-size: 11px;
      color: #38bdf8;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      background: rgba(56, 189, 248, 0.1);
      border: 1px solid rgba(56, 189, 248, 0.25);
      padding: 3px 10px;
      border-radius: 4px;
    }

    .window-content {
      width: 992px;
      height: 552px;
      background: #ffffff;
      overflow: hidden;
    }
    .window-content img {
      width: 100%;
      height: 100%;
      display: block;
    }

    .organizer-card {
      position: relative;
      z-index: 10;
      width: 992px;
      margin: 0 auto;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.02) 100%);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 14px;
      padding: 22px 30px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
    }
    .organizer-headline-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .organizer-titles {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .organizer-sub {
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #38bdf8;
    }
    .organizer-main {
      font-size: 21px;
      font-weight: 850;
      letter-spacing: -0.02em;
      color: #ffffff;
    }
    .organizer-main span.gradient {
      background: linear-gradient(135deg, #38bdf8, #818cf8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .benefits-row {
      display: flex;
      align-items: center;
      gap: 24px;
    }
    .benefit-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 600;
      color: #cbd5e1;
    }
    .benefit-item .check {
      color: #10b981;
      font-weight: 900;
      font-size: 15px;
    }

    .action-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: 14px;
    }
    .action-cta {
      display: flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      border: 1px solid rgba(255, 255, 255, 0.25);
      color: #ffffff;
      padding: 11px 26px;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 750;
      letter-spacing: -0.01em;
      box-shadow: 0 4px 18px rgba(37, 99, 235, 0.45);
    }
    .site-link {
      font-size: 14px;
      font-weight: 600;
      color: #94a3b8;
    }
    .site-link span.bold {
      color: #38bdf8;
      font-weight: 700;
    }
  </style>
</head>
<body>
  <div class="glow-1"></div>
  <div class="glow-2"></div>
  <div class="grid-pattern"></div>

  <!-- Top Bar -->
  <div class="top-bar">
    <div class="brand-left">
      <div class="brand-logo">Hashtag Web3</div>
      <div class="event-badge">
        <span class="accent">Devcon 8 & IBW 2026</span> · Mumbai Guide
      </div>
    </div>
    <div class="traction-pill">
      <div class="pulse-dot"></div>
      <div class="traction-text">1,500+ Attendees Visited</div>
      <div class="traction-sub">116+ Curated Side Events</div>
    </div>
  </div>

  <!-- Browser Window Mockup -->
  <div class="mockup-container">
    <div class="window-header">
      <div class="window-dots">
        <div class="dot red"></div>
        <div class="dot yellow"></div>
        <div class="dot green"></div>
      </div>
      <div class="url-bar">
        <span class="url-lock">🔒</span>
        <span class="url-domain">hashtagweb3.com</span><span class="url-path">/devcon</span>
      </div>
      <div class="window-tag">Live Tracker</div>
    </div>
    <div class="window-content">
      <img src="data:image/png;base64,${cropSquareBase64}" alt="Devcon Side Events Tracker" />
    </div>
  </div>

  <!-- Organizer Feature Card -->
  <div class="organizer-card">
    <div class="organizer-headline-row">
      <div class="organizer-titles">
        <div class="organizer-sub">Side Event Organizers</div>
        <div class="organizer-main">Hosting an event during <span class="gradient">Devcon 8 or IBW 2026?</span></div>
      </div>
    </div>

    <div class="benefits-row">
      <div class="benefit-item">
        <span class="check">✓</span> Free Community Side Event Listing
      </div>
      <div class="benefit-item">
        <span class="check">✓</span> Top Featured Spots for Peak Visibility
      </div>
      <div class="benefit-item">
        <span class="check">✓</span> Direct Reach to 1,500+ Attendees
      </div>
    </div>

    <div class="action-row">
      <div class="action-cta">
        <span>DM to Get Added or Featured</span>
        <span>→</span>
      </div>
      <div class="site-link">
        Live Tracker: <span class="bold">hashtagweb3.com/devcon</span>
      </div>
    </div>
  </div>
</body>
</html>`;

  await card2Page.setContent(htmlSquare, { waitUntil: 'networkidle0' });

  const card2Png = path.join(OUT_DIR, 'devcon-ibw-side-events-square.png');
  const artifactCard2Png = path.join(ARTIFACT_DIR, 'devcon-ibw-side-events-square.png');

  await card2Page.screenshot({ path: card2Png });
  fs.copyFileSync(card2Png, artifactCard2Png);
  console.log('Saved Card 2 Square to:', card2Png);

  const card2Webp = await sharp(card2Png).webp({ quality: 92 }).toBuffer();
  fs.writeFileSync(path.join(OUT_DIR, 'devcon-ibw-side-events-square.webp'), card2Webp);
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'devcon-ibw-side-events-square.webp'), card2Webp);
  await card2Page.close();

  await browser.close();
  console.log('Finished generating both social cards successfully!');
}

generateSocialVisuals().catch(console.error);
