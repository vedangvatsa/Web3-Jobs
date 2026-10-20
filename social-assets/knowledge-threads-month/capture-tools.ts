import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, type Locator, type Page } from 'playwright';
import sharp from 'sharp';
import { quizData, getResult } from '../../src/lib/quiz';

type JsonValue = string | number | boolean | null | JsonValue[] | JsonObject;
interface JsonObject { [key: string]: JsonValue }
interface Scenario {
  id: string;
  route: '/salary-calculator' | '/web3-career-quiz' | '/resume-builder' | '/invoice-generator';
  inputs: {
    fields?: JsonObject;
    uiLabels?: Record<string, string>;
    answers?: Record<string, 'a' | 'b'>;
    beforeFields?: JsonObject;
    steps?: string[];
  };
  expectedResult: JsonObject;
  sourceFiles: string[];
}
interface Rectangle { x: number; y: number; width: number; height: number }
interface CaptureRecord {
  id: string;
  scenarioId: string;
  file: string;
  route: string;
  sourceUrl: string;
  capturedAt: string;
  sourceRevision: string;
  visibleText: string;
  width: number;
  height: number;
  detail: string;
  inputs: Scenario['inputs'];
  expectedResult: JsonObject;
  provenance: string;
  localUrl: string;
  variant: string;
  cssWidth: number;
  cssHeight: number;
  viewport: { width: number; height: number };
  deviceScaleFactor: number;
  browserDefaultFontSize: number;
  minimumTextCssPx: number;
  maximumTextCssPx: number;
  bytes: number;
  sha256: string;
  sourceFileHashes: Record<string, string>;
  quality: {
    noObstruction: boolean;
    textWithinCrop: boolean;
    fullFormValuesVisible: boolean;
    minimumFontPass: boolean;
    aspectRatioPreserved: boolean;
    fields: { name: string; value: string; placeholder: string; fontSize: number; clipped: boolean }[];
  };
}
interface Manifest {
  schemaVersion: number;
  capturedAt: string;
  sourceRevision: string;
  provenance: string;
  origin: string;
  scenarioSource: string;
  scenarioSha256: string;
  scenarios: Scenario[];
  captures: CaptureRecord[];
  sourceFileHashes: Record<string, string>;
  quality: JsonObject;
}

const campaignRoot = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(campaignRoot, '../..');
const destination = path.join(campaignRoot, 'assets/revision/tools');
const manifestPath = path.join(campaignRoot, 'assets/revision/tool-captures.json');
const cachePath = path.join(repoRoot, '.cache/useful-threads-2026-10-20/tool-threads.json');
const origin = process.env.TOOL_CAPTURE_ORIGIN || 'http://127.0.0.1:3102';
assert(['127.0.0.1', 'localhost'].includes(new URL(origin).hostname), 'Capture the local application only');
const executablePath = process.env.TOOL_CAPTURE_BROWSER || '/Users/vedang/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const mode = process.argv.includes('--inspect') ? 'inspect' : process.argv.includes('--validate') ? 'validate' : 'capture';
const selected = process.argv.find(arg => arg.startsWith('--only='))?.slice(7).split(',');
const provenance = 'real application rendered locally from revision';
const fontSize = 20;
const deviceScaleFactor = 2;
const digest = (bytes: string | Buffer) => createHash('sha256').update(bytes).digest('hex');
const text = (object: JsonObject, key: string): string => {
  const value = object[key];
  assert.equal(typeof value, 'string', `${key} must be a string`);
  return value as string;
};
const number = (object: JsonObject, key: string): number => {
  const value = object[key];
  assert.equal(typeof value, 'number', `${key} must be a number`);
  return value as number;
};
const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();

async function loadScenarios(): Promise<{ scenarios: Scenario[]; source: string }> {
  const explicit = process.argv.find(arg => arg.startsWith('--scenarios='))?.slice(12);
  if (explicit) {
    const data = JSON.parse(await fs.readFile(path.resolve(repoRoot, explicit), 'utf8')) as { toolScenarios?: Scenario[]; scenarios?: Scenario[] };
    return { scenarios: data.toolScenarios || data.scenarios || [], source: explicit };
  }
  try {
    const data = JSON.parse(await fs.readFile(cachePath, 'utf8')) as { toolScenarios: Scenario[] };
    return { scenarios: data.toolScenarios, source: path.relative(repoRoot, cachePath) };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    const data = JSON.parse(await fs.readFile(manifestPath, 'utf8')) as Manifest;
    return { scenarios: data.scenarios, source: path.relative(repoRoot, manifestPath) };
  }
}

