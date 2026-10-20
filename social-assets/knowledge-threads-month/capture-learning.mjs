// Capture: node --import tsx social-assets/knowledge-threads-month/capture-learning.mjs
// Verify existing files: append --validate-only. Use --origin=http://127.0.0.1:3102 for a labeled local capture.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { chromium } from 'playwright';
import sharp from 'sharp';
import { interviewData } from '../../src/lib/interview-questions.ts';

const execFileAsync = promisify(execFile);
const root = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(root, 'assets/revision/learning');
const manifestPath = path.join(root, 'assets/revision/learning-captures.json');
const args = process.argv.slice(2);
const option = (name, fallback) => args.find(arg => arg.startsWith(`--${name}=`))?.slice(name.length + 3) || fallback;
const origin = option('origin', 'https://hashtagweb3.com').replace(/\/$/, '');
assert(['https://hashtagweb3.com', 'http://127.0.0.1:3102'].includes(origin), 'Use the live site or the approved local preview.');
const sourceKind = origin.startsWith('http://127.') ? 'Local preview, not a production-site capture' : 'Live production website';
const executablePath = option('executable', '/Users/vedang/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing');
const viewport = { width: 530, height: 1500 };
const dpr = 2;
const normalize = text => text.replace(/\s+/g, ' ').trim();
const ocrNormalize = text => text.toLowerCase().replace(/[^a-z0-9]/g, '');
const questionSets = [
  { threadId: 'N03', roleId: 'solidity-developer', ids: ['SOL-F-01', 'SOL-F-02', 'SOL-F-04', 'SOL-I-02', 'SOL-I-03'] },
  { threadId: 'N04', roleId: 'frontend-dapp-engineer', ids: ['FE-F-01', 'FE-F-02', 'FE-I-01', 'FE-A-01', 'FE-E-01'] },
  { threadId: 'C07', roleId: 'smart-contract-auditor', ids: ['AUD-F-02', 'AUD-I-01', 'AUD-I-02', 'AUD-A-02', 'AUD-E-02'] },
];
const lessons = [
  { postNumber: 2, route: '/wallet-basics', title: 'Wallets and Private Keys', heading: 'Keys, addresses, and signatures', end: 'In a self-custodial wallet, you control the keys or account permissions.' },
  { postNumber: 3, route: '/defi-lending', title: 'Lending and Borrowing in DeFi', heading: 'Loans without banks', end: 'A collateralized position generally needs collateral worth more than the borrowed amount.' },
  { postNumber: 4, route: '/contract-testing', title: 'Testing Smart Contracts', heading: 'Why Smart Contract Testing Is Different', end: 'Use tests alongside code review, deployment checks, and monitoring.' },
  { postNumber: 5, route: '/growth-metrics', title: 'Growth Metrics and Analytics', heading: 'Web3 Metrics Are Different', end: 'Define what each dataset measures:' },
  { postNumber: 6, route: '/onchain-agents', title: 'Autonomous Agents', heading: 'What is an Autonomous Agent?', end: 'An agent is a program that uses a model to select actions and call tools while working toward a task.' },
];
const questions = new Map(interviewData.roles.flatMap(role => Object.values(role.questions).flat().map(question => [question.id, { ...question, roleId: role.id }])));
const expectedFiles = new Set([
  ...questionSets.flatMap(set => [
    `${set.threadId}-01-role.png`,
    ...set.ids.map((id, index) => `${set.threadId}-${String(index + 2).padStart(2, '0')}-${id}.png`),
  ]),
  'N09-01-library.png',
  ...lessons.map(lesson => `N09-${String(lesson.postNumber).padStart(2, '0')}-${lesson.route.slice(1)}.png`),
  'N09-04-transfer-code.png',
  'N09-06-permissions.png',
]);

function domRange(element, start, end) {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  let offset = 0;
  let node;
  let started = false;
  while ((node = walker.nextNode())) {
    const length = node.textContent.length;
    if (!started && start < offset + length) {
      range.setStart(node, start - offset);
      started = true;
    }
    if (started && end <= offset + length) {
      range.setEnd(node, end - offset);
      return range;
    }
    offset += length;
  }
  throw new Error('Code range offsets no longer match the page.');
}

