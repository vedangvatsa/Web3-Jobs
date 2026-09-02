import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const ROOT_DIR = path.resolve(__dirname, '../../');

function getRelativePath(absolutePath: string): string {
 return path.relative(ROOT_DIR, absolutePath);
}

function getRemoteContent(relativePath: string): string | null {
 try {
 // Run git show origin/main:<relativePath>
 const output = execSync(`git show origin/main:${relativePath}`, {
 cwd: ROOT_DIR,
 stdio: ['pipe', 'pipe', 'ignore'], // ignore stderr to prevent cluttering logs
 });
 return output.toString('utf8');
 } catch (err) {
 // If the file does not exist on origin/main, return null
 return null;
 }
}

function mergeObjects(local: any, remote: any, keyContext: string = ''): any {
 if (local === undefined) return remote;
 if (remote === undefined) return local;

 // Handles null values safely
 if (local === null || remote === null) {
 return local !== null ? local : remote;
 }

 // Type mismatch - default to local
 if (typeof local !== typeof remote) {
 return local;
 }

 // Array merge: set-union of elements
 if (Array.isArray(local) && Array.isArray(remote)) {
 const localPrimitives = local.filter(x => typeof x !== 'object');
 const remotePrimitives = remote.filter(x => typeof x !== 'object');
 const unionPrimitives = Array.from(new Set([...localPrimitives,...remotePrimitives]));

 // Handle array of objects if any (e.g. by comparing their JSON strings)
 const localObjects = local.filter(x => typeof x === 'object');
 const remoteObjects = remote.filter(x => typeof x === 'object');
 const mergedObjects = [...localObjects];
 for (const remoteObj of remoteObjects) {
 const remoteStr = JSON.stringify(remoteObj);
 if (!mergedObjects.some(lo => JSON.stringify(lo) === remoteStr)) {
 mergedObjects.push(remoteObj);
 }
 }

 return [...unionPrimitives,...mergedObjects];
 }

 // Object merge: recursive key merge
 if (typeof local === 'object') {
 const merged: any = {};
 const keys = new Set([...Object.keys(local),...Object.keys(remote)]);

 for (const key of keys) {
 const localVal = local[key];
 const remoteVal = remote[key];

 if (key === 'lastIndex') {
 const lNum = localVal !== undefined ? Number(localVal) : -1;
 const rNum = remoteVal !== undefined ? Number(remoteVal) : -1;
 merged[key] = Math.max(lNum, rNum);
 } else if (key === 'lastScheduledAt' || key === 'postedAt' || key === 'postedToLinkedInAt') {
 const lTime = localVal ? new Date(localVal).getTime() : 0;
 const rTime = remoteVal ? new Date(remoteVal).getTime() : 0;
 merged[key] = lTime > rTime ? localVal : remoteVal;
 } else {
 merged[key] = mergeObjects(localVal, remoteVal, key);
 }
 }
 return merged;
 }

 // Primitive merge:
 // If it's a number, pick max
 if (typeof local === 'number') {
 return Math.max(local, remote);
 }

 // For string types, check if they are ISO date strings
 if (typeof local === 'string') {
 const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
 if (isoDateRegex.test(local) && isoDateRegex.test(remote)) {
 const lTime = new Date(local).getTime();
 const rTime = new Date(remote).getTime();
 return lTime > rTime ? local : remote;
 }
 }

 // Otherwise, default to local state
 return local;
}

function mergeFile(absolutePath: string) {
 const relPath = getRelativePath(absolutePath);
 console.log(`\n🔄 Merging state for: ${relPath}`);

 if (!fs.existsSync(absolutePath)) {
 console.log(`   Local file does not exist, skipping.`);
 return;
 }

 const remoteRaw = getRemoteContent(relPath);
 if (!remoteRaw) {
 console.log(`   Remote version not found on origin/main, keeping local as-is.`);
 return;
 }

 try {
 const localContent = fs.readFileSync(absolutePath, 'utf8');
 const localJSON = JSON.parse(localContent);
 const remoteJSON = JSON.parse(remoteRaw);

 const mergedJSON = mergeObjects(localJSON, remoteJSON);

 // Save the merged JSON back to the local file
 fs.writeFileSync(absolutePath, JSON.stringify(mergedJSON, null, 2), 'utf8');
 console.log(`   ✅ Merged successfully.`);
 } catch (err) {
 console.error(`   ❌ Failed to merge ${relPath}:`, (err as Error).message);
 }
}

function discoverFiles(): string[] {
 const discovered: string[] = [];

 // 1. Scan scripts/social for any *.json files
 const socialDir = path.join(ROOT_DIR, 'scripts/social');
 if (fs.existsSync(socialDir)) {
 const files = fs.readdirSync(socialDir);
 for (const file of files) {
 if (file.endsWith('.json')) {
 discovered.push(path.join(socialDir, file));
 }
 }
 }

 // 2. Scan root directory for any.*posted*.json or.*news*.json
 const rootFiles = fs.readdirSync(ROOT_DIR);
 for (const file of rootFiles) {
 if (file.endsWith('.json') && (file.includes('posted') || file.includes('news') || file.startsWith('.telegram'))) {
 discovered.push(path.join(ROOT_DIR, file));
 }
 }

 return discovered;
}

function main() {
 let targets = process.argv.slice(2);

 if (targets.length === 0) {
 console.log('🔍 No files specified. Discovering state files automatically...');
 targets = discoverFiles();
 }

 console.log(`Found ${targets.length} state files to merge.`);

 for (const target of targets) {
 const absolutePath = path.isAbsolute(target) ? target : path.resolve(ROOT_DIR, target);
 mergeFile(absolutePath);
 }

 console.log('\n✨ All state files merged successfully.');
}

if (require.main === module) {
 main();
}