async function sourceHashes(scenarios: Scenario[]) {
  const paths = new Set(scenarios.flatMap(scenario => scenario.sourceFiles));
  for (const file of ['src/app/globals.css', 'src/components/page-shell.tsx', 'src/components/ui/card.tsx', 'src/components/ui/input.tsx', 'src/components/ui/textarea.tsx', 'src/components/ui/calendar.tsx', 'src/components/telegram-popup.tsx']) paths.add(file);
  return Object.fromEntries(await Promise.all([...paths].sort().map(async file => [file, digest(await fs.readFile(path.join(repoRoot, file)))])));
}

async function protectedHashes() {
  const names = (await fs.readdir(path.join(campaignRoot, 'images'))).filter(name => /^(C01|E01|N01)-0[1-6]\.jpg$/.test(name));
  assert.equal(names.length, 18);
  return Object.fromEntries(await Promise.all(names.sort().map(async name => [name, digest(await fs.readFile(path.join(campaignRoot, 'images', name)))])));
}

async function fillNamed(page: Page, values: JsonObject, prefix = ''): Promise<void> {
  for (const [key, value] of Object.entries(values)) {
    const name = prefix ? `${prefix}.${key}` : key;
    if (Array.isArray(value)) {
      for (const [index, item] of value.entries()) {
        assert(item && typeof item === 'object' && !Array.isArray(item));
        await fillNamed(page, item, `${name}.${index}`);
      }
    } else if (typeof value === 'string' || typeof value === 'number') {
      const field = page.locator(`[name="${name}"]`);
      await field.fill(String(value));
      await field.press('Home');
    }
  }
}

async function chooseCalendar(page: Page, label: string, date: string) {
  const target = new Date(`${date}T12:00:00`);
  const month = target.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  await page.getByText(label, { exact: true }).first().locator('..').getByRole('button').click();
  const dialog = page.getByRole('dialog');
  for (let attempt = 0; attempt < 60; attempt++) {
    if (await dialog.getByText(month, { exact: true }).isVisible()) break;
    const currentLabel = await dialog.getByRole('grid').getAttribute('aria-labelledby');
    assert(currentLabel);
    const currentMonth = await page.locator(`[id="${currentLabel}"]`).innerText();
    const current = new Date(`1 ${currentMonth}`);
    assert(!Number.isNaN(current.getTime()), currentMonth);
    await dialog.getByRole('button', { name: target < current ? 'Go to previous month' : 'Go to next month' }).click();
  }
  await dialog.getByRole('grid', { name: month, exact: true }).locator('button:not(.day-outside)').filter({ hasText: new RegExp(`^${target.getDate()}$`) }).click();
  await page.keyboard.press('Escape');
  await dialog.waitFor({ state: 'hidden' });
}

function nearestCard(locator: Locator) {
  return locator.locator('xpath=ancestor::div[contains(concat(" ", normalize-space(@class), " "), " rounded-lg ") and contains(concat(" ", normalize-space(@class), " "), " border ")][1]');
}

async function expandTextarea(page: Page, field: Locator) {
  await field.scrollIntoViewIfNeeded();
  const desired = await field.evaluate(element => {
    const input = element as HTMLTextAreaElement;
    return Math.max(0, input.scrollHeight - input.clientHeight + 12);
  });
  if (desired < 13) return;
  const box = await field.boundingBox();
  assert(box);
  await page.mouse.move(box.x + box.width - 4, box.y + box.height - 4);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width - 4, box.y + box.height - 4 + desired, { steps: 12 });
  await page.mouse.up();
  assert(await field.evaluate(element => element.scrollHeight <= element.clientHeight + 2), 'Native textarea resize must reveal its entire value');
}

async function settle(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  await page.keyboard.press('Escape');
  await page.mouse.move(1, 1);
  await page.evaluate(async () => {
    await Promise.all(document.getAnimations().filter(animation => animation.effect?.getTiming().iterations !== Infinity).map(animation => animation.finished.catch(() => undefined)));
  });
}

