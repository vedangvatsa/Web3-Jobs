#!/usr/bin/env node
/**
 * Diagnose Telegram bot/channel access for news + AI news.
 * Prints usernames and chat access only — never tokens.
 */
const bots = [
  {
    name: 'TELEGRAM_BOT_TOKEN',
    token: process.env.TELEGRAM_BOT_TOKEN,
    chats: [
      process.env.TELEGRAM_CHANNEL_ID,
      process.env.TELEGRAM_NEWS_CHANNEL_ID,
      process.env.TELEGRAM_HW3_GROUP_ID,
      '@web3newsfeed',
      '@web3hiring',
      '@hashtag_ai',
    ],
  },
  {
    name: 'TELEGRAM_NEWS_BOT_TOKEN',
    token: process.env.TELEGRAM_NEWS_BOT_TOKEN,
    chats: [
      process.env.TELEGRAM_NEWS_CHANNEL_ID,
      '@web3newsfeed',
      '@hashtag_ai',
    ],
  },
  {
    name: 'TELEGRAM_AI_BOT_TOKEN',
    token: process.env.TELEGRAM_AI_BOT_TOKEN,
    chats: [
      process.env.TELEGRAM_AI_CHANNEL_ID,
      '@hashtag_ai',
      '@web3newsfeed',
    ],
  },
];

async function api(token, method, params = {}) {
  const url = new URL(`https://api.telegram.org/bot${token}/${method}`);
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && v !== '') url.searchParams.set(k, String(v));
  });
  const res = await fetch(url);
  return res.json();
}

function uniq(arr) {
  return [...new Set(arr.filter(Boolean))];
}

async function main() {
  console.log('Secrets present:', {
    TELEGRAM_BOT_TOKEN: Boolean(process.env.TELEGRAM_BOT_TOKEN),
    TELEGRAM_NEWS_BOT_TOKEN: Boolean(process.env.TELEGRAM_NEWS_BOT_TOKEN),
    TELEGRAM_AI_BOT_TOKEN: Boolean(process.env.TELEGRAM_AI_BOT_TOKEN),
    TELEGRAM_CHANNEL_ID: process.env.TELEGRAM_CHANNEL_ID || '(unset)',
    TELEGRAM_NEWS_CHANNEL_ID: process.env.TELEGRAM_NEWS_CHANNEL_ID || '(unset)',
    TELEGRAM_AI_CHANNEL_ID: process.env.TELEGRAM_AI_CHANNEL_ID || '(unset)',
    TELEGRAM_HW3_GROUP_ID: process.env.TELEGRAM_HW3_GROUP_ID || '(unset)',
  });

  for (const bot of bots) {
    console.log(`\n=== ${bot.name} ===`);
    if (!bot.token) {
      console.log('  (secret missing)');
      continue;
    }
    const me = await api(bot.token, 'getMe');
    if (!me.ok) {
      console.log('  getMe FAILED:', me.description);
      continue;
    }
    console.log(`  bot=@${me.result.username} id=${me.result.id}`);

    for (const chat of uniq(bot.chats)) {
      const info = await api(bot.token, 'getChat', { chat_id: chat });
      if (!info.ok) {
        console.log(`  chat ${chat}: NO ACCESS (${info.error_code}) ${info.description}`);
        continue;
      }
      const r = info.result;
      const label = r.username ? `@${r.username}` : r.title;
      console.log(`  chat ${chat} → ${label} type=${r.type} id=${r.id}`);

      const mem = await api(bot.token, 'getChatMember', {
        chat_id: chat,
        user_id: me.result.id,
      });
      if (!mem.ok) {
        console.log(`    member: FAIL ${mem.description}`);
      } else {
        console.log(`    member status=${mem.result.status}`);
      }
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
