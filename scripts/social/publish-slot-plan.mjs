import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import { isPostingWindow, postingSlot } from './posting-slot.mjs';
import { hasDailyDeployment } from '../lib/daily-deploy.mjs';

const SLOTS = ['morning', 'afternoon', 'evening'];

export function planSlot(state, slot, today, now, forceSocial = process.env.FORCE_SOCIAL === 'true') {
  if (!SLOTS.includes(slot)) throw new Error(`Unknown slot: ${slot}`);
  const morning = state.ingested !== today && state.morning !== today;
  const news = state.news !== today && state.morning !== today;
  // Legacy morning stamps did not prove a rollout succeeded.
  const deploy = !hasDailyDeployment(state, today);
  const completed = state.slots?.[slot] ?? (slot === 'morning' ? undefined : state[slot]);
  const social = (completed !== today || forceSocial) && (forceSocial || now === undefined || isPostingWindow(postingSlot(slot, today), new Date(now).getTime()));
  return { morning, news, deploy, social, slot, skip: !morning && !news && !deploy && !social, date: today };
}

export function planRecovery(state, today) {
  const plan = planSlot(state, 'morning', today);
  return { ...plan, news: true, social: false, videos: false, slot: 'recovery', skip: false };
}

export function recordSlot(state, plan, results) {
  const next = { ...state, slots: { ...state.slots } };
  if (plan.morning && results.ingest === 'success') next.ingested = plan.date;
  if (plan.news && results.news === 'success') next.news = plan.date;
  if (next.ingested === plan.date && next.news === plan.date) next.morning = plan.date;
  // The serialized deploy job records actual rollout success before live checks.
  if (plan.social && results.posts === 'success' && results.telegram === 'success') next.slots[plan.slot] = plan.date;
  return next;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [action, file, slot, today] = process.argv.slice(2);
  const state = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
  if (action === 'plan') {
    for (const [key, value] of Object.entries(planSlot(state, slot, today, new Date(), process.env.FORCE_SOCIAL === 'true'))) console.log(`${key}=${value}`);
  } else if (action === 'recovery') {
    for (const [key, value] of Object.entries(planRecovery(state, slot))) console.log(`${key}=${value}`);
  } else if (action === 'record') {
    const plan = JSON.parse(process.env.PUBLISH_PLAN);
    if (SLOTS.includes(plan.slot) || plan.slot === 'recovery') {
      for (const key of ['morning', 'news', 'deploy', 'social']) plan[key] = plan[key] === 'true';
      fs.writeFileSync(file, `${JSON.stringify(recordSlot(state, plan, JSON.parse(process.env.PUBLISH_RESULTS)), null, 2)}\n`);
    }
  } else {
    throw new Error(`Unknown action: ${action}`);
  }
}
