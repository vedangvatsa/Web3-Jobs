import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import * as cheerio from 'cheerio';
import { NextRequest } from 'next/server';
import { middleware } from '../src/middleware';
import { getCategories, getLesson, getLessons } from '../src/lib/learn';
import { learnRoutes, resolveLearnRoute, getCoursePath, getLessonPath, canonicalLearnLink } from '../src/lib/learn-routes';
import { renderLessonContent } from '../src/lib/learn-content';
import { classifySlug } from '../src/lib/slug-classifier';
import { loadReservedRootSlugsSync } from '../src/lib/reserved-root-slugs';
import { SOCIAL_PATH_SUFFIXES } from '../src/lib/social-share';
import { learnPageMetadata } from '../src/lib/learn-meta';

test('every course and lesson has a unique root URL without taking an existing content or job slug', () => {
  const occupied = new Set<string>(Object.values(JSON.parse(fs.readFileSync('content/slug-types.json', 'utf8')) as Record<string, string[]>).flat());
  const jobs = JSON.parse(fs.readFileSync('content/jobs-runtime.json', 'utf8')) as { slug: string }[];
  for (const job of jobs) occupied.add(job.slug);
  for (const slug of Object.keys(JSON.parse(fs.readFileSync('content/legacy-slugs-archive.json', 'utf8')))) occupied.add(slug);
  for (const entry of fs.readdirSync('src/app', { withFileTypes: true })) if (entry.isDirectory() && !entry.name.startsWith('[')) occupied.add(entry.name);
  for (const dir of ['content/articles', 'content/glossary', 'content/companies']) {
    for (const file of fs.readdirSync(dir)) if (file.endsWith('.md')) occupied.add(file.slice(0, -3));
  }
  const reserved = loadReservedRootSlugsSync();
  assert.equal(new Set(learnRoutes.map(route => route.slug)).size, learnRoutes.length);
  for (const route of learnRoutes) {
    assert.match(route.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(!occupied.has(route.slug), `Occupied learning slug: ${route.slug}`);
    assert.ok(!SOCIAL_PATH_SUFFIXES.has(route.slug));
    assert.ok(reserved.has(route.slug));
    assert.equal(classifySlug(route.slug), 'learn');
    assert.equal(learnPageMetadata(route).alternates?.canonical, `https://hashtagweb3.com/${route.slug}`);
  }
  const categories = getCategories();
  assert.equal(learnRoutes.length, categories.length + categories.reduce((sum, category) => sum + getLessons(category.slug).length, 0));
  for (const category of categories) {
    assert.equal(resolveLearnRoute(getCoursePath(category.slug).slice(1))?.category, category.slug);
    for (const lesson of getLessons(category.slug)) assert.equal(resolveLearnRoute(getLessonPath(category.slug, lesson.slug).slice(1))?.lesson, lesson.slug);
  }
});

test('legacy learning redirects preserve query parameters and distinguish lesson names from social suffixes', async () => {
  for (const [from, to] of [
    ['/learn/fundamentals/blockchains', '/blockchains'],
    ['/learn/fundamentals/blockchains/tg', '/blockchains/tg'],
    ['/learn/marketing/twitter', '/twitter-marketing'],
    ['/learn/marketing/discord', '/discord-community'],
    ['/learn/marketing/discord/tg', '/discord-community/tg'],
    ['/learn/careers', '/web3-careers'],
  ]) {
    const response = await middleware(new NextRequest(`https://hashtagweb3.com${from}?utm_source=telegram`, { headers: { 'sec-fetch-mode': 'navigate' } }));
    assert.equal(response.status, 308);
    assert.equal(response.headers.get('location'), `https://hashtagweb3.com${to}?utm_source=telegram`);
  }
  assert.equal(canonicalLearnLink('/learn/fundamentals/blockchains?x=1#hashes', 'fundamentals', 'web3'), '/blockchains?x=1#hashes');
  assert.equal(canonicalLearnLink('https://example.com/learn/fundamentals/blockchains', 'fundamentals', 'web3'), 'https://example.com/learn/fundamentals/blockchains');
});

test('sitemap snapshots and social previews publish the canonical learning URLs', () => {
  const routes = JSON.parse(fs.readFileSync('content/sitemap-routes.json', 'utf8')) as { url: string }[];
  const publicRoutes = JSON.parse(fs.readFileSync('public/.well-known/sitemap.json', 'utf8')).urls as { url: string }[];
  const xml = fs.readFileSync('public/sitemap.xml', 'utf8');
  for (const entries of [routes, publicRoutes]) {
    const urls = new Set(entries.map(entry => entry.url));
    for (const route of learnRoutes) assert.ok(urls.has(`https://hashtagweb3.com/${route.slug}`), route.slug);
    assert.ok(entries.every(entry => !entry.url.startsWith('https://hashtagweb3.com/learn/')));
  }
  for (const route of learnRoutes) {
    const url = `https://hashtagweb3.com/${route.slug}`;
    assert.ok(xml.includes(`<loc>${url}</loc>`));
    const $ = cheerio.load(fs.readFileSync(`public/preview/${route.slug}.html`, 'utf8'));
    assert.equal($('link[rel="canonical"]').attr('href'), url);
    assert.ok(($('title').text().match(/Hashtag\s*Web3/gi) || []).length <= 1);
  }
});

test('all lesson HTML preserves diagrams, code examples and valid quizzes from the edited source', async () => {
  let diagramCount = 0;
  let quizCount = 0;
  for (const category of getCategories()) {
    for (const meta of getLessons(category.slug)) {
      const source = fs.readFileSync(path.join('content/learn', category.slug, `${meta.slug}.md`), 'utf8');
      const parsed = matter(source);
      const lesson = getLesson(category.slug, meta.slug)!;
      assert.equal(lesson.content, parsed.content, `${category.slug}/${meta.slug} runtime is stale`);
      assert.deepEqual(lesson.quiz, parsed.data.quiz);
      const html = await renderLessonContent(lesson.content, category.slug, meta.slug);
      const $ = cheerio.load(html);
      assert.equal($('svg').length, (source.match(/<svg\b/g) || []).length);
      $('defs, marker, text').each((_, element) => assert.equal($(element).closest('svg').length, 1, `${meta.slug}: SVG child escaped its diagram`));
      assert.equal($('p').filter((_, element) => !$(element).text().trim() && !$(element).children().length).length, 0, `${meta.slug}: empty paragraphs`);
      assert.equal($('script').length, 0);
      diagramCount += $('svg').length;
      for (const question of lesson.quiz) {
        assert.equal(typeof question.question, 'string');
        assert.ok(question.options.length >= 2 && question.options.every(option => typeof option === 'string'));
        assert.ok(Number.isInteger(question.correct) && question.correct >= 0 && question.correct < question.options.length);
        assert.ok(question.explanation.trim());
        quizCount++;
      }
    }
  }
  assert.equal(diagramCount, 61);
  assert.equal(quizCount, 329);
  const heading = await renderLessonContent('## How a transaction actually works', 'fundamentals', 'blockchains');
  assert.ok(heading.includes('id="how-a-transaction-actually-works"'));
  const code = await renderLessonContent('```html\n<div><script>alert(1)</script></div>\n```', 'fundamentals', 'web3');
  const $code = cheerio.load(code);
  assert.equal($code('pre code').text().trim(), '<div><script>alert(1)</script></div>');
  assert.equal($code('script').length, 0);
  const svgCode = await renderLessonContent('```html\n<svg><text>Example</text></svg>\n```', 'fundamentals', 'web3');
  assert.equal(cheerio.load(svgCode)('svg').length, 0);
});
