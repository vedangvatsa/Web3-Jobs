import fs from 'fs';
import path from 'path';

const glossaryDirectory = path.join(process.cwd(), 'content/glossary');
const removableHeading = /^(#{2,6})\s+(?:.*\bcareer opportunities\b.*|best practices(?:\s+for\b.*)?|the future of\b.*)\s*$/i;

for (const file of fs.readdirSync(glossaryDirectory)) {
  if (!file.endsWith('.md')) continue;

  const filePath = path.join(glossaryDirectory, file);
  const lines = fs.readFileSync(filePath, 'utf8').split('\n');
  const output: string[] = [];

  for (let index = 0; index < lines.length;) {
    const heading = lines[index].match(removableHeading);
    if (!heading) {
      output.push(lines[index]);
      index += 1;
      continue;
    }

    const level = heading[1].length;
    index += 1;
    while (index < lines.length) {
      const nextHeading = lines[index].match(/^(#{1,6})\s+/);
      if (nextHeading && nextHeading[1].length <= level) break;
      index += 1;
    }

    while (output.at(-1) === '') output.pop();
    if (index < lines.length && output.length > 0) output.push('');
  }

  const updated = `${output.join('\n').trimEnd()}\n`;
  if (updated !== fs.readFileSync(filePath, 'utf8')) {
    fs.writeFileSync(filePath, updated);
  }
}