async function unionBox(locators: Locator[]): Promise<Rectangle> {
  const boxes = await Promise.all(locators.map(locator => locator.boundingBox()));
  assert(boxes.every((box): box is Rectangle => box !== null));
  const x = Math.floor(Math.min(...boxes.map(box => box.x)));
  const y = Math.floor(Math.min(...boxes.map(box => box.y)));
  const right = Math.ceil(Math.max(...boxes.map(box => box.x + box.width)));
  const bottom = Math.ceil(Math.max(...boxes.map(box => box.y + box.height)));
  return { x, y, width: right - x, height: bottom - y };
}

async function moveBelowHeader(page: Page, locators: Locator[]) {
  let box = await unionBox(locators);
  const viewport = page.viewportSize();
  assert(viewport);
  if (box.height + 220 > viewport.height) await page.setViewportSize({ width: viewport.width, height: Math.ceil(box.height + 260) });
  for (let attempt = 0; attempt < 4; attempt++) {
    box = await unionBox(locators);
    await page.evaluate(y => window.scrollBy(0, y - 130), box.y);
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  }
}

async function inspectCrop(page: Page, locators: Locator[], crop: Rectangle) {
  const nodeData = await Promise.all(locators.map(locator => locator.evaluate(element => {
    const nodes = [element, ...element.querySelectorAll('*')].filter(node => node instanceof HTMLElement) as HTMLElement[];
    const textNodes: { text: string; fontSize: number; x: number; y: number; right: number; bottom: number }[] = [];
    const fields: { name: string; value: string; placeholder: string; fontSize: number; clipped: boolean }[] = [];
    const visibleStrings: string[] = [];
    for (const node of nodes) {
      const style = getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      if (!rect.width || !rect.height || style.visibility === 'hidden' || style.display === 'none' || style.opacity === '0' || node.closest('[aria-hidden="true"]')) continue;
      if (node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement) {
        if (node.type === 'hidden') continue;
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (context) context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
        const contentWidth = node.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
        const clipped = node instanceof HTMLTextAreaElement ? node.scrollHeight > node.clientHeight + 2 : !!node.value && !!context && context.measureText(node.value).width > contentWidth + 2;
        fields.push({ name: node.name || node.getAttribute('role') || node.type, value: node.value, placeholder: node.placeholder, fontSize: parseFloat(style.fontSize), clipped });
      }
      const directStrings: string[] = [];
      for (const child of node.childNodes) {
        if (child.nodeType !== Node.TEXT_NODE || !child.textContent?.trim()) continue;
        const range = document.createRange();
        range.selectNodeContents(child);
        const lines = [...range.getClientRects()].filter(line => line.width && line.height);
        if (lines.length) directStrings.push(child.textContent);
        for (const line of lines) {
          if (line.width && line.height) textNodes.push({ text: child.textContent.trim(), fontSize: parseFloat(style.fontSize), x: line.x, y: line.y, right: line.right, bottom: line.bottom });
        }
      }
      if (directStrings.length) visibleStrings.push(directStrings.join('').trim());
    }
    return { textNodes, fields, visibleStrings };
  })));
  const textNodes = nodeData.flatMap(item => item.textNodes);
  const fields = nodeData.flatMap(item => item.fields);
  const visibleText = nodeData.flatMap(item => item.visibleStrings).join('\n');
  const capturedText = [visibleText, ...fields.map(field => field.value || field.placeholder)].filter(Boolean).join('\n');
  const fontSizes = [...textNodes.map(node => node.fontSize), ...fields.map(field => field.fontSize)];
  assert(fontSizes.length, 'Crop has visible text');
  const clippedText = textNodes.filter(node => node.x < crop.x - 2 || node.right > crop.x + crop.width + 2 || node.y < crop.y - 2 || node.bottom > crop.y + crop.height + 2);
  const obstruction = await page.evaluate(rect => {
    const selectors = 'header, nav, [role="dialog"], [data-radix-popper-content-wrapper]';
    return [...document.querySelectorAll(selectors)].filter(element => {
      const style = getComputedStyle(element);
      const box = element.getBoundingClientRect();
      const overlay = style.position === 'fixed' || style.position === 'sticky' || element.getAttribute('role') === 'dialog';
      return overlay && box.width > 0 && box.height > 0 && style.visibility !== 'hidden' && box.x < rect.x + rect.width && box.right > rect.x && box.y < rect.y + rect.height && box.bottom > rect.y;
    }).map(element => element.outerHTML.slice(0, 180));
  }, crop);
  return { capturedText, minimum: Math.min(...fontSizes), maximum: Math.max(...fontSizes), clippedText, fields, obstruction };
}

