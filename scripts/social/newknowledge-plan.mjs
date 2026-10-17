import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { ASSET_DIRECTORY, validateCampaign, selectKnowledgeDate } from './newknowledge-content.mjs';
import { localJournal } from './newknowledge-state.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const record = await localJournal(path.join(root, '.cache/newknowledge'));
await record({ mode: 'plan' }, 'run-start');
const read = async file => JSON.parse(await fs.readFile(path.join(root, ASSET_DIRECTORY, file), 'utf8'));
const [content, calendar] = await Promise.all([read('content.json'), read('calendar.json')]);
validateCampaign(content, calendar);
const flags = Object.fromEntries(['website_recovery', 'only_news', 'news_dry_run', 'dry_run', 'diagnose_telegram', 'diagnose_content'].map(key => [key, process.env[`KNOWLEDGE_${key.toUpperCase()}`]]));
const plan = selectKnowledgeDate(calendar, { date: process.env.KNOWLEDGE_DATE, slot: process.env.KNOWLEDGE_SLOT || 'afternoon', flags });
await record(plan, 'plan');
console.log(JSON.stringify(plan));
if (process.env.GITHUB_OUTPUT) await fs.appendFile(process.env.GITHUB_OUTPUT, `due=${plan.due}\n`);