async function validate(records) {
  assert.equal(records.length, expectedFiles.size, 'Capture manifest must contain all 26 planned files.');
  assert.equal(new Set(records.map(record => record.id)).size, records.length);
  assert.deepEqual(new Set(records.map(record => path.basename(record.file))), expectedFiles);
  const coverage = new Set();
  let totalBytes = 0;
  let maxBytes = 0;
  let questionCount = 0;
  const ocrIssues = [];
  for (const record of records) {
    assert(['N03', 'N04', 'C07', 'N09'].includes(record.threadId));
    assert(record.postNumber >= 1 && record.postNumber <= 6);
    coverage.add(`${record.threadId}/${record.postNumber}`);
    assert(record.file.startsWith('assets/revision/learning/') && !record.file.includes('..'));
    assert(record.visibleText.trim().length > 20, `Empty or control-only capture: ${record.id}`);
    assert(!Number.isNaN(Date.parse(record.capturedAt)));
    assert(record.sourceRevision.startsWith('sha256:'));
    const source = new URL(record.sourceUrl);
    assert.equal(source.pathname + source.hash, record.route);
    assert(['https://hashtagweb3.com', 'http://127.0.0.1:3102'].includes(source.origin));
    assert(record.detail.includes(source.origin.startsWith('http://127.') ? 'Local preview' : 'Live production website'));
    const filePath = path.join(root, record.file);
    const stat = await fs.stat(filePath);
    assert(stat.size < 2_000_000, `Image exceeds 2 MB: ${record.file}`);
    totalBytes += stat.size;
    maxBytes = Math.max(maxBytes, stat.size);
    const image = sharp(filePath, { failOn: 'error' });
    const meta = await image.metadata();
    assert.equal(meta.format, 'png');
    assert.equal(meta.width, record.width);
    assert.equal(meta.height, record.height);
    assert(meta.width > 250 && meta.height > 40, `Unusable crop dimensions: ${record.file}`);
    const { info } = await image.raw().toBuffer({ resolveWithObject: true });
    assert.equal(info.width, record.width);
    assert.equal(info.height, record.height);
    const questionId = record.id.match(/(?:SOL|FE|AUD)-[FIAE]-\d{2}$/)?.[0];
    if (questionId) {
      const question = questions.get(questionId);
      assert(question, `Unknown source question: ${questionId}`);
      assert.equal(record.route, `/interview-questions#${question.roleId}`);
      assert(normalize(record.visibleText).includes(normalize(question.question)), `Copied question differs from original: ${questionId}`);
      assert(!record.visibleText.includes('Ideal Answer'), `Question crop includes the bank answer: ${questionId}`);
      questionCount++;
      let matched = false;
      let recognized = '';
      for (const mode of ['6', '11']) {
        const { stdout } = await execFileAsync('tesseract', [filePath, 'stdout', '-l', 'eng', '--psm', mode], { maxBuffer: 1024 * 1024 });
        recognized = stdout;
        if (ocrNormalize(stdout).includes(ocrNormalize(question.question))) {
          matched = true;
          break;
        }
      }
      if (!matched) ocrIssues.push({ id: record.id, expected: question.question, recognized });
    }
  }
  assert.equal(questionCount, 15);
  assert.equal(coverage.size, 24, 'All four threads must have capture mappings for posts 1-6.');
  for (const lesson of lessons) {
    const record = records.find(item => item.threadId === 'N09' && item.postNumber === lesson.postNumber && item.route === lesson.route && item.id.endsWith(lesson.route.slice(1)));
    assert(record && record.visibleText.includes(lesson.title) && record.visibleText.includes(lesson.heading), `Missing lesson title and excerpt: ${lesson.title}`);
  }
  if (ocrIssues.length) console.log(JSON.stringify({ ocrIssues }, null, 2));
  assert.equal(ocrIssues.length, 0, 'OCR needs review: a question was not fully recovered from its pixels.');
  console.log(JSON.stringify({ status: 'PASS', imageFiles: records.length, questionExcerpts: questionCount, lessonHeaders: lessons.length, introContexts: 4, supportingExcerpts: 2, postMappings: coverage.size, decoded: records.length, originalQuestionMatches: questionCount, ocrQuestionMatches: questionCount, largestFileBytes: maxBytes, totalImageBytes: totalBytes, sources: [...new Set(records.map(record => new URL(record.sourceUrl).origin))], manifest: path.relative(root, manifestPath) }, null, 2));
}