async function main() {
  if (mode === 'validate') return validate();
  const { scenarios, source } = await loadScenarios();
  assert.equal(scenarios.length, 24);
  assert.equal(new Set(scenarios.map(item => item.id)).size, 24);
  const scenarioSha256 = digest(JSON.stringify(scenarios));
  const sourceRevision = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repoRoot, encoding: 'utf8' }).trim();
  const hashes = await sourceHashes(scenarios);
  const protectedBefore = await protectedHashes();
  let prior: Manifest | undefined;
  try { prior = JSON.parse(await fs.readFile(manifestPath, 'utf8')) as Manifest; } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
  if (mode === 'capture') await fs.mkdir(destination, { recursive: true });
  const records = selected ? (prior?.captures || []).filter(record => !selected.includes(record.scenarioId)) : [];
  const browser = await chromium.launch({ headless: true, executablePath, args: [`--blink-settings=defaultFontSize=${fontSize},defaultFixedFontSize=${fontSize}`] });
  const context = await browser.newContext({ viewport: { width: 430, height: 1400 }, deviceScaleFactor, colorScheme: 'light', reducedMotion: 'reduce', locale: 'en-US', timezoneId: 'UTC' });
  const page = await context.newPage();
  const pageErrors: string[] = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  async function save(scenario: Scenario, suffix: string, locators: Locator[], detail: string, variant = 'after', required: string[] = []) {
    await settle(page);
    await moveBelowHeader(page, locators);
    const box = await unionBox(locators);
    const checks = await inspectCrop(page, locators, box);
    for (const value of required) assert(normalize(checks.capturedText).includes(normalize(value)), `${scenario.id}/${suffix} missing ${value}`);
    if (mode === 'inspect') {
      console.log(JSON.stringify({ id: `${scenario.id}-${suffix}`, box, minimumTextCssPx: checks.minimum, fields: checks.fields, clippedText: checks.clippedText, obstruction: checks.obstruction, visibleText: checks.capturedText }, null, 2));
      return;
    }
    assert(checks.minimum >= 14, `${scenario.id}/${suffix} minimum text is ${checks.minimum}px`);
    assert.equal(checks.clippedText.length, 0, `${scenario.id}/${suffix} cropped text: ${JSON.stringify(checks.clippedText)}`);
    assert(checks.fields.every(field => !field.clipped), `${scenario.id}/${suffix} clipped control value: ${JSON.stringify(checks.fields)}`);
    assert.equal(checks.obstruction.length, 0, `${scenario.id}/${suffix} obstruction`);
    const raw = await page.screenshot({ clip: box, type: 'png', animations: 'disabled', caret: 'hide' });
    const image = await sharp(raw).png({ compressionLevel: 9, adaptiveFiltering: true }).toBuffer();
    assert(image.byteLength <= 2_000_000, `${scenario.id}/${suffix} exceeds 2 MB`);
    const dimensions = await sharp(image).metadata();
    assert(dimensions.width && dimensions.height);
    const id = `${scenario.id}-${suffix}`;
    const file = `assets/revision/tools/${id}.png`;
    await fs.writeFile(path.join(campaignRoot, file), image);
    const inputs = structuredClone(scenario.inputs);
    const expectedResult = structuredClone(scenario.expectedResult);
    if (variant === 'before') {
      assert(inputs.fields && inputs.beforeFields);
      const contributions = inputs.fields.contributions as JsonObject[];
      contributions[0].description = inputs.beforeFields['contributions.0.description'];
      expectedResult.capturedDescription = inputs.beforeFields['contributions.0.description'];
    }
    if (variant === 'question-3') {
      inputs.answers = Object.fromEntries(Object.entries(inputs.answers || {}).filter(([id]) => Number(id) < 3));
      expectedResult.capturedQuestion = 3;
      expectedResult.finalResultNotYetVisible = true;
    }
    records.push({ id, scenarioId: scenario.id, file, route: scenario.route, sourceUrl: `https://hashtagweb3.com${scenario.route}`, capturedAt: new Date().toISOString(), sourceRevision, visibleText: checks.capturedText, width: dimensions.width, height: dimensions.height, detail, inputs, expectedResult, provenance, localUrl: `${origin}${scenario.route}`, variant, cssWidth: box.width, cssHeight: box.height, viewport: page.viewportSize()!, deviceScaleFactor, browserDefaultFontSize: fontSize, minimumTextCssPx: checks.minimum, maximumTextCssPx: checks.maximum, bytes: image.byteLength, sha256: digest(image), sourceFileHashes: hashes, quality: { noObstruction: true, textWithinCrop: true, fullFormValuesVisible: true, minimumFontPass: true, aspectRatioPreserved: Math.abs(dimensions.width / dimensions.height - box.width / box.height) < 0.002, fields: checks.fields } });
    console.log(`Captured ${id}: ${dimensions.width}x${dimensions.height}, ${image.byteLength} bytes, min ${checks.minimum}px`);
  }

  try {
    await page.goto(`${origin}/web3-career-quiz`, { waitUntil: 'networkidle' });
    await page.getByRole('dialog', { name: 'Discover more from Hashtag Web3' }).getByRole('button', { name: 'Close', exact: true }).click({ timeout: 15000 });
    assert.equal(await page.locator('html').evaluate(element => getComputedStyle(element).fontSize), `${fontSize}px`, 'Browser font preference applies without a stylesheet override');
    for (const scenario of scenarios.filter(item => !selected || selected.includes(item.id))) {
      const viewportWidth = scenario.route === '/invoice-generator' ? 620 : scenario.id.startsWith('RESUME-') && scenario.id !== 'RESUME-junior' ? 480 : 430;
      await page.setViewportSize({ width: viewportWidth, height: 1500 });
      await page.goto(`${origin}${scenario.route}`, { waitUntil: 'networkidle' });
      if (scenario.route === '/salary-calculator') {
        assert(scenario.inputs.fields && scenario.inputs.uiLabels);
        for (const [index, key] of ['role', 'location', 'companyType', 'companySize'].entries()) {
          const select = page.getByRole('combobox').nth(index);
          if ((await select.innerText()).trim() !== scenario.inputs.uiLabels[key]) {
            await select.click();
            await page.getByRole('option', { name: scenario.inputs.uiLabels[key], exact: true }).click();
          }
        }
        const slider = page.getByRole('slider');
        await slider.focus();
        await slider.press('Home');
        for (let year = 0; year < number(scenario.inputs.fields, 'experience'); year++) await slider.press('ArrowRight');
        const result = nearestCard(page.getByRole('heading', { name: 'Your Estimated Salary', exact: true }));
        await result.getByText(text(scenario.expectedResult, 'display'), { exact: true }).waitFor();
        await save(scenario, 'result', [result], 'Complete genuine annual-USD result card, including the estimate disclaimer and token/equity caveat. Pair with the controls capture for the same scenario.', 'after', [text(scenario.expectedResult, 'display'), 'per year (USD)', 'Token incentives and equity can significantly impact total compensation.']);
        const controls = nearestCard(page.getByRole('heading', { name: 'Role Details', exact: true }));
        await save(scenario, 'controls', [controls], 'The five actual calculator controls at the verified scenario values. Captured separately from the result to keep labels and assumptions readable.', 'after', [scenario.inputs.uiLabels.role, `Years of Experience: ${scenario.inputs.fields.experience} years`, 'North America', 'Series A/B Startup', '11-50 Employees']);
      } else if (scenario.route === '/web3-career-quiz') {
        assert(scenario.inputs.answers);
        for (const question of quizData) {
          await page.getByText(question.question, { exact: true }).waitFor();
          if (scenario.id === 'QUIZ-analyst' && question.id === 3) {
            await save(scenario, 'question-03', [nearestCard(page.getByRole('heading', { name: 'Archetype Assessment', exact: true }))], 'Genuine third question before answering it. Only Q1 and Q2 have been answered. No point totals are inserted.', 'question-3', [question.question, question.options.b]);
          }
          const answer = scenario.inputs.answers[question.id];
          await page.getByRole('button', { name: new RegExp(`^${answer.toUpperCase()}\\)`) }).click();
        }
        const calculated = getResult(scenario.inputs.answers);
        assert.equal(calculated.archetype, text(scenario.expectedResult, 'archetype'));
        const card = nearestCard(page.getByRole('heading', { name: calculated.archetype, exact: true }));
        const header = card.locator(':scope > div').nth(0);
        const content = card.locator(':scope > div').nth(1);
        const required = [calculated.archetype, ...calculated.traits, ...calculated.roles.map(role => role.title)];
        await save(scenario, 'result', [header, content], 'Genuine result header and content: archetype, description, all four traits and all three role cards. Promotional footer excluded by crop; no score chart exists in this UI.', 'after', required);
        await save(scenario, 'archetype', [header], 'Genuine result header only. Pair with a role-card or traits crop from the same scenario to preserve mobile legibility instead of shrinking the complete result.', 'after', [calculated.archetype]);
        const traits = content.getByRole('heading', { name: 'Key Traits:', exact: true }).locator('..');
        await save(scenario, 'traits', [traits], 'All four traits exactly as rendered by this quiz result. Pair with the same scenario archetype header; these are quiz descriptions, not a validated personality assessment.', 'after', calculated.traits);
        const roles = content.getByRole('heading', { name: 'Your Recommended Web3 Career Paths:', exact: true }).locator('..');
        await save(scenario, 'roles', [roles], 'Focused genuine recommended-career-paths region, preserving all three role descriptions at readable size. Pair with the same scenario result for archetype identity.', 'after', calculated.roles.map(role => role.title));
        for (const [index, role] of calculated.roles.entries()) {
          const roleCard = nearestCard(content.getByRole('heading', { name: role.title, exact: true }));
          await save(scenario, `role-${String(index + 1).padStart(2, '0')}`, [roleCard], `Genuine ${role.title} recommendation and description only. Pair with ${scenario.id}-archetype; this focused crop is intended for the individual-role posts.`, 'after', [role.title, role.description]);
        }
      } else if (scenario.route === '/resume-builder') {
        assert(scenario.inputs.fields);
        const fields = scenario.inputs.fields;
        const contributions = fields.contributions as JsonObject[];
        await page.locator('[name="experience.0.company"]').locator('..').getByRole('button').click();
        await page.locator('[name="education.0.institution"]').locator('..').getByRole('button').click();
        await fillNamed(page, fields);
        const preview = page.locator('div.bg-white').filter({ has: page.getByRole('heading', { name: text(fields, 'name'), exact: true }) });
        const project = preview.getByRole('heading', { name: 'Key Projects & Portfolio', exact: true }).locator('..');
        const summary = preview.getByRole('heading', { name: 'Summary', exact: true }).locator('..');
        const projectFields = nearestCard(page.getByRole('heading', { name: 'Key Projects & Portfolio', exact: true }).first());
        await expandTextarea(page, page.locator('[name="contributions.0.description"]'));
        assert.equal(await page.locator('[name^="experience."]').count(), 0);
        assert.equal(await page.locator('[name^="education."]').count(), 0);
        await save(scenario, 'preview', [preview], 'Finished genuine resume preview. All identity and portfolio wording is explicitly fictional practice content; employment and education entries were removed through their actual controls.', 'after', [text(fields, 'name'), 'Practice resume example:', text(contributions[0], 'description')]);
        await save(scenario, 'summary', [preview.locator(':scope > div').first(), summary], 'Genuine identity and summary regions in their original contiguous layout, with the sample name and Practice resume example label visible.', 'after', [text(fields, 'name'), text(fields, 'summary')]);
        await save(scenario, 'project-after', [project], 'Focused project entry in the genuine after-state preview, retaining Personal practice project and Example wording labels.', 'after', [text(contributions[0], 'project'), text(contributions[0], 'description')]);
        await save(scenario, 'fields-after', [projectFields], 'Actual project-name, role, description and empty-link controls. The description textarea was expanded using its native resize handle to reveal the complete entered wording.', 'after', [text(contributions[0], 'project'), text(contributions[0], 'description')]);
        if (scenario.id === 'RESUME-junior') {
          const skills = preview.getByRole('heading', { name: 'Skills', exact: true }).locator('..');
          await save(scenario, 'skills', [skills], 'Genuine sample resume skills section, with both Technical Skills and General Skills visible.', 'after', ['Solidity, Foundry', 'Git, README writing']);
        }
        if (scenario.inputs.beforeFields) {
          await fillNamed(page, scenario.inputs.beforeFields);
          await save(scenario, 'project-before', [project], 'Genuine before-state project preview, created by editing the real Description field. Only the description differs from the after-state capture.', 'before', [text(scenario.expectedResult, 'beforeDescription')]);
          await save(scenario, 'fields-before', [projectFields], 'Actual project controls with the clearly labeled before-example description; identical names, role and empty link to the corresponding after-state.', 'before', [text(scenario.expectedResult, 'beforeDescription')]);
        }
      } else {
        assert(scenario.inputs.fields);
        const { logo, issueDate, dueDate, currency, customCurrency, ...fields } = scenario.inputs.fields;
        await page.locator('[name="walletAddress"]').fill('');
        await page.getByRole('button', { name: 'Add Item', exact: true }).click();
        await fillNamed(page, fields);
        assert.equal(currency, 'USD');
        await chooseCalendar(page, 'Issue Date', String(issueDate));
        await chooseCalendar(page, 'Due Date', String(dueDate));
        await expandTextarea(page, page.locator('[name="notes"]'));
        const preview = page.locator('div.lg\\:col-span-2 > div > div.rounded-lg').first();
        await preview.getByText(text(scenario.expectedResult, 'displayTotal'), { exact: true }).waitFor();
        const required = ['Sample Freelancer', 'Sample Client', '#SAMPLE-016', 'November 16, 2026', 'November 30, 2026', '$600.00', '$200.00', '$800.00', '-$50.00', '$750.00', text(fields, 'paymentMethod'), text(fields, 'notes')];
        assert.equal(await page.locator('[name="walletAddress"]').inputValue(), '');
        assert(!/0x[a-fA-F0-9]{40}/.test(await preview.innerText()));
        await save(scenario, 'preview', [preview], 'Complete genuine fictional invoice preview, including both line items, subtotal, flat discount, final total, dates and full sample-only USDC/Ethereum notes. No recipient wallet is present.', 'after', required);
        const header = preview.locator(':scope > div').nth(0);
        const parties = preview.locator(':scope > div').nth(1);
        const dates = preview.locator(':scope > div').nth(2);
        await save(scenario, 'header-dates', [header, parties, dates], 'Contiguous genuine invoice header, fictional parties and exact issue/due dates. Use with the full preview or sample-labeled master.', 'after', ['Sample Freelancer', 'Sample Client', '#SAMPLE-016', 'November 16, 2026', 'November 30, 2026']);
        const table = preview.locator('table');
        const totals = table.locator('xpath=following-sibling::div[1]');
        await save(scenario, 'items-totals', [table, totals], 'Genuine two-line-item table and complete totals block. Sample input values are USD; the zero tax row is naturally absent from the preview.', 'after', ['$600.00', '$200.00', '$800.00', '-$50.00', '$750.00']);
        const paymentPreview = preview.getByRole('heading', { name: 'Payment Method:', exact: true }).locator('../..');
        await save(scenario, 'payment-preview', [paymentPreview], 'Genuine rendered payment method and notes, including the explicit sample settlement assumption, Not payable statement and intentionally blank wallet explanation.', 'after', [text(fields, 'paymentMethod'), text(fields, 'notes')]);
        const paymentFields = nearestCard(page.getByRole('heading', { name: 'Payment', exact: true }));
        await save(scenario, 'payment-fields', [paymentFields], 'Actual USD currency selector, typed USDC/Ethereum payment method, empty wallet and full notes textarea. The textarea is resized through its native handle; there is no network selector or currency conversion.', 'after', ['USD ($)', text(fields, 'paymentMethod'), text(fields, 'notes')]);
        const itemFields = nearestCard(page.getByRole('heading', { name: 'Items', exact: true }));
        await save(scenario, 'item-fields', [itemFields], 'Actual two item rows with quantity and rate inputs, zero-percent tax and flat USD 50 discount controls. Pair with the genuine totals crop.', 'after', ['Documentation draft (hours)', 'Revision and handoff (hours)', '$800.00', '$750.00']);
      }
    }
    assert.deepEqual(pageErrors, []);
    assert.deepEqual(await protectedHashes(), protectedBefore, 'Protected C01/E01/N01 image bytes');
    assert.deepEqual(await sourceHashes(scenarios), hashes, 'Captured application source did not change during the run');
    if (mode === 'capture') {
      records.sort((a, b) => a.id.localeCompare(b.id));
      const manifest: Manifest = { schemaVersion: 1, capturedAt: new Date().toISOString(), sourceRevision, provenance, origin, scenarioSource: source, scenarioSha256, scenarios, captures: records, sourceFileHashes: hashes, quality: { scenarioCount: new Set(records.map(record => record.scenarioId)).size, screenshotCount: records.length, allScenariosCovered: scenarios.every(scenario => records.some(record => record.scenarioId === scenario.id)), maximumBytes: Math.max(...records.map(record => record.bytes)), totalBytes: records.reduce((sum, record) => sum + record.bytes, 0), minimumTextCssPx: Math.min(...records.map(record => record.minimumTextCssPx)), maximumCssWidth: Math.max(...records.map(record => record.cssWidth)), deviceScaleFactor, browserDefaultFontSize: fontSize, browserPreference: `--blink-settings=defaultFontSize=${fontSize},defaultFixedFontSize=${fontSize}`, textOrMarkupReplaced: false, stylesheetInjected: false, textareaAdjustment: 'Native mouse drag on the existing resize handle only', protectedImageHashes: protectedBefore, protectedImageCount: 18, protectedImagesUnchanged: true, pageErrors, notes: ['Images are unscaled genuine browser crops; PNG compression is lossless.', 'sourceUrl identifies the canonical tool. localUrl and provenance identify the actual capture origin.', 'The browser default font is 20px for legibility; computed text within every crop is checked to be at least 14px.', 'Use narrow detail crops at their intended aspect ratio. Do not squeeze a tall complete preview into a short social card.', 'Scenarios are embedded here so capture-tools.ts remains reproducible if the ignored research file is unavailable.'] } };
      await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
      console.log(JSON.stringify(manifest.quality, null, 2));
    }
  } finally {
    await browser.close();
  }
}

