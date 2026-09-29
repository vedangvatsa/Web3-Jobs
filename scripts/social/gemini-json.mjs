export function parseGeminiJsonResponse(data, expected = 'object') {
  const candidate = data?.candidates?.[0];
  if (candidate?.finishReason && candidate.finishReason !== 'STOP') throw new Error(`Incomplete Gemini response: ${candidate.finishReason}`);
  const text = (candidate?.content?.parts || []).filter(part => !part.thought).map(part => part.text || '').join('').trim()
    .replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  const value = JSON.parse(text);
  if (expected === 'array' ? !Array.isArray(value) : !value || Array.isArray(value) || typeof value !== 'object') {
    throw new Error(`Gemini response must be a JSON ${expected}`);
  }
  return { value, text };
}
