import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

export function hashPaths(root: string, relPaths: string[]): string {
  const hash = crypto.createHash('sha256');
  for (const rel of relPaths.sort()) {
    const abs = path.join(root, rel);
    hash.update(rel);
    hash.update('\0');
    if (!fs.existsSync(abs)) {
      hash.update('missing');
      continue;
    }
    const stat = fs.statSync(abs);
    if (stat.isDirectory()) {
      hashDirectory(hash, abs, rel);
    } else {
      hash.update(fs.readFileSync(abs));
    }
  }
  return hash.digest('hex').slice(0, 16);
}

function hashDirectory(hash: crypto.Hash, absDir: string, relPrefix: string): void {
  const entries = fs.readdirSync(absDir).sort();
  for (const name of entries) {
    if (name.startsWith('.')) continue;
    const abs = path.join(absDir, name);
    const rel = `${relPrefix}/${name}`;
    const stat = fs.statSync(abs);
    if (stat.isDirectory()) hashDirectory(hash, abs, rel);
    else {
      hash.update(rel);
      hash.update(fs.readFileSync(abs));
    }
  }
}

export function outputsReady(root: string, outputs: string[]): boolean {
  return outputs.every((rel) => fs.existsSync(path.join(root, rel)));
}
