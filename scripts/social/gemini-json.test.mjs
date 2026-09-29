import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseGeminiJsonResponse } from './gemini-json.mjs';
const response = (text, finishReason = 'STOP') => ({ candidates: [{ finishReason, content: { parts: [{ text }] } }] });

test('accepts complete JSON and fenced JSON without exposing thinking text', () => {
  assert.deepEqual(parseGeminiJsonResponse(response('```json\n[{"headline":"A verified headline"}]\n```'), 'array').value, [{ headline: 'A verified headline' }]);
  const data = response('{"headline":"A verified headline"}');
  data.candidates[0].content.parts.unshift({ thought: true, text: 'Internal reasoning' });
  assert.deepEqual(parseGeminiJsonResponse(data).value, { headline: 'A verified headline' });
});

test('rejects truncation and wrong result shapes so the caller retries a different response', () => {
  assert.throws(() => parseGeminiJsonResponse(response('[{"headline":"Unfinished', 'MAX_TOKENS'), 'array'), /Incomplete/);
  assert.throws(() => parseGeminiJsonResponse(response('[{"headline":"Unfinished'), 'array'), SyntaxError);
  assert.throws(() => parseGeminiJsonResponse(response('{}'), 'array'), /must be/);
  assert.throws(() => parseGeminiJsonResponse(response('[]')), /must be/);
  assert.throws(() => parseGeminiJsonResponse(response('null')), /must be/);
});
