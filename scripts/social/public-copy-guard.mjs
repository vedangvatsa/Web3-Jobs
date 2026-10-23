export const PUBLIC_PARAGRAPH_LIMIT = 210;
export const PUBLIC_COPY_POLICY_START = '2026-10-23';
const campaign = 'knowledge-threads-month-2026-10-17';
const historical = ['C01', 'E01', 'N01', 'C02', 'E02'];

export const PUBLIC_COPY_BLOCKED_PATTERNS = Object.freeze([
  ['model-production-note', /\bmodel[\s-]+(?:outputs?|only)\b|\bnot\s+(?:observed|actual|real[\s-]+world)\s+(?:pay|salar(?:y|ies)|compensation)\b/i],
  ['authored-production-note', /\bauthored[\s-]+(?:answers?|summar(?:y|ies)|graphics?|charts?|explanations?|examples?)\b|\b(?:answer\s+)?summary\s*[·:;,-]\s*authored\b/i],
  ['local-production-note', /\b(?:locally[\s-]+(?:rendered|captured)|rendered[\s-]+locally|local(?:ly)?[\s-]+captures?)\b/i],
  ['internal-instructions', /\bparent\s*:\s*|\b(?:internal|system|developer)\s+(?:prompts?|instructions?|notes?)\b|\b(?:production|editorial|review|reviewer)\s+notes?\b|\binternal[\s-]+only\b/i],
  ['reviewer-directions', /\b(?:reviewer|editor)\s*(?::|instructions?\b|directions?\b)|\b(?:instructions?|directions?)\s+(?:to|for)\s+(?:the\s+)?(?:reviewer|editor|model|agent)\b|\b(?:for\s+(?:the\s+)?(?:reviewer|editor)|do\s+not\s+publish|before\s+publishing)\s*:/i],
  ['production-directions', /\b(?:rewrite|revise|replace|remove|delete|strip|insert)\b[^\n.!?]{0,80}\b(?:before\s+(?:publishing|posting)|this\s+(?:placeholder|caption|copy)|production\s+notes?)\b|\b(?:keep|limit)\s+(?:this\s+)?(?:copy|caption|post|paragraph|text)\b[^\n.!?]{0,40}\b(?:characters?|chars?|words?)\b/i],
  ['placeholder', /\b(?:TODO|TBD|FIXME)\b|\blorem\s+ipsum\b|\bplaceholder\s+(?:text|copy|caption|image)\b|\[(?:insert|replace|add|placeholder)\b[^\]\n]*\]|\{\{\s*(?:caption|text|title|prompt|insert|placeholder)\b[^}]*\}\}/i],
]);

function fail(field, rule, detail) {
  const error = new Error(`${field}: PUBLIC copy ${detail}`);
  error.code = 'ERR_PUBLIC_COPY';
  error.field = field;
  error.rule = rule;
  throw error;
}

export function usesPublicCopyPolicy({ campaign: id, threadId, id: sourceId, sequence, date } = {}) {
  const index = historical.indexOf(threadId ?? sourceId);
  const historicalDate = index < 0 ? null : `2026-10-${18 + index}`;
  return !(id === campaign && index >= 0 && sequence === index + 1 && (date === undefined || date === historicalDate));
}

export function assertPublicText(text, { field = 'public.text', kind = 'post' } = {}) {
  if (typeof text !== 'string' || !text.length) fail(field, 'required', 'must be a nonempty string');
  if (!text.isWellFormed() || /[\r\u0000-\u0008\u000b-\u001f\u007f\u2028\u2029]/u.test(text) || /\\[nr]/.test(text)) fail(field, 'line-endings', 'requires valid Unicode and LF line breaks');
  if (text.trim() !== text) fail(field, 'outer-whitespace', 'has leading or trailing whitespace');
  if (/[^\S\n]+$/m.test(text)) fail(field, 'line-whitespace', 'has trailing line whitespace');
  if (/\n{3,}/.test(text)) fail(field, 'blank-lines', 'has excess blank lines; use one blank line between paragraphs');
  const normalized = text.normalize('NFKC').replace(/[\u2010-\u2015\u2212]/g, '-');
  for (const [rule, pattern] of PUBLIC_COPY_BLOCKED_PATTERNS) {
    if (pattern.test(normalized)) fail(field, rule, `contains a blocked ${rule}`);
  }
  if (kind === 'post' || kind === 'caption') {
    for (const [index, paragraph] of text.split('\n\n').entries()) {
      const weighted = paragraph.replace(/https?:\/\/\S+|(?<![\w@./:-])(?:[a-z0-9-]+\.)+[a-z]{2,}(?:[/:?#@]\S*)?/gi, 'x'.repeat(23));
      if ([...weighted].length > PUBLIC_PARAGRAPH_LIMIT) fail(field, 'paragraph-length', `paragraph ${index + 1} exceeds ${PUBLIC_PARAGRAPH_LIMIT} characters; add a natural paragraph break`);
    }
  }
}

const publicKinds = new Map([
  ['text', 'post'], ['caption', 'caption'], ['alt', 'alt'], ['altText', 'alt'], ['alt_text', 'alt'],
  ['renderedText', 'image'], ['title', 'title'], ['headline', 'image'], ['labels', 'image'],
]);

export function assertPublicFields(value, { field = 'public' } = {}) {
  if (!value || typeof value !== 'object') return;
  for (const [key, item] of Object.entries(value)) {
    const location = Array.isArray(value) ? `${field}[${key}]` : `${field}.${key}`;
    const kind = publicKinds.get(key);
    if (kind) {
      if (Array.isArray(item) && ['labels', 'renderedText'].includes(key)) item.forEach((text, index) => assertPublicText(text, { field: `${location}[${index}]`, kind }));
      else assertPublicText(item, { field: location, kind });
    } else if (item && typeof item === 'object') assertPublicFields(item, { field: location });
  }
}

export function assertPublicImageCopy(image, { field = 'image' } = {}) {
  assertPublicText(image?.alt, { field: `${field}.alt`, kind: 'alt' });
  assertPublicText(image?.renderedText, { field: `${field}.renderedText`, kind: 'image' });
}

export function assertPublicThread(thread) {
  assertPublicFields({ title: thread.title, posts: thread.posts }, { field: `thread[${thread.id}]` });
}

export function assertPublicCarouselCopy(spec) {
  const field = `${spec.platform}/${spec.threadId || 'carousel'}`;
  assertPublicFields(spec, { field });
  if (spec.sourceImages?.length !== 6) fail(`${field}.sourceImages`, 'required', 'requires six source image copy declarations');
  spec.sourceImages.forEach((image, index) => assertPublicImageCopy(image, { field: `${field}.sourceImages[${index}]` }));
}
