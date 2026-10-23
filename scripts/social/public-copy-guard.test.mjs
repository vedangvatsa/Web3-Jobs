import test from 'node:test';
import assert from 'node:assert/strict';
import { assertPublicText, assertPublicFields, assertPublicImageCopy, usesPublicCopyPolicy, PUBLIC_PARAGRAPH_LIMIT } from './public-copy-guard.mjs';
import { CAMPAIGN, validateCampaign } from './newknowledge-content.mjs';
import { publicThreadFixture } from './public-copy-fixtures.mjs';

test('production notes fail with the exact public field, without rewriting facts', () => {
  for (const text of [
    'Model output, not observed pay.', 'MODEL-ONLY salary figures.', 'Model only; tokens excluded.',
    'This is model\noutput.', 'Not observed salaries.', 'Authored answer.', 'Authored summary.',
    'Authored graphic.', 'Authored chart.', 'Answer summary · authored', 'Authored explanation.',
    'Locally rendered application.', 'Real app, local capture.', 'Rendered locally.', 'Locally captured screen.',
    'Parent: instructions', 'parent:instructions', 'Internal prompt: use these values.',
    'System instructions: do not disclose.', 'Production notes: keep this label.',
    'Review notes: check the numbers.', 'Reviewer directions: shorten this.', 'Reviewer: approve this copy.',
    'Instructions for the reviewer.', 'For the editor: trim this paragraph.',
    'Rewrite this caption before publishing.', 'Keep this caption under 200 characters.',
    'TODO: check salary.', 'TBD', '[insert caption here]', '[placeholder]', '{{caption}}',
    'Placeholder text.', 'Lorem ipsum dolor sit amet.',
  ]) {
    const payload = { image: { alt: text } }, before = structuredClone(payload);
    assert.throws(() => assertPublicFields(payload, { field: 'N02/1' }), error => {
      assert.equal(error.code, 'ERR_PUBLIC_COPY');
      assert.equal(error.field, 'N02/1.image.alt');
      assert.match(error.message, /N02\/1\.image\.alt: PUBLIC copy/);
      return true;
    }, text);
    assert.deepEqual(payload, before);
  }
});

test('audience instructions, technical models, estimates and visa qualifications remain valid', () => {
  for (const text of [
    'Write a threat model before implementing the contract.',
    'Run forge test. Unauthorized callers and repeat withdrawals revert.',
    'Example: storage persists; memory is temporary.',
    'Estimated monthly budget: USD 1,000. Rent is included.',
    'Source: Hashtag Web3 city directory.',
    'Salary calculator estimates exclude tokens and equity.',
    'Main-applicant eligibility and approval checks apply; fees are additional.',
    'Do not reorder existing fields in a deployed proxy implementation.',
    'A reviewer should be able to inspect the source and run your tests.',
    'The visa requires proof of foreign employment and USD 24,000 annual income.',
    'A personal exercise is not a fictional client engagement.',
  ]) assert.doesNotThrow(() => assertPublicText(text), text);
});

test('readability is fail-closed, preserves URLs and counts paragraphs rather than soft line wraps', () => {
  for (const text of [' leading', 'trailing ', 'first \n\nsecond', 'first\r\nsecond', 'first\n\n\nsecond', 'first\\nsecond', 'first\u2028second', 'broken\ud800']) {
    assert.throws(() => assertPublicText(text, { field: 'post.text' }), /post\.text: PUBLIC copy/);
  }
  assert.doesNotThrow(() => assertPublicText('a'.repeat(PUBLIC_PARAGRAPH_LIMIT)));
  assert.throws(() => assertPublicText('a'.repeat(PUBLIC_PARAGRAPH_LIMIT + 1)), /paragraph 1 exceeds 210/);
  assert.throws(() => assertPublicText(`${'a'.repeat(110)}\n${'b'.repeat(110)}`), /paragraph 1 exceeds 210/);
  assert.doesNotThrow(() => assertPublicText(`${'a'.repeat(150)}\n\n${'b'.repeat(150)}`));
  const url = `https://hashtagweb3.com/${'resource-'.repeat(30)}/x`;
  assert.doesNotThrow(() => assertPublicText(`Read the source.\n\n${url}`));
  assert.doesNotThrow(() => assertPublicText('A clear visual description. '.repeat(20).trim(), { kind: 'alt' }));
  assert.throws(() => assertPublicImageCopy({ alt: 'A diagram of a contract state transition.' }), /image\.renderedText/);
});

test('only the exact five historical campaign identities are exempt in validation and readbacks', () => {
  for (const [index, id] of ['C01', 'E01', 'N01', 'C02', 'E02'].entries()) {
    const context = { campaign: CAMPAIGN, threadId: id, sequence: index + 1, date: `2026-10-${18 + index}` };
    assert.equal(usesPublicCopyPolicy(context), false);
    for (const patch of [{ campaign: 'another-campaign' }, { date: '2026-10-23' }, { sequence: 6 }, { threadId: 'N02' }]) {
      assert.equal(usesPublicCopyPolicy({ ...context, ...patch }), true);
    }
  }
  for (const context of [{}, { date: '2026-10-18' }, { campaign: CAMPAIGN, sequence: 1 }, { campaign: CAMPAIGN, threadId: 'N02', sequence: 6, date: '2026-10-23' }]) assert.equal(usesPublicCopyPolicy(context), true);
});

test('whole-campaign validation accepts the historical prefix and checks every future public field', () => {
  const threads = Array.from({ length: 30 }, (_, index) => publicThreadFixture({
    id: `${'CEN'[index % 3]}${String(Math.floor(index / 3) + 1).padStart(2, '0')}`,
    sequence: index + 1, title: `Evidence checklist ${index + 1}`, sources: [{ url: 'https://hashtagweb3.com/learn' }],
    posts: Array.from({ length: 6 }, (_, post) => ({ number: post + 1, linkPath: null })),
  }));
  for (const thread of threads.slice(0, 5)) thread.posts[0].text = `${thread.id}: Model output, not observed pay. ${'A'.repeat(180)}`;
  const content = { id: CAMPAIGN, siteOrigin: 'https://hashtagweb3.com', threads };
  const calendar = { campaign: CAMPAIGN, start: '2026-10-18', end: '2026-11-16', slot: 'afternoon', timeUTC: '11:30', windowMinutes: 60, platforms: ['x', 'threads'], dates: threads.map(thread => ({ id: thread.id, sequence: thread.sequence, title: thread.title, date: new Date(Date.UTC(2026, 9, 18 + thread.sequence - 1)).toISOString().slice(0, 10) })) };
  assert.equal(validateCampaign(content, calendar).length, 30);
  for (const change of [
    post => { post.text = 'This is model output, not observed pay.'; },
    post => { post.alt = 'An authored graphic with regional figures.'; },
    post => { post.visual.headline = 'Local capture'; },
    post => { post.visual.labels = ['Internal review notes']; },
    post => { post.text = 'x'.repeat(211); },
  ]) {
    const copy = structuredClone(content); change(copy.threads[5].posts[0]);
    assert.throws(() => validateCampaign(copy, calendar), /thread\[N02\]\.posts\[0\]/);
  }
});
