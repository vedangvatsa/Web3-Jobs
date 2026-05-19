#!/usr/bin/env node
import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto('https://www.meetup.com/find/?keywords=tech&location=Singapore&source=EVENTS&eventType=inPerson', { waitUntil: 'load', timeout: 15000 });
await page.waitForTimeout(5000);

const html = await page.content();
console.log('Page length:', html.length);
console.log('Has __NEXT_DATA__:', html.includes('__NEXT_DATA__'));
console.log('Event link count:', (html.match(/\/events\/\d+/g) || []).length);
console.log('Has captcha:', html.toLowerCase().includes('captcha'));
console.log('Title:', await page.title());

const text = await page.evaluate(() => document.body.innerText.substring(0, 2000));
console.log('\nVisible text (first 1500 chars):');
console.log(text.substring(0, 1500));

await browser.close();
