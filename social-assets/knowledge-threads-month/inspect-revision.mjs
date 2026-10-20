import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const load = async file => JSON.parse(await fs.readFile(path.join(root, file), 'utf8'));
const content = await load('content.json');
const tools = await load('assets/revision/tool-captures.json');
const learning = await load('assets/revision/learning-captures.json');
const lines = content.threads.filter(t => t.sequence > 3).sort((a, b) => a.sequence - b.sequence).flatMap(t => [
  `\n## ${t.id} | ${t.title}`,
  ...t.posts.map(p => `${p.number}. ${p.visual.headline}\nPOST: ${p.text}\nLABELS: ${p.visual.labels.join(' | ')}\nITEMS: ${JSON.stringify(p.visual.items)}\nBRIEF: ${p.visual.brief}`),
]);
lines.push('\n## TOOL CAPTURES', ...tools.captures.map(c => `${c.id} | ${c.width}x${c.height} | CSS ${c.cssWidth}x${c.cssHeight} / min ${c.minimumTextCssPx}px | ${c.file}\n${c.visibleText.replace(/\n/g, ' | ')}`));
lines.push('\n## LEARNING CAPTURES', ...learning.map(c => `${c.id} | ${c.width}x${c.height}\n${c.visibleText.replace(/\n/g, ' | ')}`));
lines.push('\n## LEGAL SOURCE URLS', ...content.threads.filter(t=>['C04','C05','N07','E09'].includes(t.id)).flatMap(t=>[t.id,...t.sources.map(s=>s.url+' | '+JSON.stringify(s.supports))]));
await fs.writeFile(path.join(root, 'assets/revision/visual-inventory.txt'), lines.join('\n') + '\n');
console.log(`Visual inventory: ${content.threads.filter(t => t.sequence > 3).length} threads; ${tools.captures.length} tool captures; ${learning.length} learning captures.`);
