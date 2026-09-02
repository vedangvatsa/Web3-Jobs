#!/usr/bin/env node
/**
 * Diagnose Telegram bot/channel access for news + AI news.
 * Avoids printing secret strings so GitHub log masking cannot hide usernames.
 */
async function api(token, method, params = {}) {
  const url = new URL(`https://api.telegram.org/bot${token}/${method}`);
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && v !== '') url.searchParams.set(k, String(v));
  });
  const res = await fetch(url);
  return res.json();
}

function summarizeChat(r) {
  return {
    id: r.id,
    type: r.type,
    username: r.username || null,
    title: r.title || null,
    is_forum: Boolean(r.is_forum),
    linked_chat_id: r.linked_chat_id || null,
    join_to_send: r.join_to_send_messages ?? null,
    join_by_request: r.join_by_request ?? null,
  };
}

async function resolve(token, chatId, label) {
  const info = await api(token, 'getChat', { chat_id: chatId });
  if (!info.ok) {
    return { label, input: String(chatId), ok: false, error: `${info.error_code} ${info.description}` };
  }
  const me = await api(token, 'getMe');
  let member = null;
  if (me.ok) {
    const mem = await api(token, 'getChatMember', {
      chat_id: chatId,
      user_id: me.result.id,
    });
    member = mem.ok ? mem.result.status : `fail:${mem.description}`;
  }
  return {
    label,
    input: String(chatId).startsWith('@') ? String(chatId) : '(secret-or-numeric)',
    ok: true,
    member,
    ...summarizeChat(info.result),
  };
}

async function probeBot(name, token, targets) {
  console.log(`\n### ${name}`);
  if (!token) {
    console.log(JSON.stringify({ ok: false, error: 'secret missing' }));
    return null;
  }
  const me = await api(token, 'getMe');
  if (!me.ok) {
    console.log(JSON.stringify({ ok: false, error: me.description }));
    return null;
  }
  console.log(JSON.stringify({ ok: true, bot: me.result.username, botId: me.result.id }));
  const rows = [];
  for (const [label, chatId] of targets) {
    if (!chatId) {
      rows.push({ label, ok: false, error: 'unset' });
      continue;
    }
    rows.push(await resolve(token, chatId, label));
  }
  for (const row of rows) console.log(JSON.stringify(row));
  return { bot: me.result.username, rows };
}

async function main() {
  console.log('## env present');
  console.log(JSON.stringify({
    TELEGRAM_BOT_TOKEN: Boolean(process.env.TELEGRAM_BOT_TOKEN),
    TELEGRAM_NEWS_BOT_TOKEN: Boolean(process.env.TELEGRAM_NEWS_BOT_TOKEN),
    TELEGRAM_AI_BOT_TOKEN: Boolean(process.env.TELEGRAM_AI_BOT_TOKEN),
    TELEGRAM_CHANNEL_ID: Boolean(process.env.TELEGRAM_CHANNEL_ID),
    TELEGRAM_NEWS_CHANNEL_ID: Boolean(process.env.TELEGRAM_NEWS_CHANNEL_ID),
    TELEGRAM_AI_CHANNEL_ID: Boolean(process.env.TELEGRAM_AI_CHANNEL_ID),
    TELEGRAM_HW3_GROUP_ID: Boolean(process.env.TELEGRAM_HW3_GROUP_ID),
  }));

  const jobs = await probeBot('TELEGRAM_BOT_TOKEN', process.env.TELEGRAM_BOT_TOKEN, [
    ['TELEGRAM_CHANNEL_ID', process.env.TELEGRAM_CHANNEL_ID],
    ['TELEGRAM_NEWS_CHANNEL_ID', process.env.TELEGRAM_NEWS_CHANNEL_ID],
    ['TELEGRAM_HW3_GROUP_ID', process.env.TELEGRAM_HW3_GROUP_ID],
    ['literal:@web3newsfeed', '@web3newsfeed'],
    ['literal:@web3hiring', '@web3hiring'],
    ['literal:@hashtag_ai', '@hashtag_ai'],
  ]);

  await probeBot('TELEGRAM_NEWS_BOT_TOKEN', process.env.TELEGRAM_NEWS_BOT_TOKEN, [
    ['TELEGRAM_NEWS_CHANNEL_ID', process.env.TELEGRAM_NEWS_CHANNEL_ID],
    ['literal:@web3newsfeed', '@web3newsfeed'],
    ['literal:@hashtag_ai', '@hashtag_ai'],
  ]);

  const ai = await probeBot('TELEGRAM_AI_BOT_TOKEN', process.env.TELEGRAM_AI_BOT_TOKEN, [
    ['TELEGRAM_AI_CHANNEL_ID', process.env.TELEGRAM_AI_CHANNEL_ID],
    ['literal:@hashtag_ai', '@hashtag_ai'],
    ['literal:@web3newsfeed', '@web3newsfeed'],
  ]);

  console.log('\n## comparisons');
  if (ai) {
    const secret = ai.rows.find((r) => r.label === 'TELEGRAM_AI_CHANNEL_ID');
    const hashtag = ai.rows.find((r) => r.label === 'literal:@hashtag_ai');
    console.log(JSON.stringify({
      ai_secret_is_hashtag_ai_channel: Boolean(
        secret?.ok && hashtag?.ok && secret.id === hashtag.id
      ),
      ai_secret_type: secret?.type || null,
      ai_secret_id: secret?.id || null,
      hashtag_ai_type: hashtag?.type || null,
      hashtag_ai_id: hashtag?.id || null,
      ai_secret_username: secret?.username || null,
      hashtag_ai_username: hashtag?.username || null,
      ai_secret_title: secret?.title || null,
      hashtag_ai_title: hashtag?.title || null,
    }));
  }
  if (jobs) {
    const newsSecret = jobs.rows.find((r) => r.label === 'TELEGRAM_NEWS_CHANNEL_ID');
    const web3 = jobs.rows.find((r) => r.label === 'literal:@web3newsfeed');
    const hashtag = jobs.rows.find((r) => r.label === 'literal:@hashtag_ai');
    console.log(JSON.stringify({
      news_secret_is_web3newsfeed: Boolean(
        newsSecret?.ok && web3?.ok && newsSecret.id === web3.id
      ),
      news_secret_is_hashtag_ai: Boolean(
        newsSecret?.ok && hashtag?.ok && newsSecret.id === hashtag.id
      ),
      news_secret_type: newsSecret?.type || null,
      news_secret_id: newsSecret?.id || null,
      web3newsfeed_id: web3?.id || null,
      hashtag_ai_id: hashtag?.id || null,
      news_secret_username: newsSecret?.username || null,
      web3newsfeed_username: web3?.username || null,
      hashtag_ai_username: hashtag?.username || null,
    }));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
