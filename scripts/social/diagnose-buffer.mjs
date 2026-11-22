#!/usr/bin/env node
/** Read-only Buffer GraphQL probe. Prints status/headers/channel only; never logs the token. */
const TOKEN = process.env.BUFFER_ACCESS_TOKEN || '';
const X_CHANNEL = process.env.BUFFER_X_CHANNEL_ID || '6ab62682ea19ca0bdee284bd';
const LI_CHANNEL = process.env.BUFFER_LINKEDIN_CHANNEL_ID || '69c5b139af47dacb695b5feb';

if (!TOKEN) {
  console.error('BUFFER_ACCESS_TOKEN missing');
  process.exit(2);
}

async function probe(label, query, variables) {
  const started = Date.now();
  const response = await fetch('https://api.buffer.com/graphql', {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(30000),
  });
  const headerNames = [
    'retry-after',
    'x-ratelimit-limit',
    'x-ratelimit-remaining',
    'x-ratelimit-reset',
    'ratelimit-limit',
    'ratelimit-remaining',
    'ratelimit-reset',
  ];
  const headers = {};
  for (const name of headerNames) {
    const value = response.headers.get(name);
    if (value) headers[name] = value;
  }
  const text = await response.text();
  let body;
  try { body = JSON.parse(text); }
  catch { body = { raw: text.slice(0, 300) }; }
  const errors = Array.isArray(body.errors) ? body.errors.map((error) => error.message) : undefined;
  console.log(JSON.stringify({
    label,
    ms: Date.now() - started,
    http: response.status,
    headers,
    errors,
    channel: body.data?.channel ? {
      id: body.data.channel.id,
      name: body.data.channel.name,
      service: body.data.channel.service,
    } : null,
  }));
  return response.status;
}

const channelQuery = 'query($id: ChannelId!) { channel(input: { id: $id }) { id name service } }';

const xStatus = await probe('x-channel', channelQuery, { id: X_CHANNEL });
const liStatus = await probe('linkedin-channel', channelQuery, { id: LI_CHANNEL });
process.exit(xStatus === 200 && liStatus === 200 ? 0 : 1);
