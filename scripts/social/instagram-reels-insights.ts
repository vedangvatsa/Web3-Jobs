import {instagramAccount} from './job-video-core.ts';
import {meta} from './job-video-clients.ts';

type Media = {id: string; caption?: string; permalink: string; timestamp: string; media_product_type: string; like_count?: number; comments_count?: number};
type Insight = {name: string; values?: {value: number}[]; total_value?: {value: number}};
const metrics = ['views', 'reach', 'likes', 'comments', 'saved', 'shares', 'ig_reels_avg_watch_time', 'ig_reels_video_view_total_time'];
const limit = Number(process.argv.find(arg => arg.startsWith('--limit='))?.split('=')[1] || 12);
if (!Number.isInteger(limit) || limit < 1 || limit > 30) throw new Error('Use --limit=1 through --limit=30');

// Read-only. Do not return paging URLs, which can contain access tokens.
const account = await meta<{id: string; username: string; followers_count: number; website?: string}>(`${instagramAccount}?fields=id,username,followers_count,website`);
if (account.id !== instagramAccount) throw new Error('Unexpected Instagram account');
const recent = await meta<{data: Media[]}>(`${instagramAccount}/media?fields=id,caption,permalink,timestamp,media_product_type,like_count,comments_count&limit=100`);
const reels = recent.data.filter(media => media.media_product_type === 'REELS').slice(0, limit);
const results = [];
let insightsPermissionError: string | undefined;
for (const reel of reels) {
  const values: Record<string, number | null> = {};
  const unavailable: Record<string, string> = {};
  const record = (insights: Insight[]) => {
    for (const insight of insights) values[insight.name] = insight.total_value?.value ?? insight.values?.[0]?.value ?? null;
  };
  try {
    if (insightsPermissionError) throw new Error(insightsPermissionError);
    record((await meta<{data: Insight[]}>(`${reel.id}/insights?metric=${metrics.join(',')}`)).data);
  } catch (error) {
    if (/permission|access token/i.test(String(error))) {
      insightsPermissionError = 'Insights unavailable. The Facebook Login token needs instagram_manage_insights permission.';
    } else for (const metric of metrics) {
      try {record((await meta<{data: Insight[]}>(`${reel.id}/insights?metric=${metric}`)).data);}
      catch (error) {unavailable[metric] = String(error);}
    }
  }
  results.push({...reel, ageHours: Math.round((Date.now() - Date.parse(reel.timestamp)) / 3600000), metrics: values, unavailable});
}
console.log(JSON.stringify({checkedAt: new Date().toISOString(), account, insightsPermissionError, recentMediaTypes: recent.data.reduce<Record<string, number>>((counts, media) => ({...counts, [media.media_product_type]: (counts[media.media_product_type] || 0) + 1}), {}), reels: results}, null, 2));