async function validate() {
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8')) as Manifest;
  assert.equal(manifest.scenarios.length, 24);
  assert.equal(new Set(manifest.captures.map(item => item.scenarioId)).size, 24);
  assert.equal(new Set(manifest.captures.map(item => item.id)).size, manifest.captures.length);
  assert.equal(digest(JSON.stringify(manifest.scenarios)), manifest.scenarioSha256);
  assert.equal(manifest.provenance, provenance);
  for (const item of manifest.captures) {
    assert(item.file.startsWith('assets/revision/tools/') && !item.file.includes('..'));
    const bytes = await fs.readFile(path.join(campaignRoot, item.file));
    const metadata = await sharp(bytes).metadata();
    assert.equal(metadata.format, 'png');
    assert.equal(metadata.width, item.width);
    assert.equal(metadata.height, item.height);
    assert.equal(bytes.byteLength, item.bytes);
    assert.equal(digest(bytes), item.sha256);
    assert(item.bytes <= 2_000_000);
    assert(item.minimumTextCssPx >= 14);
    assert(item.cssWidth <= 620);
    assert.equal(item.sourceRevision, manifest.sourceRevision);
    assert.equal(item.sourceUrl, `https://hashtagweb3.com${item.route}`);
    assert.equal(item.localUrl, `${manifest.origin}${item.route}`);
    assert(item.quality.noObstruction && item.quality.textWithinCrop && item.quality.fullFormValuesVisible && item.quality.aspectRatioPreserved);
    if (item.id.endsWith('-result') && item.route === '/salary-calculator') {
      assert(item.visibleText.includes(text(item.expectedResult, 'display')));
      assert(item.visibleText.includes('Token incentives and equity can significantly impact total compensation.'));
    }
  }
  const expectedFiles = manifest.captures.map(item => path.basename(item.file)).sort();
  const actualFiles = (await fs.readdir(destination)).filter(file => file.endsWith('.png')).sort();
  assert.deepEqual(actualFiles, expectedFiles);
  assert.deepEqual(await protectedHashes(), manifest.quality.protectedImageHashes);
  console.log(JSON.stringify({ status: 'PASS', scenarios: 24, screenshots: manifest.captures.length, maximumBytes: Math.max(...manifest.captures.map(item => item.bytes)), minimumTextCssPx: Math.min(...manifest.captures.map(item => item.minimumTextCssPx)), maximumCssWidth: Math.max(...manifest.captures.map(item => item.cssWidth)), protectedImages: 18 }, null, 2));
}

main().catch(error => { console.error(error); process.exitCode = 1; });
