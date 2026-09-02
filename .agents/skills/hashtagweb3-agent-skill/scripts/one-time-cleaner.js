const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const ROOT = path.join(__dirname, '..');

// ── Punctuation Replacements for String Values ──────────────────────
function cleanStringPunctuation(str) {
  if (!str || typeof str !== 'string') return str;
  return str
    .replace(/ — /g, ' - ')
    .replace(/—/g, ' - ')
    .replace(/ – /g, ' - ')
    .replace(/(\d+)\s*–\s*(\d+)/g, '$1-$2')
    .replace(/–/g, '-')
    .replace(/…/g, '...')
    .replace(/[“”„‟]/g, '"')
    .replace(/[‘’‚‛]/g, "'")
    .replace(/^(\s*)•\s+/gm, '$1- ')
    .replace(/•/g, '-')
    .replace(/·/g, '-')
    .replace(/\u00A0/g, ' ')
    .replace(/\u200B|\u200C|\u200D|\uFEFF/g, '')
    .replace(/&mdash;/gi, ' - ')
    .replace(/&ndash;/gi, '-')
    .replace(/&#8212;/g, ' - ')
    .replace(/&#8211;/g, '-')
    .replace(/&#x2014;/gi, ' - ')
    .replace(/&#x2013;/gi, '-')
    .replace(/&hellip;/gi, '...')
    .replace(/&#8230;/g, '...')
    .replace(/&ldquo;|&rdquo;/gi, '"')
    .replace(/&lsquo;|&rsquo;/gi, "'");
}

// ── AI Filler Replacements ──────────────────────────────────────────
const AI_REPLACEMENTS = [
  [/\bin today'?s fast[- ]paced (?:digital )?world,?\s*/gi, "In today's industry, "],
  [/\bin today'?s rapidly evolving\b/gi, "in today's fast-moving"],
  [/\bnavigate the landscape of\b/gi, 'navigate the market for'],
  [/\bnavigate the landscape\b/gi, 'navigate the market'],
  [/\bat the forefront of\b/gi, 'leading'],
  [/\bdive deep into\b/gi, 'explore'],
  [/\bdive deep\b/gi, 'look closely'],
  [/\bunlock your potential\b/gi, 'grow your career'],
  [/\bgame[- ]changer\b/gi, 'major shift'],
  [/\bgame[- ]changing\b/gi, 'major'],
  [/\bit is important to note that\s+/gi, ''],
  [/\bit'?s important to note that\s+/gi, ''],
  [/\bit is worth noting that\s+/gi, ''],
  [/\bit'?s worth noting that\s+/gi, ''],
  [/\bat the end of the day,?\s*/gi, ''],
  [/\btestament to\b/gi, 'evidence of'],
  [/\bcutting[- ]edge\b/gi, 'advanced'],
  [/\bstate[- ]of[- ]the[- ]art\b/gi, 'modern'],
  [/\bbest[- ]in[- ]class\b/gi, 'top-tier'],
  [/\bworld[- ]class\b/gi, 'leading'],
  [/\bdelve into\b/gi, 'examine'],
  [/\bdelves into\b/gi, 'examines'],
  [/\bdelved into\b/gi, 'examined'],
  [/\bdelving into\b/gi, 'examining'],
  [/\bdelve\b/gi, 'explore'],
  [/\bdelves\b/gi, 'explores'],
  [/\bdelved\b/gi, 'explored'],
  [/\bdelving\b/gi, 'exploring'],
  [/\btapestry\b/gi, 'mix'],
  [/\bdemystify\b/gi, 'explain'],
  [/\bdemystifies\b/gi, 'explains'],
  [/\bdemystified\b/gi, 'explained'],
  [/\bdemystifying\b/gi, 'explaining'],
  [/\bunveil\b/gi, 'introduce'],
  [/\bunveils\b/gi, 'introduces'],
  [/\bunveiled\b/gi, 'introduced'],
  [/\bunveiling\b/gi, 'introducing'],
  [/\bpivotal\b/gi, 'key'],
  [/\bvibrant\b/gi, 'active'],
  [/\bmeticulous\b/gi, 'thorough'],
  [/\bmeticulously\b/gi, 'carefully'],
  [/\bgroundbreaking\b/gi, 'notable'],
  [/\bseamlessly\b/gi, 'smoothly'],
  [/\bseamless\b/gi, 'smooth'],
  [/\butilize\b/gi, 'use'],
  [/\butilizes\b/gi, 'uses'],
  [/\butilized\b/gi, 'used'],
  [/\butilizing\b/gi, 'using'],
  [/\butilization\b/gi, 'use'],
  [/\bsynergies\b/gi, 'cooperation'],
  [/\bsynergy\b/gi, 'collaboration'],
  [/\bholistic\b/gi, 'complete'],
  [/\bholistically\b/gi, 'comprehensively'],
  [/\bsupercharge\b/gi, 'speed up'],
  [/\bsupercharges\b/gi, 'speeds up'],
  [/\bsupercharged\b/gi, 'accelerated'],
  [/\bsupercharging\b/gi, 'accelerating'],
  [/\breimagine\b/gi, 'rethink'],
  [/\breimagines\b/gi, 'rethinks'],
  [/\breimagined\b/gi, 'redesigned'],
  [/\breimagining\b/gi, 'rethinking'],
  [/\brevolutionize\b/gi, 'transform'],
  [/\brevolutionizes\b/gi, 'transforms'],
  [/\brevolutionized\b/gi, 'transformed'],
  [/\brevolutionizing\b/gi, 'transforming'],
  [/\bleveraging\b/gi, 'using'],
  [/\bleveraged\b/gi, 'used'],
  [/\bleverages\b/gi, 'uses'],
  [/\bleverage\b/gi, 'use'],
];

function cleanCopy(str) {
  if (!str || typeof str !== 'string') return str;
  let s = cleanStringPunctuation(str);
  for (const [re, rep] of AI_REPLACEMENTS) {
    s = s.replace(re, rep);
  }
  return s;
}

// ── Protect Code & Domain Terms ─────────────────────────────────────
function protectMarkdown(text) {
  const map = new Map();
  let count = 0;
  let s = text;

  s = s.replace(/```[\s\S]*?```/g, (m) => {
    const key = `__CODE_FENCE_${count++}__`;
    map.set(key, m);
    return key;
  });

  s = s.replace(/`[^`\n]+`/g, (m) => {
    const key = `__INLINE_CODE_${count++}__`;
    map.set(key, m);
    return key;
  });

  const domainPatterns = [
    /\b(?:token|cliff|linear|vesting|schedule)\s+unlock(?:s|ed|ing)?\b/gi,
    /\bunlock(?:s|ed|ing)?\s+(?:schedule|period|event|date|token|cliff)\b/gi,
    /\bParadigm\b/g,
    /\b(?:financial|margin|trading|debt|capital|2x|3x|5x|10x|20x|50x|100x)\s+leverage\b/gi,
    /\bleverage\s+(?:trading|ratio|facility|protocol|market|tokens?)\b/gi,
    /\bcomprehensive\s+(?:health|medical|dental|vision)\s+insurance\b/gi,
  ];

  for (const pat of domainPatterns) {
    s = s.replace(pat, (m) => {
      const key = `__DOMAIN_${count++}__`;
      map.set(key, m);
      return key;
    });
  }

  return {
    content: s,
    restore: (restored) => {
      let res = restored;
      for (const [key, val] of map) {
        res = res.replace(key, val);
      }
      return res;
    },
  };
}

// ── Clean Markdown File ─────────────────────────────────────────────
function cleanMarkdownFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');

  // Check if file has frontmatter
  if (raw.startsWith('---')) {
    let parsed;
    try {
      parsed = matter(raw);
    } catch (e) {
      // If broken frontmatter, fix simple quote issues
      const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
      if (fmMatch) {
        let fmStr = fmMatch[1];
        // Clean curly quotes in frontmatter
        fmStr = cleanStringPunctuation(fmStr);
        try {
          parsed = matter(`---\n${fmStr}\n---\n${fmMatch[2]}`);
        } catch (e2) {
          console.error(`Unable to parse frontmatter in ${filePath}:`, e2.message);
          return;
        }
      } else {
        console.error(`Broken frontmatter in ${filePath}`);
        return;
      }
    }

    // Clean data object
    function cleanObj(obj) {
      if (typeof obj === 'string') return cleanCopy(obj);
      if (Array.isArray(obj)) return obj.map(cleanObj);
      if (obj && typeof obj === 'object') {
        const res = {};
        for (const [k, v] of Object.entries(obj)) {
          res[k] = cleanObj(v);
        }
        return res;
      }
      return obj;
    }

    const cleanedData = cleanObj(parsed.data);

    // Clean body
    const { content: protectedBody, restore } = protectMarkdown(parsed.content);
    let cleanedBody = cleanCopy(protectedBody);
    cleanedBody = restore(cleanedBody);

    const result = matter.stringify(cleanedBody, cleanedData);
    fs.writeFileSync(filePath, result, 'utf8');
  } else {
    // No frontmatter
    const { content: protectedBody, restore } = protectMarkdown(raw);
    let cleanedBody = cleanCopy(protectedBody);
    cleanedBody = restore(cleanedBody);
    fs.writeFileSync(filePath, cleanedBody, 'utf8');
  }
}

// ── Clean JSON File ─────────────────────────────────────────────────
function cleanJsonFile(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(raw);

    function cleanNode(node) {
      if (typeof node === 'string') return cleanCopy(node);
      if (Array.isArray(node)) return node.map(cleanNode);
      if (node && typeof node === 'object') {
        const res = {};
        for (const [k, v] of Object.entries(node)) {
          res[k] = cleanNode(v);
        }
        return res;
      }
      return node;
    }

    const cleaned = cleanNode(data);
    fs.writeFileSync(filePath, JSON.stringify(cleaned, null, 2), 'utf8');
  } catch (err) {
    console.error(`Error cleaning JSON ${filePath}:`, err.message);
  }
}

// ── Run across all target directories ───────────────────────────────
function scanDir(dir, exts) {
  const full = path.join(ROOT, dir);
  if (!fs.existsSync(full)) return [];
  const results = [];
  for (const entry of fs.readdirSync(full, { withFileTypes: true })) {
    const p = path.join(full, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.next') continue;
      results.push(...scanDir(path.join(dir, entry.name), exts));
    } else if (exts.some(e => entry.name.endsWith(e))) {
      results.push(path.join(dir, entry.name));
    }
  }
  return results;
}

const mdFiles = [
  ...scanDir('content/articles', ['.md', '.mdx']),
  ...scanDir('content/companies', ['.md', '.mdx']),
  ...scanDir('content/glossary', ['.md', '.mdx']),
  ...scanDir('content/learn', ['.md', '.mdx']),
];

console.log(`Cleaning ${mdFiles.length} markdown files...`);
for (const f of mdFiles) {
  cleanMarkdownFile(path.join(ROOT, f));
}

const jsonFiles = [
  'content/jobs-cache.json',
  'content/events-cache.json',
  'content/jobs-full-text.json',
  ...scanDir('content/generated', ['.json']),
  ...scanDir('scripts/social', ['.json']),
];

console.log(`Cleaning ${jsonFiles.length} JSON files...`);
for (const f of jsonFiles) {
  if (f.endsWith('.enc')) continue;
  const full = path.join(ROOT, f);
  if (fs.existsSync(full)) {
    cleanJsonFile(full);
  }
}

console.log('Done one-time clean!');
