import assert from 'node:assert/strict';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium, expect } from '@playwright/test';
import { citizenshipPrograms, citizenshipPath } from '../src/lib/citizenship';

const origin = 'http://127.0.0.1:3196';
const humanHeaders = { 'User-Agent': 'Mozilla/5.0', 'Sec-Fetch-Mode': 'navigate', 'Sec-Fetch-Dest': 'document' };

async function main() {
  const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-H', '127.0.0.1', '-p', '3196'], { stdio: ['ignore', 'pipe', 'pipe'] });
  let logs = '';
  server.stdout.on('data', chunk => logs += chunk);
  server.stderr.on('data', chunk => logs += chunk);
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || path.resolve('.cache/nomads/browsers/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell') });
  try {
    let ready = false;
    for (let attempt = 0; attempt < 60; attempt++) {
      assert.equal(server.exitCode, null, logs);
      if (logs.includes('Ready in')) { ready = true; break; }
      await delay(300);
    }
    assert.ok(ready, logs);
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    await page.addInitScript('window.__name = (value) => value');
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error' && /hydration|react error|uncaught/i.test(message.text())) errors.push(message.text()); });
    const failedLocalRequests: string[] = [];
    page.on('response', response => { if (response.url().startsWith(origin) && response.status() >= 400) failedLocalRequests.push(`${response.status()} ${response.url()}`); });
    await page.goto(`${origin}/citizenship`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Citizenship by investment');
    await expect(page.getByRole('article')).toHaveCount(3);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://hashtagweb3.com/citizenship');
    await page.getByRole('searchbox', { name: 'Search citizenship programs' }).fill('Turkey');
    await expect(page.getByRole('article')).toHaveCount(1);
    await expect(page.getByRole('article')).toHaveAttribute('aria-label', 'Türkiye');
    await page.getByRole('button', { name: 'Clear filters', exact: true }).click();
    await page.getByRole('combobox', { name: 'Investment route' }).selectOption('Property');
    await expect(page.getByRole('article')).toHaveCount(2);
    await page.getByRole('combobox', { name: 'Region', exact: true }).selectOption('Caribbean');
    await expect(page.getByRole('article')).toHaveCount(1);
    await expect(page.getByRole('article').getByRole('term')).toHaveText('Approved real estate');
    await expect(page.getByRole('article').getByRole('link', { name: 'Official program', exact: true })).toHaveAttribute('href', 'https://www.cbiu.gov.dm/investment-options/real-estate/');
    await page.getByRole('searchbox').fill('not-listed');
    await expect(page.getByText('No citizenship programs match these filters.')).toBeVisible();
    await page.getByRole('button', { name: 'Clear filters', exact: true }).first().click();
    await page.getByRole('combobox', { name: 'Sort programs' }).selectOption('amount');
    await expect(page.getByRole('article').first()).toHaveAttribute('aria-label', 'Dominica');
    await page.getByRole('checkbox', { name: 'Compare Dominica', exact: true }).focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    assert.notEqual(await page.getByRole('checkbox', { name: 'Compare Dominica', exact: true }).evaluate(element => getComputedStyle(element).boxShadow), 'none');
    await page.keyboard.press('Space');
    await expect(page.getByRole('checkbox', { name: 'Compare Dominica', exact: true })).toBeChecked();
    await page.getByRole('checkbox', { name: 'Compare Türkiye', exact: true }).check();
    await page.getByRole('checkbox', { name: 'Compare Antigua and Barbuda', exact: true }).check();
    await expect(page.getByRole('region', { name: 'Citizenship program comparison' })).toBeVisible();
    await expect(page.getByRole('table').getByText('Not verified in reviewed sources').first()).toBeVisible();
    await page.reload();
    await expect(page.getByRole('checkbox', { checked: true })).toHaveCount(3);
    await page.getByRole('searchbox').fill('Turkey');
    await expect(page.getByRole('article')).toHaveCount(1);
    await expect(page.getByRole('table').getByRole('columnheader')).toHaveCount(4);
    await page.getByRole('button', { name: 'Remove Dominica', exact: true }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('table').getByRole('columnheader')).toHaveCount(3);
    await page.getByRole('button', { name: 'Clear comparison' }).click();
    await expect(page.getByRole('table')).toHaveCount(0);
    await page.goto(`${origin}/citizenship?compare=dominica,dominica,unknown,turkiye,antigua-and-barbuda`);
    await expect(page.getByRole('checkbox', { checked: true })).toHaveCount(3);

    const checks: Array<{ width: number; theme: string; contrast: number }> = [];
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      for (const theme of ['light', 'dark']) {
        await page.evaluate(value => document.documentElement.classList.toggle('dark', value === 'dark'), theme);
        await page.waitForTimeout(250);
        await expect(page.getByRole('region', { name: 'Citizenship program comparison' })).toBeVisible();
        const metrics = await page.evaluate(() => {
          const background = getComputedStyle(document.body).backgroundColor;
          const foreground = getComputedStyle(document.querySelector('main .text-muted-foreground')!).color;
          const luminance = (color: string) => {
            const channels = color.match(/[\d.]+/g)!.slice(0, 3).map(Number).map(value => { const normalized = value / 255; return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4; });
            return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
          };
          const values = [luminance(background), luminance(foreground)].sort((a, b) => b - a);
          const cell = document.querySelector('main td')!;
          const cellValues = [luminance(getComputedStyle(cell).color), luminance(getComputedStyle(cell.closest('[role="region"]')!).backgroundColor)].sort((a, b) => b - a);
          return { overflow: document.documentElement.scrollWidth > innerWidth, contrast: (values[0] + 0.05) / (values[1] + 0.05), cellContrast: (cellValues[0] + 0.05) / (cellValues[1] + 0.05) };
        });
        assert.equal(metrics.overflow, false, `${width}px ${theme} page overflow`);
        assert.ok(metrics.contrast >= 4.5, `${width}px ${theme} muted-text contrast ${metrics.contrast}`);
        assert.ok(metrics.cellContrast >= 4.5, `${width}px ${theme} table-text contrast ${metrics.cellContrast}`);
        checks.push({ width, theme, contrast: Number(metrics.contrast.toFixed(2)) });
        if (width === 320) {
          const region = page.getByRole('region', { name: 'Citizenship program comparison' });
          await expect(page.getByText('Scroll sideways to see all columns')).toBeVisible();
          await region.focus();
          await page.keyboard.press('ArrowRight');
          await expect.poll(() => region.evaluate(element => element.scrollLeft)).toBeGreaterThan(0);
        }
        if (process.env.CITIZENSHIP_SCREENSHOTS && [1440, 390].includes(width)) await page.screenshot({ path: path.join(process.env.CITIZENSHIP_SCREENSHOTS, `citizenship-${width}-${theme}.png`), fullPage: true });
      }
    }

    for (const program of citizenshipPrograms) {
      await page.goto(`${origin}${citizenshipPath(program.slug)}`);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(`${program.country}: citizenship by investment`);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://hashtagweb3.com${citizenshipPath(program.slug)}`);
      await expect(page.getByRole('link', { name: 'Official program', exact: true })).toHaveAttribute('href', program.officialUrl);
      for (const source of program.sources) await expect(page.getByRole('link', { name: source.title, exact: true })).toHaveAttribute('href', source.url);
      for (const width of [1440, 320]) {
        await page.setViewportSize({ width, height: 900 });
        for (const theme of ['light', 'dark']) {
          await page.evaluate(value => document.documentElement.classList.toggle('dark', value === 'dark'), theme);
          await page.waitForTimeout(250);
          assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${program.country} ${width}px ${theme} overflow`);
          if (process.env.CITIZENSHIP_SCREENSHOTS && program.slug === 'dominica') await page.screenshot({ path: path.join(process.env.CITIZENSHIP_SCREENSHOTS, `citizenship-detail-${width}-${theme}.png`), fullPage: true });
        }
      }
      await page.evaluate(() => document.documentElement.style.fontSize = '200%');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${program.country} enlarged text overflow`);
      await page.evaluate(() => document.documentElement.style.fontSize = '');
      await page.getByRole('link', { name: 'Source for this route' }).first().click();
      await expect(page).toHaveURL(new RegExp(`#source-${program.routes[0].source}$`));
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${program.country} mobile detail overflow`);
      await page.getByRole('link', { name: `${program.country} passport entry`, exact: true }).click();
      await expect(page.getByRole('combobox', { name: 'Your passport' })).toHaveValue(program.slug === 'turkiye' ? 'turkey' : program.slug);
      await page.getByRole('link', { name: 'Citizenship by investment', exact: true }).first().click();
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Citizenship by investment');
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(`${origin}/nomads`);
    await page.getByRole('main').getByRole('link', { name: 'Citizenship', exact: true }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Citizenship by investment');
    assert.equal((await fetch(`${origin}/citizenship/not-a-country`, { headers: humanHeaders })).status, 404);
    const data = await (await fetch(`${origin}/data/citizenship.json`)).json();
    assert.equal(data.programs.length, citizenshipPrograms.length);
    const sitemap = await (await fetch(`${origin}/sitemap.xml`)).text();
    for (const route of ['/citizenship', ...citizenshipPrograms.map(program => citizenshipPath(program.slug))]) {
      assert.ok(sitemap.includes(`https://hashtagweb3.com${route}</loc>`));
      const preview = await fetch(`${origin}${route}/tg`, { headers: { 'User-Agent': 'TelegramBot' } });
      assert.equal(preview.status, 200);
      assert.match(await preview.text(), /citizenship by investment/i);
    }
    assert.deepEqual(errors, [], 'Browser runtime/hydration errors');
    assert.deepEqual(failedLocalRequests, [], 'Failed local browser requests');
    console.log('Citizenship browser checks passed: filters, search, sorting, empty state, keyboard selection/removal, URL reload, malformed comparisons, responsive comparison scrolling, three detail pages, source anchors, passport links, Nomads discovery, canonical metadata, unknown-country 404, static catalog, sitemap and crawler previews.');
    console.table(checks);
  } finally {
    await browser.close();
    server.kill('SIGTERM');
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
