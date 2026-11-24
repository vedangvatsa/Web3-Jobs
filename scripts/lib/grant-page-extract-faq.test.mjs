import assert from 'node:assert/strict';
import { test } from 'node:test';
import { extractGrantPageContent } from './grant-page-extract.ts';

const notionFaqHtml = `
<html><body><main>
  <h2>Program</h2>
  <h3>❓FAQ</h3>
  <strong>What is this program?</strong>
  <p>This program funds ecosystem builders across the network.</p>
  <strong>What are the grant categories?</strong>
  <ol>
    <li>Education is a category for teams publishing courses.</li>
    <li>Infra is a category for core protocol work.</li>
  </ol>
  <strong>How do I apply?</strong>
  <p>Submit the form on our homepage any time.</p>
</main></body></html>
`;

test('Notion FAQ keeps question labels with answers', () => {
  const { result } = extractGrantPageContent(notionFaqHtml, 'Example Grant');
  const faq = result?.sections.find((s) => /faq/i.test(s.heading));
  assert.ok(faq, 'FAQ section');
  assert.equal(faq.heading, 'FAQ');
  assert.match(faq.paragraphs[0], /^What is this program\?\n\nThis program funds/);
  assert.equal(faq.paragraphs[1], 'What are the grant categories?');
  assert.equal(faq.bullets?.length, 2);
  assert.match(faq.paragraphs[2], /^How do I apply\?\n\nSubmit the form/);
});