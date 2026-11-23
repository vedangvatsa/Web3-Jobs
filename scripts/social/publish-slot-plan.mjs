import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import { activeSlotAt, isPostingWindow, postingSlot } from './posting-slot.mjs';
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
  return { morning, news, deploy, social, slot, skip: !morning && !news && !deploy && !social, date: today, social_date: today };
}

/**
 * Scheduled runs: social follows the open wall-clock slot (late evening cron
 * after midnight is still yesterday's evening), but ingest/news/deploy always
 * key off the calendar UTC day. Using activeSlotAt().date for content work was
 * the Nov 23 regression — overnight cron skipped today's news because it still
 * planned against yesterday.
 */
export function planScheduledRun(state, now = Date.now(), forceSocial = process.env.FORCE_SOCIAL === 'true') {
  const instant = new Date(now).getTime();
  const active = activeSlotAt(instant);
  const contentDate = new Date(instant).toISOString().slice(0, 10);
  const content = planSlot(state, active.slot, contentDate, instant, forceSocial);
  const social = planSlot(state, active.slot, active.date, instant, forceSocial);
  return {
    morning: content.morning,
    news: content.news,
    deploy: content.deploy,
    social: social.social,
    slot: active.slot,
    date: contentDate,
    social_date: active.date,
    skip: !content.morning && !content.news && !content.deploy && !social.social,
  };
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
  // Social receipts belong to the open wall-clock slot date (may be yesterday
  // after midnight), not the calendar content date.
  if (plan.social && results.posts === 'success' && results.telegram === 'success') {
    next.slots[plan.slot] = plan.social_date || plan.date;
  }
  return next;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [action, file, slot, today] = process.argv.slice(2);
  const state = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
  if (action === 'plan') {
    for (const [key, value] of Object.entries(planSlot(state, slot, today, new Date(), process.env.FORCE_SOCIAL === 'true'))) console.log(`${key}=${value}`);
  } else if (action === 'schedule') {
    const now = process.env.PLAN_NOW ? Date.parse(process.env.PLAN_NOW) : Date.now();
    if (!Number.isFinite(now)) throw new Error('Invalid PLAN_NOW');
    for (const [key, value] of Object.entries(planScheduledRun(state, now, process.env.FORCE_SOCIAL === 'true'))) console.log(`${key}=${value}`);
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