if (args.includes('--validate-only')) {
  await validate(JSON.parse(await fs.readFile(manifestPath, 'utf8')));
} else {
  await fs.access(path.join(root, 'assets'));
  await fs.access(executablePath);
  await fs.mkdir(outDir, { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath });
  const context = await browser.newContext({ viewport, deviceScaleFactor: dpr, colorScheme: 'light', reducedMotion: 'reduce', locale: 'en-US' });
  const page = await context.newPage();
  page.setDefaultTimeout(30000);
  const records = [];
  let revision;
  let promoDismissed = false;

  async function visit(route) {
    const response = await page.goto(origin + route, { waitUntil: 'networkidle', timeout: 90000 });
    assert(response && response.status() === 200, `Page did not return 200: ${route}`);
    revision = `sha256:${createHash('sha256').update(await response.body()).digest('hex')}`;
    await page.evaluate(() => document.fonts.ready);
    if (!promoDismissed) {
      const promo = page.getByRole('dialog', { name: 'Discover more from Hashtag Web3', exact: true });
      await promo.waitFor({ state: 'visible', timeout: 15000 });
      await promo.getByRole('button', { name: 'Close', exact: true }).click();
      await promo.waitFor({ state: 'hidden' });
      promoDismissed = true;
    }
    await page.mouse.move(0, 0);
  }

  async function capture({ id, threadId, postNumber, route, fileName, locators, detail, expectedText, codeRange }) {
    assert(expectedFiles.has(fileName));
    for (const locator of locators) {
      assert.equal(await locator.count(), 1, `Ambiguous capture subject: ${id}`);
      await locator.waitFor({ state: 'visible' });
    }
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(document.getAnimations()
        .filter(animation => animation.effect?.getComputedTiming().iterations !== Infinity)
        .map(animation => animation.finished.catch(() => undefined)));
    });
    const rangeSource = domRange.toString();
    async function bounds() {
      const rects = await Promise.all(locators.map(locator => locator.evaluate((element, range) => {
        const box = range ? new Function(`return (${range.source})` )()(element, range.start, range.end).getBoundingClientRect() : element.getBoundingClientRect();
        return { left: box.left + scrollX, top: box.top + scrollY, right: box.right + scrollX, bottom: box.bottom + scrollY };
      }, codeRange ? { ...codeRange, source: rangeSource } : null)));
      return { left: Math.min(...rects.map(rect => rect.left)), top: Math.min(...rects.map(rect => rect.top)), right: Math.max(...rects.map(rect => rect.right)), bottom: Math.max(...rects.map(rect => rect.bottom)) };
    }
    const before = await bounds();
    const size = page.viewportSize();
    assert(before.bottom - before.top < size.height - 200, `Excerpt is too tall: ${id}`);
    await page.evaluate(top => window.scrollTo({ top, behavior: 'instant' }), Math.max(0, before.top - 140));
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const box = await bounds();
    const scroll = await page.evaluate(() => ({ x: scrollX, y: scrollY }));
    const left = Math.max(0, Math.floor(box.left - scroll.x - 6));
    const top = Math.max(0, Math.floor(box.top - scroll.y - 6));
    const right = Math.min(size.width, Math.ceil(box.right - scroll.x + 6));
    const bottom = Math.min(size.height, Math.ceil(box.bottom - scroll.y + 6));
    const clip = { x: left, y: top, width: right - left, height: bottom - top };
    assert(box.top - scroll.y >= 0 && box.bottom - scroll.y <= size.height, `Excerpt is clipped by the viewport: ${id} ${JSON.stringify({ clip, box, scroll })}`);
    let visibleText;
    if (codeRange) {
      visibleText = await locators[0].evaluate((element, range) => element.textContent.slice(range.start, range.end), codeRange);
    } else {
      visibleText = await page.evaluate(rect => {
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        const text = [];
        let node;
        while ((node = walker.nextNode())) {
          if (!node.textContent.trim() || node.parentElement.closest('script, style, noscript')) continue;
          const range = document.createRange();
          range.selectNodeContents(node);
          const boxes = [...range.getClientRects()].filter(box => box.width > 0 && box.height > 0);
          const intersects = box => box.right > rect.x && box.left < rect.x + rect.width && box.bottom > rect.y && box.top < rect.y + rect.height;
          if (!boxes.some(intersects)) continue;
          if (boxes.some(box => box.left < rect.x - 1 || box.right > rect.x + rect.width + 1 || box.top < rect.y - 1 || box.bottom > rect.y + rect.height + 1)) throw new Error(`Text cut by crop: ${node.textContent}`);
          const first = boxes[0];
          const hit = document.elementFromPoint((first.left + first.right) / 2, (first.top + first.bottom) / 2);
          if (!hit || !(hit.contains(node) || node.parentElement.contains(hit))) throw new Error(`Text obscured in crop: ${node.textContent}`);
          text.push(node.textContent.trim());
        }
        return text.join('\n');
      }, clip);
    }
    if (expectedText) assert(normalize(visibleText).includes(normalize(expectedText)), `Visible text differs from source: ${id}`);
    const image = await page.screenshot({ type: 'png', clip, animations: 'disabled', scale: 'device' });
    const meta = await sharp(image).metadata();
    assert.equal(meta.width, clip.width * dpr);
    assert.equal(meta.height, clip.height * dpr);
    assert(image.length < 2_000_000, `Image exceeds 2 MB: ${id}`);
    const file = `assets/revision/learning/${fileName}`;
    await fs.writeFile(path.join(root, file), image);
    records.push({ id, threadId, postNumber, file, sourceUrl: origin + route, route, sourceRevision: revision, capturedAt: new Date().toISOString(), visibleText, detail: `${sourceKind}. Native ${size.width}x${size.height} CSS-pixel viewport, DPR ${dpr}. ${detail} The site's promotional dialog was dismissed with its real Close button. PNG is an unscaled, contiguous browser crop. No DOM text, content order or styling was rewritten.`, width: meta.width, height: meta.height });
    console.log(`Captured ${id}: ${meta.width}x${meta.height}, ${image.length} bytes`);
  }

  try {
    await visit('/interview-questions');
    for (const set of questionSets) {
      const role = interviewData.roles.find(item => item.id === set.roleId);
      const section = page.locator(`#${set.roleId}`);
      const route = `/interview-questions#${set.roleId}`;
      await capture({ id: `${set.threadId}-01-role`, threadId: set.threadId, postNumber: 1, route, fileName: `${set.threadId}-01-role.png`, locators: [section.locator(':scope > div').first()], expectedText: role.role, detail: 'Actual role heading and descriptive paragraph, not the navigation link. Intro context can be combined by the parent with this thread\'s five original-question crops.' });
      for (const [index, questionId] of set.ids.entries()) {
        const question = questions.get(questionId);
        const trigger = section.getByRole('button', { name: `${question.difficulty} Questions`, exact: true });
        if (await trigger.getAttribute('aria-expanded') !== 'true') await trigger.click();
        assert.equal(await trigger.getAttribute('aria-expanded'), 'true');
        const card = section.locator('div.border-b.py-4').filter({ has: page.getByText(questionId, { exact: true }) });
        await card.waitFor({ state: 'visible' });
        const questionParagraph = card.locator(':scope > p');
        assert.equal(normalize(await questionParagraph.innerText()), normalize(question.question), `Question changed on source site: ${questionId}`);
        const firstInGroup = role.questions[question.difficulty][0].id === questionId;
        const locators = [card.locator(':scope > div').first(), questionParagraph];
        if (firstInGroup) locators.unshift(trigger);
        await capture({ id: `${set.threadId}-${String(index + 2).padStart(2, '0')}-${questionId}`, threadId: set.threadId, postNumber: index + 2, route, fileName: `${set.threadId}-${String(index + 2).padStart(2, '0')}-${questionId}.png`, locators, expectedText: question.question, detail: `Original ${questionId} badge, difficulty/category labels and complete question. ${firstInGroup ? 'The adjacent difficulty section title is included.' : 'The role heading is supplied separately; intervening questions/answers are not collapsed into a fabricated excerpt.'} The bank's Ideal Answer is outside the crop; the parent supplies the separately fact-checked answer card.` });
      }
    }

    await visit('/learn');
    await capture({ id: 'N09-01-library', threadId: 'N09', postNumber: 1, route: '/learn', fileName: 'N09-01-library.png', locators: [page.getByRole('heading', { name: 'Learn Web3', exact: true }), page.locator('main a[href="/web3-fundamentals"]')], expectedText: 'Web3 Fundamentals', detail: 'Actual Learn Web3 heading and the first course card, including its 15-lesson count. This is context for the five selected modules, not a claim that only this course exists. The parent can combine it with the five module crops.' });

    for (const lesson of lessons) {
      await visit(lesson.route);
      const endParagraph = page.locator('article .learn-content > p').filter({ hasText: lesson.end });
      await capture({ id: `N09-${String(lesson.postNumber).padStart(2, '0')}-${lesson.route.slice(1)}`, threadId: 'N09', postNumber: lesson.postNumber, route: lesson.route, fileName: `N09-${String(lesson.postNumber).padStart(2, '0')}-${lesson.route.slice(1)}.png`, locators: [page.getByRole('heading', { name: lesson.title, exact: true, level: 1 }), endParagraph], expectedText: lesson.title, detail: `Actual ${lesson.title} lesson title, read-time/difficulty metadata and contiguous opening section through the selected paragraph. The crop stops before unrelated diagrams or later examples.` });

      if (lesson.postNumber === 4) {
        await page.setViewportSize({ width: 1300, height: 1500 });
        await page.evaluate(() => document.fonts.ready);
        const code = page.locator('article pre > code').filter({ hasText: 'function test_Transfer()' });
        const content = await code.textContent();
        const match = content.match(/function test_Transfer\(\) public \{[\s\S]*?\n[ \t]*\}/);
        assert(match, 'Actual Foundry transfer example changed.');
        const start = content.lastIndexOf('\n', match.index) + 1;
        const end = match.index + match[0].length;
        await capture({ id: 'N09-04-transfer-code', threadId: 'N09', postNumber: 4, route: lesson.route, fileName: 'N09-04-transfer-code.png', locators: [code], codeRange: { start, end }, expectedText: match[0], detail: 'Supplementary actual code excerpt under The Same Test in Foundry. A DOM Range selects the unchanged test_Transfer function, including the 100 and 900 assertions. The code is not retyped or reconstructed, and this is not a test-result screenshot.' });
        await page.setViewportSize(viewport);
      }

      if (lesson.postNumber === 6) {
        const heading = page.getByRole('heading', { name: 'Trust and Guardrails', exact: true });
        const lastParagraph = page.locator('article .learn-content > p').filter({ hasText: 'Choose permissions per action.' });
        await capture({ id: 'N09-06-permissions', threadId: 'N09', postNumber: 6, route: lesson.route, fileName: 'N09-06-permissions.png', locators: [heading, lastParagraph], expectedText: 'Choose permissions per action.', detail: 'Supplementary actual Trust and Guardrails section, including its risk list, spending-cap example, contract allowlist, approval threshold and per-action permissions paragraph. The source\'s $100 example remains an example; it is not an observed agent balance or policy.' });
      }
    }
    await fs.writeFile(manifestPath, JSON.stringify(records, null, 2) + '\n');
  } finally {
    await browser.close();
  }
  await validate(records);
}
