import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

const SLOTS = ['morning', 'afternoon', 'evening'];

export function planSlot(state, slot, today) {
  if (!SLOTS.includes(slot)) throw new Error(`Unknown slot: ${slot}`);
  const morning = state.morning !== today;
  // Legacy morning stamps did not prove a rollout succeeded.
  const deploy = state.deployed !== today;
  const completed = state.slots?.[slot] ?? (slot === 'morning' ? undefined : state[slot]);
  const social = completed !== today;
  return { morning, news: morning, deploy, social, slot, skip: !morning && !deploy && !social, date: today };
}

export function recordSlot(state, plan, results) {
  const next = { ...state, slots: { ...state.slots } };
  if (plan.morning && results.ingest === 'success' && results.news === 'success') next.morning = plan.date;
  if (plan.deploy && results.deploy === 'success') next.deployed = plan.date;
  if (plan.social && results.posts === 'success' && results.telegram === 'success') next.slots[plan.slot] = plan.date;
  return next;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [action, file, slot, today] = process.argv.slice(2);
  const state = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
  if (action === 'plan') {
    for (const [key, value] of Object.entries(planSlot(state, slot, today))) console.log(`${key}=${value}`);
  } else if (action === 'record') {
    const plan = JSON.parse(process.env.PUBLISH_PLAN);
    if (SLOTS.includes(plan.slot)) {
      for (const key of ['morning', 'deploy', 'social']) plan[key] = plan[key] === 'true';
      fs.writeFileSync(file, `${JSON.stringify(recordSlot(state, plan, JSON.parse(process.env.PUBLISH_RESULTS)), null, 2)}\n`);
    }
  } else {
    throw new Error(`Unknown action: ${action}`);
  }
}
