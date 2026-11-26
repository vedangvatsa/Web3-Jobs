import fs from 'node:fs';
import path from 'node:path';

const dir = path.join(process.cwd(), 'content/articles');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));

console.log(`Inspecting ${files.length} articles...`);

const samples: Array<{ file: string; lineNum: number; line: string }> = [];

for (const file of files) {
  const content = fs.readFileSync(path.join(dir, file), 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, i) => {
    if (
      /\*\*[^*]+:\*\*-(?!\-)/.test(line) ||
      /\*\*[^*]+:\*\*\[/.test(line) ||
      /\*\*[^*]+:\*\*[A-Za-z0-9]/.test(line) ||
      /\*\*[^*]+\*\*\[[^\]]+\]\([^)]+\)\s*\*\*[^*]+\*\*/.test(line) ||
      /\]\([^)]+\)\*\*[A-Z]/.test(line) ||
      /[\".?!]\*\*(?:Pros|Cons|Note|Tip|Warning|What it is|Website|Who it is for):/i.test(line)
    ) {
      if (samples.length < 30) {
        samples.push({ file, lineNum: i + 1, line });
      }
    }
  });
}

for (const s of samples) {
  console.log(`\n[${s.file}:${s.lineNum}]`);
  console.log(s.line.slice(0, 140));
}
